import { useState } from "react";
import Header from "@/components/layout/Header";
import ResultsDashboard from "@/components/features/ResultsDashboard";
import ChecksList from "@/components/features/ChecksList";
import SlabPlanDiagram from "@/components/diagrams/SlabPlanDiagram";
import ShearMomentDiagram from "@/components/diagrams/ShearMomentDiagram";
import BearingPressureDiagram from "@/components/diagrams/BearingPressureDiagram";
import type { DesignResults } from "@/types";
import { FileText, Trash2, ChevronDown, ChevronUp, Printer, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Reports() {
  const [history, setHistory] = useState<(DesignResults & { id: number })[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("slab-design-history") || "[]");
    } catch {
      return [];
    }
  });

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "checks" | "diagrams">("dashboard");

  const deleteEntry = (id: number) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem("slab-design-history", JSON.stringify(updated));
  };

  const statusColor = (status: string) => {
    if (status === "PASS") return "text-success bg-success/10";
    if (status === "WARNING") return "text-warning bg-warning/10";
    if (status === "FAIL") return "text-destructive bg-destructive/10";
    return "text-muted-foreground bg-muted";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl text-foreground">Design History & Reports</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Last 10 designs — stored locally in your browser
            </p>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => {
                setHistory([]);
                localStorage.removeItem("slab-design-history");
              }}
              className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 border border-destructive/30 rounded-[3px] px-3 py-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-heading text-xl text-muted-foreground">No Reports Yet</h2>
            <p className="text-muted-foreground text-sm mt-2">
              Complete a design in the Design Tool to generate reports here.
            </p>
            <a
              href="/design"
              className="inline-flex mt-6 items-center gap-2 rounded-[3px] bg-primary px-6 py-3 font-heading text-sm text-primary-foreground hover:bg-primary/90"
            >
              Go to Design Tool
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <div key={entry.id} className="rounded-[3px] border border-border bg-card overflow-hidden">
                {/* Header Row */}
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-bold text-foreground truncate">
                        {entry.inputs.projectName || "Unnamed Design"}
                      </h3>
                      <span className={cn("font-mono text-xs font-semibold px-2 py-0.5 rounded-[2px]", statusColor(entry.overallStatus))}>
                        {entry.overallStatus}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-[2px]">
                        {entry.inputs.designCode}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {entry.inputs.slabLength}m × {entry.inputs.slabWidth}m × {entry.inputs.slabThickness}mm
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        Governing DCR: {entry.governingDCR.toFixed(3)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.print();
                      }}
                      className="p-2 rounded-[3px] hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                      title="Print Report"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEntry(entry.id);
                      }}
                      className="p-2 rounded-[3px] hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {expandedId === entry.id ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedId === entry.id && (
                  <div className="border-t border-border p-5">
                    {/* Tab bar */}
                    <div className="flex gap-2 mb-5">
                      {(["dashboard", "checks", "diagrams"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={cn(
                            "px-4 py-1.5 rounded-[3px] text-xs font-semibold transition-colors capitalize",
                            activeTab === tab
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground border border-border"
                          )}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    {activeTab === "dashboard" && <ResultsDashboard results={entry} />}
                    {activeTab === "checks" && <ChecksList checks={entry.checks} />}
                    {activeTab === "diagrams" && (
                      <div className="space-y-6">
                        <SlabPlanDiagram inputs={entry.inputs} />
                        <ShearMomentDiagram
                          inputs={entry.inputs}
                          flexureCheck={entry.checks.find((c) => c.name.includes("Flexural"))}
                          shearCheck={entry.checks.find((c) => c.name.includes("Shear"))}
                        />
                        <BearingPressureDiagram
                          inputs={entry.inputs}
                          bearingPressure={entry.inputs.deadLoad + entry.inputs.liveLoad}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
