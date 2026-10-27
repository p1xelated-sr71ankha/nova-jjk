/**
 * NOVA — Hand-Controlled Particle Galaxy
 * Mathematical Utility Functions
 *
 * Pure, side-effect-free helpers for vector math, coordinate transformations,
 * logarithmic spiral calculations, and color space conversions.
 */

/**
 * Linearly interpolates between a and b by factor t.
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Clamps value v within the [min, max] range.
 * @param {number} v
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

/**
 * Computes Euclidean distance between two points.
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {number}
 */
export function dist(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

/**
 * Generates a uniform random float in [min, max).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Generates a uniform random float in [-max, max].
 * @param {number} max
 * @returns {number}
 */
export function randomSigned(max) {
  return (Math.random() * 2 - 1) * max;
}

/**
 * Computes logarithmic spiral radius and coordinate offset:
 * r = a * e^(b * theta)
 * @param {number} theta Angle in radians
 * @param {number} a Scale factor (radius at theta = 0)
 * @param {number} b Spiral tightness factor
 * @returns {{ r: number, x: number, y: number }}
 */
export function spiralPoint(theta, a, b) {
  const r = a * Math.exp(b * theta);
  return {
    r,
    x: r * Math.cos(theta),
    y: r * Math.sin(theta),
  };
}

/**
 * Converts normalized [0, 1] coordinates to screen pixel coordinates.
 * Optional flipY supports standard Cartesian-to-canvas coordinate system.
 * @param {number} nx Normalized X in [0, 1]
 * @param {number} ny Normalized Y in [0, 1]
 * @param {number} width Screen width in pixels
 * @param {number} height Screen height in pixels
 * @param {boolean} [flipY=false] If true, flips Y axis (1 - ny)
 * @returns {{ x: number, y: number }}
 */
export function toScreen(nx, ny, width, height, flipY = false) {
  return {
    x: nx * width,
    y: (flipY ? 1 - ny : ny) * height,
  };
}

/**
 * Wraps an arbitrary hue in degrees into standard [0, 360) range.
 * @param {number} h Hue in degrees
 * @returns {number}
 */
export function wrapHue(h) {
  return ((h % 360) + 360) % 360;
}

/**
 * Converts HSV color values to RGB tuple.
 * @param {number} h Hue in degrees [0, 360)
 * @param {number} s Saturation in [0, 1]
 * @param {number} v Value/Brightness in [0, 1]
 * @returns {[number, number, number]} RGB values in [0, 255]
 */
export function hsvToRgb(h, s, v) {
  const normH = wrapHue(h);
  const c = v * s;
  const x = c * (1 - Math.abs(((normH / 60) % 2) - 1));
  const m = v - c;

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (normH < 60) {
    r1 = c;
    g1 = x;
    b1 = 0;
  } else if (normH < 120) {
    r1 = x;
    g1 = c;
    b1 = 0;
  } else if (normH < 180) {
    r1 = 0;
    g1 = c;
    b1 = x;
  } else if (normH < 240) {
    r1 = 0;
    g1 = x;
    b1 = c;
  } else if (normH < 300) {
    r1 = x;
    g1 = 0;
    b1 = c;
  } else {
    r1 = c;
    g1 = 0;
    b1 = x;
  }

  return [
    Math.round((r1 + m) * 255),
    Math.round((g1 + m) * 255),
    Math.round((b1 + m) * 255),
  ];
}
