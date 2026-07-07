import type { Exercise, LogEntry } from '../types';
import type { ExerciseGoals } from '../storage';
import { localDateKey } from './format';

/** Monday-based week key, e.g. "2026-W28". */
function weekKey(d: Date): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export interface WeekInsights {
  trainingDays: number;
  totalSets: number;
  streakWeeks: number;
  /** Mon..Sun — true if trained that weekday this week */
  trainedWeekdays: boolean[];
}

export function weekInsights(logs: LogEntry[]): WeekInsights {
  const now = new Date();
  const thisWeek = weekKey(now);

  const daysThisWeek = new Set<string>();
  let setsThisWeek = 0;
  const weeksWithTraining = new Set<string>();
  const trainedWeekdays = [false, false, false, false, false, false, false];

  for (const l of logs) {
    const d = new Date(l.date);
    const wk = weekKey(d);
    weeksWithTraining.add(wk);
    if (wk === thisWeek) {
      daysThisWeek.add(localDateKey(l.date));
      setsThisWeek++;
      trainedWeekdays[(d.getDay() + 6) % 7] = true;
    }
  }

  // consecutive weeks (ending this week or last week) with training
  let streak = 0;
  const cursor = new Date(now);
  // allow the streak to still count if this week has no training yet but last did
  if (!weeksWithTraining.has(thisWeek)) cursor.setDate(cursor.getDate() - 7);
  while (weeksWithTraining.has(weekKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }

  return {
    trainingDays: daysThisWeek.size,
    totalSets: setsThisWeek,
    streakWeeks: streak,
    trainedWeekdays,
  };
}

export interface PRInsight {
  exercise: Exercise;
  weight: number;
  date: string;
}

/** Most recent day on which an exercise hit an all-time best weight. */
export function latestPR(
  logs: LogEntry[],
  exerciseById: (id: string) => Exercise | undefined,
): PRInsight | null {
  const byExercise = new Map<string, LogEntry[]>();
  for (const l of logs) {
    const arr = byExercise.get(l.exerciseId) ?? [];
    arr.push(l);
    byExercise.set(l.exerciseId, arr);
  }

  let best: PRInsight | null = null;
  for (const [exId, entries] of byExercise) {
    entries.sort((a, b) => a.date.localeCompare(b.date));
    let running = 0;
    let prDate: string | null = null;
    let prWeight = 0;
    for (const e of entries) {
      if (e.weight > running) {
        running = e.weight;
        prDate = e.date;
        prWeight = e.weight;
      }
    }
    // only counts as a "PR moment" if it happened after the first session
    const firstDay = localDateKey(entries[0].date);
    if (!prDate || localDateKey(prDate) === firstDay) continue;
    const ex = exerciseById(exId);
    if (!ex) continue;
    if (!best || prDate > best.date) {
      best = { exercise: ex, weight: prWeight, date: prDate };
    }
  }
  return best;
}

function bestWeightFor(logs: LogEntry[], exerciseId: string): number {
  let best = 0;
  for (const l of logs) if (l.exerciseId === exerciseId) best = Math.max(best, l.weight);
  return best;
}

export interface GainInsight {
  exercise: Exercise;
  gain: number;
  weeks: number;
}

/** Largest weight gained on any one exercise over roughly the last 8 weeks. */
export function biggestGain(
  logs: LogEntry[],
  exerciseById: (id: string) => Exercise | undefined,
): GainInsight | null {
  const cutoff = Date.now() - 56 * 86400000;
  const byExercise = new Map<string, LogEntry[]>();
  for (const l of logs) {
    if (new Date(l.date).getTime() < cutoff) continue;
    const arr = byExercise.get(l.exerciseId) ?? [];
    arr.push(l);
    byExercise.set(l.exerciseId, arr);
  }
  let best: GainInsight | null = null;
  for (const [exId, entries] of byExercise) {
    entries.sort((a, b) => a.date.localeCompare(b.date));
    const firstBest = entries[0].weight;
    const lastBest = Math.max(...entries.map((e) => e.weight));
    const gain = lastBest - firstBest;
    if (gain <= 0) continue;
    const days =
      (new Date(entries[entries.length - 1].date).getTime() -
        new Date(entries[0].date).getTime()) /
      86400000;
    const weeks = Math.max(1, Math.round(days / 7));
    const ex = exerciseById(exId);
    if (!ex) continue;
    if (!best || gain > best.gain) best = { exercise: ex, gain, weeks };
  }
  return best;
}

export interface GoalInsight {
  exercise: Exercise;
  current: number;
  target: number;
  remaining: number;
  reached: boolean;
}

/** Goal closest to being reached (or one just reached). */
export function goalProgress(
  logs: LogEntry[],
  exerciseById: (id: string) => Exercise | undefined,
  goals: ExerciseGoals,
): { closest: GoalInsight | null; reached: GoalInsight | null } {
  let closest: GoalInsight | null = null;
  let reached: GoalInsight | null = null;
  for (const [exId, target] of Object.entries(goals)) {
    const ex = exerciseById(exId);
    if (!ex || !target) continue;
    const current = bestWeightFor(logs, exId);
    if (current <= 0) continue;
    const remaining = Math.round((target - current) * 10) / 10;
    const info: GoalInsight = { exercise: ex, current, target, remaining, reached: remaining <= 0 };
    if (info.reached) {
      if (!reached) reached = info;
    } else if (!closest || remaining < closest.remaining) {
      closest = info;
    }
  }
  return { closest, reached };
}

export type InsightKind = 'goalReached' | 'pr' | 'gain' | 'goal' | 'streak';

export interface Insight {
  id: string;
  kind: InsightKind;
  title: string;
  sub: string;
  exerciseId?: string;
}

/** Up to `max` prioritised insight cards for the dashboard. */
export function buildInsights(
  logs: LogEntry[],
  exerciseById: (id: string) => Exercise | undefined,
  goals: ExerciseGoals,
  streakWeeks: number,
  max = 3,
): Insight[] {
  const out: Insight[] = [];
  const { closest, reached } = goalProgress(logs, exerciseById, goals);

  if (reached) {
    out.push({
      id: 'goalReached',
      kind: 'goalReached',
      title: 'Mål nået! 🎉',
      sub: `${reached.exercise.name} · ${reached.target} kg`,
      exerciseId: reached.exercise.id,
    });
  }

  const pr = latestPR(logs, exerciseById);
  if (pr) {
    out.push({
      id: 'pr',
      kind: 'pr',
      title: 'Personlig rekord',
      sub: `${pr.exercise.name} · ${pr.weight} kg`,
      exerciseId: pr.exercise.id,
    });
  }

  const gain = biggestGain(logs, exerciseById);
  if (gain) {
    out.push({
      id: 'gain',
      kind: 'gain',
      title: `+${Math.round(gain.gain * 10) / 10} kg fremgang`,
      sub: `${gain.exercise.name} · ${gain.weeks} uge${gain.weeks === 1 ? '' : 'r'}`,
      exerciseId: gain.exercise.id,
    });
  }

  if (closest) {
    out.push({
      id: 'goal',
      kind: 'goal',
      title: `${closest.remaining} kg til dit mål`,
      sub: `${closest.exercise.name} · ${closest.current}/${closest.target} kg`,
      exerciseId: closest.exercise.id,
    });
  }

  if (streakWeeks >= 2) {
    out.push({
      id: 'streak',
      kind: 'streak',
      title: `${streakWeeks} ugers streak 🔥`,
      sub: 'Bliv ved — du er i gang!',
    });
  }

  return out.slice(0, max);
}
