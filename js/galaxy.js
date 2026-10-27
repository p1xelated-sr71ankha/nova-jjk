/**
 * NOVA — Hand-Controlled Particle Galaxy
 * Galaxy Generation Module
 *
 * Procedurally generates a structured spiral galaxy with four distinct layers:
 * 1. Luminous central core (bulge)
 * 2. Three logarithmic spiral arms
 * 3. Dense stellar clusters embedded along the arms
 * 4. Diffuse spherical/elliptical outer halo
 */

import { CONFIG } from './config.js';
import { Particle } from './particle.js';
import { randomRange, randomSigned, spiralPoint, wrapHue } from './math-utils.js';

/**
 * Builds the complete procedural particle galaxy.
 * @param {number} width Canvas width in pixels
 * @param {number} height Canvas height in pixels
 * @returns {{ particles: Particle[], cx: number, cy: number, baseRadius: number }}
 */
export function buildGalaxy(width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const baseRadius = Math.min(width, height) * 0.5 * CONFIG.GALAXY_RADIUS;
  const maxAllowedDist = baseRadius * 1.05;

  const particles = [];

  // Helper to test if a candidate point falls within galactic boundary
  function isInsideGalaxy(px, py) {
    const dx = px - cx;
    const dy = (py - cy) / 0.75; // Account for inclination
    return Math.hypot(dx, dy) <= maxAllowedDist;
  }

  // ==========================================
  // 1. CENTRAL LUMINOUS CORE (BULGE)
  // ==========================================
  for (let i = 0; i < CONFIG.CORE_COUNT; i++) {
    // Clustered near center with cubic falloff toward outer edge
    const r = baseRadius * CONFIG.CORE_RADIUS * Math.pow(Math.random(), 0.6);
    const theta = Math.random() * Math.PI * 2;
    const x = cx + Math.cos(theta) * r;
    const y = cy + Math.sin(theta) * r * 0.6;

    if (isInsideGalaxy(x, y)) {
      particles.push(
        new Particle(x, y, {
          radius: CONFIG.PARTICLE_BASE_SIZE * randomRange(1.2, 2.4),
          type: 'core',
          baseHue: randomRange(35, 55), // Warm stellar yellow-white
          brightness: randomRange(0.85, 1.0),
          alpha: randomRange(0.8, 1.0),
          angle: theta,
          orbitRadius: r,
          orbitSpeed: CONFIG.ROTATION_SPEED * (1.8 + Math.random() * 0.4),
          flattening: 0.6,
          homeX: x,
          homeY: y,
          homeAngle: theta,
          homeRadius: r,
        })
      );
    }
  }

  // ==========================================
  // 2. LOGARITHMIC SPIRAL ARMS
  // ==========================================
  const armOffsetStep = (Math.PI * 2) / CONFIG.ARM_COUNT;

  for (let armIndex = 0; armIndex < CONFIG.ARM_COUNT; armIndex++) {
    const armOffset = armIndex * armOffsetStep;

    for (let j = 0; j < CONFIG.ARM_STARS_PER_ARM; j++) {
      // Non-linear t provides denser star populations toward inner arm regions
      const t = Math.pow(Math.random(), 0.75);
      const theta = t * Math.PI * 5.5 + armOffset;

      // Logarithmic spiral: r = a * e^(b * thetaArm)
      const a = baseRadius * 0.08;
      const spiral = spiralPoint(theta - armOffset, a, CONFIG.ARM_TIGHTNESS);
      const r = spiral.r;

      // Perpendicular spread relative to spiral radius
      const spread = randomSigned(r * CONFIG.ARM_SPREAD);
      const perpX = -Math.sin(theta) * spread;
      const perpY = Math.cos(theta) * spread;

      const x = cx + r * Math.cos(theta) + perpX;
      const y = cy + (r * Math.sin(theta) + perpY) * 0.75;

      if (isInsideGalaxy(x, y)) {
        const orbitRadius = Math.hypot(x - cx, (y - cy) / 0.75);
        // Arm stars: blue-purple base with slight tonal variation
        const baseHue = wrapHue(CONFIG.BASE_HUE + randomSigned(24));
        const differentialSpeed =
          CONFIG.ROTATION_SPEED * (0.8 + 0.4 * (1 - Math.min(1, orbitRadius / baseRadius)));

        particles.push(
          new Particle(x, y, {
            radius: CONFIG.PARTICLE_BASE_SIZE * randomRange(0.8, 1.9),
            type: 'arm',
            baseHue,
            brightness: randomRange(0.65, 0.95),
            alpha: randomRange(0.6, 0.9),
            angle: theta,
            orbitRadius,
            orbitSpeed: differentialSpeed,
            flattening: 0.75,
            homeX: x,
            homeY: y,
            homeAngle: theta,
            homeRadius: orbitRadius,
          })
        );
      }
    }
  }

  // ==========================================
  // 3. EMBEDDED STELLAR CLUSTERS
  // ==========================================
  for (let c = 0; c < CONFIG.CLUSTER_COUNT; c++) {
    const clusterArm = c % CONFIG.ARM_COUNT;
    const clusterArmOffset = clusterArm * armOffsetStep;
    const clusterT = 0.2 + (c / CONFIG.CLUSTER_COUNT) * 0.6;
    const clusterTheta = clusterT * Math.PI * 5.5 + clusterArmOffset;
    const clusterA = baseRadius * 0.08;
    const clusterR = clusterA * Math.exp(CONFIG.ARM_TIGHTNESS * (clusterTheta - clusterArmOffset));

    const clusterCenterX = cx + clusterR * Math.cos(clusterTheta);
    const clusterCenterY = cy + clusterR * Math.sin(clusterTheta) * 0.75;

    const clusterStarCount = Math.floor(randomRange(25, 55));
    const clusterRadius = baseRadius * 0.035;

    for (let k = 0; k < clusterStarCount; k++) {
      const cr = clusterRadius * Math.pow(Math.random(), 0.6);
      const ctheta = Math.random() * Math.PI * 2;
      const x = clusterCenterX + Math.cos(ctheta) * cr;
      const y = clusterCenterY + Math.sin(ctheta) * cr * 0.75;

      if (isInsideGalaxy(x, y)) {
        const orbitRadius = Math.hypot(x - cx, (y - cy) / 0.75);
        const starAngle = Math.atan2((y - cy) / 0.75, x - cx);

        particles.push(
          new Particle(x, y, {
            radius: CONFIG.PARTICLE_BASE_SIZE * randomRange(1.0, 2.2),
            type: 'cluster',
            baseHue: wrapHue(CONFIG.BASE_HUE - 20 + randomSigned(15)), // Brilliant cyan/blue starbursts
            brightness: randomRange(0.85, 1.0),
            alpha: randomRange(0.8, 1.0),
            angle: starAngle,
            orbitRadius,
            orbitSpeed: CONFIG.ROTATION_SPEED * 0.95,
            flattening: 0.75,
            homeX: x,
            homeY: y,
            homeAngle: starAngle,
            homeRadius: orbitRadius,
          })
        );
      }
    }
  }

  // ==========================================
  // 4. DIFFUSE SPHERICAL/ELLIPTICAL HALO
  // ==========================================
  for (let h = 0; h < CONFIG.HALO_COUNT; h++) {
    // Biased outward with exponent 1.4
    const r = baseRadius * Math.pow(Math.random(), 1.4);
    const theta = Math.random() * Math.PI * 2;
    const x = cx + Math.cos(theta) * r;
    const y = cy + Math.sin(theta) * r * 0.55;

    if (isInsideGalaxy(x, y)) {
      particles.push(
        new Particle(x, y, {
          radius: CONFIG.PARTICLE_BASE_SIZE * randomRange(0.6, 1.3),
          type: 'halo',
          baseHue: wrapHue(CONFIG.BASE_HUE + 30 + randomSigned(20)), // Deep cosmic indigo/violet
          brightness: randomRange(0.35, 0.65),
          alpha: randomRange(0.3, 0.6),
          angle: theta,
          orbitRadius: r,
          orbitSpeed: CONFIG.ROTATION_SPEED * 0.6,
          flattening: 0.55,
          homeX: x,
          homeY: y,
          homeAngle: theta,
          homeRadius: r,
        })
      );
    }
  }

  return { particles, cx, cy, baseRadius };
}
