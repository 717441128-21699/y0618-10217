import type { BlochCoords, Complex, InitialStateConfig } from '../types/quantum';
import { cAdd, cConj, cModSq, cMul, cZero } from './complex';

function bitAt(index: number, bit: number): number {
  return (index >> bit) & 1;
}

export function partialTrace(state: Complex[], qubitCount: number, target: number): Complex[][] {
  const N = qubitCount;
  const rho: Complex[][] = [
    [{ re: 0, im: 0 }, { re: 0, im: 0 }],
    [{ re: 0, im: 0 }, { re: 0, im: 0 }],
  ];

  const n = 1 << N;
  for (let a = 0; a < 2; a++) {
    for (let b = 0; b < 2; b++) {
      let sum: Complex = { ...cZero };
      for (let i = 0; i < n; i++) {
        if (bitAt(i, target) !== a) continue;
        let j = i;
        j = (j & ~(1 << target)) | (b << target);
        sum = cAdd(sum, cMul(state[i], cConj(state[j])));
      }
      rho[a][b] = sum;
    }
  }
  return rho;
}

export function densityToBloch(rho: Complex[][]): BlochCoords {
  const rx = 2 * rho[0][1].re;
  const ry = 2 * rho[0][1].im;
  const rz = (rho[0][0].re - rho[1][1].re);

  const r = Math.sqrt(rx * rx + ry * ry + rz * rz) || 1;
  const nx = rx / r;
  const ny = ry / r;
  const nz = Math.max(-1, Math.min(1, rz / r));

  const theta = Math.acos(nz);
  let phi = Math.atan2(ny, nx);
  if (phi < 0) phi += 2 * Math.PI;

  return { x: nx, y: ny, z: nz, theta, phi };
}

export function stateToSingleQubitBloch(
  state: Complex[],
  qubitCount: number,
  qubit: number
): BlochCoords {
  const rho = partialTrace(state, qubitCount, qubit);
  return densityToBloch(rho);
}

export function stateToAllBloch(
  state: Complex[],
  qubitCount: number
): BlochCoords[] {
  const arr: BlochCoords[] = [];
  for (let q = 0; q < qubitCount; q++) {
    arr.push(stateToSingleQubitBloch(state, qubitCount, q));
  }
  return arr;
}

export function blochToAngles(b: BlochCoords): InitialStateConfig {
  return { theta: b.theta, phi: b.phi };
}

export function allBlochToAngles(list: BlochCoords[]): InitialStateConfig[] {
  return list.map(blochToAngles);
}

export function stateToAllAngles(
  state: Complex[],
  qubitCount: number
): InitialStateConfig[] {
  return allBlochToAngles(stateToAllBloch(state, qubitCount));
}
