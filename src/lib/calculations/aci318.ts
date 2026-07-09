import type { SlabInputs, CheckResult } from "@/types";

// ============================================================
// ACI 318-19 Grade Slab Design Calculations
// All calculations are deterministic — no AI involvement
// ============================================================

const PHI_FLEXURE = 0.9;
const PHI_SHEAR = 0.75;
const PHI_BEARING = 0.65;

function effectiveDepth(inputs: SlabInputs, isBottom = true): number {
  const cover = isBottom ? inputs.coverBottom : inputs.coverTop;
  const barRadius = inputs.barDiameterMain / 2;
  return inputs.slabThickness - cover - barRadius;
}

function requiredAst(Mu: number, d: number, fc: number, b: number): number {
  // Mu in kN·m, d in mm, fc in MPa, b in mm
  // Returns Ast in mm²/m
  const Mu_Nmm = Mu * 1e6;
  const Rn = Mu_Nmm / (PHI_FLEXURE * b * d * d);
  const m = inputs_m(fc, 420);
  const rho = (1 / m) * (1 - Math.sqrt(1 - (2 * m * Rn) / fc));
  return rho * b * d;
}

function inputs_m(fc: number, fy: number): number {
  return fy / (0.85 * fc);
}

// 1. Geometry Check
export function geometryCheck(inputs: SlabInputs): CheckResult {
  const { slabLength, slabWidth, slabThickness, coverBottom, coverTop, barDiameterMain } = inputs;
  const d = effectiveDepth(inputs);
  const lToD = (slabLength * 1000) / slabThickness;
  const aspectRatio = slabLength / slabWidth;
  const minThickness = 100; // mm minimum for grade slabs

  const status = slabThickness >= minThickness && d > 0 ? "PASS" : "FAIL";

  return {
    name: "Geometry Adequacy",
    codeReference: "ACI 318-19 §26.4",
    formulaDisplay: "d = h - c_bottom - d_b/2",
    inputs: { h: slabThickness, c_bottom: coverBottom, d_b: barDiameterMain },
    units: { h: "mm", c_bottom: "mm", d_b: "mm", d: "mm" },
    substitutionSteps: [
      `h = ${slabThickness} mm`,
      `c_bottom = ${coverBottom} mm`,
      `d_b/2 = ${barDiameterMain / 2} mm`,
      `d = ${slabThickness} - ${coverBottom} - ${barDiameterMain / 2} = ${d.toFixed(1)} mm`,
      `L/d ratio = ${lToD.toFixed(1)}`,
      `Aspect ratio = ${aspectRatio.toFixed(2)}`,
    ],
    resultValue: d,
    resultUnit: "mm",
    dcr: slabThickness < minThickness ? 999 : 0.5,
    status,
    interpretation: status === "PASS"
      ? `Effective depth d = ${d.toFixed(0)} mm. Slab thickness adequate (h = ${slabThickness} mm ≥ 100 mm min).`
      : `Slab thickness ${slabThickness} mm is below minimum 100 mm.`,
    assumptions: ["Minimum slab thickness for grade slab = 100 mm"],
    limitations: ["Does not account for thermal/shrinkage provisions"],
    verifyFlag: false,
  };
}

// 2. Bearing Pressure Check
export function bearingPressureCheck(inputs: SlabInputs): CheckResult {
  const { slabLength, slabWidth, deadLoad, liveLoad, soilBearingCapacity, designCode } = inputs;

  const area = slabLength * slabWidth; // m²
  const totalLoad = deadLoad + liveLoad; // kN/m²
  const bearingPressure = totalLoad; // kN/m² = bearing pressure on soil
  const qAllowable = soilBearingCapacity; // kN/m²
  const dcr = bearingPressure / qAllowable;

  let status: CheckResult["status"] = "PASS";
  if (dcr > 1.0) status = "FAIL";
  else if (dcr >= 0.8) status = "WARNING";

  return {
    name: "Soil Bearing Pressure",
    codeReference: "ACI 318-19 §13.2 [VERIFY CLAUSE]",
    formulaDisplay: "q_actual = (DL + LL) ≤ q_allowable",
    inputs: {
      DL: deadLoad,
      LL: liveLoad,
      q_allowable: qAllowable,
      Area: area,
    },
    units: { DL: "kN/m²", LL: "kN/m²", q_allowable: "kN/m²", Area: "m²" },
    substitutionSteps: [
      `Dead Load = ${deadLoad} kN/m²`,
      `Live Load = ${liveLoad} kN/m²`,
      `q_actual = ${deadLoad} + ${liveLoad} = ${bearingPressure.toFixed(2)} kN/m²`,
      `q_allowable = ${qAllowable} kN/m²`,
      `DCR = ${bearingPressure.toFixed(2)} / ${qAllowable} = ${dcr.toFixed(3)}`,
    ],
    resultValue: bearingPressure,
    resultUnit: "kN/m²",
    demand: bearingPressure,
    capacity: qAllowable,
    dcr,
    status,
    interpretation: status === "PASS"
      ? `Soil bearing pressure ${bearingPressure.toFixed(1)} kN/m² < allowable ${qAllowable} kN/m². OK.`
      : status === "WARNING"
      ? `Bearing pressure approaching allowable capacity (DCR = ${dcr.toFixed(2)}).`
      : `Soil bearing pressure EXCEEDS allowable capacity! Redesign required.`,
    assumptions: ["Uniform load distribution assumed"],
    limitations: ["Point load eccentricity not included in this simplified check"],
    verifyFlag: true,
  };
}

