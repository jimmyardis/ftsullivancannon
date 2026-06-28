import type { GameState, Ship, Cannonball, AmmoType, ShipType } from '../types/game';
import { AudioSystem } from './audio';
import { ParticleSystem } from './particles';
import {
  CANVAS_W, CANVAS_H, GRAVITY, WATER_Y, FORT_RIGHT, CANNON_X, CANNON_Y,
  AMMO, SHIPS, WAVES, WEATHER_BY_WAVE, WEATHER_CONFIG, HISTORICAL_FACTS,
  COMMANDER_RANKS, FORT_ZONES, TOTAL_CREW, BOMB_HOLD_X, SHORE_X,
} from './constants';
import type { GameResult } from '../types/game';

let _nextId = 0;
const uid = () => String(_nextId++);

function initState(): GameState {
  return {
    phase: 'wave_intro',
    ships: [],
    cannonballs: [],
    particles: [],
    fort: {
      zones: FORT_ZONES.map(z => ({ label: z.label, health: z.maxHp, maxHealth: z.maxHp })),
      totalHealth: FORT_ZONES.reduce((s, z) => s + z.maxHp, 0),
      maxTotalHealth: FORT_ZONES.reduce((s, z) => s + z.maxHp, 0),
    },
    crew: { total: TOTAL_CREW, alive: TOTAL_CREW },
    score: 0,
    combo: { multiplier: 1, count: 0, idleTimer: 0, displayText: '', displayTimer: 0, displayX: 640, displayY: 300 },
    ammo: { selected: 'roundshot', reloading: false, reloadProgress: 1, reloadTime: AMMO.roundshot.reload, heatedUnlocked: false },
    aimAngle: -0.4,
    weather: { type: 'calm', windForce: 0, label: 'Calm' },
    wave: {
      currentWave: 1,
      spawnQueue: WAVES[0].map(e => ({ ...e })),
      nextSpawnTime: WAVES[0][0]?.delay ?? 2,
      factTimer: 0,
      currentFact: null,
      introTimer: 2.2,
      cleared: false,
    },
    abilities: [
      { type: 'volley',   label: 'Volley',   key: 'Q', cooldown: 0, maxCooldown: 18, activeTimer: 0, activeDuration: 0 },
      { type: 'repair',   label: 'Repair',   key: 'W', cooldown: 0, maxCooldown: 25, activeTimer: 0, activeDuration: 0 },
      { type: 'fastload', label: 'Fast Load',key: 'E', cooldown: 0, maxCooldown: 20, activeTimer: 0, activeDuration: 8 },
      { type: 'holdfire', label: 'Hold Fire', key: 'R', cooldown: 0, maxCooldown: 22, activeTimer: 0, activeDuration: 7 },
    ],
    totalShots: 0,
    hits: 0,
    totalShipsDestroyed: 0,
    holdFireActive: false,
    fastLoadActive: false,
    volleyQueued: 0,
    oceanOffset: 0,
    time: 0,
    cannonRecoil: 0,
    smokeTimer: 0,
  };
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private state: GameState;
  audio: AudioSystem;
  particles: ParticleSystem;
  private raf = 0;
  private lastTime = 0;
  private scaleX = 1;
  private scaleY = 1;

  onGameOver?: (result: GameResult) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.state = initState();
    this.audio = new AudioSystem();
    this.particles = new ParticleSystem();
    this.resize();
  }

  getState(): GameState { return this.state; }
  getParticles() { return this.particles.particles; }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.max(1, Math.round(rect.width * devicePixelRatio));
    this.canvas.height = Math.max(1, Math.round(rect.height * devicePixelRatio));
    // Scale the fixed 1280x720 design space to fill the canvas on both axes.
    // Filling (rather than fitting) means no black bars — at the cost of a
    // small stretch when the screen's aspect ratio differs from 16:9.
    this.scaleX = this.canvas.width / CANVAS_W;
    this.scaleY = this.canvas.height / CANVAS_H;
  }

  start() {
    this.audio.init();
    this.lastTime = performance.now();
    this.loop();
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.audio.stop();
  }

  private loop() {
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    this.update(dt);
    const ctx = this.canvas.getContext('2d')!;
    ctx.save();
    ctx.scale(this.scaleX, this.scaleY);
    import('./renderer').then(m => {
      m.renderFrame(ctx, this.state, this.particles.particles);
    });
    ctx.restore();
    this.raf = requestAnimationFrame(() => this.loop());
  }

  private update(dt: number) {
    const s = this.state;
    s.time += dt;
    s.oceanOffset += dt * 18;

    if (s.phase === 'wave_intro') {
      s.wave.introTimer -= dt;
      if (s.wave.introTimer <= 0) s.phase = 'playing';
      return;
    }

    if (s.phase === 'wave_complete') {
      s.wave.factTimer -= dt;
      if (s.wave.factTimer <= 0) {
        s.wave.currentFact = null;
        this.advanceWave();
      }
      return;
    }

    if (s.phase === 'game_over' || s.phase === 'victory') return;

    // playing
    this.updateWeapon(dt);
    this.updateAbilities(dt);
    this.updateWaveSpawns(dt);
    this.updateShips(dt);
    this.updateCannonballs(dt);
    this.particles.update(dt);
    this.updateCombo(dt);
    this.updateRepairs(dt);
    s.cannonRecoil = Math.max(0, s.cannonRecoil - dt * 4);
    s.smokeTimer = Math.max(0, s.smokeTimer - dt);

    this.checkWaveCleared();
    this.checkEndConditions();
  }

  private updateWeapon(dt: number) {
    const a = this.state.ammo;
    if (a.reloading) {
      const speedMult = this.state.fastLoadActive ? 2 : 1;
      const crewRatio = Math.max(0.4, this.state.crew.alive / this.state.crew.total);
      a.reloadProgress += (dt / a.reloadTime) * speedMult * crewRatio;
      if (a.reloadProgress >= 1) {
        a.reloadProgress = 1;
        a.reloading = false;
      }
    }
  }

  private updateAbilities(dt: number) {
    const s = this.state;
    for (const ab of s.abilities) {
      if (ab.cooldown > 0) ab.cooldown -= dt;
      if (ab.activeTimer > 0) {
        ab.activeTimer -= dt;
        if (ab.activeTimer <= 0) {
          if (ab.type === 'fastload') s.fastLoadActive = false;
          if (ab.type === 'holdfire') s.holdFireActive = false;
        }
      }
    }
    // Handle volley queue
    if (s.volleyQueued > 0 && !s.ammo.reloading) {
      this.fireShot();
      s.volleyQueued--;
    }
  }

  private updateWaveSpawns(dt: number) {
    const w = this.state.wave;
    if (w.spawnQueue.length === 0) return;
    w.nextSpawnTime -= dt;
    if (w.nextSpawnTime <= 0) {
      const entry = w.spawnQueue.shift()!;
      this.spawnShip(entry.type);
      w.nextSpawnTime = w.spawnQueue[0]?.delay ?? 999;
    }
  }

  private spawnShip(type: ShipType) {
    const cfg = SHIPS[type];
    const ship: Ship = {
      id: uid(),
      type,
      x: CANVAS_W + cfg.w * 0.5 + 20,
      y: WATER_Y - cfg.h * 0.52,
      speed: cfg.speed,
      baseSpeed: cfg.speed,
      health: cfg.hp,
      maxHealth: cfg.hp,
      sailDamage: 0,
      isOnFire: false,
      fireTimer: cfg.interval * (0.5 + Math.random() * 0.5),
      fireInterval: cfg.interval,
      width: cfg.w,
      height: cfg.h,
      sunk: false,
      sinking: false,
      sinkTimer: 0,
      counted: false,
    };
    this.state.ships.push(ship);
  }

  private updateShips(dt: number) {
    const s = this.state;
    for (let i = s.ships.length - 1; i >= 0; i--) {
      const ship = s.ships[i];
      if (ship.sunk) { s.ships.splice(i, 1); continue; }
      if (ship.sinking) {
        ship.sinkTimer += dt;
        ship.y += 30 * dt;
        if (ship.sinkTimer > 2.5) {
          if (!ship.counted) {
            s.totalShipsDestroyed++;
            ship.counted = true;
          }
          ship.sunk = true;
        }
        continue;
      }

      // Movement
      const isBomb = ship.type === 'bombvessel';
      const targetX = isBomb ? BOMB_HOLD_X : SHORE_X;
      if (ship.x > targetX + ship.width * 0.5) {
        const effectiveSpeed = ship.speed * (1 - ship.sailDamage * 0.6);
        ship.x -= effectiveSpeed * dt;
      }

      // Fire at fort
      if (!s.holdFireActive) {
        ship.fireTimer -= dt;
        if (ship.fireTimer <= 0) {
          ship.fireTimer = ship.fireInterval * (0.8 + Math.random() * 0.4);
          this.enemyFire(ship);
        }
      }

      // Troop transport damage if reaches shore
      if (ship.type === 'trooptransport' && ship.x <= SHORE_X + ship.width * 0.5) {
        this.damageZone(0, 15);
        this.damageZone(1, 10);
        ship.sinking = true;
      }

      // Fire effect on burning ships
      if (ship.isOnFire) {
        ship.health -= 8 * dt;
        if (Math.random() < 0.3) this.particles.spawnFire(ship.x + (Math.random() - 0.5) * ship.width, ship.y - ship.height * 0.3, 2);
        if (ship.health <= 0 && !ship.sinking) this.sinkShip(ship);
      }
    }
  }

  private enemyFire(ship: Ship) {
    const targetX = CANNON_X + (Math.random() - 0.5) * 60;
    const targetY = CANNON_Y + (Math.random() - 0.5) * 40;
    const dx = targetX - ship.x;
    const dy = targetY - (ship.y - ship.height * 0.3);
    const dist = Math.sqrt(dx * dx + dy * dy);
    // Arc shot — give it enough initial upward velocity
    const travelTime = dist / 320;
    const vx = dx / travelTime;
    const vy = dy / travelTime - 0.5 * GRAVITY * travelTime;

    this.state.cannonballs.push({
      id: uid(),
      x: ship.x,
      y: ship.y - ship.height * 0.3,
      vx,
      vy,
      type: 'roundshot',
      fromPlayer: false,
      radius: 6,
      trail: [],
      active: true,
    });
  }

  private updateCannonballs(dt: number) {
    const s = this.state;
    const wind = s.weather.windForce;

    for (let i = s.cannonballs.length - 1; i >= 0; i--) {
      const cb = s.cannonballs[i];
      if (!cb.active) { s.cannonballs.splice(i, 1); continue; }

      cb.trail.push({ x: cb.x, y: cb.y });
      if (cb.trail.length > 12) cb.trail.shift();

      cb.vy += GRAVITY * dt;
      cb.vx += (cb.fromPlayer ? -wind : wind) * dt * 0.15;
      cb.x += cb.vx * dt;
      cb.y += cb.vy * dt;

      // Out of bounds
      if (cb.x < -50 || cb.x > CANVAS_W + 50 || cb.y > CANVAS_H + 50) {
        cb.active = false;
        continue;
      }

      if (cb.fromPlayer) {
        // Hit ship?
        let hit = false;
        for (const ship of s.ships) {
          if (ship.sinking || ship.sunk) continue;
          if (this.ballHitsShip(cb, ship)) {
            this.handlePlayerHit(cb, ship);
            cb.active = false;
            hit = true;
            break;
          }
        }
        if (!hit && cb.y >= WATER_Y - 4) {
          // Splash
          this.particles.spawnSplash(cb.x, WATER_Y, 10);
          this.audio.playSplash();
          cb.active = false;
        }
      } else {
        // Enemy ball hitting fort
        if (cb.x <= FORT_RIGHT && cb.y >= 360 && cb.y <= WATER_Y) {
          this.handleFortHit(cb);
          cb.active = false;
        } else if (cb.y >= WATER_Y) {
          this.particles.spawnSplash(cb.x, WATER_Y, 6);
          this.audio.playSplash();
          cb.active = false;
        }
      }
    }
  }

  private ballHitsShip(cb: Cannonball, ship: Ship): boolean {
    const halfW = ship.width * 0.55;
    const halfH = ship.height * 0.6;
    return (
      cb.x >= ship.x - halfW && cb.x <= ship.x + halfW &&
      cb.y >= ship.y - halfH && cb.y <= ship.y + ship.height * 0.2
    );
  }

  private handlePlayerHit(cb: Cannonball, ship: Ship) {
    const cfg = AMMO[cb.type];
    ship.health -= cfg.hullDmg;
    ship.sailDamage = Math.min(1, ship.sailDamage + cfg.sailDmg);

    if (cfg.firePct > 0 && Math.random() < cfg.firePct && !ship.isOnFire) {
      ship.isOnFire = true;
    }

    this.particles.spawnSparks(cb.x, cb.y, 14);
    this.particles.spawnSmoke(cb.x, cb.y, 8);
    this.particles.spawnDebris(cb.x, cb.y, 6);
    this.audio.playExplosion();

    this.state.hits++;
    const distBonus = Math.floor(Math.max(1, (cb.x - FORT_RIGHT) / 200));
    const baseScore = cfg.hullDmg * 3 + distBonus * 20;
    const scored = Math.round(baseScore * this.state.combo.multiplier);
    this.state.score += scored;
    this.incrementCombo(cb.x, cb.y - 30, scored);

    if (ship.health <= 0 && !ship.sinking) {
      this.sinkShip(ship);
    }
  }

  private sinkShip(ship: Ship) {
    ship.sinking = true;
    ship.sinkTimer = 0;
    const cfg = SHIPS[ship.type];
    const bonus = Math.round(cfg.score * this.state.combo.multiplier);
    this.state.score += bonus;
    this.particles.spawnDebris(ship.x, ship.y, 14);
    this.particles.spawnSmoke(ship.x, ship.y, 12);
    this.audio.playExplosion();
  }

  private handleFortHit(cb: Cannonball) {
    const dmg = SHIPS['frigate'].shotDmg; // base damage — enemy uses fixed damage
    const zone = Math.floor(Math.random() * this.state.fort.zones.length);
    this.damageZone(zone, dmg);
    this.particles.spawnDebris(cb.x, cb.y, 8);
    this.particles.spawnSparks(cb.x, cb.y, 8);
    this.audio.playHit();
  }

  private damageZone(zone: number, dmg: number) {
    const s = this.state;
    const z = s.fort.zones[zone];
    z.health = Math.max(0, z.health - dmg);
    s.fort.totalHealth = s.fort.zones.reduce((acc, zz) => acc + zz.health, 0);
    // Crew casualties from damage
    if (Math.random() < 0.2) {
      s.crew.alive = Math.max(0, s.crew.alive - 1);
    }
  }

  private updateRepairs(dt: number) {
    const s = this.state;
    const crewRatio = s.crew.alive / s.crew.total;
    const repairRate = 1.5 * crewRatio * dt;
    for (const z of s.fort.zones) {
      if (z.health < z.maxHealth) {
        z.health = Math.min(z.maxHealth, z.health + repairRate);
      }
    }
    s.fort.totalHealth = s.fort.zones.reduce((acc, z) => acc + z.health, 0);
  }

  private updateCombo(dt: number) {
    const c = this.state.combo;
    if (c.count > 0) {
      c.idleTimer += dt;
      if (c.idleTimer > 3.5) {
        c.count = 0;
        c.multiplier = 1;
        c.idleTimer = 0;
      }
    }
    if (c.displayTimer > 0) c.displayTimer -= dt;
  }

  private incrementCombo(x: number, y: number, scored: number) {
    const c = this.state.combo;
    c.count++;
    c.idleTimer = 0;
    c.multiplier = Math.min(6, 1 + Math.floor(c.count / 3));
    const labels = ['', 'HIT!', 'DOUBLE HIT!', 'TRIPLE!', 'ON FIRE!', 'FURY!', 'LEGENDARY!'];
    const label = c.count >= 6 ? 'LEGENDARY!' : labels[Math.min(c.count, labels.length - 1)];
    c.displayText = `${label}  +${scored}`;
    c.displayTimer = 1.6;
    c.displayX = x;
    c.displayY = y;
  }

  private checkWaveCleared() {
    const s = this.state;
    if (s.wave.cleared) return;
    const allSpawned = s.wave.spawnQueue.length === 0;
    const allGone = s.ships.every(sh => sh.sunk || sh.sinking);
    if (allSpawned && allGone) {
      s.wave.cleared = true;
      if (s.wave.currentWave >= 5) {
        s.phase = 'victory';
        this.triggerEnd(true);
      } else {
        s.phase = 'wave_complete';
        const factIdx = (s.wave.currentWave - 1) % HISTORICAL_FACTS.length;
        s.wave.currentFact = HISTORICAL_FACTS[factIdx];
        s.wave.factTimer = 4.5;
      }
    }
  }

  private advanceWave() {
    const s = this.state;
    const nextWave = s.wave.currentWave + 1;
    const wIdx = nextWave - 1;
    const weatherType = WEATHER_BY_WAVE[wIdx] ?? 'lightwind';
    const wCfg = WEATHER_CONFIG[weatherType];
    s.weather = { type: weatherType, windForce: wCfg.windForce, label: wCfg.label };
    if (nextWave >= 4) s.ammo.heatedUnlocked = true;
    s.wave = {
      currentWave: nextWave,
      spawnQueue: WAVES[wIdx].map(e => ({ ...e })),
      nextSpawnTime: WAVES[wIdx][0]?.delay ?? 2,
      factTimer: 0,
      currentFact: null,
      introTimer: 2.0,
      cleared: false,
    };
    s.phase = 'wave_intro';
  }

  private checkEndConditions() {
    const s = this.state;
    if (s.fort.totalHealth <= 0 || s.crew.alive <= 0) {
      s.phase = 'game_over';
      this.triggerEnd(false);
    }
  }

  private triggerEnd(won: boolean) {
    const s = this.state;
    const accuracy = s.totalShots > 0 ? (s.hits / s.totalShots) * 100 : 0;
    const crewSaved = (s.crew.alive / s.crew.total) * 100;
    const rankEntry = [...COMMANDER_RANKS].reverse().find(r => s.score >= r.min);
    const result: GameResult = {
      won,
      score: s.score,
      accuracy: parseFloat(accuracy.toFixed(1)),
      shipsDestroyed: s.totalShipsDestroyed,
      crewSaved: parseFloat(crewSaved.toFixed(1)),
      waveReached: s.wave.currentWave,
      commanderRank: rankEntry?.rank ?? 'Powder Monkey',
    };
    setTimeout(() => this.onGameOver?.(result), 1200);
  }

  // --- Input handlers ---
  handleMouseMove(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    const gx = ((clientX - rect.left) / rect.width) * CANVAS_W;
    const gy = ((clientY - rect.top) / rect.height) * CANVAS_H;
    const dx = gx - CANNON_X;
    const dy = gy - CANNON_Y;
    let angle = Math.atan2(dy, dx);
    // Clamp to valid firing range (aim toward ships, not backward)
    angle = Math.max(-Math.PI * 0.72, Math.min(Math.PI * 0.05, angle));
    this.state.aimAngle = angle;
  }

  handleWheel(delta: number) {
    this.state.aimAngle = Math.max(-Math.PI * 0.72, Math.min(Math.PI * 0.05, this.state.aimAngle + delta * 0.001));
  }

  handleFire() {
    const s = this.state;
    if (s.phase !== 'playing') return;
    if (s.ammo.reloading || s.ammo.reloadProgress < 1) return;
    this.fireShot();
  }

  private fireShot() {
    const s = this.state;
    const cfg = AMMO[s.ammo.selected];
    const angle = s.aimAngle;
    const cb: Cannonball = {
      id: uid(),
      x: CANNON_X + Math.cos(angle) * 22,
      y: CANNON_Y + Math.sin(angle) * 22,
      vx: Math.cos(angle) * cfg.speed,
      vy: Math.sin(angle) * cfg.speed,
      type: s.ammo.selected,
      fromPlayer: true,
      radius: cfg.radius,
      trail: [],
      active: true,
    };
    s.cannonballs.push(cb);
    s.totalShots++;
    s.ammo.reloading = true;
    s.ammo.reloadProgress = 0;
    s.ammo.reloadTime = cfg.reload;
    s.cannonRecoil = 1;
    s.smokeTimer = 1.2;
    this.audio.playCannon();
    this.particles.spawnSmoke(CANNON_X, CANNON_Y, 10);
    this.particles.spawnSparks(CANNON_X + Math.cos(angle) * 18, CANNON_Y + Math.sin(angle) * 18, 8);
  }

  handleKeyDown(key: string) {
    const s = this.state;
    if (key === ' ' || key === 'Space') { this.handleFire(); return; }
    if (key === '1') this.selectAmmo('roundshot');
    if (key === '2') this.selectAmmo('chainshot');
    if (key === '3') this.selectAmmo('grapeshot');
    if (key === '4' && s.ammo.heatedUnlocked) this.selectAmmo('heatedshot');
    if (key === 'q' || key === 'Q') this.useAbility('volley');
    if (key === 'w' || key === 'W') this.useAbility('repair');
    if (key === 'e' || key === 'E') this.useAbility('fastload');
    if (key === 'r' || key === 'R') this.useAbility('holdfire');
  }

  private selectAmmo(type: AmmoType) {
    const s = this.state;
    if (type === 'heatedshot' && !s.ammo.heatedUnlocked) return;
    if (s.ammo.selected === type) return;
    s.ammo.selected = type;
    s.ammo.reloading = true;
    s.ammo.reloadProgress = 0;
    s.ammo.reloadTime = AMMO[type].reload;
  }

  useAbility(type: string) {
    const s = this.state;
    if (s.phase !== 'playing') return;
    const ab = s.abilities.find(a => a.type === type);
    if (!ab || ab.cooldown > 0) return;
    ab.cooldown = ab.maxCooldown;

    switch (type) {
      case 'volley':
        s.volleyQueued = 3;
        break;
      case 'repair': {
        const healAmt = 25;
        for (const z of s.fort.zones) z.health = Math.min(z.maxHealth, z.health + healAmt);
        s.fort.totalHealth = s.fort.zones.reduce((a, z) => a + z.health, 0);
        s.crew.alive = Math.min(s.crew.total, s.crew.alive + 3);
        break;
      }
      case 'fastload':
        s.fastLoadActive = true;
        ab.activeTimer = ab.activeDuration;
        break;
      case 'holdfire':
        s.holdFireActive = true;
        ab.activeTimer = ab.activeDuration;
        break;
    }
  }
}
