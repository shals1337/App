import type { Exercise, LogEntry } from '../types';
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
