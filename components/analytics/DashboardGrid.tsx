import * as React from "react";
import { useOptimistic } from "react";
import { AddWidgetWizard, WidgetConfig } from "./AddWidgetWizard";
import { Skeleton } from "@/components/ui/skeleton";

// Placeholder for grid layout persistence
const initialLayout = [];

export function DashboardGrid() {
  const [widgets, setWidgets] = React.useState<any[]>([]);
  const [showWizard, setShowWizard] = React.useState(false);
  const [optimisticWidgets, addOptimisticWidget] = useOptimistic(widgets, (prev, config: WidgetConfig) => [
    ...prev,
    { id: `temp-${Date.now()}`, config, loading: true }
  ]);

  // Simulate DB write
  const handleSaveWidget = (config: WidgetConfig) => {
    addOptimisticWidget(config);
    setTimeout(() => {
      setWidgets(w => [...w, { id: `w${w.length + 1}`, config }]);
    }, 1200);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setShowWizard(true)}>
          + Add Component
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {optimisticWidgets.length === 0 && (
          <div className="col-span-4 text-center text-slate-400 py-12 border rounded">No widgets yet. Click "Add Component" to get started.</div>
        )}
        {optimisticWidgets.map(widget => (
          <div key={widget.id} className="bg-white border rounded shadow-sm flex flex-col dashboard-widget">
            <div className="h-[44px] border-b border-slate-100 flex items-center px-4 font-medium text-slate-700">
              {widget.config.chartType.toUpperCase()} – {widget.config.module}
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              {widget.loading ? <Skeleton className="w-full h-32 rounded" /> : <WidgetRenderer config={widget.config} />}
            </div>
          </div>
        ))}
      </div>
      <AddWidgetWizard open={showWizard} onOpenChange={setShowWizard} onSave={handleSaveWidget} />
    </div>
  );
}

function WidgetRenderer({ config }: { config: WidgetConfig }) {
  const series = [22, 34, 28, 41, 36, 48];

  if (config.chartType === "kpi") {
    return (
      <div className="flex flex-col items-center w-full">
        <div className="text-[12px] text-slate-500 uppercase mb-1">{config.module}</div>
        <div className="text-[28px] font-bold text-[#404452]">1,200</div>
        <div className="w-full h-10">
          {/* Sparkline */}
          <svg width="100%" height="40"><polyline points="0,30 10,20 20,25 30,10 40,15 50,5 60,20 70,10 80,30 90,20 100,25" fill="none" stroke="#5cc8be" strokeWidth="2" /></svg>
        </div>
      </div>
    );
  }

  if (config.chartType === "gauge") {
    return (
      <div className="relative flex flex-col items-center w-full">
        <svg width={120} height={60}>
          <path d="M20,60 A40,40 0 0,1 100,60" fill="#f4f7f9" />
          <path d="M20,60 A40,40 0 0,1 80,20" fill="#5cc8be" />
        </svg>
        <svg width={120} height={60} className="dashboard-widget-svg">
          <g transform={`rotate(0,60,60)`}>
            <rect x={58} y={10} width={4} height={40} fill="#ef8886" rx={2} />
          </g>
        </svg>
        <div className="absolute text-lg font-bold text-[#5cc8be] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">75%</div>
      </div>
    );
  }

  if (config.chartType === "donut") {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="42" fill="none" stroke="#e2e8f0" strokeWidth="14" />
          <circle
            cx="60"
            cy="60"
            r="42"
            fill="none"
            stroke="#5cc8be"
            strokeWidth="14"
            strokeDasharray="198 264"
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="-mt-20 text-center">
          <div className="text-2xl font-bold text-slate-800">75%</div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Conversion</div>
        </div>
      </div>
    );
  }

  if (config.chartType === "funnel") {
    const funnelRows = [
      { label: 'New', widthClass: 'w-full', widthLabel: '100%', tone: 'bg-sky-500' },
      { label: 'Qualified', widthClass: 'w-10/12', widthLabel: '82%', tone: 'bg-cyan-500' },
      { label: 'Proposal', widthClass: 'w-7/12', widthLabel: '60%', tone: 'bg-emerald-500' },
      { label: 'Won', widthClass: 'w-4/12', widthLabel: '38%', tone: 'bg-amber-500' },
    ];

    return (
      <div className="flex w-full flex-col gap-2">
        {funnelRows.map((row) => (
          <div key={row.label} className="flex justify-center">
            <div className={`${row.tone} ${row.widthClass} flex h-9 items-center justify-between rounded-md px-3 text-xs font-semibold text-white`}>
              <span>{row.label}</span>
              <span>{row.widthLabel}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (config.chartType === "bar") {
    const barHeights = ['h-11', 'h-16', 'h-14', 'h-20', 'h-[72px]', 'h-24'];

    return (
      <div className="flex h-full w-full items-end gap-2 px-2 pt-6">
        {series.map((value, index) => (
          <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center gap-2">
            <div className={`w-full rounded-t-md bg-[#5cc8be] ${barHeights[index] || 'h-12'}`} />
            <span className="text-[10px] font-medium text-slate-500">W{index + 1}</span>
          </div>
        ))}
      </div>
    );
  }

  if (config.chartType === "line" || config.chartType === "area") {
    const max = Math.max(...series);
    const points = series
      .map((value, index) => `${index * 24},${92 - (value / max) * 70}`)
      .join(' ');
    const areaPoints = `0,92 ${points} ${(series.length - 1) * 24},92`;

    return (
      <svg viewBox="0 0 140 100" className="h-full w-full">
        {config.chartType === 'area' && <polygon points={areaPoints} fill="#5cc8be22" />}
        <polyline fill="none" stroke="#5cc8be" strokeWidth="3" points={points} />
        {series.map((value, index) => (
          <circle key={`${value}-${index}`} cx={index * 24} cy={92 - (value / max) * 70} r="3" fill="#5cc8be" />
        ))}
      </svg>
    );
  }

  if (config.chartType === "table") {
    return (
      <div className="w-full overflow-hidden rounded-lg border border-slate-100">
        <div className="grid grid-cols-2 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          <span>Label</span>
          <span className="text-right">Value</span>
        </div>
        {[
          ['Inbound Leads', '128'],
          ['Qualified Deals', '34'],
          ['Won Revenue', '4.8M'],
        ].map(([label, value]) => (
          <div key={label} className="grid grid-cols-2 border-t border-slate-100 px-3 py-2 text-xs text-slate-700">
            <span>{label}</span>
            <span className="text-right font-semibold text-slate-900">{value}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 text-center">
      <div className="text-sm font-semibold text-slate-800">{config.module} widget ready</div>
      <div className="mt-1 text-xs text-slate-500">
        Aggregate: {config.aggregate}{config.timeframe ? ` • ${config.timeframe}` : ''}
      </div>
    </div>
  );
}
