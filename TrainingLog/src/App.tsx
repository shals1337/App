import { useEffect, useState } from 'react';
import type { Exercise, WorkoutSession } from './types';
import { loadExercises, loadSessions, saveExercises, saveSessions } from './storage';
import { LogWorkoutView } from './components/LogWorkoutView';
import { HistoryView } from './components/HistoryView';
import { ProgressView } from './components/ProgressView';
import { ExercisesView } from './components/ExercisesView';
import './App.css';

type Tab = 'log' | 'history' | 'progress' | 'exercises';

const TABS: { id: Tab; label: string }[] = [
  { id: 'log', label: 'Log' },
  { id: 'history', label: 'History' },
  { id: 'progress', label: 'Progress' },
  { id: 'exercises', label: 'Exercises' },
];

function App() {
  const [tab, setTab] = useState<Tab>('log');
  const [exercises, setExercises] = useState<Exercise[]>(() => loadExercises());
  const [sessions, setSessions] = useState<WorkoutSession[]>(() => loadSessions());

  useEffect(() => saveExercises(exercises), [exercises]);
  useEffect(() => saveSessions(sessions), [sessions]);

  function addSession(session: WorkoutSession) {
    setSessions((prev) => [...prev, session]);
    setTab('history');
  }

  function deleteSession(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Training Log</h1>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={t.id === tab ? 'tab active' : 'tab'}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main>
        {tab === 'log' && <LogWorkoutView exercises={exercises} onSaveSession={addSession} />}
        {tab === 'history' && (
          <HistoryView sessions={sessions} exercises={exercises} onDeleteSession={deleteSession} />
        )}
        {tab === 'progress' && <ProgressView sessions={sessions} exercises={exercises} />}
        {tab === 'exercises' && (
          <ExercisesView exercises={exercises} onChange={setExercises} />
        )}
      </main>
    </div>
  );
}

export default App;