// 3. Factored Load Calculation
export function factoredLoadCheck(inputs: SlabInputs): CheckResult {
  const { deadLoad, liveLoad } = inputs;
  const Wu = 1.2 * deadLoad + 1.6 * liveLoad;
  const totalService = deadLoad + liveLoad;
  const dcr = Wu / (totalService * 1.6); // rough adequacy indicator

  return {
    name: "Factored Design Load",
    codeReference: "ACI 318-19 §5.3.1",
    formulaDisplay: "wu = 1.2D + 1.6L",
    inputs: { D: deadLoad, L: liveLoad },
    units: { D: "kN/m²", L: "kN/m²", wu: "kN/m²" },
    substitutionSteps: [
      `Dead Load D = ${deadLoad} kN/m²`,
      `Live Load L = ${liveLoad} kN/m²`,
      `wu = 1.2(${deadLoad}) + 1.6(${liveLoad})`,
      `wu = ${(1.2 * deadLoad).toFixed(2)} + ${(1.6 * liveLoad).toFixed(2)}`,
      `wu = ${Wu.toFixed(2)} kN/m²`,
    ],
    resultValue: Wu,
    resultUnit: "kN/m²",
    dcr: 0.0,
    status: "PASS",
    interpretation: `Factored design load wu = ${Wu.toFixed(2)} kN/m² (ACI 318-19 load combination 1.2D + 1.6L).`,
    assumptions: ["Gravity loads only; wind/seismic not included"],
    limitations: ["Other load combinations per ACI 318 §5.3 may govern"],
    verifyFlag: false,
  };
}

