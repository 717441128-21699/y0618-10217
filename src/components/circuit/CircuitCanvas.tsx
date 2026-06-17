import { useRef, useMemo } from 'react';
import { useDrop } from 'react-dnd';
import type { GateInstance, GateType } from '../../types/quantum';
import { useCircuitStore } from '../../store/circuitStore';
import { DND_TYPES, type DragGateItem, type DragGateInstanceItem } from '../../utils/dnd';
import { GateNode } from './GateNode';
import { getGateInfo } from '../../engine/gates';
import { uid } from '../../utils/format';

const ROW_HEIGHT = 64;
const COLUMN_WIDTH = 72;
const LEFT_MARGIN = 72;
const MIN_COLUMNS = 12;

interface CircuitCanvasProps {
  onDrop?: () => void;
}

export function CircuitCanvas({ onDrop }: CircuitCanvasProps) {
  const qubitCount = useCircuitStore((s) => s.qubitCount);
  const gates = useCircuitStore((s) => s.gates);
  const addGate = useCircuitStore((s) => s.addGate);
  const moveGate = useCircuitStore((s) => s.moveGate);
  const isQubitOccupied = useCircuitStore((s) => s.isQubitOccupied);
  const selectedGateId = useCircuitStore((s) => s.selectedGateId);
  const selectGate = useCircuitStore((s) => s.selectGate);

  const svgRef = useRef<SVGSVGElement>(null);

  const maxCol = useMemo(() => {
    const fromGates = gates.length > 0 ? Math.max(...gates.map((g) => g.column)) : -1;
    return Math.max(MIN_COLUMNS - 1, fromGates);
  }, [gates]);

  const totalColumns = maxCol + 2;
  const canvasWidth = LEFT_MARGIN + totalColumns * COLUMN_WIDTH + 24;
  const canvasHeight = qubitCount * ROW_HEIGHT + 48;

  const [{ isOver, canDrop }, drop] = useDrop<
    DragGateItem | DragGateInstanceItem,
    unknown,
    { isOver: boolean; canDrop: boolean }
  >({
    accept: [DND_TYPES.GATE, DND_TYPES.GATE_INSTANCE],
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const svgEl = svgRef.current;
      if (!offset || !svgEl) return;
      const rect = svgEl.getBoundingClientRect();
      const x = offset.x - rect.left - LEFT_MARGIN;
      const y = offset.y - rect.top - 24;
      if (x < 0 || y < 0) return;

      const column = Math.floor(x / COLUMN_WIDTH);
      const qubit = Math.floor(y / ROW_HEIGHT);
      if (qubit < 0 || qubit >= qubitCount) return;

      if (item.type === DND_TYPES.GATE) {
        const info = getGateInfo(item.gateType as GateType);
        if (!info) return;

        const qubitsNeeded = info.qubitCount;
        const startQubit = Math.min(qubit, qubitCount - qubitsNeeded);
        const targets: number[] = [];
        for (let i = 0; i < qubitsNeeded; i++) targets.push(startQubit + i);

        const conflict = targets.some((q) => isQubitOccupied(q, column));
        if (conflict) return;

        const defaultAngle =
          item.gateType === 'Rx' || item.gateType === 'Ry' || item.gateType === 'Rz'
            ? Math.PI / 2
            : undefined;
        addGate(item.gateType as GateType, targets, column, defaultAngle);
      } else if (item.type === DND_TYPES.GATE_INSTANCE) {
        const gate = gates.find((g) => g.id === item.gateId);
        if (!gate) return;
        const qubitsNeeded = gate.targetQubits.length;
        const startQubit = Math.min(qubit, qubitCount - qubitsNeeded);
        const targets: number[] = [];
        for (let i = 0; i < qubitsNeeded; i++) targets.push(startQubit + i);

        const conflict = targets.some((q) => isQubitOccupied(q, column, item.gateId));
        if (conflict) return;
        moveGate(item.gateId, targets, column);
      }
      onDrop?.();
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const qubitRows = useMemo(() => {
    const rows = [];
    for (let q = 0; q < qubitCount; q++) {
      const y = 24 + q * ROW_HEIGHT + ROW_HEIGHT / 2;
      rows.push({ index: q, y });
    }
    return rows;
  }, [qubitCount]);

  const columns = useMemo(() => {
    const arr = [];
    for (let c = 0; c < totalColumns; c++) {
      arr.push(c);
    }
    return arr;
  }, [totalColumns]);

  const bgRef = (el: HTMLDivElement | null) => {
    drop(el);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if ((e.target as Element).tagName === 'svg' || (e.target as Element).classList.contains('canvas-bg')) {
      selectGate(null);
    }
  };

  return (
    <div
      ref={bgRef}
      onClick={handleCanvasClick}
      className={`canvas-bg relative w-full h-full rounded-xl overflow-auto custom-scrollbar ${
        isOver && canDrop ? 'ring-2 ring-cyan-400/60' : ''
      }`}
      style={{
        background:
          'radial-gradient(circle at 20% 30%, rgba(6,182,212,0.08), transparent 50%), radial-gradient(circle at 80% 70%, rgba(168,85,247,0.08), transparent 50%), #0b1220',
      }}
    >
      <svg
        ref={svgRef}
        width={canvasWidth}
        height={canvasHeight}
        className="canvas-bg block"
        style={{ minWidth: canvasWidth, minHeight: canvasHeight }}
      >
        <defs>
          <pattern id="grid-dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.04)" />
          </pattern>
          <linearGradient id="qubit-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(148,163,184,0.1)" />
            <stop offset="50%" stopColor="rgba(148,163,184,0.5)" />
            <stop offset="100%" stopColor="rgba(148,163,184,0.1)" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={canvasWidth} height={canvasHeight} fill="url(#grid-dots)" />

        {columns.map((c) => (
          <line
            key={`vline-${c}`}
            x1={LEFT_MARGIN + c * COLUMN_WIDTH + COLUMN_WIDTH / 2}
            y1={12}
            x2={LEFT_MARGIN + c * COLUMN_WIDTH + COLUMN_WIDTH / 2}
            y2={canvasHeight - 12}
            stroke="rgba(255,255,255,0.035)"
            strokeDasharray="2 4"
          />
        ))}

        {qubitRows.map((row) => (
          <g key={`qrow-${row.index}`}>
            <text
              x={LEFT_MARGIN - 16}
              y={row.y + 4}
              textAnchor="end"
              className="fill-slate-400"
              fontSize="12"
              fontWeight="600"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              q
              <tspan baselineShift="sub" fontSize="10">{row.index}</tspan>
            </text>
            <text
              x={LEFT_MARGIN - 16}
              y={row.y + 18}
              textAnchor="end"
              className="fill-slate-500"
              fontSize="9"
            >
              |0⟩
            </text>
            <line
              x1={LEFT_MARGIN}
              y1={row.y}
              x2={canvasWidth - 12}
              y2={row.y}
              stroke="url(#qubit-line)"
              strokeWidth="2"
            />
          </g>
        ))}

        {qubitRows.map((row) =>
          columns.map((c) => (
            <circle
              key={`node-${row.index}-${c}`}
              cx={LEFT_MARGIN + c * COLUMN_WIDTH + COLUMN_WIDTH / 2}
              cy={row.y}
              r="3"
              fill="rgba(148,163,184,0.2)"
            />
          ))
        )}

        {gates.map((gate) => (
          <GateNode
            key={gate.id}
            gate={gate}
            x={(col: number) => LEFT_MARGIN + col * COLUMN_WIDTH + COLUMN_WIDTH / 2}
            y={(q: number) => 24 + q * ROW_HEIGHT + ROW_HEIGHT / 2}
            columnWidth={COLUMN_WIDTH}
            rowHeight={ROW_HEIGHT}
            isSelected={selectedGateId === gate.id}
          />
        ))}

        {isOver && canDrop && (
          <rect
            x="0"
            y="0"
            width={canvasWidth}
            height={canvasHeight}
            fill="rgba(6,182,212,0.05)"
            pointerEvents="none"
          />
        )}
      </svg>
    </div>
  );
}
