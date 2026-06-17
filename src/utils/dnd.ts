export const DND_TYPES = {
  GATE: 'quantum-gate',
  GATE_INSTANCE: 'quantum-gate-instance',
} as const;

export interface DragGateItem {
  type: typeof DND_TYPES.GATE;
  gateType: string;
  label: string;
  qubitCount: number;
}

export interface DragGateInstanceItem {
  type: typeof DND_TYPES.GATE_INSTANCE;
  gateId: string;
  fromQubits: number[];
  fromColumn: number;
}

export type DragItem = DragGateItem | DragGateInstanceItem;
