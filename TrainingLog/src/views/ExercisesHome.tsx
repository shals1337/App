import { useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import { formatWeight } from '../lib/format';
import { progression } from '../lib/progression';
import { buildInsights, weekInsights, type Insight } from '../lib/insights';
import { poseFor } from '../data/exercises';
import { groupColor } from '../lib/muscleColors';
import { ExercisePicker } from '../components/ExercisePicker';
import { DeltaChip } from '../components/DeltaChip';
import { ExercisePoseIcon } from '../components/ExercisePoseIcon';
import { WeekSummary } from '../components/WeekSummary';
import {
  ChartIcon,
  CheckIcon,
  ChevronRightIcon,
  FlameIcon,
  GearIcon,
  PlusIcon,
  TargetIcon,
  TrophyIcon,
} from '../components/Icons';
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

function InsightCard({ insight, onOpen }: { insight: Insight; onOpen: (id: string) => void }) {
  const icon =
    insight.kind === 'pr' ? (
      <TrophyIcon size={18} />
    ) : insight.kind === 'streak' ? (
      <FlameIcon size={18} />
    ) : insight.kind === 'gain' ? (
      <ChartIcon size={18} />
    ) : insight.kind === 'goalReached' ? (
      <CheckIcon size={18} />
    ) : (
      <TargetIcon size={18} />
    );
  const clickable = !!insight.exerciseId;
  return (
    <button
      className={`insight-card kind-${insight.kind}`}
      disabled={!clickable}
      onClick={() => insight.exerciseId && onOpen(insight.exerciseId)}
    >
      <span className="insight-icon">{icon}</span>
      <div className="insight-text">
        <span className="insight-title">{insight.title}</span>
        <span className="insight-sub">{insight.sub}</span>
      </div>
      {clickable && <ChevronRightIcon size={17} />}
    </button>
  );
}

export function ExercisesHome({ onOpenExercise }: Props) {
  const { tracked, logs, logsFor, exerciseById, exerciseGoals } = useApp();
  const [showPicker, setShowPicker] = useState(false);
  const [showBackup, setShowBackup] = useState(false);

  const rows = useMemo(() => {
    return tracked
      .map((id) => {
        const exercise = exerciseById(id);
        const logsForEx = logsFor(id);
        const best = logsForEx.reduce((m, l) => Math.max(m, l.weight), 0);
        let cardio: string | null = null;
        let lastDate = '';
        if (exercise?.kind === 'cardio') {
          const withDur = logsForEx.filter((l) => (l.durationMin ?? 0) > 0);
          const last = withDur[withDur.length - 1];
          if (last) {
            cardio = `${`${Math.round((last.durationMin ?? 0) * 10) / 10}`.replace('.', ',')} min`;
            lastDate = last.date;
          }
        } else {
          lastDate = progression(logsForEx)?.lastDate ?? '';
        }
        return { id, exercise, prog: progression(logsForEx), best, cardio, lastDate };
      })
      .filter((r) => r.exercise)
      .sort((a, b) => b.lastDate.localeCompare(a.lastDate));
  }, [tracked, logsFor, exerciseById]);

  const insights = useMemo(() => weekInsights(logs), [logs]);
  const cards = useMemo(
    () => buildInsights(logs, exerciseById, exerciseGoals, insights.streakWeeks),
    [logs, exerciseById, exerciseGoals, insights.streakWeeks],
  );
  const records = useMemo(
    () =>
      rows
        .filter((r) => r.best > 0)
        .sort((a, b) => b.best - a.best)
        .slice(0, 5),
    [rows],
  );
  const hasData = logs.length > 0;

  return (
    <div className="view">
      <header className="page-header">
        <div>
          <p className="eyebrow">{greeting()}</p>
          <h1>Min træning</h1>
        </div>
        <button className="icon-btn" onClick={() => setShowBackup(true)} aria-label="Konto & backup">
          <GearIcon size={20} />
        </button>
      </header>

      {hasData && <WeekSummary insights={insights} />}

      {cards.length > 0 && (
        <section>
          <h2 className="section-title">Indsigter</h2>
          <div className="insight-list">
            {cards.map((c) => (
              <InsightCard key={c.id} insight={c} onOpen={onOpenExercise} />
            ))}
          </div>
        </section>
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
                  <span className="muted small">
                    {r.exercise!.muscleGroup}
                    {exerciseGoals[r.id] ? ` · mål ${formatWeight(exerciseGoals[r.id])} kg` : ''}
                  </span>
                </div>
                <div className="list-row-end">
                  {r.exercise!.kind === 'cardio' ? (
                    r.cardio ? (
                      <span className="row-weight">{r.cardio}</span>
                    ) : (
                      <span className="muted small">ikke logget</span>
                    )
                  ) : r.prog ? (
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

      {records.length >= 2 && (
        <section>
          <h2 className="section-title">Rekorder</h2>
          <div className="card records-card">
            {records.map((r, i) => (
              <button
                className="record-row row-btn"
                key={r.id}
                onClick={() => onOpenExercise(r.id)}
              >
                <span className={`record-rank rank-${i}`}>{i + 1}</span>
                <span className="record-name">{r.exercise!.name}</span>
                <span className="record-best mono">{formatWeight(r.best)} kg</span>
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
