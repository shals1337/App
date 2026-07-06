import type { LoggedExercise, SetEntry, WorkoutSession } from '../types';

/** Estimated one-rep max (Epley). Returns the weight itself for 1 rep. */
export function est1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 2) / 2;
}

export function setVolume(s: SetEntry): number {
  return s.reps * s.weight;
}

export function exerciseVolume(e: LoggedExercise): number {
  return e.sets.reduce((sum, s) => sum + (s.completed ? setVolume(s) : 0), 0);
}

export function sessionVolume(session: WorkoutSession): number {
  return session.exercises.reduce((sum, e) => sum + exerciseVolume(e), 0);
}

export function sessionSetCount(session: WorkoutSession): number {
  return session.exercises.reduce(
    (sum, e) => sum + e.sets.filter((s) => s.completed).length,
    0,
  );
}

export interface ExerciseRecords {
  bestWeight: number;
  bestEst1RM: number;
  bestSetVolume: number;
  sessionCount: number;
}

export function recordsFor(
  sessions: WorkoutSession[],
  exerciseId: string,
): ExerciseRecords {
  const rec: ExerciseRecords = {
    bestWeight: 0,
    bestEst1RM: 0,
    bestSetVolume: 0,
    sessionCount: 0,
  };
  for (const session of sessions) {
    const logged = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (!logged) continue;
    const done = logged.sets.filter((s) => s.completed);
    if (done.length === 0) continue;
    rec.sessionCount++;
    for (const s of done) {
      rec.bestWeight = Math.max(rec.bestWeight, s.weight);
      rec.bestEst1RM = Math.max(rec.bestEst1RM, est1RM(s.weight, s.reps));
      rec.bestSetVolume = Math.max(rec.bestSetVolume, setVolume(s));
    }
  }
  return rec;
}

export interface PR {
  exerciseId: string;
  kind: 'weight' | '1rm';
  value: number;
  sessionId: string;
  date: string;
}

/** PRs achieved in `session` compared to all sessions that started earlier. */
export function prsInSession(
  sessions: WorkoutSession[],
  session: WorkoutSession,
): PR[] {
  const before = sessions.filter(
    (s) => s.id !== session.id && s.startedAt < session.startedAt,
  );
  const prs: PR[] = [];
  for (const logged of session.exercises) {
    const prev = recordsFor(before, logged.exerciseId);
    const done = logged.sets.filter((s) => s.completed);
    if (done.length === 0) continue;
    const maxW = Math.max(...done.map((s) => s.weight));
    const max1RM = Math.max(...done.map((s) => est1RM(s.weight, s.reps)));
    if (maxW > prev.bestWeight && prev.sessionCount > 0) {
      prs.push({
        exerciseId: logged.exerciseId,
        kind: 'weight',
        value: maxW,
        sessionId: session.id,
        date: session.startedAt,
      });
    } else if (max1RM > prev.bestEst1RM && prev.sessionCount > 0) {
      prs.push({
        exerciseId: logged.exerciseId,
        kind: '1rm',
        value: max1RM,
        sessionId: session.id,
        date: session.startedAt,
      });
    }
  }
  return prs;
}

export function recentPRs(sessions: WorkoutSession[], limit: number): PR[] {
  const all: PR[] = [];
  for (const session of sessions) {
    all.push(...prsInSession(sessions, session));
  }
  all.sort((a, b) => b.date.localeCompare(a.date));
  return all.slice(0, limit);
}

/** Monday-based start of the week containing `d`. */
export function startOfWeek(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  const day = (out.getDay() + 6) % 7; // Mon = 0
  out.setDate(out.getDate() - day);
  return out;
}

export function thisWeekSessions(sessions: WorkoutSession[]): WorkoutSession[] {
  const start = startOfWeek(new Date());
  return sessions.filter((s) => new Date(s.startedAt) >= start);
}

/** Consecutive weeks (ending this or last week) with at least one workout. */
export function weekStreak(sessions: WorkoutSession[]): number {
  if (sessions.length === 0) return 0;
  const weeks = new Set(
    sessions.map((s) => startOfWeek(new Date(s.startedAt)).getTime()),
  );
  const MS_WEEK = 7 * 24 * 3600 * 1000;
  let cursor = startOfWeek(new Date()).getTime();
  if (!weeks.has(cursor)) cursor -= MS_WEEK; // allow streak kept alive from last week
  let streak = 0;
  while (weeks.has(cursor)) {
    streak++;
    cursor -= MS_WEEK;
  }
  return streak;
}
