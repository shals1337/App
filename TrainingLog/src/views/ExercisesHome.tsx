import { useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import { formatWeight } from '../lib/format';
import { progression } from '../lib/progression';
import { ExercisePicker } from '../components/ExercisePicker';
import { DeltaChip } from '../components/DeltaChip';
import { GearIcon, PlusIcon } from '../components/Icons';
import { BackupSheet } from '../components/BackupSheet';

interface Props {
  onOpenExercise: (id: string) => void;
}

export function ExercisesHome({ onOpenExercise }: Props) {
  const { tracked, logsFor, exerciseById } = useApp();
  const [showPicker, setShowPicker] = useState(false);
  const [showBackup, setShowBackup] = useState(false);

  const rows = useMemo(() => {
    return tracked
      .map((id) => {
        const logs = logsFor(id);
        return { id, exercise: exerciseById(id), ...progression(logs) };
      })
      .filter((r) => r.exercise)
      .sort((a, b) => (b.last?.date ?? '').localeCompare(a.last?.date ?? ''));
  }, [tracked, logsFor, exerciseById]);

  return (
    <div className="view">
      <header className="page-header">
        <div>
          <p className="eyebrow">Mine maskiner & øvelser</p>
          <h1>Min træning</h1>
        </div>
        <button className="icon-btn" onClick={() => setShowBackup(true)} aria-label="Backup">
          <GearIcon size={20} />
        </button>
      </header>

      <button className="cta" onClick={() => setShowPicker(true)}>
        <PlusIcon size={18} /> Tilføj øvelse
      </button>

      {rows.length === 0 ? (
        <div className="card">
          <p className="empty">
            Tilføj de maskiner og øvelser du bruger — fx Leg Press, Ab Crunch eller
            Dumbbell Curl. Så kan du logge din vægt og følge hvor meget du går op.
          </p>
        </div>
      ) : (
        <div className="card">
          {rows.map((r) => (
            <button
              className="list-row row-btn exercise-row"
              key={r.id}
              onClick={() => onOpenExercise(r.id)}
            >
              <div className="list-row-main">
                <span>{r.exercise!.name}</span>
                <span className="muted small">{r.exercise!.muscleGroup}</span>
              </div>
              <div className="list-row-end">
                {r.last ? (
                  <>
                    <span className="row-weight">{formatWeight(r.last.weight)} kg</span>
                    <DeltaChip delta={r.delta} />
                  </>
                ) : (
                  <span className="muted small">ikke logget endnu</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {showPicker && (
        <ExercisePicker
          excludeIds={tracked}
          onPick={(id) => {
            setShowPicker(false);
            onOpenExercise(id);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}

      {showBackup && <BackupSheet onClose={() => setShowBackup(false)} />}
    </div>
  );
}
