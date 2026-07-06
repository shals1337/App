import { useState } from 'react';
import { useApp } from '../state/AppContext';
import type { Template } from '../types';
import { ExercisePicker } from '../components/ExercisePicker';
import { PlusIcon, TrashIcon, XIcon } from '../components/Icons';
import { newId } from '../id';

interface Props {
  onBegin: () => void;
}

export function StartWorkoutView({ onBegin }: Props) {
  const { templates, setTemplates, exerciseById, setActive, active } = useApp();
  const [editing, setEditing] = useState<Template | null>(null);

  function startEmpty() {
    if (!active) {
      setActive({
        name: 'Workout',
        startedAt: new Date().toISOString(),
        exercises: [],
      });
    }
    onBegin();
  }

  function startFromTemplate(t: Template) {
    if (!active) {
      setActive({
        name: t.name,
        startedAt: new Date().toISOString(),
        fromTemplateId: t.id,
        exercises: t.exercises.map((e) => ({
          exerciseId: e.exerciseId,
          sets: Array.from({ length: e.targetSets }, () => ({
            weight: 0,
            reps: 0,
            completed: false,
          })),
        })),
      });
    }
    onBegin();
  }

  function saveTemplate(t: Template) {
    const exists = templates.some((x) => x.id === t.id);
    setTemplates(exists ? templates.map((x) => (x.id === t.id ? t : x)) : [...templates, t]);
    setEditing(null);
  }

  function deleteTemplate(id: string) {
    setTemplates(templates.filter((t) => t.id !== id));
    setEditing(null);
  }

  return (
    <div className="view">
      <header className="page-header">
        <h1>Workout</h1>
      </header>

      {active && (
        <button className="cta" onClick={onBegin}>
          Resume workout in progress
        </button>
      )}

      {!active && (
        <button className="cta" onClick={startEmpty}>
          Start empty workout
        </button>
      )}

      <section>
        <div className="section-head">
          <h2 className="section-title">Templates</h2>
          <button
            className="text-btn"
            onClick={() =>
              setEditing({ id: newId(), name: '', exercises: [] })
            }
          >
            <PlusIcon size={15} /> New
          </button>
        </div>

        {templates.length === 0 && (
          <div className="card">
            <p className="empty">No templates yet. Create one to reuse a routine.</p>
          </div>
        )}

        {templates.map((t) => (
          <div className="card template-card" key={t.id}>
            <div className="card-header">
              <h3>{t.name}</h3>
              <button className="text-btn" onClick={() => setEditing(t)}>
                Edit
              </button>
            </div>
            <p className="muted small template-exercises">
              {t.exercises
                .map((e) => exerciseById(e.exerciseId)?.name ?? '?')
                .join(' · ')}
            </p>
            <button
              className="secondary-btn"
              onClick={() => startFromTemplate(t)}
              disabled={!!active}
            >
              Start
            </button>
          </div>
        ))}
      </section>

      {editing && (
        <TemplateEditor
          template={editing}
          onSave={saveTemplate}
          onDelete={deleteTemplate}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function TemplateEditor({
  template,
  onSave,
  onDelete,
  onClose,
}: {
  template: Template;
  onSave: (t: Template) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const { exerciseById, templates } = useApp();
  const [draft, setDraft] = useState<Template>(template);
  const [showPicker, setShowPicker] = useState(false);
  const isNew = !templates.some((t) => t.id === template.id);

  function setSets(idx: number, raw: string) {
    const v = Math.max(1, Math.min(12, Number(raw) || 1));
    setDraft({
      ...draft,
      exercises: draft.exercises.map((e, i) =>
        i === idx ? { ...e, targetSets: v } : e,
      ),
    });
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h2>{isNew ? 'New template' : 'Edit template'}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <XIcon size={20} />
          </button>
        </div>

        <input
          className="text-input"
          placeholder="Template name"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />

        <div className="sheet-list">
          {draft.exercises.map((e, i) => (
            <div className="list-row" key={`${e.exerciseId}-${i}`}>
              <div className="list-row-main">
                <span>{exerciseById(e.exerciseId)?.name ?? '?'}</span>
              </div>
              <label className="sets-input">
                <input
                  type="number"
                  inputMode="numeric"
                  value={e.targetSets}
                  onChange={(ev) => setSets(i, ev.target.value)}
                />
                <span className="muted small">sets</span>
              </label>
              <button
                className="icon-btn subtle"
                onClick={() =>
                  setDraft({
                    ...draft,
                    exercises: draft.exercises.filter((_, j) => j !== i),
                  })
                }
                aria-label="Remove"
              >
                <XIcon size={16} />
              </button>
            </div>
          ))}
          <button className="ghost-btn" onClick={() => setShowPicker(true)}>
            <PlusIcon size={15} /> Add exercise
          </button>
        </div>

        <div className="dialog-actions">
          {!isNew && (
            <button className="danger-btn" onClick={() => onDelete(draft.id)}>
              <TrashIcon size={16} /> Delete
            </button>
          )}
          <button
            className="cta slim"
            disabled={!draft.name.trim() || draft.exercises.length === 0}
            onClick={() => onSave({ ...draft, name: draft.name.trim() })}
          >
            Save template
          </button>
        </div>

        {showPicker && (
          <ExercisePicker
            excludeIds={draft.exercises.map((e) => e.exerciseId)}
            onPick={(id) => {
              setDraft({
                ...draft,
                exercises: [...draft.exercises, { exerciseId: id, targetSets: 3 }],
              });
              setShowPicker(false);
            }}
            onClose={() => setShowPicker(false)}
          />
        )}
      </div>
    </div>
  );
}
