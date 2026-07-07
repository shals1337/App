import { useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import { formatWeight, shortDate, todayISODate } from '../lib/format';
import { LineChart, type ChartPoint } from '../components/LineChart';
import { XIcon } from '../components/Icons';

function WeightGoalCard({ start, current }: { start: number; current: number }) {
  const { weightGoal, setWeightGoal } = useApp();
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState('');

  function save() {
    const v = Number(input.replace(',', '.'));
    if (v > 0) setWeightGoal(v);
    setEditing(false);
    setInput('');
  }

  if (weightGoal === null && !editing) {
    return (
      <button className="goal-set-btn" onClick={() => setEditing(true)}>
        <span className="goal-target-icon">◎</span> Sæt et vægtmål
      </button>
    );
  }

  if (editing) {
    return (
      <div className="card goal-edit-card">
        <label className="log-field">
          <span>Vægtmål (kg)</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder={weightGoal ? formatWeight(weightGoal) : 'fx 78'}
            value={input}
            autoFocus
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
          />
        </label>
        <div className="dialog-actions">
          {weightGoal !== null && (
            <button
              className="danger-btn"
              onClick={() => {
                setWeightGoal(null);
                setEditing(false);
              }}
            >
              Fjern mål
            </button>
          )}
          <button className="cta slim" onClick={save}>
            Gem mål
          </button>
        </div>
      </div>
    );
  }

  const target = weightGoal!;
  const losing = target <= start;
  const span = Math.abs(start - target) || 1;
  const done = losing ? start - current : current - start;
  const pct = Math.max(0, Math.min(100, Math.round((done / span) * 100)));
  const reached = losing ? current <= target : current >= target;
  const remaining = formatWeight(Math.abs(current - target));

  return (
    <button className="card goal-progress-card" onClick={() => setEditing(true)}>
      <div className="goal-progress-head">
        <span className="goal-progress-title">{reached ? 'Mål nået! 🎉' : 'Vægtmål'}</span>
        <span className="goal-progress-nums mono">
          {formatWeight(current)} → {formatWeight(target)} kg
        </span>
      </div>
      <div className="goal-track">
        <div
          className={reached ? 'goal-fill reached' : 'goal-fill'}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="muted small">
        {reached
          ? 'Flot klaret — sæt evt. et nyt mål.'
          : `${remaining} kg ${losing ? 'tilbage at tabe' : 'tilbage at tage på'}`}
      </span>
    </button>
  );
}

export function WeightView() {
  const { bodyWeight, addBodyWeight, deleteBodyWeight } = useApp();
  const [input, setInput] = useState('');
  const [showAll, setShowAll] = useState(false);

  const sorted = useMemo(
    () => [...bodyWeight].sort((a, b) => b.date.localeCompare(a.date)),
    [bodyWeight],
  );

  const points: ChartPoint[] = useMemo(
    () =>
      [...bodyWeight]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((e) => ({ label: shortDate(e.date), value: e.weight })),
    [bodyWeight],
  );

  const current = sorted[0]?.weight ?? null;
  const first = sorted[sorted.length - 1]?.weight ?? null;
  const change = current !== null && first !== null && sorted.length > 1
    ? current - first
    : null;

  function log() {
    const v = Number(input.replace(',', '.'));
    if (!v || v <= 0) return;
    addBodyWeight({ date: todayISODate(), weight: v });
    setInput('');
  }

  return (
    <div className="view">
      <header className="page-header">
        <div>
          <p className="eyebrow">Følg din egen vægt</p>
          <h1>Min vægt</h1>
        </div>
      </header>

      <div className="card log-card">
        <div className="log-inputs">
          <label className="log-field">
            <span>Dagens vægt (kg)</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder={current ? formatWeight(current) : '0'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && log()}
            />
          </label>
          <button
            className="cta slim log-btn"
            onClick={log}
            disabled={!Number(input.replace(',', '.'))}
          >
            Log
          </button>
        </div>
      </div>

      <div className="stat-grid two">
        <div className="stat-tile">
          <span className="stat-value">{current !== null ? formatWeight(current) : '—'}</span>
          <span className="stat-label">nuværende kg</span>
        </div>
        <div className="stat-tile">
          <span
            className={
              change === null
                ? 'stat-value'
                : change < 0
                  ? 'stat-value gain'
                  : change > 0
                    ? 'stat-value loss'
                    : 'stat-value'
            }
          >
            {change === null ? '—' : `${change > 0 ? '+' : ''}${formatWeight(change)}`}
          </span>
          <span className="stat-label">ændring i alt</span>
        </div>
      </div>

      {current !== null && (
        <WeightGoalCard start={first ?? current} current={current} />
      )}

      {points.length > 1 && (
        <div className="card chart-card">
          <h3 className="small-title">Vægt over tid (kg)</h3>
          <LineChart points={points} unit="kg" height={170} />
        </div>
      )}

      {sorted.length > 0 && (
        <section>
          <h2 className="section-title">Historik</h2>
          <div className="card">
            {(showAll ? sorted : sorted.slice(0, 7)).map((e) => (
              <div className="list-row" key={e.date}>
                <div className="list-row-main">
                  <span>{formatWeight(e.weight)} kg</span>
                  <span className="muted small">{shortDate(e.date)}</span>
                </div>
                <button
                  className="icon-btn subtle"
                  onClick={() => deleteBodyWeight(e.date)}
                  aria-label="Slet"
                >
                  <XIcon size={16} />
                </button>
              </div>
            ))}
            {sorted.length > 7 && (
              <button className="text-btn" onClick={() => setShowAll(!showAll)}>
                {showAll ? 'Vis færre' : `Vis alle ${sorted.length}`}
              </button>
            )}
          </div>
        </section>
      )}

      {sorted.length === 0 && (
        <div className="card">
          <p className="empty">Log din vægt første gang ovenfor — så tegner grafen sig selv.</p>
        </div>
      )}
    </div>
  );
}
