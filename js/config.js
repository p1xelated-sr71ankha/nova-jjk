/**
 * NOVA — Jujutsu Kaisen Video-Driven Domain Expansion Engine
 * Configuration File
 *
 * Configures anime video sources for each canonical JJK Mudra,
 * gesture thresholds, and computer-vision parameters.
 */

export const CONFIG = {
  // MediaPipe Hands configuration (Supports dual-hand mudras & clapping)
  DETECTION_CONFIDENCE: 0.65,
  TRACKING_CONFIDENCE: 0.65,
  MAX_HANDS: 2,

  // Cursed Energy System
  CURSED_ENERGY: {
    MAX: 100,
    CHARGE_RATE: 55, // Per second when holding a canonical mudra
    DECAY_RATE: 15,  // Per second when idle
    ACTIVATION_THRESHOLD: 75, // Energy needed to trigger Domain Expansion
  },

  // Video Sources for each JJK Mudra & Domain Expansion
  // Local paths are checked first in assets/videos/; CDN links serve as immediate web fallback
  VIDEO_SOURCES: {
    idle: {
      local: 'assets/videos/idle_cursed.mp4',
      cdn: 'https://media.tenor.com/Z4GSw74MweQAAAAe/satoru-gojo-domain-expansion.mp4',
      title: 'Cursed Staging Area',
    },
    infinite_void: {
      local: 'assets/videos/gojo_void.mp4',
      cdn: 'https://media.tenor.com/SkzLc-5CJGgAAAAe/domain-expansion-therapy.mp4',
      title: 'Infinite Void (Satoru Gojo)',
      kanji: '無量空処',
    },
    malevolent_shrine: {
      local: 'assets/videos/sukuna_shrine.mp4',
      cdn: 'https://media.tenor.com/UZ1ngyHny60AAAAe/gojo-domain-expansion-domain-expansion.mp4',
      title: 'Malevolent Shrine (Ryomen Sukuna)',
      kanji: '伏魔御廚子',
    },
    chimera_shadow_garden: {
      local: 'assets/videos/megumi_shadows.mp4',
      cdn: 'https://media.tenor.com/vd5in_YdYpgAAAAe/domain-expansion-gojo.mp4',
      title: 'Chimera Shadow Garden (Megumi Fushiguro)',
      kanji: '嵌合暗翳庭',
    },
    self_embodiment_of_perfection: {
      local: 'assets/videos/mahito_domain.mp4',
      cdn: 'https://media.tenor.com/P7_9VGKr2lsAAAAe/satoru-gojo-domain-expansion.mp4',
      title: 'Self-Embodiment of Perfection (Mahito)',
      kanji: '自閉円頓裹',
    },
    boogie_woogie: {
      local: 'assets/videos/todo_clap.mp4',
      cdn: 'https://media.tenor.com/SkzLc-5CJGgAAAAe/domain-expansion-therapy.mp4',
      title: 'Boogie Woogie (Aoi Todo)',
      kanji: '不義遊戯',
    },
    purple: {
      local: 'assets/videos/gojo_purple.mp4',
      cdn: 'https://media.tenor.com/UZ1ngyHny60AAAAe/gojo-domain-expansion-domain-expansion.mp4',
      title: 'Hollow Technique: Purple (Satoru Gojo)',
      kanji: '虚式「茈」',
    },
  },

  // Canonical Domain Expansions Metadata
  DOMAINS: {
    INFINITE_VOID: {
      id: 'infinite_void',
      name: 'Infinite Void',
      kanji: '無量空処',
      user: 'Satoru Gojo',
      title: '特級呪術師・五条悟',
      quote: '「領域展開——無量空処」',
      accentColor: '#38bdf8',
      duration: 20000, // ms
    },
    MALEVOLENT_SHRINE: {
      id: 'malevolent_shrine',
      name: 'Malevolent Shrine',
      kanji: '伏魔御廚子',
      user: 'Ryomen Sukuna',
      title: '呪いの王・両面宿儺',
      quote: '「領域展開——伏魔御廚子」',
      accentColor: '#ef4444',
      duration: 20000,
    },
    CHIMERA_SHADOW_GARDEN: {
      id: 'chimera_shadow_garden',
      name: 'Chimera Shadow Garden',
      kanji: '嵌合暗翳庭',
      user: 'Megumi Fushiguro',
      title: '十種影法術師・伏黒恵',
      quote: '「不完全でもいい…領域展開！嵌合暗翳庭！」',
      accentColor: '#10b981',
      duration: 20000,
    },
    SELF_EMBODIMENT_OF_PERFECTION: {
      id: 'self_embodiment_of_perfection',
      name: 'Self-Embodiment of Perfection',
      kanji: '自閉円頓裹',
      user: 'Mahito',
      title: '特級呪霊・真人',
      quote: '「これが俺の魂の形だ…領域展開：自閉円頓裹」',
      accentColor: '#ec4899',
      duration: 20000,
    },
  },

  // Signature Cursed Techniques
  TECHNIQUES: {
    INFINITY: {
      id: 'infinity',
      name: 'Limitless: Infinity',
      kanji: '無下限呪術',
      user: 'Satoru Gojo',
      key: 'Q',
    },
    BLUE: {
      id: 'blue',
      name: 'Lapse: Blue',
      kanji: '術式順転「蒼」',
      user: 'Satoru Gojo',
      key: 'W',
    },
    RED: {
      id: 'red',
      name: 'Reversal: Red',
      kanji: '術式反転「赫」',
      user: 'Satoru Gojo',
      key: 'E',
    },
    PURPLE: {
      id: 'purple',
      name: 'Hollow Technique: Purple',
      kanji: '虚式「茈」',
      user: 'Satoru Gojo',
      key: 'R',
    },
    DISMANTLE: {
      id: 'dismantle',
      name: 'Dismantle & Cleave',
      kanji: '「解」・「捌」',
      user: 'Ryomen Sukuna',
      key: 'A',
    },
    FIRE_ARROW: {
      id: 'fire_arrow',
      name: 'Furnace: Fire Arrow',
      kanji: '「開」・火矢',
      user: 'Ryomen Sukuna',
      key: 'S',
    },
    BOOGIE_WOOGIE: {
      id: 'boogie_woogie',
      name: 'Boogie Woogie',
      kanji: '不義遊戯',
      user: 'Aoi Todo',
      key: 'D',
    },
  },
};
