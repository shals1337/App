import { useState } from 'react';
import type { Exercise } from '../types';
import { newId } from '../id';

interface Props {
  exercises: Exercise[];
  onChange: (exercises: Exercise[]) => void;
}

export function ExercisesView({ exercises, onChange }: Props) {
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  function addExercise() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onChange([...exercises, { id: newId(), name: trimmed }]);
    setName('');
  }

  function startEdit(exercise: Exercise) {
    setEditingId(exercise.id);
    setEditingName(exercise.name);
  }

  function commitEdit() {
    const trimmed = editingName.trim();
    if (trimmed && editingId) {
      onChange(exercises.map((e) => (e.id === editingId ? { ...e, name: trimmed } : e)));
    }
    setEditingId(null);
  }

  function removeExercise(id: string) {
    onChange(exercises.filter((e) => e.id !== id));
  }

  return (
    <div className="view">
      <div className="row">
        <input
          type="text"
          placeholder="New exercise name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addExercise()}
        />
        <button onClick={addExercise} disabled={!name.trim()}>
          Add
        </button>
      </div>

      <div className="card">
        {exercises.length === 0 && <p className="empty">No exercises yet.</p>}
        {exercises.map((exercise) => (
          <div className="list-row" key={exercise.id}>
            {editingId === exercise.id ? (
              <input
                type="text"
                value={editingName}
                autoFocus
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && commitEdit()}
                onBlur={commitEdit}
              />
            ) : (
              <span onClick={() => startEdit(exercise)} className="clickable">
                {exercise.name}
              </span>
            )}
            <button className="ghost danger" onClick={() => removeExercise(exercise.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
