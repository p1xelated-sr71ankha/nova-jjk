/**
 * NOVA — Jujutsu Kaisen Domain Expansion Engine (Video Driven)
 *
 * Coordinates canonical Domain Expansion lifecycles:
 * - Gojo's Infinite Void (無量空処)
 * - Sukuna's Malevolent Shrine (伏魔御廚子)
 * - Megumi's Chimera Shadow Garden (嵌合暗翳庭)
 * - Mahito's Self-Embodiment of Perfection (自閉円頓裹)
 *
 * Synchronizes video playback, dimensional glass fractures,
 * screen rumble, and audio cues.
 */

import { CONFIG } from './config.js';
import { soundEngine } from './audio-synthesizer.js';

export class DomainEngine {
  /**
   * @param {import('./video-engine.js').VideoEngine} videoEngine
   * @param {(domain: Object|null) => void} onDomainChange Callback for UI banner updates
   */
  constructor(videoEngine, onDomainChange) {
    this.videoEngine = videoEngine;
    this.onDomainChange = onDomainChange;

    this.activeDomain = null;
    this.phase = 'IDLE'; // 'IDLE' | 'CHANT' | 'SHATTER' | 'ACTIVE' | 'COLLAPSE'
    this.phaseTimer = 0;
    this.screenShake = 0;

    // Dimensional glass fracture shard coordinates
    this.shatterLines = [];
    this.shatterAlpha = 0;

    // Cursed energy accumulation
    this.cursedEnergy = 0;
    this.targetMudra = null;
  }

  /**
   * Starts channeling cursed energy for a specific domain mudra.
   * @param {string} domainKey
   * @param {number} dt Normalized time
   */
  channelMudra(domainKey, dt) {
    if (this.phase === 'ACTIVE' || this.phase === 'SHATTER') return;

    const domainConfig = Object.values(CONFIG.DOMAINS).find(
      (d) => d.id === domainKey || d.id === domainKey.toLowerCase()
    );
    if (!domainConfig) return;

    this.targetMudra = domainConfig;
    this.cursedEnergy += (CONFIG.CURSED_ENERGY.CHARGE_RATE * dt) / 60;
    soundEngine.setCursedHum(this.cursedEnergy / CONFIG.CURSED_ENERGY.MAX);

    if (this.cursedEnergy >= CONFIG.CURSED_ENERGY.ACTIVATION_THRESHOLD && this.phase === 'IDLE') {
      this.activateDomain(domainConfig.id);
    }
  }

  /**
   * Decays cursed energy when mudra is released.
   * @param {number} dt
   */
  decayEnergy(dt) {
    if (this.phase === 'IDLE' && this.cursedEnergy > 0) {
      this.cursedEnergy = Math.max(0, this.cursedEnergy - (CONFIG.CURSED_ENERGY.DECAY_RATE * dt) / 60);
      soundEngine.setCursedHum(this.cursedEnergy / CONFIG.CURSED_ENERGY.MAX);
    }
  }

  /**
   * Activates a Domain Expansion with full dimensional shatter and video transition.
   * @param {string} domainId
   */
  activateDomain(domainId) {
    const domain = Object.values(CONFIG.DOMAINS).find((d) => d.id === domainId);
    if (!domain) return;

    this.activeDomain = domain;
    this.phase = 'SHATTER';
    this.phaseTimer = 0;
    this.screenShake = 22; // High-impact screen rumble
    this.shatterAlpha = 1.0;

    // Generate random cracked glass fracture lines radiating from center
    this.generateShatterLines();

    // Trigger dimensional fracture audio
    soundEngine.playDomainShatter();
    soundEngine.setCursedHum(0);

    // Transition background to the specific domain anime video!
    if (this.videoEngine) {
      this.videoEngine.playDomainVideo(domain.id);
    }

    if (this.onDomainChange) {
      this.onDomainChange(domain);
    }
  }

  /**
   * Generates procedural cracked glass polygon geometry.
   */
  generateShatterLines() {
    this.shatterLines = [];
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;

    const radialCount = 14;
    for (let i = 0; i < radialCount; i++) {
      const angle = (i / radialCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const length = Math.max(w, h) * 0.8;
      const ex = cx + Math.cos(angle) * length;
      const ey = cy + Math.sin(angle) * length;

      const nodes = [{ x: cx, y: cy }];
      const segments = 4;
      for (let s = 1; s <= segments; s++) {
        const t = s / segments;
        nodes.push({
          x: cx + (ex - cx) * t + (Math.random() - 0.5) * 45,
          y: cy + (ey - cy) * t + (Math.random() - 0.5) * 45,
        });
      }
      this.shatterLines.push(nodes);
    }
  }

  /**
   * Dismisses the active Domain Expansion and restores idle background atmosphere.
   */
  dismissDomain() {
    if (!this.activeDomain) return;

    this.activeDomain = null;
    this.phase = 'IDLE';
    this.cursedEnergy = 0;
    this.screenShake = 10;

    // Return video to idle staging background
    if (this.videoEngine) {
      this.videoEngine.playIdleVideo();
    }

    if (this.onDomainChange) {
      this.onDomainChange(null);
    }
  }

  /**
   * Updates domain state machine and animations per frame.
   * @param {number} dt Normalized time (~1.0 at 60 FPS)
   */
  update(dt) {
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - 0.6 * dt);
    }

    if (this.phase === 'SHATTER') {
      this.phaseTimer += dt * 16.67;
      this.shatterAlpha = Math.max(0, 1.0 - this.phaseTimer / 800);

      if (this.phaseTimer >= 800) {
        this.phase = 'ACTIVE';
        this.phaseTimer = 0;
      }
    } else if (this.phase === 'ACTIVE') {
      this.phaseTimer += dt * 16.67;
      if (this.activeDomain && this.phaseTimer >= this.activeDomain.duration) {
        this.dismissDomain();
      }
    }
  }

  /**
   * Draws the dimensional glass fracture overlay.
   * @param {CanvasRenderingContext2D} ctx
   */
  drawShatter(ctx) {
    if (this.shatterAlpha <= 0.01) return;

    ctx.save();
    ctx.strokeStyle = `rgba(255, 255, 255, ${this.shatterAlpha})`;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';

    for (const nodes of this.shatterLines) {
      ctx.beginPath();
      ctx.moveTo(nodes[0].x, nodes[0].y);
      for (let i = 1; i < nodes.length; i++) {
        ctx.lineTo(nodes[i].x, nodes[i].y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
}