// 4. Bending Moment Check
export function bendingMomentCheck(inputs: SlabInputs): CheckResult {
  const { slabLength, slabWidth, deadLoad, liveLoad, slabThickness, concreteGrade, steelGrade, barDiameterMain, coverBottom } = inputs;

  const Wu = 1.2 * deadLoad + 1.6 * liveLoad; // kN/m²
  const Lx = slabLength; // m (shorter span governs for two-way behavior)
  const Ly = slabWidth;

  // Simplified: treat as one-way slab in shorter direction for conservative check
  // Mu = Wu * Lx² / 8 for a simply supported slab (upper bound conservative)
  const Mu = (Wu * Lx * Lx) / 8; // kN·m/m

  const d = effectiveDepth(inputs); // mm
  const b = 1000; // mm/m width

  // Mn calculation: using Whitney stress block
  // Rn = Mu / (phi * b * d²)
  const Mu_Nmm = Mu * 1e6;
  const Rn = Mu_Nmm / (PHI_FLEXURE * b * d * d);

  const fc = concreteGrade; // MPa
  const fy = steelGrade; // MPa
  const m = fy / (0.85 * fc);
  const rhoRequired = (1 / m) * (1 - Math.sqrt(Math.max(0, 1 - (2 * m * Rn) / fc)));
  const AstRequired = rhoRequired * b * d; // mm²/m

  // Provided steel
  const AstProvided = (Math.PI * barDiameterMain * barDiameterMain / 4) * (1000 / inputs.spacingMain);

  // Capacity
  const a = (AstProvided * fy) / (0.85 * fc * b); // depth of stress block mm
  const Mn_Nmm = PHI_FLEXURE * AstProvided * fy * (d - a / 2);
  const PhiMn = Mn_Nmm / 1e6; // kN·m/m

  const dcr = Mu / PhiMn;
  let status: CheckResult["status"] = "PASS";
  if (dcr > 1.0) status = "FAIL";
  else if (dcr >= 0.8) status = "WARNING";

  return {
    name: "Flexural Design (Bending)",
    codeReference: "ACI 318-19 §22.2, §9.6",
    formulaDisplay: "φMn = φ·Ast·fy·(d - a/2) ≥ Mu",
    inputs: {
      Wu,
      Lx,
      Mu,
      d,
      AstRequired: Math.round(AstRequired),
      AstProvided: Math.round(AstProvided),
      a: parseFloat(a.toFixed(2)),
      PhiMn: parseFloat(PhiMn.toFixed(2)),
    },
    units: { Wu: "kN/m²", Lx: "m", Mu: "kN·m/m", d: "mm", AstRequired: "mm²/m", AstProvided: "mm²/m", a: "mm", PhiMn: "kN·m/m" },
    substitutionSteps: [
      `wu = 1.2D + 1.6L = ${Wu.toFixed(2)} kN/m²`,
      `Mu = wu × Lx²/8 = ${Wu.toFixed(2)} × ${Lx}²/8 = ${Mu.toFixed(2)} kN·m/m`,
      `Effective depth d = ${d.toFixed(1)} mm`,
      `Rn = Mu/(φbd²) = ${Rn.toFixed(4)} MPa`,
      `ρ_required = ${rhoRequired.toFixed(5)}`,
      `Ast_required = ${AstRequired.toFixed(0)} mm²/m`,
      `Ast_provided (${barDiameterMain}mm @ ${inputs.spacingMain}mm) = ${AstProvided.toFixed(0)} mm²/m`,
      `a = Ast_prov × fy / (0.85×f'c×b) = ${a.toFixed(2)} mm`,
      `φMn = φ × Ast × fy × (d - a/2) = ${PhiMn.toFixed(2)} kN·m/m`,
      `DCR = Mu/φMn = ${Mu.toFixed(2)}/${PhiMn.toFixed(2)} = ${dcr.toFixed(3)}`,
    ],
    resultValue: PhiMn,
    resultUnit: "kN·m/m",
    demand: Mu,
    capacity: PhiMn,
    dcr,
    status,
    interpretation: status === "PASS"
      ? `Flexural capacity φMn = ${PhiMn.toFixed(1)} kN·m/m > Mu = ${Mu.toFixed(1)} kN·m/m. Section is adequate.`
      : status === "WARNING"
      ? `Flexural utilization at ${(dcr * 100).toFixed(0)}%. Consider increasing reinforcement.`
      : `FLEXURAL FAILURE: φMn = ${PhiMn.toFixed(1)} < Mu = ${Mu.toFixed(1)} kN·m/m. Increase reinforcement or slab thickness.`,
    assumptions: ["One-way slab behavior assumed (conservative for two-way slabs)", "Simply supported boundary condition for Mu"],
    limitations: ["Continuity effects and support conditions not modeled"],
    verifyFlag: false,
  };
}

