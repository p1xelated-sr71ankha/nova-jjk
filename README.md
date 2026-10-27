# NOVA — Jujutsu Kaisen: Video-Driven Domain Expansion Engine

> **IEEE Application Submission & Interactive Computer Vision Exhibition**  
> *A Zero-Dependency, Real-Time Interactive Experience Driving Full-Screen Anime Videos via MediaPipe Dual-Hand Mudras, Cursed Techniques, and Procedural Web Audio.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Dual_Hands_v0.4-38bdf8)](https://developers.google.com/mediapipe)
[![Video Engine](https://img.shields.io/badge/Video-Full_Screen_Anime_Sync-ef4444)](#)
[![Web Audio](https://img.shields.io/badge/Audio-Procedural_WebAudio_API-c084fc)](#)

---

## 1. Project Overview

**NOVA: Video-Driven Domain Expansion Engine** pairs real-time **MediaPipe Hands** computer vision with high-definition anime video playback. The background particle galaxy has been replaced by a full-screen, hardware-accelerated video engine (`#domain-video-player`) layered underneath transparent dimensional glass fracture VFX, procedural sound effects, and manga-style HUD controls.

When the user performs canonical anime hand signs (mudras) in front of their webcam, the system detects the posture in real time, channels cursed energy, shatters the dimensional boundary, and smoothly transitions into full-screen high-definition anime video clips of each Domain Expansion!

### Supported Canonical Mudras & Anime Videos:
- **Infinite Void (無量空処)** — *Satoru Gojo*: Triggered by the single-hand *Taishakuten (Indra Mudra)* with crossed middle/index fingers. Plays Gojo's iconic Infinite Void expansion video sequence.
- **Malevolent Shrine (伏魔御廚子)** — *Ryomen Sukuna*: Triggered by the dual-hand *Enma-ten Temple Mudra* with index tips touching pointing upward in a gable roof. Plays Sukuna's Malevolent Shrine video sequence.
- **Chimera Shadow Garden (嵌合暗翳庭)** — *Megumi Fushiguro*: Triggered by the *Shadow Puppet Mudra* with interlocked thumbs and spread wings. Plays Megumi's domain expansion video.
- **Self-Embodiment of Perfection (自閉円頓裹)** — *Mahito*: Triggered by cupped soul cage hands. Plays Mahito's domain expansion video.
- **Boogie Woogie (不義遊戯)** — *Aoi Todo*: Triggered by clapping two hands together rapidly in view. Plays Todo's iconic clap and space swap animation.
- **Hollow Technique: Purple (茈)** — *Satoru Gojo*: Triggered by gesture or hotkey `[R]`. Plays Gojo's Hollow Purple snap and destruction beam.
- **Idle State**: A dark, atmospheric Jujutsu Kaisen cursed staging background with ambient kanji seals.

---

## 2. Using Custom & Local Anime Videos

NOVA gives you **100% control over your video clips**:

### Option A: Drop MP4 Files into `assets/videos/`
Simply place your favorite 1080p anime clips into the `nova/assets/videos/` directory using these filenames:
- `assets/videos/gojo_void.mp4` &rarr; Gojo's Infinite Void
- `assets/videos/sukuna_shrine.mp4` &rarr; Sukuna's Malevolent Shrine
- `assets/videos/megumi_shadows.mp4` &rarr; Megumi's Chimera Shadow Garden
- `assets/videos/mahito_domain.mp4` &rarr; Mahito's Domain
- `assets/videos/todo_clap.mp4` &rarr; Todo's Boogie Woogie
- `assets/videos/gojo_purple.mp4` &rarr; Gojo's Hollow Purple
- `assets/videos/idle_cursed.mp4` &rarr; Idle Background

### Option B: On-Screen Video Customizer
1. Click the **"Technique Manual & Video Customizer"** drawer in the HUD.
2. Select any character tab (Gojo, Sukuna, Megumi, Todo).
3. Under **"Video Clip Source"**, click **"📁 Select Local MP4"** to pick any video file from your computer using the native file picker (`URL.createObjectURL`). It binds and plays immediately!
4. Or paste any direct `.mp4` or `.webm` video URL into the link box and click **"Set"**.

---

## 3. Keyboard Hotkeys (100% Accessible Without Camera)

| Hotkey | Ability | Anime Video Effect |
| :---: | :--- | :--- |
| **`[1]`** | Infinite Void | Satoru Gojo's Infinite Void anime video sequence |
| **`[2]`** | Malevolent Shrine | Ryomen Sukuna's Malevolent Shrine anime video sequence |
| **`[3]`** | Chimera Shadow Garden | Megumi Fushiguro's Chimera Shadow Garden video |
| **`[4]`** | Self-Embodiment | Mahito's Self-Embodiment of Perfection video |
| **`[Space]`** | Dismiss Domain | Restores idle dark cursed staging background |
| **`[Q]`** | Limitless: Infinity | Gojo's Infinity deceleration shield overlay |
| **`[W]`** | Lapse: Blue | Singularity vacuum pull |
| **`[E]`** | Reversal: Red | Kinetic explosive burst |
| **`[R]`** | Hollow Purple | Gojo's Hollow Purple anime sequence & projectile |
| **`[A]`** | Dismantle / Cleave | Sukuna's razor-sharp cutting planes across screen |
| **`[S]`** | Furnace: Fire Arrow | Golden plasma arrow detonation |
| **`[D]`** | Boogie Woogie | Aoi Todo's clap animation & space swap |
| **`[M]`** | Toggle Audio | Mute / Unmute procedural sound synthesis |

---

## 4. Procedural Web Audio Engine

Built with native HTML5 Web Audio API — **zero external audio files**:
- **Dimensional Barrier Fracture:** Heavy sub-bass drop ($40\text{ Hz}$) + white noise fracture burst + resonant decaying glass harmonics ($1240\text{ Hz} - 3720\text{ Hz}$).
- **Cursed Energy Sub-Bass Hum:** Modulated low-frequency saw oscillator ($55\text{ Hz}$) with resonant filter.
- **Sukuna's Slicing Blade:** Metallic bandpass pitch sweep ($3200 \to 320\text{ Hz}$).
- **Todo's Boogie Woogie Clap:** Synthesized dual-transient noise burst with room resonance.
- **Hollow Purple:** Dual frequency phase-cancellation warble.

---

## 5. File Manifest

```
nova/
├── index.html                  # Semantic entry point, video background, HUD shell
├── css/
│   └── style.css               # Full-screen video layout, occult styling, drawer UI
├── assets/
│   └── videos/                 # Local directory for user's MP4/WebM video files
├── js/
│   ├── config.js               # Video sources, domain configurations, JJK thresholds
│   ├── video-engine.js         # Full-screen video playback, transitions, local file loader
│   ├── domain-engine.js        # Domain Expansion lifecycle, video sync & glass shatter
│   ├── techniques.js           # Signature moves (Purple video, Dismantle cuts, Clap)
│   ├── gestures-jjk.js         # MediaPipe Mudra classifier (Indra, Enma-ten, Clap)
│   ├── hand-tracker.js         # MediaPipe Hands dual-hand tracker with skeleton overlay
│   ├── renderer.js             # Transparent VFX canvas (shatter lines, slashes, screen shake)
│   ├── audio-synthesizer.js    # 100% procedural Web Audio sound generator
│   ├── tutorial-ui.js          # Interactive SVG mudra guides & video customizer drawer
│   └── main.js                 # Composition root, hotkeys, animation loop
└── README.md                   # Comprehensive documentation & deployment guide
```

---

## 6. Local Execution

```bash
cd nova
python -m http.server 8000
```
Open **`http://localhost:8000`** in Chrome, Edge, or Firefox!

---

## 7. Deployment to GitHub Pages

1. Commit and push:
   ```bash
   cd nova
   git init
   git add -A
   git commit -m "NOVA: Video-Driven Jujutsu Kaisen Domain Expansions"
   git remote add origin https://github.com/YOUR_USERNAME/nova.git
   git branch -M main
   git push -u origin main
   ```
2. Enable GitHub Pages: **Settings &rarr; Pages &rarr; Deploy from branch** (`main` / root).
3. The live application deploys in ~60 seconds with zero build steps!

---

## 8. License

MIT License — Free for academic, personal, and educational submissions.
