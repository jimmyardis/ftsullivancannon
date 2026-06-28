import { useEffect, useRef } from 'react';
import { CANVAS_W, CANVAS_H, WATER_Y } from '../game/constants';

interface Props {
  onPlay: () => void;
  onHistory: () => void;
  onLeaderboard: () => void;
  onSettings: () => void;
}

export default function TitleScreen({ onPlay, onHistory, onLeaderboard, onSettings }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const timeRef = useRef(0);
  const lastRef = useRef(performance.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = () => {
      const now = performance.now();
      timeRef.current += (now - lastRef.current) / 1000;
      lastRef.current = now;
      const ctx = canvas.getContext('2d')!;
      const t = timeRef.current;
      const scale = canvas.width / CANVAS_W;
      ctx.save();
      ctx.scale(scale, scale);
      drawTitle(ctx, t);
      ctx.restore();
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="relative w-full h-full select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 pointer-events-none">
        <div className="flex flex-col items-center gap-3 pointer-events-auto">
          <button
            onClick={onPlay}
            className="w-64 py-4 text-xl font-bold tracking-widest border-2 transition-all duration-200
              bg-amber-900/80 border-amber-500/70 text-amber-200 hover:bg-amber-700/90 hover:border-amber-300
              hover:text-white hover:scale-105 active:scale-95"
            style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.15em' }}
          >
            ⚔ PLAY
          </button>
          <button
            onClick={onHistory}
            className="w-64 py-3 text-base tracking-wider border transition-all duration-200
              bg-stone-900/70 border-amber-700/50 text-amber-300/80 hover:bg-stone-800/80 hover:border-amber-500/70 hover:text-amber-200"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Historical Background
          </button>
          <button
            onClick={onLeaderboard}
            className="w-64 py-3 text-base tracking-wider border transition-all duration-200
              bg-stone-900/70 border-amber-700/50 text-amber-300/80 hover:bg-stone-800/80 hover:border-amber-500/70 hover:text-amber-200"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Leaderboard
          </button>
          <button
            onClick={onSettings}
            className="w-64 py-3 text-base tracking-wider border transition-all duration-200
              bg-stone-900/70 border-amber-700/50 text-amber-300/80 hover:bg-stone-800/80 hover:border-amber-500/70 hover:text-amber-200"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Settings
          </button>
        </div>
        <p className="mt-6 text-amber-600/60 text-xs tracking-widest pointer-events-none" style={{ fontFamily: 'Georgia, serif' }}>
          AMERICA 250 EDITION · JUNE 28, 1776
        </p>
      </div>
    </div>
  );
}

function drawTitle(ctx: CanvasRenderingContext2D, t: number) {
  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, WATER_Y);
  sky.addColorStop(0, '#0d1a3a');
  sky.addColorStop(0.55, '#2a3d6e');
  sky.addColorStop(0.82, '#c2572a');
  sky.addColorStop(1, '#f4962c');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, CANVAS_W, WATER_Y);

  // Sun glow
  const sx = CANVAS_W * 0.68, sy = WATER_Y - 50;
  const sunG = ctx.createRadialGradient(sx, sy, 0, sx, sy, 200);
  sunG.addColorStop(0, 'rgba(255,210,80,0.6)');
  sunG.addColorStop(0.4, 'rgba(240,120,40,0.3)');
  sunG.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sunG;
  ctx.fillRect(0, 0, CANVAS_W, WATER_Y);

  // Sun disc
  ctx.beginPath();
  ctx.arc(sx, sy, 30, 0, Math.PI * 2);
  const disc = ctx.createRadialGradient(sx, sy, 0, sx, sy, 30);
  disc.addColorStop(0, '#fff8d0');
  disc.addColorStop(0.5, '#ffcc44');
  disc.addColorStop(1, '#f48020');
  ctx.fillStyle = disc;
  ctx.fill();

  // Ocean
  const ocean = ctx.createLinearGradient(0, WATER_Y, 0, CANVAS_H);
  ocean.addColorStop(0, '#1a5068');
  ocean.addColorStop(0.5, '#0d3545');
  ocean.addColorStop(1, '#081820');
  ctx.fillStyle = ocean;
  ctx.fillRect(0, WATER_Y, CANVAS_W, CANVAS_H - WATER_Y);

  // Animated ocean waves
  for (let row = 0; row < 5; row++) {
    const y = WATER_Y + 20 + row * 32;
    const alpha = 0.06 + row * 0.018;
    ctx.strokeStyle = `rgba(100,200,220,${alpha})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let wx = 0; wx <= CANVAS_W; wx += 4) {
      const wy = y + Math.sin(wx * 0.016 + t * 1.2 + row * 1.1) * 5;
      if (wx === 0) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
    }
    ctx.stroke();
  }

  // Sun reflection
  const rg = ctx.createLinearGradient(sx - 80, WATER_Y, sx + 80, WATER_Y);
  rg.addColorStop(0, 'rgba(0,0,0,0)');
  rg.addColorStop(0.5, 'rgba(255,170,50,0.2)');
  rg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rg;
  ctx.fillRect(sx - 120, WATER_Y, 240, 200);

  // Fort silhouette
  ctx.fillStyle = '#0d0804';
  ctx.beginPath();
  ctx.moveTo(0, CANVAS_H);
  ctx.lineTo(0, WATER_Y - 20);
  ctx.bezierCurveTo(40, WATER_Y - 40, 100, WATER_Y - 80, 160, WATER_Y - 90);
  ctx.lineTo(190, WATER_Y - 50);
  ctx.lineTo(220, WATER_Y);
  ctx.closePath();
  ctx.fill();

  // Fort top detail
  for (let mx = 20; mx < 180; mx += 25) {
    ctx.fillStyle = '#181008';
    ctx.fillRect(mx, WATER_Y - 90 + Math.sin(mx * 0.2) * 8, 15, 16);
  }

  // Flag pole
  ctx.strokeStyle = '#8a6820';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(110, WATER_Y - 90);
  ctx.lineTo(110, WATER_Y - 150);
  ctx.stroke();

  // Animated flag
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(110, WATER_Y - 150);
  for (let fx = 0; fx <= 40; fx++) {
    const fy = Math.sin(fx * 0.2 + t * 2.5) * 3;
    ctx.lineTo(110 + fx, WATER_Y - 150 + fy + (fx / 40) * 12);
  }
  ctx.lineTo(110, WATER_Y - 138);
  ctx.closePath();
  ctx.fillStyle = '#cc1122';
  ctx.fill();
  ctx.restore();

  // Distant ships on horizon
  for (let si = 0; si < 4; si++) {
    const shipX = 620 + si * 150 + Math.sin(t * 0.3 + si) * 8;
    const shipY = WATER_Y - 8;
    ctx.fillStyle = 'rgba(15,8,3,0.85)';
    // Hull
    ctx.beginPath();
    ctx.ellipse(shipX, shipY, 30, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    // Mast
    ctx.strokeStyle = 'rgba(15,8,3,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(shipX, shipY - 10);
    ctx.lineTo(shipX, shipY - 44);
    ctx.stroke();
    // Sail
    ctx.fillStyle = 'rgba(200,180,120,0.6)';
    ctx.beginPath();
    ctx.moveTo(shipX - 16, shipY - 16);
    ctx.bezierCurveTo(shipX - 8, shipY - 24, shipX + 8, shipY - 24, shipX + 16, shipY - 16);
    ctx.lineTo(shipX + 14, shipY - 38);
    ctx.bezierCurveTo(shipX + 5, shipY - 32, shipX - 5, shipY - 32, shipX - 14, shipY - 38);
    ctx.closePath();
    ctx.fill();
  }

  // Title text
  ctx.textAlign = 'center';
  const titleY = 160 + Math.sin(t * 0.6) * 4;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.font = 'bold 72px Georgia, serif';
  ctx.fillText('FORT SULLIVAN', CANVAS_W * 0.5 + 3, titleY + 3);
  const titleGrad = ctx.createLinearGradient(0, titleY - 60, 0, titleY);
  titleGrad.addColorStop(0, '#f8e8b0');
  titleGrad.addColorStop(0.5, '#f4c84a');
  titleGrad.addColorStop(1, '#d89020');
  ctx.fillStyle = titleGrad;
  ctx.fillText('FORT SULLIVAN', CANVAS_W * 0.5, titleY);

  ctx.fillStyle = '#c8a040';
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText('HARBOR DEFENDER', CANVAS_W * 0.5, titleY + 46);

  ctx.fillStyle = '#a07830';
  ctx.font = '18px Georgia, serif';
  ctx.fillText('America 250 Edition', CANVAS_W * 0.5, titleY + 80);

  // Decorative divider
  ctx.strokeStyle = 'rgba(200,160,60,0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(CANVAS_W * 0.35, titleY + 98);
  ctx.lineTo(CANVAS_W * 0.65, titleY + 98);
  ctx.stroke();

  ctx.textAlign = 'left';
}
