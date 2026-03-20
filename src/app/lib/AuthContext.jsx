
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getAnonId, migrateAnonScores } from './supabase';

const AuthContext = createContext({ user: null, loading: true, displayName: '', anonId: '' });

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const anonId = getAnonId(); // siempre disponible

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      setLoading(false);
      // Si acaba de iniciar sesión, migrar puntuaciones anónimas
      if (newUser && _event === 'SIGNED_IN') {
        await migrateAnonScores(newUser.id, anonId);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const displayName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] || '';

  return (
    <AuthContext.Provider value={{ user, loading, displayName, anonId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
