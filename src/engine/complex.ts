import type { Complex } from '../types/quantum';

export const cZero: Complex = { re: 0, im: 0 };
export const cOne: Complex = { re: 1, im: 0 };
export const cI: Complex = { re: 0, im: 1 };

export function cAdd(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}

export function cSub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im };
}

export function cMul(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

export function cScale(a: Complex, s: number): Complex {
  return { re: a.re * s, im: a.im * s };
}

export function cConj(a: Complex): Complex {
  return { re: a.re, im: -a.im };
}

export function cModSq(a: Complex): number {
  return a.re * a.re + a.im * a.im;
}

export function cMod(a: Complex): number {
  return Math.sqrt(cModSq(a));
}

export function cDiv(a: Complex, b: Complex): Complex {
  const d = cModSq(b);
  if (d === 0) return cZero;
  const n = cMul(a, cConj(b));
  return { re: n.re / d, im: n.im / d };
}

export const cSqrt2Over2: Complex = { re: Math.SQRT1_2, im: 0 };
export const cNegSqrt2Over2: Complex = { re: -Math.SQRT1_2, im: 0 };

export function cExpImag(theta: number): Complex {
  return { re: Math.cos(theta), im: Math.sin(theta) };
}

export function cArrAdd(a: Complex[], b: Complex[]): Complex[] {
  return a.map((v, i) => cAdd(v, b[i] ?? cZero));
}

export function cArrScale(a: Complex[], s: number): Complex[] {
  return a.map((v) => cScale(v, s));
}

export function cArrCopy(a: Complex[]): Complex[] {
  return a.map((v) => ({ ...v }));
}

export function cArrDot(a: Complex[], b: Complex[]): Complex {
  let sum: Complex = cZero;
  for (let i = 0; i < a.length; i++) {
    sum = cAdd(sum, cMul(a[i], cConj(b[i])));
  }
  return sum;
}

export function cNorm(a: Complex[]): number {
  return Math.sqrt(a.reduce((s, v) => s + cModSq(v), 0));
}

export function cArrNormalize(a: Complex[]): Complex[] {
  const n = cNorm(a);
  if (n === 0) return a;
  return a.map((v) => cScale(v, 1 / n));
}

export function cEquals(a: Complex, b: Complex, eps = 1e-10): boolean {
  return Math.abs(a.re - b.re) < eps && Math.abs(a.im - b.im) < eps;
}
