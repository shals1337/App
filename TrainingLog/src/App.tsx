import { useState } from 'react';
import { AppProvider, useApp } from './state/AppContext';
import { ExercisesHome } from './views/ExercisesHome';
import { ExerciseDetail } from './views/ExerciseDetail';
import { WeightView } from './views/WeightView';
import { NutritionView } from './views/NutritionView';
import { DumbbellIcon, FlameIcon, ScaleIcon } from './components/Icons';
import './App.css';

type Tab = 'exercises' | 'nutrition' | 'weight';

function Shell() {
  const { exerciseById, trackExercise } = useApp();
  const [tab, setTab] = useState<Tab>('exercises');
  const [openId, setOpenId] = useState<string | null>(null);

  const open = openId ? exerciseById(openId) : undefined;

  function openExercise(id: string) {
    trackExercise(id);
    setOpenId(id);
  }

  return (
    <div className="app">
      <main className="content">
        {tab === 'exercises' &&
          (open ? (
            <ExerciseDetail exercise={open} onBack={() => setOpenId(null)} />
          ) : (
            <ExercisesHome onOpenExercise={openExercise} />
          ))}
        {tab === 'nutrition' && <NutritionView />}
        {tab === 'weight' && <WeightView />}
      </main>

      <nav className="bottom-nav">
        <button
          className={tab === 'exercises' ? 'nav-item active' : 'nav-item'}
          onClick={() => {
            setTab('exercises');
            if (tab === 'exercises') setOpenId(null);
          }}
          aria-label="Øvelser"
        >
          <DumbbellIcon size={22} />
          <span className="nav-label">Øvelser</span>
        </button>
        <button
          className={tab === 'nutrition' ? 'nav-item active' : 'nav-item'}
          onClick={() => setTab('nutrition')}
          aria-label="Kost"
        >
          <FlameIcon size={22} />
          <span className="nav-label">Kost</span>
        </button>
        <button
          className={tab === 'weight' ? 'nav-item active' : 'nav-item'}
          onClick={() => setTab('weight')}
          aria-label="Min vægt"
        >
          <ScaleIcon size={22} />
          <span className="nav-label">Min vægt</span>
        </button>
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
