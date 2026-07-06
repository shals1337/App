import { useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import type { MuscleGroup } from '../types';
import { est1RM } from '../lib/stats';
import { formatWeight, todayISODate } from '../lib/format';
import { LineChart, type ChartPoint } from '../components/LineChart';
import { ScaleIcon, TrashIcon } from '../components/Icons';

type Metric = '1rm' | 'volume' | 'weight';

const METRICS: { id: Metric; label: string }[] = [
  { id: '1rm', label: 'Est. 1RM' },
  { id: 'weight', label: 'Best set' },
  { id: 'volume', label: 'Volume' },
];

function shortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function ProgressView() {
  const { sessions, exercises, bodyWeight, addBodyWeight, deleteBodyWeight } = useApp();
  const [metric, setMetric] = useState<Metric>('1rm');
  const [weightInput, setWeightInput] = useState('');
  const [showAllWeights, setShowAllWeights] = useState(false);

  const trained = useMemo(() => {
    const ids = new Set<string>();
    for (const s of sessions)
      for (const e of s.exercises)
        if (e.sets.some((x) => x.completed)) ids.add(e.exerciseId);
    return exercises.filter((e) => ids.has(e.id));
  }, [sessions, exercises]);

  const [selectedId, setSelectedId] = useState<string>('');
  const effectiveId = trained.some((e) => e.id === selectedId)
    ? selectedId
    : (trained[0]?.id ?? '');

  const points: ChartPoint[] = useMemo(() => {
    if (!effectiveId) return [];
    return [...sessions]
      .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
      .map((s) => {
        const logged = s.exercises.find((e) => e.exerciseId === effectiveId);
        const done = logged?.sets.filter((x) => x.completed) ?? [];
        if (done.length === 0) return null;
        let value: number;
        if (metric === '1rm')
          value = Math.max(...done.map((x) => est1RM(x.weight, x.reps)));
        else if (metric === 'weight') value = Math.max(...done.map((x) => x.weight));
        else value = done.reduce((sum, x) => sum + x.weight * x.reps, 0);
        return { label: shortDate(s.startedAt), value };
      })
      .filter((p): p is ChartPoint => p !== null);
  }, [sessions, effectiveId, metric]);

  const weightPoints: ChartPoint[] = useMemo(
    () =>
      [...bodyWeight]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((e) => ({ label: shortDate(e.date), value: e.weight })),
    [bodyWeight],
  );

  const sortedWeights = useMemo(
    () => [...bodyWeight].sort((a, b) => b.date.localeCompare(a.date)),
    [bodyWeight],
  );

  /* completed sets per muscle group, last 30 days */
  const muscleSplit = useMemo(() => {
    const cutoff = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const counts = new Map<MuscleGroup, number>();
    for (const s of sessions) {
      if (s.startedAt < cutoff) continue;
      for (const logged of s.exercises) {
        const done = logged.sets.filter((x) => x.completed).length;
        if (done === 0) continue;
        const group =
          exercises.find((e) => e.id === logged.exerciseId)?.muscleGroup ?? 'Other';
        counts.set(group, (counts.get(group) ?? 0) + done);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [sessions, exercises]);

  const maxSplit = Math.max(1, ...muscleSplit.map(([, n]) => n));

  function logWeight() {
    const v = Number(weightInput);
    if (!v || v <= 0) return;
    addBodyWeight({ date: todayISODate(), weight: v });
    setWeightInput('');
  }

  return (
    <div className="view">
      <header className="page-header">
        <h1>Progress</h1>
      </header>

      {trained.length === 0 ? (
        <div className="card">
          <p className="empty">Complete a few workouts to see progress charts here.</p>
        </div>
      ) : (
        <section>
          <div className="row">
            <select
              value={effectiveId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="select"
            >
              {trained.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <div className="chip-row">
            {METRICS.map((m) => (
              <button
                key={m.id}
                className={m.id === metric ? 'chip active' : 'chip'}
                onClick={() => setMetric(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="card chart-card">
            <h3 className="small-title">
              {METRICS.find((m) => m.id === metric)?.label} (kg)
            </h3>
            {points.length > 0 ? (
              <LineChart points={points} unit="kg" />
            ) : (
              <p className="empty">No data for this exercise yet.</p>
            )}
          </div>
        </section>
      )}

      {muscleSplit.length > 0 && (
        <section>
          <h2 className="section-title">Muscle split · last 30 days</h2>
          <div className="card">
            {muscleSplit.map(([group, count]) => (
              <div className="split-row" key={group}>
                <span className="split-name">{group}</span>
                <div className="split-track">
                  <div
                    className="split-bar"
                    style={{ width: `${(count / maxSplit) * 100}%` }}
                  />
                </div>
                <span className="split-count mono">{count}</span>
              </div>
            ))}
            <p className="muted small split-note">completed sets per muscle group</p>
          </div>
        </section>
      )}

      <section>
        <div className="section-head">
          <h2 className="section-title">
            <ScaleIcon size={16} /> Body weight
          </h2>
        </div>

        <div className="card">
          <div className="row weight-log-row">
            <input
              type="number"
              inputMode="decimal"
              placeholder="Today's weight (kg)"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && logWeight()}
            />
            <button className="secondary-btn" onClick={logWeight} disabled={!Number(weightInput)}>
              Log
            </button>
          </div>

          {weightPoints.length > 1 && <LineChart points={weightPoints} unit="kg" height={150} />}

          {sortedWeights.length > 0 && (
            <div className="weight-list">
              {(showAllWeights ? sortedWeights : sortedWeights.slice(0, 5)).map((e) => (
                <div className="list-row" key={e.date}>
                  <div className="list-row-main">
                    <span>{formatWeight(e.weight)} kg</span>
                    <span className="muted small">{shortDate(e.date)}</span>
                  </div>
                  <button
                    className="icon-btn subtle"
                    onClick={() => deleteBodyWeight(e.date)}
                    aria-label="Delete entry"
                  >
                    <TrashIcon size={15} />
                  </button>
                </div>
              ))}
              {sortedWeights.length > 5 && (
                <button
                  className="text-btn"
                  onClick={() => setShowAllWeights(!showAllWeights)}
                >
                  {showAllWeights ? 'Show fewer' : `Show all ${sortedWeights.length}`}
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
