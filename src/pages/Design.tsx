import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import ChatBot from "@/components/features/ChatBot";
import DesignForm from "@/components/features/DesignForm";
import ChecksList from "@/components/features/ChecksList";
import ResultsDashboard from "@/components/features/ResultsDashboard";
import SlabPlanDiagram from "@/components/diagrams/SlabPlanDiagram";
import ShearMomentDiagram from "@/components/diagrams/ShearMomentDiagram";
import BearingPressureDiagram from "@/components/diagrams/BearingPressureDiagram";
import { useDesignEngine } from "@/hooks/useDesignEngine";
import type { SlabInputs } from "@/types";
import { Bot, PenLine, LayoutDashboard, ListChecks, Share2, Loader2, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

type InputMode = "chat" | "form";
type ResultTab = "dashboard" | "checks" | "diagrams";

export default function Design() {
  const [inputMode, setInputMode] = useState<InputMode>("chat");
  const [resultTab, setResultTab] = useState<ResultTab>("dashboard");
  const { results, isCalculating, runDesign } = useDesignEngine();
  const navigate = useNavigate();

  const handleComplete = (inputs: SlabInputs) => {
    runDesign(inputs);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="font-heading text-2xl text-foreground">Grade Slab Design Tool</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ACI 318-19 | Deterministic structural calculations — no AI-generated engineering numbers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Input Panel */}
          <div className="flex flex-col">
            {/* Mode Toggle */}
            <div className="flex rounded-[3px] border border-border bg-card p-1 mb-4">
              <button
                onClick={() => setInputMode("chat")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-[2px] py-2.5 text-sm font-semibold transition-colors",
                  inputMode === "chat"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Bot className="h-4 w-4" />
                AI Chatbot
              </button>
              <button
                onClick={() => setInputMode("form")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-[2px] py-2.5 text-sm font-semibold transition-colors",
                  inputMode === "form"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <PenLine className="h-4 w-4" />
                Manual Form
              </button>
            </div>

            {/* Input Panel */}
            <div className="flex-1 rounded-[4px] border border-border bg-card overflow-hidden min-h-[500px] lg:min-h-[600px] flex flex-col">
              {inputMode === "chat" ? (
                <ChatBot onComplete={handleComplete} />
              ) : (
                <div className="overflow-y-auto flex-1">
                  <DesignForm
                    onSubmit={handleComplete}
                    isCalculating={isCalculating}
                  />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Results Panel */}
          <div className="flex flex-col">
            {/* Results Tab Bar */}
            <div className="flex rounded-[3px] border border-border bg-card p-1 mb-4">
              {[
                { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
                { id: "checks" as const, label: "All Checks", icon: ListChecks },
                { id: "diagrams" as const, label: "Diagrams", icon: Share2 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setResultTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 rounded-[2px] py-2.5 text-sm font-semibold transition-colors",
                    resultTab === tab.id
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:block">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Results Content */}
            <div className="flex-1 rounded-[4px] border border-border bg-card overflow-y-auto min-h-[500px] lg:min-h-[600px]">
              {isCalculating ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <p className="text-foreground font-semibold">Running ACI 318-19 design checks...</p>
                  <p className="font-mono text-xs text-muted-foreground">Geometry · Bearing · Flexure · Shear · Reinforcement · Crack Control</p>
                </div>
              ) : results ? (
                <div className="p-4">
                  {resultTab === "dashboard" && (
                    <>
                      <ResultsDashboard results={results} />
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={handlePrint}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors border border-border rounded-[3px] px-4 py-2"
                        >
                          <Printer className="h-4 w-4" />
                          Print / Export Report
                        </button>
                      </div>
                    </>
                  )}
                  {resultTab === "checks" && (
                    <div>
                      <h2 className="font-heading text-sm text-foreground mb-4">
                        Design Checks — {results.inputs.designCode} | {results.timestamp.split("T")[0]}
                      </h2>
                      <ChecksList checks={results.checks} />
                    </div>
                  )}
                  {resultTab === "diagrams" && (
                    <div className="space-y-6">
                      <SlabPlanDiagram inputs={results.inputs} />
                      <ShearMomentDiagram
                        inputs={results.inputs}
                        flexureCheck={results.checks.find((c) => c.name.includes("Flexural"))}
                        shearCheck={results.checks.find((c) => c.name.includes("Shear"))}
                      />
                      <BearingPressureDiagram
                        inputs={results.inputs}
                        bearingPressure={results.inputs.deadLoad + results.inputs.liveLoad}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                  <div className="h-16 w-16 rounded-[4px] bg-primary/10 border border-border flex items-center justify-center">
                    <LayoutDashboard className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold text-lg">No Results Yet</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Complete the design inputs via chatbot or manual form to run ACI 318-19 checks.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 max-w-xs w-full">
                    {["Geometry", "Bearing Pressure", "Flexural Design", "One-Way Shear", "Min. Reinforcement", "Crack Control"].map((c) => (
                      <div key={c} className="font-mono text-xs text-muted-foreground bg-secondary rounded-[2px] px-3 py-2 text-center">
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
