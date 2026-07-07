export type MuscleGroup =
  | 'Bryst'
  | 'Ryg'
  | 'Ben'
  | 'Skuldre'
  | 'Arme'
  | 'Mave'
  | 'Kondi'
  | 'Andet';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  /** 'cardio' exercises log time/distance instead of weight */
  kind?: 'cardio';
  custom?: boolean;
}

/**
 * One logged entry. Strength exercises use `weight` (+ optional `reps`);
 * cardio exercises use `durationMin` (+ optional `distanceKm`) and leave
 * `weight` at 0.
 */
export interface LogEntry {
  id: string;
  exerciseId: string;
  /** ISO datetime */
  date: string;
  weight: number;
  reps?: number;
  durationMin?: number;
  distanceKm?: number;
}

export interface BodyWeightEntry {
  /** YYYY-MM-DD */
  date: string;
  weight: number;
}

/** One food/meal entry on a given day. */
export interface FoodEntry {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  name?: string;
  kcal: number;
  protein: number;
}

export interface NutritionGoals {
  kcal: number | null;
  protein: number | null;
}
