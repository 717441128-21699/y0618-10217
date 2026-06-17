import type { Complex, GateInstance, GateType, InitialStateConfig } from '../types/quantum';
import {
  cAdd,
  cArrCopy,
  cMul,
  cModSq,
  cScale,
  cZero,
} from './complex';
import {
  createInitialState,
  getSingleQubitMatrix,
  I_MATRIX,
  Y_MATRIX,
  type GateMatrix,
} from './gates';

function numState(qubitCount: number): number {
  return 1 << qubitCount;
}

export function zeroState(qubitCount: number): Complex[] {
  const n = numState(qubitCount);
  const state: Complex[] = new Array(n);
  for (let i = 0; i < n; i++) state[i] = { re: 0, im: 0 };
  state[0] = { re: 1, im: 0 };
  return state;
}

function bitAt(index: number, bit: number): number {
  return (index >> bit) & 1;
}

function setBit(index: number, bit: number, value: number): number {
  return (index & ~(1 << bit)) | (value << bit);
}

function swapBits(index: number, a: number, b: number): number {
  const ba = bitAt(index, a);
  const bb = bitAt(index, b);
  if (ba === bb) return index;
  return setBit(setBit(index, a, bb), b, ba);
}

export function applySingleQubitGate(
  state: Complex[],
  qubitCount: number,
  qubit: number,
  matrix: GateMatrix
): Complex[] {
  const n = numState(qubitCount);
  const next: Complex[] = new Array(n);
  for (let i = 0; i < n; i++) next[i] = { ...cZero };

  for (let i = 0; i < n; i++) {
    const b = bitAt(i, qubit);
    const j0 = setBit(i, qubit, 0);
    const j1 = setBit(i, qubit, 1);
    if (b === 0) {
      next[j0] = cAdd(next[j0], cMul(matrix[0][0], state[i]));
      next[j1] = cAdd(next[j1], cMul(matrix[1][0], state[i]));
    } else {
      next[j0] = cAdd(next[j0], cMul(matrix[0][1], state[i]));
      next[j1] = cAdd(next[j1], cMul(matrix[1][1], state[i]));
    }
  }
  return next;
}

export function applyCNOT(
  state: Complex[],
  qubitCount: number,
  control: number,
  target: number
): Complex[] {
  const n = numState(qubitCount);
  const next: Complex[] = cArrCopy(state);
  for (let i = 0; i < n; i++) {
    if (bitAt(i, control) === 1) {
      const j = setBit(i, target, 1 - bitAt(i, target));
      if (i < j) {
        const tmp = next[i];
        next[i] = next[j];
        next[j] = tmp;
      }
    }
  }
  return next;
}

export function applyControlledSingleQubitGate(
  state: Complex[],
  qubitCount: number,
  control: number,
  target: number,
  matrix: GateMatrix
): Complex[] {
  const n = numState(qubitCount);
  const next: Complex[] = new Array(n);
  for (let i = 0; i < n; i++) next[i] = { ...cZero };

  for (let i = 0; i < n; i++) {
    if (bitAt(i, control) === 0) {
      next[i] = cAdd(next[i], state[i]);
    } else {
      const t = bitAt(i, target);
      const j0 = setBit(i, target, 0);
      const j1 = setBit(i, target, 1);
      next[j0] = cAdd(next[j0], cMul(matrix[0][t], state[i]));
      next[j1] = cAdd(next[j1], cMul(matrix[1][t], state[i]));
    }
  }
  return next;
}

export function applyCY(
  state: Complex[],
  qubitCount: number,
  control: number,
  target: number
): Complex[] {
  return applyControlledSingleQubitGate(state, qubitCount, control, target, Y_MATRIX);
}

export function applyCZ(
  state: Complex[],
  qubitCount: number,
  control: number,
  target: number
): Complex[] {
  const n = numState(qubitCount);
  const next: Complex[] = cArrCopy(state);
  for (let i = 0; i < n; i++) {
    if (bitAt(i, control) === 1 && bitAt(i, target) === 1) {
      next[i] = cScale(next[i], -1);
    }
  }
  return next;
}

export function applySWAP(
  state: Complex[],
  qubitCount: number,
  a: number,
  b: number
): Complex[] {
  const n = numState(qubitCount);
  const next: Complex[] = new Array(n);
  for (let i = 0; i < n; i++) {
    next[swapBits(i, a, b)] = state[i];
  }
  return next;
}

export function applyToffoli(
  state: Complex[],
  qubitCount: number,
  c1: number,
  c2: number,
  target: number
): Complex[] {
  const n = numState(qubitCount);
  const next: Complex[] = cArrCopy(state);
  for (let i = 0; i < n; i++) {
    if (bitAt(i, c1) === 1 && bitAt(i, c2) === 1) {
      const j = setBit(i, target, 1 - bitAt(i, target));
      if (i < j) {
        const tmp = next[i];
        next[i] = next[j];
        next[j] = tmp;
      }
    }
  }
  return next;
}

export function applyFredkin(
  state: Complex[],
  qubitCount: number,
  control: number,
  a: number,
  b: number
): Complex[] {
  const n = numState(qubitCount);
  const next: Complex[] = new Array(n);
  for (let i = 0; i < n; i++) {
    let idx = i;
    if (bitAt(i, control) === 1) {
      idx = swapBits(i, a, b);
    }
    next[idx] = state[i];
  }
  return next;
}

