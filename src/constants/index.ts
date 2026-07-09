export const DEFAULT_INPUTS = {
  projectName: "Grade Slab Design Project",
  projectLocation: "Site Location",
  engineer: "Structural Engineer",
  date: new Date().toISOString().split("T")[0],
  slabLength: 6,
  slabWidth: 4,
  slabThickness: 150,
  coverTop: 40,
  coverBottom: 50,
  concreteGrade: 28,
  steelGrade: 415,
  soilBearingCapacity: 150,
  deadLoad: 5,
  liveLoad: 10,
  pointLoad: 0,
  pointLoadX: 0,
  pointLoadY: 0,
  barDiameterMain: 12,
  barDiameterDist: 10,
  spacingMain: 150,
  spacingDist: 200,
  designCode: "ACI318" as const,
  loadCombination: "1.2D + 1.6L",
};

export const CONCRETE_GRADES_ACI = [21, 24, 28, 35, 42];
export const CONCRETE_GRADES_IS = [20, 25, 30, 35, 40, 45];
export const STEEL_GRADES_ACI = [280, 350, 420, 520];
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
