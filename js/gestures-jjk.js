/**
 * NOVA — Jujutsu Kaisen Hand Seal (Mudra) & Gesture Classifier
 *
 * Implements real-time computer-vision heuristics on MediaPipe 21-landmark data:
 * - Gojo's Indra Mudra (Taishakuten) for Infinite Void
 * - Sukuna's Enma-ten Shrine Mudra for Malevolent Shrine
 * - Megumi's Shadow Puppet Mudra for Chimera Shadow Garden
 * - Mahito's Soul Web Clasp for Self-Embodiment of Perfection
 * - Todo's Boogie Woogie Clap (velocity-based transient)
 * - Gojo's Infinity Palm & Sukuna's Dismantle Knife-Hand
 */

import { dist, clamp } from './math-utils.js';

export class JJKGestureClassifier {
  constructor() {
    this.prevWristDist = null;
    this.lastClapTime = 0;
    this.prevHandX = null;
    this.swipeVelocity = 0;
  }

  /**
   * Evaluates if a given digit is extended away from wrist.
   */
  isExtended(landmarks, pipIdx, tipIdx) {
    const wrist = landmarks[0];
    const pip = landmarks[pipIdx];
    const tip = landmarks[tipIdx];

    const dWristPip = Math.hypot(pip.x - wrist.x, pip.y - wrist.y);
    const dWristTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
    return dWristTip > dWristPip * 1.22;
  }

  /**
   * Evaluates if a given digit is curled into the palm.
   */
  isCurled(landmarks, pipIdx, tipIdx) {
    const wrist = landmarks[0];
    const pip = landmarks[pipIdx];
    const tip = landmarks[tipIdx];

    const dWristPip = Math.hypot(pip.x - wrist.x, pip.y - wrist.y);
    const dWristTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
    return dWristTip < dWristPip * 1.05;
  }

