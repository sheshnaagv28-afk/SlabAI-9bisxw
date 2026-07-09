import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import {
  Zap, Shield, BarChart3, FileText, ArrowRight, CheckCircle,
  BookOpen, Cpu, AlertTriangle, ChevronRight
} from "lucide-react";
import heroImg from "@/assets/hero-slab.jpg";

const features = [
  {
    icon: Cpu,
    title: "AI Chatbot Assistant",
    desc: "Conversationally collect all design inputs. Get engineering term explanations, default value suggestions, and instant validation.",
    color: "from-sky-500 to-blue-600",
  },
  {
    icon: Shield,
    title: "ACI 318-19 Calculations",
    desc: "Fully deterministic TypeScript engine. Geometry, bearing, flexure, shear, crack control, and minimum reinforcement checks.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: BarChart3,
    title: "Interactive Visualizations",
    desc: "Slab plan, reinforcement layout, bending moment diagrams, shear force diagrams, and DCR summary charts.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: FileText,
    title: "Report Generation",
    desc: "Print-ready reports with step-by-step calculations, diagrams, pass/fail results, and AI-assisted recommendations.",
    color: "from-rose-500 to-pink-600",
  },
];

const checks = [
  "Geometry Adequacy",
  "Soil Bearing Pressure",
  "Factored Load (1.2D + 1.6L)",
  "Flexural Design (Whitney Block)",
  "One-Way Shear (Vc)",
  "Minimum Reinforcement",
  "Crack Control (ACI §24.3)",
  "Deflection Review",
];

const codeSupport = [
  { code: "ACI 318-19", status: "full", desc: "Fully implemented — all 8 checks active" },
  { code: "IS 456:2000", status: "stub", desc: "Stub — not yet implemented (roadmap)" },
  { code: "IS 800:2007", status: "stub", desc: "Stub — not yet implemented (roadmap)" },
  { code: "Eurocode 2", status: "stub", desc: "Stub — not yet implemented (roadmap)" },
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Grade Slab Design" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/70 to-slate-950" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-semibold text-sky-400 mb-6">
              <Zap className="h-3.5 w-3.5" />
              ACI 318-19 · IS 456:2000 · Structural Engineering Platform
            </div>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-6 leading-tight">
              AI-Powered{" "}
              <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                Grade Slab
              </span>
              <br />Design Platform
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl mx-auto">
              Code-compliant structural calculations via AI chatbot input, interactive visualizations, and professional report generation — all in your browser.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/design")}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-blue-500/30 hover:from-sky-400 hover:to-blue-500 transition-all hover:shadow-blue-500/50 hover:-translate-y-0.5"
              >
                <Zap className="h-5 w-5" />
                Start Designing Now
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                to="/compare"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800/50 px-8 py-4 text-base font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all hover:-translate-y-0.5"
              >
                <BookOpen className="h-5 w-5" />
                Compare ACI vs IS 456
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black text-white mb-3">
            Everything You Need for Grade Slab Design
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            From input collection to code compliance verification — one integrated platform.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6 hover:border-slate-600 transition-all hover:-translate-y-0.5"
            >
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} mb-4 shadow-lg`}
              >
                <f.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Design Checks */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-black text-white mb-4">
                8 ACI 318-19 Design Checks
              </h2>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Every calculation is deterministic TypeScript — never AI-generated numbers. Formulas are transparent, step-by-step substitutions are shown, and clause references are provided.
              </p>
              <button
                onClick={() => navigate("/design")}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-500 transition-colors"
              >
                Run Your Design
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {checks.map((check, i) => (
                <div key={check} className="flex items-center gap-3 rounded-lg bg-slate-800/50 px-4 py-2.5">
                  <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300">{check}</span>
                  <span className="ml-auto text-xs text-slate-500 font-mono">ACI §</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Code Support */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-2xl font-black text-white mb-8 text-center">Design Code Support</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {codeSupport.map((item) => (
            <div
              key={item.code}
              className={`rounded-xl border p-5 ${
                item.status === "full"
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-slate-700 bg-slate-900/30 opacity-70"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-white">{item.code}</span>
                {item.status === "full" ? (
                  <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Live</span>
                ) : (
                  <span className="text-xs font-semibold bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">Roadmap</span>
                )}
              </div>
              <p className="text-xs text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-amber-400 mt-6 bg-amber-500/10 rounded-lg px-4 py-3 max-w-2xl mx-auto">
          <AlertTriangle className="h-3.5 w-3.5 inline mr-1.5" />
          Unimplemented codes display "NOT_IMPLEMENTED" — they never silently use ACI 318 formulas under a different label.
        </p>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="inline-block rounded-2xl bg-gradient-to-r from-sky-500/10 to-blue-600/10 border border-sky-500/20 px-12 py-12 max-w-2xl">
          <h2 className="text-3xl font-black text-white mb-3">Ready to Design?</h2>
          <p className="text-slate-400 mb-8">
            Start with the AI chatbot or fill the manual form. Results in seconds.
          </p>
          <button
            onClick={() => navigate("/design")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-10 py-4 text-base font-bold text-white shadow-xl shadow-blue-500/25 hover:from-sky-400 hover:to-blue-500 transition-all"
          >
            <Zap className="h-5 w-5" />
            Launch Design Tool
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500 px-4">
        <p className="mb-2">
          SlabAI — Grade Slab Design Platform | ACI 318-19 · IS 456:2000
        </p>
        <p className="max-w-2xl mx-auto">
          Engineering calculations are deterministic and rule-based. AI is used only for input guidance and narrative. Always verify designs with a licensed structural engineer before construction.
        </p>
      </footer>
    </div>
  );
}
