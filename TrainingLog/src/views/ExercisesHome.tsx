import { useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import { formatWeight } from '../lib/format';
import { progression } from '../lib/progression';
import { latestPR, weekInsights } from '../lib/insights';
import { poseFor } from '../data/exercises';
import { groupColor } from '../lib/muscleColors';
import { ExercisePicker } from '../components/ExercisePicker';
import { DeltaChip } from '../components/DeltaChip';
import { ExercisePoseIcon } from '../components/ExercisePoseIcon';
import { WeekSummary } from '../components/WeekSummary';
import { ChevronRightIcon, GearIcon, PlusIcon, TrophyIcon } from '../components/Icons';
import { BackupSheet } from '../components/BackupSheet';

interface Props {
  onOpenExercise: (id: string) => void;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 10) return 'Godmorgen';
  if (h < 17) return 'God eftermiddag';
  return 'God aften';
}

export function ExercisesHome({ onOpenExercise }: Props) {
  const { tracked, logs, logsFor, exerciseById } = useApp();
  const [showPicker, setShowPicker] = useState(false);
  const [showBackup, setShowBackup] = useState(false);

  const rows = useMemo(() => {
    return tracked
      .map((id) => {
        const logsForEx = logsFor(id);
        return { id, exercise: exerciseById(id), prog: progression(logsForEx) };
      })
      .filter((r) => r.exercise)
      .sort((a, b) => (b.prog?.lastDate ?? '').localeCompare(a.prog?.lastDate ?? ''));
  }, [tracked, logsFor, exerciseById]);

  const insights = useMemo(() => weekInsights(logs), [logs]);
  const pr = useMemo(() => latestPR(logs, exerciseById), [logs, exerciseById]);
  const hasData = logs.length > 0;

  return (
    <div className="view">
      <header className="page-header">
        <div>
          <p className="eyebrow">{greeting()}</p>
          <h1>Min træning</h1>
        </div>
        <button className="icon-btn" onClick={() => setShowBackup(true)} aria-label="Backup">
          <GearIcon size={20} />
        </button>
      </header>

      {hasData && <WeekSummary insights={insights} />}

      {pr && (
        <button className="pr-banner" onClick={() => onOpenExercise(pr.exercise.id)}>
          <span className="pr-banner-icon">
            <TrophyIcon size={18} />
          </span>
          <div className="pr-banner-text">
            <span className="pr-banner-title">Ny rekord</span>
            <span className="pr-banner-sub">
              {pr.exercise.name} · {formatWeight(pr.weight)} kg
            </span>
          </div>
          <ChevronRightIcon size={18} />
        </button>
      )}

      <button className="cta" onClick={() => setShowPicker(true)}>
        <PlusIcon size={18} /> Tilføj øvelse
      </button>

      {rows.length === 0 ? (
        <div className="card empty-card">
          <div className="empty-mark">
            <PlusIcon size={26} />
          </div>
          <p className="empty">
            Tilføj de maskiner og øvelser du bruger — fx Benpres, Mavebøjninger eller
            Bicep Curl. Så kan du logge din vægt og følge hvor meget du går op.
          </p>
        </div>
      ) : (
        <section>
          <h2 className="section-title">Mine øvelser</h2>
          <div className="exercise-list">
            {rows.map((r) => (
              <button
                className="exercise-card-row row-btn"
                key={r.id}
                style={{ ['--mg' as string]: groupColor(r.exercise!.muscleGroup) }}
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
                    <span className="muted small">ikke logget</span>
                  )}
                </div>
                <ChevronRightIcon size={17} />
              </button>
            ))}
          </div>
        </section>
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
