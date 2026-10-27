/**
 * NOVA — Computer Vision & Dual-Hand Tracking Module (JJK Enhanced)
 *
 * Wraps MediaPipe Hands to capture up to 2 hands in real time.
 * Evaluates canonical Jujutsu Kaisen mudras (Infinite Void, Malevolent Shrine, etc.)
 * via JJKGestureClassifier, handles coordinate mirroring, and renders dual-hand
 * cursed energy skeletal overlays.
 */

import { CONFIG } from './config.js';
import { dist } from './math-utils.js';
import { JJKGestureClassifier } from './gestures-jjk.js';

// Standard 21-landmark hand skeleton topology
const SKELETON_CONNECTIONS = [
  // Palm base
  [0, 1], [0, 5], [0, 17], [5, 9], [9, 13], [13, 17],
  // Thumb
  [1, 2], [2, 3], [3, 4],
  // Index finger
  [5, 6], [6, 7], [7, 8],
  // Middle finger
  [9, 10], [10, 11], [11, 12],
  // Ring finger
  [13, 14], [14, 15], [15, 16],
  // Pinky
  [17, 18], [18, 19], [19, 20],
];

export class HandTracker {
  /**
   * Initializes the Hand Tracker.
   * @param {HTMLVideoElement} videoElement
   * @param {(state: Object) => void} onStateChange
   * @param {HTMLCanvasElement} [previewCanvas]
   * @param {(error: Error) => void} [onError]
   */
  constructor(videoElement, onStateChange, previewCanvas = null, onError = null) {
    this.video = videoElement;
    this.onStateChange = onStateChange;
    this.previewCanvas = previewCanvas;
    this.previewCtx = previewCanvas ? previewCanvas.getContext('2d') : null;
    this.onError = onError;

    this.hands = null;
    this.camera = null;
    this.isRunning = false;
    this.classifier = new JJKGestureClassifier();

    this.state = {
      active: false,
      handsCount: 0,
      x: 0.5,
      y: 0.5,
      mode: null, // 'pinch' | 'open' | null
      pinchDist: 0,
      spread: 0,
      rawLandmarks: null,
      multiHandLandmarks: [],
      jjk: {
        detectedDomain: null,
        detectedTechnique: null,
        confidence: 0,
        mudraScores: {},
        isClap: false,
        isInfinity: false,
        isDismantle: false,
      },
    };

    this.init();
  }

