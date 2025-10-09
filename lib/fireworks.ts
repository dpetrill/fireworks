import type { Shape } from '../types';
import { rand, choice } from '../constants';

export class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  size: number;
  shape: Shape;
  t: number;
  spin: number;

  constructor(x: number, y: number, vx: number, vy: number, color: string, life: number, size = 2, shape: Shape = 'dot') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.life = life;
    this.t = 0;
    this.size = size;
    this.shape = shape;
    this.spin = rand(-0.2, 0.2);
  }

  step(dt: number, gravity: number, drag = 0.998): void {
    this.vx *= drag;
    this.vy = this.vy * drag + gravity * dt * 60;
    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;
    this.t += dt;
  }

  get alive(): boolean {
    return this.t < this.life;
  }
}

export class Firework {
  x: number;
  y: number;
  palette: string[];
  particles: Particle[];

  constructor(x: number, y: number, palette: string[], power: number = 1) {
    this.x = x;
    this.y = y;
    this.palette = palette;
    this.particles = [];
    
    // Use power to scale the explosion
    const count = (120 + Math.random() * 100) * power;
    const base = rand(0, Math.PI * 2);
    const shapes: Shape[] = ['dot', 'square', 'star', 'line'];
    const shape = choice(shapes);

    for (let i = 0; i < count; i++) {
      const angle = base + (i / count) * Math.PI * 2 + rand(-0.06, 0.06);
      // Scale speed and life with the square root of power to make it feel more natural
      const speed = rand(1.2, 3.6) * Math.sqrt(power);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const color = choice(this.palette);
      const life = rand(0.8, 1.8) * Math.sqrt(power);
      const size = (shape === 'line' ? rand(1.5, 2.5) : rand(1.8, 3.4)) * Math.cbrt(power); // Use cube root for a less extreme size increase
      this.particles.push(new Particle(x, y, vx, vy, color, life, size, shape));
    }
  }

  step(dt: number, gravity: number): void {
    this.particles.forEach(p => p.step(dt, gravity));
    this.particles = this.particles.filter(p => p.alive);
  }

  get done(): boolean {
    return this.particles.length === 0;
  }
}

export class Rocket {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  exploded: boolean;
  explodeY: number;
  targetX?: number;
  targetY?: number;

  constructor(width: number, height: number, palettes: string[][], target?: { x: number, y: number }) {
    this.color = choice(choice(palettes));
    this.exploded = false;

    if (target) {
        // User-launched rocket aiming for a target
        this.x = width / 2;
        this.y = height + 10;
        this.vy = rand(-8.0, -9.5); // Consistently strong upward velocity

        // Simplified physics: Calculate time to reach target height, then derive required vx
        // This ignores the effect of gravity on vy over time for simplicity, but gives a good approximation.
        const timeToTargetY = (target.y - this.y) / this.vy;
        
        // Required horizontal velocity to reach target.x in that time
        this.vx = (target.x - this.x) / timeToTargetY;
        
        this.explodeY = target.y;
        this.targetX = target.x;
        this.targetY = target.y;

    } else {
        // Auto-launched rocket with random trajectory
        this.x = rand(width * 0.15, width * 0.85);
        this.y = height + 10;
        this.vx = rand(-0.4, 0.4);
        this.vy = rand(-6.2, -7.4);
        this.explodeY = rand(height * 0.18, height * 0.55);
    }
  }

  step(dt: number, gravity: number): void {
    if (this.exploded) return;
    this.vy += gravity * dt * 60 * 0.15;
    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;
    if (this.vy >= -0.2 || (this.targetY ? this.y <= this.targetY : this.y <= this.explodeY)) {
        this.exploded = true;
    }
  }
}