// 5. One-Way Shear Check
export function oneWayShearCheck(inputs: SlabInputs): CheckResult {
  const { slabLength, deadLoad, liveLoad, concreteGrade, slabThickness, barDiameterMain, coverBottom } = inputs;

  const Wu = 1.2 * deadLoad + 1.6 * liveLoad;
  const Lx = slabLength;
  const d = effectiveDepth(inputs);

  // Critical section at d from support face
  const Vu = Wu * (Lx / 2 - d / 1000); // kN/m

  // ACI 318-19 Table 22.5.5.1 simplified equation
  const lambda = 1.0; // normal weight concrete
  const fc = concreteGrade;
  // Vc = 0.17 * lambda * sqrt(f'c) * b * d  [VERIFY: ACI 318-19 §22.5.5.1]
  const b = 1000; // mm/m
  const Vc_N = PHI_SHEAR * 0.17 * lambda * Math.sqrt(fc) * b * d; // N/m
  const PhiVc = Vc_N / 1000; // kN/m

  const dcr = Vu / PhiVc;
  let status: CheckResult["status"] = "PASS";
  if (dcr > 1.0) status = "FAIL";
  else if (dcr >= 0.8) status = "WARNING";

  return {
    name: "One-Way Shear",
    codeReference: "ACI 318-19 §22.5.5.1 [VERIFY CLAUSE]",
    formulaDisplay: "φVc = φ·0.17·λ·√f'c·b·d",
    inputs: {
      Wu,
      Lx,
      d,
      fc,
      Vu: parseFloat(Vu.toFixed(2)),
      PhiVc: parseFloat(PhiVc.toFixed(2)),
    },
    units: { Wu: "kN/m²", Lx: "m", d: "mm", fc: "MPa", Vu: "kN/m", PhiVc: "kN/m" },
    substitutionSteps: [
      `wu = ${Wu.toFixed(2)} kN/m²`,
      `Critical section at d = ${d.toFixed(0)} mm from support`,
      `Vu = wu × (Lx/2 - d/1000) = ${Wu.toFixed(2)} × (${(Lx / 2).toFixed(2)} - ${(d / 1000).toFixed(3)}) = ${Vu.toFixed(2)} kN/m`,
      `φVc = ${PHI_SHEAR} × 0.17 × 1.0 × √${fc} × 1000 × ${d.toFixed(0)} = ${PhiVc.toFixed(2)} kN/m`,
      `DCR = ${Vu.toFixed(2)} / ${PhiVc.toFixed(2)} = ${dcr.toFixed(3)}`,
    ],
    resultValue: PhiVc,
    resultUnit: "kN/m",
    demand: Vu,
    capacity: PhiVc,
    dcr,
    status,
    interpretation: status === "PASS"
      ? `One-way shear: φVc = ${PhiVc.toFixed(1)} kN/m > Vu = ${Vu.toFixed(1)} kN/m. No shear reinforcement required.`
      : status === "WARNING"
      ? `Shear approaching capacity (DCR = ${dcr.toFixed(2)}). Consider increasing slab thickness.`
      : `SHEAR FAILURE: Vu exceeds φVc. Increase slab thickness or add shear reinforcement.`,
    assumptions: ["λ = 1.0 (normal weight concrete)", "No shear reinforcement provided"],
    limitations: ["Grade slabs on soil rarely govern in shear; this is a conservative check"],
    verifyFlag: true,
  };
}

// 6. Minimum Reinforcement Check
export function minimumReinforcementCheck(inputs: SlabInputs): CheckResult {
  const { slabThickness, steelGrade, barDiameterMain, spacingMain, barDiameterDist, spacingDist } = inputs;

  const b = 1000; // mm/m
  const h = slabThickness;
  const fy = steelGrade;

  // ACI 318-19 §24.4.3.2 — Minimum shrinkage/temp steel for slabs
  let rhoMin: number;
  if (fy >= 420) {
    rhoMin = 0.0018;
  } else {
    rhoMin = Math.max(0.0014, 0.0018 * 420 / fy);
  }

  const AstMin = rhoMin * b * h; // mm²/m

  const AstMain = (Math.PI * barDiameterMain * barDiameterMain / 4) * (b / spacingMain);
  const AstDist = (Math.PI * barDiameterDist * barDiameterDist / 4) * (b / spacingDist);

  const dcrMain = AstMin / AstMain;
  const dcrDist = AstMin / AstDist;
  const dcr = Math.max(dcrMain, dcrDist);

  let status: CheckResult["status"] = "PASS";
  if (dcr > 1.0) status = "FAIL";
  else if (dcr >= 0.9) status = "WARNING";

  return {
    name: "Minimum Reinforcement",
    codeReference: "ACI 318-19 §24.4.3.2",
    formulaDisplay: "Ast,min = 0.0018 × b × h (for fy ≥ 420 MPa)",
    inputs: {
      rhoMin,
      h,
      AstMin: Math.round(AstMin),
      AstMain: Math.round(AstMain),
      AstDist: Math.round(AstDist),
    },
    units: { rhoMin: "-", h: "mm", AstMin: "mm²/m", AstMain: "mm²/m", AstDist: "mm²/m" },
    substitutionSteps: [
      `fy = ${fy} MPa ≥ 420 MPa → ρ_min = 0.0018`,
      `Ast,min = 0.0018 × 1000 × ${h} = ${AstMin.toFixed(0)} mm²/m`,
      `Ast,main (${barDiameterMain}mm @ ${spacingMain}mm) = ${AstMain.toFixed(0)} mm²/m`,
      `Ast,dist (${barDiameterDist}mm @ ${spacingDist}mm) = ${AstDist.toFixed(0)} mm²/m`,
      `DCR (main) = ${AstMin.toFixed(0)} / ${AstMain.toFixed(0)} = ${dcrMain.toFixed(3)}`,
      `DCR (dist) = ${AstMin.toFixed(0)} / ${AstDist.toFixed(0)} = ${dcrDist.toFixed(3)}`,
    ],
    resultValue: AstMin,
    resultUnit: "mm²/m",
    demand: AstMin,
    capacity: Math.min(AstMain, AstDist),
    dcr,
    status,
    interpretation: status === "PASS"
      ? `Both main (${AstMain.toFixed(0)} mm²/m) and distribution (${AstDist.toFixed(0)} mm²/m) bars exceed minimum (${AstMin.toFixed(0)} mm²/m).`
      : status === "WARNING"
      ? `Reinforcement approaching minimum. Consider increasing bar size or reducing spacing.`
      : `Reinforcement BELOW minimum. Increase bar diameter or reduce spacing.`,
    assumptions: ["Temperature and shrinkage steel requirements per ACI 318 §24.4.3.2"],
    limitations: ["Structural reinforcement from flexure check may govern over shrinkage minimum"],
    verifyFlag: false,
  };
}

