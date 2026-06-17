import { Play, SkipForward, SkipBack, FastForward, Trash2, RotateCcw, Shuffle } from 'lucide-react';
import { GlowButton } from '../common/GlowButton';
import { useCircuitStore } from '../../store/circuitStore';
import { useSimulationStore } from '../../store/simulationStore';
import { degToRad, radToDeg } from '../../utils/format';
import { useMemo } from 'react';

export function ControlPanel() {
  const qubitCount = useCircuitStore((s) => s.qubitCount);
  const setQubitCount = useCircuitStore((s) => s.setQubitCount);
  const gates = useCircuitStore((s) => s.gates);
  const initialStates = useCircuitStore((s) => s.initialStates);
  const setInitialState = useCircuitStore((s) => s.setInitialState);
  const resetInitialStates = useCircuitStore((s) => s.resetInitialStates);
  const clearGates = useCircuitStore((s) => s.clearGates);
  const selectedGateId = useCircuitStore((s) => s.selectedGateId);
  const removeGate = useCircuitStore((s) => s.removeGate);

  const runFull = useSimulationStore((s) => s.runFullSimulation);
  const runStep = useSimulationStore((s) => s.runStepSimulation);
  const resetSim = useSimulationStore((s) => s.resetSimulation);
  const nextStep = useSimulationStore((s) => s.nextStep);
  const prevStep = useSimulationStore((s) => s.prevStep);
  const currentStep = useSimulationStore((s) => s.currentStepIndex);
  const totalSteps = useSimulationStore((s) => s.totalSteps());
  const isSteppingMode = useSimulationStore((s) => s.isSteppingMode);
  const isRunning = useSimulationStore((s) => s.isRunning);

  const gateCountText = useMemo(() => `${gates.length}个门`, [gates]);

  const handleRunFull = () => runFull(qubitCount, initialStates, gates);
  const handleStep = () => runStep(qubitCount, initialStates, gates);
  const handleReset = () => {
    resetSim();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3">
        <div className="p-3 rounded-xl bg-slate-800/40 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300">量子比特数</label>
            <span className="text-xs text-cyan-300 font-mono font-bold">{qubitCount}</span>
          </div>
          <input
            type="range"
            min={2}
            max={8}
            step={1}
            value={qubitCount}
            onChange={(e) => setQubitCount(parseInt(e.target.value, 10))}
            className="w-full h-2 rounded-full bg-slate-700/60 appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between mt-1 text-[10px] text-slate-500 font-mono">
            <span>2</span><span>4</span><span>6</span><span>8</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400/70 animate-pulse" />
            状态维度：<span className="font-mono text-emerald-300">{2 ** qubitCount}</span> · {gateCountText}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/40 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300">初始量子态设置</label>
            <button
              onClick={resetInitialStates}
              className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              重置 |0⟩
            </button>
          </div>
          <div className="space-y-2 max-h-[160px] overflow-auto pr-1 custom-scrollbar">
            {initialStates.map((state, q) => (
              <div key={q} className="p-2 rounded-lg bg-slate-900/60 border border-white/5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-cyan-300 font-mono">q{q}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    θ={radToDeg(state.theta).toFixed(0)}° φ={radToDeg(state.phi).toFixed(0)}°
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider">θ 极角</span>
                    <input
                      type="range"
                      min={0}
                      max={180}
                      value={Math.round(radToDeg(state.theta))}
                      onChange={(e) => setInitialState(q, degToRad(parseInt(e.target.value, 10)), state.phi)}
                      className="h-1.5 rounded-full bg-slate-700 accent-cyan-500"
                    />
                  </label>
                  <label className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider">φ 方位</span>
                    <input
                      type="range"
                      min={0}
                      max={359}
                      value={Math.round(radToDeg(state.phi))}
                      onChange={(e) => setInitialState(q, state.theta, degToRad(parseInt(e.target.value, 10)))}
                      className="h-1.5 rounded-full bg-slate-700 accent-violet-500"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <GlowButton
          variant="primary"
          size="md"
          fullWidth
          icon={<Play className="h-4 w-4" />}
          onClick={handleRunFull}
          disabled={isRunning || gates.length === 0}
          glow
        >
          运行模拟
        </GlowButton>
        <GlowButton
          variant="secondary"
          size="md"
          fullWidth
          icon={<Shuffle className="h-4 w-4" />}
          onClick={handleStep}
          disabled={isRunning}
        >
          步进执行
        </GlowButton>
      </div>

      {isSteppingMode && totalSteps > 0 && (
        <div className="p-3 rounded-xl bg-gradient-to-br from-violet-900/30 to-cyan-900/30 border border-violet-400/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-200">步进控制</span>
            <span className="text-xs font-mono text-violet-300">
              {currentStep} / {totalSteps - 1}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <GlowButton variant="ghost" size="sm" icon={<SkipBack className="h-4 w-4" />} onClick={prevStep} disabled={currentStep <= 0}>
              上一步
            </GlowButton>
            <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-300"
                style={{ width: `${(currentStep / Math.max(1, totalSteps - 1)) * 100}%` }}
              />
            </div>
            <GlowButton variant="ghost" size="sm" icon={<SkipForward className="h-4 w-4" />} onClick={nextStep} disabled={currentStep >= totalSteps - 1}>
              下一步
            </GlowButton>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <GlowButton
          variant="danger"
          size="sm"
          icon={<Trash2 className="h-3.5 w-3.5" />}
          onClick={clearGates}
          disabled={gates.length === 0}
        >
          清除电路
        </GlowButton>
        <GlowButton
          variant="secondary"
          size="sm"
          icon={<FastForward className="h-3.5 w-3.5" />}
          onClick={handleReset}
        >
          重置模拟
        </GlowButton>
      </div>

      {selectedGateId && (
        <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-400/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-300 font-semibold">已选中门</span>
            <GlowButton
              variant="danger"
              size="sm"
              icon={<Trash2 className="h-3 w-3" />}
              onClick={() => removeGate(selectedGateId)}
            >
              删除
            </GlowButton>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            右键单击门节点可快速删除 · 拖拽移动位置
          </p>
        </div>
      )}
    </div>
  );
}
