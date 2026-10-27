/**
 * NOVA — Jujutsu Kaisen Video-Driven Domain Expansion Engine
 * Master Controller & Composition Root
 *
 * Coordinates full-screen anime domain video playback, dual-hand MediaPipe tracking,
 * canonical JJK Mudra recognition, procedural Web Audio synthesis,
 * interactive step-by-step pictorial tutorials, and keyboard hotkeys.
 */

import { CONFIG } from './config.js';
import { VideoEngine } from './video-engine.js';
import { HandTracker } from './hand-tracker.js';
import { Renderer } from './renderer.js';
import { DomainEngine } from './domain-engine.js';
import { TechniqueEngine } from './techniques.js';
import { TutorialUI } from './tutorial-ui.js';
import { soundEngine } from './audio-synthesizer.js';

// DOM Element References
const canvas = document.getElementById('nova-canvas');
const video = document.getElementById('input-video');
const domainVideo = document.getElementById('domain-video-player');
const skeletonCanvas = document.getElementById('skeleton-canvas');
const statusText = document.getElementById('status-text');
const statusIndicator = document.getElementById('status-indicator');
const previewStatusPill = document.getElementById('preview-status-pill');
const cameraFallback = document.getElementById('camera-fallback');
const refreshBtn = document.getElementById('refresh-btn');
const audioToggleBtn = document.getElementById('audio-toggle-btn');
const cursedEnergyBar = document.getElementById('cursed-energy-fill');
const cursedEnergyVal = document.getElementById('cursed-energy-val');
const domainBanner = document.getElementById('domain-cinematic-banner');
const domainBannerTitle = document.getElementById('domain-banner-title');
const domainBannerQuote = document.getElementById('domain-banner-quote');
const domainBannerUser = document.getElementById('domain-banner-user');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function syncPreviewCanvasSize() {
  if (skeletonCanvas && video) {
    const rect = video.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      skeletonCanvas.width = rect.width;
      skeletonCanvas.height = rect.height;
    } else {
      skeletonCanvas.width = 320;
      skeletonCanvas.height = 240;
    }
  }
}

// 1. Initialize Full-Screen Video Engine
const videoEngine = new VideoEngine(domainVideo);

// 2. Initialize Domain Engine
function handleDomainChange(domain) {
  if (!domainBanner) return;

  if (domain) {
    domainBanner.classList.remove('hidden');
    domainBanner.classList.add('visible');
    if (domainBannerTitle) domainBannerTitle.textContent = domain.kanji + ' • ' + domain.name;
    if (domainBannerQuote) domainBannerQuote.textContent = domain.quote;
    if (domainBannerUser) domainBannerUser.textContent = domain.title;

    statusText.textContent = `DOMAIN EXPANSION: ${domain.name} ACTIVE`;
    statusText.style.color = domain.accentColor;
  } else {
    domainBanner.classList.remove('visible');
    setTimeout(() => domainBanner.classList.add('hidden'), 500);

    statusText.textContent = 'Domain dismissed — Cursed staging restored';
    statusText.style.color = '#7dd3fc';
  }
}

const domainEngine = new DomainEngine(videoEngine, handleDomainChange);

// 3. Initialize Technique Engine
const techniqueEngine = new TechniqueEngine(videoEngine);

// 4. Initialize Transparent VFX Overlay Renderer
const renderer = new Renderer(canvas, domainEngine, techniqueEngine);

// 5. Initialize Tutorial UI with Video Customizer
const tutorialUI = new TutorialUI(domainEngine, techniqueEngine, videoEngine);

// 6. Audio Toggle
if (audioToggleBtn) {
  audioToggleBtn.addEventListener('click', () => {
    const isMuted = soundEngine.toggleMute();
    audioToggleBtn.classList.toggle('muted', isMuted);
    audioToggleBtn.title = isMuted ? 'Unmute Audio' : 'Mute Audio';
  });
}

// 7. Initialize Hand Tracker
let tracker = null;

function handleCameraError(err) {
  console.warn('Camera blocked or unavailable:', err);
  if (cameraFallback) {
    cameraFallback.classList.remove('hidden');
  }
  if (statusText) {
    statusText.textContent = 'Camera blocked. Use Tutorial Drawer or Hotkeys [1-4, Q-R, A-D].';
    statusText.style.color = '#f87171';
  }
}

