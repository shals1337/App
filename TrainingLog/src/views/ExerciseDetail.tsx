import { useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import type { Exercise, LogEntry } from '../types';
import { formatDate, formatWeight, localDateKey, shortDate } from '../lib/format';
import { LineChart, type ChartPoint } from '../components/LineChart';
import { CheckIcon, ChevronLeftIcon, PlusIcon, TrashIcon, XIcon } from '../components/Icons';
import { DeltaChip } from '../components/DeltaChip';
import { ExercisePoseIcon } from '../components/ExercisePoseIcon';
import { poseFor } from '../data/exercises';
import { dailyBests, lastSessionSets, progression } from '../lib/progression';
import { newId } from '../id';

interface Props {
  exercise: Exercise;
  onBack: () => void;
}

interface DraftSet {
  weight: string;
  reps: string;
}

function parseWeight(raw: string): number {
  const v = Number(raw.replace(',', '.'));
  return Number.isFinite(v) && v > 0 ? v : 0;
}

export function ExerciseDetail({ exercise, onBack }: Props) {
  const { logsFor, addLog, deleteLog, untrackExercise } = useApp();
  const logs = logsFor(exercise.id);
  const prog = progression(logs);

  const [sets, setSets] = useState<DraftSet[]>(() => {
    const last = lastSessionSets(logs);
    if (last.length === 0) return [{ weight: '', reps: '' }];
    return last.map((l) => ({
      weight: formatWeight(l.weight),
      reps: l.reps ? String(l.reps) : '',
    }));
  });
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const best = logs.reduce((max, l) => Math.max(max, l.weight), 0);

  const points: ChartPoint[] = useMemo(
    () =>
      dailyBests(logs).map((d) => ({
        label: shortDate(`${d.dateKey}T12:00:00`),
        value: d.value,
      })),
    [logs],
  );
  const totalGain =
    points.length > 1 ? points[points.length - 1].value - points[0].value : null;

  /* history grouped by day, most recent first */
  const days = useMemo(() => {
    const byDay = new Map<string, LogEntry[]>();
    for (const l of logs) {
      const key = localDateKey(l.date);
      const arr = byDay.get(key) ?? [];
      arr.push(l);
      byDay.set(key, arr);
    }
    return [...byDay.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [logs]);

  const validCount = sets.filter((s) => parseWeight(s.weight) > 0).length;

  function updateSet(i: number, field: keyof DraftSet, value: string) {
    setSets((prev) => prev.map((s, j) => (j === i ? { ...s, [field]: value } : s)));
  }

  function addSetRow() {
    setSets((prev) => {
      const last = prev[prev.length - 1];
      return [...prev, { weight: last?.weight ?? '', reps: last?.reps ?? '' }];
    });
  }

  function removeSetRow(i: number) {
    setSets((prev) => (prev.length > 1 ? prev.filter((_, j) => j !== i) : prev));
  }

  function saveSets() {
    if (validCount === 0) return;
    sets.forEach((s, i) => {
      const w = parseWeight(s.weight);
      if (w <= 0) return;
      const r = Number(s.reps);
      addLog({
        id: newId(),
        exerciseId: exercise.id,
        date: new Date(Date.now() + i).toISOString(),
        weight: w,
        reps: r > 0 ? r : undefined,
      });
    });
    setSets([{ weight: '', reps: '' }]);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1600);
  }

  const lastSession = lastSessionSets(logs);

  return (
    <div className="view">
      <header className="page-header detail">
        <button className="icon-btn" onClick={onBack} aria-label="Tilbage">
          <ChevronLeftIcon size={20} />
        </button>
        <ExercisePoseIcon pose={poseFor(exercise)} group={exercise.muscleGroup} size={52} />
        <div className="detail-title">
          <h1>{exercise.name}</h1>
          <span className="muted small">{exercise.muscleGroup}</span>
        </div>
        <button
          className="icon-btn subtle"
          onClick={() => setConfirmRemove(true)}
          aria-label="Fjern øvelse"
        >
          <TrashIcon size={18} />
        </button>
      </header>

      <div className="card log-card">
        <div className="sets-header-row">
          <span>Sæt</span>
          <span>Kg</span>
          <span>Reps</span>
          <span />
        </div>

        {sets.map((s, i) => (
          <div className="set-row" key={i}>
            <span className="set-index">{i + 1}</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={s.weight}
              onChange={(e) => updateSet(i, 'weight', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveSets()}
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder="–"
              value={s.reps}
              onChange={(e) => updateSet(i, 'reps', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveSets()}
            />
            {sets.length > 1 ? (
              <button
                className="set-remove"
                onClick={() => removeSetRow(i)}
                aria-label={`Fjern sæt ${i + 1}`}
              >
                <XIcon size={15} />
              </button>
            ) : (
              <span />
            )}
          </div>
        ))}

        <button className="ghost-btn" onClick={addSetRow}>
          <PlusIcon size={15} /> Tilføj sæt
        </button>

        <button
          className={justSaved ? 'cta saved' : 'cta'}
          onClick={saveSets}
          disabled={validCount === 0}
        >
          {justSaved ? (
            <>
              <CheckIcon size={17} /> Gemt
            </>
          ) : (
            `Gem ${validCount > 1 ? `${validCount} sæt` : 'sæt'}`
          )}
        </button>

        {lastSession.length > 0 && (
          <p className="muted small">
            Sidste gang: {lastSession.length} sæt · bedste{' '}
            {formatWeight(Math.max(...lastSession.map((l) => l.weight)))} kg ·{' '}
            {formatDate(lastSession[0].date)}
          </p>
        )}
      </div>

      <div className="stat-grid">
        <div className="stat-tile">
          <span className="stat-value">{prog ? formatWeight(prog.lastValue) : '—'}</span>
          <span className="stat-label">nuværende kg</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{best > 0 ? formatWeight(best) : '—'}</span>
          <span className="stat-label">bedste kg</span>
        </div>
        <div className="stat-tile">
          <span
            className={
              totalGain === null
                ? 'stat-value'
                : totalGain > 0
                  ? 'stat-value gain'
                  : totalGain < 0
                    ? 'stat-value loss'
                    : 'stat-value'
            }
          >
            {totalGain === null
              ? '—'
              : `${totalGain > 0 ? '+' : ''}${formatWeight(totalGain)}`}
          </span>
          <span className="stat-label">fremgang i alt</span>
        </div>
      </div>

      {points.length > 1 && (
        <div className="card chart-card">
          <div className="card-header">
            <h3 className="small-title">Bedste sæt over tid (kg)</h3>
            <DeltaChip delta={prog?.delta ?? null} />
          </div>
          <LineChart points={points} unit="kg" />
        </div>
      )}

      <section>
        <h2 className="section-title">Historik</h2>
        {days.length === 0 ? (
          <div className="card">
            <p className="empty">
              Log dit første sæt ovenfor — så kan du følge din fremgang her.
            </p>
          </div>
        ) : (
          days.map(([dateKey, entries]) => (
            <div className="card" key={dateKey}>
              <h3 className="small-title">{formatDate(`${dateKey}T12:00:00`)}</h3>
              {entries.map((l, i) => (
                <div className="list-row" key={l.id}>
                  <div className="list-row-main">
                    <span>Sæt {i + 1}</span>
                    <span className="muted small">
                      {formatWeight(l.weight)} kg{l.reps ? ` × ${l.reps}` : ''}
                    </span>
                  </div>
                  <button
                    className="icon-btn subtle"
                    onClick={() => deleteLog(l.id)}
                    aria-label="Slet sæt"
                  >
                    <XIcon size={16} />
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
      </section>

      {confirmRemove && (
        <div className="sheet-backdrop" onClick={() => setConfirmRemove(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h2>Fjern {exercise.name}?</h2>
            <p className="muted">Øvelsen og hele dens historik slettes.</p>
            <div className="dialog-actions">
              <button className="ghost-btn" onClick={() => setConfirmRemove(false)}>
                Annullér
              </button>
              <button
                className="danger-btn"
                onClick={() => {
                  untrackExercise(exercise.id);
                  onBack();
                }}
              >
                Fjern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
