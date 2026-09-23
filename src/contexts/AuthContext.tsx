import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  // For dev fallback when Supabase is missing
  mockLogin: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  mockLogin: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mockSession, setMockSession] = useState(false); // To test without Supabase env

  useEffect(() => {
    // If no Supabase url configured, just stop loading
    if (!import.meta.env.VITE_SUPABASE_URL) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!error) {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    if (mockSession) {
      setMockSession(false);
      return;
    }
    await supabase.auth.signOut();
  };

  const mockLogin = () => {
    setMockSession(true);
  };

  const isAuthed = !!session || mockSession;

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut, mockLogin, ...({ isAuthed } as any) }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext) as AuthContextType & { isAuthed: boolean };
};
