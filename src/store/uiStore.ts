import { create } from 'zustand';

export type RightPanelTab = 'visualization' | 'results';

interface UiState {
  rightPanelTab: RightPanelTab;
  qasmModalOpen: boolean;
  exampleModalOpen: boolean;
  sortAmplitudes: boolean;
  showZeroProbability: boolean;
  blochAutoRotate: boolean;
  wavefunctionCompact: boolean;
  circuitTooltip: string | null;

  setRightPanelTab: (t: RightPanelTab) => void;
  setQasmModalOpen: (o: boolean) => void;
  setExampleModalOpen: (o: boolean) => void;
  setSortAmplitudes: (s: boolean) => void;
  setShowZeroProbability: (s: boolean) => void;
  setBlochAutoRotate: (r: boolean) => void;
  setWavefunctionCompact: (c: boolean) => void;
  setCircuitTooltip: (t: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  rightPanelTab: 'visualization',
  qasmModalOpen: false,
  exampleModalOpen: false,
  sortAmplitudes: true,
  showZeroProbability: true,
  blochAutoRotate: true,
  wavefunctionCompact: false,
  circuitTooltip: null,

  setRightPanelTab: (t) => set({ rightPanelTab: t }),
  setQasmModalOpen: (o) => set({ qasmModalOpen: o }),
  setExampleModalOpen: (o) => set({ exampleModalOpen: o }),
  setSortAmplitudes: (s) => set({ sortAmplitudes: s }),
  setShowZeroProbability: (s) => set({ showZeroProbability: s }),
  setBlochAutoRotate: (r) => set({ blochAutoRotate: r }),
  setWavefunctionCompact: (c) => set({ wavefunctionCompact: c }),
  setCircuitTooltip: (t) => set({ circuitTooltip: t }),
}));