  /**
   * Classifies JJK hand seals and returns detailed posture scores.
   * @param {Array<Array<{x: number, y: number, z: number}>>} multiHandLandmarks
   * @param {number} width Frame pixel width
   * @param {number} height Frame pixel height
   * @returns {Object} Classified gestures and match percentages
   */
  classify(multiHandLandmarks, width = 640, height = 480) {
    const result = {
      detectedDomain: null,
      detectedTechnique: null,
      confidence: 0,
      mudraScores: {
        infinite_void: 0,
        malevolent_shrine: 0,
        chimera_shadow_garden: 0,
        self_embodiment: 0,
      },
      isClap: false,
      isInfinity: false,
      isDismantle: false,
    };

    if (!multiHandLandmarks || multiHandLandmarks.length === 0) {
      this.prevWristDist = null;
      return result;
    }

    const hand1 = multiHandLandmarks[0];
    const hasHand2 = multiHandLandmarks.length >= 2;
    const hand2 = hasHand2 ? multiHandLandmarks[1] : null;

    // ========================================================
    // 1. GOJO SATORU — INFINITE VOID (INDRA MUDRA)
    // Single-hand pose: Index & Middle extended & crossed, Ring & Pinky curled
    // ========================================================
    for (const h of multiHandLandmarks) {
      const indexExt = this.isExtended(h, 6, 8);
      const middleExt = this.isExtended(h, 10, 12);
      const ringCurled = this.isCurled(h, 14, 16);
      const pinkyCurled = this.isCurled(h, 18, 20);

      // Pixel distance between index tip (8) and middle tip (12)
      const tipCrossDist = dist(
        h[8].x * width, h[8].y * height,
        h[12].x * width, h[12].y * height
      );

      let gojoScore = 0;
      if (indexExt) gojoScore += 0.25;
      if (middleExt) gojoScore += 0.25;
      if (ringCurled) gojoScore += 0.2;
      if (pinkyCurled) gojoScore += 0.2;
      if (tipCrossDist < 48) gojoScore += 0.25;

      const finalGojo = clamp(gojoScore, 0, 1.0);
      if (finalGojo > result.mudraScores.infinite_void) {
        result.mudraScores.infinite_void = finalGojo;
      }
    }

    // ========================================================
    // 2. GOJO SATORU — INFINITY (OPEN PALM SHIELD)
    // All fingers extended, upright facing camera
    // ========================================================
    for (const h of multiHandLandmarks) {
      const idxExt = this.isExtended(h, 6, 8);
      const midExt = this.isExtended(h, 10, 12);
      const rngExt = this.isExtended(h, 14, 16);
      const pnkExt = this.isExtended(h, 18, 20);

      if (idxExt && midExt && rngExt && pnkExt) {
        result.isInfinity = true;
      }
    }

    // ========================================================
    // 3. SUKUNA — DISMANTLE (SWIPING KNIFE-HAND)
    // Flat hand moving fast laterally
    // ========================================================
    const curX = hand1[8].x * width;
    if (this.prevHandX !== null) {
      const dx = curX - this.prevHandX;
      this.swipeVelocity = 0.7 * this.swipeVelocity + 0.3 * Math.abs(dx);
      if (this.swipeVelocity > 35) {
        result.isDismantle = true;
      }
    }
    this.prevHandX = curX;

    // ========================================================
    // TWO-HAND DETECTIONS
    // ========================================================
    if (hasHand2) {
      const wristDist = dist(
        hand1[0].x * width, hand1[0].y * height,
        hand2[0].x * width, hand2[0].y * height
      );

      const indexTipDist = dist(
        hand1[8].x * width, hand1[8].y * height,
        hand2[8].x * width, hand2[8].y * height
      );

      const thumbTipDist = dist(
        hand1[4].x * width, hand1[4].y * height,
        hand2[4].x * width, hand2[4].y * height
      );

      const pinkyTipDist = dist(
        hand1[20].x * width, hand1[20].y * height,
        hand2[20].x * width, hand2[20].y * height
      );

      // --- A. SUKUNA — MALEVOLENT SHRINE (ENMA-TEN TEMPLE SEAL) ---
      // Index fingertips touching pointing up, pinkies touching at base, wrists close
      let sukunaScore = 0;
      if (wristDist < 240) sukunaScore += 0.25;
      if (indexTipDist < 55) sukunaScore += 0.35;
      if (pinkyTipDist < 120) sukunaScore += 0.25;
      if (thumbTipDist < 90) sukunaScore += 0.15;
      result.mudraScores.malevolent_shrine = clamp(sukunaScore, 0, 1.0);

      // --- B. MEGUMI — CHIMERA SHADOW GARDEN (SHADOW PUPPET WINGS) ---
      // Thumbs hooked together, fingers spread outward
      let megumiScore = 0;
      if (thumbTipDist < 48) megumiScore += 0.4;
      if (this.isExtended(hand1, 6, 8) && this.isExtended(hand2, 6, 8)) megumiScore += 0.3;
      if (indexTipDist > 80) megumiScore += 0.3;
      result.mudraScores.chimera_shadow_garden = clamp(megumiScore, 0, 1.0);

      // --- C. MAHITO — SELF-EMBODIMENT OF PERFECTION ---
      // Cupped palms with fingers curving into a cage
      let mahitoScore = 0;
      if (wristDist < 140) mahitoScore += 0.3;
      if (indexTipDist < 75 && pinkyTipDist < 75) mahitoScore += 0.4;
      if (!this.isExtended(hand1, 6, 8) && !this.isExtended(hand2, 6, 8)) mahitoScore += 0.3;
      result.mudraScores.self_embodiment = clamp(mahitoScore, 0, 1.0);

      // --- D. TODO — BOOGIE WOOGIE (HAND CLAP) ---
      const now = performance.now();
      if (this.prevWristDist !== null) {
        const delta = this.prevWristDist - wristDist;
        // Rapid closure of palms into close contact
        if (delta > 60 && wristDist < 90 && now - this.lastClapTime > 800) {
          result.isClap = true;
          this.lastClapTime = now;
        }
      }
      this.prevWristDist = wristDist;
    } else {
      this.prevWristDist = null;
    }

    // Determine highest confidence domain
    let maxDomain = null;
    let maxScore = 0;

    for (const [key, score] of Object.entries(result.mudraScores)) {
      if (score > maxScore && score >= 0.72) {
        maxScore = score;
        maxDomain = key;
      }
    }

    result.detectedDomain = maxDomain;
    result.confidence = maxScore;

    return result;
  }
}
