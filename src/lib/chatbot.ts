import type { SlabInputs, ChatMessage } from "@/types";
import { DEFAULT_INPUTS } from "@/constants";

export interface ChatStep {
  id: string;
  field?: keyof SlabInputs;
  question: string;
  hint?: string;
  validate?: (value: string) => string | null;
  extract?: (value: string) => Partial<SlabInputs>;
  isInfo?: boolean;
}

export const CHAT_STEPS: ChatStep[] = [
  {
    id: "welcome",
    isInfo: true,
    question:
      "Hello! I'm your Grade Slab Design Assistant powered by ACI 318-19. I'll guide you through collecting all the design inputs step by step. You can type your answers or use the quick-input buttons. Let's start with your project details.",
  },
  {
    id: "projectName",
    field: "projectName",
    question: "What is the **project name** or description?",
    hint: 'e.g., "Warehouse Floor Slab — Block A"',
    extract: (v) => ({ projectName: v }),
  },
  {
    id: "designCode",
    field: "designCode",
    question:
      "Which **design code** would you like to use?\n\n• **ACI 318-19** (US standard — fully implemented)\n• **IS 456:2000** (Indian standard — stub, not yet implemented)",
    hint: 'Type "ACI" or "IS456"',
    validate: (v) => {
      const upper = v.toUpperCase();
      if (upper.includes("ACI") || upper.includes("318")) return null;
      if (upper.includes("IS") || upper.includes("456")) return null;
      return 'Please respond with "ACI" or "IS456"';
    },
    extract: (v) => ({
      designCode: v.toUpperCase().includes("IS") ? "IS456" : "ACI318",
    }),
  },
  {
    id: "slabDimensions",
    field: "slabLength",
    question:
      "What are the **slab dimensions** (length × width × thickness)?\n\nPlease provide in the format: `6m × 4m × 150mm`\nor answer each separately — starting with **slab length** (in meters):",
    hint: "e.g., 6 (for 6 meters)",
    validate: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n <= 0 || n > 100) return "Please enter a valid length between 0.5 and 100 meters.";
      return null;
    },
    extract: (v) => ({ slabLength: parseFloat(v) }),
  },
  {
    id: "slabWidth",
    field: "slabWidth",
    question: "What is the **slab width** (in meters)?",
    hint: "e.g., 4 (for 4 meters)",
    validate: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n <= 0 || n > 100) return "Please enter a valid width between 0.5 and 100 meters.";
      return null;
    },
    extract: (v) => ({ slabWidth: parseFloat(v) }),
  },
  {
    id: "slabThickness",
    field: "slabThickness",
    question: "What is the **slab thickness** (in mm)?\n\nTypical grade slabs range from 100mm to 300mm. The minimum per ACI 318 for on-grade slabs is generally **100mm**.",
    hint: "e.g., 150 (for 150mm)",
    validate: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n < 75 || n > 1000) return "Please enter a valid thickness between 75mm and 1000mm.";
      return null;
    },
    extract: (v) => ({ slabThickness: parseFloat(v) }),
  },
  {
    id: "concreteGrade",
    field: "concreteGrade",
    question:
      "What is the **concrete compressive strength** f'c (in MPa)?\n\nCommon grades for ACI 318:\n• **21 MPa** (3000 psi) — light duty\n• **28 MPa** (4000 psi) — standard ✓\n• **35 MPa** (5000 psi) — heavy duty",
    hint: "e.g., 28",
    validate: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n < 17 || n > 70) return "Enter f'c between 17 MPa and 70 MPa.";
      return null;
    },
    extract: (v) => ({ concreteGrade: parseFloat(v) }),
  },
  {
    id: "steelGrade",
    field: "steelGrade",
    question:
      "What is the **reinforcement yield strength** fy (in MPa)?\n\nCommon grades:\n• **420 MPa** (Grade 60) — most common for ACI ✓\n• **280 MPa** (Grade 40)\n• **520 MPa** (Grade 75) — high strength",
    hint: "e.g., 420",
    validate: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n < 200 || n > 700) return "Enter fy between 200 MPa and 700 MPa.";
      return null;
    },
    extract: (v) => ({ steelGrade: parseFloat(v) }),
  },
  {
    id: "soilBearing",
    field: "soilBearingCapacity",
    question:
      "What is the **soil bearing capacity** (in kN/m²)?\n\nTypical values:\n• **75–100 kN/m²** — soft/medium clay\n• **100–200 kN/m²** — medium dense sand ✓\n• **200–400 kN/m²** — dense gravel/rock\n\nThis should come from your geotechnical report.",
    hint: "e.g., 150 (for 150 kN/m²)",
    validate: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n <= 0 || n > 2000) return "Enter soil bearing capacity between 10 and 2000 kN/m².";
      return null;
    },
    extract: (v) => ({ soilBearingCapacity: parseFloat(v) }),
  },
  {
    id: "deadLoad",
    field: "deadLoad",
    question:
      "What is the **dead load** (superimposed, in kN/m²)?\n\nThis includes floor finishes, partitions, equipment weight etc. (excluding slab self-weight — calculated automatically).\n\nTypical values: 2–5 kN/m² for most buildings.",
    hint: "e.g., 5",
    validate: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n < 0 || n > 500) return "Enter dead load between 0 and 500 kN/m².";
      return null;
    },
    extract: (v) => ({ deadLoad: parseFloat(v) }),
  },
  {
    id: "liveLoad",
    field: "liveLoad",
    question:
      "What is the **live load** (in kN/m²)?\n\nPer ASCE 7 / ACI 318:\n• **2.4 kN/m²** — residential/office\n• **4.8 kN/m²** — storage/assembly\n• **10–20 kN/m²** — warehouse/heavy industrial ✓",
    hint: "e.g., 10",
    validate: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n < 0 || n > 500) return "Enter live load between 0 and 500 kN/m².";
      return null;
    },
    extract: (v) => ({ liveLoad: parseFloat(v) }),
  },
  {
    id: "barMain",
    field: "barDiameterMain",
    question:
      "What **main bar diameter** would you like to use (in mm)?\n\nCommon choices:\n• **10mm** — light duty\n• **12mm** — standard ✓\n• **16mm** — heavy duty\n• **20mm** — very heavy",
    hint: "e.g., 12",
    validate: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || ![6, 8, 10, 12, 16, 20, 25, 32].includes(n)) return "Enter a standard bar size: 6, 8, 10, 12, 16, 20, 25, or 32 mm.";
      return null;
    },
    extract: (v) => ({ barDiameterMain: parseFloat(v) }),
  },
  {
    id: "spacingMain",
    field: "spacingMain",
    question:
      "What is the **main bar spacing** (in mm)?\n\nACI 318 limits: max 3h or 450mm for slabs.\nTypical spacing: 150–200mm.",
    hint: "e.g., 150",
    validate: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n < 50 || n > 600) return "Enter spacing between 50mm and 600mm.";
      return null;
    },
    extract: (v) => ({ spacingMain: parseFloat(v) }),
  },
  {
    id: "barDist",
    field: "barDiameterDist",
    question:
      "What **distribution bar diameter** would you like (in mm)?\n\nDistribution bars run perpendicular to main bars to control cracking.",
    hint: "e.g., 10",
    validate: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || ![6, 8, 10, 12, 16, 20, 25, 32].includes(n)) return "Enter a standard bar size: 6, 8, 10, 12, 16, 20, 25, or 32 mm.";
      return null;
    },
    extract: (v) => ({ barDiameterDist: parseFloat(v) }),
  },
  {
    id: "spacingDist",
    field: "spacingDist",
    question: "What is the **distribution bar spacing** (in mm)?",
    hint: "e.g., 200",
    validate: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n < 50 || n > 600) return "Enter spacing between 50mm and 600mm.";
      return null;
    },
    extract: (v) => ({ spacingDist: parseFloat(v) }),
  },
  {
    id: "coverBottom",
    field: "coverBottom",
    question:
      "What is the **concrete cover** (bottom, in mm)?\n\nACI 318-19 §20.6.1:\n• 40mm — cast against soil (minimum) ✓\n• 50mm — exposed to weather\n• 75mm — cast permanently against earth",
    hint: "e.g., 40",
    validate: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n < 20 || n > 150) return "Enter cover between 20mm and 150mm.";
      return null;
    },
    extract: (v) => ({ coverBottom: parseFloat(v) }),
  },
  {
    id: "complete",
    isInfo: true,
    question:
      "All inputs collected! I'm running the ACI 318-19 design checks now. You can review the complete results on the dashboard. The calculations include:\n\n✓ Geometry adequacy\n✓ Soil bearing pressure\n✓ Factored loads (1.2D + 1.6L)\n✓ Flexural design\n✓ One-way shear\n✓ Minimum reinforcement\n✓ Crack control\n✓ Deflection review",
  },
];

