import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oouymyeacwtixublgfhj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2yu2F9_cWEbk1p5pJAxxAg_RRgViind';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function signUp(email, password, displayName) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { display_name: displayName } },
  });
  if (error) throw error;
  if (data.user) {
    await supabase.from('profiles').upsert({ id: data.user.id, display_name: displayName });
  }
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/` },
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function sendPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function saveScore({ playerName, score, bestCombo, comboLevel, lang, theme, userId }) {
  const { error } = await supabase.from('scores').insert({
    player_name: playerName,
    score,
    best_combo: bestCombo,
    combo_level: comboLevel,
    lang,
    theme: theme || null,
    user_id: userId || null,
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

export async function getUserScores(userId) {
  const { data } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function updateProfile(userId, updates) {
  const { error } = await supabase.from('profiles').upsert({ id: userId, ...updates });
  if (error) throw error;
}
