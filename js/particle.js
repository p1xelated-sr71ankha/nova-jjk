/**
 * NOVA — Particle Entity Module (Jujutsu Kaisen Enhanced)
 *
 * Encapsulates orbital dynamics, physics integration, gesture forces,
 * cursed technique responses (Infinity deceleration, Sukuna slash shearing),
 * and domain-specific particle realities (Infinite Void, Malevolent Shrine, etc.).
 */

import { CONFIG } from './config.js';
import { dist, wrapHue, hsvToRgb, clamp } from './math-utils.js';

export class Particle {
  /**
   * Constructs a particle star.
   * @param {number} x Initial screen X
   * @param {number} y Initial screen Y
   * @param {Object} opts
   */
  constructor(x, y, opts = {}) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;

    this.radius = opts.radius || CONFIG.PARTICLE_BASE_SIZE;
    this.type = opts.type || 'arm'; // 'core', 'arm', 'cluster', 'halo'
    this.baseHue = opts.baseHue ?? CONFIG.BASE_HUE;
    this.brightness = opts.brightness ?? 0.8;
    this.alpha = opts.alpha ?? 0.85;

    // Orbital state & home baseline
    this.angle = opts.angle || 0;
    this.orbitRadius = opts.orbitRadius || 100;
    this.orbitSpeed = opts.orbitSpeed || CONFIG.ROTATION_SPEED;
    this.flattening = opts.flattening || 0.75;

    this.homeX = opts.homeX ?? x;
    this.homeY = opts.homeY ?? y;
    this.homeAngle = opts.homeAngle ?? this.angle;
    this.homeRadius = opts.homeRadius ?? this.orbitRadius;

    this.life = opts.life || 1.0;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.pulseSpeed = 0.03 + Math.random() * 0.04;

