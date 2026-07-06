import type {
  ActiveWorkout,
  BodyWeightEntry,
  Exercise,
  Settings,
  Template,
  WorkoutSession,
} from './types';
import { STARTER_TEMPLATES } from './data/exercises';

const KEYS = {
  customExercises: 'tl.v2.customExercises',
  sessions: 'tl.v2.sessions',
  templates: 'tl.v2.templates',
  bodyWeight: 'tl.v2.bodyWeight',
  activeWorkout: 'tl.v2.activeWorkout',
  settings: 'tl.v2.settings',
} as const;

function read<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

/* v1 (first version of this app) stored sessions under other keys with a
   simpler shape; convert them once so no logged workout is lost. */
interface V1Session {
  id: string;
  date: string;
  exercises: { exerciseId: string; sets: { reps: number; weight: number }[] }[];
}

function migrateV1(): WorkoutSession[] {
  const old = read<V1Session[]>('training-log.sessions');
  if (!old) return [];
  return old.map((s) => ({
    id: s.id,
    name: 'Workout',
    startedAt: `${s.date}T12:00:00`,
    durationSec: 0,
    exercises: s.exercises.map((e) => ({
      exerciseId: e.exerciseId,
      sets: e.sets.map((set) => ({ ...set, completed: true })),
    })),
  }));
}

export function loadSessions(): WorkoutSession[] {
  return read<WorkoutSession[]>(KEYS.sessions) ?? migrateV1();
}

export function saveSessions(v: WorkoutSession[]): void {
  write(KEYS.sessions, v);
}

export function loadCustomExercises(): Exercise[] {
  return read<Exercise[]>(KEYS.customExercises) ?? [];
}

export function saveCustomExercises(v: Exercise[]): void {
  write(KEYS.customExercises, v);
}

export function loadTemplates(): Template[] {
  return read<Template[]>(KEYS.templates) ?? STARTER_TEMPLATES;
}

export function saveTemplates(v: Template[]): void {
  write(KEYS.templates, v);
}

export function loadBodyWeight(): BodyWeightEntry[] {
  return read<BodyWeightEntry[]>(KEYS.bodyWeight) ?? [];
}

export function saveBodyWeight(v: BodyWeightEntry[]): void {
  write(KEYS.bodyWeight, v);
}

export function loadActiveWorkout(): ActiveWorkout | null {
  return read<ActiveWorkout>(KEYS.activeWorkout);
}

export function saveActiveWorkout(v: ActiveWorkout | null): void {
  if (v === null) localStorage.removeItem(KEYS.activeWorkout);
  else write(KEYS.activeWorkout, v);
}

export function loadSettings(): Settings {
  return { restSec: 90, restSound: true, ...read<Partial<Settings>>(KEYS.settings) };
}

export function saveSettings(v: Settings): void {
  write(KEYS.settings, v);
}

export function exportAllData(): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      sessions: loadSessions(),
      customExercises: loadCustomExercises(),
      templates: loadTemplates(),
      bodyWeight: loadBodyWeight(),
    },
    null,
    2,
  );
}

export interface ImportPayload {
  sessions: WorkoutSession[];
  customExercises: Exercise[];
  templates: Template[];
  bodyWeight: BodyWeightEntry[];
}

/** Parse a previously exported backup; throws on shape mismatch. */
export function parseImport(json: string): ImportPayload {
  const data = JSON.parse(json) as Partial<ImportPayload>;
  if (!Array.isArray(data.sessions)) throw new Error('missing sessions');
  return {
    sessions: data.sessions,
    customExercises: Array.isArray(data.customExercises) ? data.customExercises : [],
    templates: Array.isArray(data.templates) ? data.templates : [],
    bodyWeight: Array.isArray(data.bodyWeight) ? data.bodyWeight : [],
  };
}
