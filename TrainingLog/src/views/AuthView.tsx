import { useState } from 'react';
import { useAuth } from '../state/AuthContext';
import { DumbbellIcon } from '../components/Icons';

interface Props {
  onSkip: () => void;
}

export function AuthView({ onSkip }: Props) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  async function submit() {
    if (busy) return;
    setError(null);
    setInfo(null);
    if (!email.trim() || password.length < 6) {
      setError('Skriv din email og en adgangskode på mindst 6 tegn.');
      return;
    }
    setBusy(true);
    const err =
      mode === 'in'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password);
    setBusy(false);
    if (err) {
      setError(err);
    } else if (mode === 'up') {
      setInfo('Konto oprettet! Tjek evt. din email for at bekræfte, og log ind.');
      setMode('in');
    }
  }

  return (
    <div className="app auth-app">
      <div className="aurora" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <div className="auth-screen">
        <div className="auth-brand">
          <div className="auth-logo">
            <DumbbellIcon size={30} />
          </div>
          <h1>Min Træning</h1>
          <p className="muted">Log ind for at synkronisere din træning på alle dine enheder.</p>
        </div>

        <div className="card auth-card">
          <div className="auth-tabs">
            <button
              className={mode === 'in' ? 'auth-tab active' : 'auth-tab'}
              onClick={() => {
                setMode('in');
                setError(null);
              }}
            >
              Log ind
            </button>
            <button
              className={mode === 'up' ? 'auth-tab active' : 'auth-tab'}
              onClick={() => {
                setMode('up');
                setError(null);
              }}
            >
              Opret konto
            </button>
          </div>

          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="dig@email.dk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="auth-field">
            <span>Adgangskode</span>
            <input
              type="password"
              autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
              placeholder="Mindst 6 tegn"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
          </label>

          {error && <p className="auth-error">{error}</p>}
          {info && <p className="auth-info">{info}</p>}

          <button className="cta" onClick={submit} disabled={busy}>
            {busy ? 'Et øjeblik…' : mode === 'in' ? 'Log ind' : 'Opret konto'}
          </button>
        </div>

        <button className="text-btn auth-skip" onClick={onSkip}>
          Fortsæt uden konto
        </button>
      </div>
    </div>
  );
}