    // JJK Domain & Technique states
    this.domainMode = null; // null | 'infinite_void' | 'malevolent_shrine' | 'chimera_shadow_garden' | 'self_embodiment'
    this.isSliced = false;
    this.sliceImpulseX = 0;
    this.sliceImpulseY = 0;
    this.inkRiseSpeed = 0.5 + Math.random() * 1.5;
  }

  /**
   * Advances orbital angle and applies spring force toward home orbit.
   * @param {number} cx Galaxy center X
   * @param {number} cy Galaxy center Y
   * @param {number} dt Normalized time step
   */
  updateOrbit(cx, cy, dt) {
    this.pulsePhase += this.pulseSpeed * dt;

    // Handle Domain-specific physics
    if (this.domainMode === 'infinite_void') {
      // Stream toward center into an infinite information horizon, then loop
      const dCenter = Math.hypot(cx - this.x, cy - this.y);
      if (dCenter > 20) {
        const pull = 0.8 / Math.max(dCenter * 0.01, 1);
        this.vx += ((cx - this.x) / dCenter) * pull * dt;
        this.vy += ((cy - this.y) / dCenter) * pull * dt;
      } else {
        // Warp outward in radial streams
        const outward = (Math.PI * 2 * Math.random());
        this.vx += Math.cos(outward) * 4;
        this.vy += Math.sin(outward) * 4;
      }
      return;
    }

    if (this.domainMode === 'malevolent_shrine') {
      // Drift like embers in a blood storm with horizontal cutting turbulence
      this.vx += (Math.random() - 0.5) * 0.6 * dt;
      this.vy += (Math.random() * 0.4 - 0.2) * dt;
      return;
    }

    if (this.domainMode === 'chimera_shadow_garden') {
      // Shadow ink rising upwards like fluid from floor
      this.vy -= this.inkRiseSpeed * dt;
      this.vx += Math.sin(this.pulsePhase) * 0.5 * dt;

      // Loop back to bottom when reaching upper screen
      if (this.y < 0) {
        this.y = window.innerHeight + Math.random() * 50;
        this.x = cx + (Math.random() - 0.5) * window.innerWidth * 0.8;
      }
      return;
    }

    // Normal Galaxy Physics: differential rotation & spring restoration
    this.angle += this.orbitSpeed * dt;

    const targetX = cx + this.homeRadius * Math.cos(this.angle);
    const targetY = cy + this.homeRadius * Math.sin(this.angle) * this.flattening;

    const kRestoration = this.type === 'core' ? 0.006 : 0.0025;
    const dx = targetX - this.x;
    const dy = targetY - this.y;

    this.vx += dx * kRestoration * dt;
    this.vy += dy * kRestoration * dt;

    const dCore = Math.hypot(cx - this.x, cy - this.y);
    if (dCore > 10) {
      const coreNormX = (cx - this.x) / dCore;
      const coreNormY = (cy - this.y) / dCore;
      this.vx += coreNormX * CONFIG.GRAVITY_TO_CORE * dt;
      this.vy += coreNormY * CONFIG.GRAVITY_TO_CORE * dt;
    }
  }

  /**
   * Applies Gojo's Limitless: Infinity deceleration barrier.
   * Particles slow down exponentially as they approach the hand and can never reach it.
   * @param {number} hx Hand X
   * @param {number} hy Hand Y
   * @param {number} barrierRadius
   */
  applyInfinityBarrier(hx, hy, barrierRadius = 240) {
    const d = dist(this.x, this.y, hx, hy);
    if (d < barrierRadius && d > 1) {
      // Zeno's paradox: speed scales down by (d / R)^2
      const ratio = clamp(d / barrierRadius, 0.02, 1.0);
      const damp = ratio * ratio;

      this.vx *= damp;
      this.vy *= damp;

      // Gentle repulsive barrier cushion at close proximity
      const push = (1 - ratio) * 1.5;
      const nx = (this.x - hx) / d;
      const ny = (this.y - hy) / d;
      this.vx += nx * push;
      this.vy += ny * push;
    }
  }

  /**
   * Slices particle if it lies within a Sukuna Dismantle cutting trajectory.
   * @param {number} x1 Slash start X
   * @param {number} y1 Slash start Y
   * @param {number} x2 Slash end X
   * @param {number} y2 Slash end Y
   */
  applySlashCut(x1, y1, x2, y2) {
    const slashDx = x2 - x1;
    const slashDy = y2 - y1;
    const slashLen = Math.hypot(slashDx, slashDy);
    if (slashLen < 5) return;

    // Perpendicular distance to slash line
    const cross = (this.x - x1) * slashDy - (this.y - y1) * slashDx;
    const pDist = Math.abs(cross) / slashLen;

    if (pDist < 28) {
      this.isSliced = true;
      // Normal vector pointing away from cut line
      const nx = -slashDy / slashLen;
      const ny = slashDx / slashLen;
      const side = cross >= 0 ? 1 : -1;
      const impulse = (28 - pDist) * 1.8;

      this.vx += nx * side * impulse;
      this.vy += ny * side * impulse;
    }
  }

  /**
   * Natural gesture interaction forces (pinch attraction or open repulsion).
   * @param {number} hx
   * @param {number} hy
   * @param {'pinch'|'open'|null} mode
   * @param {number} strength
   */
  applyInteraction(hx, hy, mode, strength = 1.0) {
    if (!mode) return;

    const d = dist(this.x, this.y, hx, hy);
    if (d >= CONFIG.INTERACTION_RADIUS || d < 2) return;

    const dx = hx - this.x;
    const dy = hy - this.y;
    const nx = dx / d;
    const ny = dy / d;

    const factor = 1 - d / CONFIG.INTERACTION_RADIUS;
    const falloff = factor * factor;

    if (mode === 'pinch') {
      const pull = CONFIG.PINCH_STRENGTH * falloff * CONFIG.VELOCITY_BOOST * strength;
      const swirl = pull * 0.35;
      this.vx += nx * pull - ny * swirl;
      this.vy += ny * pull + nx * swirl;
    } else if (mode === 'open') {
      const push = CONFIG.OPEN_STRENGTH * falloff * CONFIG.VELOCITY_BOOST * strength * 1.45;
      this.vx -= nx * push;
      this.vy -= ny * push;
    }
  }

  /**
   * Integrates velocity into position with friction damping.
   * @param {number} dt
   */
  integrate(dt) {
    const frictionFactor = Math.pow(CONFIG.FRICTION, dt);
    this.vx *= frictionFactor;
    this.vy *= frictionFactor;

    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  /**
   * Computes the particle color based on active Domain Expansion or normal galaxy.
   * @param {number} globalHueShift
   * @param {number} saturation
   * @returns {string} CSS rgb() color string
   */
  getColor(globalHueShift, saturation) {
    if (this.domainMode === 'infinite_void') {
      // Inverted monochrome with celestial cyan core
      const pulse = 0.5 + 0.5 * Math.sin(this.pulsePhase * 2);
      if (this.type === 'core') {
        return `rgb(240, 250, 255)`; // Blinding white
      }
      const v = Math.round(180 + pulse * 75);
      return `rgb(${Math.round(v * 0.8)}, ${v}, 255)`; // Ethereal cyan-white
    }

    if (this.domainMode === 'malevolent_shrine') {
      // Blood crimson, dark obsidian, fiery sparks
      const pulse = 0.7 + 0.3 * Math.sin(this.pulsePhase * 3);
      if (this.type === 'core') {
        return `rgb(255, 60, 40)`;
      }
      return `rgb(${Math.round(220 * pulse)}, ${Math.round(25 * pulse)}, ${Math.round(35 * pulse)})`;
    }

    if (this.domainMode === 'chimera_shadow_garden') {
      // Deep liquid shadow with glowing jade spirit eyes
      if (Math.random() < 0.05) {
        return `rgb(52, 211, 153)`; // Glowing jade eyes
      }
      return `rgb(12, 28, 22)`; // Obsidian ink
    }

    if (this.domainMode === 'self_embodiment') {
      // Transfigured soul pink and purple
      const [r, g, b] = hsvToRgb(320 + Math.sin(this.pulsePhase) * 20, 0.85, 0.9);
      return `rgb(${r}, ${g}, ${b})`;
    }

    if (this.type === 'core') {
      const pulse = 0.9 + 0.1 * Math.sin(this.pulsePhase);
      const [r, g, b] = CONFIG.CORE_COLOR;
      return `rgb(${Math.round(r * pulse)}, ${Math.round(g * pulse)}, ${Math.round(b * pulse)})`;
    }

    const finalHue = wrapHue(this.baseHue + globalHueShift);
    const value = clamp(this.brightness, 0.4, 1.0);
    const [r, g, b] = hsvToRgb(finalHue, saturation, value);
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Draws the particle on the canvas.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} baseAlpha
   * @param {number} globalHueShift
   * @param {number} saturation
   */
  draw(ctx, baseAlpha, globalHueShift, saturation) {
    ctx.fillStyle = this.getColor(globalHueShift, saturation);

    let currentRadius = this.radius;
    if (this.domainMode === 'infinite_void') {
      currentRadius *= 1.4;
    } else if (this.type === 'core') {
      currentRadius *= 1.0 + 0.2 * Math.sin(this.pulsePhase);
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
    ctx.fill();
  }
}
