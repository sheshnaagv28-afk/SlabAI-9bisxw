import type { CheckResult } from "@/types";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, XCircle, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const STATUS_CONFIG = {
  PASS: {
    icon: CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    badge: "bg-emerald-500/20 text-emerald-400",
    bar: "bg-emerald-500",
  },
  WARNING: {
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    badge: "bg-amber-500/20 text-amber-400",
    bar: "bg-amber-500",
  },
  FAIL: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    badge: "bg-red-500/20 text-red-400",
    bar: "bg-red-500",
  },
  NOT_IMPLEMENTED: {
    icon: HelpCircle,
    color: "text-slate-400",
    bg: "bg-slate-500/10 border-slate-500/20",
    badge: "bg-slate-500/20 text-slate-400",
    bar: "bg-slate-500",
  },
};

function CheckCard({ check }: { check: CheckResult }) {
  const [expanded, setExpanded] = useState(false);
  const config = STATUS_CONFIG[check.status];
  const Icon = config.icon;
  const dcrPercent = Math.min(100, (check.dcr ?? 0) * 100);

  return (
    <div className={cn("rounded-xl border p-4 transition-all", config.bg)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Icon className={cn("h-5 w-5 flex-shrink-0", config.color)} />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-200 truncate">{check.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{check.codeReference}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {check.dcr !== undefined && check.dcr > 0 && (
            <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", config.badge)}>
              DCR: {check.dcr.toFixed(2)}
            </span>
          )}
          <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", config.badge)}>
            {check.status}
          </span>
        </div>
      </div>

      {/* DCR Bar */}
      {check.dcr !== undefined && check.dcr > 0 && (
        <div className="mt-3">
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", config.bar)}
              style={{ width: `${dcrPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-slate-500">0</span>
            <span className="text-[10px] text-slate-500">1.0 (Limit)</span>
          </div>
        </div>
      )}

      {/* Interpretation */}
      <p className="mt-3 text-xs text-slate-400 leading-relaxed">{check.interpretation}</p>

      {/* Expand button */}
      {check.substitutionSteps.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors"
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? "Hide" : "Show"} Step-by-Step Calculations
        </button>
      )}

      {/* Expanded steps */}
      {expanded && (
        <div className="mt-3 rounded-lg bg-slate-900/50 p-3 space-y-1.5">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Formula: <span className="text-slate-300 font-mono">{check.formulaDisplay}</span>
          </p>
          {check.substitutionSteps.map((step, i) => (
            <p key={i} className="text-xs font-mono text-slate-300 border-l-2 border-sky-500/30 pl-2">
              {step}
            </p>
          ))}
          {check.assumptions.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-700">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Assumptions</p>
              {check.assumptions.map((a, i) => (
                <p key={i} className="text-xs text-slate-500">• {a}</p>
              ))}
            </div>
          )}
          {check.verifyFlag && (
            <p className="text-[10px] text-amber-400 bg-amber-500/10 rounded px-2 py-1 mt-2">
              ⚠️ [VERIFY CLAUSE] — Clause reference should be verified against the latest published edition.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface Props {
  checks: CheckResult[];
}

export default function ChecksList({ checks }: Props) {
  return (
    <div className="space-y-3">
      {checks.map((check, i) => (
        <CheckCard key={i} check={check} />
      ))}
    </div>
  );
}
