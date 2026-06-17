import { useMemo, useState } from 'react';
import { X, Copy, Download, Check, FileCode, AlertTriangle } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { GlowButton } from '../common/GlowButton';
import { useUiStore } from '../../store/uiStore';
import { useCircuitStore } from '../../store/circuitStore';
import { circuitToQasm, copyToClipboard, downloadQasmFile } from '../../engine/qasmExport';
import clsx from 'clsx';

export function QasmExportModal() {
  const isOpen = useUiStore((s) => s.qasmModalOpen);
  const setOpen = useUiStore((s) => s.setQasmModalOpen);
  const qubitCount = useCircuitStore((s) => s.qubitCount);
  const gates = useCircuitStore((s) => s.gates);
  const [copied, setCopied] = useState(false);

  const qasmCode = useMemo(() => circuitToQasm(qubitCount, gates, true, true), [qubitCount, gates]);

  const lineCount = useMemo(() => qasmCode.split('\n').length, [qasmCode]);

  const handleCopy = async () => {
    try {
      await copyToClipboard(qasmCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownload = () => {
    downloadQasmFile(qasmCode, `quantum-circuit-${qubitCount}q-${gates.length}g.qasm`);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      onClick={() => setOpen(false)}
    >
      <GlassCard
        className="w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl"
        glow
        glowColor="#06b6d4"
        padding="none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-emerald-500/10 pointer-events-none" />
          <div className="relative flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 via-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <FileCode className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">导出 OpenQASM 2.0</h3>
              <p className="text-[11px] text-slate-400">
                与IBM Qiskit、Google Cirq、Q#等量子计算平台兼容
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="relative h-9 w-9 rounded-xl bg-slate-800/60 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-700/80 hover:border-white/20 transition-all flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {gates.length === 0 && (
          <div className="mx-6 mt-4 p-3 rounded-xl border border-amber-400/30 bg-amber-500/10 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-amber-300">空电路提醒</div>
              <p className="text-[11px] text-amber-200/70 mt-0.5">
                当前画布上没有量子门，导出的QASM文件仅包含基础声明和默认测量操作。
              </p>
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0 mx-6 my-4 rounded-xl overflow-hidden border border-white/10 bg-slate-950/80">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-slate-900/60">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
              </div>
              <span className="text-[11px] text-slate-400 font-mono ml-2">circuit.qasm</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">{lineCount} 行 · OpenQASM 2.0</span>
          </div>

          <div className="overflow-auto custom-scrollbar max-h-[50vh]">
            <pre className="p-4 text-[12px] leading-6 font-mono text-slate-200">
              {qasmCode.split('\n').map((line, i) => (
                <div key={i} className={clsx('flex gap-4 hover:bg-white/[0.03]', { 'text-emerald-300/70': line.startsWith('//') || line.startsWith('OPENQASM') || line.startsWith('include') })}>
                  <span className="select-none text-slate-600 w-8 text-right shrink-0">{i + 1}</span>
                  <code className="flex-1 whitespace-pre">
                    {highlightSyntax(line)}
                  </code>
                </div>
              ))}
            </pre>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between gap-4 flex-wrap bg-slate-900/30">
          <div className="text-[11px] text-slate-500">
            <span className="font-mono">{qubitCount}</span> 量子比特 · <span className="font-mono">{gates.length}</span> 门操作
          </div>
          <div className="flex items-center gap-2">
            <GlowButton variant="secondary" size="md" icon={copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />} onClick={handleCopy}>
              {copied ? '已复制!' : '复制代码'}
            </GlowButton>
            <GlowButton variant="primary" size="md" glow icon={<Download className="h-4 w-4" />} onClick={handleDownload}>
              下载 .qasm
            </GlowButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function highlightSyntax(line: string): React.ReactNode {
  if (line.trim() === '') return '\u00A0';
  if (line.startsWith('//')) {
    return <span className="text-emerald-400/80 italic">{line}</span>;
  }
  const keywords = ['OPENQASM', 'include', 'qreg', 'creg', 'measure', 'barrier'];
  let result: React.ReactNode = line;
  keywords.forEach((kw) => {
    const idx = line.indexOf(kw);
    if (idx === 0) {
      result = (
        <>
          <span className="text-violet-400 font-bold">{kw}</span>
          <span className="text-slate-200">{line.slice(kw.length)}</span>
        </>
      );
    }
  });
  if (line.includes('->')) {
    const [a, b] = line.split('->');
    return (
      <>
        <span className="text-cyan-300">{a}</span>
        <span className="text-slate-500">{' -> '}</span>
        <span className="text-orange-300">{b}</span>
      </>
    );
  }
  return result;
}
