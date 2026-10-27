/**
 * NOVA — Jujutsu Kaisen Pictorial Tutorial & Video Customizer Drawer
 *
 * Implements simplified on-screen pictorial guides with handcrafted SVG
 * vector hand illustrations for each canonical anime hand sign:
 * - Gojo's Indra Mudra (Infinite Void)
 * - Sukuna's Enma-ten Shrine Mudra (Malevolent Shrine)
 * - Megumi's Shadow Puppet Mudra (Chimera Shadow Garden)
 * - Todo's Boogie Woogie Clap
 *
 * Features 3-step interactive controls (Posture -> Chant -> Expand),
 * 1-click execution for all signature moves, and a Video Customizer
 * allowing users to select their own local MP4 clips or paste custom URLs!
 */

export class TutorialUI {
  /**
   * @param {import('./domain-engine.js').DomainEngine} domainEngine
   * @param {import('./techniques.js').TechniqueEngine} techniqueEngine
   * @param {import('./video-engine.js').VideoEngine} videoEngine
   */
  constructor(domainEngine, techniqueEngine, videoEngine) {
    this.domainEngine = domainEngine;
    this.techniqueEngine = techniqueEngine;
    this.videoEngine = videoEngine;

    this.drawer = document.getElementById('tutorial-drawer');
    this.toggleBtn = document.getElementById('tutorial-toggle-btn');
    this.closeBtn = document.getElementById('tutorial-close-btn');
    this.tabContainer = document.getElementById('tutorial-tabs');
    this.contentContainer = document.getElementById('tutorial-content');
    this.accuracyBar = document.getElementById('mudra-accuracy-bar');
    this.accuracyText = document.getElementById('mudra-accuracy-text');

    this.activeCharacter = 'gojo'; // 'gojo' | 'sukuna' | 'megumi' | 'todo'
    this.init();
  }

