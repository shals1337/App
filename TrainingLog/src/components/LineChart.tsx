import { useEffect, useId, useMemo, useRef, useState } from 'react';

export interface ChartPoint {
  label: string;
  value: number;
}

interface Props {
  points: ChartPoint[];
  unit: string;
  height?: number;
  /** series color; defaults to the app accent */
  color?: string;
}

const PAD = { top: 22, right: 14, bottom: 26, left: 40 };
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

/** Monotone cubic smoothing — smooth curve that never overshoots the data. */
function monotonePath(xs: number[], ys: number[]): string {
  const n = xs.length;
  if (n === 0) return '';
  if (n === 1) return `M${xs[0]},${ys[0]}`;
  if (n === 2) return `M${xs[0]},${ys[0]} L${xs[1]},${ys[1]}`;

  const dx: number[] = [];
  const dy: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = xs[i + 1] - xs[i];
    dy[i] = ys[i + 1] - ys[i];
    slope[i] = dy[i] / dx[i];
  }
  const m: number[] = [slope[0]];
  for (let i = 1; i < n - 1; i++) {
    if (slope[i - 1] * slope[i] <= 0) m[i] = 0;
    else {
      const w1 = 2 * dx[i] + dx[i - 1];
      const w2 = dx[i] + 2 * dx[i - 1];
      m[i] = (w1 + w2) / (w1 / slope[i - 1] + w2 / slope[i]);
    }
  }
  m[n - 1] = slope[n - 2];

  let d = `M${xs[0]},${ys[0]}`;
  for (let i = 0; i < n - 1; i++) {
    const x1 = xs[i] + dx[i] / 3;
    const y1 = ys[i] + (m[i] * dx[i]) / 3;
    const x2 = xs[i + 1] - dx[i] / 3;
    const y2 = ys[i + 1] - (m[i + 1] * dx[i]) / 3;
    d += ` C${x1},${y1} ${x2},${y2} ${xs[i + 1]},${ys[i + 1]}`;
  }
  return d;
}

function fmt(v: number): string {
  if (v >= 1000) return Math.round(v).toLocaleString('da-DK');
  return `${Math.round(v * 10) / 10}`.replace('.', ',');
}

/** Premium single-series area chart: smooth curve, gradient fill, animated draw, hover bubble. */
export function LineChart({ points, unit, height = 190, color }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const [drawn, setDrawn] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const uid = useId().replace(/:/g, '');
  const stroke = color ?? 'var(--series-1)';

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return setDrawn(true);
    const t = setTimeout(() => setDrawn(true), 30);
    return () => clearTimeout(t);
  }, []);

  const geo = useMemo(() => {
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
    const yFor = (v: number) => PAD.top + plotH - ((v - lo) / span) * plotH;
    return { plotW, plotH, xs, ys, ticks, yFor };
  }, [points, height]);

  if (points.length === 0) return null;

  const { plotW, plotH, xs, ys, ticks, yFor } = geo;
  const baseline = PAD.top + plotH;
  const line = monotonePath(xs, ys);
  const area = `${line} L${xs[xs.length - 1]},${baseline} L${xs[0]},${baseline} Z`;
  const lastIdx = points.length - 1;
  const h = hover;

  return (
    <div className="chart-wrap">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${height}`}
        className="line-chart"
        onPointerMove={(e) => {
          const svg = svgRef.current;
          if (!svg) return;
          const rect = svg.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * W;
          let best = 0;
          let bd = Infinity;
          xs.forEach((px, i) => {
            const dd = Math.abs(px - x);
            if (dd < bd) {
              bd = dd;
              best = i;
            }
          });
          setHover(best);
        }}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`fill${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.32" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`stroke${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.65" />
            <stop offset="100%" stopColor={stroke} stopOpacity="1" />
          </linearGradient>
          <filter id={`glow${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={PAD.left + plotW} y1={yFor(t)} y2={yFor(t)} className="grid-line" />
            <text x={PAD.left - 8} y={yFor(t) + 3.5} className="tick-label" textAnchor="end">
              {t >= 1000 ? `${Math.round(t / 100) / 10}k` : t}
            </text>
          </g>
        ))}

        <text x={PAD.left} y={height - 7} className="tick-label" textAnchor="start">
          {points[0].label}
        </text>
        {points.length > 1 && (
          <text x={PAD.left + plotW} y={height - 7} className="tick-label" textAnchor="end">
            {points[lastIdx].label}
          </text>
        )}

        <path d={area} fill={`url(#fill${uid})`} className={drawn ? 'chart-area in' : 'chart-area'} />
        <path
          d={line}
          fill="none"
          stroke={`url(#stroke${uid})`}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          className={drawn ? 'chart-line in' : 'chart-line'}
        />

        {/* endpoint glow dot */}
        <circle
          cx={xs[lastIdx]}
          cy={ys[lastIdx]}
          r="4.2"
          fill={stroke}
          filter={`url(#glow${uid})`}
          className="chart-endpoint"
        />

        {h !== null && (
          <>
            <line x1={xs[h]} x2={xs[h]} y1={PAD.top} y2={baseline} className="crosshair" />
            <circle cx={xs[h]} cy={ys[h]} r="5.5" fill="var(--surface)" stroke={stroke} strokeWidth="2.5" />
          </>
        )}
      </svg>

      <div className="chart-caption">
        {h !== null ? (
          <span>
            <strong>
              {fmt(points[h].value)} {unit}
            </strong>{' '}
            · {points[h].label}
          </span>
        ) : (
          <span className="muted">
            {fmt(points[lastIdx].value)} {unit} nu · {points.length}{' '}
            {points.length === 1 ? 'måling' : 'målinger'}
          </span>
        )}
      </div>
    </div>
  );
}
