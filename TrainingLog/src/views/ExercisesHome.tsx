import { useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import { formatWeight } from '../lib/format';
import { progression } from '../lib/progression';
import { poseFor } from '../data/exercises';
import { ExercisePicker } from '../components/ExercisePicker';
import { DeltaChip } from '../components/DeltaChip';
import { ExercisePoseIcon } from '../components/ExercisePoseIcon';
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
        return { id, exercise: exerciseById(id), prog: progression(logs) };
      })
      .filter((r) => r.exercise)
      .sort((a, b) => (b.prog?.lastDate ?? '').localeCompare(a.prog?.lastDate ?? ''));
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
            Tilføj de maskiner og øvelser du bruger — fx Benpres, Mavebøjninger eller
            Bicep Curl. Så kan du logge din vægt og følge hvor meget du går op.
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
              <ExercisePoseIcon pose={poseFor(r.exercise!)} group={r.exercise!.muscleGroup} />
              <div className="list-row-main">
                <span>{r.exercise!.name}</span>
                <span className="muted small">{r.exercise!.muscleGroup}</span>
              </div>
              <div className="list-row-end">
                {r.prog ? (
                  <>
                    <span className="row-weight">{formatWeight(r.prog.lastValue)} kg</span>
                    <DeltaChip delta={r.prog.delta} />
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
