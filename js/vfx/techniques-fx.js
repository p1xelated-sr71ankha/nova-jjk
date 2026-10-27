/**
 * Jujutsu Kaisen Signature Techniques Visual Effects Engine
 *
 * Implements anime-accurate real-time VFX:
 * - Hollow Technique: Purple (Blue + Red fusion, violent violet erasure projectile, branching lightning)
 * - Furnace: Fire Arrow (Fūga plasma bow draw & thermobaric solar fireball)
 * - Boogie Woogie (Monochrome flash, spatial flip, dynamic manga speed lines, gold sparks)
 * - Limitless: Infinity (Spacetime ripple refraction shield)
 * - Lapse: Blue & Reversal: Red (Gravitational vortex & repulsive shockwave)
 */

import { clamp, randomRange } from '../math-utils.js';

function getDims() {
  return {
    w: typeof window !== 'undefined' ? window.innerWidth : 1920,
    h: typeof window !== 'undefined' ? window.innerHeight : 1080,
  };
}

export class TechniquesFX {
  constructor() {
    this.hollowPurple = null;
    this.fireArrow = null;
    this.boogieWoogie = null;
    this.infinityShield = null;
    this.lapseBlue = null;
    this.reversalRed = null;
  }

  // ========================================================
  // 1. HOLLOW TECHNIQUE: PURPLE
  // ========================================================
  firePurple(startX = 100, startY = null) {
    const { w, h } = getDims();
    const y = startY ?? h * 0.5;

    this.hollowPurple = {
      x: startX,
      y,
      vx: 24, // High speed
      radius: 65,
      fusionTime: 0.6, // Blue + Red orbit phase
      time: 0,
      trench: [], // Void trench path
      lightning: [],
      active: true,
    };
  }

