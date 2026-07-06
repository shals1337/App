import type { LogEntry } from '../types';
import { localDateKey } from './format';

export interface DayBest {
  dateKey: string;
  value: number;
}

/** Heaviest set per day, ascending by date. */
export function dailyBests(logs: LogEntry[]): DayBest[] {
  const map = new Map<string, number>();
  for (const l of logs) {
    const key = localDateKey(l.date);
    map.set(key, Math.max(map.get(key) ?? 0, l.weight));
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([dateKey, value]) => ({ dateKey, value }));
}

export interface Progression {
  lastValue: number;
  /** ISO-ish datetime for the most recent trained day (noon, for display only) */
  lastDate: string;
  delta: number | null;
}

/** Best set of the most recent session, and how it compares to the session before. */
export function progression(logs: LogEntry[]): Progression | null {
  const days = dailyBests(logs);
  if (days.length === 0) return null;
  const last = days[days.length - 1];
  const delta = days.length > 1 ? last.value - days[days.length - 2].value : null;
  return { lastValue: last.value, lastDate: `${last.dateKey}T12:00:00`, delta };
}

/** All sets logged on the most recent day trained, in the order they were logged. */
export function lastSessionSets(logs: LogEntry[]): LogEntry[] {
  if (logs.length === 0) return [];
  const lastKey = localDateKey(logs[logs.length - 1].date);
  const result: LogEntry[] = [];
  for (let i = logs.length - 1; i >= 0; i--) {
    if (localDateKey(logs[i].date) === lastKey) result.unshift(logs[i]);
    else break;
  }
  return result;
}
