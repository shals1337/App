export interface Exercise {
  id: string;
  name: string;
}

export interface SetEntry {
  reps: number;
  weight: number;
}

export interface LoggedExercise {
  exerciseId: string;
  sets: SetEntry[];
}

export interface WorkoutSession {
  id: string;
  date: string;
  exercises: LoggedExercise[];
}
