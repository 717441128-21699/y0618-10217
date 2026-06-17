import { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Header } from '@/components/layout/Header';
import { LayoutPanel } from '@/components/layout/LayoutPanel';
import { GatePalette } from '@/components/gate/GatePalette';
import { CircuitCanvas } from '@/components/circuit/CircuitCanvas';
import { ControlPanel } from '@/components/control/ControlPanel';
import { BlochSphereGrid } from '@/components/visualization/BlochSphereGrid';
import { WavefunctionMap } from '@/components/visualization/WavefunctionMap';
import { PhaseLegend } from '@/components/visualization/PhaseLegend';
import { AmplitudeMatrix } from '@/components/results/AmplitudeMatrix';
import { ProbabilityHistogram } from '@/components/results/ProbabilityHistogram';
import { TabSwitcher } from '@/components/common/TabSwitcher';
import { ExampleSelector } from '@/components/examples/ExampleSelector';
import { QasmExportModal } from '@/components/examples/QasmExportModal';
import { useUiStore } from '@/store/uiStore';
import { useCircuitStore } from '@/store/circuitStore';
import { useSimulationStore } from '@/store/simulationStore';
import { Atom, Orbit, Sparkles, Table, BarChart3, Grip } from 'lucide-react';

export default function App() {
  const rightTab = useUiStore((s) => s.rightPanelTab);
  const setRightTab = useUiStore((s) => s.setRightPanelTab);
  const qubitCount = useCircuitStore((s) => s.qubitCount);
  const gates = useCircuitStore((s) => s.gates);
  const initialStates = useCircuitStore((s) => s.initialStates);
  const runFull = useSimulationStore((s) => s.runFullSimulation);

  useEffect(() => {
    runFull(qubitCount, initialStates, gates);
  }, []);

  const handleDrop = () => {
    const qc = useCircuitStore.getState().qubitCount;
    const ist = useCircuitStore.getState().initialStates;
    const gs = useCircuitStore.getState().gates;
    runFull(qc, ist, gs);
  };

  const rightTabs = [
    { id: 'visualization' as const, label: '量子态可视化', icon: <Orbit className="h-3.5 w-3.5" /> },
    { id: 'results' as const, label: '模拟结果输出', icon: <BarChart3 className="h-3.5 w-3.5" /> },
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app-shell relative h-screen w-screen overflow-hidden flex flex-col">
        <Header onExport={() => {}} onExamples={() => {}} />

        <main className="relative z-10 flex-1 min-h-0 grid grid-cols-12 gap-3 p-3">
          <aside className="col-span-12 lg:col-span-2 xl:col-span-2 min-h-0 flex flex-col gap-3">
            <LayoutPanel
              title="量子门工具箱"
              subtitle="拖拽量子门到电路画布"
              icon={<Grip className="h-4 w-4" />}
            >
              <GatePalette />
            </LayoutPanel>
          </aside>

          <section className="col-span-12 lg:col-span-6 xl:col-span-6 min-h-0 flex flex-col gap-3">
            <LayoutPanel
              title="电路构建画布"
              subtitle={`${qubitCount}量子比特 · ${gates.length}门操作`}
              icon={<Atom className="h-4 w-4" />}
              actions={
                <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                  <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/5">拖放放置</span>
                  <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/5">右键删除</span>
                </div>
              }
              className="min-h-[52%]"
            >
              <div className="h-full min-h-[320px]">
                <CircuitCanvas onDrop={handleDrop} />
              </div>
            </LayoutPanel>

            <LayoutPanel
              title="控制面板"
              subtitle="系统参数与模拟执行"
              icon={<Sparkles className="h-4 w-4" />}
              className="min-h-[40%] flex-1"
            >
              <ControlPanel />
            </LayoutPanel>
          </section>

          <aside className="col-span-12 lg:col-span-4 xl:col-span-4 min-h-0 flex flex-col gap-3">
            <div className="p-4 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(2,6,23,0.4)] flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-5 w-5 shrink-0 text-violet-400">
                    {rightTab === 'visualization' ? <Orbit className="h-5 w-5" /> : <Table className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-slate-100 truncate tracking-wide">
                      {rightTab === 'visualization' ? '量子态可视化' : '模拟结果输出'}
                    </h2>
                    <p className="text-[11px] text-slate-400 truncate">
                      {rightTab === 'visualization' ? 'Bloch球 · 波函数颜色映射' : '概率幅矩阵 · 测量直方图'}
                    </p>
                  </div>
                </div>
                <TabSwitcher tabs={rightTabs} active={rightTab} onChange={setRightTab} size="sm" />
              </div>

              <div className="flex-1 min-h-0 overflow-hidden">
                {rightTab === 'visualization' ? (
                  <div className="h-full flex flex-col gap-3">
                    <div className="flex-1 min-h-[360px]">
                      <BlochSphereGrid />
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <PhaseLegend />
                      <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4 min-h-[220px]">
                        <WavefunctionMap />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col gap-3">
                    <div className="flex-1 min-h-[300px]">
                      <AmplitudeMatrix />
                    </div>
                    <div className="flex-1 min-h-[280px]">
                      <ProbabilityHistogram />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </main>

        <ExampleSelector />
        <QasmExportModal />
      </div>
    </DndProvider>
  );
}