tracker = new HandTracker(
  video,
  (state) => {
    renderer.setInteraction(state);
    tutorialUI.updatePostureFeedback(state.jjk);

    if (!state.active) {
      statusText.textContent = 'Show hand signs or open Tutorial Manual';
      statusText.style.color = '#94a3b8';
      if (statusIndicator) {
        statusIndicator.style.backgroundColor = '#64748b';
        statusIndicator.style.boxShadow = 'none';
      }
      if (previewStatusPill) {
        previewStatusPill.innerHTML = '<span class="status-dot idle"></span>Searching hands...';
        previewStatusPill.classList.remove('active');
      }
      return;
    }

    if (previewStatusPill) {
      previewStatusPill.innerHTML = `<span class="status-dot active"></span>${state.handsCount} Hand${state.handsCount > 1 ? 's' : ''} Tracked`;
      previewStatusPill.classList.add('active');
    }

    if (state.jjk.detectedDomain) {
      const domName = state.jjk.detectedDomain.replace(/_/g, ' ').toUpperCase();
      statusText.textContent = `Channeling Mudra: ${domName} (${Math.round(state.jjk.confidence * 100)}%)`;
      statusText.style.color = '#f59e0b';
      if (statusIndicator) {
        statusIndicator.style.backgroundColor = '#f59e0b';
        statusIndicator.style.boxShadow = '0 0 12px #f59e0b';
      }
    } else if (state.mode === 'pinch') {
      statusText.textContent = 'PINCH — Cursed Condensation';
      statusText.style.color = '#fb7185';
    } else if (state.mode === 'open') {
      statusText.textContent = 'OPEN PALM — Cursed Shockwave';
      statusText.style.color = '#34d399';
    } else {
      statusText.textContent = 'Hand tracked — Form a canonical JJK Mudra';
      statusText.style.color = '#7dd3fc';
    }
  },
  skeletonCanvas,
  handleCameraError
);

video.addEventListener('loadedmetadata', () => {
  syncPreviewCanvasSize();
});

if (refreshBtn) {
  refreshBtn.addEventListener('click', () => {
    window.location.reload();
  });
}

// 8. Keyboard Hotkeys System
window.addEventListener('keydown', (e) => {
  soundEngine.init();

  const key = e.key.toUpperCase();
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  switch (key) {
    // Domains
    case '1':
      domainEngine.activateDomain('infinite_void');
      break;
    case '2':
      domainEngine.activateDomain('malevolent_shrine');
      break;
    case '3':
      domainEngine.activateDomain('chimera_shadow_garden');
      break;
    case '4':
      domainEngine.activateDomain('self_embodiment_of_perfection');
      break;
    case ' ':
      domainEngine.dismissDomain();
      break;

    // Gojo Techniques
    case 'Q':
      techniqueEngine.activateInfinity(cx, cy);
      break;
    case 'W':
      techniqueEngine.executeBlue(cx, cy);
      break;
    case 'E':
      techniqueEngine.executeRed(cx, cy);
      break;
    case 'R':
      techniqueEngine.fireHollowPurple();
      break;

    // Sukuna Techniques
    case 'A':
      techniqueEngine.executeDismantle();
      break;
    case 'S':
      techniqueEngine.executeFireArrow();
      break;

    // Todo Technique
    case 'D':
      techniqueEngine.executeBoogieWoogie();
      break;

    // Audio Toggle
    case 'M':
      if (audioToggleBtn) audioToggleBtn.click();
      break;
  }
});

// 9. Resize Handling
window.addEventListener('resize', () => {
  renderer.resize(window.innerWidth, window.innerHeight);
  syncPreviewCanvasSize();
});

// 10. Animation Loop
let lastTime = performance.now();

function animate(currentTime) {
  const elapsed = currentTime - lastTime;
  lastTime = currentTime;

  const dt = Math.min(elapsed / 16.667, 2.5);

  // If holding detected mudra, channel cursed energy toward domain
  if (tracker && tracker.state.active && tracker.state.jjk.detectedDomain) {
    domainEngine.channelMudra(tracker.state.jjk.detectedDomain, dt);
  } else {
    domainEngine.decayEnergy(dt);
  }

  // Handle dynamic gesture triggers
  if (tracker && tracker.state.active) {
    if (tracker.state.jjk.isClap) {
      techniqueEngine.executeBoogieWoogie();
      tracker.state.jjk.isClap = false;
    }
  }

  // Update Cursed Energy HUD
  if (cursedEnergyBar && cursedEnergyVal) {
    const energyPct = Math.min(100, Math.round((domainEngine.cursedEnergy / CONFIG.CURSED_ENERGY.MAX) * 100));
    cursedEnergyBar.style.width = `${energyPct}%`;
    cursedEnergyVal.textContent = `${energyPct}%`;
  }

  // Render Transparent VFX Overlay
  renderer.draw(dt);

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

// Debug Handle
window.__NOVA__ = {
  config: CONFIG,
  videoEngine,
  domainEngine,
  techniqueEngine,
  renderer,
  soundEngine,
  tracker,
};
