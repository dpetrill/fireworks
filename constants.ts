// Color palettes
export const PALETTES: string[][] = [
  ["#ff4d4d", "#ffd24d", "#4dff88", "#4db8ff", "#d64dff"],
  ["#76e3ff", "#f9ff8c", "#ffa3f8", "#b9ffb0", "#ffc18b"],
  ["#fff4e6", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff", "#bdb2ff"],
  ["#ff0000", "#ff4444", "#ff8888"], // Red
  ["#00ff00", "#44ff44", "#88ff88"], // Green
  ["#0000ff", "#4444ff", "#8888ff"], // Blue
  ["#ffff00", "#ffff44", "#ffff88"], // Yellow
  ["#ff00ff", "#ff44ff", "#ff88ff"], // Magenta
  ["#00ffff", "#44ffff", "#88ffff"], // Cyan
  ["#ff6b35", "#ff8c42", "#ffa600"], // Orange
];

// Firework types
export const FIREWORK_TYPES = [
  'burst', 'ring', 'heart', 'star', 'spiral', 
  'willow', 'palm', 'crossette', 'peony', 'chrysanthemum'
];

// Utilities
export const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
export const rand = (min: number, max: number): number => Math.random() * (max - min) + min;
export const choice = <T,>(arr: T[]): T => arr[(Math.random() * arr.length) | 0];
