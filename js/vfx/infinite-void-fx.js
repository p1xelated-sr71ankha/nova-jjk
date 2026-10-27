/**
 * Infinite Void Visual Effects Engine
 * Satoru Gojo's Canonical Domain Expansion
 *
 * Faithfully recreates the anime sequence:
 * - Colossal central singularity & cosmic iris accretion disk
 * - Relativistic gravitational lensing & warped starfield
 * - Boundless streams of infinite cognitive information filaments rushing at the viewer
 * - Periodic negative color sensory overload flashes
 * - Expanding cyan spacetime deceleration aura rings
 */

import { clamp, lerp } from '../math-utils.js';

export class InfiniteVoidFX {
  constructor() {
    this.time = 0;
    this.intensity = 0; // 0 to 1
    this.irisDilation = 0.2;
    this.negativeFlashTimer = 0;
    this.filaments = [];
    this.stars = [];
    this.auraRings = [];

    this.initParticles();
  }

  initParticles() {
    // Generate starfield for gravitational lensing
    this.stars = [];
    for (let i = 0; i < 220; i++) {
      this.stars.push({
        baseX: (Math.random() - 0.5) * 2, // Normalized [-1, 1]
        baseY: (Math.random() - 0.5) * 2,
        size: Math.random() * 2.2 + 0.6,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 3 + 1,
      });
    }

    // Generate infinite information filaments
    this.filaments = [];
    for (let i = 0; i < 90; i++) {
      this.filaments.push({
        angle: Math.random() * Math.PI * 2,
        dist: Math.random() * 0.9 + 0.1,
        speed: Math.random() * 0.015 + 0.008,
        length: Math.random() * 90 + 40,
        width: Math.random() * 2 + 1,
        color: Math.random() > 0.3 ? '#38bdf8' : '#e0f2fe',
        alpha: Math.random() * 0.85 + 0.15,
      });
    }

    // Expanding deceleration rings
    this.auraRings = [
      { radius: 0.1, maxR: 0.85, speed: 0.003, alpha: 0.9 },
      { radius: 0.35, maxR: 0.85, speed: 0.003, alpha: 0.7 },
      { radius: 0.6, maxR: 0.85, speed: 0.003, alpha: 0.5 },
    ];
  }

  activate() {
    this.intensity = 1.0;
    this.irisDilation = 0.2;
    this.negativeFlashTimer = 1.0; // Initial burst flash
  }

  deactivate() {
    this.intensity = 0;
  }

  update(dt) {
    if (this.intensity <= 0) return;

    this.time += dt * 0.018;

    // Pulse the iris
    this.irisDilation = 0.45 + Math.sin(this.time * 2.5) * 0.08;

    // Negative flash pulses every few seconds (sensory overload)
    if (this.negativeFlashTimer > 0) {
      this.negativeFlashTimer = Math.max(0, this.negativeFlashTimer - dt * 0.05);
    } else if (Math.random() < 0.006) {
      this.negativeFlashTimer = 0.45;
    }

    // Update information filaments rushing outwards
    for (const f of this.filaments) {
      f.dist += f.speed * dt * 1.8;
      f.angle += 0.003 * dt; // Slight spiral swirl
      if (f.dist > 1.2) {
        f.dist = 0.08 + Math.random() * 0.1;
        f.angle = Math.random() * Math.PI * 2;
      }
    }

    // Update aura rings
    for (const ring of this.auraRings) {
      ring.radius += ring.speed * dt;
      if (ring.radius > ring.maxR) {
        ring.radius = 0.05;
      }
    }
  }

