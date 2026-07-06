import { useMemo, useState } from 'react';
import type { Exercise, WorkoutSession } from '../types';

interface Props {
  sessions: WorkoutSession[];
  exercises: Exercise[];
}

interface DataPoint {
  date: string;
  maxWeight: number;
  volume: number;
}

export function ProgressView({ sessions, exercises }: Props) {
  const exercisesWithData = exercises.filter((e) =>
    sessions.some((s) => s.exercises.some((entry) => entry.exerciseId === e.id)),
  );
  const [selectedId, setSelectedId] = useState(exercisesWithData[0]?.id ?? '');

  const points: DataPoint[] = useMemo(() => {
    if (!selectedId) return [];
    return sessions
      .filter((s) => s.exercises.some((e) => e.exerciseId === selectedId))
      .map((s) => {
        const entry = s.exercises.find((e) => e.exerciseId === selectedId)!;
        const maxWeight = Math.max(...entry.sets.map((set) => set.weight));
        const volume = entry.sets.reduce((sum, set) => sum + set.reps * set.weight, 0);
        return { date: s.date, maxWeight, volume };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [sessions, selectedId]);

  const maxOfMax = Math.max(1, ...points.map((p) => p.maxWeight));

  if (exercisesWithData.length === 0) {
    return (
      <div className="view">
        <p className="empty">Log a few workouts to see your progress here.</p>
      </div>
    );
  }

  return (
    <div className="view">
      <div className="row">
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          {exercisesWithData.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>

      {points.length > 0 && (
        <>
          <div className="chart">
            {points.map((p) => (
              <div className="chart-bar-wrap" key={p.date} title={`${p.date}: ${p.maxWeight} kg`}>
                <div
                  className="chart-bar"
                  style={{ height: `${(p.maxWeight / maxOfMax) * 100}%` }}
                />
                <span className="chart-label">{p.date.slice(5)}</span>
              </div>
            ))}
          </div>

          <table className="sets-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Best set (kg)</th>
                <th>Volume (kg)</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.date}>
                  <td>{p.date}</td>
                  <td>{p.maxWeight}</td>
                  <td>{p.volume}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