// 7. Crack Control Check
export function crackControlCheck(inputs: SlabInputs): CheckResult {
  const { slabThickness, barDiameterMain, spacingMain, coverBottom, steelGrade, deadLoad, liveLoad, slabLength } = inputs;

  // ACI 318-19 §24.3 — Maximum bar spacing for crack control
  // s_max = min(380(280/fs) - 2.5·cc, 300(280/fs))
  const fs = 0.67 * steelGrade; // approximate service steel stress
  const cc = coverBottom; // clear cover

  const sMax1 = 380 * (280 / fs) - 2.5 * cc;
  const sMax2 = 300 * (280 / fs);
  const sMax = Math.min(sMax1, sMax2);

  const dcr = spacingMain / sMax;
  let status: CheckResult["status"] = "PASS";
  if (dcr > 1.0) status = "FAIL";
  else if (dcr >= 0.85) status = "WARNING";

  return {
    name: "Crack Control (Bar Spacing)",
    codeReference: "ACI 318-19 §24.3.2",
    formulaDisplay: "s ≤ min[380(280/fs) - 2.5cc, 300(280/fs)]",
    inputs: {
      fs: parseFloat(fs.toFixed(1)),
      cc,
      sMax1: parseFloat(sMax1.toFixed(1)),
      sMax2: parseFloat(sMax2.toFixed(1)),
      sMax: parseFloat(sMax.toFixed(1)),
      sProvided: spacingMain,
    },
    units: { fs: "MPa", cc: "mm", sMax: "mm", sProvided: "mm" },
    substitutionSteps: [
      `fs ≈ 0.67 × fy = 0.67 × ${steelGrade} = ${fs.toFixed(1)} MPa (approximate service stress)`,
      `s_max1 = 380(280/${fs.toFixed(1)}) - 2.5(${cc}) = ${sMax1.toFixed(1)} mm`,
      `s_max2 = 300(280/${fs.toFixed(1)}) = ${sMax2.toFixed(1)} mm`,
      `s_max = min(${sMax1.toFixed(1)}, ${sMax2.toFixed(1)}) = ${sMax.toFixed(1)} mm`,
      `s_provided = ${spacingMain} mm`,
      `DCR = ${spacingMain} / ${sMax.toFixed(1)} = ${dcr.toFixed(3)}`,
    ],
    resultValue: sMax,
    resultUnit: "mm",
    demand: spacingMain,
    capacity: sMax,
    dcr,
    status,
    interpretation: status === "PASS"
      ? `Bar spacing ${spacingMain} mm ≤ s_max = ${sMax.toFixed(0)} mm. Crack control adequate.`
      : status === "WARNING"
      ? `Bar spacing approaching limit. Reduce spacing for better crack control.`
      : `Bar spacing ${spacingMain} mm EXCEEDS maximum ${sMax.toFixed(0)} mm. Reduce bar spacing.`,
    assumptions: ["fs ≈ 0.67fy (approximate service steel stress)", "Normal exposure conditions"],
    limitations: ["Actual crack width not computed per ACI 318 (uses spacing limit approach)"],
    verifyFlag: false,
  };
}

