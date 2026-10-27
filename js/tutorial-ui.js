/**
 * Jujutsu Kaisen Hand Sign (Mudra) Manual & Technique Studio
 *
 * Provides handcrafted anatomical hand sign diagrams, step-by-step
 * finger placement tutorials, technique breakdowns, and real-time
 * camera alignment guides in 100% English.
 */

export class TutorialUI {
  /**
   * @param {import('./domain-engine.js').DomainEngine} domainEngine
   * @param {import('./techniques.js').TechniqueEngine} techniqueEngine
   * @param {import('./video-engine.js').VideoEngine} videoEngine
   * @param {import('./hand-tracker.js').HandTracker} [handTracker]
   */
  constructor(domainEngine, techniqueEngine, videoEngine, handTracker = null) {
    this.domainEngine = domainEngine;
    this.techniqueEngine = techniqueEngine;
    this.videoEngine = videoEngine;
    this.handTracker = handTracker;

    this.drawer = document.getElementById('tutorial-drawer');
    this.toggleBtn = document.getElementById('tutorial-toggle-btn');
    this.closeBtn = document.getElementById('tutorial-close-btn');
    this.tabContainer = document.getElementById('tutorial-tabs');
    this.contentContainer = document.getElementById('tutorial-content');
    this.accuracyBar = document.getElementById('mudra-accuracy-bar');
    this.accuracyText = document.getElementById('mudra-accuracy-text');

    this.activeCharacter = 'gojo'; // 'gojo' | 'sukuna' | 'megumi' | 'mahito' | 'todo' | 'hakari' | 'yuta'
    this.init();
  }

  setHandTracker(tracker) {
    this.handTracker = tracker;
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
      { id: 'gojo', name: 'Gojo', role: 'Infinite Void', color: '#38bdf8' },
      { id: 'sukuna', name: 'Sukuna', role: 'Malevolent Shrine', color: '#ef4444' },
      { id: 'megumi', name: 'Megumi', role: 'Shadow Garden', color: '#10b981' },
      { id: 'mahito', name: 'Mahito', role: 'Self-Embodiment', color: '#ec4899' },
      { id: 'todo', name: 'Todo', role: 'Boogie Woogie', color: '#f59e0b' },
      { id: 'hakari', name: 'Hakari', role: 'Death Gamble', color: '#eab308' },
      { id: 'yuta', name: 'Yuta', role: 'Mutual Love', color: '#8b5cf6' },
    ];

