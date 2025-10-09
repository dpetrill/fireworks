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
  type: string;

  constructor(x: number, y: number, palette: string[], power: number = 1, type: string = 'random') {
    this.x = x;
    this.y = y;
    this.palette = palette;
    this.particles = [];
    this.type = type;
    
    // Create different firework types
    switch(type) {
      case 'heart':
        this.createHeart(power);
        break;
      case 'star':
        this.createStar(power);
        break;
      case 'spiral':
        this.createSpiral(power);
        break;
      case 'ring':
        this.createRing(power);
        break;
      case 'willow':
        this.createWillow(power);
        break;
      case 'palm':
        this.createPalm(power);
        break;
      case 'crossette':
        this.createCrossette(power);
        break;
      case 'peony':
        this.createPeony(power);
        break;
      case 'chrysanthemum':
        this.createChrysanthemum(power);
        break;
      default: // 'burst' or 'random'
        this.createBurst(power);
        break;
    }
  }

  createBurst(power: number) {
    const count = Math.floor(120 * power);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = rand(1.2, 3.6) * Math.sqrt(power);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const color = choice(this.palette);
      const life = rand(0.8, 1.8) * Math.sqrt(power);
      const size = rand(1.8, 3.4) * Math.cbrt(power);
      this.particles.push(new Particle(this.x, this.y, vx, vy, color, life, size, 'dot'));
    }
  }

  createHeart(power: number) {
    const count = Math.floor(100 * power);
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
      const speed = 0.5 * Math.sqrt(power);
      const color = this.palette[0];
      const life = rand(1.2, 2.0) * Math.sqrt(power);
      const size = rand(2.0, 3.5) * Math.cbrt(power);
      this.particles.push(new Particle(this.x, this.y, x * speed, y * speed, color, life, size, 'dot'));
    }
  }

  createStar(power: number) {
    const points = 5;
    const count = Math.floor(100 * power);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const radius = (i % (count / points) < count / (points * 2)) ? 8 : 4;
      const speed = (rand(1, 2) + radius * 0.5) * Math.sqrt(power);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const color = this.palette[Math.floor(i / 20) % this.palette.length];
      const life = rand(1.0, 1.8) * Math.sqrt(power);
      const size = rand(1.5, 3.0) * Math.cbrt(power);
      this.particles.push(new Particle(this.x, this.y, vx, vy, color, life, size, 'star'));
    }
  }

  createSpiral(power: number) {
    const count = Math.floor(120 * power);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 4 * i) / count;
      const radius = i * 0.05 * Math.sqrt(power);
      const speed = 4 * Math.sqrt(power);
      const vx = Math.cos(angle) * speed + Math.cos(angle) * radius;
      const vy = Math.sin(angle) * speed + Math.sin(angle) * radius;
      const color = this.palette[i % this.palette.length];
      const life = rand(0.9, 1.5) * Math.sqrt(power);
      const size = rand(1.5, 2.5) * Math.cbrt(power);
      this.particles.push(new Particle(this.x, this.y, vx, vy, color, life, size, 'dot'));
    }
  }

  createRing(power: number) {
    const count = Math.floor(80 * power);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 6 * Math.sqrt(power);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const color = this.palette[i % this.palette.length];
      const life = rand(1.0, 1.6) * Math.sqrt(power);
      const size = rand(2.0, 3.0) * Math.cbrt(power);
      this.particles.push(new Particle(this.x, this.y, vx, vy, color, life, size, 'dot'));
    }
  }

  createWillow(power: number) {
    const count = Math.floor(150 * power);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = (rand(1, 3) + 2) * Math.sqrt(power);
      const vx = Math.cos(angle) * speed * 0.5;
      const vy = Math.sin(angle) * speed + 2;
      const color = this.palette[0];
      const life = rand(1.2, 2.0) * Math.sqrt(power);
      const size = rand(1.5, 2.5) * Math.cbrt(power);
      this.particles.push(new Particle(this.x, this.y, vx, vy, color, life, size, 'line'));
    }
  }

  createPalm(power: number) {
    const branches = 8;
    for (let b = 0; b < branches; b++) {
      const angle = (Math.PI * 2 * b) / branches;
      for (let i = 0; i < Math.floor(20 * power); i++) {
        const speed = (rand(2, 4) + 4) * Math.sqrt(power);
        const spread = (rand(-0.5, 0.5)) * 0.5;
        const vx = Math.cos(angle + spread) * speed;
        const vy = Math.sin(angle + spread) * speed + 1;
        const color = this.palette[b % this.palette.length];
        const life = rand(1.0, 1.6) * Math.sqrt(power);
        const size = rand(2.0, 3.0) * Math.cbrt(power);
        this.particles.push(new Particle(this.x, this.y, vx, vy, color, life, size, 'dot'));
      }
    }
  }

  createCrossette(power: number) {
    const directions = 12;
    for (let d = 0; d < directions; d++) {
      const angle = (Math.PI * 2 * d) / directions;
      const speed = 7 * Math.sqrt(power);
      const color = this.palette[d % this.palette.length];
      
      // Main particle
      this.particles.push(new Particle(
        this.x, this.y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color, rand(1.5, 2.5) * Math.cbrt(power), rand(0.5, 1.0) * Math.sqrt(power), 'dot'
      ));
    }
  }

  createPeony(power: number) {
    const layers = 3;
    for (let layer = 0; layer < layers; layer++) {
      const particleCount = Math.floor((60 - layer * 15) * power);
      const speed = (5 - layer * 1.5) * Math.sqrt(power);
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const color = this.palette[layer % this.palette.length];
        const life = rand(0.8, 1.4) * Math.sqrt(power);
        const size = (3 - layer) * Math.cbrt(power);
        this.particles.push(new Particle(this.x, this.y, vx, vy, color, life, size, 'dot'));
      }
    }
  }

  createChrysanthemum(power: number) {
    const count = Math.floor(200 * power);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = (rand(2, 6) + 2) * Math.sqrt(power);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const color = choice(this.palette);
      const life = rand(1.0, 1.8) * Math.sqrt(power);
      const size = rand(1.0, 2.5) * Math.cbrt(power);
      this.particles.push(new Particle(this.x, this.y, vx, vy, color, life, size, 'dot'));
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
  isLargeExplosion: boolean;
  launchTime: number;

  constructor(width: number, height: number, palettes: string[][], target?: { x: number, y: number }, customVelocity?: { vx?: number, vy?: number }, isLargeExplosion?: boolean) {
    this.color = choice(choice(palettes));
    this.exploded = false;
    this.isLargeExplosion = isLargeExplosion || false;
    this.launchTime = performance.now();

    if (target) {
        // User-launched rocket aiming for a target
        this.x = width / 2;
        this.y = height + 10;
        
        if (customVelocity) {
            // Use custom velocity (for slow rockets)
            this.vy = customVelocity.vy || rand(-8.0, -9.5);
            this.vx = customVelocity.vx || 0;
        } else {
            // Normal velocity
            this.vy = rand(-8.0, -9.5); // Consistently strong upward velocity
            // Simplified physics: Calculate time to reach target height, then derive required vx
            const timeToTargetY = (target.y - this.y) / this.vy;
            this.vx = (target.x - this.x) / timeToTargetY;
        }
        
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
    
    // For large explosions, check if 5 seconds have elapsed
    if (this.isLargeExplosion) {
      const elapsed = (performance.now() - this.launchTime) / 1000;
      if (elapsed >= 5.0) {
        this.exploded = true;
        return;
      }
    }
    
    this.vy += gravity * dt * 60 * 0.15;
    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;
    
    // Regular explosion check for normal rockets
    if (!this.isLargeExplosion && (this.vy >= -0.2 || (this.targetY ? this.y <= this.targetY : this.y <= this.explodeY))) {
        this.exploded = true;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.exploded) return;
    
    if (this.isLargeExplosion) {
      // Draw distinctive trail for large explosion rockets
      const elapsed = (performance.now() - this.launchTime) / 1000;
      const trailLength = Math.min(elapsed * 50, 200); // Trail grows over time
      
      // Create gradient for the trail
      const gradient = ctx.createLinearGradient(this.x, this.y + trailLength, this.x, this.y);
      gradient.addColorStop(0, this.color + '00'); // Transparent at bottom
      gradient.addColorStop(0.3, this.color + '40'); // Semi-transparent
      gradient.addColorStop(1, this.color + 'FF'); // Full color at rocket
      
      ctx.save();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 8; // Thicker trail
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(this.x, this.y + trailLength);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();
      
      // Draw the rocket itself with a bright core
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Add a bright white core
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    } else {
      // Regular rocket rendering
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}