export type Shape = 'dot' | 'square' | 'star' | 'line';
export type Mode = 'show' | 'paint' | 'arcade';

export interface Target {
  x: number;
  y: number;
  r: number;
  t: number;
  life: number;
  dead?: boolean;
}

export interface Tilt {
  gx: number;
  gy: number;
}
