/**
 * NOVA — Jujutsu Kaisen Signature Moves & Cursed Techniques (Video Enhanced)
 *
 * Implements real-time abilities with video triggers:
 * - Gojo Satoru: Infinity Barrier, Lapse: Blue, Reversal: Red, Hollow Purple
 * - Ryomen Sukuna: Dismantle & Cleave (Screen Cutting), Furnace: Fire Arrow
 * - Aoi Todo: Boogie Woogie (Clap Transposition Video & Sound)
 */

import { soundEngine } from './audio-synthesizer.js';
import { dist, clamp } from './math-utils.js';

export class TechniqueEngine {
  /**
   * @param {import('./video-engine.js').VideoEngine} [videoEngine]
   */
  constructor(videoEngine = null) {
    this.videoEngine = videoEngine;

    // Active visual technique overlays
    this.slashes = [];
    this.purpleSphere = null;
    this.fireArrow = null;
    this.infinityAura = null;
    this.boogieFlash = 0;
  }

  /**
   * Activates Gojo's Limitless: Infinity shield.
   * @param {number} hx Screen X
   * @param {number} hy Screen Y
   */
  activateInfinity(hx, hy) {
    this.infinityAura = { x: hx, y: hy, radius: 180, life: 1.0 };
    soundEngine.playInfinityShield();
  }

  /**
   * Executes Gojo's Cursed Technique Lapse: Blue.
   * @param {number} hx
   * @param {number} hy
   */
  executeBlue(hx, hy) {
    soundEngine.setCursedHum(0.8);
    setTimeout(() => soundEngine.setCursedHum(0), 400);
  }

  /**
   * Executes Gojo's Cursed Technique Reversal: Red.
   * @param {number} hx
   * @param {number} hy
   */
  executeRed(hx, hy) {
    soundEngine.playDomainShatter();
  }

  /**
   * Fires Gojo's Hollow Technique: Purple.
   * Plays the anime clip and renders the spatial erasure projectile.
   */
  fireHollowPurple() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.purpleSphere = {
      x: 0,
      y: h / 2,
      vx: 18,
      vy: 0,
      radius: 65,
      active: true,
    };

    soundEngine.playHollowPurple();

    if (this.videoEngine) {
      this.videoEngine.playTechniqueVideo('purple');
    }
  }

  /**
   * Executes Sukuna's Dismantle & Cleave (Slicing Trajectory across screen).
   * @param {number} [x1]
   * @param {number} [y1]
   * @param {number} [x2]
   * @param {number} [y2]
   */
  executeDismantle(x1, y1, x2, y2) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const startX = x1 ?? (w * 0.15);
    const startY = y1 ?? (h * 0.25);
    const endX = x2 ?? (w * 0.85);
    const endY = y2 ?? (h * 0.75);

    this.slashes.push({
      x1: startX,
      y1: startY,
      x2: endX,
      y2: endY,
      alpha: 1.0,
      life: 1.0,
    });

    soundEngine.playSlash();
  }

  /**
   * Executes Sukuna's Furnace Fire Arrow (「開」 - Fūga).
   */
  executeFireArrow() {
    this.fireArrow = {
      x: window.innerWidth * 0.1,
      y: window.innerHeight * 0.8,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2,
      progress: 0,
      active: true,
    };

    soundEngine.playFireArrow();
  }

  /**
   * Executes Aoi Todo's Boogie Woogie (Clap Transposition).
   * Triggers the anime clap clip, sound, and screen glitch flash!
   */
  executeBoogieWoogie() {
    soundEngine.playClap();
    this.boogieFlash = 1.0;

    if (this.videoEngine) {
      this.videoEngine.playTechniqueVideo('boogie_woogie');
    }
  }

  /**
   * Updates active technique physics and animations per frame.
   * @param {number} dt Normalized time step
   */
  update(dt) {
    // 1. Update Sukuna Slashes
    for (let i = this.slashes.length - 1; i >= 0; i--) {
      const s = this.slashes[i];
      s.alpha -= 0.04 * dt;
      if (s.alpha <= 0) {
        this.slashes.splice(i, 1);
      }
    }

    // 2. Update Boogie Woogie screen flash
    if (this.boogieFlash > 0) {
      this.boogieFlash = Math.max(0, this.boogieFlash - 0.08 * dt);
    }

    // 3. Update Infinity Shield aura
    if (this.infinityAura) {
      this.infinityAura.life -= 0.03 * dt;
      if (this.infinityAura.life <= 0) {
        this.infinityAura = null;
      }
    }

    // 4. Update Hollow Purple Projectile
    if (this.purpleSphere && this.purpleSphere.active) {
      const s = this.purpleSphere;
      s.x += s.vx * dt;
      s.y += s.vy * dt;

      if (s.x > window.innerWidth + 100) {
        this.purpleSphere = null;
      }
    }

    // 5. Update Fire Arrow
    if (this.fireArrow && this.fireArrow.active) {
      const fa = this.fireArrow;
      fa.progress += 0.035 * dt;

      if (fa.progress >= 1.0) {
        this.fireArrow = null;
      }
    }
  }

  /**
   * Renders technique visuals onto transparent canvas overlay.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    // 1. Boogie Woogie Glitch Flash
    if (this.boogieFlash > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${this.boogieFlash * 0.4})`;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.restore();
    }

    // 2. Sukuna Slashes (Crimson cutting lines across video)
    if (this.slashes.length > 0) {
      ctx.save();
      for (const s of this.slashes) {
        ctx.strokeStyle = `rgba(239, 68, 68, ${s.alpha})`;
        ctx.lineWidth = 4;
        ctx.shadowBlur = 16;
        ctx.shadowColor = '#ef4444';

        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 255, 255, ${s.alpha * 0.9})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3. Gojo's Infinity Shield Barrier
    if (this.infinityAura) {
      ctx.save();
      const a = this.infinityAura;
      ctx.strokeStyle = `rgba(56, 189, 248, ${a.life * 0.7})`;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#38bdf8';

      ctx.beginPath();
      ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Gojo's Hollow Technique: Purple Projectile
    if (this.purpleSphere && this.purpleSphere.active) {
      const s = this.purpleSphere;
      ctx.save();

      const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius * 1.5);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      grad.addColorStop(0.35, 'rgba(192, 132, 252, 0.95)');
      grad.addColorStop(0.7, 'rgba(147, 51, 234, 0.6)');
      grad.addColorStop(1, 'rgba(147, 51, 234, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Violet lightning crackles
      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const ang = Math.random() * Math.PI * 2;
        const r1 = s.radius * 0.5;
        const r2 = s.radius * 1.4;
        ctx.beginPath();
        ctx.moveTo(s.x + Math.cos(ang) * r1, s.y + Math.sin(ang) * r1);
        ctx.lineTo(s.x + Math.cos(ang) * r2, s.y + Math.sin(ang) * r2);
        ctx.stroke();
      }

      ctx.restore();
    }

    // 5. Sukuna's Fire Arrow
    if (this.fireArrow && this.fireArrow.active) {
      const fa = this.fireArrow;
      const curX = fa.x + (fa.targetX - fa.x) * fa.progress;
      const curY = fa.y + (fa.targetY - fa.y) * fa.progress;

      ctx.save();
      ctx.fillStyle = '#f59e0b';
      ctx.shadowBlur = 24;
      ctx.shadowColor = '#ef4444';

      ctx.beginPath();
      ctx.arc(curX, curY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
