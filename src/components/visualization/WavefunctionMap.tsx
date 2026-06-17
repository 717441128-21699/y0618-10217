import { useEffect, useRef, useState } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { useCircuitStore } from '../../store/circuitStore';
import type { Complex } from '../../types/quantum';
import { complexToColor } from '../../utils/color';
import { binaryWithKet, complexToString, getMaxModulus, probabilityFormat } from '../../utils/format';

export function WavefunctionMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const qubitCount = useCircuitStore((s) => s.qubitCount);
  const stateVector = useSimulationStore((s) => s.currentStateVector);
  const hasSimulated = useSimulationStore((s) => s.hasSimulated);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [cellSize, setCellSize] = useState(40);

  const N = 1 << qubitCount;

  useEffect(() => {
    if (!containerRef.current) return;
    const resize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cols = Math.ceil(Math.sqrt(N));
      const cw = Math.floor((rect.width - 16) / cols);
      setCellSize(Math.max(24, Math.min(64, cw)));
    };
    resize();
    const observer = new ResizeObserver(resize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [N]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cols = Math.ceil(Math.sqrt(N));
    const rows = Math.ceil(N / cols);
    const pad = 3;
    const W = cols * cellSize;
    const H = rows * cellSize;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const sv: Complex[] = stateVector.length >= N ? stateVector : new Array(N).fill(null).map((_, i) => ({ re: i === 0 ? 1 : 0, im: 0 }));
    const maxMod = getMaxModulus(sv);

    for (let i = 0; i < N; i++) {
      const c = Math.floor(i / cols);
      const r = i % cols;
      const x = r * cellSize + pad / 2;
      const y = c * cellSize + pad / 2;
      const size = cellSize - pad;

      const colors = complexToColor(sv[i], maxMod);
      const isHover = hoverIndex === i;

      ctx.save();
      ctx.shadowColor = colors.ring;
      ctx.shadowBlur = isHover ? 14 : 6 * colors.intensity;
      ctx.fillStyle = colors.bg;
      roundRect(ctx, x, y, size, size, Math.min(8, size / 5));
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = colors.ring;
      ctx.lineWidth = isHover ? 2.5 : 1.5 + colors.intensity * 1.5;
      roundRect(ctx, x + 1.5, y + 1.5, size - 3, size - 3, Math.min(7, (size - 3) / 5));
      ctx.stroke();
      ctx.restore();

      if (size >= 36) {
        const cx = x + size / 2;
        const cy = y + size / 2;
        const ringR = Math.min(9, size / 4.5);
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = colors.ring;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, ringR * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = `${Math.max(8, Math.floor(size / 4.8))}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(i.toString(2).padStart(qubitCount, '0'), cx, y + size - 3);
      }
    }

    if (hoverIndex !== null && hoverIndex >= 0 && hoverIndex < N) {
      const c = Math.floor(hoverIndex / cols);
      const r = hoverIndex % cols;
      const x = r * cellSize + pad / 2;
      const y = c * cellSize + pad / 2;
      const size = cellSize - pad;
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      roundRect(ctx, x - 2, y - 2, size + 4, size + 4, Math.min(10, size / 4));
      ctx.stroke();
      ctx.restore();
    }
  }, [stateVector, cellSize, N, qubitCount, hoverIndex]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cols = Math.ceil(Math.sqrt(N));
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    const idx = row * cols + col;
    if (idx >= 0 && idx < N) {
      setHoverIndex(idx);
    } else {
      setHoverIndex(null);
    }
  };

  const cols = Math.ceil(Math.sqrt(N));
  const displaySV: Complex[] = stateVector.length >= N ? stateVector : new Array(N).fill(null).map((_, i) => ({ re: i === 0 ? 1 : 0, im: 0 }));

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/60 border border-white/5">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-[11px] text-slate-300 font-semibold">波函数颜色映射</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">
          维度 N={N} {hasSimulated ? '· 已模拟' : '· 初始态'}
        </span>
      </div>
      <div ref={containerRef} className="flex-1 min-h-0 overflow-auto custom-scrollbar rounded-lg border border-white/5 p-2 bg-slate-950/40 flex items-start justify-center">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
          className="block cursor-crosshair"
        />
      </div>

      {hoverIndex !== null && (
        <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10">
          <div className="grid grid-cols-3 gap-3 text-[11px]">
            <div>
              <div className="text-slate-500 uppercase tracking-wider text-[9px]">基态</div>
              <div className="font-mono font-bold text-cyan-300 mt-0.5">
                {binaryWithKet(hoverIndex, qubitCount)}
              </div>
            </div>
            <div>
              <div className="text-slate-500 uppercase tracking-wider text-[9px]">概率幅</div>
              <div className="font-mono text-violet-300 mt-0.5">
                {complexToString(displaySV[hoverIndex])}
              </div>
            </div>
            <div>
              <div className="text-slate-500 uppercase tracking-wider text-[9px]">测量概率</div>
              <div className="font-mono text-emerald-300 mt-0.5">
                {probabilityFormat(Math.abs(displaySV[hoverIndex].re) ** 2 + Math.abs(displaySV[hoverIndex].im) ** 2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}
