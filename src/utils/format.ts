import type { Complex } from '../types/quantum';
import { cMod, cModSq } from '../engine/complex';

export function complexToString(c: Complex, precision: number = 3): string {
  const re = c.re.toFixed(precision).replace(/\.?0+$/, '');
  const imAbs = Math.abs(c.im).toFixed(precision).replace(/\.?0+$/, '');
  const imSign = c.im >= 0 ? '+' : '-';
  if (imAbs === '0' || imAbs === '') return re === '' ? '0' : re;
  if (re === '0' || re === '') {
    const s = c.im >= 0 ? '' : '-';
    return imAbs === '1' ? `${s}i` : `${s}${imAbs}i`;
  }
  const iStr = imAbs === '1' ? 'i' : `${imAbs}i`;
  return `${re}${imSign}${iStr}`;
}

export function complexToFixed(c: Complex, n: number = 4): string {
  const re = c.re.toFixed(n);
  const im = c.im >= 0 ? `+${c.im.toFixed(n)}` : c.im.toFixed(n);
  return `(${re}${im}j)`;
}

export function binaryString(index: number, width: number): string {
  return index.toString(2).padStart(width, '0');
}

export function binaryWithKet(index: number, width: number): string {
  return `|${binaryString(index, width)}⟩`;
}

export function probabilityFormat(p: number, digits: number = 2): string {
  const percent = p * 100;
  if (percent < 0.01 && p > 0) return '<0.01%';
  if (percent > 99.99 && p < 1) return '>99.99%';
  return `${percent.toFixed(digits)}%`;
}

export function probabilityBarValue(p: number): number {
  return Math.max(0, Math.min(100, p * 100));
}

export function formatAngleRad(rad: number, digits: number = 2): string {
  const piMultiple = rad / Math.PI;
  if (Math.abs(piMultiple - Math.round(piMultiple)) < 0.01) {
    const n = Math.round(piMultiple);
    if (n === 0) return '0';
    if (n === 1) return 'π';
    if (n === -1) return '-π';
    return `${n}π`;
  }
  if (Math.abs(piMultiple * 2 - Math.round(piMultiple * 2)) < 0.01) {
    const n = Math.round(piMultiple * 2);
    const sign = n < 0 ? '-' : '';
    const an = Math.abs(n);
    if (an === 1) return `${sign}π/2`;
    return `${sign}${an}π/2`;
  }
  if (Math.abs(piMultiple * 4 - Math.round(piMultiple * 4)) < 0.01) {
    const n = Math.round(piMultiple * 4);
    const sign = n < 0 ? '-' : '';
    const an = Math.abs(n);
    if (an === 1) return `${sign}π/4`;
    return `${sign}${an}π/4`;
  }
  return `${rad.toFixed(digits)} rad`;
}

export function formatAngleDeg(deg: number, digits: number = 1): string {
  return `${deg.toFixed(digits)}°`;
}

export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function getMaxModulus(arr: Complex[]): number {
  let max = 0;
  for (const c of arr) {
    const m = cMod(c);
    if (m > max) max = m;
  }
  return max || 1;
}

export function sortStatesByProbability(
  stateVector: Complex[],
  ascending: boolean = false
): { index: number; amplitude: Complex; probability: number }[] {
  const list = stateVector.map((amp, idx) => ({
    index: idx,
    amplitude: amp,
    probability: cModSq(amp),
  }));
  list.sort((a, b) => (ascending ? a.probability - b.probability : b.probability - a.probability));
  return list;
}

export function uid(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36).slice(-4)}`;
}
