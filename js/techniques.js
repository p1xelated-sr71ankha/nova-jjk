/**
 * Jujutsu Kaisen Signature Moves & Cursed Techniques
 *
 * Implements canonical abilities:
 * - Gojo Satoru: Limitless Infinity Barrier, Lapse: Blue, Reversal: Red, Hollow Purple
 * - Ryomen Sukuna: Dismantle & Cleave Slices, Furnace: Fire Arrow (Fūga)
 * - Aoi Todo: Boogie Woogie Clap (Instantaneous Spatial Transposition)
 */

import { soundEngine } from './audio-synthesizer.js';
import { TechniquesFX } from './vfx/techniques-fx.js';

export class TechniqueEngine {
  /**
   * @param {import('./video-engine.js').VideoEngine} [videoEngine]
   */
  constructor(videoEngine = null) {
    this.videoEngine = videoEngine;
    this.fx = new TechniquesFX();
    this.slashes = []; // Sukuna instant slashes
  }

  /**
   * Activates Gojo's Limitless: Infinity shield.
   * @param {number} hx Screen X
   * @param {number} hy Screen Y
   */
  activateInfinity(hx, hy) {
    this.fx.activateInfinity(hx, hy);
    soundEngine.playInfinityShield();
  }

  /**
   * Executes Gojo's Cursed Technique Lapse: Blue.
   * @param {number} hx
   * @param {number} hy
   */
  executeBlue(hx, hy) {
    this.fx.triggerBlue(hx, hy);
    soundEngine.setCursedHum(0.9);
    setTimeout(() => soundEngine.setCursedHum(0), 450);
  }

  /**
   * Executes Gojo's Cursed Technique Reversal: Red.
   * @param {number} hx
   * @param {number} hy
   */
  executeRed(hx, hy) {
    this.fx.triggerRed(hx, hy);
    soundEngine.playDomainShatter();
  }

  /**
   * Fires Gojo's Hollow Technique: Purple.
   * Collides Blue and Red into violet spatial erasure projectile.
   */
  fireHollowPurple(startX = 120, startY = null) {
    this.fx.firePurple(startX, startY);
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

    const startX = x1 ?? (w * 0.12);
    const startY = y1 ?? (h * 0.22);
    const endX = x2 ?? (w * 0.88);
    const endY = y2 ?? (h * 0.78);

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
   * Executes Sukuna's Furnace Fire Arrow (Fūga).
   */
  executeFireArrow(cx = null, cy = null) {
    this.fx.fireFurnaceArrow(cx, cy);
    soundEngine.playFireArrow();
  }

  /**
   * Executes Aoi Todo's Boogie Woogie (Clap Transposition).
   * Triggers split-second monochrome flash, coordinate warp, and radiating manga speed lines!
   */
  executeBoogieWoogie(cx = null, cy = null) {
    soundEngine.playClap();
    this.fx.triggerBoogieWoogie(cx, cy);

    if (this.videoEngine) {
      this.videoEngine.playTechniqueVideo('boogie_woogie');
    }
  }

  /**
   * Updates active technique physics and animations per frame.
   * @param {number} dt Normalized time step
   */
  update(dt) {
    this.fx.update(dt);

    // Update instant slashes
    for (let i = this.slashes.length - 1; i >= 0; i--) {
      const s = this.slashes[i];
      s.alpha -= 0.045 * dt;
      if (s.alpha <= 0) {
        this.slashes.splice(i, 1);
      }
    }
  }

  /**
   * Renders technique visuals onto canvas.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    // 1. Draw FX module
    this.fx.draw(ctx);

    // 2. Sukuna Instant Slashes
    if (this.slashes.length > 0) {
      ctx.save();
      for (const s of this.slashes) {
        ctx.strokeStyle = `rgba(239, 68, 68, ${s.alpha})`;
        ctx.lineWidth = 4.5;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ef4444';

        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 255, 255, ${s.alpha * 0.95})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
}
