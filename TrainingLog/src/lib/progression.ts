import type { LogEntry } from '../types';

/** Latest weight and change vs. the previous log with a different weight. */
export function progression(logs: LogEntry[]): {
  last: LogEntry | null;
  delta: number | null;
} {
  if (logs.length === 0) return { last: null, delta: null };
  const last = logs[logs.length - 1];
  for (let i = logs.length - 2; i >= 0; i--) {
    if (logs[i].weight !== last.weight) {
      return { last, delta: last.weight - logs[i].weight };
    }
  }
  return { last, delta: logs.length > 1 ? 0 : null };
}
