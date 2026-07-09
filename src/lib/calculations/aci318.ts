import type { SlabInputs, CheckResult } from "@/types";
 
// ============================================================
// ACI 318-19 Grade Slab Design Calculations
// All calculations are deterministic — no AI involvement
// Unit System: US Customary / Imperial
//   Length (span):        ft
//   Length (thickness,
//     cover, bar dia,
//     spacing, effective
//     depth):              in
//   Stress (f'c, fy, fs):  psi
//   Load (DL, LL, soil
//     bearing capacity):   psf
//   Moment (per ft width): lb-ft/ft
//   Shear (per ft width):  lb/ft
//   Reinforcement area:    in²/ft
// NOTE: shear and crack-control equations below use ACI 318's own
// published inch-pound coefficients (e.g. 2√f'c, 15/12 spacing
// constants) — these are NOT a naive mm→in relabel of the metric
// coefficients, since ACI 318 publishes distinct SI and customary
// forms of several provisions.
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
  // Mu in lb-in, d in in, fc in psi, b in in
  // Returns Ast in in²/ft
  const Mu_lbin = Mu;
  const Rn = Mu_lbin / (PHI_FLEXURE * b * d * d);
  const m = inputs_m(fc, 60000);
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
  const lToD = (slabLength * 12) / slabThickness;
  const aspectRatio = slabLength / slabWidth;
  const minThickness = 4; // in minimum for grade slabs
 
  const status = slabThickness >= minThickness && d > 0 ? "PASS" : "FAIL";
 
  return {
    name: "Geometry Adequacy",
    codeReference: "ACI 318-19 §26.4",
    formulaDisplay: "d = h - c_bottom - d_b/2",
    inputs: { h: slabThickness, c_bottom: coverBottom, d_b: barDiameterMain },
    units: { h: "in", c_bottom: "in", d_b: "in", d: "in" },
    substitutionSteps: [
      `h = ${slabThickness} in`,
      `c_bottom = ${coverBottom} in`,
      `d_b/2 = ${barDiameterMain / 2} in`,
      `d = ${slabThickness} - ${coverBottom} - ${barDiameterMain / 2} = ${d.toFixed(2)} in`,
      `L/d ratio = ${lToD.toFixed(1)}`,
      `Aspect ratio = ${aspectRatio.toFixed(2)}`,
    ],
    resultValue: d,
    resultUnit: "in",
    dcr: slabThickness < minThickness ? 999 : 0.5,
    status,
    interpretation: status === "PASS"
      ? `Effective depth d = ${d.toFixed(2)} in. Slab thickness adequate (h = ${slabThickness} in ≥ 4 in min).`
      : `Slab thickness ${slabThickness} in is below minimum 4 in.`,
    assumptions: ["Minimum slab thickness for grade slab = 4 in"],
    limitations: ["Does not account for thermal/shrinkage provisions"],
    verifyFlag: false,
  };
}
 
// 2. Bearing Pressure Check
export function bearingPressureCheck(inputs: SlabInputs): CheckResult {
  const { slabLength, slabWidth, deadLoad, liveLoad, soilBearingCapacity, designCode } = inputs;
 
  const area = slabLength * slabWidth; // ft²
  const totalLoad = deadLoad + liveLoad; // psf
  const bearingPressure = totalLoad; // psf = bearing pressure on soil
  const qAllowable = soilBearingCapacity; // psf
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
    units: { DL: "psf", LL: "psf", q_allowable: "psf", Area: "ft²" },
    substitutionSteps: [
      `Dead Load = ${deadLoad} psf`,
      `Live Load = ${liveLoad} psf`,
      `q_actual = ${deadLoad} + ${liveLoad} = ${bearingPressure.toFixed(2)} psf`,
      `q_allowable = ${qAllowable} psf`,
      `DCR = ${bearingPressure.toFixed(2)} / ${qAllowable} = ${dcr.toFixed(3)}`,
    ],
    resultValue: bearingPressure,
    resultUnit: "psf",
    demand: bearingPressure,
    capacity: qAllowable,
    dcr,
    status,
    interpretation: status === "PASS"
      ? `Soil bearing pressure ${bearingPressure.toFixed(1)} psf < allowable ${qAllowable} psf. OK.`
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
    units: { D: "psf", L: "psf", wu: "psf" },
    substitutionSteps: [
      `Dead Load D = ${deadLoad} psf`,
      `Live Load L = ${liveLoad} psf`,
      `wu = 1.2(${deadLoad}) + 1.6(${liveLoad})`,
      `wu = ${(1.2 * deadLoad).toFixed(2)} + ${(1.6 * liveLoad).toFixed(2)}`,
      `wu = ${Wu.toFixed(2)} psf`,
    ],
    resultValue: Wu,
    resultUnit: "psf",
    dcr: 0.0,
    status: "PASS",
    interpretation: `Factored design load wu = ${Wu.toFixed(2)} psf (ACI 318-19 load combination 1.2D + 1.6L).`,
    assumptions: ["Gravity loads only; wind/seismic not included"],
    limitations: ["Other load combinations per ACI 318 §5.3 may govern"],
    verifyFlag: false,
  };
}
 
