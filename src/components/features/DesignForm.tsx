import { useForm } from "react-hook-form";
import type { SlabInputs } from "@/types";
import { DEFAULT_INPUTS } from "@/constants";

interface Props {
  onSubmit: (data: SlabInputs) => void;
  isCalculating: boolean;
  defaultValues?: Partial<SlabInputs>;
}

const inputClass =
  "w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors";

const labelClass = "block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide";

// Standard US customary rebar sizes (diameter in inches, with bar designation)
const MAIN_BAR_SIZES = [
  { d: 0.375, label: '#3 (0.375")' },
  { d: 0.5, label: '#4 (0.500")' },
  { d: 0.625, label: '#5 (0.625")' },
  { d: 0.75, label: '#6 (0.750")' },
  { d: 1.0, label: '#8 (1.000")' },
  { d: 1.128, label: '#9 (1.128")' },
  { d: 1.27, label: '#10 (1.270")' },
];

const DIST_BAR_SIZES = [
  { d: 0.25, label: '#2 (0.250")' },
  { d: 0.375, label: '#3 (0.375")' },
  { d: 0.5, label: '#4 (0.500")' },
  { d: 0.625, label: '#5 (0.625")' },
  { d: 0.75, label: '#6 (0.750")' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider border-b border-slate-700 pb-2">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

export default function DesignForm({ onSubmit, isCalculating, defaultValues }: Props) {
  const { register, handleSubmit, watch } = useForm<SlabInputs>({
    defaultValues: { ...DEFAULT_INPUTS, ...defaultValues },
  });

  const code = watch("designCode");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
      <Section title="Project Info">
        <div className="sm:col-span-2">
          <label className={labelClass}>Project Name</label>
          <input {...register("projectName")} placeholder="Project Name" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Engineer</label>
          <input {...register("engineer")} placeholder="Engineer Name" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Date</label>
          <input {...register("date")} type="date" className={inputClass} />
        </div>
      </Section>

      <Section title="Design Code">
        <div className="sm:col-span-2">
          <label className={labelClass}>Design Standard</label>
          <select {...register("designCode")} className={inputClass}>
            <option value="ACI318">ACI 318-19 (Fully Implemented)</option>
            <option value="IS456">IS 456:2000 (Not yet implemented)</option>
          </select>
          {code === "IS456" && (
            <p className="mt-2 text-xs text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2">
              ⚠️ IS 456:2000 calculations are not yet implemented. Results will show "NOT_IMPLEMENTED" for all checks. Select ACI 318 for full analysis.
            </p>
          )}
        </div>
        <div>
          <label className={labelClass}>Load Combination</label>
          <select {...register("loadCombination")} className={inputClass}>
            <option value="1.2D + 1.6L">1.2D + 1.6L (ACI 318)</option>
            <option value="1.4D">1.4D (ACI 318)</option>
            <option value="1.5(DL + LL)">1.5(DL + LL) (IS 456)</option>
          </select>
        </div>
      </Section>

      <Section title="Slab Geometry">
        <div>
          <label className={labelClass}>Length (ft)</label>
          <input {...register("slabLength", { valueAsNumber: true })} type="number" step="0.5" min="2" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Width (ft)</label>
          <input {...register("slabWidth", { valueAsNumber: true })} type="number" step="0.5" min="2" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Thickness (in)</label>
          <input {...register("slabThickness", { valueAsNumber: true })} type="number" step="0.25" min="3" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Cover Bottom (in)</label>
          <input {...register("coverBottom", { valueAsNumber: true })} type="number" step="0.25" min="0.75" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Cover Top (in)</label>
          <input {...register("coverTop", { valueAsNumber: true })} type="number" step="0.25" min="0.75" className={inputClass} />
        </div>
      </Section>

      <Section title="Materials">
        <div>
          <label className={labelClass}>f'c or fck (psi)</label>
          <input {...register("concreteGrade", { valueAsNumber: true })} type="number" step="100" min="2500" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>fy (psi)</label>
          <input {...register("steelGrade", { valueAsNumber: true })} type="number" step="1000" min="29000" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Soil Bearing (psf)</label>
          <input {...register("soilBearingCapacity", { valueAsNumber: true })} type="number" step="100" min="200" className={inputClass} />
        </div>
      </Section>

      <Section title="Applied Loads">
        <div>
          <label className={labelClass}>Dead Load (psf)</label>
          <input {...register("deadLoad", { valueAsNumber: true })} type="number" step="10" min="0" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Live Load (psf)</label>
          <input {...register("liveLoad", { valueAsNumber: true })} type="number" step="10" min="0" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Point Load (kips)</label>
          <input {...register("pointLoad", { valueAsNumber: true })} type="number" step="0.25" min="0" className={inputClass} />
        </div>
      </Section>

      <Section title="Reinforcement">
        <div>
          <label className={labelClass}>Main Bar Ø (in)</label>
          <select {...register("barDiameterMain", { valueAsNumber: true })} className={inputClass}>
            {MAIN_BAR_SIZES.map(({ d, label }) => (
              <option key={d} value={d}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Main Bar Spacing (in)</label>
          <input {...register("spacingMain", { valueAsNumber: true })} type="number" step="1" min="2" max="24" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Dist. Bar Ø (in)</label>
          <select {...register("barDiameterDist", { valueAsNumber: true })} className={inputClass}>
            {DIST_BAR_SIZES.map(({ d, label }) => (
              <option key={d} value={d}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Dist. Bar Spacing (in)</label>
          <input {...register("spacingDist", { valueAsNumber: true })} type="number" step="1" min="2" max="24" className={inputClass} />
        </div>
      </Section>

      <button
        type="submit"
        disabled={isCalculating}
        className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:from-sky-400 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
      >
        {isCalculating ? "Calculating..." : "Run Design Checks"}
      </button>
    </form>
  );
}
