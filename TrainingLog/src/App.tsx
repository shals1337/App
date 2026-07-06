import { useState } from 'react';
import { AppProvider, useApp } from './state/AppContext';
import { HomeView } from './views/HomeView';
import { HistoryView } from './views/HistoryView';
import { StartWorkoutView } from './views/StartWorkoutView';
import { ExercisesView } from './views/ExercisesView';
import { ProgressView } from './views/ProgressView';
import { ActiveWorkoutView } from './views/ActiveWorkoutView';
import {
  ChartIcon,
  DumbbellIcon,
  HistoryIcon,
  HomeIcon,
  PlusIcon,
} from './components/Icons';
import './App.css';

type Tab = 'home' | 'history' | 'workout' | 'exercises' | 'progress';

const TABS: { id: Tab; label: string; icon: typeof HomeIcon }[] = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'history', label: 'History', icon: HistoryIcon },
  { id: 'workout', label: 'Workout', icon: PlusIcon },
  { id: 'exercises', label: 'Exercises', icon: DumbbellIcon },
  { id: 'progress', label: 'Progress', icon: ChartIcon },
];

function Shell() {
  const { active } = useApp();
  const [tab, setTab] = useState<Tab>('home');
  const [inWorkout, setInWorkout] = useState(false);
  const [openSessionId, setOpenSessionId] = useState<string | null>(null);

  if (inWorkout) {
    return (
      <ActiveWorkoutView
        onDone={() => {
          setInWorkout(false);
          setTab('home');
        }}
      />
    );
  }

  return (
    <div className="app">
      <main className="content">
        {tab === 'home' && (
          <HomeView
            onStartWorkout={() => {
              if (active) setInWorkout(true);
              else setTab('workout');
            }}
            onOpenSession={(id) => {
              setOpenSessionId(id);
              setTab('history');
            }}
          />
        )}
        {tab === 'history' && (
          <HistoryView openSessionId={openSessionId} onOpenSession={setOpenSessionId} />
        )}
        {tab === 'workout' && <StartWorkoutView onBegin={() => setInWorkout(true)} />}
        {tab === 'exercises' && <ExercisesView />}
        {tab === 'progress' && <ProgressView />}
      </main>

      {active && !inWorkout && (
        <button className="resume-pill" onClick={() => setInWorkout(true)}>
          Workout in progress — tap to resume
        </button>
      )}

      <nav className="bottom-nav">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isWorkoutTab = t.id === 'workout';
          return (
            <button
              key={t.id}
              className={
                (t.id === tab ? 'nav-item active' : 'nav-item') +
                (isWorkoutTab ? ' nav-workout' : '')
              }
              onClick={() => {
                if (t.id === 'history') setOpenSessionId(null);
                setTab(t.id);
              }}
              aria-label={t.label}
            >
              <span className={isWorkoutTab ? 'nav-plus' : ''}>
                <Icon size={isWorkoutTab ? 24 : 22} />
              </span>
              <span className="nav-label">{t.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
