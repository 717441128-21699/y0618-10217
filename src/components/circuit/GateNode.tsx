import { useDrag } from 'react-dnd';
import type { GateInstance } from '../../types/quantum';
import { useCircuitStore } from '../../store/circuitStore';
import { getGateInfo } from '../../engine/gates';
import { DND_TYPES, type DragGateInstanceItem } from '../../utils/dnd';
import { gateColor } from '../../utils/color';
import clsx from 'clsx';

interface GateNodeProps {
  gate: GateInstance;
  x: (col: number) => number;
  y: (qubit: number) => number;
  columnWidth: number;
  rowHeight: number;
  isSelected: boolean;
}

export function GateNode({ gate, x, y, columnWidth, rowHeight, isSelected }: GateNodeProps) {
  const info = getGateInfo(gate.type);
  const selectGate = useCircuitStore((s) => s.selectGate);
  const removeGate = useCircuitStore((s) => s.removeGate);

  const color = gateColor(gate.type);
  const qubits = gate.targetQubits;
  const minQ = qubits[0];
  const maxQ = qubits[qubits.length - 1];
  const centerQ = (minQ + maxQ) / 2;

  const cx = x(gate.column);
  const centerY = y(centerQ);

  const boxWidth = Math.min(52, columnWidth - 12);
  const boxHeight = Math.max(40, (maxQ - minQ) * rowHeight + 36);

  const [{ isDragging }, drag] = useDrag<DragGateInstanceItem, unknown, { isDragging: boolean }>(() => ({
    type: DND_TYPES.GATE_INSTANCE,
    item: {
      type: DND_TYPES.GATE_INSTANCE,
      gateId: gate.id,
      fromQubits: [...gate.targetQubits],
      fromColumn: gate.column,
    },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [gate.id, gate.targetQubits, gate.column]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeGate(gate.id);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectGate(gate.id);
  };

  const label = info?.symbol ?? gate.type;

  const hasControlWire = gate.type === 'CNOT' || gate.type === 'CY' || gate.type === 'CZ';
  const isToffoli = gate.type === 'Toffoli' || gate.type === 'Fredkin';

  return (
    <g
      ref={drag as unknown as React.Ref<SVGGElement>}
      onContextMenu={handleContextMenu}
      onClick={handleClick}
      className={clsx('cursor-grab active:cursor-grabbing', isDragging ? 'opacity-40' : 'opacity-100')}
      style={{ transition: 'opacity 0.15s' }}
    >
      {(hasControlWire || isToffoli) && qubits.length > 1 && (
        <>
          <line
            x1={cx}
            y1={y(qubits[0])}
            x2={cx}
            y2={y(qubits[qubits.length - 1])}
            stroke={color}
            strokeWidth="2.5"
            strokeDasharray="4 3"
            opacity="0.8"
          />
          {hasControlWire && (
            <circle
              cx={cx}
              cy={y(qubits[0])}
              r="7"
              fill={color}
              stroke="white"
              strokeWidth="1.5"
            />
          )}
          {isToffoli && (
            <>
              <circle cx={cx} cy={y(qubits[0])} r="7" fill={color} stroke="white" strokeWidth="1.5" />
              <circle cx={cx} cy={y(qubits[1])} r="7" fill={color} stroke="white" strokeWidth="1.5" />
            </>
          )}
        </>
      )}

      {gate.type === 'SWAP' && qubits.length === 2 && (
        <>
          <line
            x1={cx}
            y1={y(qubits[0])}
            x2={cx}
            y2={y(qubits[1])}
            stroke={color}
            strokeWidth="2"
            opacity="0.6"
          />
          {qubits.map((q) => (
            <g key={q}>
              <line
                x1={cx - 10}
                y1={y(q) - 10}
                x2={cx + 10}
                y2={y(q) + 10}
                stroke={color}
                strokeWidth="2.5"
              />
              <line
                x1={cx + 10}
                y1={y(q) - 10}
                x2={cx - 10}
                y2={y(q) + 10}
                stroke={color}
                strokeWidth="2.5"
              />
            </g>
          ))}
        </>
      )}

      {(gate.type === 'Fredkin') && (
        <line
          x1={cx - 10}
          y1={y(qubits[qubits.length - 1]) - 10}
          x2={cx + 10}
          y2={y(qubits[qubits.length - 1]) + 10}
          stroke={color}
          strokeWidth="2.5"
        />
      )}

      {(gate.type !== 'SWAP') && (
        <>
          <rect
            x={cx - boxWidth / 2}
            y={centerY - boxHeight / 2}
            width={boxWidth}
            height={boxHeight}
            rx="10"
            fill={`url(#gateGrad-${gate.id})`}
            stroke={isSelected ? '#fff' : `${color}aa`}
            strokeWidth={isSelected ? 2.5 : 1.5}
            className="transition-all duration-200"
          />
          <defs>
            <linearGradient id={`gateGrad-${gate.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.95" />
              <stop offset="100%" stopColor={color} stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {isSelected && (
            <rect
              x={cx - boxWidth / 2 - 3}
              y={centerY - boxHeight / 2 - 3}
              width={boxWidth + 6}
              height={boxHeight + 6}
              rx="12"
              fill="none"
              stroke={color}
              strokeWidth="1"
              opacity="0.5"
              strokeDasharray="3 3"
            />
          )}

          <text
            x={cx}
            y={centerY + 4}
            textAnchor="middle"
            fontSize={label.length <= 2 ? 14 : 11}
            fontWeight="700"
            fill="white"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            }}
          >
            {label}
          </text>

          {gate.angle !== undefined && (
            <text
              x={cx}
              y={centerY + boxHeight / 2 - 4}
              textAnchor="middle"
              fontSize="8"
              fill="rgba(255,255,255,0.85)"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {((gate.angle * 180) / Math.PI).toFixed(0)}°
            </text>
          )}
        </>
      )}
    </g>
  );
}
