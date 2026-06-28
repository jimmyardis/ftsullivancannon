import type { GameState, Ship, Particle, Cannonball } from '../types/game';
import {
  CANVAS_W, CANVAS_H, WATER_Y, CANNON_X, CANNON_Y, FORT_RIGHT,
  AMMO, SHIPS,
} from './constants';

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  skyTop:    '#0d1a3a',
  skyMid:    '#2a3d6e',
  skyHoriz:  '#c2572a',
  sunGlow:   '#f4962c',
  waterDeep: '#0d3545',
  waterMid:  '#1a5068',
  waterShine:'#2a7090',
  sandBase:  '#b8883a',
  sandLight: '#d4a84a',
  logDark:   '#4a2e14',
  logMid:    '#6b3f1c',
  logLight:  '#8a5228',
  fortWall:  '#7a5a2a',
  hullDark:  '#1a0d04',
  hullMid:   '#2a1808',
  sailCream: '#e8d9aa',
  sailShadow:'#c4b580',
  flagRed:   '#cc1122',
  flagBlue:  '#0033aa',
};

// ── Background / Sky ─────────────────────────────────────────────────────────
function drawBackground(ctx: CanvasRenderingContext2D, oceanOffset: number) {
  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, WATER_Y);
  sky.addColorStop(0,   C.skyTop);
  sky.addColorStop(0.5, C.skyMid);
  sky.addColorStop(0.82, C.skyHoriz);
  sky.addColorStop(1,   C.sunGlow);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, CANVAS_W, WATER_Y);

  // Sun glow
  const sunX = CANVAS_W * 0.72, sunY = WATER_Y - 38;
  const sunG = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 160);
  sunG.addColorStop(0,   'rgba(255,210,100,0.55)');
  sunG.addColorStop(0.35,'rgba(240,130,50,0.25)');
  sunG.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = sunG;
  ctx.fillRect(0, 0, CANVAS_W, WATER_Y);

  // Sun disc
  ctx.beginPath();
  ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
  const disc = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 26);
  disc.addColorStop(0, '#fff8d0');
  disc.addColorStop(0.5,'#ffcc44');
  disc.addColorStop(1, '#f48020');
  ctx.fillStyle = disc;
  ctx.fill();

  // Distant silhouette shore / island
  ctx.fillStyle = '#1a0d05';
  ctx.beginPath();
  ctx.moveTo(380, WATER_Y);
  ctx.bezierCurveTo(420, WATER_Y - 22, 500, WATER_Y - 18, 560, WATER_Y);
  ctx.lineTo(380, WATER_Y);
  ctx.fill();

  // Ocean
  const ocean = ctx.createLinearGradient(0, WATER_Y, 0, CANVAS_H);
  ocean.addColorStop(0,   C.waterMid);
  ocean.addColorStop(0.4, C.waterDeep);
  ocean.addColorStop(1,   '#081820');
  ctx.fillStyle = ocean;
  ctx.fillRect(0, WATER_Y, CANVAS_W, CANVAS_H - WATER_Y);

  // Ocean wave highlights
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, WATER_Y, CANVAS_W, CANVAS_H - WATER_Y);
  ctx.clip();
  for (let row = 0; row < 6; row++) {
    const y = WATER_Y + 18 + row * 30 + Math.sin(oceanOffset * 0.04 + row) * 4;
    const alpha = 0.06 + row * 0.015;
    ctx.strokeStyle = `rgba(100,200,220,${alpha})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let wx = -20; wx < CANVAS_W + 20; wx += 60) {
      const phase = wx * 0.018 + oceanOffset * 0.05 + row * 0.8;
      const wy = y + Math.sin(phase) * 5;
      if (wx === -20) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
    }
    ctx.stroke();
  }

  // Sun reflection streak
  const reflX = sunX;
  const reflG = ctx.createLinearGradient(reflX - 60, WATER_Y, reflX + 60, WATER_Y);
  reflG.addColorStop(0, 'rgba(0,0,0,0)');
  reflG.addColorStop(0.5, 'rgba(255,180,60,0.18)');
  reflG.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = reflG;
  ctx.fillRect(reflX - 100, WATER_Y, 200, 180);
  ctx.restore();
}

// ── Fort ─────────────────────────────────────────────────────────────────────
function drawFort(ctx: CanvasRenderingContext2D, fortHealth: number, maxHealth: number, time: number) {
  const healthRatio = fortHealth / maxHealth;

  // Earth berm
  ctx.fillStyle = C.sandBase;
  ctx.beginPath();
  ctx.moveTo(0, CANVAS_H);
  ctx.lineTo(0, WATER_Y + 10);
  ctx.bezierCurveTo(40, WATER_Y - 5, 160, WATER_Y - 35, FORT_RIGHT + 20, WATER_Y);
  ctx.lineTo(FORT_RIGHT + 20, CANVAS_H);
  ctx.closePath();
  ctx.fill();

  // Sand highlight
  ctx.fillStyle = C.sandLight;
  ctx.beginPath();
  ctx.moveTo(0, WATER_Y + 10);
  ctx.bezierCurveTo(40, WATER_Y - 5, 160, WATER_Y - 35, FORT_RIGHT + 20, WATER_Y);
  ctx.lineTo(FORT_RIGHT + 10, WATER_Y + 12);
  ctx.bezierCurveTo(120, WATER_Y - 22, 40, WATER_Y + 2, 0, WATER_Y + 22);
  ctx.closePath();
  ctx.fill();

  // Fort main wall (palmetto log structure)
  const wallTop = 310;
  const wallBottom = WATER_Y - 10;
  const wallLeft = 0;
  const wallRight = 195;

  ctx.fillStyle = C.logMid;
  ctx.beginPath();
  ctx.moveTo(wallLeft, wallBottom);
  ctx.lineTo(wallLeft, wallTop + 20);
  ctx.bezierCurveTo(0, wallTop, 20, wallTop - 5, 50, wallTop - 8);
  ctx.lineTo(wallRight, wallTop - 8);
  ctx.lineTo(wallRight, wallBottom);
  ctx.closePath();
  ctx.fill();

  // Log texture — horizontal rows
  const logH = 18;
  for (let ly = wallTop + 10; ly < wallBottom; ly += logH + 2) {
    ctx.fillStyle = C.logDark;
    ctx.fillRect(wallLeft, ly, wallRight, 2);
    // Log end circles (right side)
    ctx.beginPath();
    ctx.arc(wallRight - 4, ly + logH * 0.5, 6, 0, Math.PI * 2);
    ctx.fillStyle = C.logLight;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(wallRight - 4, ly + logH * 0.5, 4, 0, Math.PI * 2);
    ctx.fillStyle = C.logDark;
    ctx.fill();
  }

  // Wall top parapet / merlons
  for (let mx = 20; mx < wallRight - 10; mx += 28) {
    ctx.fillStyle = C.logMid;
    ctx.fillRect(mx, wallTop - 20, 18, 20);
    ctx.fillStyle = C.logDark;
    ctx.fillRect(mx, wallTop - 22, 18, 3);
  }

  // Cannon embrasure
  ctx.fillStyle = '#111108';
  ctx.beginPath();
  ctx.arc(FORT_RIGHT - 18, CANNON_Y + 4, 14, 0, Math.PI * 2);
  ctx.fill();

  // Cannon wheels (behind cannon barrel)
  ctx.fillStyle = C.logDark;
  ctx.beginPath();
  ctx.arc(CANNON_X - 22, CANNON_Y + 10, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = C.logMid;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(CANNON_X - 38, CANNON_Y + 10, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Observation tower
  const towerX = 20, towerTop = wallTop - 70, towerW = 55;
  ctx.fillStyle = C.logMid;
  ctx.fillRect(towerX, towerTop, towerW, wallTop - towerTop + 5);
  // Tower windows
  ctx.fillStyle = '#0d0a05';
  ctx.fillRect(towerX + 10, towerTop + 10, 12, 18);
  ctx.fillRect(towerX + towerW - 22, towerTop + 10, 12, 18);
  // Tower roof
  ctx.fillStyle = C.logDark;
  ctx.beginPath();
  ctx.moveTo(towerX - 5, towerTop);
  ctx.lineTo(towerX + towerW * 0.5, towerTop - 22);
  ctx.lineTo(towerX + towerW + 5, towerTop);
  ctx.closePath();
  ctx.fill();

  // Flag pole
  const flagX = towerX + towerW * 0.5;
  const flagPoleTop = towerTop - 22 - 50;
  ctx.strokeStyle = '#c8a860';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(flagX, towerTop - 22);
  ctx.lineTo(flagX, flagPoleTop);
  ctx.stroke();

  // American flag (simplified stripes + blue canton)
  const fw = 36, fh = 22;
  const flagY = flagPoleTop;
  const wave = Math.sin(time * 1.8) * 3;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(flagX, flagY);
  ctx.lineTo(flagX + fw + wave, flagY + 2);
  ctx.lineTo(flagX + fw, flagY + fh);
  ctx.lineTo(flagX, flagY + fh);
  ctx.closePath();
  ctx.clip();
  // Stripes
  const stripeH = fh / 13;
  for (let si = 0; si < 13; si++) {
    ctx.fillStyle = si % 2 === 0 ? C.flagRed : '#f0f0f0';
    ctx.fillRect(flagX, flagY + si * stripeH, fw, stripeH + 0.5);
  }
  // Blue canton
  ctx.fillStyle = C.flagBlue;
  ctx.fillRect(flagX, flagY, fw * 0.42, fh * 0.54);
  ctx.restore();

  // Damage cracks overlay
  if (healthRatio < 0.7) {
    const crackAlpha = (0.7 - healthRatio) / 0.7;
    ctx.strokeStyle = `rgba(20,10,0,${crackAlpha * 0.8})`;
    ctx.lineWidth = 1.5;
    for (let ci = 0; ci < 4; ci++) {
      const cx = 40 + ci * 40;
      const cy = wallTop + 30 + ci * 20;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + 8, cy + 14);
      ctx.lineTo(cx + 5, cy + 22);
      ctx.stroke();
    }
  }

  // Smoke from damaged fort
  if (healthRatio < 0.5) {
    ctx.fillStyle = `rgba(80,80,80,${(0.5 - healthRatio) * 0.3})`;
    ctx.beginPath();
    ctx.arc(80, wallTop - 15, 20, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Cannon ───────────────────────────────────────────────────────────────────
function drawCannon(ctx: CanvasRenderingContext2D, angle: number, recoil: number) {
  ctx.save();
  ctx.translate(CANNON_X - recoil * 8, CANNON_Y);
  ctx.rotate(angle);

  // Barrel
  const grad = ctx.createLinearGradient(0, -7, 0, 7);
  grad.addColorStop(0, '#888878');
  grad.addColorStop(0.5, '#c8c8b0');
  grad.addColorStop(1, '#444438');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(0, -7, 52, 14, 3);
  ctx.fill();

  // Muzzle band
  ctx.fillStyle = '#888878';
  ctx.fillRect(44, -8, 10, 16);
  ctx.fillStyle = '#c8c8a8';
  ctx.fillRect(46, -8, 6, 16);

  // Touch hole
  ctx.fillStyle = '#222218';
  ctx.beginPath();
  ctx.arc(12, -6, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ── Ships ─────────────────────────────────────────────────────────────────────
function drawShip(ctx: CanvasRenderingContext2D, ship: Ship) {
  const { x, y, width: w, height: h, type, health, maxHealth, sailDamage, sinking, sinkTimer, isOnFire } = ship;

  ctx.save();
  if (sinking) {
    ctx.globalAlpha = Math.max(0, 1 - sinkTimer / 2.5);
    ctx.translate(0, Math.pow(sinkTimer, 1.5) * 15);
  }
  ctx.translate(x, y);

  const healthRatio = health / maxHealth;

  // Hull shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.2 + 6, w * 0.45, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hull body
  const hullGrad = ctx.createLinearGradient(0, -h * 0.4, 0, h * 0.2);
  hullGrad.addColorStop(0, '#3a1f0a');
  hullGrad.addColorStop(0.5, C.hullMid);
  hullGrad.addColorStop(1, C.hullDark);
  ctx.fillStyle = hullGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 0.5, -h * 0.05);
  ctx.bezierCurveTo(-w * 0.5, -h * 0.4, -w * 0.35, -h * 0.5, 0, -h * 0.5);
  ctx.bezierCurveTo(w * 0.35, -h * 0.5, w * 0.48, -h * 0.4, w * 0.48, -h * 0.1);
  ctx.bezierCurveTo(w * 0.48, h * 0.1, w * 0.3, h * 0.22, 0, h * 0.22);
  ctx.bezierCurveTo(-w * 0.3, h * 0.22, -w * 0.5, h * 0.1, -w * 0.5, -h * 0.05);
  ctx.fill();

  // Waterline stripe
  ctx.strokeStyle = '#e8c870';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-w * 0.46, 0);
  ctx.bezierCurveTo(-w * 0.4, h * 0.06, w * 0.4, h * 0.06, w * 0.44, 0);
  ctx.stroke();

  // Gun ports (for frigates and SotL)
  if (type === 'frigate' || type === 'shipoftheline') {
    const ports = type === 'shipoftheline' ? 6 : 4;
    for (let pi = 0; pi < ports; pi++) {
      const px = -w * 0.35 + pi * (w * 0.7 / (ports - 1));
      ctx.fillStyle = '#0d0802';
      ctx.fillRect(px - 5, -h * 0.2, 10, 7);
    }
  }

  // Masts and sails
  const masts = type === 'sloop' ? 1 : type === 'shipoftheline' ? 3 : 2;
  const mastPositions = masts === 1 ? [0] : masts === 2 ? [-w * 0.18, w * 0.12] : [-w * 0.25, 0, w * 0.22];
  const mastHeight = type === 'shipoftheline' ? h * 2.2 : type === 'frigate' ? h * 2.0 : h * 1.8;

  for (const mx of mastPositions) {
    // Mast pole
    ctx.strokeStyle = '#2a1808';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(mx, -h * 0.45);
    ctx.lineTo(mx, -h * 0.45 - mastHeight);
    ctx.stroke();
    ctx.lineWidth = 1.5;

    // Yards
    const sailSections = type === 'shipoftheline' ? 3 : 2;
    for (let si = 0; si < sailSections; si++) {
      const sy = -h * 0.45 - mastHeight * (0.22 + si * 0.35);
      const sw = (w * 0.32) * (1 - si * 0.2);
      const sailAlpha = 1 - sailDamage * (0.7 + si * 0.15);
      if (sailAlpha <= 0.05) continue;

      // Yard arm
      ctx.strokeStyle = '#1a0c04';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(mx - sw, sy);
      ctx.lineTo(mx + sw, sy);
      ctx.stroke();

      // Sail
      ctx.save();
      ctx.globalAlpha = sailAlpha;
      const sailG = ctx.createLinearGradient(mx - sw, sy, mx + sw, sy + sw * 0.7);
      sailG.addColorStop(0, C.sailShadow);
      sailG.addColorStop(0.5, C.sailCream);
      sailG.addColorStop(1, C.sailShadow);
      ctx.fillStyle = sailG;
      ctx.beginPath();
      ctx.moveTo(mx - sw, sy);
      ctx.bezierCurveTo(mx - sw * 0.3, sy + sw * 0.4, mx + sw * 0.3, sy + sw * 0.4, mx + sw, sy);
      ctx.lineTo(mx + sw * 0.9, sy + sw * 0.7);
      ctx.bezierCurveTo(mx + sw * 0.3, sy + sw * 0.8, mx - sw * 0.3, sy + sw * 0.8, mx - sw * 0.9, sy + sw * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#c0aa70';
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.restore();
    }
  }

  // Rigging lines
  ctx.strokeStyle = 'rgba(40,25,10,0.6)';
  ctx.lineWidth = 0.8;
  if (mastPositions.length > 1) {
    for (let mi = 0; mi < mastPositions.length - 1; mi++) {
      const m1 = mastPositions[mi], m2 = mastPositions[mi + 1];
      const topY = -h * 0.45 - mastHeight * 0.9;
      ctx.beginPath();
      ctx.moveTo(m1, -h * 0.45 - mastHeight);
      ctx.lineTo(m2, topY);
      ctx.stroke();
    }
  }

  // Health bar
  const barW = w * 0.8, barH = 5;
  const barX = -barW * 0.5;
  const barY = -h * 0.55 - mastHeight - 16;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
  ctx.fillStyle = healthRatio > 0.5 ? '#4aaa44' : healthRatio > 0.25 ? '#ddaa22' : '#cc3322';
  ctx.fillRect(barX, barY, barW * healthRatio, barH);

  // Damage fire
  if (isOnFire) {
    ctx.fillStyle = `rgba(255,${60 + Math.random() * 60},0,${0.5 + Math.random() * 0.3})`;
    ctx.beginPath();
    ctx.arc((Math.random() - 0.5) * w * 0.3, -h * 0.3, 8 + Math.random() * 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bomb vessel mortar
  if (type === 'bombvessel') {
    ctx.fillStyle = '#555545';
    ctx.beginPath();
    ctx.arc(w * 0.1, -h * 0.5, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#222218';
    ctx.beginPath();
    ctx.arc(w * 0.1, -h * 0.5, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ── Cannonballs ───────────────────────────────────────────────────────────────
function drawCannonballs(ctx: CanvasRenderingContext2D, cannonballs: Cannonball[]) {
  for (const cb of cannonballs) {
    if (!cb.active) continue;
    const cfg = AMMO[cb.type];

    // Trail
    if (cb.trail.length > 1) {
      for (let ti = 1; ti < cb.trail.length; ti++) {
        const alpha = (ti / cb.trail.length) * 0.35;
        const size = cb.radius * (ti / cb.trail.length) * 0.6;
        ctx.fillStyle = `rgba(80,60,30,${alpha})`;
        ctx.beginPath();
        ctx.arc(cb.trail[ti].x, cb.trail[ti].y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Ball
    ctx.beginPath();
    ctx.arc(cb.x, cb.y, cb.radius, 0, Math.PI * 2);
    if (cb.type === 'heatedshot') {
      const grd = ctx.createRadialGradient(cb.x - 2, cb.y - 2, 0, cb.x, cb.y, cb.radius);
      grd.addColorStop(0, '#ffcc44');
      grd.addColorStop(0.5, '#ff5500');
      grd.addColorStop(1, '#880000');
      ctx.fillStyle = grd;
    } else {
      ctx.fillStyle = cfg.color;
    }
    ctx.fill();

    // Chain shot — two balls with chain
    if (cb.type === 'chainshot') {
      ctx.strokeStyle = '#666655';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cb.x - cb.radius * 1.8, cb.y);
      ctx.lineTo(cb.x + cb.radius * 1.8, cb.y);
      ctx.stroke();
      ctx.fillStyle = cfg.color;
      ctx.beginPath();
      ctx.arc(cb.x - cb.radius * 1.8, cb.y, cb.radius * 0.75, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cb.x + cb.radius * 1.8, cb.y, cb.radius * 0.75, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ── Particles ─────────────────────────────────────────────────────────────────
function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = alpha;
    if (p.type === 'smoke') {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 + (1 - alpha) * 0.8), 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'spark' || p.type === 'fire') {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size * 0.5, p.y - p.size * 0.5, p.size, p.size);
    }
  }
  ctx.globalAlpha = 1;
}

// ── Aim indicator ─────────────────────────────────────────────────────────────
function drawAimIndicator(ctx: CanvasRenderingContext2D, angle: number, smokeTimer: number) {
  if (smokeTimer > 0.8) return;
  const len = 80 + Math.min(200, 280 * (1 - smokeTimer));
  ctx.save();
  ctx.translate(CANNON_X, CANNON_Y);
  ctx.rotate(angle);
  ctx.setLineDash([6, 8]);
  ctx.strokeStyle = 'rgba(255,220,100,0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(55, 0);
  ctx.lineTo(55 + len, 0);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

// ── Cannon smoke ─────────────────────────────────────────────────────────────
function drawCannonSmoke(ctx: CanvasRenderingContext2D, angle: number, smokeTimer: number) {
  if (smokeTimer <= 0) return;
  const alpha = smokeTimer / 1.2;
  const sx = CANNON_X + Math.cos(angle) * 60;
  const sy = CANNON_Y + Math.sin(angle) * 60;
  for (let si = 0; si < 3; si++) {
    const spread = si * 12;
    ctx.fillStyle = `rgba(180,175,165,${alpha * (0.25 - si * 0.06)})`;
    ctx.beginPath();
    ctx.arc(sx + Math.cos(angle) * spread, sy + Math.sin(angle) * spread - si * 5, 18 + si * 10 + (1 - alpha) * 15, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── HUD ───────────────────────────────────────────────────────────────────────
function drawHUD(ctx: CanvasRenderingContext2D, state: GameState) {
  const { score, combo, ammo, fort, crew, wave, weather, abilities, totalShots, hits, holdFireActive, fastLoadActive } = state;

  // Parchment top bar
  const topBar = ctx.createLinearGradient(0, 0, 0, 52);
  topBar.addColorStop(0, 'rgba(20,12,4,0.92)');
  topBar.addColorStop(1, 'rgba(20,12,4,0.7)');
  ctx.fillStyle = topBar;
  ctx.fillRect(0, 0, CANVAS_W, 52);
  ctx.strokeStyle = 'rgba(200,160,60,0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 52);
  ctx.lineTo(CANVAS_W, 52);
  ctx.stroke();

  // Score
  ctx.fillStyle = '#f4d870';
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText(`${score.toLocaleString()}`, 20, 36);

  // Accuracy
  const acc = totalShots > 0 ? ((hits / totalShots) * 100).toFixed(0) : '100';
  ctx.fillStyle = '#c8a850';
  ctx.font = '14px Georgia, serif';
  ctx.fillText(`Accuracy: ${acc}%`, 20, 50);

  // Wave
  ctx.fillStyle = '#e8c860';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(`WAVE ${wave.currentWave} / 5`, CANVAS_W * 0.5, 28);
  ctx.font = '13px Georgia, serif';
  ctx.fillStyle = '#c0a050';
  ctx.fillText(wave.currentFact ? '— Historical Fact —' : weather.label, CANVAS_W * 0.5, 46);
  ctx.textAlign = 'left';

  // Combo multiplier
  if (combo.multiplier > 1) {
    ctx.fillStyle = '#ff9922';
    ctx.font = `bold 20px Georgia, serif`;
    ctx.textAlign = 'right';
    ctx.fillText(`x${combo.multiplier} COMBO`, CANVAS_W - 20, 30);
    ctx.textAlign = 'left';
  }

  // Bottom bar bg
  const bbH = 80;
  const bottomBarG = ctx.createLinearGradient(0, CANVAS_H - bbH, 0, CANVAS_H);
  bottomBarG.addColorStop(0, 'rgba(16,8,2,0.8)');
  bottomBarG.addColorStop(1, 'rgba(16,8,2,0.96)');
  ctx.fillStyle = bottomBarG;
  ctx.fillRect(0, CANVAS_H - bbH, CANVAS_W, bbH);
  ctx.strokeStyle = 'rgba(180,130,40,0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, CANVAS_H - bbH);
  ctx.lineTo(CANVAS_W, CANVAS_H - bbH);
  ctx.stroke();

  // Ammo selector
  const ammoTypes = ['roundshot', 'chainshot', 'grapeshot', 'heatedshot'] as const;
  const ammoKeys = ['1', '2', '3', '4'];
  ammoTypes.forEach((at, i) => {
    const ax = 20 + i * 148;
    const ay = CANVAS_H - bbH + 8;
    const isSelected = ammo.selected === at;
    const isLocked = at === 'heatedshot' && !ammo.heatedUnlocked;
    const cfg = AMMO[at];

    // Background
    ctx.fillStyle = isLocked ? 'rgba(30,20,10,0.5)' : isSelected ? 'rgba(180,130,30,0.3)' : 'rgba(40,25,8,0.6)';
    ctx.strokeStyle = isSelected ? 'rgba(220,170,50,0.8)' : 'rgba(100,70,20,0.4)';
    ctx.lineWidth = isSelected ? 1.5 : 1;
    roundRect(ctx, ax, ay, 140, 62, 4);

    if (!isLocked) {
      // Ammo name
      ctx.fillStyle = isSelected ? '#f4d068' : '#a08040';
      ctx.font = `${isSelected ? 'bold' : 'normal'} 13px Georgia, serif`;
      ctx.fillText(`[${ammoKeys[i]}] ${cfg.label}`, ax + 8, ay + 18);

      // Reload bar
      const progress = isSelected ? ammo.reloadProgress : 1;
      const barW = 126;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(ax + 7, ay + 26, barW, 8);
      ctx.fillStyle = progress >= 1 ? '#50cc50' : '#cc9922';
      ctx.fillRect(ax + 7, ay + 26, barW * progress, 8);

      ctx.fillStyle = '#806030';
      ctx.font = '11px Georgia, serif';
      ctx.fillText(isSelected && ammo.reloading ? 'RELOADING...' : 'READY', ax + 8, ay + 48);
    } else {
      ctx.fillStyle = '#504030';
      ctx.font = '13px Georgia, serif';
      ctx.fillText(`[4] Heated Shot`, ax + 8, ay + 18);
      ctx.fillStyle = '#403020';
      ctx.font = '12px Georgia, serif';
      ctx.fillText('Unlocks Wave 4', ax + 8, ay + 38);
    }
  });

  // Fort health (right side)
  const fhX = CANVAS_W - 200;
  const fhY = CANVAS_H - bbH + 8;
  ctx.fillStyle = '#d4a850';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.fillText('FORT SULLIVAN', fhX, fhY + 14);
  const fRatio = fort.totalHealth / fort.maxTotalHealth;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(fhX, fhY + 20, 176, 10);
  ctx.fillStyle = fRatio > 0.5 ? '#44aa44' : fRatio > 0.25 ? '#ddaa22' : '#cc3322';
  ctx.fillRect(fhX, fhY + 20, 176 * fRatio, 10);
  ctx.fillStyle = '#a08040';
  ctx.font = '12px Georgia, serif';
  ctx.fillText(`${Math.round(fRatio * 100)}%  Crew: ${crew.alive}/${crew.total}`, fhX, fhY + 46);

  // Wind indicator
  ctx.fillStyle = '#806840';
  ctx.font = '12px Georgia, serif';
  ctx.fillText(`Wind: ${weather.label}`, fhX, fhY + 62);

  // Abilities
  const abX = CANVAS_W - 470;
  ctx.fillStyle = '#c09840';
  ctx.font = 'bold 11px Georgia, serif';
  ctx.fillText('ABILITIES', abX, CANVAS_H - bbH + 14);
  abilities.forEach((ab, i) => {
    const ax = abX + i * 68;
    const ay = CANVAS_H - bbH + 18;
    const ready = ab.cooldown <= 0;
    const active = ab.activeTimer > 0;
    ctx.fillStyle = active ? 'rgba(100,200,100,0.25)' : ready ? 'rgba(180,130,30,0.25)' : 'rgba(30,20,10,0.4)';
    ctx.strokeStyle = active ? 'rgba(100,220,100,0.7)' : ready ? 'rgba(200,160,50,0.6)' : 'rgba(80,55,15,0.4)';
    ctx.lineWidth = 1;
    roundRect(ctx, ax, ay, 60, 44, 3);
    ctx.fillStyle = ready ? '#e8c860' : '#605030';
    ctx.font = `bold 11px Georgia, serif`;
    ctx.fillText(`[${ab.key}]`, ax + 5, ay + 14);
    ctx.fillStyle = ready ? '#c0a040' : '#504020';
    ctx.font = '10px Georgia, serif';
    ctx.fillText(ab.label, ax + 5, ay + 26);
    if (!ready) {
      ctx.fillStyle = '#cc7722';
      ctx.fillText(`${Math.ceil(ab.cooldown)}s`, ax + 5, ay + 40);
      // Cooldown ring
      const prog = 1 - ab.cooldown / ab.maxCooldown;
      ctx.strokeStyle = 'rgba(220,160,50,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ax + 50, ay + 10, 8, -Math.PI * 0.5, -Math.PI * 0.5 + Math.PI * 2 * prog);
      ctx.stroke();
    }
    if (holdFireActive && ab.type === 'holdfire') {
      ctx.fillStyle = 'rgba(100,200,100,0.15)';
      roundRect(ctx, ax, ay, 60, 44, 3);
    }
    if (fastLoadActive && ab.type === 'fastload') {
      ctx.fillStyle = 'rgba(100,200,100,0.15)';
      roundRect(ctx, ax, ay, 60, 44, 3);
    }
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
  ctx.stroke();
}

// ── Phase overlays ────────────────────────────────────────────────────────────
function drawWaveIntro(ctx: CanvasRenderingContext2D, wave: number, timer: number, maxTimer = 2.2) {
  const alpha = Math.min(1, timer / 0.5) * Math.min(1, (maxTimer - timer) / 0.5 * 2);
  ctx.save();
  ctx.globalAlpha = alpha * 0.85;
  ctx.fillStyle = 'rgba(10,6,2,0.9)';
  ctx.fillRect(0, CANVAS_H * 0.35, CANVAS_W, CANVAS_H * 0.3);
  ctx.globalAlpha = alpha;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e8c860';
  ctx.font = `bold 52px Georgia, serif`;
  ctx.fillText(wave === 5 ? 'THE GREAT ATTACK' : `WAVE ${wave}`, CANVAS_W * 0.5, CANVAS_H * 0.5 + 8);
  ctx.fillStyle = '#a08840';
  ctx.font = '20px Georgia, serif';
  const subtitles = [
    'Training — defend the harbor',
    'The British advance',
    'Crosswinds complicate your aim',
    'Heavy fleet — Heated Shot unlocked',
    'The historic British attack begins!',
  ];
  ctx.fillText(subtitles[wave - 1] ?? '', CANVAS_W * 0.5, CANVAS_H * 0.5 + 38);
  ctx.textAlign = 'left';
  ctx.restore();
}

function drawHistoricalFact(ctx: CanvasRenderingContext2D, fact: string, timer: number) {
  if (!fact || timer <= 0) return;
  const alpha = Math.min(1, timer * 2) * Math.min(1, (timer - 0.3) * 2);
  ctx.save();
  ctx.globalAlpha = alpha;

  // Parchment panel
  const panW = 680, panH = 90;
  const panX = (CANVAS_W - panW) * 0.5;
  const panY = CANVAS_H * 0.5 - panH * 0.5 - 20;
  const panGrad = ctx.createLinearGradient(panX, panY, panX, panY + panH);
  panGrad.addColorStop(0, 'rgba(60,40,12,0.96)');
  panGrad.addColorStop(1, 'rgba(40,25,6,0.96)');
  ctx.fillStyle = panGrad;
  ctx.beginPath();
  ctx.roundRect(panX, panY, panW, panH, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,160,60,0.7)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Inner border
  ctx.strokeStyle = 'rgba(180,130,40,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(panX + 5, panY + 5, panW - 10, panH - 10, 5);
  ctx.stroke();

  ctx.fillStyle = '#f0d878';
  ctx.font = 'italic bold 13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('— Historical Fact —', CANVAS_W * 0.5, panY + 26);
  ctx.fillStyle = '#e0c868';
  ctx.font = '14px Georgia, serif';

  // Word-wrap the fact
  wrapText(ctx, fact, CANVAS_W * 0.5, panY + 50, panW - 40, 20);
  ctx.textAlign = 'left';
  ctx.restore();
}

function drawComboText(ctx: CanvasRenderingContext2D, combo: GameState['combo']) {
  if (combo.displayTimer <= 0) return;
  const alpha = Math.min(1, combo.displayTimer);
  const scale = 1 + (1 - combo.displayTimer / 1.6) * 0.3;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(combo.displayX, combo.displayY);
  ctx.scale(scale, scale);
  ctx.textAlign = 'center';
  ctx.font = `bold 28px Georgia, serif`;
  ctx.fillStyle = '#ffcc44';
  ctx.strokeStyle = 'rgba(0,0,0,0.8)';
  ctx.lineWidth = 3;
  ctx.strokeText(combo.displayText, 0, 0);
  ctx.fillText(combo.displayText, 0, 0);
  ctx.textAlign = 'left';
  ctx.restore();
}

function drawWaveComplete(ctx: CanvasRenderingContext2D, waveNum: number) {
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = 'rgba(10,6,2,0.85)';
  ctx.fillRect(0, CANVAS_H * 0.35, CANVAS_W, CANVAS_H * 0.3);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f0d070';
  ctx.font = 'bold 44px Georgia, serif';
  ctx.fillText(`WAVE ${waveNum} CLEARED`, CANVAS_W * 0.5, CANVAS_H * 0.5 + 5);
  ctx.fillStyle = '#c0a060';
  ctx.font = '18px Georgia, serif';
  ctx.fillText('Prepare for the next attack...', CANVAS_W * 0.5, CANVAS_H * 0.5 + 36);
  ctx.textAlign = 'left';
  ctx.restore();
}

function drawGameOverlay(ctx: CanvasRenderingContext2D, won: boolean) {
  ctx.save();
  ctx.fillStyle = won ? 'rgba(4,20,4,0.88)' : 'rgba(20,4,4,0.88)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = won ? '#70e870' : '#ee4444';
  ctx.font = 'bold 64px Georgia, serif';
  ctx.fillText(won ? 'HARBOR DEFENDED!' : 'FORT HAS FALLEN', CANVAS_W * 0.5, CANVAS_H * 0.5 - 20);
  ctx.fillStyle = '#c0b080';
  ctx.font = '22px Georgia, serif';
  ctx.fillText('Calculating results...', CANVAS_W * 0.5, CANVAS_H * 0.5 + 28);
  ctx.textAlign = 'left';
  ctx.restore();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineH: number) {
  const words = text.split(' ');
  let line = '';
  let dy = 0;
  for (const word of words) {
    const test = line + (line ? ' ' : '') + word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y + dy);
      line = word;
      dy += lineH;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y + dy);
}

// ── Main render entry ─────────────────────────────────────────────────────────
export function renderFrame(ctx: CanvasRenderingContext2D, state: GameState, particles: Particle[]) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  drawBackground(ctx, state.oceanOffset);
  drawFort(ctx, state.fort.totalHealth, state.fort.maxTotalHealth, state.time);

  // Ships (back to front — further right renders behind)
  const sorted = [...state.ships].sort((a, b) => a.x - b.x);
  for (const ship of sorted) {
    if (!ship.sunk) drawShip(ctx, ship);
  }

  drawParticles(ctx, particles);
  drawCannonballs(ctx, state.cannonballs);
  drawAimIndicator(ctx, state.aimAngle, state.smokeTimer);
  drawCannonSmoke(ctx, state.aimAngle, state.smokeTimer);
  drawCannon(ctx, state.aimAngle, state.cannonRecoil);

  if (state.phase === 'playing' || state.phase === 'wave_complete' || state.phase === 'wave_intro') {
    drawHUD(ctx, state);
  }

  if (state.phase === 'wave_intro') {
    drawWaveIntro(ctx, state.wave.currentWave, state.wave.introTimer);
  }
  if (state.phase === 'wave_complete') {
    drawWaveComplete(ctx, state.wave.currentWave);
    if (state.wave.currentFact) {
      drawHistoricalFact(ctx, state.wave.currentFact, state.wave.factTimer);
    }
  }
  if (state.phase === 'playing') {
    drawComboText(ctx, state.combo);
  }
  if (state.phase === 'game_over') drawGameOverlay(ctx, false);
  if (state.phase === 'victory') drawGameOverlay(ctx, true);

  // Ships label (debug disabled)
  void SHIPS;
}
