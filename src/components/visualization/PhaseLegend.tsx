import { useMemo } from 'react';
import { phaseToColor } from '../../utils/color';

export function PhaseLegend() {
  const stops = useMemo(() => {
    const arr = [];
    for (let i = 0; i <= 12; i++) {
      const p = (i / 12) * Math.PI * 2;
      arr.push({ pct: (i / 12) * 100, color: phaseToColor(p, 1) });
    }
    return arr;
  }, []);

  const gradient = `linear-gradient(to right, ${stops.map((s) => `${s.color} ${s.pct}%`).join(', ')})`;

  return (
    <div className="p-2.5 rounded-xl bg-slate-900/40 border border-white/5 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">相位图例</span>
        <span className="text-[9px] text-slate-500 font-mono">HSV 色相环 0° → 360°</span>
      </div>
      <div
        className="h-3 rounded-full"
        style={{ background: gradient, boxShadow: 'inset 0 0 6px rgba(0,0,0,0.4)' }}
      />
      <div className="flex justify-between text-[9px] font-mono text-slate-500 px-0.5">
        <span>0</span>
        <span>π/2</span>
        <span>π</span>
        <span>3π/2</span>
        <span>2π</span>
      </div>
    </div>
  );
}
