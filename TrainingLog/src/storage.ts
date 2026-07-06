import type { Exercise, WorkoutSession } from './types';

const EXERCISES_KEY = 'training-log.exercises';
const SESSIONS_KEY = 'training-log.sessions';

const STARTER_EXERCISES: Exercise[] = [
  { id: 'squat', name: 'Squat' },
  { id: 'bench-press', name: 'Bench Press' },
  { id: 'deadlift', name: 'Deadlift' },
  { id: 'overhead-press', name: 'Overhead Press' },
  { id: 'pull-up', name: 'Pull-up' },
];

function readJSON<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadExercises(): Exercise[] {
  return readJSON(EXERCISES_KEY, STARTER_EXERCISES);
}

export function saveExercises(exercises: Exercise[]): void {
  writeJSON(EXERCISES_KEY, exercises);
}

export function loadSessions(): WorkoutSession[] {
  return readJSON(SESSIONS_KEY, []);
}

export function saveSessions(sessions: WorkoutSession[]): void {
  writeJSON(SESSIONS_KEY, sessions);
}
