/**
 * Chimera Shadow Garden Visual Effects Engine
 * Megumi Fushiguro's Canonical Domain Expansion
 *
 * Faithfully recreates the anime sequence:
 * - Bottomless bubbling pool of liquid shadow ink rising from floor
 * - Viscous fluid waves with boiling shadow bubbles bursting upwards
 * - Soaring winged Nue bird silhouettes gliding across the gloom
 * - Piercing white glowing eyes of the Divine Dog peering from the darkness
 * - Interactive dripping ink splatter trails adhering to hand movements
 */

import { clamp, randomRange } from '../math-utils.js';

export class ChimeraShadowFX {
  constructor() {
    this.time = 0;
    this.intensity = 0;
    this.bubbles = [];
    this.shikigamiBirds = [];
    this.eyes = [];
    this.inkSplats = [];
    this.fluidLevel = 0; // Rising from bottom

    this.initEntities();
  }

  initEntities() {
    // Bubbles in the liquid shadow
    this.bubbles = [];
    for (let i = 0; i < 45; i++) {
      this.bubbles.push({
        x: Math.random(),
        y: 1.0 + Math.random() * 0.2,
        vy: -Math.random() * 0.003 - 0.001,
        size: Math.random() * 8 + 3,
        alpha: Math.random() * 0.8 + 0.2,
      });
    }

    // Winged Nue bird silhouettes
    this.shikigamiBirds = [
      { x: -0.2, y: 0.25, vx: 0.003, size: 45, wingPhase: 0 },
      { x: 1.2, y: 0.45, vx: -0.004, size: 60, wingPhase: 2 },
    ];

    // Divine Dog eyes peering from dark pool
    this.eyes = [
      { x: 0.28, y: 0.82, blinkTimer: 2.0, open: true },
      { x: 0.72, y: 0.78, blinkTimer: 3.5, open: true },
      { x: 0.5, y: 0.88, blinkTimer: 1.2, open: true },
    ];
  }

  activate() {
    this.intensity = 1.0;
    this.fluidLevel = 0.05; // Starts rising
  }

  deactivate() {
    this.intensity = 0;
    this.fluidLevel = 0;
    this.inkSplats = [];
  }

  addHandInkTrail(x, y) {
    if (this.intensity <= 0) return;
    this.inkSplats.push({
      x, y,
      radius: randomRange(6, 16),
      life: 1.0,
      decay: 0.02,
    });
    if (this.inkSplats.length > 35) {
      this.inkSplats.shift();
    }
  }

  update(dt) {
    if (this.intensity <= 0) return;

    this.time += dt * 0.018;

    // Shadow fluid rises up to 45% of the screen
    this.fluidLevel = Math.min(0.48, this.fluidLevel + 0.003 * dt);

    // Update bubbles
    for (const b of this.bubbles) {
      b.y += b.vy * dt;
      if (b.y < 1.0 - this.fluidLevel) {
        b.y = 1.0;
        b.x = Math.random();
      }
    }

    // Update soaring Nue birds
    for (const bird of this.shikigamiBirds) {
      bird.x += bird.vx * dt;
      bird.wingPhase += 0.08 * dt;
      if (bird.vx > 0 && bird.x > 1.3) {
        bird.x = -0.3;
        bird.y = randomRange(0.15, 0.5);
      } else if (bird.vx < 0 && bird.x < -0.3) {
        bird.x = 1.3;
        bird.y = randomRange(0.2, 0.55);
      }
    }

    // Update blinking eyes
    for (const eye of this.eyes) {
      eye.blinkTimer -= dt * 0.02;
      if (eye.blinkTimer <= 0) {
        eye.open = !eye.open;
        eye.blinkTimer = eye.open ? randomRange(2.5, 5.0) : 0.25;
      }
    }

    // Update hand ink drips
    for (let i = this.inkSplats.length - 1; i >= 0; i--) {
      const s = this.inkSplats[i];
      s.life -= s.decay * dt;
      s.y += 0.5 * dt; // Gravity drip
      if (s.life <= 0) {
        this.inkSplats.splice(i, 1);
      }
    }
  }

