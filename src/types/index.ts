export type DesignCode = "ACI318" | "IS456";
export type CheckStatus = "PASS" | "WARNING" | "FAIL" | "NOT_IMPLEMENTED";

export interface SlabInputs {
  // Project Info
  projectName: string;
  projectLocation: string;
  engineer: string;
  date: string;

  // Geometry
  slabLength: number;       // m
  slabWidth: number;        // m
  slabThickness: number;    // mm
  coverTop: number;         // mm
  coverBottom: number;      // mm

  // Materials
  concreteGrade: number;    // f'c MPa (ACI) or fck MPa (IS456)
  steelGrade: number;       // fy MPa
  soilBearingCapacity: number; // kN/m²

  // Loads
  deadLoad: number;         // kN/m²
  liveLoad: number;         // kN/m²
  pointLoad: number;        // kN (optional)
  pointLoadX: number;       // m from edge
  pointLoadY: number;       // m from edge

  // Reinforcement
  barDiameterMain: number;  // mm
  barDiameterDist: number;  // mm
  spacingMain: number;      // mm
  spacingDist: number;      // mm

  // Design Code
  designCode: DesignCode;
  loadCombination: string;
}

export interface CheckResult {
  name: string;
  codeReference: string;
  formulaDisplay: string;
  inputs: Record<string, number>;
  units: Record<string, string>;
  substitutionSteps: string[];
  resultValue: number;
  resultUnit: string;
  demand?: number;
  capacity?: number;
  dcr?: number;
  status: CheckStatus;
  interpretation: string;
  assumptions: string[];
  limitations: string[];
  verifyFlag: boolean;
}

export interface DesignResults {
  inputs: SlabInputs;
  checks: CheckResult[];
  governingDCR: number;
  governingCheck: string;
  overallStatus: CheckStatus;
  recommendations: string[];
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatState {
  messages: ChatMessage[];
  currentStep: number;
  collectedInputs: Partial<SlabInputs>;
  isComplete: boolean;
}