  /**
   * Initializes MediaPipe Hands pipeline with dual-hand tracking.
   */
  async init() {
    try {
      if (!window.Hands) {
        throw new Error('MediaPipe Hands script not loaded from CDN.');
      }

      this.hands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      this.hands.setOptions({
        maxNumHands: CONFIG.MAX_HANDS || 2,
        modelComplexity: 1,
        minDetectionConfidence: CONFIG.DETECTION_CONFIDENCE,
        minTrackingConfidence: CONFIG.TRACKING_CONFIDENCE,
      });

      this.hands.onResults((results) => this.handleResults(results));

      if (window.Camera) {
        this.camera = new window.Camera(this.video, {
          onFrame: async () => {
            if (this.isRunning && this.video.readyState >= 2) {
              await this.hands.send({ image: this.video });
            }
          },
          width: 640,
          height: 480,
        });

        await this.camera.start();
        this.isRunning = true;
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
        });
        this.video.srcObject = stream;
        await this.video.play();
        this.isRunning = true;

        const processFrame = async () => {
          if (this.isRunning) {
            await this.hands.send({ image: this.video });
            requestAnimationFrame(processFrame);
          }
        };
        requestAnimationFrame(processFrame);
      }
    } catch (err) {
      console.error('Failed to initialize HandTracker:', err);
      if (this.onError) {
        this.onError(err);
      }
    }
  }

  /**
   * Processes MediaPipe multi-hand landmark detection results.
   * @param {Object} results
   */
  handleResults(results) {
    const multiHands = results.multiHandLandmarks;
    const hasHand = multiHands && multiHands.length > 0;

    if (!hasHand) {
      this.state.active = false;
      this.state.handsCount = 0;
      this.state.mode = null;
      this.state.rawLandmarks = null;
      this.state.multiHandLandmarks = [];
      this.state.jjk = {
        detectedDomain: null,
        detectedTechnique: null,
        confidence: 0,
        mudraScores: {},
        isClap: false,
        isInfinity: false,
        isDismantle: false,
      };

      if (this.previewCtx && this.previewCanvas) {
        this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
      }

      if (this.onStateChange) {
        this.onStateChange(this.state);
      }
      return;
    }

    const primaryHand = multiHands[0];
    const w = this.video.videoWidth || 640;
    const h = this.video.videoHeight || 480;

    // Landmark references: 0=Wrist, 4=Thumb tip, 8=Index tip, 12=Middle tip
    const wrist = primaryHand[0];
    const thumb = primaryHand[4];
    const index = primaryHand[8];
    const middle = primaryHand[12];

    const pinchDist = dist(thumb.x * w, thumb.y * h, index.x * w, index.y * h);
    const spread = dist(wrist.x * w, wrist.y * h, middle.x * w, middle.y * h);

    // Baseline natural gestures
    let mode = null;
    if (pinchDist < 45) {
      mode = 'pinch';
    } else if (pinchDist > 95 && spread > 115) {
      mode = 'open';
    }

    // Mirror X coordinate for selfie view
    const mirroredX = 1 - index.x;
    const interactionY = index.y;

    // Run JJK Mudra & Technique Classifier
    const jjkClass = this.classifier.classify(multiHands, w, h);

    this.state = {
      active: true,
      handsCount: multiHands.length,
      x: mirroredX,
      y: interactionY,
      mode,
      pinchDist,
      spread,
      rawLandmarks: primaryHand,
      multiHandLandmarks: multiHands,
      jjk: jjkClass,
    };

    // Render 21-landmark hand skeleton for all detected hands
    this.renderSkeletons(multiHands, jjkClass, mode);

    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
  }

  /**
   * Renders skeletons for all tracked hands with cursed energy aura.
   * @param {Array<Array<{ x: number, y: number }>>} multiHands
   * @param {Object} jjkClass
   * @param {'pinch'|'open'|null} mode
   */
  renderSkeletons(multiHands, jjkClass, mode) {
    if (!this.previewCtx || !this.previewCanvas) return;

    const ctx = this.previewCtx;
    const width = this.previewCanvas.width;
    const height = this.previewCanvas.height;

    ctx.clearRect(0, 0, width, height);

    // Cursed aura styling based on detected domain or gesture
    let strokeColor = 'rgba(125, 211, 252, 0.75)'; // Default Cyan
    let jointColor = '#7dd3fc';
    let glowColor = 'rgba(125, 211, 252, 0.5)';

    if (jjkClass.detectedDomain === 'infinite_void') {
      strokeColor = 'rgba(56, 189, 248, 0.9)'; // Gojo Cyan
      jointColor = '#38bdf8';
      glowColor = 'rgba(56, 189, 248, 0.7)';
    } else if (jjkClass.detectedDomain === 'malevolent_shrine') {
      strokeColor = 'rgba(239, 68, 68, 0.9)'; // Sukuna Crimson
      jointColor = '#ef4444';
      glowColor = 'rgba(239, 68, 68, 0.7)';
    } else if (jjkClass.detectedDomain === 'chimera_shadow_garden') {
      strokeColor = 'rgba(16, 185, 129, 0.9)'; // Megumi Emerald
      jointColor = '#10b981';
      glowColor = 'rgba(16, 185, 129, 0.7)';
    } else if (jjkClass.detectedDomain === 'self_embodiment') {
      strokeColor = 'rgba(236, 72, 153, 0.9)'; // Mahito Pink
      jointColor = '#ec4899';
      glowColor = 'rgba(236, 72, 153, 0.7)';
    } else if (mode === 'pinch') {
      strokeColor = 'rgba(251, 113, 133, 0.85)';
      jointColor = '#fb7185';
      glowColor = 'rgba(251, 113, 133, 0.6)';
    } else if (mode === 'open') {
      strokeColor = 'rgba(52, 211, 153, 0.85)';
      jointColor = '#34d399';
      glowColor = 'rgba(52, 211, 153, 0.6)';
    }

    for (const hand of multiHands) {
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = strokeColor;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 8;
      ctx.shadowColor = glowColor;

      // Draw bones
      for (const [startIdx, endIdx] of SKELETON_CONNECTIONS) {
        const p1 = hand[startIdx];
        const p2 = hand[endIdx];

        ctx.beginPath();
        ctx.moveTo(p1.x * width, p1.y * height);
        ctx.lineTo(p2.x * width, p2.y * height);
        ctx.stroke();
      }

      // Draw 21 joints
      for (let i = 0; i < hand.length; i++) {
        const p = hand[i];
        const px = p.x * width;
        const py = p.y * height;

        ctx.beginPath();
        const isTip = [4, 8, 12, 16, 20].includes(i);
        const isIndex = i === 8;

        ctx.arc(px, py, isIndex ? 5.5 : isTip ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = isIndex ? '#ffffff' : jointColor;
        ctx.fill();
      }
    }

    ctx.shadowBlur = 0;
  }

  /**
   * Stops tracking and cleans up camera streams.
   */
  stop() {
    this.isRunning = false;
    if (this.camera && typeof this.camera.stop === 'function') {
      this.camera.stop();
    }
    if (this.video && this.video.srcObject) {
      const tracks = this.video.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      this.video.srcObject = null;
    }
  }
}
