import { useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import type { WorkoutSession } from '../types';
import { prsInSession, sessionSetCount, sessionVolume } from '../lib/stats';
import {
  formatDate,
  formatDateLong,
  formatDuration,
  formatMonth,
  formatVolume,
  formatWeight,
} from '../lib/format';
import { ChevronLeftIcon, TrashIcon, TrophyIcon } from '../components/Icons';

interface Props {
  openSessionId: string | null;
  onOpenSession: (id: string | null) => void;
}

export function HistoryView({ openSessionId, onOpenSession }: Props) {
  const { sessions } = useApp();

  const sorted = useMemo(
    () => [...sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    [sessions],
  );

  const open = sorted.find((s) => s.id === openSessionId);
  if (open) {
    return <SessionDetail session={open} onBack={() => onOpenSession(null)} />;
  }

  const byMonth: { month: string; items: WorkoutSession[] }[] = [];
  for (const s of sorted) {
    const month = formatMonth(s.startedAt);
    const bucket = byMonth[byMonth.length - 1];
    if (bucket && bucket.month === month) bucket.items.push(s);
    else byMonth.push({ month, items: [s] });
  }

  return (
    <div className="view">
      <header className="page-header">
        <h1>History</h1>
        <span className="muted small">{sessions.length} workouts</span>
      </header>

      {sorted.length === 0 && (
        <div className="card">
          <p className="empty">No workouts logged yet.</p>
        </div>
      )}

      {byMonth.map((bucket) => (
        <section key={bucket.month}>
          <h2 className="section-title">{bucket.month}</h2>
          <div className="card">
            {bucket.items.map((s) => (
              <button
                className="list-row row-btn"
                key={s.id}
                onClick={() => onOpenSession(s.id)}
              >
                <div className="list-row-main">
                  <span>{s.name}</span>
                  <span className="muted small">
                    {formatDate(s.startedAt)}
                    {s.durationSec > 0 && ` · ${formatDuration(s.durationSec)}`}
                  </span>
                </div>
                <div className="list-row-end">
                  <span>{formatVolume(sessionVolume(s))}</span>
                  <span className="muted small">{sessionSetCount(s)} sets</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function SessionDetail({
  session,
  onBack,
}: {
  session: WorkoutSession;
  onBack: () => void;
}) {
  const { sessions, exerciseById, deleteSession } = useApp();
  const [confirm, setConfirm] = useState(false);
  const prs = prsInSession(sessions, session);
  const prSet = new Set(prs.map((p) => p.exerciseId));

  return (
    <div className="view">
      <header className="page-header detail">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          <ChevronLeftIcon size={20} />
        </button>
        <div className="detail-title">
          <h1>{session.name}</h1>
          <span className="muted small">{formatDateLong(session.startedAt)}</span>
        </div>
        <button className="icon-btn subtle" onClick={() => setConfirm(true)} aria-label="Delete workout">
          <TrashIcon size={18} />
        </button>
      </header>

      <div className="stat-grid">
        <div className="stat-tile">
          <span className="stat-value mono">
            {session.durationSec > 0 ? formatDuration(session.durationSec) : '—'}
          </span>
          <span className="stat-label">duration</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{formatVolume(sessionVolume(session))}</span>
          <span className="stat-label">volume</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{sessionSetCount(session)}</span>
          <span className="stat-label">sets</span>
        </div>
      </div>

      {session.exercises.map((e) => (
        <div className="card" key={e.exerciseId}>
          <div className="card-header">
            <h3>
              {exerciseById(e.exerciseId)?.name ?? 'Exercise'}
              {prSet.has(e.exerciseId) && (
                <span className="pr-badge">
                  <TrophyIcon size={13} /> PR
                </span>
              )}
            </h3>
          </div>
          <div className="detail-sets">
            {e.sets.map((s, i) => (
              <div className="detail-set" key={i}>
                <span className="muted">{i + 1}</span>
                <span>
                  {formatWeight(s.weight)} kg × {s.reps}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {confirm && (
        <div className="sheet-backdrop" onClick={() => setConfirm(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h2>Delete workout?</h2>
            <p className="muted">This can't be undone.</p>
            <div className="dialog-actions">
              <button className="ghost-btn" onClick={() => setConfirm(false)}>
                Cancel
              </button>
              <button
                className="danger-btn"
                onClick={() => {
                  deleteSession(session.id);
                  onBack();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
