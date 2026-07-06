import { useMemo, useState } from 'react';
import type { WorkoutSession } from '../types';
import { localDateKey } from '../lib/format';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface Props {
  sessions: WorkoutSession[];
  onPickDay: (sessionId: string) => void;
}

export function MonthCalendar({ sessions, onPickDay }: Props) {
  const [monthStart, setMonthStart] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const byDay = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of [...sessions].sort((a, b) => a.startedAt.localeCompare(b.startedAt))) {
      map.set(localDateKey(s.startedAt), s.id);
    }
    return map;
  }, [sessions]);

  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Mon = 0
  const todayKey = localDateKey(new Date().toISOString());

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function shift(delta: number) {
    setMonthStart(new Date(year, month + delta, 1));
  }

  return (
    <div className="card calendar">
      <div className="calendar-head">
        <button className="icon-btn subtle" onClick={() => shift(-1)} aria-label="Previous month">
          <ChevronLeftIcon size={17} />
        </button>
        <span className="calendar-month">
          {monthStart.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </span>
        <button className="icon-btn subtle" onClick={() => shift(1)} aria-label="Next month">
          <ChevronRightIcon size={17} />
        </button>
      </div>

      <div className="calendar-grid">
        {DAY_LABELS.map((l, i) => (
          <span className="calendar-daylabel" key={i}>
            {l}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={`e${i}`} />;
          const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const sessionId = byDay.get(key);
          const isToday = key === todayKey;
          return (
            <button
              key={key}
              className={
                'calendar-day' +
                (sessionId ? ' trained' : '') +
                (isToday ? ' today' : '')
              }
              disabled={!sessionId}
              onClick={() => sessionId && onPickDay(sessionId)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
