import { useMemo, useState } from 'react';
import { X, ChevronRight, Lightbulb, Sparkles, ArrowRight } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { GlowButton } from '../common/GlowButton';
import { EXAMPLE_CIRCUITS } from '../../examples/circuits';
import type { ExampleCircuit } from '../../types/quantum';
import { useUiStore } from '../../store/uiStore';
import { useCircuitStore } from '../../store/circuitStore';
import clsx from 'clsx';

interface Props {
  onClose?: () => void;
}

export function ExampleSelector({ onClose }: Props) {
  const isOpen = useUiStore((s) => s.exampleModalOpen);
  const setOpen = useUiStore((s) => s.setExampleModalOpen);
  const loadExample = useCircuitStore((s) => s.loadExampleCircuit);
  const [selected, setSelected] = useState<ExampleCircuit | null>(null);

  const categories = useMemo(() => {
    return [
      {
        name: '入门基础',
        color: 'from-cyan-500 to-sky-600',
        items: EXAMPLE_CIRCUITS.filter((c) => ['bell', 'hadamard', 'ghz'].includes(c.id)),
      },
      {
        name: '经典算法',
        color: 'from-violet-500 to-fuchsia-600',
        items: EXAMPLE_CIRCUITS.filter((c) => ['grover', 'deutsch', 'qft'].includes(c.id)),
      },
    ];
  }, []);

  if (!isOpen) return null;

  const handleLoad = () => {
    if (selected) {
      loadExample(selected);
      setOpen(false);
      onClose?.();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      onClick={() => setOpen(false)}
    >
      <GlassCard
        className="w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl"
        glow
        glowColor="#a855f7"
        padding="none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-violet-500/10 pointer-events-none" />
          <div className="relative flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">内置量子算法示例</h3>
              <p className="text-[11px] text-slate-400">一键加载经典电路，快速体验量子计算核心概念</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="relative h-9 w-9 rounded-xl bg-slate-800/60 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-700/80 hover:border-white/20 transition-all flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-0 flex-1 min-h-0">
          <div className="md:col-span-3 border-r border-white/5 p-4 overflow-auto custom-scrollbar">
            {categories.map((cat) => (
              <div key={cat.name} className="mb-5 last:mb-0">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${cat.color}`} />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">{cat.name}</span>
                </div>
                <div className="grid gap-2">
                  {cat.items.map((item) => {
                    const isSel = selected?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelected(item)}
                        className={clsx(
                          'relative text-left p-3 rounded-xl transition-all duration-200 border overflow-hidden group',
                          isSel
                            ? 'border-cyan-400/60 bg-gradient-to-r from-cyan-500/15 to-violet-500/15 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                            : 'border-white/10 bg-slate-900/40 hover:bg-slate-800/60 hover:border-white/20'
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Sparkles className={clsx('h-3.5 w-3.5 shrink-0', isSel ? 'text-cyan-300' : 'text-slate-500')} />
                              <span className="text-sm font-semibold text-white">{item.name}</span>
                              <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                                {item.qubitCount}Q
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                          <ChevronRight className={clsx('h-4 w-4 shrink-0 transition-all', isSel ? 'text-cyan-400 translate-x-0' : 'text-slate-600 -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0')} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="md:col-span-2 p-4 overflow-auto custom-scrollbar bg-gradient-to-b from-slate-900/50 to-transparent">
            {selected ? (
              <div className="flex flex-col gap-4 h-full">
                <div className="p-4 rounded-xl border border-white/10 bg-slate-950/60">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-semibold">已选择</span>
                  </div>
                  <h4 className="text-xl font-bold bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent mb-2">
                    {selected.name}
                  </h4>
                  <p className="text-[12px] text-slate-400 leading-relaxed">
                    {selected.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                    <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">量子比特</div>
                    <div className="text-2xl font-bold text-cyan-300 font-mono">{selected.qubitCount}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                    <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">门数量</div>
                    <div className="text-2xl font-bold text-violet-300 font-mono">{selected.gates.length}</div>
                  </div>
                </div>

                {selected.expectedResults && (
                  <div className="p-3 rounded-xl border border-violet-400/20 bg-violet-500/8">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] font-bold text-violet-300 mb-1 uppercase tracking-wider">预期结果</div>
                        <p className="text-[11px] text-violet-200/80 leading-relaxed">
                          {selected.expectedResults}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-4 space-y-2">
                  <GlowButton
                    variant="primary"
                    size="lg"
                    fullWidth
                    glow
                    icon={<ArrowRight className="h-4 w-4" />}
                    onClick={handleLoad}
                  >
                    加载此电路
                  </GlowButton>
                  <p className="text-[10px] text-center text-slate-500">
                    将替换当前画布上的电路
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center mb-4 shadow-inner">
                  <Lightbulb className="h-7 w-7 text-slate-600" />
                </div>
                <div className="text-sm font-semibold text-slate-400 mb-1">选择一个示例电路</div>
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  点击左侧任意示例查看详细信息<br />并一键加载到电路画布
                </div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
