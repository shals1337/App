import { useMemo, useRef, useState } from 'react';

export interface ChartPoint {
  label: string;
  value: number;
}

interface Props {
  points: ChartPoint[];
  unit: string;
  height?: number;
}

const PAD = { top: 20, right: 12, bottom: 24, left: 38 };
const W = 360;

function niceTicks(min: number, max: number): number[] {
  if (min === max) {
    const pad = Math.max(1, Math.abs(min) * 0.1);
    min -= pad;
    max += pad;
  }
  const span = max - min;
  const step = Math.pow(10, Math.floor(Math.log10(span / 3)));
  const err = span / 3 / step;
  const mult = err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1;
  const s = step * mult;
  const lo = Math.floor(min / s) * s;
  const ticks: number[] = [];
  for (let v = lo; v <= max + s * 0.001; v += s) {
    if (v >= min - s * 0.001) ticks.push(Math.round(v * 100) / 100);
  }
  return ticks;
}

/** Single-series line chart with area fill, crosshair hover, and selective labels. */
export function LineChart({ points, unit, height = 180 }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { xs, ys, ticks, plotW, plotH } = useMemo(() => {
    const plotW = W - PAD.left - PAD.right;
    const plotH = height - PAD.top - PAD.bottom;
    const values = points.map((p) => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const ticks = niceTicks(min, max);
    const lo = Math.min(min, ticks[0]);
    const hi = Math.max(max, ticks[ticks.length - 1]);
    const span = hi - lo || 1;
    const xs = points.map((_, i) =>
      points.length === 1
        ? PAD.left + plotW / 2
        : PAD.left + (i / (points.length - 1)) * plotW,
    );
    const ys = values.map((v) => PAD.top + plotH - ((v - lo) / span) * plotH);
    return { xs, ys, ticks, plotW, plotH, lo, span };
  }, [points, height]);

  if (points.length === 0) return null;

  const yFor = (v: number) => {
    const loTick = ticks[0];
    const hiTick = ticks[ticks.length - 1];
    const lo = Math.min(Math.min(...points.map((p) => p.value)), loTick);
    const hi = Math.max(Math.max(...points.map((p) => p.value)), hiTick);
    const span = hi - lo || 1;
    return PAD.top + plotH - ((v - lo) / span) * plotH;
  };

  const linePath = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ');
  const areaPath = `${linePath} L${xs[xs.length - 1]},${PAD.top + plotH} L${xs[0]},${PAD.top + plotH} Z`;

  // selective direct labels: min, max, and last point only
  const values = points.map((p) => p.value);
  const labeled = new Set([
    values.indexOf(Math.max(...values)),
    values.indexOf(Math.min(...values)),
    points.length - 1,
  ]);

  function onMove(e: React.PointerEvent) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0;
    let bestDist = Infinity;
    xs.forEach((px, i) => {
      const d = Math.abs(px - x);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setHover(best);
  }

  const h = hover;

  return (
    <div className="chart-wrap">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${height}`}
        className="line-chart"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={PAD.left + plotW}
              y1={yFor(t)}
              y2={yFor(t)}
              className="grid-line"
            />
            <text x={PAD.left - 6} y={yFor(t) + 3.5} className="tick-label" textAnchor="end">
              {t >= 1000 ? `${Math.round(t / 100) / 10}k` : t}
            </text>
          </g>
        ))}

        <text x={PAD.left} y={height - 6} className="tick-label" textAnchor="start">
          {points[0].label}
        </text>
        {points.length > 1 && (
          <text x={PAD.left + plotW} y={height - 6} className="tick-label" textAnchor="end">
            {points[points.length - 1].label}
          </text>
        )}

        <path d={areaPath} className="chart-area" />
        <path d={linePath} className="chart-line" />

        {points.map((p, i) => (
          <g key={i}>
            {(labeled.has(i) || h === i) && (
              <text
                x={xs[i]}
                y={ys[i] - 8}
                className="point-label"
                textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}
              >
                {p.value >= 1000 ? Math.round(p.value).toLocaleString() : p.value}
              </text>
            )}
            <circle cx={xs[i]} cy={ys[i]} r={h === i ? 5 : 3.5} className="chart-dot" />
          </g>
        ))}

        {h !== null && (
          <line
            x1={xs[h]}
            x2={xs[h]}
            y1={PAD.top}
            y2={PAD.top + plotH}
            className="crosshair"
          />
        )}
      </svg>
      <div className="chart-caption">
        {h !== null ? (
          <span>
            <strong>{points[h].value >= 1000 ? Math.round(points[h].value).toLocaleString() : points[h].value} {unit}</strong> · {points[h].label}
          </span>
        ) : (
          <span className="muted">
            {points.length} session{points.length === 1 ? '' : 's'}
          </span>
        )}
      </div>
    </div>
  );
}
