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

  const pressureColor = dcr > 1 ? "#ef4444" : dcr >= 0.8 ? "#f59e0b" : "#10b981";

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-slate-200">Soil Bearing Pressure Distribution</h3>
      <p className="text-xs text-slate-500">
        q_actual = {bearingPressure.toFixed(1)} kN/m² | q_allow = {soilBearingCapacity} kN/m² | DCR = {dcr.toFixed(2)}
      </p>
      <div className="rounded-lg bg-slate-900 border border-slate-700 p-3 overflow-x-auto">
        <svg width={W} height={H + 30} viewBox={`0 0 ${W} ${H + 30}`} className="mx-auto">
          {/* Slab rectangle */}
          <rect x={PAD} y={PAD / 2} width={innerW} height={PAD * 0.7} fill="#1e3a5f" stroke="#38bdf8" strokeWidth="1.5" rx="2" />
          <text x={PAD + innerW / 2} y={PAD / 2 + PAD * 0.4} fill="#38bdf8" fontSize="10" textAnchor="middle">
            Grade Slab ({slabLength}m × {slabWidth}m)
          </text>

          {/* Soil below slab */}
          <rect x={PAD} y={PAD / 2 + PAD * 0.7} width={innerW} height={12} fill="#7c5c3e" opacity="0.4" rx="0" />

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
          >
            q = {bearingPressure.toFixed(1)} kN/m²
          </text>

          {/* Allowable capacity line */}
          <line
            x1={PAD}
            y1={PAD / 2 + PAD * 0.7 + 12 + capacityBarH}
            x2={PAD + innerW}
            y2={PAD / 2 + PAD * 0.7 + 12 + capacityBarH}
            stroke="#10b981"
            strokeWidth="1.5"
            strokeDasharray="5 4"
          />
          <text
            x={PAD + innerW}
            y={PAD / 2 + PAD * 0.7 + 12 + capacityBarH - 4}
            fill="#10b981"
            fontSize="9"
            textAnchor="end"
          >
            q_allow = {soilBearingCapacity} kN/m²
          </text>

          {/* DCR badge */}
          <rect
            x={PAD}
            y={H + 5}
            width={innerW}
            height={20}
            fill={dcr > 1 ? "#7f1d1d" : dcr >= 0.8 ? "#78350f" : "#064e3b"}
            rx="6"
            opacity="0.5"
          />
          <text x={PAD + innerW / 2} y={H + 18} fill={pressureColor} fontSize="11" fontWeight="700" textAnchor="middle">
            DCR = {dcr.toFixed(3)} — {dcr > 1 ? "FAIL ✗" : dcr >= 0.8 ? "WARNING ⚠" : "PASS ✓"}
          </text>
        </svg>
      </div>
    </div>
  );
}
