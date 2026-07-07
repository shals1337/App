/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useRef,
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
import { useAuth } from './AuthContext';
import { pullRemote, pushRemote } from '../lib/sync';

export type SyncStatus = 'off' | 'syncing' | 'synced';

interface AppState {
  exercises: Exercise[];
  tracked: string[];
  logs: LogEntry[];
  bodyWeight: BodyWeightEntry[];
  food: FoodEntry[];
  goals: NutritionGoals;
  syncStatus: SyncStatus;
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
  const { user } = useAuth();
  const [customExercises, setCustomExercises] = useState(loadCustomExercises);
  const [tracked, setTracked] = useState(loadTracked);
  const [logs, setLogs] = useState(loadLogs);
  const [bodyWeight, setBodyWeight] = useState(loadBodyWeight);
  const [food, setFood] = useState(loadFood);
  const [goals, setGoalsState] = useState(loadGoals);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('off');

  useEffect(() => saveCustomExercises(customExercises), [customExercises]);
  useEffect(() => saveTracked(tracked), [tracked]);
  useEffect(() => saveLogs(logs), [logs]);
  useEffect(() => saveBodyWeight(bodyWeight), [bodyWeight]);
  useEffect(() => saveFood(food), [food]);
  useEffect(() => saveGoals(goals), [goals]);

  function importData(payload: ImportPayload) {
    setLogs(payload.logs);
    setTracked(payload.tracked);
    setCustomExercises(payload.customExercises);
    setBodyWeight(payload.bodyWeight);
    setFood(payload.food);
    setGoalsState(payload.goals);
  }

  /* always-fresh snapshot of the synced slices */
  const stateRef = useRef<ImportPayload>({
    logs,
    tracked,
    customExercises,
    bodyWeight,
    food,
    goals,
  });
  stateRef.current = { logs, tracked, customExercises, bodyWeight, food, goals };

  const hydratedFor = useRef<string | null>(null);
  const skipPush = useRef(false);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /* on sign-in: pull the account's data (or migrate local data up for a new account) */
  useEffect(() => {
    if (!user) {
      hydratedFor.current = null;
      setSyncStatus('off');
      return;
    }
    if (hydratedFor.current === user.id) return;
    let cancelled = false;
    setSyncStatus('syncing');
    (async () => {
      const remote = await pullRemote(user.id);
      if (cancelled) return;
      if (remote) {
        skipPush.current = true;
        importData(remote.data);
      } else {
        await pushRemote(user.id, stateRef.current);
      }
      hydratedFor.current = user.id;
      setSyncStatus('synced');
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  /* on any change while signed in: debounce-push to the cloud */
  useEffect(() => {
    if (!user || hydratedFor.current !== user.id) return;
    if (skipPush.current) {
      skipPush.current = false;
      return;
    }
    setSyncStatus('syncing');
    clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(async () => {
      await pushRemote(user.id, stateRef.current);
      setSyncStatus('synced');
    }, 800);
    return () => clearTimeout(pushTimer.current);
  }, [logs, tracked, customExercises, bodyWeight, food, goals, user]);

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
    syncStatus,
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
    importData,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp outside AppProvider');
  return ctx;
}
