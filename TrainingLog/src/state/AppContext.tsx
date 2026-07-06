/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type {
  BodyWeightEntry,
  Exercise,
  FoodEntry,
  LogEntry,
  NutritionGoals,
} from '../types';
import { BUILTIN_EXERCISES } from '../data/exercises';
import {
  type ImportPayload,
  loadBodyWeight,
  loadCustomExercises,
  loadFood,
  loadGoals,
  loadLogs,
  loadTracked,
  saveBodyWeight,
  saveCustomExercises,
  saveFood,
  saveGoals,
  saveLogs,
  saveTracked,
} from '../storage';

interface AppState {
  /** full library: built-in + custom, alphabetical */
  exercises: Exercise[];
  /** exercise ids the user tracks, in the order they were added */
  tracked: string[];
  logs: LogEntry[];
  bodyWeight: BodyWeightEntry[];
  food: FoodEntry[];
  goals: NutritionGoals;
  exerciseById: (id: string) => Exercise | undefined;
  logsFor: (exerciseId: string) => LogEntry[];
  trackExercise: (id: string) => void;
  untrackExercise: (id: string) => void;
  addCustomExercise: (e: Exercise) => void;
  addLog: (l: LogEntry) => void;
  deleteLog: (id: string) => void;
  addBodyWeight: (e: BodyWeightEntry) => void;
  deleteBodyWeight: (date: string) => void;
  addFood: (e: FoodEntry) => void;
  deleteFood: (id: string) => void;
  setGoals: (g: NutritionGoals) => void;
  importData: (payload: ImportPayload) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [customExercises, setCustomExercises] = useState(loadCustomExercises);
  const [tracked, setTracked] = useState(loadTracked);
  const [logs, setLogs] = useState(loadLogs);
  const [bodyWeight, setBodyWeight] = useState(loadBodyWeight);
  const [food, setFood] = useState(loadFood);
  const [goals, setGoalsState] = useState(loadGoals);

  useEffect(() => saveCustomExercises(customExercises), [customExercises]);
  useEffect(() => saveTracked(tracked), [tracked]);
  useEffect(() => saveLogs(logs), [logs]);
  useEffect(() => saveBodyWeight(bodyWeight), [bodyWeight]);
  useEffect(() => saveFood(food), [food]);
  useEffect(() => saveGoals(goals), [goals]);

  const exercises = [...BUILTIN_EXERCISES, ...customExercises].sort((a, b) =>
    a.name.localeCompare(b.name, 'da'),
  );

  const value: AppState = {
    exercises,
    tracked,
    logs,
    bodyWeight,
    food,
    goals,
    exerciseById: (id) => exercises.find((e) => e.id === id),
    logsFor: (exerciseId) =>
      logs
        .filter((l) => l.exerciseId === exerciseId)
        .sort((a, b) => a.date.localeCompare(b.date)),
    trackExercise: (id) =>
      setTracked((prev) => (prev.includes(id) ? prev : [...prev, id])),
    untrackExercise: (id) => {
      setTracked((prev) => prev.filter((x) => x !== id));
      setLogs((prev) => prev.filter((l) => l.exerciseId !== id));
    },
    addCustomExercise: (e) => setCustomExercises((prev) => [...prev, e]),
    addLog: (l) => setLogs((prev) => [...prev, l]),
    deleteLog: (id) => setLogs((prev) => prev.filter((l) => l.id !== id)),
    addBodyWeight: (entry) =>
      setBodyWeight((prev) => [...prev.filter((e) => e.date !== entry.date), entry]),
    deleteBodyWeight: (date) =>
      setBodyWeight((prev) => prev.filter((e) => e.date !== date)),
    addFood: (entry) => setFood((prev) => [...prev, entry]),
    deleteFood: (id) => setFood((prev) => prev.filter((e) => e.id !== id)),
    setGoals: setGoalsState,
    importData: (payload) => {
      setLogs(payload.logs);
      setTracked(payload.tracked);
      setCustomExercises(payload.customExercises);
      setBodyWeight(payload.bodyWeight);
      setFood(payload.food);
      setGoalsState(payload.goals);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp outside AppProvider');
  return ctx;
}
