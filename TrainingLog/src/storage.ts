import type {
  BodyWeightEntry,
  Exercise,
  FoodEntry,
  LogEntry,
  MuscleGroup,
  NutritionGoals,
} from './types';

const KEYS = {
  tracked: 'tl.v3.tracked',
  logs: 'tl.v3.logs',
  customExercises: 'tl.v3.customExercises',
  bodyWeight: 'tl.v3.bodyWeight',
  food: 'tl.v3.food',
  goals: 'tl.v3.goals',
  exerciseGoals: 'tl.v3.exerciseGoals',
} as const;

/** exerciseId -> target weight in kg */
export type ExerciseGoals = Record<string, number>;

export function loadExerciseGoals(): ExerciseGoals {
  return read<ExerciseGoals>(KEYS.exerciseGoals) ?? {};
}

export function saveExerciseGoals(v: ExerciseGoals): void {
  write(KEYS.exerciseGoals, v);
}

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

/* ---- migration from the old session-based versions (v1/v2) ---- */

interface OldSet {
  reps: number;
  weight: number;
  completed?: boolean;
}
interface OldSession {
  id: string;
  startedAt?: string;
  date?: string;
  exercises: { exerciseId: string; sets: OldSet[] }[];
}
interface OldExercise {
  id: string;
  name: string;
  muscleGroup?: string;
  custom?: boolean;
}

const GROUP_MAP: Record<string, MuscleGroup> = {
  Chest: 'Bryst',
  Back: 'Ryg',
  Legs: 'Ben',
  Shoulders: 'Skuldre',
  Arms: 'Arme',
  Core: 'Mave',
  Other: 'Andet',
};

/** Flatten old workout sessions into per-exercise log entries (best set per day). */
function migrateLogs(): LogEntry[] {
  const sessions =
    read<OldSession[]>('tl.v2.sessions') ?? read<OldSession[]>('training-log.sessions');
  if (!sessions) return [];
  const logs: LogEntry[] = [];
  for (const s of sessions) {
    const date = s.startedAt ?? (s.date ? `${s.date}T12:00:00` : null);
    if (!date) continue;
    for (const ex of s.exercises) {
      const done = ex.sets.filter((x) => x.completed !== false && x.weight > 0);
      if (done.length === 0) continue;
      const best = done.reduce((a, b) => (b.weight > a.weight ? b : a));
      logs.push({
        id: `${s.id}-${ex.exerciseId}`,
        exerciseId: ex.exerciseId,
        date,
        weight: best.weight,
        reps: best.reps || undefined,
      });
    }
  }
  return logs;
}

export function loadLogs(): LogEntry[] {
  return read<LogEntry[]>(KEYS.logs) ?? migrateLogs();
}

export function saveLogs(v: LogEntry[]): void {
  write(KEYS.logs, v);
}

export function loadTracked(): string[] {
  const stored = read<string[]>(KEYS.tracked);
  if (stored) return stored;
  return [...new Set(loadLogs().map((l) => l.exerciseId))];
}

export function saveTracked(v: string[]): void {
  write(KEYS.tracked, v);
}

export function loadCustomExercises(): Exercise[] {
  const stored = read<Exercise[]>(KEYS.customExercises);
  if (stored) return stored;
  const old = read<OldExercise[]>('tl.v2.customExercises');
  if (!old) return [];
  return old.map((e) => ({
    id: e.id,
    name: e.name,
    muscleGroup: GROUP_MAP[e.muscleGroup ?? ''] ?? 'Andet',
    custom: true,
  }));
}

export function saveCustomExercises(v: Exercise[]): void {
  write(KEYS.customExercises, v);
}

export function loadBodyWeight(): BodyWeightEntry[] {
  return (
    read<BodyWeightEntry[]>(KEYS.bodyWeight) ??
    read<BodyWeightEntry[]>('tl.v2.bodyWeight') ??
    []
  );
}

export function saveBodyWeight(v: BodyWeightEntry[]): void {
  write(KEYS.bodyWeight, v);
}

export function loadFood(): FoodEntry[] {
  return read<FoodEntry[]>(KEYS.food) ?? [];
}

export function saveFood(v: FoodEntry[]): void {
  write(KEYS.food, v);
}

export function loadGoals(): NutritionGoals {
  return read<NutritionGoals>(KEYS.goals) ?? { kcal: null, protein: null };
}

export function saveGoals(v: NutritionGoals): void {
  write(KEYS.goals, v);
}

/* ---- backup ---- */

export function exportAllData(): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      logs: loadLogs(),
      tracked: loadTracked(),
      customExercises: loadCustomExercises(),
      bodyWeight: loadBodyWeight(),
      food: loadFood(),
      goals: loadGoals(),
      exerciseGoals: loadExerciseGoals(),
    },
    null,
    2,
  );
}

export interface ImportPayload {
  logs: LogEntry[];
  tracked: string[];
  customExercises: Exercise[];
  bodyWeight: BodyWeightEntry[];
  food: FoodEntry[];
  goals: NutritionGoals;
  exerciseGoals: ExerciseGoals;
}

export function parseImport(json: string): ImportPayload {
  const data = JSON.parse(json) as Partial<ImportPayload>;
  if (!Array.isArray(data.logs)) throw new Error('missing logs');
  return {
    logs: data.logs,
    tracked: Array.isArray(data.tracked)
      ? data.tracked
      : [...new Set(data.logs.map((l) => l.exerciseId))],
    customExercises: Array.isArray(data.customExercises) ? data.customExercises : [],
    bodyWeight: Array.isArray(data.bodyWeight) ? data.bodyWeight : [],
    food: Array.isArray(data.food) ? data.food : [],
    goals:
      data.goals && typeof data.goals === 'object'
        ? { kcal: data.goals.kcal ?? null, protein: data.goals.protein ?? null }
        : { kcal: null, protein: null },
    exerciseGoals:
      data.exerciseGoals && typeof data.exerciseGoals === 'object'
        ? data.exerciseGoals
        : {},
  };
}
