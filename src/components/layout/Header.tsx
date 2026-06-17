import { Atom, Download, Github, Lightbulb } from 'lucide-react';
import { GlowButton } from '../common/GlowButton';
import { useUiStore } from '../../store/uiStore';

interface HeaderProps {
  onExport: () => void;
  onExamples: () => void;
}

export function Header({ onExport, onExamples }: HeaderProps) {
  const setQasmModal = useUiStore((s) => s.setQasmModalOpen);
  const setExampleModal = useUiStore((s) => s.setExampleModalOpen);

  return (
    <header className="relative z-20 h-16 shrink-0 flex items-center justify-between px-6 border-b border-white/10 bg-gradient-to-r from-slate-950/95 via-slate-900/90 to-indigo-950/90 backdrop-blur-xl">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -top-24 right-1/3 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-400/40 blur-xl rounded-full" />
          <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
            <Atom className="h-6 w-6 text-white drop-shadow" />
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent tracking-wide" style={{ fontFamily: "'Orbitron', system-ui, sans-serif" }}>
            Quantum Circuit Lab
          </h1>
          <p className="text-[11px] text-slate-400 tracking-widest uppercase">
            Quantum Circuit Simulator · Bloch Visualizer
          </p>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-3">
        <GlowButton
          variant="secondary"
          size="sm"
          icon={<Lightbulb className="h-4 w-4" />}
          onClick={() => {
            onExamples();
            setExampleModal(true);
          }}
        >
          算法示例
        </GlowButton>
        <GlowButton
          variant="secondary"
          size="sm"
          icon={<Download className="h-4 w-4" />}
          onClick={() => {
            onExport();
            setQasmModal(true);
          }}
        >
          导出QASM
        </GlowButton>
        <a
          href="https://en.wikipedia.org/wiki/Quantum_circuit"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-slate-800/60 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-700/80 hover:border-white/20 transition-all"
          title="了解量子电路"
        >
          <Github className="h-4 w-4" />
        </a>
      </div>
    </header>
  );
}
