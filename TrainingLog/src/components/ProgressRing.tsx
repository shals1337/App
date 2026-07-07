interface Props {
  value: number;
  goal: number | null;
  unit: string;
  label: string;
  /** ring stroke color */
  color: string;
}

/** Circular progress ring for a daily nutrition total. */
export function ProgressRing({ value, goal, unit, label, color }: Props) {
  const size = 96;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = goal ? Math.min(1, value / goal) : 0;
  const reached = goal !== null && value >= goal;

  return (
    <div className="ring">
      <div className="ring-svg-wrap">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--surface-3)"
            strokeWidth={stroke}
          />
          {goal !== null && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={reached ? 'var(--success)' : color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c * (1 - pct)}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(0.34,1.2,0.64,1)' }}
            />
          )}
        </svg>
        <div className="ring-center">
          <span className="ring-value mono">{Math.round(value).toLocaleString('da-DK')}</span>
          <span className="ring-goal mono">
            {goal !== null ? `/ ${Math.round(goal).toLocaleString('da-DK')}` : unit}
          </span>
        </div>
      </div>
      <span className="ring-label">{label}</span>
    </div>
  );
}