  init() {
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.toggleDrawer());
    }
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeDrawer());
    }

    this.renderTabs();
    this.renderContent();
  }

  toggleDrawer() {
    if (!this.drawer) return;
    this.drawer.classList.toggle('open');
  }

  closeDrawer() {
    if (!this.drawer) return;
    this.drawer.classList.remove('open');
  }

  renderTabs() {
    if (!this.tabContainer) return;

    const characters = [
      { id: 'gojo', name: 'Gojo Satoru', kanji: '五条悟', color: '#38bdf8' },
      { id: 'sukuna', name: 'Ryomen Sukuna', kanji: '両面宿儺', color: '#ef4444' },
      { id: 'megumi', name: 'Megumi', kanji: '伏黒恵', color: '#10b981' },
      { id: 'todo', name: 'Aoi Todo', kanji: '東堂葵', color: '#f59e0b' },
    ];

    this.tabContainer.innerHTML = characters
      .map(
        (c) => `
        <button class="char-tab ${this.activeCharacter === c.id ? 'active' : ''}" data-char="${c.id}" style="--tab-color: ${c.color}">
          <span class="tab-kanji">${c.kanji}</span>
          <span class="tab-name">${c.name}</span>
        </button>
      `
      )
      .join('');

    this.tabContainer.querySelectorAll('.char-tab').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const charId = e.currentTarget.getAttribute('data-char');
        this.activeCharacter = charId;
        this.renderTabs();
        this.renderContent();
      });
    });
  }

  renderContent() {
    if (!this.contentContainer) return;

    if (this.activeCharacter === 'gojo') {
      this.contentContainer.innerHTML = this.getGojoContent();
    } else if (this.activeCharacter === 'sukuna') {
      this.contentContainer.innerHTML = this.getSukunaContent();
    } else if (this.activeCharacter === 'megumi') {
      this.contentContainer.innerHTML = this.getMegumiContent();
    } else if (this.activeCharacter === 'todo') {
      this.contentContainer.innerHTML = this.getTodoContent();
    }

    this.bindActionButtons();
    this.bindVideoCustomizers();
  }

  bindActionButtons() {
    const domainBtn = this.contentContainer.querySelector('.btn-trigger-domain');
    if (domainBtn) {
      domainBtn.addEventListener('click', (e) => {
        const domainId = e.currentTarget.getAttribute('data-domain');
        this.domainEngine.activateDomain(domainId);
      });
    }

    const chantBtn = this.contentContainer.querySelector('.btn-chant');
    if (chantBtn) {
      chantBtn.addEventListener('click', (e) => {
        const domainId = e.currentTarget.getAttribute('data-domain');
        this.domainEngine.channelMudra(domainId, 120);
      });
    }

    this.contentContainer.querySelectorAll('.btn-technique').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const tech = e.currentTarget.getAttribute('data-tech');
        this.triggerTechnique(tech);
      });
    });
  }

  bindVideoCustomizers() {
    // Local File Picker
    const fileInput = this.contentContainer.querySelector('.video-file-input');
    const pickBtn = this.contentContainer.querySelector('.btn-pick-video');
    const urlInput = this.contentContainer.querySelector('.video-url-input');
    const setUrlBtn = this.contentContainer.querySelector('.btn-set-url');
    const statusLabel = this.contentContainer.querySelector('.custom-video-status');

    if (pickBtn && fileInput) {
      pickBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const targetKey = pickBtn.getAttribute('data-target-key');
          this.videoEngine.setCustomVideoSource(targetKey, file);
          if (statusLabel) {
            statusLabel.textContent = `Custom Local Video: ${file.name}`;
            statusLabel.style.color = '#34d399';
          }
        }
      });
    }

    if (setUrlBtn && urlInput) {
      setUrlBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (url) {
          const targetKey = setUrlBtn.getAttribute('data-target-key');
          this.videoEngine.setCustomVideoSource(targetKey, url);
          if (statusLabel) {
            statusLabel.textContent = `Custom URL Set`;
            statusLabel.style.color = '#38bdf8';
          }
        }
      });
    }
  }

  triggerTechnique(tech) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    switch (tech) {
      case 'infinity':
        this.techniqueEngine.activateInfinity(cx, cy);
        break;
      case 'blue':
        this.techniqueEngine.executeBlue(cx, cy);
        break;
      case 'red':
        this.techniqueEngine.executeRed(cx, cy);
        break;
      case 'purple':
        this.techniqueEngine.fireHollowPurple();
        break;
      case 'dismantle':
        this.techniqueEngine.executeDismantle();
        break;
      case 'fire_arrow':
        this.techniqueEngine.executeFireArrow();
        break;
      case 'boogie_woogie':
        this.techniqueEngine.executeBoogieWoogie();
        break;
    }
  }

  updatePostureFeedback(jjkClass) {
    if (!this.accuracyBar || !this.accuracyText) return;

    let targetScore = 0;
    if (this.activeCharacter === 'gojo') {
      targetScore = jjkClass.mudraScores.infinite_void || 0;
    } else if (this.activeCharacter === 'sukuna') {
      targetScore = jjkClass.mudraScores.malevolent_shrine || 0;
    } else if (this.activeCharacter === 'megumi') {
      targetScore = jjkClass.mudraScores.chimera_shadow_garden || 0;
    }

    const pct = Math.round(targetScore * 100);
    this.accuracyBar.style.width = `${pct}%`;
    this.accuracyText.textContent = `Mudra Match: ${pct}%`;

    if (pct >= 75) {
      this.accuracyBar.style.backgroundColor = '#38bdf8';
    } else if (pct >= 40) {
      this.accuracyBar.style.backgroundColor = '#fbbf24';
    } else {
      this.accuracyBar.style.backgroundColor = '#64748b';
    }
  }

  // ========================================================
  // CONTENT TEMPLATES & VIDEO CUSTOMIZERS
  // ========================================================

  getGojoContent() {
    return `
      <div class="tutorial-card gojo-theme">
        <div class="card-header">
          <div class="domain-title">
            <span class="kanji-badge">無量空処</span>
            <h3>Domain: Infinite Void</h3>
          </div>
          <span class="user-pill">Satoru Gojo</span>
        </div>

        <!-- Handcrafted SVG Mudra Illustration -->
        <div class="mudra-illustration-box">
          <svg class="hand-svg" viewBox="0 0 200 200" width="160" height="160">
            <path d="M70,180 L70,120 C70,105 85,95 100,95 C115,95 130,105 130,120 L130,180 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5" />
            <path d="M115,100 C125,100 135,110 132,125 C129,135 118,135 112,125" fill="#0f172a" stroke="#64748b" stroke-width="2" />
            <path d="M125,115 C135,115 142,125 138,138 C135,148 125,148 120,138" fill="#0f172a" stroke="#64748b" stroke-width="2" />
            <path d="M75,130 C65,115 85,110 105,115" fill="none" stroke="#fb7185" stroke-width="3" stroke-linecap="round" />
            <path d="M92,95 L92,35 C92,26 102,26 102,35 L102,95" fill="#0f172a" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round" />
            <path d="M106,95 L106,45 C106,30 90,30 96,25 C100,20 114,28 114,45 L114,95" fill="#0f172a" stroke="#fbbf24" stroke-width="3.5" stroke-linecap="round" />
            <circle cx="98" cy="28" r="5" fill="#ffffff" />
            <circle cx="98" cy="28" r="9" fill="none" stroke="#fbbf24" stroke-width="1.5" />
          </svg>
          <div class="mudra-caption">
            <strong>Taishakuten (Indra Mudra)</strong>
            <span>Cross middle finger over index finger; hold ring & pinky tight into palm.</span>
          </div>
        </div>

        <!-- 3-Step Interactive Workflow -->
        <div class="steps-flow">
          <div class="step-item">
            <div class="step-num">1</div>
            <div class="step-details">
              <strong>Form Hand Sign</strong>
              <span>Hold pose in camera view or inspect match meter</span>
            </div>
          </div>
          <div class="step-item">
            <div class="step-num">2</div>
            <div class="step-details">
              <strong>Chant & Focus</strong>
              <span>Hold 1.2s to charge cursed energy</span>
              <button class="step-btn btn-chant" data-domain="infinite_void">Channel Energy</button>
            </div>
          </div>
          <div class="step-item">
            <div class="step-num">3</div>
            <div class="step-details">
              <strong>Expand Domain</strong>
              <span>Plays Infinite Void anime video sequence</span>
              <button class="step-btn btn-trigger-domain" data-domain="infinite_void">Expand Domain [1]</button>
            </div>
          </div>
        </div>

        <!-- Video Source Customizer -->
        <div class="video-customizer-box">
          <div class="customizer-header">
            <span class="customizer-title">📹 Video Clip Source</span>
            <span class="custom-video-status">Streaming Anime Video Active</span>
          </div>
          <p class="customizer-desc">Drop your favorite 1080p Gojo clip or paste a direct video link:</p>
          <div class="customizer-actions">
            <input type="file" class="video-file-input" accept="video/mp4,video/webm" style="display: none;">
            <button class="btn-pick-video" data-target-key="infinite_void">📁 Select Local MP4</button>
            <div class="url-input-row">
              <input type="text" class="video-url-input" placeholder="Paste .mp4 / .webm link">
              <button class="btn-set-url" data-target-key="infinite_void">Set</button>
            </div>
          </div>
        </div>

        <!-- Signature Techniques -->
        <div class="tech-section">
          <h4>Gojo Signature Techniques</h4>
          <div class="tech-grid">
            <button class="btn-technique" data-tech="infinity">
              <span class="tech-badge">Q</span>
              <span class="tech-name">Infinity</span>
            </button>
            <button class="btn-technique" data-tech="blue">
              <span class="tech-badge">W</span>
              <span class="tech-name">Lapse: Blue</span>
            </button>
            <button class="btn-technique" data-tech="red">
              <span class="tech-badge">E</span>
              <span class="tech-name">Reversal: Red</span>
            </button>
            <button class="btn-technique" data-tech="purple">
              <span class="tech-badge">R</span>
              <span class="tech-name">Hollow Purple</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  getSukunaContent() {
    return `
      <div class="tutorial-card sukuna-theme">
        <div class="card-header">
          <div class="domain-title">
            <span class="kanji-badge red">伏魔御廚子</span>
            <h3>Domain: Malevolent Shrine</h3>
          </div>
          <span class="user-pill red">Ryomen Sukuna</span>
        </div>

        <div class="mudra-illustration-box">
          <svg class="hand-svg" viewBox="0 0 200 200" width="160" height="160">
            <path d="M50,160 L75,100 C80,90 90,85 100,60" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" />
            <path d="M150,160 L125,100 C120,90 110,85 100,60" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" />
            <circle cx="100" cy="60" r="6" fill="#f87171" />
            <path d="M70,140 C85,135 115,135 130,140" fill="none" stroke="#f97316" stroke-width="2.5" />
            <path d="M85,105 L115,115 M85,118 L115,105" stroke="#ef4444" stroke-width="2" />
          </svg>
          <div class="mudra-caption">
            <strong>Enma-ten Temple Mudra</strong>
            <span>Clasp both hands; press index fingertips together pointing upward in a temple roof.</span>
          </div>
        </div>

        <div class="steps-flow">
          <div class="step-item">
            <div class="step-num">1</div>
            <div class="step-details">
              <strong>Dual-Hand Clasp</strong>
              <span>Bring both hands into camera frame</span>
            </div>
          </div>
          <div class="step-item">
            <div class="step-num">2</div>
            <div class="step-details">
              <strong>Form Gable Roof</strong>
              <span>Index tips touching pointing upward</span>
              <button class="step-btn btn-chant" data-domain="malevolent_shrine">Channel Energy</button>
            </div>
          </div>
          <div class="step-item">
            <div class="step-num">3</div>
            <div class="step-details">
              <strong>Malevolent Shrine</strong>
              <span>Plays Malevolent Shrine anime video sequence</span>
              <button class="step-btn btn-trigger-domain" data-domain="malevolent_shrine">Expand Domain [2]</button>
            </div>
          </div>
        </div>

        <div class="video-customizer-box">
          <div class="customizer-header">
            <span class="customizer-title">📹 Video Clip Source</span>
            <span class="custom-video-status">Streaming Anime Video Active</span>
          </div>
          <p class="customizer-desc">Select your Sukuna Malevolent Shrine video:</p>
          <div class="customizer-actions">
            <input type="file" class="video-file-input" accept="video/mp4,video/webm" style="display: none;">
            <button class="btn-pick-video" data-target-key="malevolent_shrine">📁 Select Local MP4</button>
            <div class="url-input-row">
              <input type="text" class="video-url-input" placeholder="Paste .mp4 / .webm link">
              <button class="btn-set-url" data-target-key="malevolent_shrine">Set</button>
            </div>
          </div>
        </div>

        <div class="tech-section">
          <h4>Sukuna Signature Techniques</h4>
          <div class="tech-grid">
            <button class="btn-technique" data-tech="dismantle">
              <span class="tech-badge">A</span>
              <span class="tech-name">Dismantle / Cleave</span>
            </button>
            <button class="btn-technique" data-tech="fire_arrow">
              <span class="tech-badge">S</span>
              <span class="tech-name">Furnace: Fire Arrow</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  getMegumiContent() {
    return `
      <div class="tutorial-card megumi-theme">
        <div class="card-header">
          <div class="domain-title">
            <span class="kanji-badge green">嵌合暗翳庭</span>
            <h3>Domain: Chimera Shadow Garden</h3>
          </div>
          <span class="user-pill green">Megumi Fushiguro</span>
        </div>

        <div class="mudra-illustration-box">
          <svg class="hand-svg" viewBox="0 0 200 200" width="160" height="160">
            <ellipse cx="100" cy="110" rx="14" ry="8" fill="#10b981" />
            <path d="M90,110 L45,70 M90,115 L40,90 M90,120 L45,115" stroke="#34d399" stroke-width="3" stroke-linecap="round" />
            <path d="M110,110 L155,70 M110,115 L160,90 M110,120 L155,115" stroke="#34d399" stroke-width="3" stroke-linecap="round" />
          </svg>
          <div class="mudra-caption">
            <strong>Shadow Puppet Mudra</strong>
            <span>Hook thumbs together with fingers splayed outward like wings.</span>
          </div>
        </div>

        <div class="steps-flow">
          <div class="step-item">
            <div class="step-num">1</div>
            <div class="step-details">
              <strong>Hook Thumbs</strong>
              <span>Interlock thumbs facing camera</span>
            </div>
          </div>
          <div class="step-item">
            <div class="step-num">2</div>
            <div class="step-details">
              <strong>Spread Shadow Wings</strong>
              <button class="step-btn btn-chant" data-domain="chimera_shadow_garden">Channel Energy</button>
            </div>
          </div>
          <div class="step-item">
            <div class="step-num">3</div>
            <div class="step-details">
              <strong>Chimera Shadow Garden</strong>
              <span>Plays Chimera Shadow Garden anime video</span>
              <button class="step-btn btn-trigger-domain" data-domain="chimera_shadow_garden">Expand Domain [3]</button>
            </div>
          </div>
        </div>

        <div class="video-customizer-box">
          <div class="customizer-header">
            <span class="customizer-title">📹 Video Clip Source</span>
            <span class="custom-video-status">Streaming Anime Video Active</span>
          </div>
          <div class="customizer-actions">
            <input type="file" class="video-file-input" accept="video/mp4,video/webm" style="display: none;">
            <button class="btn-pick-video" data-target-key="chimera_shadow_garden">📁 Select Local MP4</button>
            <div class="url-input-row">
              <input type="text" class="video-url-input" placeholder="Paste .mp4 / .webm link">
              <button class="btn-set-url" data-target-key="chimera_shadow_garden">Set</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getTodoContent() {
    return `
      <div class="tutorial-card todo-theme">
        <div class="card-header">
          <div class="domain-title">
            <span class="kanji-badge amber">不義遊戯</span>
            <h3>Ability: Boogie Woogie</h3>
          </div>
          <span class="user-pill amber">Aoi Todo</span>
        </div>

        <div class="mudra-illustration-box">
          <svg class="hand-svg" viewBox="0 0 200 200" width="160" height="160">
            <path d="M50,100 L85,100 C92,90 92,110 85,100" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" />
            <path d="M150,100 L115,100 C108,90 108,110 115,100" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" />
            <circle cx="100" cy="100" r="16" fill="none" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4,4" />
            <circle cx="100" cy="100" r="30" fill="none" stroke="#f59e0b" stroke-width="1.5" />
          </svg>
          <div class="mudra-caption">
            <strong>The 530,000 IQ Clap</strong>
            <span>Clap two hands together rapidly in view to trigger the space swap video and sound.</span>
          </div>
        </div>

        <div class="steps-flow">
          <div class="step-item">
            <div class="step-num">1</div>
            <div class="step-details">
              <strong>Clap Hands in View</strong>
              <span>Or press D / button below</span>
            </div>
          </div>
          <div class="step-item">
            <div class="step-num">2</div>
            <div class="step-details">
              <strong>Execute Boogie Woogie</strong>
              <button class="step-btn btn-technique" data-tech="boogie_woogie">Execute Clap [D]</button>
            </div>
          </div>
        </div>

        <div class="video-customizer-box">
          <div class="customizer-header">
            <span class="customizer-title">📹 Video Clip Source</span>
            <span class="custom-video-status">Streaming Anime Video Active</span>
          </div>
          <div class="customizer-actions">
            <input type="file" class="video-file-input" accept="video/mp4,video/webm" style="display: none;">
            <button class="btn-pick-video" data-target-key="boogie_woogie">📁 Select Local MP4</button>
            <div class="url-input-row">
              <input type="text" class="video-url-input" placeholder="Paste .mp4 / .webm link">
              <button class="btn-set-url" data-target-key="boogie_woogie">Set</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
