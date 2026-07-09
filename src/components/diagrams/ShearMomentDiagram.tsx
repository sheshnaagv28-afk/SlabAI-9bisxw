import type { CheckResult } from "@/types";

interface Props {
  flexureCheck?: CheckResult;
  shearCheck?: CheckResult;
  inputs: {
    slabLength: number;
    slabThickness: number;
    deadLoad: number;
    liveLoad: number;
  };
}

export default function ShearMomentDiagram({ flexureCheck, shearCheck, inputs }: Props) {
  const { slabLength, slabThickness, deadLoad, liveLoad } = inputs;

  const W = 400;
  const H = 180;
  const PAD_L = 40;
  const PAD_R = 20;
  const PAD_T = 20;
  const PAD_B = 30;
  const innerW = W - PAD_L - PAD_R;
  const innerH = (H - PAD_T - PAD_B) / 2 - 5;

  const Wu = 1.2 * deadLoad + 1.6 * liveLoad;
  const Vu = (Wu * slabLength) / 2;
  const Mu = (Wu * slabLength * slabLength) / 8;

  const demandMu = flexureCheck?.demand ?? Mu;
  const demandVu = shearCheck?.demand ?? Vu;
  const capacityMu = flexureCheck?.capacity ?? Mu * 1.5;
  const capacityVu = shearCheck?.capacity ?? Vu * 1.5;

  // Parabola points for BM diagram
  const bmPoints: string[] = [];
  for (let i = 0; i <= 20; i++) {
    const x = (i / 20) * slabLength;
    const M = (Wu / 2) * x * (slabLength - x);
    const px = PAD_L + (i / 20) * innerW;
    const py = PAD_T + innerH - (M / demandMu) * innerH * 0.9;
    bmPoints.push(`${px},${py}`);
  }

  // Shear force line (linear)
  const sfStart = `${PAD_L},${PAD_T + innerH + 15}`;
  const sfMid = `${PAD_L + innerW / 2},${PAD_T + innerH + 15 + innerH * 0.5}`;
  const sfEnd = `${PAD_L + innerW},${PAD_T + innerH + 15}`;

  return (
    <div className="space-y-2">
      <h3 className="font-heading text-sm text-foreground">Bending Moment & Shear Force Diagrams</h3>
      <p className="font-mono text-xs text-muted-foreground">
        Span: {slabLength}m | wu = {Wu.toFixed(1)} kN/m² | Mu = {demandMu.toFixed(1)} kN·m/m | Vu = {demandVu.toFixed(1)} kN/m
      </p>
      <div className="rounded-[3px] bg-card border border-border p-3 overflow-x-auto">
        <svg width={W} height={H * 1.5} viewBox={`0 0 ${W} ${H * 1.5}`} className="mx-auto">
          {/* BMD Title */}
          <text x={PAD_L} y={PAD_T - 6} fill="#8A8778" fontSize="10" fontWeight="600">
            Bending Moment Diagram
          </text>

          {/* BMD baseline */}
          <line x1={PAD_L} y1={PAD_T + innerH} x2={PAD_L + innerW} y2={PAD_T + innerH} stroke="#33352B" strokeWidth="1" />
          {/* Support lines */}
          <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + innerH} stroke="#33352B" strokeWidth="1" />
          <line x1={PAD_L + innerW} y1={PAD_T} x2={PAD_L + innerW} y2={PAD_T + innerH} stroke="#33352B" strokeWidth="1" />

          {/* BMD curve */}
          <polyline
            points={bmPoints.join(" ")}
            fill="none"
            stroke="#5F83A3"
            strokeWidth="2"
          />
          {/* Fill under BMD */}
          <polygon
            points={`${PAD_L},${PAD_T + innerH} ${bmPoints.join(" ")} ${PAD_L + innerW},${PAD_T + innerH}`}
            fill="#5F83A3"
            opacity="0.1"
          />

          {/* Capacity line for BM */}
          <line
            x1={PAD_L}
            y1={PAD_T + innerH - innerH * 0.9 * (capacityMu / demandMu)}
            x2={PAD_L + innerW}
            y2={PAD_T + innerH - innerH * 0.9 * (capacityMu / demandMu)}
            stroke="#6B9D5C"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <text x={PAD_L + innerW + 2} y={PAD_T + innerH - innerH * 0.9 * (capacityMu / demandMu) + 4} fill="#6B9D5C" fontSize="8">
            φMn
          </text>

          {/* Peak label */}
          <text x={PAD_L + innerW / 2} y={PAD_T + 8} fill="#5F83A3" fontSize="10" textAnchor="middle">
            {demandMu.toFixed(1)} kN·m/m
          </text>

          {/* SFD Title */}
          <text x={PAD_L} y={PAD_T + innerH + 8} fill="#8A8778" fontSize="10" fontWeight="600">
            Shear Force Diagram
          </text>

          {/* SFD */}
          <line
            x1={PAD_L}
            y1={PAD_T + innerH + 20 + innerH * 0.5}
            x2={PAD_L + innerW}
            y2={PAD_T + innerH + 20 + innerH * 0.5}
            stroke="#33352B"
            strokeWidth="1"
          />

          {/* SFD trapezoid */}
          <polygon
            points={`
              ${PAD_L},${PAD_T + innerH + 20}
              ${PAD_L + innerW / 2},${PAD_T + innerH + 20 + innerH * 0.5}
              ${PAD_L + innerW / 2},${PAD_T + innerH + 20 + innerH * 0.5}
              ${PAD_L + innerW},${PAD_T + innerH + 20}
            `}
            fill="none"
            stroke="#8A8778"
            strokeWidth="2"
          />

          {/* Left shear label */}
          <text x={PAD_L + 4} y={PAD_T + innerH + 18} fill="#8A8778" fontSize="9">
            +{demandVu.toFixed(1)}
          </text>
          <text x={PAD_L + 4} y={PAD_T + innerH + 20 + innerH * 0.5 + 12} fill="#8A8778" fontSize="9">
            -{demandVu.toFixed(1)} kN/m
          </text>

          {/* Capacity line for shear */}
          <line
            x1={PAD_L}
            y1={PAD_T + innerH + 20 + innerH * 0.5 * (demandVu / Math.max(capacityVu, demandVu))}
            x2={PAD_L + innerW / 2}
            y2={PAD_T + innerH + 20 + innerH * 0.5 * (demandVu / Math.max(capacityVu, demandVu))}
            stroke="#6B9D5C"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          {/* Span label */}
          <text x={PAD_L + innerW / 2} y={H * 1.5 - 5} fill="#8A8778" fontSize="10" textAnchor="middle">
            Span: {slabLength}m
          </text>

          {/* Legend */}
          <line x1={PAD_L} y1={H * 1.5 - 20} x2={PAD_L + 16} y2={H * 1.5 - 20} stroke="#5F83A3" strokeWidth="2" />
          <text x={PAD_L + 18} y={H * 1.5 - 16} fill="#8A8778" fontSize="8">Demand (Mu/Vu)</text>
          <line x1={PAD_L + 110} y1={H * 1.5 - 20} x2={PAD_L + 126} y2={H * 1.5 - 20} stroke="#6B9D5C" strokeWidth="1.5" strokeDasharray="4 3" />
          <text x={PAD_L + 128} y={H * 1.5 - 16} fill="#8A8778" fontSize="8">Capacity (φMn)</text>
        </svg>
      </div>
    </div>
  );
}
