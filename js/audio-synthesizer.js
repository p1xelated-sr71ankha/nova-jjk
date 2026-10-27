/**
 * NOVA — Jujutsu Kaisen Procedural Cursed Audio Engine
 *
 * Implements 100% synthesized sound design using native HTML5 Web Audio API:
 * - Domain expansion dimensional glass fracture
 * - Cursed energy sub-bass resonance
 * - Sukuna's razor blade slash (Dismantle)
 * - Todo's crisp hand clap (Boogie Woogie)
 * - Gojo's Hollow Purple spatial distortion
 * - Infinity repulsion harmonics
 *
 * Zero external audio files required. Zero latency. Instant client-side execution.
 */

export class AudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.humOsc = null;
    this.humGain = null;
    this.isHumming = false;
  }

  /**
   * Lazily initializes the Web Audio Context upon first user gesture.
   */
  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      console.warn('Web Audio API not supported in this browser.');
      return;
    }

    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  /**
   * Toggles audio mute state.
   * @returns {boolean} New mute state
   */
  toggleMute() {
    this.init();
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  /**
   * Plays continuous cursed energy sub-bass hum.
   * @param {number} intensity [0, 1]
   */
  setCursedHum(intensity) {
    if (!this.ctx || this.isMuted) return;

    if (intensity <= 0.05) {
      if (this.humGain && this.isHumming) {
        this.humGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
        this.isHumming = false;
      }
      return;
    }

    if (!this.humOsc) {
      this.humOsc = this.ctx.createOscillator();
      this.humOsc.type = 'sawtooth';
      this.humOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A1

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, this.ctx.currentTime);
      filter.Q.setValueAtTime(4.0, this.ctx.currentTime);

      this.humGain = this.ctx.createGain();
      this.humGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.humOsc.connect(filter);
      filter.connect(this.humGain);
      this.humGain.connect(this.masterGain);

      this.humOsc.start();
    }

    const targetGain = Math.min(0.25, intensity * 0.25);
    this.humGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    this.isHumming = true;
  }

  /**
   * Synthesizes the iconic Domain Expansion dimensional barrier shatter:
   * 1. Sub-bass dimensional implosion (40Hz)
   * 2. High-impact white noise fracture transient
   * 3. High-frequency resonant glass harmonics (1400Hz - 3200Hz)
   */
  playDomainShatter() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;

    // 1. Heavy sub-bass drop (dimensional rupture)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(120, t);
    subOsc.frequency.exponentialRampToValueAtTime(32, t + 0.6);

    subGain.gain.setValueAtTime(0.8, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(t);
    subOsc.stop(t + 1.2);

    // 2. White-noise glass fracture burst
    const bufferSize = this.ctx.sampleRate * 0.4;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(1800, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(400, t + 0.4);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.9, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(t);

    // 3. Resonant glass chimes (bell-like fracture harmonics)
    const glassFreqs = [1240, 1860, 2480, 3720];
    glassFreqs.forEach((freq, idx) => {
      const bell = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();

      bell.type = 'triangle';
      bell.frequency.setValueAtTime(freq + (Math.random() * 20 - 10), t + 0.05);

      const decayTime = 0.8 + idx * 0.2;
      bellGain.gain.setValueAtTime(0.25 / (idx + 1), t + 0.05);
      bellGain.gain.exponentialRampToValueAtTime(0.001, t + decayTime);

      bell.connect(bellGain);
      bellGain.connect(this.masterGain);
      bell.start(t + 0.05);
      bell.stop(t + decayTime);
    });
  }

  /**
   * Synthesizes Sukuna's razor-sharp Dismantle & Cleave blade slash.
   */
  playSlash() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;

    // Metallic whip/blade pitch slide
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(3200, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.22);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, t);
    filter.Q.setValueAtTime(6.0, t);

    gain.gain.setValueAtTime(0.65, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  /**
   * Synthesizes Todo's crisp Boogie Woogie hand clap.
   */
  playClap() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.03));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, t);
    filter.Q.setValueAtTime(2.5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
  }

  /**
   * Synthesizes Gojo's Hollow Technique: Purple spatial distortion warble.
   */
  playHollowPurple() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;

    // Dual FM oscillators clashing
    const carrier = this.ctx.createOscillator();
    const modulator = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const mainGain = this.ctx.createGain();

    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(220, t);
    carrier.frequency.exponentialRampToValueAtTime(880, t + 0.5);
    carrier.frequency.exponentialRampToValueAtTime(60, t + 1.2);

    modulator.type = 'sawtooth';
    modulator.frequency.setValueAtTime(30, t);
    modulator.frequency.linearRampToValueAtTime(180, t + 0.8);

    modGain.gain.setValueAtTime(300, t);

    mainGain.gain.setValueAtTime(0.5, t);
    mainGain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);

    carrier.connect(mainGain);
    mainGain.connect(this.masterGain);

    modulator.start(t);
    carrier.start(t);
    modulator.stop(t + 1.4);
    carrier.stop(t + 1.4);
  }

  /**
   * Synthesizes Gojo's Infinity deceleration pulse.
   */
  playInfinityShield() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, t);
    osc.frequency.exponentialRampToValueAtTime(240, t + 0.3);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  /**
   * Synthesizes Sukuna's Furnace Fire Arrow combustion.
   */
  playFireArrow() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.4);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.9);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.linearRampToValueAtTime(1600, t + 0.4);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.9);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.9);
  }
}

export const soundEngine = new AudioSynthesizer();
