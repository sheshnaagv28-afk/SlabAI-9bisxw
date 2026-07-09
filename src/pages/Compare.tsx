import Header from "@/components/layout/Header";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";

const comparisonData = [
  {
    category: "Standard Origin",
    aci: "American Concrete Institute (USA)",
    is: "Bureau of Indian Standards (India)",
  },
  {
    category: "Load Factors (Gravity)",
    aci: "1.2D + 1.6L (primary combination)",
    is: "1.5(DL + LL) (primary combination)",
  },
  {
    category: "Concrete Strength",
    aci: "f'c = 28 MPa (4000 psi) common",
    is: "fck = 25 MPa (M25) common",
  },
  {
    category: "Strength Reduction φ",
    aci: "φ_flexure = 0.90 | φ_shear = 0.75",
    is: "γm (partial safety factor) approach",
  },
  {
    category: "Steel Grade",
    aci: "Grade 60 (fy = 420 MPa) standard",
    is: "Fe 415 (fy = 415 MPa) standard",
  },
  {
    category: "Stress Block",
    aci: "Whitney rectangular block: α₁ = 0.85, β₁ varies",
    is: "Parabolic-rectangular stress block per IS 456 Fig. 21",
  },
  {
    category: "Shear Formula",
    aci: "Vc = 0.17λ√f'c·b·d (simplified)",
    is: "τc from Table 19 (depends on pt%)",
  },
  {
    category: "Min. Reinforcement (slabs)",
    aci: "0.0018bh (fy ≥ 420 MPa, §24.4.3.2)",
    is: "0.12% of bD (Fe 415, Cl. 26.5.2.1)",
  },
  {
    category: "Crack Control",
    aci: "Bar spacing limit: s ≤ 380(280/fs) - 2.5cc",
    is: "Direct crack width formula (Annex F)",
  },
  {
    category: "Deflection",
    aci: "Immediate + long-term (§24.2)",
    is: "L/d ratio limits (Cl. 23.2)",
  },
  {
    category: "Cover (Grade Slab)",
    aci: "40 mm (cast against soil)",
    is: "40–75 mm (Cl. 26.4.1 Table 16)",
  },
  {
    category: "Development Length",
    aci: "ld per ACI 318 Ch. 25",
    is: "Ld per IS 456 Cl. 26.2",
  },
];

const keyDiffs = [
  {
    aspect: "Safety Philosophy",
    aci: "Single strength-reduction factor (φ) applied to nominal capacity",
    is: "Partial safety factors on both load (γf) and material (γm)",
  },
  {
    aspect: "Crack Width",
    aci: "Controls spacing of bars to limit crack width indirectly",
    is: "Direct crack width calculation via Annex F formula",
  },
  {
    aspect: "Shear Strength",
    aci: "Function of √f'c — continuous formula",
    is: "Tabulated values (Table 19) — function of steel ratio",
  },
  {
    aspect: "Load Combinations",
    aci: "6 combinations per ACI 318 §5.3",
    is: "3 combinations per IS 875 Part 5",
  },
];

export default function Compare() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-black text-white mb-3">
            ACI 318-19 vs IS 456:2000
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Side-by-side comparison of design methodology, load factors, material parameters, and code provisions.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 rounded-lg px-4 py-2">
            <XCircle className="h-3.5 w-3.5" />
            IS 456 calculations are not yet implemented. Only ACI 318 is active in the design tool.
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[200px_1fr_1fr] gap-px rounded-xl overflow-hidden border border-slate-700 mb-1">
          <div className="bg-slate-800 px-4 py-3" />
          <div className="bg-gradient-to-r from-sky-600 to-blue-700 px-4 py-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">ACI 318-19</span>
            <span className="ml-auto text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">Active</span>
          </div>
          <div className="bg-slate-700 px-4 py-3 flex items-center gap-2">
            <XCircle className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-300">IS 456:2000</span>
            <span className="ml-auto text-xs bg-slate-600 text-slate-400 px-2 py-0.5 rounded-full">Roadmap</span>
          </div>
        </div>

        {/* Comparison rows */}
        <div className="rounded-xl overflow-hidden border border-slate-700">
          {comparisonData.map((row, i) => (
            <div
              key={row.category}
              className={`grid grid-cols-[200px_1fr_1fr] gap-px ${i % 2 === 0 ? "bg-slate-800/30" : "bg-slate-800/60"} border-b border-slate-700/50 last:border-0`}
            >
              <div className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center">
                {row.category}
              </div>
              <div className="px-4 py-3 text-sm text-slate-200 border-l border-slate-700/50">
                {row.aci}
              </div>
              <div className="px-4 py-3 text-sm text-slate-400 border-l border-slate-700/50">
                {row.is}
              </div>
            </div>
          ))}
        </div>

        {/* Key Differences */}
        <div className="mt-12">
          <h2 className="text-xl font-black text-white mb-6">Key Conceptual Differences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keyDiffs.map((diff) => (
              <div key={diff.aspect} className="rounded-xl border border-slate-700 bg-slate-900 p-5">
                <h3 className="text-sm font-bold text-sky-400 mb-3">{diff.aspect}</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-emerald-400 uppercase">ACI 318-19</span>
                    <p className="text-sm text-slate-300 mt-1">{diff.aci}</p>
                  </div>
                  <div className="border-t border-slate-700 pt-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase">IS 456:2000</span>
                    <p className="text-sm text-slate-400 mt-1">{diff.is}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <h3 className="text-sm font-bold text-amber-400 mb-2">Engineering Disclaimer</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            This comparison is for educational reference only. Clause numbers and provisions should be verified against the latest published editions of ACI 318 and IS 456. Design methodology selection must be based on project jurisdiction, applicable regulations, and engineer judgment. Always consult a licensed structural engineer for project-specific decisions.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <a
            href="/design"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-3 text-sm font-bold text-white"
          >
            Run ACI 318 Design Tool
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
