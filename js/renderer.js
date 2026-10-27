/**
 * NOVA — Visual Effects & Overlay Renderer (Video-Driven Architecture)
 *
 * Renders hardware-accelerated overlays transparently over the full-screen anime video:
 * - Dimensional glass fracture shards (Domain Expansion shatter)
 * - Sukuna's razor-sharp cutting planes (Dismantle & Cleave)
 * - Gojo's Limitless Infinity shield & Hollow Purple sphere
 * - Dynamic screen rumble / camera shake
 * - Dual-hand cursor reticles and gesture tracking feedback
 */

import { clamp } from './math-utils.js';

export class Renderer {
  /**
   * @param {HTMLCanvasElement} canvas Transparent VFX canvas overlay
   * @param {import('./domain-engine.js').DomainEngine} [domainEngine]
   * @param {import('./techniques.js').TechniqueEngine} [techniqueEngine]
   */
  constructor(canvas, domainEngine = null, techniqueEngine = null) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.domainEngine = domainEngine;
    this.techniqueEngine = techniqueEngine;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.handState = {
      active: false,
      handsCount: 0,
      x: 0.5,
      y: 0.5,
      mode: null,
      jjk: {},
    };

    this.ripplePhase = 0;
    this.resize(this.width, this.height);
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  setInteraction(state) {
    this.handState = state;
  }

  /**
   * Draws a complete visual effects frame transparently over the video player.
   * @param {number} dt Normalized time step
   */
  draw(dt) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Clear previous overlay frame
    ctx.clearRect(0, 0, w, h);

    ctx.save();

    // 1. Apply Screen Shake / Camera Rumble during Domain Shatter
    if (this.domainEngine && this.domainEngine.screenShake > 0) {
      const s = this.domainEngine.screenShake;
      const shakeX = (Math.random() - 0.5) * s;
      const shakeY = (Math.random() - 0.5) * s;
      ctx.translate(shakeX, shakeY);
    }

    // 2. Active Cursed Technique Overlays (Slashes, Purple, Infinity)
    if (this.techniqueEngine) {
      this.techniqueEngine.update(dt);
      this.techniqueEngine.draw(ctx);
    }

    // 3. Dimensional Glass Fracture Overlay (Domain Shatter)
    if (this.domainEngine) {
      this.domainEngine.update(dt);
      this.domainEngine.drawShatter(ctx);
    }

    // 4. Hand Cursor & Gesture Visual Feedback
    this.drawHandCursor(ctx, dt);

    ctx.restore();
  }

  /**
   * Renders real-time hand cursor reticles and feedback.
   */
  drawHandCursor(ctx, dt) {
    if (!this.handState.active) return;

    const hx = this.handState.x * this.width;
    const hy = this.handState.y * this.height;
    const mode = this.handState.mode;

    let cursorColor = '#7dd3fc';
    let glowColor = 'rgba(125, 211, 252, 0.4)';

    // Gold when canonical JJK mudra is detected and channeling
    if (this.handState.jjk && this.handState.jjk.detectedDomain) {
      cursorColor = '#f59e0b';
      glowColor = 'rgba(245, 158, 11, 0.7)';
    } else if (mode === 'pinch') {
      cursorColor = '#fb7185';
      glowColor = 'rgba(251, 113, 133, 0.6)';
    } else if (mode === 'open') {
      cursorColor = '#34d399';
      glowColor = 'rgba(52, 211, 153, 0.6)';
    }

    // Concentric expanding shockwave on open palm
    if (mode === 'open') {
      this.ripplePhase = (this.ripplePhase + 2.5 * dt) % 75;
      for (let r = 0; r < 2; r++) {
        const currentR = (this.ripplePhase + r * 30) % 75;
        const alpha = clamp(1 - currentR / 75, 0, 0.85);

        ctx.beginPath();
        ctx.arc(hx, hy, currentR + 10, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(52, 211, 153, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Inward vortex reticle on pinch
    if (mode === 'pinch') {
      this.ripplePhase = (this.ripplePhase + 3 * dt) % 60;
      const vortexR = 40 - (this.ripplePhase % 35);
      const alpha = clamp(vortexR / 40, 0, 0.8);

      ctx.beginPath();
      ctx.arc(hx, hy, Math.max(5, vortexR), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(251, 113, 133, ${alpha})`;
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }

    // Outer reticle ring
    ctx.beginPath();
    ctx.arc(hx, hy, 16, 0, Math.PI * 2);
    ctx.strokeStyle = cursorColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Central cursor node
    ctx.shadowBlur = 14;
    ctx.shadowColor = glowColor;
    ctx.beginPath();
    ctx.arc(hx, hy, 6, 0, Math.PI * 2);
    ctx.fillStyle = cursorColor;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
