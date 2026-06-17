import type { ExampleCircuit, GateInstance, InitialStateConfig } from '../types/quantum';
import { uid } from '../utils/format';

function zeroInitial(count: number): InitialStateConfig[] {
  return new Array(count).fill(null).map(() => ({ theta: 0, phi: 0 }));
}

function makeGate(type: GateInstance['type'], qubits: number[], column: number, angle?: number): GateInstance {
  return { id: uid('g'), type, targetQubits: qubits, column, angle };
}

export function createBellStateExample(): ExampleCircuit {
  const gates: GateInstance[] = [
    makeGate('H', [0], 0),
    makeGate('CNOT', [0, 1], 1),
  ];
  return {
    id: 'bell',
    name: 'Bell态制备',
    description: '创建两量子比特最大纠缠态 (|00⟩+|11⟩)/√2，展示量子纠缠特性。测量q0会瞬间确定q1的结果。',
    qubitCount: 2,
    initialStates: zeroInitial(2),
    gates,
    expectedResults: '50%概率得到|00⟩，50%概率得到|11⟩，不会出现|01⟩或|10⟩',
  };
}

export function createGroverExample(): ExampleCircuit {
  const gates: GateInstance[] = [
    makeGate('H', [0], 0),
    makeGate('H', [1], 0),
    makeGate('H', [2], 0),
    makeGate('X', [2], 1),
    makeGate('H', [2], 2),
    makeGate('Toffoli', [0, 1, 2], 3),
    makeGate('H', [2], 4),
    makeGate('X', [2], 5),
    makeGate('H', [0], 6),
    makeGate('H', [1], 6),
    makeGate('H', [2], 6),
    makeGate('X', [0], 7),
    makeGate('X', [1], 7),
    makeGate('X', [2], 7),
    makeGate('H', [2], 8),
    makeGate('Toffoli', [0, 1, 2], 9),
    makeGate('H', [2], 10),
    makeGate('X', [0], 11),
    makeGate('X', [1], 11),
    makeGate('X', [2], 11),
    makeGate('H', [0], 12),
    makeGate('H', [1], 12),
    makeGate('H', [2], 12),
  ];
  return {
    id: 'grover',
    name: 'Grover搜索(3比特)',
    description: '3量子比特Grover搜索算法示例，搜索目标态|110⟩。经过Oracle标记+扩散算子一轮迭代后，目标态测量概率显著提升。',
    qubitCount: 3,
    initialStates: zeroInitial(3),
    gates,
    expectedResults: '目标态|110⟩(即十进制6)测量概率约90%以上',
  };
}

export function createQFTExample(): ExampleCircuit {
  const n = 3;
  const gates: GateInstance[] = [];
  let col = 0;
  for (let i = 0; i < n; i++) {
    gates.push(makeGate('H', [i], col));
    col++;
    for (let j = i + 1; j < n; j++) {
      const angle = Math.PI / Math.pow(2, j - i);
      const Rz = { id: uid('g'), type: 'Rz' as const, targetQubits: [i], column: col, angle };
      const controlGate = { id: uid('g'), type: 'CNOT' as const, targetQubits: [j, i], column: col + 1 };
      const RzInv = { id: uid('g'), type: 'Rz' as const, targetQubits: [i], column: col + 2, angle: -angle };
      const controlGate2 = { id: uid('g'), type: 'CNOT' as const, targetQubits: [j, i], column: col + 3 };
      const RzFin = { id: uid('g'), type: 'Rz' as const, targetQubits: [i], column: col + 4, angle };
      gates.push(Rz, controlGate, RzInv, controlGate2, RzFin);
      col += 5;
    }
  }
  for (let i = 0; i < Math.floor(n / 2); i++) {
    gates.push(makeGate('SWAP', [i, n - 1 - i], col));
    col++;
  }
  return {
    id: 'qft',
    name: '量子傅里叶变换(QFT)',
    description: '3量子比特的量子傅里叶变换电路，将计算基态转换为傅里叶基，是Shor算法、量子相位估计等的核心子程序。',
    qubitCount: 3,
    initialStates: zeroInitial(3),
    gates,
    expectedResults: '对|000⟩输入，输出为均匀叠加态，各态等概率但相位不同',
  };
}

export function createHadamardTransformExample(): ExampleCircuit {
  const n = 3;
  const gates: GateInstance[] = [];
  for (let i = 0; i < n; i++) {
    gates.push(makeGate('H', [i], 0));
  }
  return {
    id: 'hadamard',
    name: 'Hadamard变换',
    description: '对3个量子比特同时施加H门，生成8个计算基态的均匀叠加，展示量子并行性原理。',
    qubitCount: 3,
    initialStates: zeroInitial(3),
    gates,
    expectedResults: '8个基态|000⟩到|111⟩各有12.5%测量概率，且相位一致',
  };
}

export function createDeutschJozsaExample(): ExampleCircuit {
  const gates: GateInstance[] = [
    makeGate('X', [2], 0),
    makeGate('H', [0], 1),
    makeGate('H', [1], 1),
    makeGate('H', [2], 1),
    makeGate('CNOT', [0, 2], 2),
    makeGate('CNOT', [1, 2], 3),
    makeGate('H', [0], 4),
    makeGate('H', [1], 4),
  ];
  return {
    id: 'deutsch',
    name: 'Deutsch-Jozsa算法',
    description: '3量子比特Deutsch-Jozsa示例，判断函数是平衡函数还是常量函数。Oracle实现f(x)=x0 XOR x1（平衡函数），算法可一次查询即判定。',
    qubitCount: 3,
    initialStates: zeroInitial(3),
    gates,
    expectedResults: '前两比特测量结果非|00⟩（平衡函数判定）',
  };
}

export function createGHZExample(): ExampleCircuit {
  const gates: GateInstance[] = [
    makeGate('H', [0], 0),
    makeGate('CNOT', [0, 1], 1),
    makeGate('CNOT', [0, 2], 2),
    makeGate('CNOT', [0, 3], 3),
  ];
  return {
    id: 'ghz',
    name: 'GHZ态制备',
    description: '4量子比特GHZ(Greenberger-Horne-Zeilinger)纠缠态 (|0000⟩+|1111⟩)/√2，是多体纠缠的典型示例。',
    qubitCount: 4,
    initialStates: zeroInitial(4),
    gates,
    expectedResults: '测量任意量子比特为0，则所有比特立即确定为0，反之全1',
  };
}

export const EXAMPLE_CIRCUITS: ExampleCircuit[] = [
  createBellStateExample(),
  createHadamardTransformExample(),
  createGHZExample(),
  createGroverExample(),
  createDeutschJozsaExample(),
  createQFTExample(),
];

export function getExampleById(id: string): ExampleCircuit | undefined {
  return EXAMPLE_CIRCUITS.find((e) => e.id === id);
}
