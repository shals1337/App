import { useApp } from '../state/AppContext';
import {
  recentPRs,
  sessionVolume,
  thisWeekSessions,
  weekStreak,
} from '../lib/stats';
import { formatDate, formatVolume, greeting } from '../lib/format';
import { DownloadIcon, TrophyIcon } from '../components/Icons';
import { exportAllData } from '../storage';

interface Props {
  onStartWorkout: () => void;
  onOpenSession: (id: string) => void;
}

export function HomeView({ onStartWorkout, onOpenSession }: Props) {
  const { sessions, exerciseById, active } = useApp();

  const week = thisWeekSessions(sessions);
  const weekVolume = week.reduce((sum, s) => sum + sessionVolume(s), 0);
  const streak = weekStreak(sessions);
  const prs = recentPRs(sessions, 4);
  const recent = [...sessions]
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, 3);

  function exportData() {
    const blob = new Blob([exportAllData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training-log-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="view">
      <header className="page-header">
        <div>
          <p className="eyebrow">{greeting()}</p>
          <h1>Training Log</h1>
        </div>
        <button className="icon-btn" onClick={exportData} aria-label="Export data">
          <DownloadIcon size={20} />
        </button>
      </header>

      <div className="stat-grid">
        <div className="stat-tile">
          <span className="stat-value">{week.length}</span>
          <span className="stat-label">workouts this week</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{formatVolume(weekVolume)}</span>
          <span className="stat-label">volume this week</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{streak}</span>
          <span className="stat-label">week streak</span>
        </div>
      </div>

      <button className="cta" onClick={onStartWorkout}>
        {active ? 'Resume workout' : 'Start workout'}
      </button>

      {prs.length > 0 && (
        <section>
          <h2 className="section-title">Recent PRs</h2>
          <div className="card">
            {prs.map((pr, i) => (
              <div className="list-row" key={`${pr.sessionId}-${pr.exerciseId}-${i}`}>
                <span className="pr-icon">
                  <TrophyIcon size={17} />
                </span>
                <div className="list-row-main">
                  <span>{exerciseById(pr.exerciseId)?.name ?? 'Exercise'}</span>
                  <span className="muted small">{formatDate(pr.date)}</span>
                </div>
                <span className="pr-value">
                  {pr.value} kg{pr.kind === '1rm' ? ' e1RM' : ''}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="section-title">Recent workouts</h2>
        {recent.length === 0 ? (
          <div className="card">
            <p className="empty">
              No workouts yet. Hit <strong>Start workout</strong> to log your first
              session.
            </p>
          </div>
        ) : (
          <div className="card">
            {recent.map((s) => (
              <button
                className="list-row row-btn"
                key={s.id}
                onClick={() => onOpenSession(s.id)}
              >
                <div className="list-row-main">
                  <span>{s.name}</span>
                  <span className="muted small">{formatDate(s.startedAt)}</span>
                </div>
                <span className="muted small">{formatVolume(sessionVolume(s))}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
