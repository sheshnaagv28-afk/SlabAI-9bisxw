import type { SlabInputs } from "@/types";

interface Props {
  inputs: SlabInputs;
}

export default function SlabPlanDiagram({ inputs }: Props) {
  const { slabLength, slabWidth, slabThickness, barDiameterMain, spacingMain, barDiameterDist, spacingDist, coverBottom } = inputs;

  const W = 400;
  const H = Math.round((slabWidth / slabLength) * W);
  const PAD = 40;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;

  // Bar lines
  const mainBarsCount = Math.floor(innerH / (spacingMain / (slabLength * 1000 / innerW)));
  const distBarsCount = Math.floor(innerW / (spacingDist / (slabWidth * 1000 / innerH)));

  const barCountMain = Math.min(10, Math.floor(innerH / 30));
  const barCountDist = Math.min(10, Math.floor(innerW / 30));

  const d = slabThickness - coverBottom - barDiameterMain / 2;
  const effectiveDepthMm = d.toFixed(0);

  return (
    <div className="space-y-2">
      <h3 className="font-heading text-sm text-foreground">Slab Plan & Reinforcement Layout</h3>
      <p className="font-mono text-xs text-muted-foreground">
        {slabLength}m × {slabWidth}m × {slabThickness}mm | d = {effectiveDepthMm}mm
      </p>
      <div className="rounded-[3px] bg-card border border-border p-3 overflow-x-auto">
        <svg width={W + PAD} height={H + PAD * 2} viewBox={`0 0 ${W + PAD} ${H + PAD * 2}`} className="mx-auto">
          {/* Slab outline */}
          <rect x={PAD} y={PAD} width={innerW} height={innerH} fill="#12140F" stroke="#5F83A3" strokeWidth="2" rx="2" />

          {/* Distribution bars (running horizontally = y-direction) */}
          {Array.from({ length: barCountDist + 1 }).map((_, i) => {
            const y = PAD + (i * innerH) / barCountDist;
            return (
              <line key={`dist-${i}`} x1={PAD} y1={y} x2={PAD + innerW} y2={y} stroke="#8A8778" strokeWidth="1.5" opacity="0.7" />
            );
          })}

          {/* Main bars (running vertically = x-direction) */}
          {Array.from({ length: barCountMain + 1 }).map((_, i) => {
            const x = PAD + (i * innerW) / barCountMain;
            return (
              <line key={`main-${i}`} x1={x} y1={PAD} x2={x} y2={PAD + innerH} stroke="#5F83A3" strokeWidth="1.5" opacity="0.8" />
            );
          })}

          {/* Dimensions */}
          {/* Width dimension (top) */}
          <line x1={PAD} y1={PAD - 15} x2={PAD + innerW} y2={PAD - 15} stroke="#8A8778" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
          <text x={PAD + innerW / 2} y={PAD - 18} textAnchor="middle" fill="#8A8778" fontSize="11" fontWeight="600" fontFamily="'IBM Plex Mono', monospace">
            {slabLength}m
          </text>

          {/* Height dimension (left) */}
          <line x1={PAD - 15} y1={PAD} x2={PAD - 15} y2={PAD + innerH} stroke="#8A8778" strokeWidth="1" />
          <text
            x={PAD - 18}
            y={PAD + innerH / 2}
            textAnchor="middle"
            fill="#8A8778"
            fontSize="11"
            fontWeight="600"
            fontFamily="'IBM Plex Mono', monospace"
            transform={`rotate(-90, ${PAD - 18}, ${PAD + innerH / 2})`}
          >
            {slabWidth}m
          </text>

          {/* Legend */}
          <line x1={PAD} y1={PAD + innerH + 12} x2={PAD + 25} y2={PAD + innerH + 12} stroke="#5F83A3" strokeWidth="2" />
          <text x={PAD + 28} y={PAD + innerH + 16} fill="#8A8778" fontSize="9" fontFamily="'IBM Plex Mono', monospace">
            Main ø{barDiameterMain}@{spacingMain}mm
          </text>
          <line x1={PAD + 120} y1={PAD + innerH + 12} x2={PAD + 145} y2={PAD + innerH + 12} stroke="#8A8778" strokeWidth="2" />
          <text x={PAD + 148} y={PAD + innerH + 16} fill="#8A8778" fontSize="9" fontFamily="'IBM Plex Mono', monospace">
            Dist. ø{barDiameterDist}@{spacingDist}mm
          </text>

          {/* Cover indicator */}
          <rect x={PAD} y={PAD} width={8} height={8} fill="none" stroke="#BA974F" strokeWidth="1" strokeDasharray="2 2" />
          <text x={PAD + 10} y={PAD + 18} fill="#BA974F" fontSize="8" fontFamily="'IBM Plex Mono', monospace">
            Cover {coverBottom}mm
          </text>
        </svg>
      </div>
    </div>
  );
}
