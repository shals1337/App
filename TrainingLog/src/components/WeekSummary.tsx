import type { WeekInsights } from '../lib/insights';
import { useCountUp } from '../lib/useCountUp';
import { FlameIcon } from './Icons';

const DAYS = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];

function Stat({ value, label }: { value: number; label: string }) {
  const n = useCountUp(value);
  return (
    <div className="week-stat">
      <span className="week-stat-value">{Math.round(n)}</span>
      <span className="week-stat-label">{label}</span>
    </div>
  );
}

export function WeekSummary({ insights }: { insights: WeekInsights }) {
  const today = (new Date().getDay() + 6) % 7;
  return (
    <div className="card week-card">
      <div className="week-top">
        <div className="week-stats">
          <Stat value={insights.trainingDays} label="dage" />
          <span className="week-sep" />
          <Stat value={insights.totalSets} label="sæt" />
          <span className="week-sep" />
          <div className="week-stat">
            <span className="week-stat-value streak">
              {insights.streakWeeks}
              <FlameIcon size={17} />
            </span>
            <span className="week-stat-label">ugers streak</span>
          </div>
        </div>
      </div>
      <div className="week-days">
        {DAYS.map((d, i) => (
          <div
            key={i}
            className={
              'week-day' +
              (insights.trainedWeekdays[i] ? ' done' : '') +
              (i === today ? ' today' : '')
            }
          >
            <span className="week-dot" />
            <span className="week-day-label">{d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
