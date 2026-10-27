/**
 * Malevolent Shrine Visual Effects Engine
 * Ryomen Sukuna's Canonical Domain Expansion
 *
 * Faithfully recreates the anime sequence:
 * - Blood-crimson twilight sky with atmospheric cursed cloud vortex
 * - Dark reflecting pool of blood with rippling surface waves
 * - Horned skull shrine silhouette towering in the center
 * - Relentless omnidirectional cutting barrage (Dismantle & Cleave)
 * - Sliced spatial displacement lines and floating blood ash embers
 */

import { clamp, randomRange } from '../math-utils.js';

export class MalevolentShrineFX {
  constructor() {
    this.time = 0;
    this.intensity = 0;
    this.slashes = [];
    this.embers = [];
    this.ripples = [];
    this.cleaveDisplacement = null;

    this.initEmbers();
  }

  initEmbers() {
    this.embers = [];
    for (let i = 0; i < 90; i++) {
      this.embers.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.001,
        vy: -Math.random() * 0.003 - 0.001,
        size: Math.random() * 2.8 + 1,
        alpha: Math.random() * 0.8 + 0.2,
      });
    }
  }

  activate() {
    this.intensity = 1.0;
    this.slashes = [];
    this.ripples = [];
    // Spawn initial dramatic burst of slashes
    for (let i = 0; i < 6; i++) {
      this.spawnSlash();
    }
  }

  deactivate() {
    this.intensity = 0;
    this.slashes = [];
  }

  spawnSlash() {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const h = typeof window !== 'undefined' ? window.innerHeight : 1080;

    // Angle of slash
    const angle = (Math.random() - 0.5) * Math.PI * 0.8 + (Math.random() > 0.5 ? 0 : Math.PI);
    const midX = w * (0.2 + Math.random() * 0.6);
    const midY = h * (0.2 + Math.random() * 0.6);
    const length = Math.max(w, h) * (0.7 + Math.random() * 0.6);

    const x1 = midX - Math.cos(angle) * length * 0.5;
    const y1 = midY - Math.sin(angle) * length * 0.5;
    const x2 = midX + Math.cos(angle) * length * 0.5;
    const y2 = midY + Math.sin(angle) * length * 0.5;

    this.slashes.push({
      x1, y1, x2, y2,
      progress: 0,
      speed: randomRange(0.08, 0.16),
      life: 1.0,
      decay: randomRange(0.03, 0.06),
      lineWidth: randomRange(2.5, 5.5),
      isCleave: Math.random() > 0.6, // Cleave has thicker heavy impact
    });

    // Randomly trigger spatial displacement cut
    if (Math.random() > 0.7) {
      this.cleaveDisplacement = {
        y: midY,
        offset: (Math.random() - 0.5) * 18,
        life: 0.2,
      };
    }
  }

  update(dt) {
    if (this.intensity <= 0) return;

    this.time += dt * 0.016;

    // Relentless slash barrage: continuously spawn slashes
    if (Math.random() < 0.35) {
      this.spawnSlash();
    }

    // Update active slashes
    for (let i = this.slashes.length - 1; i >= 0; i--) {
      const s = this.slashes[i];
      s.progress = Math.min(1.0, s.progress + s.speed * dt);
      s.life -= s.decay * dt;
      if (s.life <= 0) {
        this.slashes.splice(i, 1);
      }
    }

    // Update spatial displacement
    if (this.cleaveDisplacement) {
      this.cleaveDisplacement.life -= dt * 0.05;
      if (this.cleaveDisplacement.life <= 0) {
        this.cleaveDisplacement = null;
      }
    }

    // Update floating embers
    for (const emb of this.embers) {
      emb.x += emb.vx * dt;
      emb.y += emb.vy * dt;
      if (emb.y < 0) {
        emb.y = 1.0;
        emb.x = Math.random();
      }
    }
  }

  draw(ctx, width, height) {
    if (this.intensity <= 0) return;

    ctx.save();

    // 1. Apocalyptic Blood Sky & Crimson Fog
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, 'rgba(40, 2, 6, 0.96)');
    skyGrad.addColorStop(0.45, 'rgba(115, 8, 18, 0.92)');
    skyGrad.addColorStop(0.75, 'rgba(20, 0, 4, 0.95)');
    skyGrad.addColorStop(1, 'rgba(10, 0, 2, 0.98)');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Reflecting Pool of Blood (Lower 35%)
    const poolY = height * 0.65;
    const poolGrad = ctx.createLinearGradient(0, poolY, 0, height);
    poolGrad.addColorStop(0, 'rgba(60, 4, 10, 0.9)');
    poolGrad.addColorStop(0.5, 'rgba(25, 0, 4, 0.98)');
    poolGrad.addColorStop(1, 'rgba(5, 0, 1, 1)');
    ctx.fillStyle = poolGrad;
    ctx.fillRect(0, poolY, width, height - poolY);

    // Ripples on blood pool
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.lineWidth = 1.2;
    for (let r = 0; r < 5; r++) {
      const ry = poolY + (r + 1) * ((height - poolY) / 6);
      const wave = Math.sin(this.time * 2 + r) * 3;
      ctx.beginPath();
      ctx.moveTo(0, ry + wave);
      ctx.bezierCurveTo(width * 0.35, ry - wave, width * 0.65, ry + wave, width, ry - wave);
      ctx.stroke();
    }

    // 3. Demonic Horned Skull Shrine Silhouette in center
    this.drawShrineSilhouette(ctx, width, height, poolY);

    // 4. Floating Cursed Blood Embers
    for (const emb of this.embers) {
      const ex = emb.x * width;
      const ey = emb.y * height;
      ctx.fillStyle = `rgba(248, 113, 113, ${emb.alpha * this.intensity})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ef4444';
      ctx.beginPath();
      ctx.arc(ex, ey, emb.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // 5. Relentless Omnidirectional Cutting Planes (Dismantle & Cleave)
    for (const s of this.slashes) {
      const curX = s.x1 + (s.x2 - s.x1) * s.progress;
      const curY = s.y1 + (s.y2 - s.y1) * s.progress;

      // Outer Crimson Shockwave
      ctx.strokeStyle = `rgba(239, 68, 68, ${s.life * 0.9 * this.intensity})`;
      ctx.lineWidth = s.lineWidth * (s.isCleave ? 1.8 : 1.2);
      ctx.shadowBlur = 24;
      ctx.shadowColor = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(curX, curY);
      ctx.stroke();

      // Blinding White Core Razor Blade
      ctx.strokeStyle = `rgba(255, 255, 255, ${s.life * this.intensity})`;
      ctx.lineWidth = s.isCleave ? 2.5 : 1.5;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(curX, curY);
      ctx.stroke();
    }

    // 6. Spatial Cleave Displacement Line (Screen Splitting Effect)
    if (this.cleaveDisplacement && this.cleaveDisplacement.life > 0) {
      const cd = this.cleaveDisplacement;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(0, cd.y);
      ctx.lineTo(width, cd.y + cd.offset);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Draws the stylized Japanese torii / skull Buddhist shrine silhouette.
   */
  drawShrineSilhouette(ctx, width, height, baseLine) {
    ctx.save();
    const cx = width / 2;
    const shrineW = Math.min(width * 0.45, 380);
    const shrineH = shrineW * 0.85;
    const topY = baseLine - shrineH;

    ctx.fillStyle = 'rgba(10, 1, 3, 0.92)';
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(185, 28, 28, 0.6)';

    // Main Gable Roof (Pagoda curves)
    ctx.beginPath();
    ctx.moveTo(cx - shrineW * 0.6, topY + shrineH * 0.35);
    ctx.quadraticCurveTo(cx - shrineW * 0.3, topY + shrineH * 0.25, cx, topY + shrineH * 0.15);
    ctx.quadraticCurveTo(cx + shrineW * 0.3, topY + shrineH * 0.25, cx + shrineW * 0.6, topY + shrineH * 0.35);
    ctx.lineTo(cx + shrineW * 0.45, topY + shrineH * 0.45);
    ctx.lineTo(cx - shrineW * 0.45, topY + shrineH * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Central Horned Crest (Bull Skull Crown)
    ctx.beginPath();
    ctx.moveTo(cx, topY);
    ctx.quadraticCurveTo(cx - shrineW * 0.18, topY - shrineH * 0.15, cx - shrineW * 0.25, topY - shrineH * 0.22);
    ctx.quadraticCurveTo(cx - shrineW * 0.12, topY - shrineH * 0.05, cx, topY + shrineH * 0.15);
    ctx.quadraticCurveTo(cx + shrineW * 0.12, topY - shrineH * 0.05, cx + shrineW * 0.25, topY - shrineH * 0.22);
    ctx.quadraticCurveTo(cx + shrineW * 0.18, topY - shrineH * 0.15, cx, topY);
    ctx.fill();
    ctx.stroke();

    // Massive Pillars
    const pW = shrineW * 0.08;
    ctx.fillRect(cx - shrineW * 0.32, topY + shrineH * 0.45, pW, shrineH * 0.55);
    ctx.fillRect(cx + shrineW * 0.32 - pW, topY + shrineH * 0.45, pW, shrineH * 0.55);
    ctx.strokeRect(cx - shrineW * 0.32, topY + shrineH * 0.45, pW, shrineH * 0.55);
    ctx.strokeRect(cx + shrineW * 0.32 - pW, topY + shrineH * 0.45, pW, shrineH * 0.55);

    // Ominous Glowing Red Altar Eye
    ctx.fillStyle = '#ef4444';
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#ef4444';
    ctx.beginPath();
    ctx.arc(cx, topY + shrineH * 0.55, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
