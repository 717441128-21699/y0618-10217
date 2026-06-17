import { create } from 'zustand';
import type { Complex, GateInstance, InitialStateConfig, SimulationStep } from '../types/quantum';
import {
  getProbabilities,
  runCircuit,
  runCircuitStepByStep,
} from '../engine/quantumSim';
import { stateToAllAngles } from '../engine/bloch';
import { cArrCopy, cZero } from '../engine/complex';

interface SimulationState {
  steps: SimulationStep[];
  currentStepIndex: number;
  isRunning: boolean;
  hasSimulated: boolean;
  isSteppingMode: boolean;

  currentStateVector: Complex[];
  currentProbabilities: number[];
  currentSingleQubitStates: InitialStateConfig[];

  runFullSimulation: (
    qubitCount: number,
    initialStates: InitialStateConfig[],
    gates: GateInstance[]
  ) => void;
  runStepSimulation: (
    qubitCount: number,
    initialStates: InitialStateConfig[],
    gates: GateInstance[]
  ) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetSimulation: () => void;
  setRunning: (running: boolean) => void;
  setSteppingMode: (mode: boolean) => void;
  getCurrentStep: () => SimulationStep | null;
  getLastStep: () => SimulationStep | null;
  totalSteps: () => number;
}

function emptySimSteps(): SimulationStep[] {
  return [];
}

function initialEmptyState(n: number = 2): { state: Complex[]; probs: number[]; angles: InitialStateConfig[] } {
  const size = 1 << n;
  const state: Complex[] = new Array(size);
  for (let i = 0; i < size; i++) state[i] = { ...cZero };
  state[0] = { re: 1, im: 0 };
  const angles: InitialStateConfig[] = new Array(n).fill(null).map(() => ({ theta: 0, phi: 0 }));
  const probs = new Array(size).fill(0);
  probs[0] = 1;
  return { state, probs, angles };
}

function buildStep(
  stepIndex: number,
  appliedGate: GateInstance | null,
  stateVector: Complex[],
  qubitCount: number
): SimulationStep {
  const sv = cArrCopy(stateVector);
  return {
    stepIndex,
    appliedGate,
    stateVector: sv,
    singleQubitStates: stateToAllAngles(sv, qubitCount),
    probabilities: getProbabilities(sv),
  };
}

export const useSimulationStore = create<SimulationState>((set, get) => {
  const empty = initialEmptyState(2);
  return {
    steps: emptySimSteps(),
    currentStepIndex: 0,
    isRunning: false,
    hasSimulated: false,
    isSteppingMode: false,
    currentStateVector: empty.state,
    currentProbabilities: empty.probs,
    currentSingleQubitStates: empty.angles,

    runFullSimulation: (qubitCount, initialStates, gates) => {
      set({ isRunning: true, hasSimulated: false, isSteppingMode: false });
      try {
        const stateVector = runCircuit(qubitCount, initialStates, gates);
        const finalStep = buildStep(0, null, stateVector, qubitCount);
        const stepList: SimulationStep[] = [finalStep];
        set({
          steps: stepList,
          currentStepIndex: 0,
          currentStateVector: finalStep.stateVector,
          currentProbabilities: finalStep.probabilities,
          currentSingleQubitStates: finalStep.singleQubitStates,
          isRunning: false,
          hasSimulated: true,
        });
      } catch (e) {
        console.error(e);
        set({ isRunning: false });
      }
    },

    runStepSimulation: (qubitCount, initialStates, gates) => {
      set({ isRunning: true, hasSimulated: false, isSteppingMode: true });
      try {
        const raw = runCircuitStepByStep(qubitCount, initialStates, gates);
        const simSteps: SimulationStep[] = raw.map((r, idx) =>
          buildStep(idx, r.appliedGate, r.state, qubitCount)
        );
        const first = simSteps[0];
        set({
          steps: simSteps,
          currentStepIndex: 0,
          currentStateVector: first.stateVector,
          currentProbabilities: first.probabilities,
          currentSingleQubitStates: first.singleQubitStates,
          isRunning: false,
          hasSimulated: true,
        });
      } catch (e) {
        console.error(e);
        set({ isRunning: false });
      }
    },

    goToStep: (step) => {
      const s = get();
      if (s.steps.length === 0) return;
      const idx = Math.max(0, Math.min(s.steps.length - 1, step));
      const stepObj = s.steps[idx];
      set({
        currentStepIndex: idx,
        currentStateVector: stepObj.stateVector,
        currentProbabilities: stepObj.probabilities,
        currentSingleQubitStates: stepObj.singleQubitStates,
      });
    },

    nextStep: () => {
      const s = get();
      if (s.currentStepIndex < s.steps.length - 1) {
        s.goToStep(s.currentStepIndex + 1);
      }
    },

    prevStep: () => {
      const s = get();
      if (s.currentStepIndex > 0) {
        s.goToStep(s.currentStepIndex - 1);
      }
    },

    resetSimulation: () => {
      const empty = initialEmptyState(2);
      set({
        steps: emptySimSteps(),
        currentStepIndex: 0,
        isRunning: false,
        hasSimulated: false,
        isSteppingMode: false,
        currentStateVector: empty.state,
        currentProbabilities: empty.probs,
        currentSingleQubitStates: empty.angles,
      });
    },

    setRunning: (running) => set({ isRunning: running }),
    setSteppingMode: (mode) => set({ isSteppingMode: mode }),

    getCurrentStep: () => {
      const s = get();
      return s.steps[s.currentStepIndex] ?? null;
    },

    getLastStep: () => {
      const s = get();
      return s.steps[s.steps.length - 1] ?? null;
    },

    totalSteps: () => get().steps.length,
  };
});
