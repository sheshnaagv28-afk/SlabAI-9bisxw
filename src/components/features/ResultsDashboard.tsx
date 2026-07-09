import type { DesignResults } from "@/types";
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, Layers, Hammer } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell, ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface Props {
  results: DesignResults;
}

// Palette hex values — used only where a charting engine or raw text color is
// required (mirrors the --success / --warning / --destructive tokens).
const CHART = {
  pass: "#6B9D5C",
  warn: "#BA974F",
  fail: "#D9622B",
  grid: "#33352B",
  axis: "#8A8778",
  surface: "#191B15",
} as const;

const statusConfig = {
  PASS: { color: "text-success", border: "border-success/40", icon: CheckCircle, label: "DESIGN PASS" },
  WARNING: { color: "text-warning", border: "border-warning/40", icon: AlertTriangle, label: "NEEDS REVIEW" },
  FAIL: { color: "text-destructive", border: "border-destructive/40", icon: XCircle, label: "DESIGN FAIL" },
  NOT_IMPLEMENTED: { color: "text-muted-foreground", border: "border-border", icon: AlertTriangle, label: "NOT IMPLEMENTED" },
};

function dcrColor(dcr: number): string {
  if (dcr > 1.0) return CHART.fail;
  if (dcr >= 0.8) return CHART.warn;
  return CHART.pass;
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

  // Material quantities (US customary / imperial)
  // Slab dims: length/width in ft, thickness in in → convert thickness to ft.
  const slabVolume =
    inputs.slabLength * inputs.slabWidth * (inputs.slabThickness / 12); // ft³

  // Rough reinforcement weight estimate (both directions), in pounds.
  // Steel density ≈ 0.2836 lb/in³ (490 lb/ft³). Bar dia & spacing are in inches.
  const STEEL_DENSITY_LB_IN3 = 0.2836;
  const barArea = (dia: number): number => (Math.PI * dia * dia) / 4; // in²
  const mainBarCount = (inputs.slabWidth * 12) / inputs.spacingMain; // bars across width
  const distBarCount = (inputs.slabLength * 12) / inputs.spacingDist; // bars along length
  const steelVolume =
    mainBarCount * (inputs.slabLength * 12) * barArea(inputs.barDiameterMain) +
    distBarCount * (inputs.slabWidth * 12) * barArea(inputs.barDiameterDist); // in³
  const steelLb = steelVolume * STEEL_DENSITY_LB_IN3; // lb

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div className={cn("rounded-[4px] border bg-card p-6 text-center", config.border)}>
        <Icon className={cn("h-12 w-12 mx-auto mb-3", config.color)} />
        <h2 className={cn("font-heading text-2xl", config.color)}>{config.label}</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Governing: <span className="font-mono font-semibold text-foreground">{governingCheck}</span>
        </p>
        <div className="mt-4 inline-flex items-center gap-3 rounded-[3px] border border-border bg-background px-6 py-3">
          <div>
            <p className="text-xs text-muted-foreground">Governing DCR</p>
            <p className={cn("font-mono text-3xl font-bold tabular-nums", config.color)}>{governingDCR.toFixed(3)}</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div>
            <p className="text-xs text-muted-foreground">Design Code</p>
            <p className="font-mono text-lg font-bold text-foreground">{inputs.designCode}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            icon: Layers,
            label: "Slab Volume",
            value: `${slabVolume.toFixed(1)} ft³`,
            sub: `${inputs.slabLength}ft × ${inputs.slabWidth}ft × ${inputs.slabThickness}in`,
          },
          {
            icon: TrendingUp,
            label: "Total Load",
            value: `${(inputs.deadLoad + inputs.liveLoad).toFixed(0)} psf`,
            sub: `DL: ${inputs.deadLoad} + LL: ${inputs.liveLoad}`,
          },
          {
            icon: Hammer,
            label: "Est. Steel",
            value: `~${steelLb.toFixed(0)} lb`,
            sub: `ø${inputs.barDiameterMain}in @ ${inputs.spacingMain}in`,
          },
          {
            icon: CheckCircle,
            label: "Checks Run",
            value: `${checks.filter((c) => c.status !== "NOT_IMPLEMENTED").length}/${checks.length}`,
            sub: `${checks.filter((c) => c.status === "PASS").length} passed`,
          },
        ].map((card) => (
          <div key={card.label} className="rounded-[3px] border border-border bg-card p-4">
            <card.icon className="h-5 w-5 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="font-mono text-lg font-bold text-foreground mt-0.5 tabular-nums">{card.value}</p>
            <p className="font-mono text-xs text-muted-foreground mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* DCR Chart */}
      {dcrData.length > 0 && (
        <div className="rounded-[3px] border border-border bg-card p-4">
          <h3 className="font-heading text-sm text-foreground mb-4">Design Capacity Ratios (DCR)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dcrData} layout="vertical" margin={{ left: 0, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} horizontal={false} />
              <XAxis
                type="number"
                domain={[0, Math.max(1.2, ...dcrData.map((d) => d.dcr))]}
                tick={{ fontSize: 11, fill: CHART.axis, fontFamily: "'IBM Plex Mono', monospace" }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fontSize: 10, fill: CHART.axis, fontFamily: "'IBM Plex Mono', monospace" }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ backgroundColor: CHART.surface, border: `1px solid ${CHART.grid}`, borderRadius: "2px", fontSize: "12px", fontFamily: "'IBM Plex Mono', monospace" }}
                formatter={(v: number) => [v.toFixed(3), "DCR"]}
              />
              <ReferenceLine x={1.0} stroke={CHART.fail} strokeDasharray="4 4" label={{ value: "1.0", fill: CHART.fail, fontSize: 10 }} />
              <ReferenceLine x={0.8} stroke={CHART.warn} strokeDasharray="4 4" />
              <Bar dataKey="dcr">
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
        <div className="rounded-[3px] border border-border bg-card p-4">
          <h3 className="font-heading text-sm text-primary mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            AI-Assisted Recommendations
          </h3>
          <ul className="space-y-2">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Recommendations are generated deterministically from calculation results — not by AI inference.
          </p>
        </div>
      )}
    </div>
  );
}
