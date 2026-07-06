import { useState } from 'react';
import { XIcon } from './Icons';

/** Exact display (plates come in quarter-kilo steps): 1.25 stays 1.25. */
function exact(n: number): string {
  return String(Math.round(n * 100) / 100);
}

const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
const BARS = [20, 15, 10];

export function PlateCalculator({ onClose }: { onClose: () => void }) {
  const [target, setTarget] = useState('');
  const [bar, setBar] = useState(20);

  const t = Number(target);
  const perSide = t > bar ? (t - bar) / 2 : 0;

  let rest = perSide;
  const counts: { plate: number; count: number }[] = [];
  for (const p of PLATES) {
    const n = Math.floor(rest / p + 1e-9);
    if (n > 0) {
      counts.push({ plate: p, count: n });
      rest = Math.round((rest - n * p) * 100) / 100;
    }
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h2>Plate calculator</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <XIcon size={20} />
          </button>
        </div>

        <input
          className="text-input"
          type="number"
          inputMode="decimal"
          placeholder="Target weight (kg)"
          value={target}
          autoFocus
          onChange={(e) => setTarget(e.target.value)}
        />

        <div className="chip-row">
          {BARS.map((b) => (
            <button
              key={b}
              className={b === bar ? 'chip active' : 'chip'}
              onClick={() => setBar(b)}
            >
              {b} kg bar
            </button>
          ))}
        </div>

        {t > 0 && t < bar && (
          <p className="muted small">Target is lighter than the bar.</p>
        )}

        {perSide > 0 && (
          <div className="plate-result">
            <p className="muted small">Per side ({exact(perSide)} kg):</p>
            <div className="plate-chips">
              {counts.map((c) => (
                <span className="plate-chip" key={c.plate}>
                  {exact(c.plate)} <em>×{c.count}</em>
                </span>
              ))}
              {counts.length === 0 && <span className="muted small">Empty bar</span>}
            </div>
            {rest > 0 && (
              <p className="muted small">
                {exact(rest)} kg per side can't be made with standard plates —
                closest is {exact(t - rest * 2)} kg total.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