export function applyGate(
  state: Complex[],
  qubitCount: number,
  gate: GateInstance
): Complex[] {
  const { type, targetQubits, angle } = gate;

  switch (type) {
    case 'H':
    case 'X':
    case 'Y':
    case 'Z':
    case 'S':
    case 'T':
    case 'Sdg':
    case 'Tdg':
    case 'Rx':
    case 'Ry':
    case 'Rz':
    case 'I':
      return applySingleQubitGate(
        state,
        qubitCount,
        targetQubits[0],
        type === 'I' ? I_MATRIX : getSingleQubitMatrix(type, angle)
      );
    case 'CNOT':
      return applyCNOT(state, qubitCount, targetQubits[0], targetQubits[1]);
    case 'CY':
      return applyCY(state, qubitCount, targetQubits[0], targetQubits[1]);
    case 'CZ':
      return applyCZ(state, qubitCount, targetQubits[0], targetQubits[1]);
    case 'SWAP':
      return applySWAP(state, qubitCount, targetQubits[0], targetQubits[1]);
    case 'Toffoli':
      return applyToffoli(
        state,
        qubitCount,
        targetQubits[0],
        targetQubits[1],
        targetQubits[2]
      );
    case 'Fredkin':
      return applyFredkin(
        state,
        qubitCount,
        targetQubits[0],
        targetQubits[1],
        targetQubits[2]
      );
    case 'Measure':
      return state;
    default:
      return state;
  }
}

export function applyMeasure(
  state: Complex[],
  qubitCount: number,
  qubit: number
): { state: Complex[]; result: 0 | 1 } {
  let p0 = 0;
  const n = numState(qubitCount);
  for (let i = 0; i < n; i++) {
    if (bitAt(i, qubit) === 0) p0 += cModSq(state[i]);
  }
  const r = Math.random();
  const result: 0 | 1 = r < p0 ? 0 : 1;
  const p = result === 0 ? p0 : 1 - p0;
  const factor = p > 0 ? 1 / Math.sqrt(p) : 0;

  const next: Complex[] = new Array(n);
  for (let i = 0; i < n; i++) next[i] = { ...cZero };
  for (let i = 0; i < n; i++) {
    if (bitAt(i, qubit) === result) {
      next[i] = cScale(state[i], factor);
    }
  }
  return { state: next, result };
}

export function initializeStateWithConfig(
  qubitCount: number,
  configs: InitialStateConfig[]
): Complex[] {
  let state = zeroState(qubitCount);
  for (let q = 0; q < qubitCount; q++) {
    const cfg = configs[q] ?? { theta: 0, phi: 0 };
    const s = createInitialState(cfg.theta, cfg.phi);
    const mat: GateMatrix = [
      [s[0], { re: -s[1].re, im: s[1].im }],
      [s[1], s[0]],
    ];
    state = applySingleQubitGate(state, qubitCount, q, mat);
  }
  return state;
}

export function getProbabilities(state: Complex[]): number[] {
  const total = state.reduce((s, c) => s + cModSq(c), 0) || 1;
  return state.map((c) => cModSq(c) / total);
}

function sortGatesByColumn(gates: GateInstance[]): GateInstance[][] {
  if (gates.length === 0) return [];
  const maxCol = Math.max(...gates.map((g) => g.column));
  const cols: GateInstance[][] = [];
  for (let c = 0; c <= maxCol; c++) cols.push([]);
  for (const g of gates) {
    if (g.column >= 0 && g.column < cols.length) cols[g.column].push(g);
  }
  return cols;
}

export function runCircuit(
  qubitCount: number,
  initialStates: InitialStateConfig[],
  gates: GateInstance[]
): Complex[] {
  let state = initializeStateWithConfig(qubitCount, initialStates);
  const columns = sortGatesByColumn(gates);
  for (const col of columns) {
    for (const gate of col) {
      state = applyGate(state, qubitCount, gate);
    }
  }
  return state;
}

export function runCircuitStepByStep(
  qubitCount: number,
  initialStates: InitialStateConfig[],
  gates: GateInstance[]
): { state: Complex[]; appliedGate: GateInstance | null }[] {
  const steps: { state: Complex[]; appliedGate: GateInstance | null }[] = [];
  let state = initializeStateWithConfig(qubitCount, initialStates);
  steps.push({ state: cArrCopy(state), appliedGate: null });

  const columns = sortGatesByColumn(gates);
  for (const col of columns) {
    for (const gate of col) {
      state = applyGate(state, qubitCount, gate);
      steps.push({ state: cArrCopy(state), appliedGate: gate });
    }
  }
  return steps;
}

export function getGateTypeFromString(s: string): GateType | null {
  const valid: GateType[] = [
    'H', 'X', 'Y', 'Z', 'S', 'T', 'Sdg', 'Tdg',
    'Rx', 'Ry', 'Rz', 'CNOT', 'CZ', 'CY', 'SWAP',
    'Toffoli', 'Fredkin', 'Measure', 'I',
  ];
  return valid.includes(s as GateType) ? (s as GateType) : null;
}
