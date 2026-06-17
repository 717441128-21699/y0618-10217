import { useMemo } from 'react';
import { BlochSphere } from './BlochSphere';
import { useCircuitStore } from '../../store/circuitStore';
import { useSimulationStore } from '../../store/simulationStore';
import { useUiStore } from '../../store/uiStore';
import { stateToAllBloch } from '../../engine/bloch';
import type { BlochCoords, Complex } from '../../types/quantum';
import { Eye, EyeOff } from 'lucide-react';
import { GlowButton } from '../common/GlowButton';

const ZERO_COORDS: BlochCoords = { x: 0, y: 0, z: 1, theta: 0, phi: 0 };

export function BlochSphereGrid() {
  const qubitCount = useCircuitStore((s) => s.qubitCount);
  const initialStates = useCircuitStore((s) => s.initialStates);
  const currentState = useSimulationStore((s) => s.currentStateVector);
  const hasSimulated = useSimulationStore((s) => s.hasSimulated);
  const autoRotate = useUiStore((s) => s.blochAutoRotate);
  const setAutoRotate = useUiStore((s) => s.setBlochAutoRotate);

  const blochCoords: BlochCoords[] = useMemo(() => {
    if (hasSimulated && currentState && currentState.length > 0) {
      try {
        return stateToAllBloch(currentState, qubitCount);
      } catch {
        // ignore
      }
    }
    return initialStates.map((s) => {
      const sinT = Math.sin(s.theta);
      return {
        x: sinT * Math.cos(s.phi),
        y: sinT * Math.sin(s.phi),
        z: Math.cos(s.theta),
        theta: s.theta,
        phi: s.phi,
      };
    });
  }, [currentState, qubitCount, initialStates, hasSimulated]);

  while (blochCoords.length < qubitCount) blochCoords.push(ZERO_COORDS);

  const cols = qubitCount <= 2 ? 2 : qubitCount <= 4 ? 2 : qubitCount <= 6 ? 3 : 4;
  const rows = Math.ceil(qubitCount / cols);

  const gridStyle = {
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${rows}, minmax(140px, 1fr))`,
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/60 border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-[11px] text-slate-300 font-semibold">Bloch球阵列</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">{qubitCount}量子比特</span>
        </div>
        <GlowButton
          variant="ghost"
          size="sm"
          icon={autoRotate ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          onClick={() => setAutoRotate(!autoRotate)}
        >
          {autoRotate ? '自动旋转' : '已暂停'}
        </GlowButton>
      </div>
      <div
        className="grid gap-2 flex-1 min-h-0"
        style={gridStyle}
      >
        {Array.from({ length: qubitCount }).map((_, idx) => (
          <BlochSphere
            key={idx}
            coords={blochCoords[idx] ?? ZERO_COORDS}
            label={`q${idx}`}
            index={idx}
            autoRotate={autoRotate}
          />
        ))}
      </div>
    </div>
  );
}
