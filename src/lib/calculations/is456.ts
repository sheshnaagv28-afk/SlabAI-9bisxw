import type { SlabInputs, CheckResult } from "@/types";

// IS 456:2000 — Stub implementation
// All checks return NOT_IMPLEMENTED status
// This ensures no IS 456 check silently falls back to ACI 318 logic

const NOT_IMPLEMENTED_RESULT = (name: string): CheckResult => ({
  name,
  codeReference: "IS 456:2000 — Not Yet Implemented",
  formulaDisplay: "N/A",
  inputs: {},
  units: {},
  substitutionSteps: [
    "IS 456:2000 design checks are not yet implemented in this version.",
    "ACI 318-19 is the fully supported code for V1.0.",
    "IS 456 support is planned for the next release.",
  ],
  resultValue: 0,
  resultUnit: "N/A",
  dcr: undefined,
  status: "NOT_IMPLEMENTED",
  interpretation:
    "IS 456:2000 calculations are not yet implemented. Please select ACI 318 for a complete design check, or contact support for IS 456 availability.",
  assumptions: [],
  limitations: ["IS 456:2000 implementation pending — see roadmap"],
  verifyFlag: false,
});

export function runIS456Design(inputs: SlabInputs): CheckResult[] {
  return [
    NOT_IMPLEMENTED_RESULT("Geometry Adequacy (IS 456)"),
    NOT_IMPLEMENTED_RESULT("Factored Design Load (IS 456 §18)"),
    NOT_IMPLEMENTED_RESULT("Bearing Pressure (IS 456)"),
    NOT_IMPLEMENTED_RESULT("Flexural Design (IS 456 §26.5)"),
    NOT_IMPLEMENTED_RESULT("One-Way Shear (IS 456 §40)"),
    NOT_IMPLEMENTED_RESULT("Minimum Reinforcement (IS 456 §26.5.2)"),
    NOT_IMPLEMENTED_RESULT("Crack Width (IS 456 Annex F)"),
    NOT_IMPLEMENTED_RESULT("Deflection (IS 456 §23.2)"),
  ];
}
