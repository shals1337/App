import { useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import type { Exercise } from '../types';
import { formatDate, formatWeight, localDateKey, shortDate } from '../lib/format';
import { LineChart, type ChartPoint } from '../components/LineChart';
import { CheckIcon, ChevronLeftIcon, TrashIcon, XIcon } from '../components/Icons';
import { DeltaChip } from '../components/DeltaChip';
import { progression } from '../lib/progression';
import { newId } from '../id';

interface Props {
  exercise: Exercise;
  onBack: () => void;
}

export function ExerciseDetail({ exercise, onBack }: Props) {
  const { logsFor, addLog, deleteLog, untrackExercise } = useApp();
  const logs = logsFor(exercise.id);
  const { last, delta } = progression(logs);

  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const best = logs.reduce((max, l) => Math.max(max, l.weight), 0);
  const totalGain = logs.length > 1 ? logs[logs.length - 1].weight - logs[0].weight : null;

  /* chart: heaviest log per day */
  const points: ChartPoint[] = useMemo(() => {
    const byDay = new Map<string, number>();
    for (const l of logs) {
      const key = localDateKey(l.date);
      byDay.set(key, Math.max(byDay.get(key) ?? 0, l.weight));
    }
    return [...byDay.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([day, w]) => ({ label: shortDate(day), value: w }));
  }, [logs]);

  const recent = [...logs].reverse();

  function save() {
    const w = Number(weight.replace(',', '.'));
    if (!w || w <= 0) return;
    const r = Number(reps);
    addLog({
      id: newId(),
      exerciseId: exercise.id,
      date: new Date().toISOString(),
      weight: w,
      reps: r > 0 ? r : undefined,
    });
    setWeight('');
    setReps('');
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1600);
  }

  return (
    <div className="view">
      <header className="page-header detail">
        <button className="icon-btn" onClick={onBack} aria-label="Tilbage">
          <ChevronLeftIcon size={20} />
        </button>
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
        <div className="log-inputs">
          <label className="log-field">
            <span>Kg</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder={last ? formatWeight(last.weight) : '0'}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && save()}
            />
          </label>
          <label className="log-field">
            <span>Reps</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder={last?.reps ? String(last.reps) : '–'}
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && save()}
            />
          </label>
          <button
            className={justSaved ? 'cta slim log-btn saved' : 'cta slim log-btn'}
            onClick={save}
            disabled={!Number(weight.replace(',', '.'))}
          >
            {justSaved ? (
              <>
                <CheckIcon size={17} /> Gemt
              </>
            ) : (
              'Log'
            )}
          </button>
        </div>
        {last && (
          <p className="muted small">
            Sidst: {formatWeight(last.weight)} kg
            {last.reps ? ` × ${last.reps}` : ''} · {formatDate(last.date)}
          </p>
        )}
      </div>

      <div className="stat-grid">
        <div className="stat-tile">
          <span className="stat-value">{last ? formatWeight(last.weight) : '—'}</span>
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
            <h3 className="small-title">Din vægt over tid (kg)</h3>
            <DeltaChip delta={delta} />
          </div>
          <LineChart points={points} unit="kg" />
        </div>
      )}

      <section>
        <h2 className="section-title">Historik</h2>
        {recent.length === 0 ? (
          <div className="card">
            <p className="empty">
              Log din første vægt ovenfor — så kan du følge din fremgang her.
            </p>
          </div>
        ) : (
          <div className="card">
            {recent.map((l) => (
              <div className="list-row" key={l.id}>
                <div className="list-row-main">
                  <span>
                    {formatWeight(l.weight)} kg
                    {l.reps ? <span className="muted"> × {l.reps}</span> : ''}
                  </span>
                  <span className="muted small">{formatDate(l.date)}</span>
                </div>
                <button
                  className="icon-btn subtle"
                  onClick={() => deleteLog(l.id)}
                  aria-label="Slet log"
                >
                  <XIcon size={16} />
                </button>
              </div>
            ))}
          </div>
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
