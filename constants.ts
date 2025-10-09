// Color palettes
export const PALETTES: string[][] = [
  ["#ff4d4d", "#ffd24d", "#4dff88", "#4db8ff", "#d64dff"],
  ["#76e3ff", "#f9ff8c", "#ffa3f8", "#b9ffb0", "#ffc18b"],
  ["#fff4e6", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff", "#bdb2ff"],
];

// Utilities
export const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
export const rand = (min: number, max: number): number => Math.random() * (max - min) + min;
export const choice = <T,>(arr: T[]): T => arr[(Math.random() * arr.length) | 0];
