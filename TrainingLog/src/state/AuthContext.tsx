/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export type AuthStatus = 'local' | 'loading' | 'signedOut' | 'signedIn';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login')) return 'Forkert email eller adgangskode.';
  if (m.includes('already registered')) return 'Der findes allerede en konto med den email.';
  if (m.includes('password')) return 'Adgangskoden skal være mindst 6 tegn.';
  if (m.includes('email')) return 'Indtast en gyldig email.';
  return 'Noget gik galt. Prøv igen.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(
    isSupabaseConfigured ? 'loading' : 'local',
  );
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      if (s?.user) {
        setUser({ id: s.user.id, email: s.user.email ?? '' });
        setStatus('signedIn');
      } else {
        setStatus('signedOut');
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? '' });
        setStatus('signedIn');
      } else {
        setUser(null);
        setStatus('signedOut');
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthState = {
    status,
    user,
    async signUp(email, password) {
      if (!supabase) return null;
      const { error } = await supabase.auth.signUp({ email, password });
      return error ? friendlyError(error.message) : null;
    },
    async signIn(email, password) {
      if (!supabase) return null;
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? friendlyError(error.message) : null;
    },
    async signOut() {
      if (!supabase) return;
      await supabase.auth.signOut();
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth outside AuthProvider');
  return ctx;
}
