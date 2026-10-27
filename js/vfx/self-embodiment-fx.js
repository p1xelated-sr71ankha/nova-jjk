/**
 * Self-Embodiment of Perfection Visual Effects Engine
 * Mahito's Canonical Domain Expansion
 *
 * Faithfully recreates the anime sequence:
 * - Colossal perimeter of woven metaphysical hands closing around the screen edges
 * - Intricate glowing soul strings linking hand landmarks across the void
 * - Visceral heartbeat rhythm that distorts the screen with Idle Transfiguration pulses
 * - Chromatic aberration and soul-touching ripple shockwaves
 */

import { clamp, lerp } from '../math-utils.js';

export class SelfEmbodimentFX {
  constructor() {
    this.time = 0;
    this.intensity = 0;
    this.heartbeatTimer = 0;
    this.heartbeatScale = 1.0;
    this.soulThreads = [];

    this.initThreads();
  }

  initThreads() {
    this.soulThreads = [];
    for (let i = 0; i < 30; i++) {
      this.soulThreads.push({
        angle1: Math.random() * Math.PI * 2,
        angle2: Math.random() * Math.PI * 2,
        r1: Math.random() * 0.4 + 0.5,
        r2: Math.random() * 0.3 + 0.1,
        color: Math.random() > 0.4 ? '#ec4899' : '#a855f7',
        pulseSpeed: Math.random() * 2 + 1,
        alpha: Math.random() * 0.6 + 0.3,
      });
    }
  }

  activate() {
    this.intensity = 1.0;
    this.heartbeatTimer = 0;
  }

  deactivate() {
    this.intensity = 0;
  }

  update(dt) {
    if (this.intensity <= 0) return;

    this.time += dt * 0.02;

    // Heartbeat pulse cycle (thump-thump rhythm of the soul)
    this.heartbeatTimer = (this.heartbeatTimer + dt * 0.04) % (Math.PI * 2);
    const beat = Math.sin(this.heartbeatTimer);
    if (beat > 0.7) {
      this.heartbeatScale = 1.0 + (beat - 0.7) * 0.18; // Thump expansion
    } else {
      this.heartbeatScale = lerp(this.heartbeatScale, 1.0, 0.15);
    }
  }

  draw(ctx, width, height) {
    if (this.intensity <= 0) return;

    ctx.save();
    const cx = width / 2;
    const cy = height / 2;
    const maxDim = Math.max(width, height);

    // 1. Dark Visceral Metaphysical Void Backdrop
    const voidGrad = ctx.createRadialGradient(cx, cy, maxDim * 0.15, cx, cy, maxDim * 0.85);
    voidGrad.addColorStop(0, 'rgba(15, 2, 10, 0.94)');
    voidGrad.addColorStop(0.5, 'rgba(30, 4, 25, 0.92)');
    voidGrad.addColorStop(1, 'rgba(6, 0, 8, 0.98)');
    ctx.fillStyle = voidGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Intricate Glowing Soul Threads (Spanning metaphysical space)
    ctx.shadowBlur = 14;
    for (const st of this.soulThreads) {
      const p1x = cx + Math.cos(st.angle1 + this.time * 0.2) * (st.r1 * maxDim * 0.5);
      const p1y = cy + Math.sin(st.angle1 + this.time * 0.2) * (st.r1 * maxDim * 0.5);
      const p2x = cx + Math.cos(st.angle2 - this.time * 0.3) * (st.r2 * maxDim * 0.5);
      const p2y = cy + Math.sin(st.angle2 - this.time * 0.3) * (st.r2 * maxDim * 0.5);

      const pulse = Math.sin(this.time * st.pulseSpeed) * 0.3 + 0.7;
      ctx.strokeStyle = st.color;
      ctx.shadowColor = st.color;
      ctx.lineWidth = 1.8;
      ctx.globalAlpha = st.alpha * pulse * this.intensity;

      ctx.beginPath();
      ctx.moveTo(p1x, p1y);
      // Curved biological tendril
      const midX = (p1x + p2x) / 2 + Math.sin(this.time * 2 + st.angle1) * 35;
      const midY = (p1y + p2y) / 2 + Math.cos(this.time * 2 + st.angle2) * 35;
      ctx.quadraticCurveTo(midX, midY, p2x, p2y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // 3. Central Soul Embryo Pulse (Idle Transfiguration core)
    const embryoR = maxDim * 0.12 * this.heartbeatScale;
    const embGrad = ctx.createRadialGradient(cx, cy, embryoR * 0.2, cx, cy, embryoR * 2.2);
    embGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    embGrad.addColorStop(0.3, 'rgba(244, 114, 182, 0.85)');
    embGrad.addColorStop(0.65, 'rgba(192, 38, 211, 0.5)');
    embGrad.addColorStop(1, 'rgba(15, 2, 10, 0)');

    ctx.fillStyle = embGrad;
    ctx.shadowBlur = 35;
    ctx.shadowColor = '#ec4899';
    ctx.beginPath();
    ctx.arc(cx, cy, embryoR * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // 4. Perimeter of Woven Giant Metaphysical Hands (Enclosing the screen)
    this.drawGiantHandBorder(ctx, width, height, maxDim);

    // 5. Chromatic Soul Pulse Ring
    if (this.heartbeatScale > 1.05) {
      const ringAlpha = (this.heartbeatScale - 1.0) / 0.18;
      ctx.strokeStyle = `rgba(244, 114, 182, ${ringAlpha * 0.8})`;
      ctx.lineWidth = 4;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ec4899';
      ctx.beginPath();
      ctx.arc(cx, cy, embryoR * 2.8, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Draws the stylized perimeter of giant intertwined hands wrapping the boundary.
   */
  drawGiantHandBorder(ctx, width, height, maxDim) {
    ctx.save();
    ctx.fillStyle = 'rgba(10, 2, 8, 0.92)';
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#ec4899';

    const handCount = 10;
    for (let i = 0; i < handCount; i++) {
      const angle = (i / handCount) * Math.PI * 2;
      const hx = width / 2 + Math.cos(angle) * (width * 0.46);
      const hy = height / 2 + Math.sin(angle) * (height * 0.46);

      ctx.save();
      ctx.translate(hx, hy);
      ctx.rotate(angle + Math.PI / 2);

      // Curved giant hand palm and curling fingers
      ctx.beginPath();
      ctx.moveTo(-45, 60);
      ctx.quadraticCurveTo(-50, 0, -35, -40);
      ctx.quadraticCurveTo(-20, -75, -5, -45); // Finger 1
      ctx.quadraticCurveTo(0, -85, 15, -50);  // Finger 2
      ctx.quadraticCurveTo(25, -70, 35, -35); // Finger 3
      ctx.quadraticCurveTo(50, 0, 45, 60);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  }
}
