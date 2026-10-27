/**
 * Computer Vision & Dual-Hand Tracking Module (Jujutsu Kaisen Enhanced)
 *
 * Wraps MediaPipe Hands to capture up to 2 hands in real time.
 * Evaluates canonical Jujutsu Kaisen mudras via JJKGestureClassifier,
 * handles coordinate mirroring, renders dual-hand cursed energy skeletal overlays,
 * and renders interactive 'Ghost Mudra' target silhouettes for real-time tutorial alignment.
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
      mode: null,
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

  setGhostGuide(mudraId) {
    this.activeGhostGuide = mudraId;
  }

  toggleGhostGuide(enabled = null) {
    this.ghostGuideEnabled = enabled !== null ? enabled : !this.ghostGuideEnabled;
    return this.ghostGuideEnabled;
  }

  /**
   * Initializes MediaPipe Hands pipeline.
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
        // Draw ghost guide even when hands are not detected to guide the user
        if (this.ghostGuideEnabled) {
          this.renderGhostGuide();
        }
      }

      if (this.onStateChange) {
        this.onStateChange(this.state);
      }
      return;
    }

    const primaryHand = multiHands[0];
    const w = this.video.videoWidth || 640;
    const h = this.video.videoHeight || 480;

    const wrist = primaryHand[0];
    const thumb = primaryHand[4];
    const index = primaryHand[8];
    const middle = primaryHand[12];

    const pinchDist = dist(thumb.x * w, thumb.y * h, index.x * w, index.y * h);
    const spread = dist(wrist.x * w, wrist.y * h, middle.x * w, middle.y * h);

    let mode = null;
    if (pinchDist < 45) {
      mode = 'pinch';
    } else if (pinchDist > 95 && spread > 115) {
      mode = 'open';
    }

    const mirroredX = 1 - index.x;
    const interactionY = index.y;

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

    // Render skeleton and ghost guide
    this.renderSkeletons(multiHands, jjkClass, mode);

    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
  }

  /**
   * Renders skeletons for all tracked hands with cursed energy ink/aura style.
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

    // Draw Ghost Mudra Silhouette in background if enabled
    if (this.ghostGuideEnabled) {
      this.renderGhostGuide();
    }

    // Cursed aura styling based on detected domain
    let strokeColor = 'rgba(125, 211, 252, 0.85)';
    let jointColor = '#7dd3fc';
    let glowColor = 'rgba(125, 211, 252, 0.6)';

    if (jjkClass.detectedDomain === 'infinite_void') {
      strokeColor = 'rgba(56, 189, 248, 0.95)';
      jointColor = '#38bdf8';
      glowColor = 'rgba(56, 189, 248, 0.8)';
    } else if (jjkClass.detectedDomain === 'malevolent_shrine') {
      strokeColor = 'rgba(239, 68, 68, 0.95)';
      jointColor = '#ef4444';
      glowColor = 'rgba(239, 68, 68, 0.8)';
    } else if (jjkClass.detectedDomain === 'chimera_shadow_garden') {
      strokeColor = 'rgba(16, 185, 129, 0.95)';
      jointColor = '#10b981';
      glowColor = 'rgba(16, 185, 129, 0.8)';
    } else if (jjkClass.detectedDomain === 'self_embodiment') {
      strokeColor = 'rgba(236, 72, 153, 0.95)';
      jointColor = '#ec4899';
      glowColor = 'rgba(236, 72, 153, 0.8)';
    }

    ctx.save();

    for (const hand of multiHands) {
      // 1. Draw Cursed Bone Connections
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 10;
      ctx.shadowColor = glowColor;

      for (const [startIdx, endIdx] of SKELETON_CONNECTIONS) {
        const p1 = hand[startIdx];
        const p2 = hand[endIdx];

        ctx.beginPath();
        ctx.moveTo(p1.x * width, p1.y * height);
        ctx.lineTo(p2.x * width, p2.y * height);
        ctx.stroke();
      }

      // 2. Draw Landmark Joint Nodes
      for (let i = 0; i < hand.length; i++) {
        const lm = hand[i];
        const isTip = [4, 8, 12, 16, 20].includes(i);
        const radius = isTip ? 4.5 : 2.5;

        ctx.fillStyle = isTip ? '#ffffff' : jointColor;
        ctx.shadowBlur = isTip ? 14 : 6;
        ctx.shadowColor = glowColor;

        ctx.beginPath();
        ctx.arc(lm.x * width, lm.y * height, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  /**
   * Renders a stylized translucent 'Ghost Mudra' target silhouette directly onto the webcam canvas.
   * Allows the user to visually align their hand with the target seal.
   */
  renderGhostGuide() {
    if (!this.previewCtx || !this.previewCanvas) return;

    const ctx = this.previewCtx;
    const w = this.previewCanvas.width;
    const h = this.previewCanvas.height;
    const cx = w * 0.5;
    const cy = h * 0.5;

    ctx.save();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
    ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([5, 5]);

    if (this.activeGhostGuide === 'infinite_void') {
      // Ghost Taishakuten: crossed fingers silhouette
      ctx.beginPath();
      // Palm
      ctx.ellipse(cx, cy + 30, 35, 45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Index extended
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy + 10);
      ctx.lineTo(cx - 8, cy - 65);
      ctx.stroke();
      // Middle crossed over index
      ctx.beginPath();
      ctx.moveTo(cx + 8, cy + 10);
      ctx.quadraticCurveTo(cx + 10, cy - 25, cx - 12, cy - 70);
      ctx.stroke();
      // Label
      ctx.setLineDash([]);
      ctx.font = '10px sans-serif';
      ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';
      ctx.fillText('Align: Taishakuten (Indra)', cx - 60, cy + 90);
    } else if (this.activeGhostGuide === 'malevolent_shrine') {
      // Ghost Enma-ten: temple roof gable
      ctx.beginPath();
      ctx.moveTo(cx - 50, cy + 45);
      ctx.lineTo(cx, cy - 45); // Roof apex
      ctx.lineTo(cx + 50, cy + 45);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy - 45, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Label
      ctx.setLineDash([]);
      ctx.font = '10px sans-serif';
      ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.fillText('Align: Enma-ten (Gable Roof)', cx - 65, cy + 85);
    } else if (this.activeGhostGuide === 'chimera_shadow_garden') {
      // Ghost Shadow Puppet: winged spread
      ctx.beginPath();
      ctx.arc(cx, cy + 10, 14, 0, Math.PI * 2); // Thumbs lock
      ctx.fill();
      ctx.stroke();
      // Left wings
      ctx.moveTo(cx - 10, cy + 10);
      ctx.lineTo(cx - 65, cy - 35);
      ctx.moveTo(cx - 10, cy + 15);
      ctx.lineTo(cx - 70, cy - 10);
      // Right wings
      ctx.moveTo(cx + 10, cy + 10);
      ctx.lineTo(cx + 65, cy - 35);
      ctx.moveTo(cx + 10, cy + 15);
      ctx.lineTo(cx + 70, cy - 10);
      ctx.stroke();
      // Label
      ctx.setLineDash([]);
      ctx.font = '10px sans-serif';
      ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';
      ctx.fillText('Align: Shadow Puppet Wings', cx - 65, cy + 65);
    }

    ctx.restore();
  }
}
