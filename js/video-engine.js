/**
 * NOVA — Jujutsu Kaisen Video-Driven Domain Expansion Engine
 *
 * Coordinates full-screen anime video playback for each canonical JJK Mudra:
 * - Gojo's Infinite Void (Muryōkūsho)
 * - Sukuna's Malevolent Shrine (Fukuma Mizushi)
 * - Megumi's Chimera Shadow Garden (Kangō An'eitei)
 * - Mahito's Self-Embodiment of Perfection (Jihei Endonka)
 * - Todo's Boogie Woogie Clap & Gojo's Hollow Purple
 *
 * Supports local MP4s in assets/videos/, web streaming CDNs, and custom
 * user video uploads via URL.createObjectURL().
 */

import { CONFIG } from './config.js';

export class VideoEngine {
  /**
   * @param {HTMLVideoElement} videoElement
   */
  constructor(videoElement) {
    this.video = videoElement;
    this.currentKey = 'idle';
    this.customSources = {}; // In-memory custom video overrides

    // Preload custom overrides from localStorage if available
    this.loadPersistedCustomSources();
    this.init();
  }

  init() {
    if (!this.video) return;

    this.video.addEventListener('error', (e) => {
      console.warn(`Video playback error for ${this.currentKey}:`, e);
      this.handleVideoFallback();
    });

    // Start with idle video
    this.playIdleVideo();
  }

  loadPersistedCustomSources() {
    try {
      const saved = localStorage.getItem('__NOVA_CUSTOM_VIDEOS__');
      if (saved) {
        this.customSources = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not load custom video sources from localStorage', e);
    }
  }

  persistCustomSources() {
    try {
      const serializable = {};
      for (const [k, v] of Object.entries(this.customSources)) {
        if (typeof v === 'string' && !v.startsWith('blob:')) {
          serializable[k] = v;
        }
      }
      localStorage.setItem('__NOVA_CUSTOM_VIDEOS__', JSON.stringify(serializable));
    } catch (e) {
      console.warn('Could not persist custom video sources', e);
    }
  }

  /**
   * Sets a custom video source for a specific domain or ability.
   * Accepts either a File object (from file input) or a direct video URL string.
   * @param {string} key
   * @param {File|string} fileOrUrl
   */
  setCustomVideoSource(key, fileOrUrl) {
    if (fileOrUrl instanceof File) {
      const blobUrl = URL.createObjectURL(fileOrUrl);
      this.customSources[key] = blobUrl;
    } else if (typeof fileOrUrl === 'string') {
      this.customSources[key] = fileOrUrl;
      this.persistCustomSources();
    }

    // If currently active, refresh immediately
    if (this.currentKey === key) {
      this.playVideoSource(key);
    }
  }

  /**
   * Resolves the best available video URL for the given key.
   * Order: Custom override -> Local asset -> CDN fallback
   * @param {string} key
   * @returns {string}
   */
  getVideoUrl(key) {
    if (this.customSources[key]) {
      return this.customSources[key];
    }

    const cfg = CONFIG.VIDEO_SOURCES[key];
    if (!cfg) return '';

    // Prefer CDN for instant web accessibility, or local asset
    return cfg.cdn || cfg.local || '';
  }

  /**
   * Plays a video source with a smooth opacity transition.
   * @param {string} key
   */
  playVideoSource(key) {
    if (!this.video) return;

    this.currentKey = key;
    const url = this.getVideoUrl(key);
    if (!url) return;

    // Smooth opacity dip during source swap
    this.video.style.opacity = '0.3';

    this.video.src = url;
    this.video.load();

    const playPromise = this.video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.video.style.opacity = '1.0';
        })
        .catch((err) => {
          console.warn(`Autoplay prevented or error playing ${key}:`, err);
          // Retry unmuted or fall back
          this.video.muted = true;
          this.video.play().catch(() => this.handleVideoFallback());
        });
    }
  }

  /**
   * Plays the specific Domain Expansion video for the given domain.
   * @param {string} domainId
   */
  playDomainVideo(domainId) {
    this.playVideoSource(domainId);
  }

  /**
   * Plays a signature technique video (e.g. Hollow Purple or Boogie Woogie clap).
   * @param {string} techniqueId
   */
  playTechniqueVideo(techniqueId) {
    this.playVideoSource(techniqueId);
  }

  /**
   * Returns to the idle dark cursed staging atmosphere.
   */
  playIdleVideo() {
    this.playVideoSource('idle');
  }

  /**
   * Fallback if an external video fails to load.
   */
  handleVideoFallback() {
    const cfg = CONFIG.VIDEO_SOURCES[this.currentKey];
    if (cfg && cfg.local && this.video.src !== cfg.local) {
      // Try local fallback if CDN failed
      this.video.src = cfg.local;
      this.video.play().catch(() => {
        this.video.style.opacity = '0';
      });
    } else {
      this.video.style.opacity = '0';
    }
  }
}
