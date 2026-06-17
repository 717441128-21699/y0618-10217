import type { Complex } from '../types/quantum';
import { cMod } from '../engine/complex';

export function phaseToColor(phase: number, alpha: number = 1): string {
  let p = phase;
  while (p < 0) p += 2 * Math.PI;
  while (p >= 2 * Math.PI) p -= 2 * Math.PI;
  const hue = (p / (2 * Math.PI)) * 360;
  return `hsla(${hue.toFixed(1)}, 90%, 55%, ${alpha})`;
}

export function amplitudeToColor(amplitude: number, maxAmplitude: number = 1): string {
  const ratio = Math.max(0, Math.min(1, amplitude / (maxAmplitude || 1)));
  const start = { r: 15, g: 23, b: 42 };
  const end = { r: 168, g: 85, b: 247 };
  const r = Math.round(start.r + (end.r - start.r) * ratio);
  const g = Math.round(start.g + (end.g - start.g) * ratio);
  const b = Math.round(start.b + (end.b - start.b) * ratio);
  return `rgb(${r}, ${g}, ${b})`;
}

export function probabilityToColor(prob: number): string {
  const ratio = Math.max(0, Math.min(1, prob));
  const hue = 180 + ratio * 120;
  const light = 30 + ratio * 35;
  return `hsl(${hue}, 85%, ${light}%)`;
}

export function complexToColor(c: Complex, maxMod: number = 1): {
  bg: string;
  ring: string;
  intensity: number;
} {
  const mod = cMod(c);
  const ratio = maxMod > 0 ? mod / maxMod : 0;
  const phase = Math.atan2(c.im, c.re);
  return {
    bg: amplitudeToColor(ratio, 1),
    ring: phaseToColor(phase, 0.95),
    intensity: ratio,
  };
}

export function rainbowColors(n: number): string[] {
  const colors: string[] = [];
  for (let i = 0; i < n; i++) {
    const hue = (i / n) * 360;
    colors.push(`hsl(${hue}, 80%, 60%)`);
  }
  return colors;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  const bigint = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

export function rgbString(r: number, g: number, b: number, a: number = 1): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function gateColor(type: string): string {
  const colors: Record<string, string> = {
    H: '#f97316',
    X: '#ef4444',
    Y: '#a855f7',
    Z: '#3b82f6',
    S: '#10b981',
    T: '#06b6d4',
    Sdg: '#14b8a6',
    Tdg: '#0ea5e9',
    Rx: '#f59e0b',
    Ry: '#8b5cf6',
    Rz: '#6366f1',
    CNOT: '#ec4899',
    CZ: '#f43f5e',
    CY: '#d946ef',
    SWAP: '#1d4ed8',
    Toffoli: '#0891b2',
    Fredkin: '#4f46e5',
    Measure: '#64748b',
  };
  return colors[type] ?? '#64748b';
}
