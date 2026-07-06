import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../state/AppContext';
import type { LoggedExercise, SetEntry, WorkoutSession } from '../types';
import { est1RM, prsInSession, sessionSetCount, sessionVolume } from '../lib/stats';
import { formatCompact, formatDuration, formatWeight } from '../lib/format';
import { ExercisePicker } from '../components/ExercisePicker';
import { PlateCalculator } from '../components/PlateCalculator';
import {
  CheckIcon,
  PlateIcon,
  PlusIcon,
  TimerIcon,
  TrophyIcon,
  XIcon,
} from '../components/Icons';
import { newId } from '../id';

interface Props {
  onDone: () => void;
}

function beep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    /* audio unavailable */
  }
}

export function ActiveWorkoutView({ onDone }: Props) {
  const { active, setActive, sessions, exerciseById, addSession, settings, setSettings } =
    useApp();
  const [showPicker, setShowPicker] = useState(false);
  const [showPlates, setShowPlates] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [summary, setSummary] = useState<WorkoutSession | null>(null);
  const [now, setNow] = useState(Date.now());
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null);
  const [armedDelete, setArmedDelete] = useState<string | null>(null);
  const beeped = useRef(false);
  const disarmTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const restLeft = restEndsAt ? Math.ceil((restEndsAt - now) / 1000) : null;
  useEffect(() => {
    if (restLeft !== null && restLeft <= 0) {
      if (!beeped.current) {
        beeped.current = true;
        if (settings.restSound) beep();
      }
      setRestEndsAt(null);
    } else if (restLeft !== null && restLeft > 0) {
      beeped.current = false;
    }
  }, [restLeft, settings.restSound]);

  /* leave the workout screen if there is nothing to show (e.g. stale state) */
  const hasContent = !!active || !!summary;
  useEffect(() => {
    if (!hasContent) onDone();
  }, [hasContent, onDone]);

  /* most recent completed sets per exercise, for "previous" hints */
  const prevSets = useMemo(() => {
    const map = new Map<string, SetEntry[]>();
    if (!active) return map;
    const sorted = [...sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    for (const ex of active.exercises) {
      for (const s of sorted) {
        const logged = s.exercises.find((e) => e.exerciseId === ex.exerciseId);
        const done = logged?.sets.filter((x) => x.completed) ?? [];
        if (done.length > 0) {
          map.set(ex.exerciseId, done);
          break;
        }
      }
    }
    return map;
  }, [active, sessions]);

  if (summary) return <SummaryModal session={summary} onClose={onDone} />;
  if (!active) return null;

  const elapsed = Math.max(0, Math.floor((now - new Date(active.startedAt).getTime()) / 1000));

  function update(exercises: LoggedExercise[]) {
    setActive({ ...active!, exercises });
  }

  function setField(exIdx: number, setIdx: number, field: 'weight' | 'reps', raw: string) {
    const v = raw === '' ? 0 : Number(raw);
    if (Number.isNaN(v) || v < 0) return;
    update(
      active!.exercises.map((e, i) =>
        i !== exIdx
          ? e
          : {
              ...e,
              sets: e.sets.map((s, j) => (j !== setIdx ? s : { ...s, [field]: v })),
            },
      ),
    );
  }

  function toggleSet(exIdx: number, setIdx: number) {
    const ex = active!.exercises[exIdx];
    const s = ex.sets[setIdx];
    const prev = prevSets.get(ex.exerciseId)?.[setIdx];
    const completing = !s.completed;
    const weight = s.weight || (completing ? (prev?.weight ?? 0) : s.weight);
    const reps = s.reps || (completing ? (prev?.reps ?? 0) : s.reps);
    if (completing && reps === 0) return; // nothing to log
    update(
      active!.exercises.map((e, i) =>
        i !== exIdx
          ? e
          : {
              ...e,
              sets: e.sets.map((st, j) =>
                j !== setIdx ? st : { weight, reps, completed: completing },
              ),
            },
      ),
    );
    if (completing) {
      setRestEndsAt(Date.now() + settings.restSec * 1000);
    }
  }

  function addSet(exIdx: number) {
    const ex = active!.exercises[exIdx];
    const last = ex.sets[ex.sets.length - 1];
    update(
      active!.exercises.map((e, i) =>
        i !== exIdx
          ? e
          : {
              ...e,
              sets: [
                ...e.sets,
                { weight: last?.weight ?? 0, reps: last?.reps ?? 0, completed: false },
              ],
            },
      ),
    );
  }

  /* first tap arms the row (number turns into a red ×), second tap deletes */
  function tapSetNumber(exIdx: number, setIdx: number) {
    const key = `${exIdx}-${setIdx}`;
    clearTimeout(disarmTimer.current);
    if (armedDelete === key) {
      setArmedDelete(null);
      update(
        active!.exercises.map((e, i) =>
          i !== exIdx ? e : { ...e, sets: e.sets.filter((_, j) => j !== setIdx) },
        ),
      );
    } else {
      setArmedDelete(key);
      disarmTimer.current = setTimeout(() => setArmedDelete(null), 2000);
    }
  }

  function removeExercise(exIdx: number) {
    update(active!.exercises.filter((_, i) => i !== exIdx));
  }

  function addExercise(exerciseId: string) {
    update([
      ...active!.exercises,
      { exerciseId, sets: [{ weight: 0, reps: 0, completed: false }] },
    ]);
    setShowPicker(false);
  }

  function finish() {
    const exercises = active!.exercises
      .map((e) => ({ ...e, sets: e.sets.filter((s) => s.completed) }))
      .filter((e) => e.sets.length > 0);
    if (exercises.length === 0) return;
    const session: WorkoutSession = {
      id: newId(),
      name: active!.name,
      startedAt: active!.startedAt,
      durationSec: elapsed,
      exercises,
      note: active!.note?.trim() || undefined,
    };
    addSession(session);
    setActive(null);
    setRestEndsAt(null);
    setSummary(session);
  }

  function cancel() {
    setActive(null);
    setRestEndsAt(null);
    onDone();
  }

  const anyCompleted = active.exercises.some((e) => e.sets.some((s) => s.completed));

  function adjustRest(delta: number) {
    if (restEndsAt) setRestEndsAt(restEndsAt + delta * 1000);
    setSettings({ ...settings, restSec: Math.max(15, settings.restSec + delta) });
  }

  return (
    <div className="workout-screen">
      <header className="workout-header">
        <button className="icon-btn" onClick={() => setConfirmCancel(true)} aria-label="Cancel workout">
          <XIcon size={20} />
        </button>
        <div className="workout-title">
          <input
            className="workout-name"
            value={active.name}
            onChange={(e) => setActive({ ...active, name: e.target.value })}
          />
          <span className="muted small mono">{formatDuration(elapsed)}</span>
        </div>
        <button
          className="icon-btn"
          onClick={() => setShowPlates(true)}
          aria-label="Plate calculator"
        >
          <PlateIcon size={19} />
        </button>
        <button className="finish-btn" onClick={finish} disabled={!anyCompleted}>
          Finish
        </button>
      </header>

      <div className="workout-body">
        {active.exercises.map((ex, exIdx) => {
          const info = exerciseById(ex.exerciseId);
          const prev = prevSets.get(ex.exerciseId);
          return (
            <div className="card exercise-card" key={`${ex.exerciseId}-${exIdx}`}>
              <div className="card-header">
                <h3>{info?.name ?? 'Exercise'}</h3>
                <button className="icon-btn subtle" onClick={() => removeExercise(exIdx)} aria-label="Remove exercise">
                  <XIcon size={16} />
                </button>
              </div>

              <div className="set-grid header">
                <span>SET</span>
                <span>PREV</span>
                <span>KG</span>
                <span>REPS</span>
                <span />
              </div>

              {ex.sets.map((s, setIdx) => {
                const p = prev?.[setIdx];
                const armed = armedDelete === `${exIdx}-${setIdx}`;
                return (
                  <div className={s.completed ? 'set-grid done' : 'set-grid'} key={setIdx}>
                    <button
                      className={armed ? 'set-num armed' : 'set-num'}
                      onClick={() => tapSetNumber(exIdx, setIdx)}
                      aria-label={
                        armed ? 'Tap again to remove set' : `Set ${setIdx + 1} — tap twice to remove`
                      }
                    >
                      {armed ? '×' : setIdx + 1}
                    </button>
                    <span className="prev-hint">
                      {p ? `${formatWeight(p.weight)}×${p.reps}` : '—'}
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder={p ? formatWeight(p.weight) : '0'}
                      value={s.weight === 0 ? '' : s.weight}
                      onChange={(e) => setField(exIdx, setIdx, 'weight', e.target.value)}
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder={p ? String(p.reps) : '0'}
                      value={s.reps === 0 ? '' : s.reps}
                      onChange={(e) => setField(exIdx, setIdx, 'reps', e.target.value)}
                    />
                    <button
                      className={s.completed ? 'set-check done' : 'set-check'}
                      onClick={() => toggleSet(exIdx, setIdx)}
                      aria-label="Complete set"
                    >
                      <CheckIcon size={16} />
                    </button>
                  </div>
                );
              })}

              <button className="ghost-btn" onClick={() => addSet(exIdx)}>
                <PlusIcon size={15} /> Add set
              </button>
            </div>
          );
        })}

        <button className="ghost-btn big" onClick={() => setShowPicker(true)}>
          <PlusIcon size={17} /> Add exercise
        </button>

        <textarea
          className="note-input"
          placeholder="Workout notes…"
          rows={2}
          value={active.note ?? ''}
          onChange={(e) => setActive({ ...active, note: e.target.value })}
        />
      </div>

      {restLeft !== null && restLeft > 0 && (
        <div className="rest-bar">
          <TimerIcon size={18} />
          <span className="mono rest-time">{formatDuration(restLeft)}</span>
          <div className="rest-actions">
            <button onClick={() => adjustRest(-15)}>-15</button>
            <button onClick={() => adjustRest(15)}>+15</button>
            <button className="accent" onClick={() => setRestEndsAt(null)}>
              Skip
            </button>
          </div>
        </div>
      )}

      {showPicker && (
        <ExercisePicker onPick={addExercise} onClose={() => setShowPicker(false)} />
      )}

      {showPlates && <PlateCalculator onClose={() => setShowPlates(false)} />}

      {confirmCancel && (
        <div className="sheet-backdrop" onClick={() => setConfirmCancel(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h2>Discard workout?</h2>
            <p className="muted">All sets from this session will be lost.</p>
            <div className="dialog-actions">
              <button className="ghost-btn" onClick={() => setConfirmCancel(false)}>
                Keep going
              </button>
              <button className="danger-btn" onClick={cancel}>
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryModal({ session, onClose }: { session: WorkoutSession; onClose: () => void }) {
  const { sessions, exerciseById } = useApp();
  const prs = prsInSession(sessions, session);
  const bestSet = session.exercises
    .flatMap((e) => e.sets.map((s) => ({ e: e.exerciseId, v: est1RM(s.weight, s.reps), s })))
    .sort((a, b) => b.v - a.v)[0];

  return (
    <div className="sheet-backdrop">
      <div className="dialog summary" onClick={(e) => e.stopPropagation()}>
        <div className="summary-trophy">
          <TrophyIcon size={30} />
        </div>
        <h2>Workout complete</h2>
        <div className="stat-grid">
          <div className="stat-tile">
            <span className="stat-value mono">{formatDuration(session.durationSec)}</span>
            <span className="stat-label">duration</span>
          </div>
          <div className="stat-tile">
            <span className="stat-value">{formatCompact(sessionVolume(session))}</span>
            <span className="stat-label">kg volume</span>
          </div>
          <div className="stat-tile">
            <span className="stat-value">{sessionSetCount(session)}</span>
            <span className="stat-label">sets</span>
          </div>
        </div>
        {prs.length > 0 && (
          <div className="summary-prs">
            {prs.map((pr, i) => (
              <div className="pr-row" key={i}>
                <TrophyIcon size={15} />
                <span>
                  {exerciseById(pr.exerciseId)?.name}: {pr.value} kg
                  {pr.kind === '1rm' ? ' e1RM' : ''} PR
                </span>
              </div>
            ))}
          </div>
        )}
        {prs.length === 0 && bestSet && (
          <p className="muted small">
            Best set: {exerciseById(bestSet.e)?.name} — est. 1RM{' '}
            {formatWeight(bestSet.v)} kg
          </p>
        )}
        <button className="cta" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}
