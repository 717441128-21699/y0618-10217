import type { Complex, GateInfo, GateType } from '../types/quantum';
import { cZero, cOne, cI, cNegSqrt2Over2, cSqrt2Over2, cExpImag, cScale } from './complex';

export type GateMatrix = Complex[][];

function make2x2(a: Complex, b: Complex, c: Complex, d: Complex): GateMatrix {
  return [[a, b], [c, d]];
}

export const I_MATRIX: GateMatrix = make2x2(cOne, cZero, cZero, cOne);

export const X_MATRIX: GateMatrix = make2x2(cZero, cOne, cOne, cZero);
export const NOT_MATRIX = X_MATRIX;

export const Y_MATRIX: GateMatrix = make2x2(
  cZero,
  { re: 0, im: -1 },
  cI,
  cZero
);

export const Z_MATRIX: GateMatrix = make2x2(cOne, cZero, cZero, { re: -1, im: 0 });

export const H_MATRIX: GateMatrix = make2x2(
  cSqrt2Over2,
  cSqrt2Over2,
  cSqrt2Over2,
  cNegSqrt2Over2
);

export const S_MATRIX: GateMatrix = make2x2(cOne, cZero, cZero, cI);
export const SDG_MATRIX: GateMatrix = make2x2(cOne, cZero, cZero, { re: 0, im: -1 });

export const T_MATRIX: GateMatrix = make2x2(cOne, cZero, cZero, cExpImag(Math.PI / 4));
export const TDG_MATRIX: GateMatrix = make2x2(cOne, cZero, cZero, cExpImag(-Math.PI / 4));

export function Rx(theta: number): GateMatrix {
  const c = Math.cos(theta / 2);
  const s = Math.sin(theta / 2);
  return make2x2(
    { re: c, im: 0 },
    { re: 0, im: -s },
    { re: 0, im: -s },
    { re: c, im: 0 }
  );
}

export function Ry(theta: number): GateMatrix {
  const c = Math.cos(theta / 2);
  const s = Math.sin(theta / 2);
  return make2x2(
    { re: c, im: 0 },
    { re: -s, im: 0 },
    { re: s, im: 0 },
    { re: c, im: 0 }
  );
}

export function Rz(theta: number): GateMatrix {
  return make2x2(
    cExpImag(-theta / 2),
    cZero,
    cZero,
    cExpImag(theta / 2)
  );
}

export function getSingleQubitMatrix(type: GateType, angle?: number): GateMatrix {
  switch (type) {
    case 'I': return I_MATRIX;
    case 'H': return H_MATRIX;
    case 'X': return X_MATRIX;
    case 'Y': return Y_MATRIX;
    case 'Z': return Z_MATRIX;
    case 'S': return S_MATRIX;
    case 'Sdg': return SDG_MATRIX;
    case 'T': return T_MATRIX;
    case 'Tdg': return TDG_MATRIX;
    case 'Rx': return Rx(angle ?? Math.PI / 2);
    case 'Ry': return Ry(angle ?? Math.PI / 2);
    case 'Rz': return Rz(angle ?? Math.PI / 2);
    default: return I_MATRIX;
  }
}

export const GATE_INFO_LIST: GateInfo[] = [
  { type: 'H', label: 'H', category: 'single', qubitCount: 1, symbol: 'H', description: 'Hadamard 门，创建叠加态 (|0⟩+|1⟩)/√2', color: '#f97316' },
  { type: 'X', label: 'X', category: 'single', qubitCount: 1, symbol: 'X', description: 'Pauli-X 门，经典NOT门，翻转 |0⟩↔|1⟩', color: '#ef4444' },
  { type: 'Y', label: 'Y', category: 'single', qubitCount: 1, symbol: 'Y', description: 'Pauli-Y 门，绕Y轴π旋转 + 相位i', color: '#a855f7' },
  { type: 'Z', label: 'Z', category: 'single', qubitCount: 1, symbol: 'Z', description: 'Pauli-Z 门，相位翻转，|1⟩→-|1⟩', color: '#3b82f6' },
  { type: 'S', label: 'S', category: 'single', qubitCount: 1, symbol: 'S', description: 'S门（√Z），|1⟩相位旋转90°', color: '#10b981' },
  { type: 'T', label: 'T', category: 'single', qubitCount: 1, symbol: 'T', description: 'T门（√S），|1⟩相位旋转45°', color: '#06b6d4' },
  { type: 'Sdg', label: 'S†', category: 'single', qubitCount: 1, symbol: 'S†', description: 'S门厄米共轭，|1⟩相位-90°', color: '#14b8a6' },
  { type: 'Tdg', label: 'T†', category: 'single', qubitCount: 1, symbol: 'T†', description: 'T门厄米共轭，|1⟩相位-45°', color: '#0ea5e9' },
  { type: 'Rx', label: 'Rx(θ)', category: 'rotation', qubitCount: 1, symbol: 'Rx', description: '绕X轴旋转θ角的单量子比特门', color: '#f59e0b' },
  { type: 'Ry', label: 'Ry(θ)', category: 'rotation', qubitCount: 1, symbol: 'Ry', description: '绕Y轴旋转θ角的单量子比特门', color: '#8b5cf6' },
  { type: 'Rz', label: 'Rz(θ)', category: 'rotation', qubitCount: 1, symbol: 'Rz', description: '绕Z轴旋转θ角的单量子比特门', color: '#6366f1' },
  { type: 'CNOT', label: 'CNOT', category: 'controlled', qubitCount: 2, symbol: 'CX', description: '受控NOT门：控制比特为1时翻转目标比特', color: '#ec4899' },
  { type: 'CZ', label: 'CZ', category: 'controlled', qubitCount: 2, symbol: 'CZ', description: '受控Z门：双比特均为1时施加-1相位', color: '#f43f5e' },
  { type: 'CY', label: 'CY', category: 'controlled', qubitCount: 2, symbol: 'CY', description: '受控Y门：控制比特为1时施加Y门', color: '#d946ef' },
  { type: 'SWAP', label: 'SWAP', category: 'multi', qubitCount: 2, symbol: '×', description: '交换两个量子比特的状态', color: '#1d4ed8' },
  { type: 'Toffoli', label: 'Toffoli', category: 'multi', qubitCount: 3, symbol: 'CCX', description: 'Toffoli门（CCNOT）：两控制位均为1时翻转目标位', color: '#0891b2' },
  { type: 'Fredkin', label: 'Fredkin', category: 'multi', qubitCount: 3, symbol: 'CSWAP', description: '受控SWAP门：控制位为1时交换两个目标位', color: '#4f46e5' },
  { type: 'Measure', label: 'M', category: 'measurement', qubitCount: 1, symbol: 'M', description: '测量量子比特到经典寄存器', color: '#64748b' },
];

export function getGateInfo(type: GateType): GateInfo | undefined {
  return GATE_INFO_LIST.find((g) => g.type === type);
}

export function createInitialState(theta: number, phi: number): Complex[] {
  const cos = Math.cos(theta / 2);
  const sin = Math.sin(theta / 2);
  const phase = cExpImag(phi);
  return [
    { re: cos, im: 0 },
    cScale(phase, sin),
  ];
}
