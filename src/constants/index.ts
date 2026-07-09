export const DEFAULT_INPUTS = {
  projectName: "Grade Slab Design Project",
  projectLocation: "Site Location",
  engineer: "Structural Engineer",
  date: new Date().toISOString().split("T")[0],
  slabLength: 20,
  slabWidth: 13,
  slabThickness: 6,
  coverTop: 1.5,
  coverBottom: 2,
  concreteGrade: 4000,
  steelGrade: 60000,
  soilBearingCapacity: 3000,
  deadLoad: 100,
  liveLoad: 200,
  pointLoad: 0,
  pointLoadX: 0,
  pointLoadY: 0,
  barDiameterMain: 0.5,
  barDiameterDist: 0.375,
  spacingMain: 6,
  spacingDist: 8,
  designCode: "ACI318" as const,
  loadCombination: "1.2D + 1.6L",
};

export const CONCRETE_GRADES_ACI = [3000, 3500, 4000, 5000, 6000];
export const CONCRETE_GRADES_IS = [20, 25, 30, 35, 40, 45];
export const STEEL_GRADES_ACI = [40000, 50000, 60000, 75000];
export const STEEL_GRADES_IS = [250, 415, 500, 550];

export const LOAD_COMBINATIONS_ACI = [
  "1.2D + 1.6L",
  "1.4D",
  "1.2D + 1.6L + 0.5S",
];

export const LOAD_COMBINATIONS_IS = [
  "1.5(DL + LL)",
  "1.2(DL + LL + EL)",
  "0.9DL + 1.5EL",
];

export const NAV_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Design Tool", path: "/design" },
  { label: "Code Compare", path: "/compare" },
  { label: "Reports", path: "/reports" },
];
