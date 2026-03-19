import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { colors, fontFamily as fonts } from '../design-system';
import { useAuth } from '../lib/AuthContext';
import { getUserScores, updateProfile } from '../lib/supabase';

function timeAgo(dateStr) {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return 'Hace un momento';
  if (s < 3600) return `Hace ${Math.floor(s/60)}m`;
  if (s < 86400) return `Hace ${Math.floor(s/3600)}h`;
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

export default function Profile() {
  const [viewMode,   setViewMode]   = useState('cards');
  const [scores,     setScores]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [editName,   setEditName]   = useState(false);
  const [newName,    setNewName]    = useState('');
  const [savingName, setSavingName] = useState(false);
  const { user, displayName } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    getUserScores(user.id).then(s => { setScores(s); setLoading(false); });
    setNewName(displayName);
  }, [user, displayName]);

  const handleSaveName = async () => {
    if (!user || !newName.trim()) return;
    setSavingName(true);
    try { await updateProfile(user.id, { display_name: newName.trim() }); setEditName(false); }
    catch {}
    finally { setSavingName(false); }
  };

  const handleShare = (s) => {
    const text = `¡Acabo de conseguir ${s.score} palabras en TypeRush${s.theme ? ` (${s.theme})` : ''}! 🔥 typerush.vercel.app`;
    navigator.clipboard.writeText(text);
  };

  const stats = {
    total: scores.length,
    best:  scores.reduce((m, s) => Math.max(m, s.score), 0),
    avg:   scores.length ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length) : 0,
    words: scores.reduce((a, s) => a + s.score, 0),
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background, padding: 'clamp(20px,4vw,32px)' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: 'clamp(24px,4vw,40px)', marginBottom: 'clamp(24px,4vw,32px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(16px,3vw,24px)', marginBottom: 'clamp(20px,3vw,24px)', flexWrap: 'wrap' }}>
            <div style={{ fontSize: 'clamp(48px,8vw,64px)', width: 'clamp(80px,12vw,100px)', height: 'clamp(80px,12vw,100px)', backgroundColor: colors.background, border: `2px solid ${colors.accent}`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              {editName ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <input value={newName} onChange={e => setNewName(e.target.value)} maxLength={20}
                    style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(18px,3vw,24px)', textTransform: 'uppercase', backgroundColor: colors.background, border: `1px solid ${colors.accent}`, borderRadius: '4px', color: colors.textPrimary, padding: '4px 8px', outline: 'none' }} />
                  <button onClick={handleSaveName} disabled={savingName} style={{ fontFamily: fonts.mono, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', padding: '6px 12px', border: 'none', backgroundColor: colors.accent, color: '#000', borderRadius: '4px', cursor: 'pointer' }}>
                    {savingName ? '...' : 'OK'}
                  </button>
                  <button onClick={() => setEditName(false)} style={{ fontFamily: fonts.mono, fontSize: '11px', padding: '6px 10px', border: `1px solid ${colors.border}`, backgroundColor: 'transparent', color: colors.textSecondary, borderRadius: '4px', cursor: 'pointer' }}>✕</button>
                </div>
              ) : (
                <h1 style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(24px,4vw,32px)', textTransform: 'uppercase', letterSpacing: '-0.02em', color: colors.textPrimary, marginBottom: '4px' }}>
                  {displayName || 'SIN NOMBRE'}
                </h1>
              )}
              <p style={{ fontFamily: fonts.mono, fontSize: 'clamp(12px,2vw,14px)', color: colors.textSecondary }}>
                {user?.email} · Miembro desde {new Date(user?.created_at || '').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <button onClick={() => setEditName(true)}
              style={{ fontFamily: fonts.mono, fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', padding: '8px 16px', border: `1px solid ${colors.border}`, backgroundColor: 'transparent', color: colors.textPrimary, borderRadius: '4px', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = colors.accent; e.currentTarget.style.backgroundColor = 'rgba(0,255,135,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.backgroundColor = 'transparent'; }}>
              Editar nombre
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 'clamp(12px,2vw,16px)' }}>
            {[{ label: 'Partidas', value: stats.total }, { label: 'Media', value: stats.avg }, { label: 'Mejor', value: stats.best }, { label: 'Palabras', value: stats.words }].map(s => (
              <div key={s.label} style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}`, borderRadius: '4px', padding: 'clamp(12px,2vw,16px)', textAlign: 'center' }}>
                <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(24px,4vw,32px)', color: colors.accent, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '6px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Historial */}
        <div style={{ marginBottom: 'clamp(24px,4vw,32px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(16px,3vw,24px)', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(20px,3vw,28px)', textTransform: 'uppercase', letterSpacing: '-0.02em', color: colors.textPrimary }}>HISTORIAL</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['cards','list'].map(m => (
                <button key={m} onClick={() => setViewMode(m)}
                  style={{ fontFamily: fonts.mono, fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', padding: '6px 14px', border: `1px solid ${viewMode === m ? colors.accent : colors.border}`, backgroundColor: viewMode === m ? 'rgba(0,255,135,0.05)' : 'transparent', color: viewMode === m ? colors.accent : colors.textMuted, borderRadius: '4px', cursor: 'pointer' }}>
                  {m === 'cards' ? '⊞ Cards' : '≡ Lista'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p style={{ fontFamily: fonts.mono, fontSize: '13px', color: colors.textMuted, padding: '32px 0', textAlign: 'center' }}>CARGANDO...</p>
          ) : scores.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'clamp(40px,6vw,60px) 20px', backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '8px' }}>
              <p style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(20px,3vw,28px)', textTransform: 'uppercase', color: colors.textPrimary, marginBottom: '12px' }}>AÚN NO HAS JUGADO</p>
              <p style={{ fontFamily: fonts.mono, fontSize: '13px', color: colors.textSecondary, marginBottom: '24px' }}>Juega tu primera partida y aparecerá aquí.</p>
              <button onClick={() => navigate('/jugar')} style={{ fontFamily: fonts.mono, fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', padding: '12px 32px', border: 'none', backgroundColor: colors.accent, color: '#000', borderRadius: '4px', cursor: 'pointer' }}>JUGAR AHORA</button>
            </div>
          ) : viewMode === 'cards' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 'clamp(12px,2vw,16px)' }}>
              {scores.map((s, i) => (
                <div key={s.id || i} style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: 'clamp(16px,2.5vw,20px)', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = colors.borderMedium; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(14px,2vw,16px)', textTransform: 'uppercase', color: colors.textPrimary }}>{s.theme || 'PACK GENERAL'}</div>
                      <div style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textMuted, marginTop: '2px' }}>{timeAgo(s.created_at)}</div>
                    </div>
                    {s.combo_level && <span style={{ fontFamily: fonts.mono, fontWeight: 700, fontSize: '13px', color: s.combo_level === 'x20' ? colors.combo20 : colors.combo5 }}>{s.combo_level === 'x20' ? '×20 🔥' : '×5 🔥'}</span>}
                  </div>
                  <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(36px,6vw,48px)', color: colors.accent, lineHeight: 1, marginBottom: '8px' }}>{s.score}</div>
                  <div style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>palabras en 60 seg</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => navigate('/jugar')} style={{ flex: 1, fontFamily: fonts.mono, fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', padding: '8px', border: `1px solid ${colors.border}`, backgroundColor: 'transparent', color: colors.textSecondary, borderRadius: '4px', cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = colors.accent; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; }}>
                      🎮 Jugar
                    </button>
                    <button onClick={() => handleShare(s)} style={{ flex: 1, fontFamily: fonts.mono, fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', padding: '8px', border: `1px solid ${colors.border}`, backgroundColor: 'transparent', color: colors.textSecondary, borderRadius: '4px', cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = colors.accent; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; }}>
                      📤 Compartir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '8px', overflowX: 'auto' }}>
              {scores.map((s, i) => (
                <div key={s.id || i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: '16px', alignItems: 'center', padding: '16px 20px', borderBottom: i < scores.length - 1 ? `1px solid ${colors.border}` : 'none', minWidth: '500px' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = colors.background; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  <div>
                    <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: '15px', textTransform: 'uppercase', color: colors.textPrimary }}>{s.theme || 'GENERAL'}</div>
                    <div style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textMuted }}>{timeAgo(s.created_at)}</div>
                  </div>
                  <div style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.textSecondary }}>{s.score} palabras</div>
                  <div style={{ fontFamily: fonts.mono, fontWeight: 600, fontSize: '14px', color: s.combo_level === 'x20' ? colors.combo20 : s.combo_level === 'x5' ? colors.combo5 : colors.textMuted, minWidth: '60px', textAlign: 'center' }}>
                    {s.combo_level ? `${s.combo_level === 'x20' ? '×20' : '×5'} 🔥` : '—'}
                  </div>
                  <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: '24px', color: colors.accent }}>{s.score}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => navigate('/jugar')} style={{ fontFamily: fonts.mono, fontSize: '14px', padding: '8px 12px', border: `1px solid ${colors.border}`, backgroundColor: 'transparent', color: colors.textPrimary, borderRadius: '4px', cursor: 'pointer' }}>🎮</button>
                    <button onClick={() => handleShare(s)} style={{ fontFamily: fonts.mono, fontSize: '14px', padding: '8px 12px', border: `1px solid ${colors.border}`, backgroundColor: 'transparent', color: colors.textPrimary, borderRadius: '4px', cursor: 'pointer' }}>📤</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ height: '1px', backgroundColor: colors.border, margin: 'clamp(40px,6vw,60px) 0' }} />
        <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'clamp(24px,4vw,32px) 0', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(16px,2.5vw,18px)', textTransform: 'uppercase' }}>
            <span style={{ color: colors.textPrimary }}>TYPE</span><span style={{ color: colors.accent }}>RUSH</span>
            <span style={{ color: colors.textSecondary, fontFamily: fonts.mono, fontSize: '10px', fontWeight: 400, marginLeft: '8px' }}>— TU BREAK DIARIO DE 60 SEGUNDOS</span>
          </div>
          <a href="https://andreurobuste.com/plaigrund" target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.numberMuted, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.color = colors.accent; }}
            onMouseLeave={e => { e.currentTarget.style.color = colors.numberMuted; }}>
            andreurobuste.com/plaigrund — 2026®
          </a>
        </footer>
      </div>
    </div>
  );
}