  // ========================================================
  // 2. FURNACE: FIRE ARROW (FUGA)
  // ========================================================
  fireFurnaceArrow(cx = null, cy = null) {
    const { w, h } = getDims();
    const targetX = cx ?? w * 0.5;
    const targetY = cy ?? h * 0.5;

    this.fireArrow = {
      startX: w * 0.2,
      startY: h * 0.8,
      targetX,
      targetY,
      progress: 0,
      phase: 'DRAW', // 'DRAW' -> 'FLIGHT' -> 'DETONATION'
      timer: 0,
      embers: [],
      active: true,
    };

    for (let i = 0; i < 40; i++) {
      this.fireArrow.embers.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 5 - 2,
        size: Math.random() * 4 + 1,
        life: 1.0,
      });
    }
  }

  // ========================================================
  // 3. BOOGIE WOOGIE (AOI TODO)
  // ========================================================
  triggerBoogieWoogie(clapX = null, clapY = null) {
    const { w, h } = getDims();

    this.boogieWoogie = {
      x: clapX ?? w * 0.5,
      y: clapY ?? h * 0.5,
      life: 1.0,
      flashAlpha: 1.0, // Monochrome negative flash
      flipped: true,
      speedLines: [],
    };

    // Radiating dynamic manga action speed lines
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2 + (Math.random() - 0.5) * 0.1;
      const len = Math.max(w, h) * (0.5 + Math.random() * 0.5);
      this.boogieWoogie.speedLines.push({
        angle,
        length: len,
        width: Math.random() * 3 + 1.5,
      });
    }
  }

  // ========================================================
  // 4. LIMITLESS: INFINITY (SATORU GOJO)
  // ========================================================
  activateInfinity(x, y) {
    this.infinityShield = {
      x, y,
      radius: 175,
      life: 1.0,
      phase: 0,
    };
  }

  // ========================================================
  // 5. BLUE & RED
  // ========================================================
  triggerBlue(x, y) {
    this.lapseBlue = { x, y, radius: 130, life: 1.0, angle: 0 };
  }

  triggerRed(x, y) {
    this.reversalRed = { x, y, radius: 20, maxR: 240, life: 1.0 };
  }

  // ========================================================
  // UPDATE LOOP
  // ========================================================
  update(dt) {
    // 1. Update Purple
    if (this.hollowPurple && this.hollowPurple.active) {
      const p = this.hollowPurple;
      p.time += dt * 0.03;

      if (p.fusionTime > 0) {
        p.fusionTime -= dt * 0.03;
      } else {
        p.x += p.vx * dt;
        p.trench.push({ x: p.x, y: p.y, radius: p.radius, life: 1.0 });

        // Branching violet lightning arcs
        if (Math.random() < 0.6) {
          p.lightning.push(this.generateLightningBranch(p.x, p.y, p.radius * 2.2));
        }

        if (p.x > getDims().w + 200) {
          p.active = false;
        }
      }

      // Update trench fade
      for (let i = p.trench.length - 1; i >= 0; i--) {
        p.trench[i].life -= 0.015 * dt;
        if (p.trench[i].life <= 0) p.trench.splice(i, 1);
      }
      p.lightning = p.lightning.filter((l) => (l.life -= 0.1 * dt) > 0);
    }

    // 2. Update Fire Arrow
    if (this.fireArrow && this.fireArrow.active) {
      const fa = this.fireArrow;
      fa.timer += dt * 0.03;

      if (fa.phase === 'DRAW') {
        if (fa.timer > 0.4) fa.phase = 'FLIGHT';
      } else if (fa.phase === 'FLIGHT') {
        fa.progress += 0.06 * dt;
        if (fa.progress >= 1.0) {
          fa.phase = 'DETONATION';
          fa.timer = 0;
        }
      } else if (fa.phase === 'DETONATION') {
        if (fa.timer > 1.2) fa.active = false;
      }
    }

    // 3. Update Boogie Woogie
    if (this.boogieWoogie) {
      this.boogieWoogie.life -= 0.04 * dt;
      this.boogieWoogie.flashAlpha = Math.max(0, this.boogieWoogie.flashAlpha - 0.08 * dt);
      if (this.boogieWoogie.life <= 0) {
        this.boogieWoogie = null;
      }
    }

    // 4. Update Infinity Shield
    if (this.infinityShield) {
      this.infinityShield.life -= 0.02 * dt;
      this.infinityShield.phase += 0.05 * dt;
      if (this.infinityShield.life <= 0) {
        this.infinityShield = null;
      }
    }

    // 5. Update Blue
    if (this.lapseBlue) {
      this.lapseBlue.life -= 0.03 * dt;
      this.lapseBlue.angle += 0.15 * dt;
      if (this.lapseBlue.life <= 0) this.lapseBlue = null;
    }

    // 6. Update Red
    if (this.reversalRed) {
      this.reversalRed.radius += 10 * dt;
      this.reversalRed.life -= 0.04 * dt;
      if (this.reversalRed.life <= 0) this.reversalRed = null;
    }
  }

  generateLightningBranch(x, y, reach) {
    const segments = 6;
    const points = [{ x, y }];
    let curX = x;
    let curY = y;
    const angle = Math.random() * Math.PI * 2;

    for (let i = 0; i < segments; i++) {
      const step = (reach / segments) * randomRange(0.7, 1.3);
      curX += Math.cos(angle) * step + (Math.random() - 0.5) * 25;
      curY += Math.sin(angle) * step + (Math.random() - 0.5) * 25;
      points.push({ x: curX, y: curY });
    }
    return { points, life: 1.0 };
  }

  // ========================================================
  // DRAW PIPELINE
  // ========================================================
  draw(ctx) {
    const { w, h } = getDims();

    // 1. Boogie Woogie Glitch & Dynamic Speed Lines
    if (this.boogieWoogie) {
      const bw = this.boogieWoogie;
      ctx.save();

      // Split-second monochrome negative inversion
      if (bw.flashAlpha > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${bw.flashAlpha * 0.75})`;
        ctx.fillRect(0, 0, w, h);
      }

      // Radiating manga speed lines
      ctx.strokeStyle = `rgba(255, 255, 255, ${bw.life * 0.85})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#fbbf24';
      for (const line of bw.speedLines) {
        ctx.lineWidth = line.width;
        ctx.beginPath();
        const startR = 40;
        const x1 = bw.x + Math.cos(line.angle) * startR;
        const y1 = bw.y + Math.sin(line.angle) * startR;
        const x2 = bw.x + Math.cos(line.angle) * line.length;
        const y2 = bw.y + Math.sin(line.angle) * line.length;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Golden transposition spark burst
      ctx.fillStyle = '#fbbf24';
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#f59e0b';
      ctx.beginPath();
      ctx.arc(bw.x, bw.y, 25 * bw.life, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 2. Limitless: Infinity Shield
    if (this.infinityShield) {
      const is = this.infinityShield;
      ctx.save();
      ctx.strokeStyle = `rgba(56, 189, 248, ${is.life * 0.8})`;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#38bdf8';

      // Concentric rippling refraction rings
      for (let r = 0; r < 4; r++) {
        const ringR = (is.radius * 0.4) + (r * 32) + Math.sin(is.phase + r) * 6;
        ctx.beginPath();
        ctx.arc(is.x, is.y, ringR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Hexagonal geometric forcefield barrier
      ctx.strokeStyle = `rgba(224, 242, 254, ${is.life * 0.6})`;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + is.phase * 0.5;
        const hx = is.x + Math.cos(a) * is.radius;
        const hy = is.y + Math.sin(a) * is.radius;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.restore();
    }

    // 3. Hollow Technique: Purple
    if (this.hollowPurple && this.hollowPurple.active) {
      const p = this.hollowPurple;
      ctx.save();

      // Fusion Orbit Phase (Blue + Red converging)
      if (p.fusionTime > 0) {
        const orbitR = 45 * (p.fusionTime / 0.6);
        const a = p.time * 12;

        // Lapse: Blue singularity
        ctx.fillStyle = '#38bdf8';
        ctx.shadowBlur = 24;
        ctx.shadowColor = '#0284c7';
        ctx.beginPath();
        ctx.arc(p.x + Math.cos(a) * orbitR, p.y + Math.sin(a) * orbitR, 20, 0, Math.PI * 2);
        ctx.fill();

        // Reversal: Red divergence
        ctx.fillStyle = '#ef4444';
        ctx.shadowBlur = 24;
        ctx.shadowColor = '#dc2626';
        ctx.beginPath();
        ctx.arc(p.x + Math.cos(a + Math.PI) * orbitR, p.y + Math.sin(a + Math.PI) * orbitR, 20, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Spatial Void Trench (Decaying trench cut through space)
        for (const t of p.trench) {
          ctx.fillStyle = `rgba(147, 51, 234, ${t.life * 0.25})`;
          ctx.beginPath();
          ctx.arc(t.x, t.y, t.radius * 1.3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Branching Violet Lightning Arcs
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#c084fc';
        for (const bolt of p.lightning) {
          ctx.strokeStyle = `rgba(233, 213, 255, ${bolt.life * 0.9})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
          for (let i = 1; i < bolt.points.length; i++) {
            ctx.lineTo(bolt.points[i].x, bolt.points[i].y);
          }
          ctx.stroke();
        }

        // The Hollow Purple Spatial Erasure Sphere
        const grad = ctx.createRadialGradient(p.x, p.y, p.radius * 0.1, p.x, p.y, p.radius * 1.6);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        grad.addColorStop(0.25, 'rgba(216, 180, 254, 0.95)');
        grad.addColorStop(0.6, 'rgba(147, 51, 234, 0.85)');
        grad.addColorStop(0.85, 'rgba(88, 28, 135, 0.5)');
        grad.addColorStop(1, 'rgba(59, 7, 100, 0)');

        ctx.fillStyle = grad;
        ctx.shadowBlur = 40;
        ctx.shadowColor = '#a855f7';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 1.6, 0, Math.PI * 2);
        ctx.fill();

        // High-density black void core (Spatial annihilation)
        ctx.fillStyle = '#0f021f';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // 4. Furnace: Fire Arrow (Fuga)
    if (this.fireArrow && this.fireArrow.active) {
      const fa = this.fireArrow;
      ctx.save();

      if (fa.phase === 'DRAW' || fa.phase === 'FLIGHT') {
        const curX = fa.startX + (fa.targetX - fa.startX) * fa.progress;
        const curY = fa.startY + (fa.targetY - fa.startY) * fa.progress;

        // Blazing arrow projectile
        ctx.strokeStyle = '#f97316';
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#ea580c';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(fa.startX, fa.startY);
        ctx.lineTo(curX, curY);
        ctx.stroke();

        // Arrow head plasma
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#fbbf24';
        ctx.beginPath();
        ctx.arc(curX, curY, 18, 0, Math.PI * 2);
        ctx.fill();
      } else if (fa.phase === 'DETONATION') {
        // Blinding Thermobaric Solar Detonation
        const blastR = Math.min(w, h) * fa.timer * 0.9;
        const fade = clamp(1.0 - fa.timer / 1.2, 0, 1);

        const expGrad = ctx.createRadialGradient(fa.targetX, fa.targetY, blastR * 0.1, fa.targetX, fa.targetY, blastR);
        expGrad.addColorStop(0, `rgba(255, 255, 255, ${fade})`);
        expGrad.addColorStop(0.3, `rgba(251, 191, 36, ${fade * 0.9})`);
        expGrad.addColorStop(0.7, `rgba(234, 88, 12, ${fade * 0.7})`);
        expGrad.addColorStop(1, 'rgba(124, 45, 18, 0)');

        ctx.fillStyle = expGrad;
        ctx.shadowBlur = 45;
        ctx.shadowColor = '#f97316';
        ctx.beginPath();
        ctx.arc(fa.targetX, fa.targetY, blastR, 0, Math.PI * 2);
        ctx.fill();

        // Blast Shockwave Ring
        ctx.strokeStyle = `rgba(255, 255, 255, ${fade * 0.9})`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(fa.targetX, fa.targetY, blastR * 1.15, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }

    // 5. Lapse: Blue
    if (this.lapseBlue) {
      const b = this.lapseBlue;
      ctx.save();
      const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      grad.addColorStop(0.4, 'rgba(56, 189, 248, 0.8)');
      grad.addColorStop(1, 'rgba(2, 132, 199, 0)');
      ctx.fillStyle = grad;
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#38bdf8';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * b.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 6. Reversal: Red
    if (this.reversalRed) {
      const r = this.reversalRed;
      ctx.save();
      ctx.strokeStyle = `rgba(239, 68, 68, ${r.life * 0.85})`;
      ctx.lineWidth = 4;
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#ef4444';
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}
