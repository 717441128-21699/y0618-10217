import { useDrag } from 'react-dnd';
import type { GateInfo } from '../../types/quantum';
import { DND_TYPES, type DragGateItem } from '../../utils/dnd';
import { gateColor } from '../../utils/color';
import clsx from 'clsx';

interface GateCardProps {
  gate: GateInfo;
  compact?: boolean;
  disabled?: boolean;
  currentQubitCount?: number;
}

export function GateCard({ gate, compact = false, disabled = false, currentQubitCount }: GateCardProps) {
  const color = gateColor(gate.type);
  const [{ isDragging }, drag] = useDrag<DragGateItem, unknown, { isDragging: boolean }>(() => ({
    type: DND_TYPES.GATE,
    canDrag: !disabled,
    item: {
      type: DND_TYPES.GATE,
      gateType: gate.type,
      label: gate.label,
      qubitCount: gate.qubitCount,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [gate, disabled]);

  const title = disabled
    ? `${gate.description}\n⚠ 需要 ${gate.qubitCount} 个量子比特，当前仅 ${currentQubitCount} 个，请增加量子比特数`
    : gate.description;

  return (
    <div
      ref={drag}
      title={title}
      className={clsx(
        'relative group select-none transition-all duration-200',
        compact ? 'p-1.5 rounded-lg' : 'p-2 rounded-xl',
        disabled
          ? 'cursor-not-allowed bg-slate-900/60 border border-white/5 opacity-40 grayscale'
          : 'cursor-grab active:cursor-grabbing bg-slate-800/60 border border-white/10 hover:border-white/30 hover:bg-slate-800/90 hover:-translate-y-0.5 hover:shadow-lg',
        isDragging ? 'opacity-40 scale-95' : 'opacity-100'
      )}
      style={{
        boxShadow: isDragging ? 'none' : undefined,
      }}
    >
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-40 transition-opacity blur-xl pointer-events-none" style={{ background: color }} />
      <div className="relative flex items-center gap-2">
        <div
          className={clsx(
            'flex items-center justify-center font-bold rounded-md border text-white shadow-md shrink-0',
            compact ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'
          )}
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
            borderColor: `${color}88`,
          }}
        >
          {gate.symbol.length <= 2 ? gate.symbol : gate.symbol.slice(0, 2)}
        </div>
        {!compact && (
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-100 truncate">{gate.label}</div>
            <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
              <span>{gate.qubitCount}比特 · {gate.category}</span>
              {disabled && (
                <span className="text-amber-400/90 font-bold">· 需≥{gate.qubitCount}Q</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
