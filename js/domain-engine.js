/**
 * Jujutsu Kaisen Domain Expansion Engine
 *
 * Coordinates canonical Domain Expansion lifecycles:
 * - Gojo's Infinite Void
 * - Sukuna's Malevolent Shrine
 * - Megumi's Chimera Shadow Garden
 * - Mahito's Self-Embodiment of Perfection
 * - Hakari's Idle Death Gamble
 * - Yuta's Authentic Mutual Love
 *
 * Synchronizes character-specific anime visual engines, screen rumble,
 * dimensional shatter, and procedural audio cues.
 */

import { CONFIG } from './config.js';
import { soundEngine } from './audio-synthesizer.js';
import { InfiniteVoidFX } from './vfx/infinite-void-fx.js';
import { MalevolentShrineFX } from './vfx/malevolent-shrine-fx.js';
import { ChimeraShadowFX } from './vfx/chimera-shadow-fx.js';
import { SelfEmbodimentFX } from './vfx/self-embodiment-fx.js';

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

    // Character-Specific Anime Visual Effect Engines
    this.vfx = {
      infinite_void: new InfiniteVoidFX(),
      malevolent_shrine: new MalevolentShrineFX(),
      chimera_shadow_garden: new ChimeraShadowFX(),
      self_embodiment_of_perfection: new SelfEmbodimentFX(),
      self_embodiment: new SelfEmbodimentFX(),
      idle_death_gamble: new InfiniteVoidFX(), // Gambler variant
      authentic_mutual_love: new SelfEmbodimentFX(), // Love thread variant
    };

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
   * Activates a Domain Expansion with anime visual effects, screen rumble, and dimensional shatter.
   * @param {string} domainId
   */
  activateDomain(domainId) {
    const domain = Object.values(CONFIG.DOMAINS).find((d) => d.id === domainId);
    if (!domain) return;

    // Deactivate any currently active domain VFX
    this.deactivateAllVFX();

    this.activeDomain = domain;
    this.phase = 'SHATTER';
    this.phaseTimer = 0;
    this.screenShake = 24; // High-impact screen rumble
    this.shatterAlpha = 1.0;

    // Activate the specific anime visual engine
    if (this.vfx[domain.id]) {
      this.vfx[domain.id].activate();
    }

    // Generate cracked glass fracture lines radiating from center
    this.generateShatterLines();

    // Trigger dimensional fracture audio
    soundEngine.playDomainShatter();
    soundEngine.setCursedHum(0);

    // Optional: Play local video file if present
    if (this.videoEngine) {
      this.videoEngine.playDomainVideo(domain.id);
    }

    if (this.onDomainChange) {
      this.onDomainChange(domain);
    }
  }

  deactivateAllVFX() {
    for (const fx of Object.values(this.vfx)) {
      if (fx && fx.deactivate) {
        fx.deactivate();
      }
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

    const radialCount = 16;
    for (let i = 0; i < radialCount; i++) {
      const angle = (i / radialCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const length = Math.max(w, h) * 0.85;
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
   * Dismisses the active Domain Expansion and restores idle cursed atmosphere.
   */
  dismissDomain() {
    if (!this.activeDomain) return;

    this.deactivateAllVFX();
    this.activeDomain = null;
    this.phase = 'IDLE';
    this.cursedEnergy = 0;
    this.screenShake = 12;

    if (this.videoEngine) {
      this.videoEngine.playIdleVideo();
    }

    if (this.onDomainChange) {
      this.onDomainChange(null);
    }
  }

  /**
   * Updates domain state machine and active anime VFX engines per frame.
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

    // Update active anime VFX engine
    if (this.activeDomain && this.vfx[this.activeDomain.id]) {
      this.vfx[this.activeDomain.id].update(dt);
    }
  }

  /**
   * Draws the active domain's anime visual effect onto the canvas.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} width
   * @param {number} height
   */
  drawDomain(ctx, width, height) {
    if (this.activeDomain && this.vfx[this.activeDomain.id]) {
      this.vfx[this.activeDomain.id].draw(ctx, width, height);
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
    ctx.shadowBlur = 14;
    ctx.shadowColor = 'rgba(56, 189, 248, 0.85)';

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
