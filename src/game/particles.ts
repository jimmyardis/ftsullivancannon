import type { Particle } from '../types/game';

let nextId = 0;

export class ParticleSystem {
  particles: Particle[] = [];

  spawnSmoke(x: number, y: number, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 15 + Math.random() * 40;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * spd * 0.4,
        vy: -20 - Math.random() * 30,
        life: 0.8 + Math.random() * 0.8,
        maxLife: 1.2,
        color: `hsl(0,0%,${60 + Math.random() * 25}%)`,
        size: 8 + Math.random() * 14,
        type: 'smoke',
        gravity: false,
      });
      nextId++;
    }
  }

  spawnSparks(x: number, y: number, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * Math.PI * 1.2;
      const spd = 60 + Math.random() * 140;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 0.3 + Math.random() * 0.4,
        maxLife: 0.5,
        color: Math.random() > 0.5 ? '#ffcc44' : '#ff6600',
        size: 2 + Math.random() * 3,
        type: 'spark',
        gravity: true,
      });
      nextId++;
    }
  }

  spawnSplash(x: number, y: number, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI * 0.8 + Math.random() * Math.PI * 0.6;
      const spd = 40 + Math.random() * 120;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 0.5 + Math.random() * 0.4,
        maxLife: 0.7,
        color: `hsla(200,60%,${70 + Math.random() * 20}%,0.9)`,
        size: 3 + Math.random() * 5,
        type: 'splash',
        gravity: true,
      });
      nextId++;
    }
  }

  spawnDebris(x: number, y: number, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() - 0.5) * Math.PI;
      const spd = 50 + Math.random() * 100;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * spd,
        vy: -Math.abs(Math.sin(angle) * spd) - 20,
        life: 0.8 + Math.random() * 0.6,
        maxLife: 1.0,
        color: Math.random() > 0.5 ? '#8b5a2b' : '#5a3a1a',
        size: 3 + Math.random() * 6,
        type: 'debris',
        gravity: true,
      });
      nextId++;
    }
  }

  spawnFire(x: number, y: number, count = 6) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 25,
        vy: -35 - Math.random() * 45,
        life: 0.4 + Math.random() * 0.4,
        maxLife: 0.6,
        color: Math.random() > 0.4 ? '#ff5500' : '#ffaa00',
        size: 6 + Math.random() * 8,
        type: 'fire',
        gravity: false,
      });
      nextId++;
    }
  }

  update(dt: number) {
    const GRAV = 280;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.gravity) p.vy += GRAV * dt;
      p.vx *= 0.97;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  clear() {
    this.particles = [];
  }
}

void nextId;
