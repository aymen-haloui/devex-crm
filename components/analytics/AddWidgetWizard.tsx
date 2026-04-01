import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CommandSelect } from "@/components/ui/command-select";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

const CHART_TYPES = [
  { key: "kpi", label: "KPI Scorecard", icon: "🏆" },
  { key: "gauge", label: "Gauge", icon: "🎯" },
  { key: "donut", label: "Donut", icon: "🍩" },
  { key: "funnel", label: "Funnel", icon: "🪜" },
  { key: "bar", label: "Bar", icon: "📊" },
  { key: "line", label: "Line", icon: "📈" },
  { key: "area", label: "Area", icon: "🌄" },
  { key: "table", label: "Table", icon: "📋" },
];

const MODULES = [
  { value: "leads", label: "Leads" },
  { value: "deals", label: "Deals" },
  { value: "accounts", label: "Accounts" },
  { value: "tasks", label: "Tasks" },
];

const AGGREGATES = [
  { value: "count", label: "Count" },
  { value: "sum", label: "Sum" },
  { value: "avg", label: "Average" },
];

const TIMEFRAMES = [
  { value: "month", label: "This Month" },
  { value: "quarter", label: "Last Quarter" },
  { value: "ytd", label: "Year to Date" },
];

export type WidgetConfig = {
  chartType: string;
  module: string;
  aggregate: string;
  field?: string;
  groupBy?: string;
  timeframe?: string;
};

export function AddWidgetWizard({ open, onOpenChange, onSave }: { open: boolean; onOpenChange: (v: boolean) => void; onSave: (config: WidgetConfig) => void }) {
  const [step, setStep] = React.useState(1);
  const [config, setConfig] = React.useState<WidgetConfig>({ chartType: "kpi", module: "leads", aggregate: "count" });
  const [loading, setLoading] = React.useState(false);
  const [previewData, setPreviewData] = React.useState<any[]>([]);

  // Simulate preview fetch
  React.useEffect(() => {
    if (step === 4) {
      setLoading(true);
      setTimeout(() => {
        setPreviewData([{ value: 120 }, { value: 80 }, { value: 40 }]);
        setLoading(false);
      }, 800);
    }
  }, [step, config]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Analytics Widget</DialogTitle>
        </DialogHeader>
        <div className="mb-4 flex items-center gap-2 text-xs">
          <span className={step === 1 ? "font-bold" : "text-slate-400"}>1. Chart</span>
          <span>→</span>
          <span className={step === 2 ? "font-bold" : "text-slate-400"}>2. Data</span>
          <span>→</span>
          <span className={step === 3 ? "font-bold" : "text-slate-400"}>3. Group</span>
          <span>→</span>
          <span className={step === 4 ? "font-bold" : "text-slate-400"}>4. Preview</span>
        </div>
        {step === 1 && (
          <ToggleGroup type="single" value={config.chartType} onValueChange={v => setConfig(c => ({ ...c, chartType: v || "kpi" }))} className="grid grid-cols-4 gap-3">
            {CHART_TYPES.map(type => (
              <ToggleGroupItem key={type.key} value={type.key} className="flex flex-col items-center p-4 border rounded h-24 justify-center">
                <span className="text-2xl mb-2">{type.icon}</span>
                <span className="text-xs font-medium text-slate-700">{type.label}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <CommandSelect value={config.module} onChange={v => setConfig(c => ({ ...c, module: v }))} options={MODULES} placeholder="Select Module" />
            <div className="flex gap-2">
              <select className="border rounded px-2 py-1 text-sm" value={config.aggregate} onChange={e => setConfig(c => ({ ...c, aggregate: e.target.value }))} title="Aggregate Type">
                {AGGREGATES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
              {config.aggregate !== "count" && (
                <input className="border rounded px-2 py-1 text-sm" placeholder="Field (e.g. Amount)" value={config.field || ""} onChange={e => setConfig(c => ({ ...c, field: e.target.value }))} />
              )}
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <input className="border rounded px-2 py-1 text-sm w-full" placeholder="Group By (e.g. Lead Source)" value={config.groupBy || ""} onChange={e => setConfig(c => ({ ...c, groupBy: e.target.value }))} />
            <select className="border rounded px-2 py-1 text-sm w-full" value={config.timeframe || "month"} onChange={e => setConfig(c => ({ ...c, timeframe: e.target.value }))} title="Timeframe">
              {TIMEFRAMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        )}
        {step === 4 && (
          <div className="h-40 flex items-center justify-center">
            {loading ? <Skeleton className="w-full h-full rounded" /> : (
              <div className="w-full h-full">
                {/* Example: KPI Scorecard preview */}
                {config.chartType === "kpi" && (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-[12px] text-slate-500 uppercase mb-1">{config.module}</div>
                    <div className="text-[28px] font-bold text-[#404452]">{previewData[0]?.value ?? 0}</div>
                    <ResponsiveContainer width="100%" height={40}>
                      <AreaChart data={previewData}>
                        <Area type="monotone" dataKey="value" stroke="#5cc8be" fill="#5cc8be" strokeWidth={2} fillOpacity={0.1} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {/* Example: Gauge preview */}
                {config.chartType === "gauge" && (
                  <div className="flex flex-col items-center justify-center h-full">
                    <PieChart width={120} height={60}>
                      <Pie data={[{ value: previewData[0]?.value ?? 0 }, { value: 100 - (previewData[0]?.value ?? 0) }]} startAngle={180} endAngle={0} innerRadius={30} outerRadius={50} dataKey="value">
                        <Cell fill="#5cc8be" />
                        <Cell fill="#f4f7f9" />
                      </Pie>
                    </PieChart>
                    {/* Custom SVG Needle */}
                    <svg width={120} height={60} className="add-widget-svg">
                      <g transform={`rotate(${((previewData[0]?.value ?? 0) / 100) * 180 - 180},60,60)`}>
                        <rect x={58} y={10} width={4} height={40} fill="#ef8886" rx={2} />
                      </g>
                    </svg>
                    <div className="absolute text-lg font-bold text-[#5cc8be] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">{previewData[0]?.value ?? 0}%</div>
                  </div>
                )}
                {/* Add more chart previews as needed */}
              </div>
            )}
          </div>
        )}
        <div className="flex justify-between mt-6">
          <button className="px-3 py-1 rounded bg-slate-100 text-slate-700" disabled={step === 1} onClick={() => setStep(s => Math.max(1, s - 1))}>Back</button>
          {step < 4 ? (
            <button className="px-4 py-1 rounded bg-blue-600 text-white" onClick={() => setStep(s => s + 1)}>Next</button>
          ) : (
            <button className="px-4 py-1 rounded bg-green-600 text-white" onClick={() => { onSave(config); onOpenChange(false); }}>Save Widget</button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
