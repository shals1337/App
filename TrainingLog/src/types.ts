export type MuscleGroup =
  | 'Bryst'
  | 'Ryg'
  | 'Ben'
  | 'Skuldre'
  | 'Arme'
  | 'Mave'
  | 'Andet';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  custom?: boolean;
}

/** One logged set on a machine/exercise: what weight you lifted that day. */
export interface LogEntry {
  id: string;
  exerciseId: string;
  /** ISO datetime */
  date: string;
  weight: number;
  reps?: number;
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
