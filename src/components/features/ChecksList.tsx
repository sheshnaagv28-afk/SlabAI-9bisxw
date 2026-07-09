import type { CheckResult } from "@/types";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, XCircle, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState, type CSSProperties } from "react";

// Status -> stamp treatment. Classes are written as literals (not interpolated)
// so Tailwind's content scanner keeps them in the build.
const STATUS_CONFIG = {
  PASS: {
    icon: CheckCircle,
    label: "PASS",
    text: "text-success",
    border: "border-success",
    rotClass: "-rotate-2",
    rot: "rotate(-2deg)",
  },
  WARNING: {
    icon: AlertTriangle,
    label: "WARNING",
    text: "text-warning",
    border: "border-warning",
    rotClass: "-rotate-1",
    rot: "rotate(-1deg)",
  },
  FAIL: {
    icon: XCircle,
    label: "FAIL",
    text: "text-destructive",
    border: "border-destructive",
    rotClass: "rotate-2",
    rot: "rotate(2deg)",
  },
  NOT_IMPLEMENTED: {
    icon: HelpCircle,
    label: "N/A",
    text: "text-muted-foreground",
    border: "border-muted-foreground",
    rotClass: "rotate-0",
    rot: "rotate(0deg)",
  },
} as const;

// The DCR bar is scaled to [0, DCR_SCALE_MAX] so the 1.0 limit tick sits at a
// fixed interior position — the fill then reads as "margin to failure", not a
// raw 0-100% value that pins at the limit.
const DCR_SCALE_MAX = 1.25;
const DCR_TICK_PCT = (1.0 / DCR_SCALE_MAX) * 100; // 1.0 limit position (80%)

function CheckCard({ check, index }: { check: CheckResult; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const config = STATUS_CONFIG[check.status];
  const Icon = config.icon;

  const dcr = check.dcr ?? 0;
  const hasDcr = check.dcr !== undefined && check.dcr > 0;
  const dcrFillPct = Math.min(100, (dcr / DCR_SCALE_MAX) * 100);
  const overLimit = dcr >= 1.0;
  const numberLabel = String(index + 1).padStart(2, "0");

  return (
    <div className="rounded-[3px] border border-border bg-card p-4 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Icon className={cn("h-5 w-5 flex-shrink-0", config.text)} />
          <div className="min-w-0">
            <h3 className="truncate font-mono text-sm font-semibold text-foreground">
              <span className="text-muted-foreground">{numberLabel}</span>
              <span className="text-border"> · </span>
              {check.name}
            </h3>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">{check.codeReference}</p>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-3">
          {hasDcr && (
            <span
              className={cn(
                "font-mono text-xs font-semibold tabular-nums",
                overLimit ? "text-destructive" : "text-primary"
              )}
            >
              DCR {dcr.toFixed(2)}
            </span>
          )}
          {/* Rubber-stamp status mark */}
          <div
            className={cn(
              "flex-shrink-0 rounded-[2px] border-[1.5px] px-2 py-0.5 font-heading text-[11px] leading-none animate-stamp-in",
              config.text,
              config.border,
              config.rotClass
            )}
            style={{ "--stamp-rot": config.rot } as CSSProperties}
          >
            {config.label}
          </div>
        </div>
      </div>

      {/* DCR bar — flat fill, square corners, 1.0 limit tick */}
      {hasDcr && (
        <div className="mt-3">
          <div className="relative h-[3px] bg-border">
            <div
              className={cn("h-full", overLimit ? "bg-destructive" : "bg-primary")}
              style={{ width: `${dcrFillPct}%` }}
            />
            {/* 1.0 limit tick */}
            <div
              className="absolute -top-1 -bottom-1 w-px bg-foreground/70"
              style={{ left: `${DCR_TICK_PCT}%` }}
            />
          </div>
          <div className="relative mt-1 h-3 font-mono text-[10px] text-muted-foreground">
            <span className="absolute left-0">0</span>
            <span className="absolute -translate-x-1/2" style={{ left: `${DCR_TICK_PCT}%` }}>
              1.0 limit
            </span>
            <span className="absolute right-0">{DCR_SCALE_MAX.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Interpretation */}
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{check.interpretation}</p>

      {/* Expand button */}
      {check.substitutionSteps.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-xs text-primary transition-colors hover:text-primary/80"
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? "Hide" : "Show"} Step-by-Step Calculations
        </button>
      )}

      {/* Expanded steps */}
      {expanded && (
        <div className="mt-3 space-y-1.5 rounded-[2px] bg-background p-3">
          <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Formula: <span className="font-mono text-foreground">{check.formulaDisplay}</span>
          </p>
          {check.substitutionSteps.map((step, i) => (
            <p key={i} className="border-l-2 border-primary/40 pl-2 font-mono text-xs text-foreground">
              {step}
            </p>
          ))}
          {check.assumptions.length > 0 && (
            <div className="mt-2 border-t border-border pt-2">
              <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Assumptions
              </p>
              {check.assumptions.map((a, i) => (
                <p key={i} className="text-xs text-muted-foreground">• {a}</p>
              ))}
            </div>
          )}
          {check.verifyFlag && (
            <p className="mt-2 rounded-[2px] bg-warning/10 px-2 py-1 font-mono text-[10px] text-warning">
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
        <CheckCard key={i} check={check} index={i} />
      ))}
    </div>
  );
}
