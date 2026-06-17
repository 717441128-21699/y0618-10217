import { create } from 'zustand';
import type { GateInstance, GateType, InitialStateConfig, ExampleCircuit } from '../types/quantum';
import { uid } from '../utils/format';
import { EXAMPLE_CIRCUITS, getExampleById } from '../examples/circuits';

interface CircuitState {
  qubitCount: number;
  gates: GateInstance[];
  initialStates: InitialStateConfig[];
  selectedGateId: string | null;
  hoveredGateId: string | null;

  setQubitCount: (n: number) => void;
  addGate: (type: GateType, targetQubits: number[], column: number, angle?: number) => string;
  addGateAtFirstEmpty: (type: GateType, qubits: number[], angle?: number) => string;
  removeGate: (id: string) => void;
  moveGate: (id: string, newQubits: number[], newColumn: number) => void;
  clearGates: () => void;
  setInitialState: (qubit: number, theta: number, phi: number) => void;
  setAllInitialStates: (states: InitialStateConfig[]) => void;
  resetInitialStates: () => void;
  selectGate: (id: string | null) => void;
  hoverGate: (id: string | null) => void;
  loadExample: (exampleId: string) => void;
  loadExampleCircuit: (example: ExampleCircuit) => void;
  getMaxColumn: () => number;
  getGatesInColumn: (col: number) => GateInstance[];
  isQubitOccupied: (qubit: number, column: number, excludeId?: string) => boolean;
}

function makeInitialStates(count: number): InitialStateConfig[] {
  return new Array(count).fill(null).map(() => ({ theta: 0, phi: 0 }));
}

const DEFAULT_QUBITS = 2;

export const useCircuitStore = create<CircuitState>((set, get) => ({
  qubitCount: DEFAULT_QUBITS,
  gates: [],
  initialStates: makeInitialStates(DEFAULT_QUBITS),
  selectedGateId: null,
  hoveredGateId: null,

  setQubitCount: (n) => {
    const count = Math.max(2, Math.min(8, n));
    set((s) => {
      const filteredGates = s.gates.filter((g) =>
        g.targetQubits.every((q) => q < count)
      );
      const states = [...s.initialStates];
      while (states.length < count) states.push({ theta: 0, phi: 0 });
      states.length = count;
      return {
        qubitCount: count,
        gates: filteredGates,
        initialStates: states,
        selectedGateId:
          s.selectedGateId && filteredGates.find((g) => g.id === s.selectedGateId)
            ? s.selectedGateId
            : null,
      };
    });
  },

  addGate: (type, targetQubits, column, angle) => {
    const id = uid('g');
    const gate: GateInstance = { id, type, targetQubits: [...targetQubits], column, angle };
    set((s) => ({ gates: [...s.gates, gate] }));
    return id;
  },

  addGateAtFirstEmpty: (type, qubits, angle) => {
    const state = get();
    const qubitCount = state.qubitCount;
    const validQubits = qubits.filter((q) => q >= 0 && q < qubitCount);
    if (validQubits.length === 0) return '';
    let col = 0;
    let found = false;
    while (!found) {
      let occupied = false;
      for (const q of validQubits) {
        if (state.isQubitOccupied(q, col)) {
          occupied = true;
          break;
        }
      }
      if (!occupied) {
        found = true;
      } else {
        col++;
      }
      if (col > 1000) return '';
    }
    return get().addGate(type, validQubits, col, angle);
  },

  removeGate: (id) =>
    set((s) => ({
      gates: s.gates.filter((g) => g.id !== id),
      selectedGateId: s.selectedGateId === id ? null : s.selectedGateId,
    })),

  moveGate: (id, newQubits, newColumn) =>
    set((s) => ({
      gates: s.gates.map((g) =>
        g.id === id
          ? { ...g, targetQubits: [...newQubits], column: newColumn }
          : g
      ),
    })),

  clearGates: () => set({ gates: [], selectedGateId: null }),

  setInitialState: (qubit, theta, phi) =>
    set((s) => {
      const states = [...s.initialStates];
      if (qubit >= 0 && qubit < states.length) {
        states[qubit] = { theta: Math.max(0, Math.min(Math.PI, theta)), phi: Math.max(0, Math.min(2 * Math.PI, phi)) };
      }
      return { initialStates: states };
    }),

  setAllInitialStates: (states) =>
    set((s) => {
      const n = s.qubitCount;
      const arr = [...states].slice(0, n);
      while (arr.length < n) arr.push({ theta: 0, phi: 0 });
      return { initialStates: arr };
    }),

  resetInitialStates: () =>
    set((s) => ({ initialStates: makeInitialStates(s.qubitCount) })),

  selectGate: (id) => set({ selectedGateId: id }),
  hoverGate: (id) => set({ hoveredGateId: id }),

  loadExample: (exampleId) => {
    const ex = getExampleById(exampleId);
    if (ex) get().loadExampleCircuit(ex);
  },

  loadExampleCircuit: (ex) => {
    set({
      qubitCount: ex.qubitCount,
      gates: ex.gates.map((g) => ({ ...g, id: uid('g'), targetQubits: [...g.targetQubits] })),
      initialStates: [...ex.initialStates],
      selectedGateId: null,
    });
  },

  getMaxColumn: () => {
    const g = get().gates;
    if (g.length === 0) return -1;
    return Math.max(...g.map((x) => x.column));
  },

  getGatesInColumn: (col) => get().gates.filter((g) => g.column === col),

  isQubitOccupied: (qubit, column, excludeId) => {
    return get().gates.some((g) => {
      if (excludeId && g.id === excludeId) return false;
      if (g.column !== column) return false;
      return g.targetQubits.includes(qubit);
    });
  },
}));

export { EXAMPLE_CIRCUITS };
