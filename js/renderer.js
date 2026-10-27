/**
 * Jujutsu Kaisen Visual Effects & Overlay Renderer
 *
 * Composites 60 FPS real-time anime visual effect layers:
 * - Character-specific Domain Expansions (Infinite Void, Malevolent Shrine, Chimera Shadow, Self-Embodiment)
 * - Cursed Technique Overlays (Hollow Purple, Fire Arrow, Boogie Woogie, Slashes)
 * - Dimensional glass fracture shards
 * - Dynamic camera rumble / screen shake
 * - Dual-hand cursor reticles and cursed aura ink trails
 */

import { clamp } from './math-utils.js';

export class Renderer {
  /**
   * @param {HTMLCanvasElement} canvas
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
    this.cursorTrail = [];
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

    if (state.active) {
      const hx = state.x * this.width;
      const hy = state.y * this.height;
      this.cursorTrail.push({ x: hx, y: hy, life: 1.0 });
      if (this.cursorTrail.length > 18) this.cursorTrail.shift();

      // If Chimera Shadow Garden is active, feed ink drip
      if (this.domainEngine && this.domainEngine.activeDomain && this.domainEngine.activeDomain.id === 'chimera_shadow_garden') {
        const shadowFX = this.domainEngine.vfx.chimera_shadow_garden;
        if (shadowFX) shadowFX.addHandInkTrail(hx, hy);
      }
    }
  }

  /**
   * Draws a complete visual effects frame.
   * @param {number} dt Normalized time step
   */
  draw(dt) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Clear previous overlay frame
    ctx.clearRect(0, 0, w, h);

    ctx.save();

    // 1. Screen Shake / Camera Rumble during Domain Shatter
    if (this.domainEngine && this.domainEngine.screenShake > 0) {
      const s = this.domainEngine.screenShake;
      const shakeX = (Math.random() - 0.5) * s;
      const shakeY = (Math.random() - 0.5) * s;
      ctx.translate(shakeX, shakeY);
    }

    // 2. Character-Specific Anime Domain Expansion Simulation
    if (this.domainEngine) {
      this.domainEngine.update(dt);
      this.domainEngine.drawDomain(ctx, w, h);
    }

    // 3. Active Cursed Technique Overlays (Purple, Fire Arrow, Boogie Woogie, Slashes)
    if (this.techniqueEngine) {
      this.techniqueEngine.update(dt);
      this.techniqueEngine.draw(ctx);
    }

    // 4. Dimensional Glass Fracture Overlay (Domain Shatter)
    if (this.domainEngine) {
      this.domainEngine.drawShatter(ctx);
    }

    // 5. Hand Cursor & Cursed Energy Trail Feedback
    this.drawHandCursor(ctx, dt);

    ctx.restore();
  }

  /**
   * Renders real-time hand cursor reticle and stylized cursed aura ink trail.
   */
  drawHandCursor(ctx, dt) {
    // Draw fading cursed ink trail
    for (let i = this.cursorTrail.length - 1; i >= 0; i--) {
      const t = this.cursorTrail[i];
      t.life -= 0.05 * dt;
      if (t.life <= 0) {
        this.cursorTrail.splice(i, 1);
        continue;
      }
      ctx.fillStyle = `rgba(56, 189, 248, ${t.life * 0.4})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#38bdf8';
      ctx.beginPath();
      ctx.arc(t.x, t.y, 4 * t.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    if (!this.handState.active) return;

    const hx = this.handState.x * this.width;
    const hy = this.handState.y * this.height;
    const mode = this.handState.mode;

    let cursorColor = '#7dd3fc';
    let glowColor = 'rgba(125, 211, 252, 0.4)';

    // Gold when canonical JJK mudra is detected and channeling
    if (this.handState.jjk && this.handState.jjk.detectedDomain) {
      cursorColor = '#f59e0b';
      glowColor = 'rgba(245, 158, 11, 0.75)';
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
