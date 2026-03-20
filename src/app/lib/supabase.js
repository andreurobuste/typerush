import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oouymyeacwtixublgfhj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2yu2F9_cWEbk1p5pJAxxAg_RRgViind';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── ID ANÓNIMO ────────────────────────────────────────────────────────────────
// Se crea automáticamente en la primera visita y persiste en el navegador
export function getAnonId() {
  let id = localStorage.getItem('typerush_anon_id');
  if (!id) {
    id = 'anon_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('typerush_anon_id', id);
  }
  return id;
}

// ── MAGIC LINK ────────────────────────────────────────────────────────────────
export async function sendMagicLink(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/` },
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ── SCORES ────────────────────────────────────────────────────────────────────
export async function saveScore({ playerName, score, bestCombo, comboLevel, lang, theme, userId, anonId }) {
  const { error } = await supabase.from('scores').insert({
    player_name: playerName || 'Anónimo',
    score,
    best_combo: bestCombo,
    combo_level: comboLevel,
    lang,
    theme: theme || null,
    user_id: userId || null,
    anon_id: anonId || null,
  });
  return !error;
}

export async function getRecentScores(limit = 10) {
  const { data } = await supabase
    .from('scores')
    .select('player_name, score, combo_level, lang, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}

export async function getTotalPlayers() {
  const { count } = await supabase
    .from('scores')
    .select('*', { count: 'exact', head: true });
  return count || 0;
}

export async function getMyScores(userId, anonId) {
  // Primero intentamos por user_id si está logueado
  if (userId) {
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return data || [];
  }
  // Si no, por anon_id
  if (anonId) {
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('anon_id', anonId)
      .order('created_at', { ascending: false });
    return data || [];
  }
  return [];
}

// Migrar puntuaciones anónimas al usuario registrado
export async function migrateAnonScores(userId, anonId) {
  if (!userId || !anonId) return;
  await supabase
    .from('scores')
    .update({ user_id: userId })
    .eq('anon_id', anonId)
    .is('user_id', null);
}

// ── DELETE ACCOUNT via Edge Function ─────────────────────────────────────────
export async function deleteAccount() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No session');

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/delete-user`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ userId: session.user.id }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Error deleting account');
  }

  await supabase.auth.signOut();
  return true;
}