// 4. Bending Moment Check
export function bendingMomentCheck(inputs: SlabInputs): CheckResult {
  const { slabLength, slabWidth, deadLoad, liveLoad, slabThickness, concreteGrade, steelGrade, barDiameterMain, coverBottom } = inputs;
 
  const Wu = 1.2 * deadLoad + 1.6 * liveLoad; // psf
  const Lx = slabLength; // ft (shorter span governs for two-way behavior)
  const Ly = slabWidth;
 
  // Simplified: treat as one-way slab in shorter direction for conservative check
  // Mu = Wu * Lx² / 8 for a simply supported slab (upper bound conservative)
  const Mu = (Wu * Lx * Lx) / 8; // lb-ft/ft
 
  const d = effectiveDepth(inputs); // in
  const b = 12; // in per ft width
 
  // Mn calculation: using Whitney stress block
  // Rn = Mu / (phi * b * d²)
  const Mu_lbin = Mu * 12; // convert lb-ft to lb-in
  const Rn = Mu_lbin / (PHI_FLEXURE * b * d * d);
 
  const fc = concreteGrade; // psi
  const fy = steelGrade; // psi
  const m = fy / (0.85 * fc);
  const rhoRequired = (1 / m) * (1 - Math.sqrt(Math.max(0, 1 - (2 * m * Rn) / fc)));
  const AstRequired = rhoRequired * b * d; // in²/ft
 
  // Provided steel
  const AstProvided = (Math.PI * barDiameterMain * barDiameterMain / 4) * (12 / inputs.spacingMain);
 
  // Capacity
  const a = (AstProvided * fy) / (0.85 * fc * b); // depth of stress block, in
  const Mn_lbin = PHI_FLEXURE * AstProvided * fy * (d - a / 2);
  const PhiMn = Mn_lbin / 12; // lb-ft/ft
 
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
      AstRequired: Math.round(AstRequired * 100) / 100,
      AstProvided: Math.round(AstProvided * 100) / 100,
      a: parseFloat(a.toFixed(2)),
      PhiMn: parseFloat(PhiMn.toFixed(2)),
    },
    units: { Wu: "psf", Lx: "ft", Mu: "lb-ft/ft", d: "in", AstRequired: "in²/ft", AstProvided: "in²/ft", a: "in", PhiMn: "lb-ft/ft" },
    substitutionSteps: [
      `wu = 1.2D + 1.6L = ${Wu.toFixed(2)} psf`,
      `Mu = wu × Lx²/8 = ${Wu.toFixed(2)} × ${Lx}²/8 = ${Mu.toFixed(2)} lb-ft/ft`,
      `Effective depth d = ${d.toFixed(2)} in`,
      `Rn = Mu/(φbd²) = ${Rn.toFixed(4)} psi`,
      `ρ_required = ${rhoRequired.toFixed(5)}`,
      `Ast_required = ${AstRequired.toFixed(3)} in²/ft`,
      `Ast_provided (${barDiameterMain}in @ ${inputs.spacingMain}in) = ${AstProvided.toFixed(3)} in²/ft`,
      `a = Ast_prov × fy / (0.85×f'c×b) = ${a.toFixed(3)} in`,
      `φMn = φ × Ast × fy × (d - a/2) = ${PhiMn.toFixed(2)} lb-ft/ft`,
      `DCR = Mu/φMn = ${Mu.toFixed(2)}/${PhiMn.toFixed(2)} = ${dcr.toFixed(3)}`,
    ],
    resultValue: PhiMn,
    resultUnit: "lb-ft/ft",
    demand: Mu,
    capacity: PhiMn,
    dcr,
    status,
    interpretation: status === "PASS"
      ? `Flexural capacity φMn = ${PhiMn.toFixed(1)} lb-ft/ft > Mu = ${Mu.toFixed(1)} lb-ft/ft. Section is adequate.`
      : status === "WARNING"
      ? `Flexural utilization at ${(dcr * 100).toFixed(0)}%. Consider increasing reinforcement.`
      : `FLEXURAL FAILURE: φMn = ${PhiMn.toFixed(1)} < Mu = ${Mu.toFixed(1)} lb-ft/ft. Increase reinforcement or slab thickness.`,
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
  const Vu = Wu * (Lx / 2 - d / 12); // lb/ft
 
  // ACI 318-19 Table 22.5.5.1 simplified equation (customary units)
  const lambda = 1.0; // normal weight concrete
  const fc = concreteGrade;
  // Vc = 2 * lambda * sqrt(f'c) * b * d  [psi, in, in -> lb]  [VERIFY: ACI 318-19 §22.5.5.1]
  const b = 12; // in per ft width
  const Vc_lb = PHI_SHEAR * 2 * lambda * Math.sqrt(fc) * b * d; // lb per ft width
  const PhiVc = Vc_lb; // lb/ft
 
  const dcr = Vu / PhiVc;
  let status: CheckResult["status"] = "PASS";
  if (dcr > 1.0) status = "FAIL";
  else if (dcr >= 0.8) status = "WARNING";
 
  return {
    name: "One-Way Shear",
    codeReference: "ACI 318-19 §22.5.5.1 [VERIFY CLAUSE]",
    formulaDisplay: "φVc = φ·2·λ·√f'c·b·d",
    inputs: {
      Wu,
      Lx,
      d,
      fc,
      Vu: parseFloat(Vu.toFixed(2)),
      PhiVc: parseFloat(PhiVc.toFixed(2)),
    },
    units: { Wu: "psf", Lx: "ft", d: "in", fc: "psi", Vu: "lb/ft", PhiVc: "lb/ft" },
    substitutionSteps: [
      `wu = ${Wu.toFixed(2)} psf`,
      `Critical section at d = ${d.toFixed(2)} in from support`,
      `Vu = wu × (Lx/2 - d/12) = ${Wu.toFixed(2)} × (${(Lx / 2).toFixed(2)} - ${(d / 12).toFixed(3)}) = ${Vu.toFixed(2)} lb/ft`,
      `φVc = ${PHI_SHEAR} × 2 × 1.0 × √${fc} × 12 × ${d.toFixed(2)} = ${PhiVc.toFixed(2)} lb/ft`,
      `DCR = ${Vu.toFixed(2)} / ${PhiVc.toFixed(2)} = ${dcr.toFixed(3)}`,
    ],
    resultValue: PhiVc,
    resultUnit: "lb/ft",
    demand: Vu,
    capacity: PhiVc,
    dcr,
    status,
    interpretation: status === "PASS"
      ? `One-way shear: φVc = ${PhiVc.toFixed(1)} lb/ft > Vu = ${Vu.toFixed(1)} lb/ft. No shear reinforcement required.`
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
 
  const b = 12; // in per ft width
  const h = slabThickness;
  const fy = steelGrade;
 
  // ACI 318-19 §24.4.3.2 — Minimum shrinkage/temp steel for slabs
  let rhoMin: number;
  if (fy >= 60000) {
    rhoMin = 0.0018;
  } else {
    rhoMin = Math.max(0.0014, 0.0018 * 60000 / fy);
  }
 
  const AstMin = rhoMin * b * h; // in²/ft
 
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
    formulaDisplay: "Ast,min = 0.0018 × b × h (for fy ≥ 60,000 psi)",
    inputs: {
      rhoMin,
      h,
      AstMin: Math.round(AstMin * 100) / 100,
      AstMain: Math.round(AstMain * 100) / 100,
      AstDist: Math.round(AstDist * 100) / 100,
    },
    units: { rhoMin: "-", h: "in", AstMin: "in²/ft", AstMain: "in²/ft", AstDist: "in²/ft" },
    substitutionSteps: [
      `fy = ${fy} psi ≥ 60,000 psi → ρ_min = 0.0018`,
      `Ast,min = 0.0018 × 12 × ${h} = ${AstMin.toFixed(3)} in²/ft`,
      `Ast,main (${barDiameterMain}in @ ${spacingMain}in) = ${AstMain.toFixed(3)} in²/ft`,
      `Ast,dist (${barDiameterDist}in @ ${spacingDist}in) = ${AstDist.toFixed(3)} in²/ft`,
      `DCR (main) = ${AstMin.toFixed(3)} / ${AstMain.toFixed(3)} = ${dcrMain.toFixed(3)}`,
      `DCR (dist) = ${AstMin.toFixed(3)} / ${AstDist.toFixed(3)} = ${dcrDist.toFixed(3)}`,
    ],
    resultValue: AstMin,
    resultUnit: "in²/ft",
    demand: AstMin,
    capacity: Math.min(AstMain, AstDist),
    dcr,
    status,
    interpretation: status === "PASS"
      ? `Both main (${AstMain.toFixed(3)} in²/ft) and distribution (${AstDist.toFixed(3)} in²/ft) bars exceed minimum (${AstMin.toFixed(3)} in²/ft).`
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
 
  // ACI 318-19 §24.3 — Maximum bar spacing for crack control (customary units)
  // s_max = min(15(40,000/fs) - 2.5·cc, 12(40,000/fs))
  const fs = 0.67 * steelGrade; // approximate service steel stress, psi
  const cc = coverBottom; // clear cover, in
 
  const sMax1 = 15 * (40000 / fs) - 2.5 * cc;
  const sMax2 = 12 * (40000 / fs);
  const sMax = Math.min(sMax1, sMax2);
 
  const dcr = spacingMain / sMax;
  let status: CheckResult["status"] = "PASS";
  if (dcr > 1.0) status = "FAIL";
  else if (dcr >= 0.85) status = "WARNING";
 
  return {
    name: "Crack Control (Bar Spacing)",
    codeReference: "ACI 318-19 §24.3.2",
    formulaDisplay: "s ≤ min[15(40,000/fs) - 2.5cc, 12(40,000/fs)]",
    inputs: {
      fs: parseFloat(fs.toFixed(1)),
      cc,
      sMax1: parseFloat(sMax1.toFixed(2)),
      sMax2: parseFloat(sMax2.toFixed(2)),
      sMax: parseFloat(sMax.toFixed(2)),
      sProvided: spacingMain,
    },
    units: { fs: "psi", cc: "in", sMax: "in", sProvided: "in" },
    substitutionSteps: [
      `fs ≈ 0.67 × fy = 0.67 × ${steelGrade} = ${fs.toFixed(1)} psi (approximate service stress)`,
      `s_max1 = 15(40,000/${fs.toFixed(1)}) - 2.5(${cc}) = ${sMax1.toFixed(2)} in`,
      `s_max2 = 12(40,000/${fs.toFixed(1)}) = ${sMax2.toFixed(2)} in`,
      `s_max = min(${sMax1.toFixed(2)}, ${sMax2.toFixed(2)}) = ${sMax.toFixed(2)} in`,
      `s_provided = ${spacingMain} in`,
      `DCR = ${spacingMain} / ${sMax.toFixed(2)} = ${dcr.toFixed(3)}`,
    ],
    resultValue: sMax,
    resultUnit: "in",
    demand: spacingMain,
    capacity: sMax,
    dcr,
    status,
    interpretation: status === "PASS"
      ? `Bar spacing ${spacingMain} in ≤ s_max = ${sMax.toFixed(1)} in. Crack control adequate.`
      : status === "WARNING"
      ? `Bar spacing approaching limit. Reduce spacing for better crack control.`
      : `Bar spacing ${spacingMain} in EXCEEDS maximum ${sMax.toFixed(1)} in. Reduce bar spacing.`,
    assumptions: ["fs ≈ 0.67fy (approximate service steel stress)", "Normal exposure conditions"],
    limitations: ["Actual crack width not computed per ACI 318 (uses spacing limit approach)"],
    verifyFlag: false,
  };
}
 
// 8. Deflection Check (flagged as not applicable for on-grade slabs)
export function deflectionCheck(inputs: SlabInputs): CheckResult {
  const { slabLength, slabThickness } = inputs;
  const lToH = (slabLength * 12) / slabThickness;
  const lToHLimit = 20; // rough limit for one-way slabs
 
  return {
    name: "Deflection (L/h Ratio)",
    codeReference: "ACI 318-19 §24.2 — Engineering Judgment Required",
    formulaDisplay: "L/h ≤ limit (may not govern for slabs on grade)",
    inputs: { L: slabLength * 12, h: slabThickness, lToH: parseFloat(lToH.toFixed(1)) },
    units: { L: "in", h: "in", lToH: "-" },
    substitutionSteps: [
      `L = ${slabLength * 12} in`,
      `h = ${slabThickness} in`,
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
    recs.push(`Increase slab thickness from ${inputs.slabThickness} in (try ${inputs.slabThickness + 2} in).`);
    recs.push(`Reduce reinforcement spacing from ${inputs.spacingMain} in to ${inputs.spacingMain - 1} in.`);
    recs.push(`Consider upgrading concrete grade from f'c = ${inputs.concreteGrade} psi to ${inputs.concreteGrade + 500} psi.`);
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
