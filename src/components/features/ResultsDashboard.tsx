import type { DesignResults } from "@/types";
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, Layers, Hammer } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell, ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface Props {
  results: DesignResults;
}

const statusConfig = {
  PASS: { color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30", icon: CheckCircle, label: "DESIGN PASS" },
  WARNING: { color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30", icon: AlertTriangle, label: "NEEDS REVIEW" },
  FAIL: { color: "text-red-400", bg: "bg-red-500/15 border-red-500/30", icon: XCircle, label: "DESIGN FAIL" },
  NOT_IMPLEMENTED: { color: "text-slate-400", bg: "bg-slate-500/15 border-slate-500/30", icon: AlertTriangle, label: "NOT IMPLEMENTED" },
};

function dcrColor(dcr: number): string {
  if (dcr > 1.0) return "#ef4444";
  if (dcr >= 0.8) return "#f59e0b";
  return "#10b981";
}

export default function ResultsDashboard({ results }: Props) {
  const { checks, governingDCR, governingCheck, overallStatus, recommendations, inputs } = results;
  const config = statusConfig[overallStatus];
  const Icon = config.icon;

  const dcrData = checks
    .filter((c) => c.dcr !== undefined && c.dcr > 0)
    .map((c) => ({
      name: c.name.replace(/\s*\(.*\)/, "").substring(0, 24),
      dcr: parseFloat((c.dcr ?? 0).toFixed(3)),
      status: c.status,
    }));

  // Material quantities
  const slabVolume = inputs.slabLength * inputs.slabWidth * (inputs.slabThickness / 1000);
  const astMain = (Math.PI * inputs.barDiameterMain ** 2 / 4) * (1000 / inputs.spacingMain);
  const steelKg = astMain * slabVolume * 7850 / 1e6; // rough estimate

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div className={cn("rounded-2xl border-2 p-6 text-center", config.bg)}>
        <Icon className={cn("h-12 w-12 mx-auto mb-3", config.color)} />
        <h2 className={cn("text-2xl font-black tracking-tight", config.color)}>{config.label}</h2>
        <p className="text-slate-300 mt-1 text-sm">
          Governing: <span className="font-semibold text-white">{governingCheck}</span>
        </p>
        <div className="mt-4 inline-flex items-center gap-3 bg-slate-900/50 rounded-xl px-6 py-3">
          <div>
            <p className="text-xs text-slate-400">Governing DCR</p>
            <p className={cn("text-3xl font-black", config.color)}>{governingDCR.toFixed(3)}</p>
          </div>
          <div className="w-px h-10 bg-slate-600" />
          <div>
            <p className="text-xs text-slate-400">Design Code</p>
            <p className="text-lg font-bold text-white">{inputs.designCode}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            icon: Layers,
            label: "Slab Volume",
            value: `${slabVolume.toFixed(2)} m³`,
            sub: `${inputs.slabLength}×${inputs.slabWidth}×${inputs.slabThickness}mm`,
          },
          {
            icon: TrendingUp,
            label: "Total Load",
            value: `${(inputs.deadLoad + inputs.liveLoad).toFixed(1)} kN/m²`,
            sub: `DL: ${inputs.deadLoad} + LL: ${inputs.liveLoad}`,
          },
          {
            icon: Hammer,
            label: "Est. Steel",
            value: `~${steelKg.toFixed(0)} kg`,
            sub: `ø${inputs.barDiameterMain}@${inputs.spacingMain}mm`,
          },
          {
            icon: CheckCircle,
            label: "Checks Run",
            value: `${checks.filter((c) => c.status !== "NOT_IMPLEMENTED").length}/${checks.length}`,
            sub: `${checks.filter((c) => c.status === "PASS").length} passed`,
          },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
            <card.icon className="h-5 w-5 text-sky-400 mb-2" />
            <p className="text-xs text-slate-400">{card.label}</p>
            <p className="text-lg font-bold text-white mt-0.5">{card.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* DCR Chart */}
      {dcrData.length > 0 && (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h3 className="text-sm font-bold text-slate-200 mb-4">Design Capacity Ratios (DCR)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dcrData} layout="vertical" margin={{ left: 0, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, Math.max(1.2, ...dcrData.map((d) => d.dcr))]}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px" }}
                formatter={(v: number) => [v.toFixed(3), "DCR"]}
              />
              <ReferenceLine x={1.0} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "1.0", fill: "#ef4444", fontSize: 10 }} />
              <ReferenceLine x={0.8} stroke="#f59e0b" strokeDasharray="4 4" />
              <Bar dataKey="dcr" radius={[0, 4, 4, 0]}>
                {dcrData.map((entry, i) => (
                  <Cell key={i} fill={dcrColor(entry.dcr)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
          <h3 className="text-sm font-bold text-sky-400 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            AI-Assisted Recommendations
          </h3>
          <ul className="space-y-2">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-500 flex-shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            Recommendations are generated deterministically from calculation results — not by AI inference.
          </p>
        </div>
      )}
    </div>
  );
}
