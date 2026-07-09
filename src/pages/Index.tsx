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
  },
  {
    icon: Shield,
    title: "ACI 318-19 Calculations",
    desc: "Fully deterministic TypeScript engine. Geometry, bearing, flexure, shear, crack control, and minimum reinforcement checks.",
  },
  {
    icon: BarChart3,
    title: "Interactive Visualizations",
    desc: "Slab plan, reinforcement layout, bending moment diagrams, shear force diagrams, and DCR summary charts.",
  },
  {
    icon: FileText,
    title: "Report Generation",
    desc: "Print-ready reports with step-by-step calculations, diagrams, pass/fail results, and AI-assisted recommendations.",
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
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Grade Slab Design" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-background/85" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-[3px] border border-border bg-primary/10 px-4 py-1.5 font-mono text-xs font-semibold text-primary mb-6">
              <Zap className="h-3.5 w-3.5" />
              ACI 318-19 · IS 456:2000 · Structural Engineering Platform
            </div>
            <h1 className="font-heading text-5xl sm:text-6xl mb-6 leading-tight text-foreground">
              AI-Powered{" "}
              <span className="text-primary">Grade Slab</span>
              <br />Design Platform
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
              Code-compliant structural calculations via AI chatbot input, interactive visualizations, and professional report generation — all in your browser.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/design")}
                className="inline-flex items-center gap-2 rounded-[3px] bg-primary px-8 py-4 font-heading text-base text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Zap className="h-5 w-5" />
                Start Designing Now
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                to="/compare"
                className="inline-flex items-center gap-2 rounded-[3px] border border-border bg-card px-8 py-4 text-base font-semibold text-foreground hover:bg-secondary transition-colors"
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
          <h2 className="font-heading text-3xl text-foreground mb-3">
            Everything You Need for Grade Slab Design
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From input collection to code compliance verification — one integrated platform.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-[3px] border border-border bg-card p-6 hover:border-primary/40 transition-colors"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-[3px] border border-border bg-primary/15 mb-4">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading text-lg text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Design Checks */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-[4px] border border-border bg-card p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-heading text-3xl text-foreground mb-4">
                8 ACI 318-19 Design Checks
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Every calculation is deterministic TypeScript — never AI-generated numbers. Formulas are transparent, step-by-step substitutions are shown, and clause references are provided.
              </p>
              <button
                onClick={() => navigate("/design")}
                className="inline-flex items-center gap-2 rounded-[3px] bg-primary px-6 py-3 font-heading text-sm text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Run Your Design
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {checks.map((check) => (
                <div key={check} className="flex items-center gap-3 rounded-[2px] border border-border bg-background px-4 py-2.5">
                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="text-sm text-foreground">{check}</span>
                  <span className="ml-auto font-mono text-xs text-muted-foreground">ACI §</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Code Support */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="font-heading text-2xl text-foreground mb-8 text-center">Design Code Support</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {codeSupport.map((item) => (
            <div
              key={item.code}
              className={`rounded-[3px] border p-5 ${
                item.status === "full"
                  ? "border-success/30 bg-success/5"
                  : "border-border bg-card opacity-70"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-heading text-foreground">{item.code}</span>
                {item.status === "full" ? (
                  <span className="font-mono text-xs font-semibold bg-success/20 text-success px-2 py-0.5 rounded-[2px]">Live</span>
                ) : (
                  <span className="font-mono text-xs font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-[2px]">Roadmap</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-warning mt-6 bg-warning/10 rounded-[3px] px-4 py-3 max-w-2xl mx-auto">
          <AlertTriangle className="h-3.5 w-3.5 inline mr-1.5" />
          Unimplemented codes display "NOT_IMPLEMENTED" — they never silently use ACI 318 formulas under a different label.
        </p>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="inline-block rounded-[4px] border border-border bg-card px-12 py-12 max-w-2xl">
          <h2 className="font-heading text-3xl text-foreground mb-3">Ready to Design?</h2>
          <p className="text-muted-foreground mb-8">
            Start with the AI chatbot or fill the manual form. Results in seconds.
          </p>
          <button
            onClick={() => navigate("/design")}
            className="inline-flex items-center gap-2 rounded-[3px] bg-primary px-10 py-4 font-heading text-base text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Zap className="h-5 w-5" />
            Launch Design Tool
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground px-4">
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
