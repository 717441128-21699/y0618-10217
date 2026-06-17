export interface Complex {
  re: number;
  im: number;
}

export type GateType =
  | 'H' | 'X' | 'Y' | 'Z' | 'S' | 'T' | 'Sdg' | 'Tdg'
  | 'Rx' | 'Ry' | 'Rz'
  | 'CNOT' | 'CZ' | 'CY' | 'SWAP'
  | 'Toffoli' | 'Fredkin'
  | 'Measure'
  | 'I';

export interface GateInstance {
  id: string;
  type: GateType;
  targetQubits: number[];
  column: number;
  angle?: number;
}

export interface InitialStateConfig {
  theta: number;
  phi: number;
}

export interface SimulationStep {
  stepIndex: number;
  appliedGate: GateInstance | null;
  stateVector: Complex[];
  singleQubitStates: InitialStateConfig[];
  probabilities: number[];
}

export interface BlochCoords {
  x: number;
  y: number;
  z: number;
  theta: number;
  phi: number;
}

export interface ExampleCircuit {
  id: string;
  name: string;
  description: string;
  qubitCount: number;
  initialStates: InitialStateConfig[];
  gates: GateInstance[];
  expectedResults?: string;
}

export type GateCategory = 'single' | 'controlled' | 'multi' | 'rotation' | 'measurement';

export interface GateInfo {
  type: GateType;
  label: string;
  category: GateCategory;
  qubitCount: number;
  symbol: string;
  description: string;
  color: string;
}
