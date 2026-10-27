/**
 * Jujutsu Kaisen Domain Expansion Engine — System Configuration
 *
 * Configures domains, cursed energy thresholds, hand sign parameters,
 * and character abilities in 100% English.
 */

export const CONFIG = {
  // MediaPipe Hands configuration
  DETECTION_CONFIDENCE: 0.65,
  TRACKING_CONFIDENCE: 0.65,
  MAX_HANDS: 2,

  // Cursed Energy Accumulation System
  CURSED_ENERGY: {
    MAX: 100,
    CHARGE_RATE: 65, // Energy gained per second holding canonical mudra
    DECAY_RATE: 18,  // Energy lost per second when mudra is released
    ACTIVATION_THRESHOLD: 70, // Energy needed to trigger Domain Expansion
  },

  // Video Sources (Local MP4 paths in assets/videos/)
  VIDEO_SOURCES: {
    idle: {
      local: 'assets/videos/idle_cursed.mp4',
      title: 'Cursed Staging Area',
    },
    infinite_void: {
      local: 'assets/videos/gojo_void.mp4',
      title: 'Infinite Void (Satoru Gojo)',
    },
    malevolent_shrine: {
      local: 'assets/videos/sukuna_shrine.mp4',
      title: 'Malevolent Shrine (Ryomen Sukuna)',
    },
    chimera_shadow_garden: {
      local: 'assets/videos/megumi_shadows.mp4',
      title: 'Chimera Shadow Garden (Megumi Fushiguro)',
    },
    self_embodiment_of_perfection: {
      local: 'assets/videos/mahito_domain.mp4',
      title: 'Self-Embodiment of Perfection (Mahito)',
    },
    idle_death_gamble: {
      local: 'assets/videos/hakari_gamble.mp4',
      title: 'Idle Death Gamble (Kinji Hakari)',
    },
    authentic_mutual_love: {
      local: 'assets/videos/yuta_love.mp4',
      title: 'Authentic Mutual Love (Yuta Okkotsu)',
    },
    boogie_woogie: {
      local: 'assets/videos/todo_clap.mp4',
      title: 'Boogie Woogie (Aoi Todo)',
    },
    purple: {
      local: 'assets/videos/gojo_purple.mp4',
      title: 'Hollow Technique: Purple (Satoru Gojo)',
    },
  },

  // Canonical Domain Expansions Metadata (100% English)
  DOMAINS: {
    INFINITE_VOID: {
      id: 'infinite_void',
      name: 'Infinite Void',
      user: 'Satoru Gojo',
      title: 'Special Grade Sorcerer — Satoru Gojo',
      sealName: 'Indra Seal (Taishakuten)',
      quote: '"Phase. Paramita. Light of Nine Ropes. Domain Expansion: Infinite Void."',
      accentColor: '#38bdf8',
      duration: 22000, // ms
    },
    MALEVOLENT_SHRINE: {
      id: 'malevolent_shrine',
      name: 'Malevolent Shrine',
      user: 'Ryomen Sukuna',
      title: 'King of Curses — Ryomen Sukuna',
      sealName: 'Enma Shrine Seal (Yama)',
      quote: '"Scale of the Dragon. Recoil. Twin Meteors. Domain Expansion: Malevolent Shrine."',
      accentColor: '#ef4444',
      duration: 22000,
    },
    CHIMERA_SHADOW_GARDEN: {
      id: 'chimera_shadow_garden',
      name: 'Chimera Shadow Garden',
      user: 'Megumi Fushiguro',
      title: 'Ten Shadows Sorcerer — Megumi Fushiguro',
      sealName: 'Shadow Puppet Seal (Winged Nue)',
      quote: '"Even if it is incomplete, even if it is ugly... burst forth! Domain Expansion: Chimera Shadow Garden!"',
      accentColor: '#10b981',
      duration: 22000,
    },
    SELF_EMBODIMENT_OF_PERFECTION: {
      id: 'self_embodiment_of_perfection',
      name: 'Self-Embodiment of Perfection',
      user: 'Mahito',
      title: 'Special Grade Cursed Spirit — Mahito',
      sealName: 'Soul Lotus Clasp',
      quote: '"This is the true shape of my soul... Domain Expansion: Self-Embodiment of Perfection."',
      accentColor: '#ec4899',
      duration: 22000,
    },
    IDLE_DEATH_GAMBLE: {
      id: 'idle_death_gamble',
      name: 'Idle Death Gamble',
      user: 'Kinji Hakari',
      title: 'Third-Year Sorcerer — Kinji Hakari',
      sealName: "Gambler's Prayer Clasp",
      quote: '"Time to roll the jackpot! Domain Expansion: Idle Death Gamble!"',
      accentColor: '#f59e0b',
      duration: 22000,
    },
    AUTHENTIC_MUTUAL_LOVE: {
      id: 'authentic_mutual_love',
      name: 'Authentic Mutual Love',
      user: 'Yuta Okkotsu',
      title: 'Special Grade Sorcerer — Yuta Okkotsu',
      sealName: 'Rika Ring Binding Seal',
      quote: '"Rika-chan, help me out. Domain Expansion: Authentic Mutual Love."',
      accentColor: '#8b5cf6',
      duration: 22000,
    },
  },

  // Signature Cursed Techniques (100% English)
  TECHNIQUES: {
    INFINITY: {
      id: 'infinity',
      name: 'Limitless: Infinity',
      user: 'Satoru Gojo',
      key: 'Q',
      desc: 'Spacetime deceleration shield repelling incoming mass',
    },
    BLUE: {
      id: 'blue',
      name: 'Lapse: Blue',
      user: 'Satoru Gojo',
      key: 'W',
      desc: 'Attractive gravitational singularity vacuum',
    },
    RED: {
      id: 'red',
      name: 'Reversal: Red',
      user: 'Satoru Gojo',
      key: 'E',
      desc: 'Divergent kinetic explosive shockwave',
    },
    PURPLE: {
      id: 'purple',
      name: 'Hollow Technique: Purple',
      user: 'Satoru Gojo',
      key: 'R',
      desc: 'Collides Blue and Red into violet spatial erasure projectile',
    },
    DISMANTLE: {
      id: 'dismantle',
      name: 'Dismantle & Cleave',
      user: 'Ryomen Sukuna',
      key: 'A',
      desc: 'Invisible razor-sharp spatial cutting planes',
    },
    FIRE_ARROW: {
      id: 'fire_arrow',
      name: 'Furnace: Fire Arrow',
      user: 'Ryomen Sukuna',
      key: 'S',
      desc: 'Thermobaric plasma flame arrow explosion',
    },
    BOOGIE_WOOGIE: {
      id: 'boogie_woogie',
      name: 'Boogie Woogie',
      user: 'Aoi Todo',
      key: 'D',
      desc: 'Instantaneous spatial swap triggered by physical clapping',
    },
  },
};
