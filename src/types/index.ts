export type DesignCode = "ACI318" | "IS456";
export type CheckStatus = "PASS" | "WARNING" | "FAIL" | "NOT_IMPLEMENTED";

export interface SlabInputs {
  // Project Info
  projectName: string;
  projectLocation: string;
  engineer: string;
  date: string;

  // Geometry
  slabLength: number;       // ft
  slabWidth: number;        // ft
  slabThickness: number;    // in
  coverTop: number;         // in
  coverBottom: number;      // in

  // Materials
  concreteGrade: number;    // f'c psi (ACI) or fck MPa (IS456)
  steelGrade: number;       // fy psi
  soilBearingCapacity: number; // psf

  // Loads
  deadLoad: number;         // psf
  liveLoad: number;         // psf
  pointLoad: number;        // kips (optional)
  pointLoadX: number;       // ft from edge
  pointLoadY: number;       // ft from edge

  // Reinforcement
  barDiameterMain: number;  // in
  barDiameterDist: number;  // in
  spacingMain: number;      // in
  spacingDist: number;      // in

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
