import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getAnonId, migrateAnonScores } from './supabase';

const AuthContext = createContext({ user: null, loading: true, displayName: '', anonId: '' });

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const anonId = getAnonId();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      setLoading(false);

      if (newUser && _event === 'SIGNED_IN') {
        // Migrar puntuaciones anónimas
        await migrateAnonScores(newUser.id, anonId);

        // Aplicar nombre pendiente si existe
        const pendingName = localStorage.getItem('typerush_pending_name');
        if (pendingName) {
          await supabase.from('profiles').upsert({
            id: newUser.id,
            display_name: pendingName,
          });
          // Actualizar también user_metadata
          await supabase.auth.updateUser({
            data: { display_name: pendingName }
          });
          localStorage.removeItem('typerush_pending_name');
        } else if (!newUser.user_metadata?.display_name) {
          // Si no hay nombre pendiente, crear perfil mínimo
          await supabase.from('profiles').upsert({ id: newUser.id });
        }
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
