import { useEffect, useRef } from 'react';
import { GameEngine } from '../game/engine';
import type { GameResult } from '../types/game';

interface Props {
  onGameOver: (result: GameResult) => void;
}

export default function GameCanvas({ onGameOver }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas);
    engineRef.current = engine;
    engine.onGameOver = onGameOver;
    engine.start();

    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);

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

    return () => {
      engine.stop();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      canvas.removeEventListener('click', onClick);
      engineRef.current = null;
    };
  }, [onGameOver]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block cursor-crosshair"
      style={{ imageRendering: 'crisp-edges' }}
    />
  );
}