export function getQuickReplies(stepId: string): string[] {
  const map: Record<string, string[]> = {
    designCode: ["ACI 318 (Recommended)", "IS 456"],
    concreteGrade: ["21 MPa (3000 psi)", "28 MPa (4000 psi)", "35 MPa (5000 psi)"],
    steelGrade: ["420 MPa (Grade 60)", "280 MPa (Grade 40)", "520 MPa (Grade 75)"],
    soilBearing: ["75 kN/m² (Soft soil)", "150 kN/m² (Medium)", "250 kN/m² (Dense)"],
    deadLoad: ["3 kN/m²", "5 kN/m²", "8 kN/m²"],
    liveLoad: ["2.4 kN/m²", "5 kN/m²", "10 kN/m²", "20 kN/m²"],
    barMain: ["10mm", "12mm", "16mm", "20mm"],
    spacingMain: ["100mm", "150mm", "200mm"],
    barDist: ["8mm", "10mm", "12mm"],
    spacingDist: ["150mm", "200mm", "250mm"],
    coverBottom: ["40mm (Standard)", "50mm (Weather)", "75mm (Against earth)"],
    slabThickness: ["100mm", "150mm", "200mm", "250mm"],
  };
  return map[stepId] || [];
}

export function extractNumber(value: string): number {
  const match = value.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : NaN;
}

export function processUserInput(
  input: string,
  step: ChatStep
): { value: Partial<SlabInputs> | null; error: string | null } {
  const cleanInput = input.trim();
  
  // Extract number from quick replies like "28 MPa (4000 psi)"
  let processedInput = cleanInput;
  const numMatch = cleanInput.match(/^([\d.]+)/);
  if (numMatch && step.field) {
    processedInput = numMatch[1];
  }

  if (step.validate) {
    const error = step.validate(processedInput);
    if (error) return { value: null, error };
  }

  if (step.extract) {
    return { value: step.extract(processedInput), error: null };
  }

  return { value: null, error: null };
}
