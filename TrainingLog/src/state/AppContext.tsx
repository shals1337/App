/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type {
  ActiveWorkout,
  BodyWeightEntry,
  Exercise,
  Settings,
  Template,
  WorkoutSession,
} from '../types';
import { BUILTIN_EXERCISES } from '../data/exercises';
import {
  loadActiveWorkout,
  loadBodyWeight,
  loadCustomExercises,
  loadSessions,
  loadSettings,
  loadTemplates,
  saveActiveWorkout,
  saveBodyWeight,
  saveCustomExercises,
  saveSessions,
  saveSettings,
  saveTemplates,
} from '../storage';

interface AppState {
  exercises: Exercise[];
  customExercises: Exercise[];
  sessions: WorkoutSession[];
  templates: Template[];
  bodyWeight: BodyWeightEntry[];
  active: ActiveWorkout | null;
  settings: Settings;
  exerciseById: (id: string) => Exercise | undefined;
  addCustomExercise: (e: Exercise) => void;
  renameCustomExercise: (id: string, name: string) => void;
  deleteCustomExercise: (id: string) => void;
  addSession: (s: WorkoutSession) => void;
  deleteSession: (id: string) => void;
  setTemplates: (t: Template[]) => void;
  addBodyWeight: (e: BodyWeightEntry) => void;
  deleteBodyWeight: (date: string) => void;
  setActive: (a: ActiveWorkout | null) => void;
  setSettings: (s: Settings) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [customExercises, setCustomExercises] = useState(loadCustomExercises);
  const [sessions, setSessions] = useState(loadSessions);
  const [templates, setTemplatesState] = useState(loadTemplates);
  const [bodyWeight, setBodyWeight] = useState(loadBodyWeight);
  const [active, setActiveState] = useState(loadActiveWorkout);
  const [settings, setSettingsState] = useState(loadSettings);

  useEffect(() => saveCustomExercises(customExercises), [customExercises]);
  useEffect(() => saveSessions(sessions), [sessions]);
  useEffect(() => saveTemplates(templates), [templates]);
  useEffect(() => saveBodyWeight(bodyWeight), [bodyWeight]);
  useEffect(() => saveActiveWorkout(active), [active]);
  useEffect(() => saveSettings(settings), [settings]);

  const exercises = [...BUILTIN_EXERCISES, ...customExercises].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const value: AppState = {
    exercises,
    customExercises,
    sessions,
    templates,
    bodyWeight,
    active,
    settings,
    exerciseById: (id) => exercises.find((e) => e.id === id),
    addCustomExercise: (e) => setCustomExercises((prev) => [...prev, e]),
    renameCustomExercise: (id, name) =>
      setCustomExercises((prev) =>
        prev.map((e) => (e.id === id ? { ...e, name } : e)),
      ),
    deleteCustomExercise: (id) =>
      setCustomExercises((prev) => prev.filter((e) => e.id !== id)),
    addSession: (s) => setSessions((prev) => [...prev, s]),
    deleteSession: (id) => setSessions((prev) => prev.filter((s) => s.id !== id)),
    setTemplates: setTemplatesState,
    addBodyWeight: (entry) =>
      setBodyWeight((prev) => [
        ...prev.filter((e) => e.date !== entry.date),
        entry,
      ]),
    deleteBodyWeight: (date) =>
      setBodyWeight((prev) => prev.filter((e) => e.date !== date)),
    setActive: setActiveState,
    setSettings: setSettingsState,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp outside AppProvider');
  return ctx;
}