  draw(ctx, width, height) {
    if (this.intensity <= 0) return;

    ctx.save();
    const cx = width / 2;
    const cy = height / 2;
    const maxDim = Math.max(width, height);

    // 1. Deep cosmic void backdrop
    const voidGrad = ctx.createRadialGradient(cx, cy, maxDim * 0.1, cx, cy, maxDim * 0.85);
    voidGrad.addColorStop(0, 'rgba(1, 3, 10, 0.92)');
    voidGrad.addColorStop(0.5, 'rgba(2, 6, 23, 0.95)');
    voidGrad.addColorStop(1, 'rgba(0, 0, 2, 0.98)');
    ctx.fillStyle = voidGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Gravitationally warped starfield
    for (const s of this.stars) {
      // Distance from center
      const sx = cx + s.baseX * width * 0.55;
      const sy = cy + s.baseY * height * 0.55;
      const d = Math.hypot(sx - cx, sy - cy);
      const minD = maxDim * 0.18;

      // Gravitational warp away/towards center
      let renderX = sx;
      let renderY = sy;
      if (d < minD * 2 && d > 10) {
        const factor = 1 + (minD / d) * 0.25;
        renderX = cx + (sx - cx) * factor;
        renderY = cy + (sy - cy) * factor;
      }

      const twinkle = Math.sin(this.time * s.twinkleSpeed + s.baseX * 10) * 0.4 + 0.6;
      ctx.fillStyle = `rgba(224, 242, 254, ${s.alpha * twinkle * this.intensity})`;
      ctx.beginPath();
      ctx.arc(renderX, renderY, s.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Spacetime Deceleration Aura Rings
    for (const ring of this.auraRings) {
      const r = ring.radius * maxDim * 0.8;
      const fade = clamp(1 - ring.radius / ring.maxR, 0, 1);
      ctx.strokeStyle = `rgba(56, 189, 248, ${fade * ring.alpha * 0.6 * this.intensity})`;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Outer delicate echo ring
      ctx.strokeStyle = `rgba(186, 230, 253, ${fade * ring.alpha * 0.3 * this.intensity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 4. Boundless Information Filaments (Data rushing at viewer)
    ctx.shadowBlur = 12;
    for (const f of this.filaments) {
      const currentR = f.dist * maxDim * 0.65;
      const prevR = Math.max(0, currentR - f.length);

      const x1 = cx + Math.cos(f.angle) * prevR;
      const y1 = cy + Math.sin(f.angle) * prevR;
      const x2 = cx + Math.cos(f.angle) * currentR;
      const y2 = cy + Math.sin(f.angle) * currentR;

      ctx.strokeStyle = f.color;
      ctx.shadowColor = f.color;
      ctx.lineWidth = f.width;
      ctx.globalAlpha = f.alpha * this.intensity;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // 5. Central Singularity & Cosmic Iris Accretion Disk (The Infinite Eye)
    const irisR = maxDim * 0.16 * this.irisDilation;

    // Swirling Accretion Disk Glow
    const accGrad = ctx.createRadialGradient(cx, cy, irisR * 0.6, cx, cy, irisR * 2.8);
    accGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    accGrad.addColorStop(0.2, 'rgba(125, 211, 252, 0.85)');
    accGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.55)');
    accGrad.addColorStop(0.8, 'rgba(14, 165, 233, 0.2)');
    accGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');

    ctx.fillStyle = accGrad;
    ctx.shadowBlur = 35;
    ctx.shadowColor = '#38bdf8';
    ctx.beginPath();
    ctx.arc(cx, cy, irisR * 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Swirling accretion filaments around the event horizon
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.time * 0.8);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const arcR = irisR * (1.2 + Math.sin(this.time * 2 + i) * 0.25);
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.7)' : 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, arcR, a, a + 0.6);
      ctx.stroke();
    }
    ctx.restore();

    // The Pure Black Event Horizon Core
    ctx.fillStyle = '#000000';
    ctx.shadowBlur = 24;
    ctx.shadowColor = 'rgba(56, 189, 248, 0.9)';
    ctx.beginPath();
    ctx.arc(cx, cy, irisR * 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Piercing central specular flare
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, irisR * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // 6. Negative Sensory Overload Flash (Iconic anime visual)
    if (this.negativeFlashTimer > 0) {
      const alpha = this.negativeFlashTimer;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.65})`;
      ctx.fillRect(0, 0, width, height);

      // Inversion pulse
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.8})`;
      ctx.lineWidth = 14;
      ctx.strokeRect(0, 0, width, height);
    }

    ctx.restore();
  }
}