  draw(ctx, width, height) {
    if (this.intensity <= 0) return;

    ctx.save();

    // 1. Shadow Domain Atmosphere (Dark emerald-tinted gloom)
    const atmosGrad = ctx.createLinearGradient(0, 0, 0, height);
    atmosGrad.addColorStop(0, 'rgba(1, 10, 8, 0.94)');
    atmosGrad.addColorStop(0.5, 'rgba(2, 20, 16, 0.9)');
    atmosGrad.addColorStop(1, 'rgba(0, 5, 4, 0.98)');
    ctx.fillStyle = atmosGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Soaring Winged Nue Birds across the mist
    for (const bird of this.shikigamiBirds) {
      this.drawNueBird(ctx, bird.x * width, bird.y * height, bird.size, bird.wingPhase, bird.vx > 0);
    }

    // 3. Bottomless Rising Liquid Shadow Ink Pool
    const surfaceY = height * (1.0 - this.fluidLevel);

    // Viscous fluid body
    ctx.fillStyle = 'rgba(0, 2, 2, 0.98)';
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(0, surfaceY);

    // Sloshing wave surface with sine superposition
    const segments = 24;
    for (let i = 0; i <= segments; i++) {
      const px = (i / segments) * width;
      const wave = Math.sin(this.time * 2.2 + i * 0.8) * 8 + Math.cos(this.time * 1.4 + i * 0.4) * 4;
      ctx.lineTo(px, surfaceY + wave);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // Emerald cursed rim glow on shadow wave surface
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.75)';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#10b981';
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const px = (i / segments) * width;
      const wave = Math.sin(this.time * 2.2 + i * 0.8) * 8 + Math.cos(this.time * 1.4 + i * 0.4) * 4;
      if (i === 0) ctx.moveTo(px, surfaceY + wave);
      else ctx.lineTo(px, surfaceY + wave);
    }
    ctx.stroke();

    // 4. Boiling Shadow Bubbles
    for (const b of this.bubbles) {
      const bx = b.x * width;
      const by = b.y * height;
      if (by < surfaceY) continue;

      ctx.fillStyle = `rgba(16, 185, 129, ${b.alpha * 0.6})`;
      ctx.beginPath();
      ctx.arc(bx, by, b.size, 0, Math.PI * 2);
      ctx.fill();

      // Bubble highlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(bx - b.size * 0.3, by - b.size * 0.3, b.size * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Divine Dog Glowing Eyes peering from the ink
    for (const eye of this.eyes) {
      if (!eye.open) continue;
      const ex = eye.x * width;
      const ey = eye.y * height;
      if (ey < surfaceY) continue;

      // Piercing white predator eyes
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 16;
      ctx.shadowColor = '#6ee7b7';

      // Left eye
      ctx.beginPath();
      ctx.ellipse(ex - 14, ey, 7, 3.5, -0.15, 0, Math.PI * 2);
      ctx.fill();

      // Right eye
      ctx.beginPath();
      ctx.ellipse(ex + 14, ey, 7, 3.5, 0.15, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Interactive Dripping Hand Ink Splats
    for (const s of this.inkSplats) {
      ctx.fillStyle = `rgba(0, 0, 0, ${s.life * 0.9})`;
      ctx.strokeStyle = `rgba(16, 185, 129, ${s.life * 0.8})`;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#10b981';

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Draws a soaring winged Nue bird silhouette with flapping animation.
   */
  drawNueBird(ctx, x, y, size, phase, facingRight) {
    ctx.save();
    ctx.translate(x, y);
    if (!facingRight) ctx.scale(-1, 1);

    ctx.fillStyle = 'rgba(0, 4, 3, 0.95)';
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.45)';
    ctx.lineWidth = 1.8;
    ctx.shadowBlur = 14;
    ctx.shadowColor = 'rgba(16, 185, 129, 0.6)';

    const wingFlap = Math.sin(phase) * size * 0.45;

    // Bird Body
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.4, size * 0.18, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Wings
    ctx.beginPath();
    ctx.moveTo(-size * 0.1, 0);
    ctx.quadraticCurveTo(0, -size * 0.6 + wingFlap, size * 0.6, -size * 0.8 + wingFlap);
    ctx.quadraticCurveTo(size * 0.2, -size * 0.2 + wingFlap * 0.5, 0, 0);
    ctx.fill();
    ctx.stroke();

    // Feathered Beak Head
    ctx.beginPath();
    ctx.moveTo(size * 0.35, -size * 0.05);
    ctx.lineTo(size * 0.65, 0);
    ctx.lineTo(size * 0.35, size * 0.08);
    ctx.closePath();
    ctx.fill();

    // Glowing Orange Nue Eye
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#f59e0b';
    ctx.beginPath();
    ctx.arc(size * 0.38, -size * 0.02, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
