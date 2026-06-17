import { GATE_INFO_LIST } from '../../engine/gates';
import type { GateCategory, GateInfo } from '../../types/quantum';
import { GateCard } from './GateCard';
import { useState } from 'react';

const categoryLabels: Record<GateCategory | 'all', string> = {
  all: '全部',
  single: '单量子门',
  rotation: '旋转门',
  controlled: '受控门',
  multi: '多量子门',
  measurement: '测量',
};

const categoryOrder: (GateCategory | 'all')[] = ['all', 'single', 'rotation', 'controlled', 'multi', 'measurement'];

export function GatePalette() {
  const [activeCat, setActiveCat] = useState<GateCategory | 'all'>('all');

  const filtered: GateInfo[] = activeCat === 'all'
    ? GATE_INFO_LIST
    : GATE_INFO_LIST.filter((g) => g.category === activeCat);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1">
        {categoryOrder.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition-all duration-200 ${
              activeCat === cat
                ? 'bg-gradient-to-r from-cyan-500/90 to-violet-600/90 text-white shadow-[0_0_10px_rgba(6,182,212,0.35)]'
                : 'text-slate-400 hover:text-slate-200 bg-white/5 hover:bg-white/10 border border-white/5'
            }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 mt-1">
        {filtered.map((gate) => (
          <GateCard key={gate.type} gate={gate} />
        ))}
      </div>

      <div className="mt-2 p-3 rounded-xl border border-white/5 bg-gradient-to-br from-cyan-500/5 to-violet-500/5">
        <p className="text-[11px] text-slate-400 leading-relaxed">
          <span className="font-semibold text-cyan-300">提示：</span>
          将左侧量子门拖拽到中间画布的量子比特线路上。
          受控门需跨越多条线路（可通过按住拖动来放置）。
        </p>
      </div>
    </div>
  );
}
