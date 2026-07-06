import { useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import { MUSCLE_GROUPS } from '../data/exercises';
import type { Exercise, MuscleGroup } from '../types';
import { recordsFor } from '../lib/stats';
import { formatDate, formatWeight } from '../lib/format';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
  XIcon,
} from '../components/Icons';
import { newId } from '../id';

export function ExercisesView() {
  const { exercises } = useApp();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<MuscleGroup | 'All'>('All');
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const open = exercises.find((e) => e.id === openId);
  if (open) return <ExerciseDetail exercise={open} onBack={() => setOpenId(null)} />;

  const q = query.trim().toLowerCase();
  const filtered = exercises.filter(
    (e) =>
      (group === 'All' || e.muscleGroup === group) &&
      (q === '' || e.name.toLowerCase().includes(q)),
  );

  return (
    <div className="view">
      <header className="page-header">
        <h1>Exercises</h1>
        <button className="text-btn" onClick={() => setAdding(true)}>
          <PlusIcon size={15} /> New
        </button>
      </header>

      <div className="search-box">
        <SearchIcon size={17} />
        <input
          type="search"
          placeholder="Search exercises"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="chip-row">
        {(['All', ...MUSCLE_GROUPS] as const).map((g) => (
          <button
            key={g}
            className={g === group ? 'chip active' : 'chip'}
            onClick={() => setGroup(g)}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="card">
        {filtered.length === 0 && <p className="empty">No exercises match.</p>}
        {filtered.map((e) => (
          <button className="list-row row-btn" key={e.id} onClick={() => setOpenId(e.id)}>
            <div className="list-row-main">
              <span>
                {e.name}
                {e.custom && <span className="custom-badge">custom</span>}
              </span>
              <span className="muted small">{e.muscleGroup}</span>
            </div>
            <ChevronRightIcon size={16} />
          </button>
        ))}
      </div>

      {adding && <AddExerciseSheet onClose={() => setAdding(false)} />}
    </div>
  );
}

function AddExerciseSheet({ onClose }: { onClose: () => void }) {
  const { addCustomExercise } = useApp();
  const [name, setName] = useState('');
  const [group, setGroup] = useState<MuscleGroup>('Chest');

  function save() {
    const trimmed = name.trim();
    if (!trimmed) return;
    addCustomExercise({ id: newId(), name: trimmed, muscleGroup: group, custom: true });
    onClose();
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h2>New exercise</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <XIcon size={20} />
          </button>
        </div>
        <input
          className="text-input"
          placeholder="Exercise name"
          value={name}
          autoFocus
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
        />
        <div className="chip-row">
          {MUSCLE_GROUPS.map((g) => (
            <button
              key={g}
              className={g === group ? 'chip active' : 'chip'}
              onClick={() => setGroup(g)}
            >
              {g}
            </button>
          ))}
        </div>
        <button className="cta slim" disabled={!name.trim()} onClick={save}>
          Add exercise
        </button>
      </div>
    </div>
  );
}

function ExerciseDetail({
  exercise,
  onBack,
}: {
  exercise: Exercise;
  onBack: () => void;
}) {
  const { sessions, deleteCustomExercise, renameCustomExercise } = useApp();
  const [confirm, setConfirm] = useState(false);
  const rec = recordsFor(sessions, exercise.id);

  const history = useMemo(
    () =>
      [...sessions]
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
        .map((s) => ({
          session: s,
          logged: s.exercises.find((e) => e.exerciseId === exercise.id),
        }))
        .filter((x) => x.logged && x.logged.sets.some((s) => s.completed))
        .slice(0, 10),
    [sessions, exercise.id],
  );

  return (
    <div className="view">
      <header className="page-header detail">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          <ChevronLeftIcon size={20} />
        </button>
        <div className="detail-title">
          <h1>{exercise.name}</h1>
          <span className="muted small">{exercise.muscleGroup}</span>
        </div>
        {exercise.custom && (
          <button className="icon-btn subtle" onClick={() => setConfirm(true)} aria-label="Delete exercise">
            <TrashIcon size={18} />
          </button>
        )}
      </header>

      <div className="stat-grid">
        <div className="stat-tile">
          <span className="stat-value">
            {rec.bestWeight > 0 ? `${formatWeight(rec.bestWeight)}` : '—'}
          </span>
          <span className="stat-label">best weight (kg)</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">
            {rec.bestEst1RM > 0 ? `${formatWeight(rec.bestEst1RM)}` : '—'}
          </span>
          <span className="stat-label">est. 1RM (kg)</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{rec.sessionCount}</span>
          <span className="stat-label">sessions</span>
        </div>
      </div>

      <section>
        <h2 className="section-title">Recent sessions</h2>
        {history.length === 0 ? (
          <div className="card">
            <p className="empty">No sets logged for this exercise yet.</p>
          </div>
        ) : (
          history.map(({ session, logged }) => (
            <div className="card" key={session.id}>
              <div className="card-header">
                <h3 className="small-title">{formatDate(session.startedAt)}</h3>
              </div>
              <div className="detail-sets">
                {logged!.sets
                  .filter((s) => s.completed)
                  .map((s, i) => (
                    <div className="detail-set" key={i}>
                      <span className="muted">{i + 1}</span>
                      <span>
                        {formatWeight(s.weight)} kg × {s.reps}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </section>

      {exercise.custom && (
        <button
          className="ghost-btn"
          onClick={() => {
            const name = prompt('Rename exercise', exercise.name);
            if (name?.trim()) renameCustomExercise(exercise.id, name.trim());
          }}
        >
          Rename
        </button>
      )}

      {confirm && (
        <div className="sheet-backdrop" onClick={() => setConfirm(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h2>Delete exercise?</h2>
            <p className="muted">
              Logged workouts keep their history, but the exercise disappears from the
              library.
            </p>
            <div className="dialog-actions">
              <button className="ghost-btn" onClick={() => setConfirm(false)}>
                Cancel
              </button>
              <button
                className="danger-btn"
                onClick={() => {
                  deleteCustomExercise(exercise.id);
                  onBack();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
