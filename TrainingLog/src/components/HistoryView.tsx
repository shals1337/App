import { useState } from 'react';
import type { Exercise, WorkoutSession } from '../types';

interface Props {
  sessions: WorkoutSession[];
  exercises: Exercise[];
  onDeleteSession: (id: string) => void;
}

export function HistoryView({ sessions, exercises, onDeleteSession }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const exerciseName = (id: string) =>
    exercises.find((e) => e.id === id)?.name ?? 'Unknown exercise';

  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) {
    return (
      <div className="view">
        <p className="empty">No workouts logged yet. Head to the Log tab to start.</p>
      </div>
    );
  }

  return (
    <div className="view">
      {sorted.map((session) => {
        const isOpen = expandedId === session.id;
        const totalSets = session.exercises.reduce((sum, e) => sum + e.sets.length, 0);
        return (
          <div className="card" key={session.id}>
            <div
              className="card-header clickable"
              onClick={() => setExpandedId(isOpen ? null : session.id)}
            >
              <h3>{session.date}</h3>
              <span className="muted">
                {session.exercises.length} exercise{session.exercises.length === 1 ? '' : 's'} ·{' '}
                {totalSets} set{totalSets === 1 ? '' : 's'}
              </span>
            </div>

            {isOpen && (
              <>
                {session.exercises.map((entry) => (
                  <div key={entry.exerciseId} className="history-exercise">
                    <strong>{exerciseName(entry.exerciseId)}</strong>
                    <ul>
                      {entry.sets.map((s, i) => (
                        <li key={i}>
                          {s.reps} reps @ {s.weight} kg
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <button className="ghost danger" onClick={() => onDeleteSession(session.id)}>
                  Delete workout
                </button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
