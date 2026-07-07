import { useState } from 'react';
import { AppProvider, useApp } from './state/AppContext';
import { AuthProvider, useAuth } from './state/AuthContext';
import { ExercisesHome } from './views/ExercisesHome';
import { ExerciseDetail } from './views/ExerciseDetail';
import { WeightView } from './views/WeightView';
import { NutritionView } from './views/NutritionView';
import { AuthView } from './views/AuthView';
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
      <div className="aurora" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>
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

function Root() {
  const { status } = useAuth();
  const [skipped, setSkipped] = useState(false);

  if (status === 'loading') {
    return (
      <div className="app auth-app">
        <div className="aurora" aria-hidden="true">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
        </div>
        <div className="splash">
          <div className="auth-logo">
            <DumbbellIcon size={30} />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'signedOut' && !skipped) {
    return <AuthView onSkip={() => setSkipped(true)} />;
  }

  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