// 8. Deflection Check (flagged as not applicable for on-grade slabs)
export function deflectionCheck(inputs: SlabInputs): CheckResult {
  const { slabLength, slabThickness } = inputs;
  const lToH = (slabLength * 1000) / slabThickness;
  const lToHLimit = 20; // rough limit for one-way slabs

  return {
    name: "Deflection (L/h Ratio)",
    codeReference: "ACI 318-19 §24.2 — Engineering Judgment Required",
    formulaDisplay: "L/h ≤ limit (may not govern for slabs on grade)",
    inputs: { L: slabLength * 1000, h: slabThickness, lToH: parseFloat(lToH.toFixed(1)) },
    units: { L: "mm", h: "mm", lToH: "-" },
    substitutionSteps: [
      `L = ${slabLength * 1000} mm`,
      `h = ${slabThickness} mm`,
      `L/h = ${lToH.toFixed(1)}`,
      `⚠️ For slabs-on-grade, deflection is typically controlled by soil support, not flexural stiffness.`,
      `ACI 318 deflection provisions (§24.2) apply to suspended slabs. Engineering judgment required.`,
    ],
    resultValue: lToH,
    resultUnit: "-",
    dcr: 0,
    status: "WARNING",
    interpretation: `L/h = ${lToH.toFixed(1)}. Deflection check per ACI 318 §24.2 applies to suspended slabs. For slabs-on-grade, differential settlement governs — consult geotechnical report. This check is flagged for engineering review.`,
    assumptions: ["Deflection check applicability for slabs-on-grade requires engineering judgment"],
    limitations: ["ACI 318 deflection provisions are for suspended slabs; soil settlement governs on-grade"],
    verifyFlag: true,
  };
}

// 9. Overall DCR and Recommendations
export function runACI318Design(inputs: SlabInputs): CheckResult[] {
  const checks = [
    geometryCheck(inputs),
    factoredLoadCheck(inputs),
    bearingPressureCheck(inputs),
    bendingMomentCheck(inputs),
    oneWayShearCheck(inputs),
    minimumReinforcementCheck(inputs),
    crackControlCheck(inputs),
    deflectionCheck(inputs),
  ];
  return checks;
}

export function getGovernResults(checks: CheckResult[]) {
  const dcrChecks = checks.filter((c) => c.dcr !== undefined && c.dcr > 0);
  if (dcrChecks.length === 0) return { governingDCR: 0, governingCheck: "N/A", overallStatus: "PASS" as const };

  const governing = dcrChecks.reduce((max, c) => ((c.dcr ?? 0) > (max.dcr ?? 0) ? c : max));
  const governingDCR = governing.dcr ?? 0;

  let overallStatus: CheckResult["status"] = "PASS";
  if (checks.some((c) => c.status === "FAIL")) overallStatus = "FAIL";
  else if (checks.some((c) => c.status === "WARNING")) overallStatus = "WARNING";

  return { governingDCR, governingCheck: governing.name, overallStatus };
}

export function generateRecommendations(checks: CheckResult[], inputs: SlabInputs): string[] {
  const recs: string[] = [];
  const failed = checks.filter((c) => c.status === "FAIL");
  const warned = checks.filter((c) => c.status === "WARNING");

  if (failed.some((c) => c.name.includes("Bearing"))) {
    recs.push("Increase slab plan area to reduce soil bearing pressure.");
    recs.push("Verify soil bearing capacity with geotechnical investigation.");
  }
  if (failed.some((c) => c.name.includes("Flexural") || c.name.includes("Bending"))) {
    recs.push(`Increase slab thickness from ${inputs.slabThickness} mm (try ${inputs.slabThickness + 50} mm).`);
    recs.push(`Reduce reinforcement spacing from ${inputs.spacingMain} mm to ${inputs.spacingMain - 25} mm.`);
    recs.push(`Consider upgrading concrete grade from f'c = ${inputs.concreteGrade} MPa to ${inputs.concreteGrade + 7} MPa.`);
  }
  if (failed.some((c) => c.name.includes("Shear"))) {
    recs.push("Increase slab thickness to improve shear capacity without reinforcement.");
    recs.push("Add shear reinforcement (stirrups) at critical shear zones.");
  }
  if (failed.some((c) => c.name.includes("Minimum"))) {
    recs.push("Increase reinforcement bar diameter or reduce spacing to meet minimum requirements.");
  }
  if (warned.some((c) => c.name.includes("Crack"))) {
    recs.push("Reduce bar spacing to improve crack control per ACI 318 §24.3.");
  }
  if (recs.length === 0 && failed.length === 0) {
    recs.push("Design is satisfactory per ACI 318-19. Proceed to detailed drawings.");
    recs.push("Ensure construction joints are properly detailed.");
    recs.push("Specify concrete mix design per ACI 318 Chapter 26 durability requirements.");
  }
  return recs;
}
