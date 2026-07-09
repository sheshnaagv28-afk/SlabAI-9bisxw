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
    <div className="min-h-screen bg-slate-950">
      <Header />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">Grade Slab Design Tool</h1>
          <p className="text-sm text-slate-400 mt-1">
            ACI 318-19 | Deterministic structural calculations — no AI-generated engineering numbers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Input Panel */}
          <div className="flex flex-col">
            {/* Mode Toggle */}
            <div className="flex rounded-xl border border-slate-700 bg-slate-900 p-1 mb-4">
              <button
                onClick={() => setInputMode("chat")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all",
                  inputMode === "chat"
                    ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                <Bot className="h-4 w-4" />
                AI Chatbot
              </button>
              <button
                onClick={() => setInputMode("form")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all",
                  inputMode === "form"
                    ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                <PenLine className="h-4 w-4" />
                Manual Form
              </button>
            </div>

            {/* Input Panel */}
            <div className="flex-1 rounded-2xl border border-slate-700 bg-slate-900 overflow-hidden min-h-[500px] lg:min-h-[600px] flex flex-col">
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
            <div className="flex rounded-xl border border-slate-700 bg-slate-900 p-1 mb-4">
              {[
                { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
                { id: "checks" as const, label: "All Checks", icon: ListChecks },
                { id: "diagrams" as const, label: "Diagrams", icon: Share2 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setResultTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all",
                    resultTab === tab.id
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:block">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Results Content */}
            <div className="flex-1 rounded-2xl border border-slate-700 bg-slate-900 overflow-y-auto min-h-[500px] lg:min-h-[600px]">
              {isCalculating ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
                  <Loader2 className="h-10 w-10 text-sky-400 animate-spin" />
                  <p className="text-slate-300 font-semibold">Running ACI 318-19 design checks...</p>
                  <p className="text-xs text-slate-500">Geometry · Bearing · Flexure · Shear · Reinforcement · Crack Control</p>
                </div>
              ) : results ? (
                <div className="p-4">
                  {resultTab === "dashboard" && (
                    <>
                      <ResultsDashboard results={results} />
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={handlePrint}
                          className="flex items-center gap-2 text-sm text-slate-400 hover:text-sky-400 transition-colors border border-slate-700 rounded-lg px-4 py-2"
                        >
                          <Printer className="h-4 w-4" />
                          Print / Export Report
                        </button>
                      </div>
                    </>
                  )}
                  {resultTab === "checks" && (
                    <div>
                      <h2 className="text-sm font-bold text-slate-300 mb-4">
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
                  <div className="h-16 w-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                    <LayoutDashboard className="h-8 w-8 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-slate-300 font-semibold text-lg">No Results Yet</p>
                    <p className="text-slate-500 text-sm mt-1">
                      Complete the design inputs via chatbot or manual form to run ACI 318-19 checks.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 max-w-xs w-full">
                    {["Geometry", "Bearing Pressure", "Flexural Design", "One-Way Shear", "Min. Reinforcement", "Crack Control"].map((c) => (
                      <div key={c} className="text-xs text-slate-500 bg-slate-800 rounded-lg px-3 py-2 text-center">
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
