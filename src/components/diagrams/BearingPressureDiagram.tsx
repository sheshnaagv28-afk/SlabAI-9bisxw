import type { SlabInputs } from "@/types";

interface Props {
  inputs: SlabInputs;
  bearingPressure: number;
}

export default function BearingPressureDiagram({ inputs, bearingPressure }: Props) {
  const { soilBearingCapacity, slabLength, slabWidth } = inputs;
  const dcr = bearingPressure / soilBearingCapacity;

  const W = 400;
  const H = 160;
  const PAD = 40;
  const innerW = W - PAD * 2;
  const innerH = H - PAD;

  const pressureBarH = Math.min(innerH * 0.6, (bearingPressure / soilBearingCapacity) * innerH * 0.6);
  const capacityBarH = innerH * 0.6;

  const pressureColor = dcr > 1 ? "#D9622B" : dcr >= 0.8 ? "#BA974F" : "#6B9D5C";

  return (
    <div className="space-y-2">
      <h3 className="font-heading text-sm text-foreground">Soil Bearing Pressure Distribution</h3>
      <p className="font-mono text-xs text-muted-foreground">
        q_actual = {bearingPressure.toFixed(1)} kN/m² | q_allow = {soilBearingCapacity} kN/m² | DCR = {dcr.toFixed(2)}
      </p>
      <div className="rounded-[3px] bg-card border border-border p-3 overflow-x-auto">
        <svg width={W} height={H + 30} viewBox={`0 0 ${W} ${H + 30}`} className="mx-auto">
          {/* Slab rectangle */}
          <rect x={PAD} y={PAD / 2} width={innerW} height={PAD * 0.7} fill="#12140F" stroke="#5F83A3" strokeWidth="1.5" rx="2" />
          <text x={PAD + innerW / 2} y={PAD / 2 + PAD * 0.4} fill="#5F83A3" fontSize="10" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace">
            Grade Slab ({slabLength}m × {slabWidth}m)
          </text>

          {/* Soil below slab */}
          <rect x={PAD} y={PAD / 2 + PAD * 0.7} width={innerW} height={12} fill="#4A4436" opacity="0.6" rx="0" />

          {/* Pressure arrows (downward) */}
          {Array.from({ length: 8 }).map((_, i) => {
            const x = PAD + 20 + (i * (innerW - 40)) / 7;
            const arrowH = pressureBarH;
            return (
              <g key={i}>
                <line
                  x1={x}
                  y1={PAD / 2 + PAD * 0.7 + 12}
                  x2={x}
                  y2={PAD / 2 + PAD * 0.7 + 12 + arrowH}
                  stroke={pressureColor}
                  strokeWidth="1.5"
                  opacity="0.8"
                />
                <polygon
                  points={`${x - 4},${PAD / 2 + PAD * 0.7 + 12 + arrowH - 6} ${x + 4},${PAD / 2 + PAD * 0.7 + 12 + arrowH - 6} ${x},${PAD / 2 + PAD * 0.7 + 12 + arrowH}`}
                  fill={pressureColor}
                  opacity="0.9"
                />
              </g>
            );
          })}

          {/* Pressure label */}
          <text
            x={PAD + innerW / 2}
            y={PAD / 2 + PAD * 0.7 + 12 + pressureBarH + 14}
            fill={pressureColor}
            fontSize="11"
            fontWeight="700"
            textAnchor="middle"
            fontFamily="'IBM Plex Mono', monospace"
          >
            q = {bearingPressure.toFixed(1)} kN/m²
          </text>

          {/* Allowable capacity line */}
          <line
            x1={PAD}
            y1={PAD / 2 + PAD * 0.7 + 12 + capacityBarH}
            x2={PAD + innerW}
            y2={PAD / 2 + PAD * 0.7 + 12 + capacityBarH}
            stroke="#6B9D5C"
            strokeWidth="1.5"
            strokeDasharray="5 4"
          />
          <text
            x={PAD + innerW}
            y={PAD / 2 + PAD * 0.7 + 12 + capacityBarH - 4}
            fill="#6B9D5C"
            fontSize="9"
            textAnchor="end"
            fontFamily="'IBM Plex Mono', monospace"
          >
            q_allow = {soilBearingCapacity} kN/m²
          </text>

          {/* DCR badge */}
          <rect
            x={PAD}
            y={H + 5}
            width={innerW}
            height={20}
            fill={pressureColor}
            rx="2"
            opacity="0.15"
          />
          <text x={PAD + innerW / 2} y={H + 18} fill={pressureColor} fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace">
            DCR = {dcr.toFixed(3)} — {dcr > 1 ? "FAIL ✗" : dcr >= 0.8 ? "WARNING ⚠" : "PASS ✓"}
          </text>
        </svg>
      </div>
    </div>
  );
}