    this.tabContainer.innerHTML = characters
      .map(
        (c) => `
        <button class="char-tab ${this.activeCharacter === c.id ? 'active' : ''}" data-char="${c.id}" style="--tab-accent: ${c.color}">
          <span class="tab-primary-name">${c.name}</span>
          <span class="tab-sub-role">${c.role}</span>
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

        // Update Ghost guide on webcam
        const mudraMap = {
          gojo: 'infinite_void',
          sukuna: 'malevolent_shrine',
          megumi: 'chimera_shadow_garden',
          mahito: 'self_embodiment',
          todo: 'boogie_woogie',
          hakari: 'idle_death_gamble',
          yuta: 'authentic_mutual_love',
        };
        if (this.handTracker && mudraMap[charId]) {
          this.handTracker.setGhostGuide(mudraMap[charId]);
        }
      });
    });
  }

  renderContent() {
    if (!this.contentContainer) return;

    switch (this.activeCharacter) {
      case 'gojo':
        this.contentContainer.innerHTML = this.getGojoContent();
        break;
      case 'sukuna':
        this.contentContainer.innerHTML = this.getSukunaContent();
        break;
      case 'megumi':
        this.contentContainer.innerHTML = this.getMegumiContent();
        break;
      case 'mahito':
        this.contentContainer.innerHTML = this.getMahitoContent();
        break;
      case 'todo':
        this.contentContainer.innerHTML = this.getTodoContent();
        break;
      case 'hakari':
        this.contentContainer.innerHTML = this.getHakariContent();
        break;
      case 'yuta':
        this.contentContainer.innerHTML = this.getYutaContent();
        break;
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

    const ghostBtn = this.contentContainer.querySelector('.btn-ghost-toggle');
    if (ghostBtn && this.handTracker) {
      ghostBtn.addEventListener('click', () => {
        const enabled = this.handTracker.toggleGhostGuide();
        ghostBtn.textContent = enabled ? 'Ghost Alignment Guide: ON' : 'Ghost Alignment Guide: OFF';
        ghostBtn.classList.toggle('active', enabled);
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
    const fileInput = this.contentContainer.querySelector('.video-file-input');
    const pickBtn = this.contentContainer.querySelector('.btn-pick-video');
    const statusLabel = this.contentContainer.querySelector('.custom-video-status');

    if (pickBtn && fileInput) {
      pickBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const targetKey = pickBtn.getAttribute('data-target-key');
          this.videoEngine.setCustomVideoSource(targetKey, file);
          if (statusLabel) {
            statusLabel.textContent = `Custom Video Loaded: ${file.name}`;
            statusLabel.style.color = '#34d399';
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
    if (this.activeCharacter === 'gojo') targetScore = jjkClass.mudraScores.infinite_void || 0;
    else if (this.activeCharacter === 'sukuna') targetScore = jjkClass.mudraScores.malevolent_shrine || 0;
    else if (this.activeCharacter === 'megumi') targetScore = jjkClass.mudraScores.chimera_shadow_garden || 0;
    else if (this.activeCharacter === 'mahito') targetScore = jjkClass.mudraScores.self_embodiment || 0;
    else if (this.activeCharacter === 'hakari') targetScore = jjkClass.mudraScores.idle_death_gamble || 0;
    else if (this.activeCharacter === 'yuta') targetScore = jjkClass.mudraScores.authentic_mutual_love || 0;

    const pct = Math.round(targetScore * 100);
    this.accuracyBar.style.width = `${pct}%`;
    this.accuracyText.textContent = `Hand Sign Match: ${pct}%`;

    if (pct >= 72) {
      this.accuracyBar.style.backgroundColor = '#38bdf8';
    } else if (pct >= 40) {
      this.accuracyBar.style.backgroundColor = '#fbbf24';
    } else {
      this.accuracyBar.style.backgroundColor = '#64748b';
    }
  }

  // ========================================================
  // CHARACTER CARDS & CLEAR ANATOMICAL GUIDES (100% ENGLISH)
  // ========================================================

  getGojoContent() {
    return `
      <div class="tutorial-card">
        <div class="card-hero">
          <div class="card-hero-text">
            <span class="character-tag cyan">Satoru Gojo • Special Grade</span>
            <h3>Domain: Infinite Void</h3>
            <p class="seal-subtitle">Canonical Hand Sign: The Indra Seal</p>
          </div>
          <button class="ghost-toggle-btn btn-ghost-toggle active">Ghost Alignment: ON</button>
        </div>

        <!-- Handcrafted Anatomical Hand Sign Diagram -->
        <div class="diagram-container">
          <div class="diagram-canvas-wrap">
            <svg class="hand-svg" viewBox="0 0 240 240" width="180" height="180">
              <!-- Wrist & Palm Contour -->
              <path d="M85,230 L85,150 C85,130 95,115 110,115 C130,115 145,130 145,150 L145,230" fill="#131b2e" stroke="#38bdf8" stroke-width="2.5" />
              <!-- Curled Ring & Pinky -->
              <path d="M135,135 C150,135 160,145 155,165 C150,180 135,180 128,168" fill="#1e293b" stroke="#0284c7" stroke-width="2" />
              <path d="M120,135 C135,135 145,148 140,168 C135,182 122,182 115,168" fill="#1e293b" stroke="#0284c7" stroke-width="2" />
              <!-- Thumb Tuck -->
              <path d="M85,160 C75,140 100,135 125,145 C130,147 132,155 125,158 C105,155 85,165 85,160 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
              <!-- Extended Index Finger -->
              <path d="M102,115 L102,40 C102,28 114,28 114,40 L114,115" fill="#131b2e" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" />
              <!-- Middle Finger Crossing Over Index -->
              <path d="M118,115 L118,55 C118,40 100,40 104,30 C108,22 126,30 126,55 L126,115" fill="#1e293b" stroke="#fbbf24" stroke-width="3.5" stroke-linecap="round" />
              <!-- Callout Indicators -->
              <circle cx="108" cy="35" r="9" fill="#fbbf24" />
              <text x="108" y="39" font-size="11" fill="#090d16" font-weight="bold" text-anchor="middle">1</text>
              <circle cx="92" cy="70" r="8" fill="#38bdf8" />
              <text x="92" y="74" font-size="10" fill="#090d16" font-weight="bold" text-anchor="middle">2</text>
              <circle cx="150" cy="155" r="8" fill="#38bdf8" />
              <text x="150" y="159" font-size="10" fill="#090d16" font-weight="bold" text-anchor="middle">3</text>
            </svg>
          </div>
          <div class="callout-list">
            <div class="callout-item">
              <span class="callout-badge yellow">1</span>
              <span><strong>Cross Middle over Index:</strong> Middle finger curls tightly over top of extended index finger.</span>
            </div>
            <div class="callout-item">
              <span class="callout-badge cyan">2</span>
              <span><strong>Keep Index Upright:</strong> Point index straight upward at chin level.</span>
            </div>
            <div class="callout-item">
              <span class="callout-badge cyan">3</span>
              <span><strong>Lock Ring & Pinky:</strong> Tuck ring and pinky flat into palm, clamped firmly by thumb.</span>
            </div>
          </div>
        </div>

        <!-- Incantation / Chant -->
        <div class="incantation-card">
          <div class="incantation-label">DOMAIN INCANTATION</div>
          <div class="incantation-quote">"Phase. Paramita. Light of Nine Ropes. Domain Expansion: Infinite Void."</div>
        </div>

        <!-- Step-by-Step Practical Guide -->
        <div class="guide-steps">
          <div class="guide-step">
            <div class="step-circle">1</div>
            <div class="step-content">
              <strong>Raise Your Right Hand to Chin Level</strong>
              <span>Hold palm facing your webcam approximately 40 to 50 cm away.</span>
            </div>
          </div>
          <div class="guide-step">
            <div class="step-circle">2</div>
            <div class="step-content">
              <strong>Form the Indra Crossing</strong>
              <span>Cross middle finger over index while keeping ring & pinky locked.</span>
            </div>
          </div>
          <div class="guide-step">
            <div class="step-circle">3</div>
            <div class="step-content">
              <strong>Channel Cursed Energy</strong>
              <span>Hold pose for 1.2 seconds until cursed energy meter fills to 70%.</span>
              <button class="action-btn btn-chant" data-domain="infinite_void">Channel Energy</button>
            </div>
          </div>
          <div class="guide-step">
            <div class="step-circle">4</div>
            <div class="step-content">
              <strong>Execute Domain Expansion</strong>
              <span>Triggers central singularity accretion disk & infinite data stream VFX.</span>
              <button class="action-btn primary btn-trigger-domain" data-domain="infinite_void">Expand Domain [1]</button>
            </div>
          </div>
        </div>

        <!-- Technique Quick Cast -->
        <div class="technique-section">
          <h4>Satoru Gojo Techniques</h4>
          <div class="technique-grid">
            <button class="tech-btn" data-tech="infinity"><span class="key-tag">Q</span>Limitless Shield</button>
            <button class="tech-btn" data-tech="blue"><span class="key-tag">W</span>Lapse: Blue</button>
            <button class="tech-btn" data-tech="red"><span class="key-tag">E</span>Reversal: Red</button>
            <button class="tech-btn" data-tech="purple"><span class="key-tag">R</span>Hollow Purple</button>
          </div>
        </div>
      </div>
    `;
  }

  getSukunaContent() {
    return `
      <div class="tutorial-card">
        <div class="card-hero">
          <div class="card-hero-text">
            <span class="character-tag red">Ryomen Sukuna • King of Curses</span>
            <h3>Domain: Malevolent Shrine</h3>
            <p class="seal-subtitle">Canonical Hand Sign: The Enma Shrine Seal</p>
          </div>
          <button class="ghost-toggle-btn btn-ghost-toggle active">Ghost Alignment: ON</button>
        </div>

        <div class="diagram-container">
          <div class="diagram-canvas-wrap">
            <svg class="hand-svg" viewBox="0 0 240 240" width="180" height="180">
              <!-- Left Palm Clasp -->
              <path d="M50,190 L80,110 C85,95 95,85 110,50" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" />
              <!-- Right Palm Clasp -->
              <path d="M190,190 L160,110 C155,95 145,85 130,50" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" />
              <!-- Gable Roof Apex -->
              <circle cx="120" cy="50" r="9" fill="#ef4444" />
              <text x="120" y="54" font-size="11" fill="#ffffff" font-weight="bold" text-anchor="middle">1</text>
              <!-- Interlocked Knuckles Inside -->
              <path d="M90,120 L150,120 M95,135 L145,135 M100,150 L140,150" stroke="#b91c1c" stroke-width="2.5" stroke-linecap="round" />
              <!-- Thumbs Tucked Inward -->
              <path d="M80,155 C95,145 105,140 115,150" fill="none" stroke="#f97316" stroke-width="2.5" />
              <path d="M160,155 C145,145 135,140 125,150" fill="none" stroke="#f97316" stroke-width="2.5" />
              <!-- Pinky Base Contact -->
              <circle cx="120" cy="180" r="8" fill="#f87171" />
              <text x="120" y="184" font-size="10" fill="#ffffff" font-weight="bold" text-anchor="middle">2</text>
            </svg>
          </div>
          <div class="callout-list">
            <div class="callout-item">
              <span class="callout-badge red">1</span>
              <span><strong>Roof Gable Apex:</strong> Press index fingertips together pointing straight up to form the sharp roof ridge.</span>
            </div>
            <div class="callout-item">
              <span class="callout-badge red">2</span>
              <span><strong>Tuck Thumbs & Pinkies:</strong> Tuck thumbs inward against palms; touch pinky finger bases together.</span>
            </div>
            <div class="callout-item">
              <span class="callout-badge red">3</span>
              <span><strong>Interlock Inner Knuckles:</strong> Keep middle and ring fingers clasped together inside.</span>
            </div>
          </div>
        </div>

        <div class="incantation-card">
          <div class="incantation-label">DOMAIN INCANTATION</div>
          <div class="incantation-quote">"Scale of the Dragon. Recoil. Twin Meteors. Domain Expansion: Malevolent Shrine."</div>
        </div>

        <div class="guide-steps">
          <div class="guide-step">
            <div class="step-circle">1</div>
            <div class="step-content">
              <strong>Bring Both Hands to Center Chest</strong>
              <span>Palms facing each other in dual prayer position.</span>
            </div>
          </div>
          <div class="guide-step">
            <div class="step-circle">2</div>
            <div class="step-content">
              <strong>Form the Shrine Gable</strong>
              <span>Touch index tips together pointing straight up.</span>
            </div>
          </div>
          <div class="guide-step">
            <div class="step-circle">3</div>
            <div class="step-content">
              <strong>Expand Malevolent Shrine</strong>
              <span>Triggers Blood Sky, Skull Shrine & Continuous Dismantle cutting barrage.</span>
              <button class="action-btn primary btn-trigger-domain" data-domain="malevolent_shrine">Expand Domain [2]</button>
            </div>
          </div>
        </div>

        <div class="technique-section">
          <h4>Ryomen Sukuna Techniques</h4>
          <div class="technique-grid">
            <button class="tech-btn" data-tech="dismantle"><span class="key-tag">A</span>Dismantle / Cleave</button>
            <button class="tech-btn" data-tech="fire_arrow"><span class="key-tag">S</span>Furnace: Fire Arrow</button>
          </div>
        </div>
      </div>
    `;
  }

  getMegumiContent() {
    return `
      <div class="tutorial-card">
        <div class="card-hero">
          <div class="card-hero-text">
            <span class="character-tag green">Megumi Fushiguro • Ten Shadows</span>
            <h3>Domain: Chimera Shadow Garden</h3>
            <p class="seal-subtitle">Canonical Hand Sign: The Shadow Puppet Seal</p>
          </div>
          <button class="ghost-toggle-btn btn-ghost-toggle active">Ghost Alignment: ON</button>
        </div>

        <div class="diagram-container">
          <div class="diagram-canvas-wrap">
            <svg class="hand-svg" viewBox="0 0 240 240" width="180" height="180">
              <!-- Interlocked Thumbs -->
              <ellipse cx="120" cy="130" rx="18" ry="12" fill="#10b981" stroke="#34d399" stroke-width="2" />
              <circle cx="120" cy="130" r="8" fill="#ffffff" />
              <text x="120" y="134" font-size="10" fill="#064e3b" font-weight="bold" text-anchor="middle">1</text>
              <!-- Left Wing Spread -->
              <path d="M110,130 L45,80 M108,135 L38,105 M105,140 L42,130 M102,145 L50,155" stroke="#34d399" stroke-width="3" stroke-linecap="round" />
              <!-- Right Wing Spread -->
              <path d="M130,130 L195,80 M132,135 L202,105 M135,140 L198,130 M138,145 L190,155" stroke="#34d399" stroke-width="3" stroke-linecap="round" />
              <circle cx="195" cy="80" r="8" fill="#34d399" />
              <text x="195" y="84" font-size="10" fill="#064e3b" font-weight="bold" text-anchor="middle">2</text>
            </svg>
          </div>
          <div class="callout-list">
            <div class="callout-item">
              <span class="callout-badge green">1</span>
              <span><strong>Interlock Both Thumbs:</strong> Hook thumb knuckles firmly together facing your chest.</span>
            </div>
            <div class="callout-item">
              <span class="callout-badge green">2</span>
              <span><strong>Spread 8 Wing Fingers:</strong> Splay all remaining 8 fingers wide outward like Nue's wings.</span>
            </div>
          </div>
        </div>

        <div class="incantation-card">
          <div class="incantation-label">DOMAIN INCANTATION</div>
          <div class="incantation-quote">"Even if it is incomplete, even if it is ugly... burst forth! Domain Expansion: Chimera Shadow Garden!"</div>
        </div>

        <div class="guide-steps">
          <div class="guide-step">
            <div class="step-circle">1</div>
            <div class="step-content">
              <strong>Hook Thumbs & Fan Fingers Outward</strong>
              <span>Position hands ~40cm away from camera.</span>
            </div>
          </div>
          <div class="guide-step">
            <div class="step-circle">2</div>
            <div class="step-content">
              <strong>Expand Shadow Garden</strong>
              <span>Triggers rising liquid shadow pool, soaring Nue & glowing eyes.</span>
              <button class="action-btn primary btn-trigger-domain" data-domain="chimera_shadow_garden">Expand Domain [3]</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getMahitoContent() {
    return `
      <div class="tutorial-card">
        <div class="card-hero">
          <div class="card-hero-text">
            <span class="character-tag pink">Mahito • Cursed Spirit</span>
            <h3>Domain: Self-Embodiment of Perfection</h3>
            <p class="seal-subtitle">Canonical Hand Sign: The Soul Lotus Clasp</p>
          </div>
          <button class="ghost-toggle-btn btn-ghost-toggle active">Ghost Alignment: ON</button>
        </div>

        <div class="diagram-container">
          <div class="diagram-canvas-wrap">
            <svg class="hand-svg" viewBox="0 0 240 240" width="180" height="180">
              <!-- Cupped Woven Cage -->
              <path d="M60,160 C50,110 70,80 100,75 C115,75 120,95 110,120" fill="none" stroke="#ec4899" stroke-width="3" stroke-linecap="round" />
              <path d="M180,160 C190,110 170,80 140,75 C125,75 120,95 130,120" fill="none" stroke="#ec4899" stroke-width="3" stroke-linecap="round" />
              <circle cx="120" cy="100" r="12" fill="#ec4899" />
              <text x="120" y="104" font-size="10" fill="#ffffff" font-weight="bold" text-anchor="middle">1</text>
              <path d="M90,140 C105,130 135,130 150,140" stroke="#f472b6" stroke-width="2.5" />
            </svg>
          </div>
          <div class="callout-list">
            <div class="callout-item">
              <span class="callout-badge pink">1</span>
              <span><strong>Weave Hollow Lotus Cage:</strong> Cup palms inward towards throat, interlacing fingers inside a hollow sphere.</span>
            </div>
          </div>
        </div>

        <div class="incantation-card">
          <div class="incantation-label">DOMAIN INCANTATION</div>
          <div class="incantation-quote">"This is the true shape of my soul... Domain Expansion: Self-Embodiment of Perfection."</div>
        </div>

        <div class="guide-steps">
          <div class="guide-step">
            <div class="step-circle">1</div>
            <div class="step-content">
              <strong>Form Cupped Lotus Hands</strong>
              <span>Triggers woven giant hands enclosing the screen & heartbeat pulse.</span>
              <button class="action-btn primary btn-trigger-domain" data-domain="self_embodiment_of_perfection">Expand Domain [4]</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getTodoContent() {
    return `
      <div class="tutorial-card">
        <div class="card-hero">
          <div class="card-hero-text">
            <span class="character-tag amber">Aoi Todo • Grade 1 Sorcerer</span>
            <h3>Innate Technique: Boogie Woogie</h3>
            <p class="seal-subtitle">Physical Trigger: The Percussive Hand Clap</p>
          </div>
        </div>

        <div class="diagram-container">
          <div class="diagram-canvas-wrap">
            <svg class="hand-svg" viewBox="0 0 240 240" width="180" height="180">
              <path d="M40,120 L95,120 C105,105 105,135 95,120" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="round" />
              <path d="M200,120 L145,120 C135,105 135,135 145,120" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="round" />
              <circle cx="120" cy="120" r="16" fill="#fbbf24" />
              <text x="120" y="125" font-size="12" fill="#78350f" font-weight="bold" text-anchor="middle">⚡</text>
              <circle cx="120" cy="120" r="32" fill="none" stroke="#fbbf24" stroke-width="2" stroke-dasharray="6,4" />
            </svg>
          </div>
          <div class="callout-list">
            <div class="callout-item">
              <span class="callout-badge yellow">⚡</span>
              <span><strong>Resonant Hand Clap:</strong> Strike both open palms together firmly in view of the webcam.</span>
            </div>
          </div>
        </div>

        <div class="guide-steps">
          <div class="guide-step">
            <div class="step-circle">1</div>
            <div class="step-content">
              <strong>Clap Hands Rapidly in Front of Camera</strong>
              <span>Or press [D] hotkey to trigger space swap, monochrome flash, and speed lines.</span>
              <button class="action-btn primary btn-technique" data-tech="boogie_woogie">Execute Boogie Woogie [D]</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getHakariContent() {
    return `
      <div class="tutorial-card">
        <div class="card-hero">
          <div class="card-hero-text">
            <span class="character-tag yellow">Kinji Hakari • Third Year</span>
            <h3>Domain: Idle Death Gamble</h3>
            <p class="seal-subtitle">Canonical Hand Sign: Gambler's Prayer Clasp</p>
          </div>
        </div>
        <div class="incantation-card">
          <div class="incantation-label">DOMAIN INCANTATION</div>
          <div class="incantation-quote">"Time to roll the jackpot! Domain Expansion: Idle Death Gamble!"</div>
        </div>
        <div class="guide-steps">
          <div class="guide-step">
            <div class="step-circle">1</div>
            <div class="step-content">
              <strong>Form Tight Prayer Clasp with Thumbs Tucked</strong>
              <button class="action-btn primary btn-trigger-domain" data-domain="idle_death_gamble">Expand Domain [5]</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getYutaContent() {
    return `
      <div class="tutorial-card">
        <div class="card-hero">
          <div class="card-hero-text">
            <span class="character-tag purple">Yuta Okkotsu • Special Grade</span>
            <h3>Domain: Authentic Mutual Love</h3>
            <p class="seal-subtitle">Canonical Hand Sign: Rika Ring Binding Seal</p>
          </div>
        </div>
        <div class="incantation-card">
          <div class="incantation-label">DOMAIN INCANTATION</div>
          <div class="incantation-quote">"Rika-chan, help me out. Domain Expansion: Authentic Mutual Love."</div>
        </div>
        <div class="guide-steps">
          <div class="guide-step">
            <div class="step-circle">1</div>
            <div class="step-content">
              <strong>Interlace Fingers Touching Ring Finger</strong>
              <button class="action-btn primary btn-trigger-domain" data-domain="authentic_mutual_love">Expand Domain [6]</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
