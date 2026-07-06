export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Legs'
  | 'Shoulders'
  | 'Arms'
  | 'Core'
  | 'Other';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  custom?: boolean;
}

export interface SetEntry {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface LoggedExercise {
  exerciseId: string;
  sets: SetEntry[];
}

export interface WorkoutSession {
  id: string;
  name: string;
  /** ISO datetime the workout started */
  startedAt: string;
  durationSec: number;
  exercises: LoggedExercise[];
  note?: string;
}

export interface TemplateExercise {
  exerciseId: string;
  targetSets: number;
}

export interface Template {
  id: string;
  name: string;
  exercises: TemplateExercise[];
}

export interface BodyWeightEntry {
  /** YYYY-MM-DD */
  date: string;
  weight: number;
}

export interface ActiveWorkout {
  name: string;
  startedAt: string;
  exercises: LoggedExercise[];
  fromTemplateId?: string;
  note?: string;
}

export interface Settings {
  restSec: number;
  restSound: boolean;
}
