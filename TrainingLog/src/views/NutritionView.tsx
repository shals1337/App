import { useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import type { NutritionGoals } from '../types';
import { shortDate, todayISODate } from '../lib/format';
import { TargetIcon, XIcon } from '../components/Icons';
import { newId } from '../id';

function parseNum(raw: string): number {
  const v = Number(raw.replace(',', '.'));
  return Number.isFinite(v) && v > 0 ? v : 0;
}

function GoalBar({
  value,
  goal,
  unit,
  title,
}: {
  value: number;
  goal: number | null;
  unit: string;
  title: string;
}) {
  const pct = goal ? Math.min(100, (value / goal) * 100) : 0;
  const reached = goal !== null && value >= goal;
  return (
    <div className="goal-block">
      <div className="goal-head">
        <span className="goal-title">{title}</span>
        <span className="goal-nums mono">
          <strong>{Math.round(value).toLocaleString('da-DK')}</strong>
          {goal ? ` / ${Math.round(goal).toLocaleString('da-DK')}` : ''} {unit}
        </span>
      </div>
      {goal !== null && (
        <div className="goal-track">
          <div
            className={reached ? 'goal-fill reached' : 'goal-fill'}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function NutritionView() {
  const { food, goals, addFood, deleteFood, setGoals } = useApp();
  const [name, setName] = useState('');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [showGoals, setShowGoals] = useState(false);

  const today = todayISODate();
  const todayEntries = useMemo(
    () => food.filter((e) => e.date === today).reverse(),
    [food, today],
  );
  const todayKcal = todayEntries.reduce((s, e) => s + e.kcal, 0);
  const todayProtein = todayEntries.reduce((s, e) => s + e.protein, 0);

  /* daily totals for the last 7 days before today */
  const lastDays = useMemo(() => {
    const byDay = new Map<string, { kcal: number; protein: number }>();
    for (const e of food) {
      if (e.date === today) continue;
      const t = byDay.get(e.date) ?? { kcal: 0, protein: 0 };
      t.kcal += e.kcal;
      t.protein += e.protein;
      byDay.set(e.date, t);
    }
    return [...byDay.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 7);
  }, [food, today]);

  const canSave = parseNum(kcal) > 0 || parseNum(protein) > 0;

  function save() {
    if (!canSave) return;
    addFood({
      id: newId(),
      date: today,
      name: name.trim() || undefined,
      kcal: parseNum(kcal),
      protein: parseNum(protein),
    });
    setName('');
    setKcal('');
    setProtein('');
  }

  return (
    <div className="view">
      <header className="page-header">
        <div>
          <p className="eyebrow">Kcal & protein i dag</p>
          <h1>Kost</h1>
        </div>
        <button className="icon-btn" onClick={() => setShowGoals(true)} aria-label="Sæt mål">
          <TargetIcon size={20} />
        </button>
      </header>

      <div className="card goal-card">
        <GoalBar value={todayKcal} goal={goals.kcal} unit="kcal" title="Kalorier" />
        <GoalBar value={todayProtein} goal={goals.protein} unit="g" title="Protein" />
        {goals.kcal === null && goals.protein === null && (
          <p className="muted small">
            Tryk på <TargetIcon size={12} /> for at sætte dine daglige mål.
          </p>
        )}
      </div>

      <div className="card log-card">
        <input
          className="text-input"
          type="text"
          placeholder="Hvad har du spist? (valgfrit)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="log-inputs">
          <label className="log-field">
            <span>Kcal</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={kcal}
              onChange={(e) => setKcal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && save()}
            />
          </label>
          <label className="log-field">
            <span>Protein (g)</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && save()}
            />
          </label>
          <button className="cta slim log-btn" onClick={save} disabled={!canSave}>
            Log
          </button>
        </div>
      </div>

      <section>
        <h2 className="section-title">I dag</h2>
        {todayEntries.length === 0 ? (
          <div className="card">
            <p className="empty">Intet logget endnu i dag.</p>
          </div>
        ) : (
          <div className="card">
            {todayEntries.map((e) => (
              <div className="list-row" key={e.id}>
                <div className="list-row-main">
                  <span>{e.name ?? 'Måltid'}</span>
                  <span className="muted small">
                    {Math.round(e.kcal)} kcal · {Math.round(e.protein)} g protein
                  </span>
                </div>
                <button
                  className="icon-btn subtle"
                  onClick={() => deleteFood(e.id)}
                  aria-label="Slet"
                >
                  <XIcon size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {lastDays.length > 0 && (
        <section>
          <h2 className="section-title">Seneste dage</h2>
          <div className="card">
            {lastDays.map(([date, t]) => (
              <div className="list-row" key={date}>
                <div className="list-row-main">
                  <span>{shortDate(`${date}T12:00:00`)}</span>
                </div>
                <span className="muted small mono">
                  {Math.round(t.kcal).toLocaleString('da-DK')} kcal ·{' '}
                  {Math.round(t.protein)} g
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {showGoals && (
        <GoalsSheet goals={goals} onSave={setGoals} onClose={() => setShowGoals(false)} />
      )}
    </div>
  );
}

function GoalsSheet({
  goals,
  onSave,
  onClose,
}: {
  goals: NutritionGoals;
  onSave: (g: NutritionGoals) => void;
  onClose: () => void;
}) {
  const [kcal, setKcal] = useState(goals.kcal ? String(goals.kcal) : '');
  const [protein, setProtein] = useState(goals.protein ? String(goals.protein) : '');

  function save() {
    onSave({
      kcal: parseNum(kcal) || null,
      protein: parseNum(protein) || null,
    });
    onClose();
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h2>Daglige mål</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Luk">
            <XIcon size={20} />
          </button>
        </div>
        <div className="log-inputs">
          <label className="log-field">
            <span>Kcal-mål</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="fx 2500"
              value={kcal}
              onChange={(e) => setKcal(e.target.value)}
            />
          </label>
          <label className="log-field">
            <span>Protein-mål (g)</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="fx 150"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
            />
          </label>
        </div>
        <button className="cta slim" onClick={save}>
          Gem mål
        </button>
        <p className="muted small">Lad et felt stå tomt for ikke at have et mål.</p>
      </div>
    </div>
  );
}
