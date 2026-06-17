import { useMemo, useState } from 'react';
import { useCircuitStore } from '../../store/circuitStore';
import { useSimulationStore } from '../../store/simulationStore';
import { useUiStore } from '../../store/uiStore';
import { ArrowUpDown, TrendingUp, BarChart3 } from 'lucide-react';
import { GlowButton } from '../common/GlowButton';
import { binaryString, probabilityFormat, sortStatesByProbability } from '../../utils/format';
import { probabilityToColor } from '../../utils/color';

export function ProbabilityHistogram() {
  const qubitCount = useCircuitStore((s) => s.qubitCount);
  const probabilities = useSimulationStore((s) => s.currentProbabilities);
  const hasSimulated = useSimulationStore((s) => s.hasSimulated);
  const showZero = useUiStore((s) => s.showZeroProbability);
  const setShowZero = useUiStore((s) => s.setShowZeroProbability);
  const [sortByProb, setSortByProb] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const N = 1 << qubitCount;

  const display = useMemo(() => {
    if (probabilities.length >= N) return probabilities;
    const arr = new Array(N).fill(0);
    arr[0] = 1;
    return arr;
  }, [probabilities, N]);

  const data = useMemo(() => {
    const all = display.map((p, idx) => ({ index: idx, probability: p }));
    const filteredByZero = all.filter((x) => showZero || x.probability > 1e-10);
    if (sortByProb) {
      return sortStatesByProbability(
        filteredByZero.map((x) => ({ re: Math.sqrt(x.probability), im: 0 }))
      ).map((s) => ({ index: s.index, probability: s.probability }));
    }
    return filteredByZero;
  }, [display, sortByProb, showZero]);

  const maxP = Math.max(0.01, ...data.map((d) => d.probability));

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/60 border border-white/5">
            <BarChart3 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[11px] text-slate-300 font-semibold">测量概率直方图</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">{data.length}个基态</span>
        </div>
        <div className="flex items-center gap-2">
          <GlowButton
            variant="ghost"
            size="sm"
            icon={<ArrowUpDown className="h-3 w-3" />}
            onClick={() => setSortByProb(!sortByProb)}
          >
            {sortByProb ? '已排序' : '按基态'}
          </GlowButton>
          <GlowButton
            variant="ghost"
            size="sm"
            icon={<TrendingUp className="h-3 w-3" />}
            onClick={() => setShowZero(!showZero)}
          >
            {showZero ? '显示零项' : '隐藏零项'}
          </GlowButton>
        </div>
      </div>

      {!hasSimulated && (
        <div className="p-3 rounded-xl border border-violet-400/20 bg-violet-500/5">
          <p className="text-[11px] text-violet-300">
            📊 当前为初始态分布。构建电路并运行模拟可观测测量结果。
          </p>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-auto custom-scrollbar rounded-xl border border-white/5 bg-slate-950/60 p-4 relative">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${Math.max(800, data.length * 44)} 320`}
          preserveAspectRatio="xMinYMid meet"
          className="block min-h-[280px]"
        >
          <defs>
            {data.map((d, i) => (
              <linearGradient key={i} id={`bar-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={probabilityToColor(d.probability)} stopOpacity={0.95} />
                <stop offset="100%" stopColor={probabilityToColor(d.probability)} stopOpacity={0.35} />
              </linearGradient>
            ))}
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = 260 - t * 220;
            return (
              <g key={t}>
                <line
                  x1="40"
                  y1={y}
                  x2={Math.max(800, data.length * 44) - 10}
                  y2={y}
                  stroke="rgba(148,163,184,0.1)"
                  strokeDasharray="3 4"
                />
                <text x="30" y={y + 3} fill="#64748b" fontSize="9" fontFamily="'JetBrains Mono', monospace" textAnchor="end">
                  {(t * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}

          <line x1="40" y1="260" x2={Math.max(800, data.length * 44) - 10} y2="260" stroke="rgba(148,163,184,0.4)" strokeWidth="1.5" />

          {data.map((d, i) => {
            const h = (d.probability / maxP) * 220;
            const x = 52 + i * 44;
            const y = 260 - h;
            const isHover = hoverIdx === i;
            return (
              <g
                key={i}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={x}
                  y={y}
                  width="28"
                  height={h}
                  rx="4"
                  fill={`url(#bar-${i})`}
                  stroke={isHover ? '#fff' : 'rgba(255,255,255,0.25)'}
                  strokeWidth={isHover ? 2 : 1}
                  style={{ transition: 'all 0.3s ease' }}
                  opacity={isHover ? 1 : 0.92}
                />
                {(h > 20 || isHover) && (
                  <text
                    x={x + 14}
                    y={y - 5}
                    fill="#a5f3fc"
                    fontSize="9"
                    fontFamily="'JetBrains Mono', monospace"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {probabilityFormat(d.probability, 1)}
                  </text>
                )}
                <text
                  x={x + 14}
                  y={276}
                  fill={isHover ? '#fff' : '#94a3b8'}
                  fontSize="9"
                  fontFamily="'JetBrains Mono', monospace"
                  textAnchor="middle"
                  fontWeight={isHover ? 'bold' : 'normal'}
                >
                  {binaryString(d.index, qubitCount)}
                </text>
                {isHover && (
                  <rect
                    x={x - 2}
                    y={y - 2}
                    width="32"
                    height={h + 4}
                    rx="5"
                    fill="none"
                    stroke="rgba(255,255,255,0.35)"
                    strokeDasharray="2 2"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {data.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
            没有可显示的量子态
          </div>
        )}
      </div>

      {hoverIdx !== null && data[hoverIdx] && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-900/30 to-emerald-900/30 border border-emerald-400/20">
          <div className="grid grid-cols-3 gap-3 text-[11px]">
            <div>
              <div className="text-slate-500 uppercase tracking-wider text-[9px]">基态</div>
              <div className="font-mono font-bold text-cyan-300 mt-0.5">
                |{binaryString(data[hoverIdx].index, qubitCount)}⟩
              </div>
            </div>
            <div>
              <div className="text-slate-500 uppercase tracking-wider text-[9px]">测量概率</div>
              <div className="font-mono text-emerald-300 mt-0.5 font-bold">
                {probabilityFormat(data[hoverIdx].probability, 3)}
              </div>
            </div>
            <div>
              <div className="text-slate-500 uppercase tracking-wider text-[9px]">采样 (1000次)</div>
              <div className="font-mono text-violet-300 mt-0.5">
                ~{Math.round(data[hoverIdx].probability * 1000)}次
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
