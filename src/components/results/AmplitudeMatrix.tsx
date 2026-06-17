import { useMemo, useState } from 'react';
import { useCircuitStore } from '../../store/circuitStore';
import { useSimulationStore } from '../../store/simulationStore';
import { useUiStore } from '../../store/uiStore';
import { ArrowUpDown, Eye, EyeOff } from 'lucide-react';
import { GlowButton } from '../common/GlowButton';
import { binaryWithKet, complexToString, probabilityFormat, sortStatesByProbability } from '../../utils/format';
import { probabilityToColor } from '../../utils/color';
import type { Complex } from '../../types/quantum';

export function AmplitudeMatrix() {
  const qubitCount = useCircuitStore((s) => s.qubitCount);
  const stateVector = useSimulationStore((s) => s.currentStateVector);
  const hasSimulated = useSimulationStore((s) => s.hasSimulated);
  const sortAsc = useUiStore((s) => s.sortAmplitudes);
  const setSortAsc = useUiStore((s) => s.setSortAmplitudes);
  const showZero = useUiStore((s) => s.showZeroProbability);
  const setShowZero = useUiStore((s) => s.setShowZeroProbability);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const N = 1 << qubitCount;
  const display: Complex[] = useMemo(() => {
    if (stateVector.length >= N) return stateVector;
    const arr: Complex[] = new Array(N).fill(null).map((_, i) => ({ re: i === 0 ? 1 : 0, im: 0 }));
    return arr;
  }, [stateVector, N]);

  const rows = useMemo(() => {
    const list = sortStatesByProbability(display, !sortAsc);
    if (!showZero) {
      return list.filter((x) => x.probability > 1e-10);
    }
    return list;
  }, [display, sortAsc, showZero]);

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/60 border border-white/5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] text-slate-300 font-semibold">概率幅矩阵</span>
        </div>
        <div className="flex items-center gap-2">
          <GlowButton
            variant="ghost"
            size="sm"
            icon={<ArrowUpDown className="h-3 w-3" />}
            onClick={() => setSortAsc(!sortAsc)}
          >
            {sortAsc ? '概率↑' : '概率↓'}
          </GlowButton>
          <GlowButton
            variant="ghost"
            size="sm"
            icon={showZero ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            onClick={() => setShowZero(!showZero)}
          >
            {showZero ? '显示零项' : '隐藏零项'}
          </GlowButton>
        </div>
      </div>

      {!hasSimulated && (
        <div className="p-3 rounded-xl border border-amber-400/20 bg-amber-500/5">
          <p className="text-[11px] text-amber-300">
            💡 点击「运行模拟」以获得完整量子态演化结果。当前显示的是初始态。
          </p>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-auto custom-scrollbar rounded-xl border border-white/5 bg-slate-950/60">
        <table className="w-full text-[11px] font-mono border-collapse">
          <thead className="sticky top-0 bg-slate-900/95 backdrop-blur z-10">
            <tr className="border-b border-white/10">
              <th className="px-3 py-2 text-left text-slate-400 font-semibold uppercase tracking-wider text-[10px] w-[10%]">#</th>
              <th className="px-3 py-2 text-left text-slate-400 font-semibold uppercase tracking-wider text-[10px] w-[22%]">基态</th>
              <th className="px-3 py-2 text-left text-slate-400 font-semibold uppercase tracking-wider text-[10px] w-[38%]">概率幅 ψ</th>
              <th className="px-3 py-2 text-left text-slate-400 font-semibold uppercase tracking-wider text-[10px] w-[15%]">|ψ|²</th>
              <th className="px-3 py-2 text-left text-slate-400 font-semibold uppercase tracking-wider text-[10px] w-[15%]">概率</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const p = row.probability;
              const isSel = selectedRow === row.index;
              return (
                <tr
                  key={row.index}
                  onClick={() => setSelectedRow(isSel ? null : row.index)}
                  className={`border-b border-white/5 cursor-pointer transition-colors ${
                    isSel ? 'bg-cyan-500/10' : i % 2 === 0 ? 'bg-white/[0.015] hover:bg-white/[0.04]' : 'hover:bg-white/[0.04]'
                  }`}
                >
                  <td className="px-3 py-2 text-slate-500">{i + 1}</td>
                  <td className="px-3 py-2">
                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold border"
                      style={{
                        color: p > 0.1 ? '#a5f3fc' : '#94a3b8',
                        borderColor: probabilityToColor(p),
                        background: `${probabilityToColor(p)}18`,
                      }}
                    >
                      {binaryWithKet(row.index, qubitCount)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-200">{complexToString(row.amplitude, 4)}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden min-w-[50px]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, p * 100)}%`,
                            background: `linear-gradient(to right, #06b6d4, ${probabilityToColor(Math.max(0.3, p))})`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td
                    className="px-3 py-2 font-bold"
                    style={{ color: p > 0.5 ? '#34d399' : p > 0.1 ? '#67e8f9' : '#94a3b8' }}
                  >
                    {probabilityFormat(p, 2)}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-slate-500 text-xs">
                  所有量子态测量概率均接近 0
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
