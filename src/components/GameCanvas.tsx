import { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/engine';
import type { GameResult } from '../types/game';

interface Props {
  onGameOver: (result: GameResult) => void;
}

export default function GameCanvas({ onGameOver }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas);
    engineRef.current = engine;
    engine.onGameOver = onGameOver;
    engine.start();

    // Track orientation so we can prompt the player to rotate on phones.
    // The game is designed in a wide 16:9 space, so portrait is unplayable.
    const portraitQuery = window.matchMedia('(orientation: portrait)');
    const syncOrientation = () => setIsPortrait(portraitQuery.matches);
    syncOrientation();
    portraitQuery.addEventListener('change', syncOrientation);

    const onResize = () => { engine.resize(); syncOrientation(); };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    // --- Mouse / keyboard (desktop) ---
    const onMouseMove = (e: MouseEvent) => engine.handleMouseMove(e.clientX, e.clientY);
    const onWheel = (e: WheelEvent) => { e.preventDefault(); engine.handleWheel(e.deltaY); };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') e.preventDefault();
      engine.handleKeyDown(e.key);
    };
    const onClick = () => engine.handleFire();

    window.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    canvas.addEventListener('click', onClick);

    // --- Touch (mobile): drag to aim, lift finger to fire ---
    const aimFromTouch = (e: TouchEvent) => {
      const t = e.touches[0] ?? e.changedTouches[0];
      if (t) engine.handleMouseMove(t.clientX, t.clientY);
    };
    const onTouchStart = (e: TouchEvent) => { e.preventDefault(); aimFromTouch(e); };
    const onTouchMove = (e: TouchEvent) => { e.preventDefault(); aimFromTouch(e); };
    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault(); // also suppresses the synthesized click (avoids a double fire)
      aimFromTouch(e);
      engine.handleFire();
    };
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });

    return () => {
      engine.stop();
      portraitQuery.removeEventListener('change', syncOrientation);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      engineRef.current = null;
    };
  }, [onGameOver]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair"
        style={{ imageRendering: 'crisp-edges', touchAction: 'none' }}
      />
      {isPortrait && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-8 z-50"
          style={{ background: 'radial-gradient(ellipse at center, #1a1208 0%, #060402 100%)', fontFamily: 'Georgia, serif' }}
        >
          <div className="text-5xl">📱↻</div>
          <h2 className="text-2xl font-bold text-amber-300">Rotate your device</h2>
          <p className="text-amber-500/70 max-w-xs">
            Fort Sullivan is best defended in landscape. Turn your phone sideways to manage the cannons.
          </p>
        </div>
      )}
    </>
  );
}
