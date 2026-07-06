import { useState } from 'react';
import type { Exercise, LoggedExercise, SetEntry, WorkoutSession } from '../types';
import { newId } from '../id';

interface Props {
  exercises: Exercise[];
  onSaveSession: (session: WorkoutSession) => void;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function LogWorkoutView({ exercises, onSaveSession }: Props) {
  const [date, setDate] = useState(todayISO());
  const [draft, setDraft] = useState<LoggedExercise[]>([]);
  const [pickerExerciseId, setPickerExerciseId] = useState('');
  const [repsInput, setRepsInput] = useState<Record<string, string>>({});
  const [weightInput, setWeightInput] = useState<Record<string, string>>({});

  const exerciseName = (id: string) =>
    exercises.find((e) => e.id === id)?.name ?? 'Unknown exercise';

  const availableToAdd = exercises.filter(
    (e) => !draft.some((d) => d.exerciseId === e.id),
  );

  function addExerciseToDraft() {
    if (!pickerExerciseId) return;
    setDraft((prev) => [...prev, { exerciseId: pickerExerciseId, sets: [] }]);
    setPickerExerciseId('');
  }

  function removeExerciseFromDraft(exerciseId: string) {
    setDraft((prev) => prev.filter((d) => d.exerciseId !== exerciseId));
  }

  function addSet(exerciseId: string) {
    const reps = Number(repsInput[exerciseId]);
    const weight = Number(weightInput[exerciseId]);
    if (!reps || reps <= 0) return;
    const entry: SetEntry = { reps, weight: Number.isFinite(weight) ? weight : 0 };
    setDraft((prev) =>
      prev.map((d) =>
        d.exerciseId === exerciseId ? { ...d, sets: [...d.sets, entry] } : d,
      ),
    );
    setRepsInput((prev) => ({ ...prev, [exerciseId]: '' }));
    setWeightInput((prev) => ({ ...prev, [exerciseId]: '' }));
  }

  function removeSet(exerciseId: string, setIndex: number) {
    setDraft((prev) =>
      prev.map((d) =>
        d.exerciseId === exerciseId
          ? { ...d, sets: d.sets.filter((_, i) => i !== setIndex) }
          : d,
      ),
    );
  }

  function saveWorkout() {
    const withSets = draft.filter((d) => d.sets.length > 0);
    if (withSets.length === 0) return;
    onSaveSession({ id: newId(), date, exercises: withSets });
    setDraft([]);
  }

  return (
    <div className="view">
      <div className="row">
        <label className="field">
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>

      <div className="row">
        <select
          value={pickerExerciseId}
          onChange={(e) => setPickerExerciseId(e.target.value)}
          disabled={availableToAdd.length === 0}
        >
          <option value="">Add exercise…</option>
          {availableToAdd.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        <button onClick={addExerciseToDraft} disabled={!pickerExerciseId}>
          Add
        </button>
      </div>

      {draft.length === 0 && (
        <p className="empty">No exercises added yet. Pick one above to start logging.</p>
      )}

      {draft.map((entry) => (
        <div className="card" key={entry.exerciseId}>
          <div className="card-header">
            <h3>{exerciseName(entry.exerciseId)}</h3>
            <button className="ghost" onClick={() => removeExerciseFromDraft(entry.exerciseId)}>
              Remove
            </button>
          </div>

          {entry.sets.length > 0 && (
            <table className="sets-table">
              <thead>
                <tr>
                  <th>Set</th>
                  <th>Reps</th>
                  <th>Weight (kg)</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {entry.sets.map((s, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{s.reps}</td>
                    <td>{s.weight}</td>
                    <td>
                      <button className="ghost" onClick={() => removeSet(entry.exerciseId, i)}>
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="row set-input-row">
            <input
              type="number"
              placeholder="Reps"
              value={repsInput[entry.exerciseId] ?? ''}
              onChange={(e) =>
                setRepsInput((prev) => ({ ...prev, [entry.exerciseId]: e.target.value }))
              }
            />
            <input
              type="number"
              placeholder="Weight (kg)"
              value={weightInput[entry.exerciseId] ?? ''}
              onChange={(e) =>
                setWeightInput((prev) => ({ ...prev, [entry.exerciseId]: e.target.value }))
              }
            />
            <button onClick={() => addSet(entry.exerciseId)}>Add set</button>
          </div>
        </div>
      ))}

      {draft.some((d) => d.sets.length > 0) && (
        <button className="primary" onClick={saveWorkout}>
          Save workout
        </button>
      )}
    </div>
  );
}
