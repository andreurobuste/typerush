import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { colors, fontFamily as fonts } from '../design-system';
import { useAuth } from '../lib/AuthContext';
import { getMyScores, deleteAccount } from '../lib/supabase';
import { useLang } from '../components/Layout';

function timeAgo(dateStr, lang) {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (lang === 'en')  return s < 60 ? 'Just now'       : s < 3600 ? `${Math.floor(s/60)}m ago`  : s < 86400 ? `${Math.floor(s/3600)}h ago`  : new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  if (lang === 'cat') return s < 60 ? 'Fa un moment'   : s < 3600 ? `Fa ${Math.floor(s/60)}m`   : s < 86400 ? `Fa ${Math.floor(s/3600)}h`   : new Date(dateStr).toLocaleDateString('ca-ES', { day: '2-digit', month: 'short' });
  return                     s < 60 ? 'Hace un momento': s < 3600 ? `Hace ${Math.floor(s/60)}m` : s < 86400 ? `Hace ${Math.floor(s/3600)}h` : new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

export default function Profile() {
  const { lang } = useLang();
  const { user, displayName, anonId } = useAuth();
  const navigate = useNavigate();

  const [scores,        setScores]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting,      setDeleting]      = useState(false);

  useEffect(() => {
    getMyScores(user?.id, anonId).then(s => { setScores(s); setLoading(false); });
  }, [user, anonId]);

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    await deleteAccount(user.id);
    navigate('/');
  };

  const stats = {
    total: scores.length,
    best:  scores.reduce((m, s) => Math.max(m, s.score), 0),
    avg:   scores.length ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length) : 0,
  };

  const T = {
    title:      lang === 'en' ? 'MY PROFILE'      : lang === 'cat' ? 'EL MEU PERFIL'    : 'MI PERFIL',
    games:      lang === 'en' ? 'Games'            : lang === 'cat' ? 'Partides'         : 'Partidas',
    best:       lang === 'en' ? 'Best'             : lang === 'cat' ? 'Millor'           : 'Mejor',
    avg:        lang === 'en' ? 'Average'          : lang === 'cat' ? 'Mitjana'          : 'Media',
    history:    lang === 'en' ? 'GAME HISTORY'     : lang === 'cat' ? 'HISTORIAL'        : 'HISTORIAL',
    noGames:    lang === 'en' ? "YOU HAVEN'T PLAYED YET" : lang === 'cat' ? 'ENCARA NO HAS JUGAT' : 'AÚN NO HAS JUGADO',
    noGamesSub: lang === 'en' ? 'Play your first game and it will appear here.' : lang === 'cat' ? 'Juga la teva primera partida i apareixerà aquí.' : 'Juega tu primera partida y aparecerá aquí.',
    play:       lang === 'en' ? 'PLAY NOW'         : lang === 'cat' ? 'JUGAR ARA'        : 'JUGAR AHORA',
    words:      lang === 'en' ? 'words in 60s'     : lang === 'cat' ? 'paraules en 60s'  : 'palabras en 60s',
    delete:     lang === 'en' ? 'Delete account'   : lang === 'cat' ? 'Eliminar compte'  : 'Eliminar cuenta',
    deleteWarn: lang === 'en' ? 'This action is irreversible. All your data will be deleted.' : lang === 'cat' ? 'Aquesta acció és irreversible. Totes les teves dades seran eliminades.' : 'Esta acción es irreversible. Todos tus datos serán eliminados.',
    deleteConfirm: lang === 'en' ? 'Yes, delete everything' : lang === 'cat' ? 'Sí, eliminar-ho tot' : 'Sí, eliminar todo',
    cancel:     lang === 'en' ? 'Cancel'           : lang === 'cat' ? 'Cancel·lar'       : 'Cancelar',
    anonNote:   lang === 'en' ? 'You are browsing as a guest. Create a profile to access your history from any device.' : lang === 'cat' ? 'Estàs navegant com a convidat. Crea un perfil per accedir al teu historial des de qualsevol dispositiu.' : 'Estás navegando como invitado. Crea un perfil para acceder a tu historial desde cualquier dispositivo.',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background, padding: 'clamp(20px,4vw,32px)' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 'clamp(32px,5vw,48px)' }}>
          <h1 style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(32px,6vw,56px)', textTransform: 'uppercase', letterSpacing: '-0.02em', color: colors.textPrimary, lineHeight: 1 }}>
            {displayName ? displayName.toUpperCase() : T.title}
          </h1>
          {user && <p style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.textMuted, marginTop: '8px' }}>{user.email}</p>}
        </div>

        {/* Aviso si es anónimo */}
        {!user && (
          <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.borderMedium}`, borderRadius: '8px', padding: '16px 20px', marginBottom: '32px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ color: colors.combo5, fontSize: '16px', flexShrink: 0 }}>⚠</span>
            <p style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.textSecondary, lineHeight: 1.6 }}>{T.anonNote}</p>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(12px,2vw,16px)', marginBottom: 'clamp(32px,5vw,48px)' }}>
          {[{ label: T.games, value: stats.total }, { label: T.best, value: stats.best }, { label: T.avg, value: stats.avg }].map(s => (
            <div key={s.label} style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, padding: 'clamp(16px,3vw,24px)', textAlign: 'center' }}>
              <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(28px,5vw,48px)', color: colors.accent, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '8px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ height: '1px', backgroundColor: colors.border, marginBottom: 'clamp(32px,5vw,48px)' }} />

        {/* Historial */}
        <h2 style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(20px,3vw,28px)', textTransform: 'uppercase', letterSpacing: '-0.02em', color: colors.textPrimary, marginBottom: 'clamp(20px,3vw,28px)' }}>{T.history}</h2>

        {loading ? (
          <p style={{ fontFamily: fonts.mono, fontSize: '13px', color: colors.textMuted, padding: '32px 0', textAlign: 'center', letterSpacing: '0.1em' }}>LOADING...</p>
        ) : scores.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'clamp(40px,6vw,60px) 20px', backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
            <p style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(18px,3vw,24px)', textTransform: 'uppercase', color: colors.textPrimary, marginBottom: '12px' }}>{T.noGames}</p>
            <p style={{ fontFamily: fonts.mono, fontSize: '13px', color: colors.textSecondary, marginBottom: '24px' }}>{T.noGamesSub}</p>
            <button onClick={() => navigate('/jugar')}
              style={{ fontFamily: fonts.mono, fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '12px 32px', border: 'none', backgroundColor: colors.accent, color: '#000', cursor: 'pointer' }}>
              {T.play}
            </button>
          </div>
        ) : (
          <div>
            {scores.map((s, i) => (
              <div key={s.id || i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 'clamp(12px,2vw,20px)', alignItems: 'center', padding: 'clamp(14px,2vw,18px) 0', borderBottom: `1px solid ${colors.border}`, transition: 'background-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = colors.surface; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                <div>
                  <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(13px,2vw,16px)', textTransform: 'uppercase', color: colors.textPrimary }}>{s.theme || 'PACK GENERAL'}</div>
                  <div style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textMuted, marginTop: '2px' }}>{timeAgo(s.created_at, lang)}</div>
                </div>
                {s.combo_level && (
                  <span style={{ fontFamily: fonts.mono, fontWeight: 700, fontSize: '13px', color: s.combo_level === 'x20' ? colors.combo20 : colors.combo5 }}>
                    {s.combo_level === 'x20' ? '×20 🔥' : '×5 🔥'}
                  </span>
                )}
                <div style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.textMuted }}>{s.score} {T.words}</div>
                <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(22px,3vw,28px)', color: colors.accent, textAlign: 'right', minWidth: '50px' }}>{s.score}</div>
              </div>
            ))}
          </div>
        )}

        {/* Eliminar cuenta — solo si está logueado */}
        {user && (
          <>
            <div style={{ height: '1px', backgroundColor: colors.border, margin: 'clamp(40px,6vw,60px) 0 clamp(24px,4vw,32px)' }} />
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)}
                style={{ fontFamily: fonts.mono, fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '10px 20px', border: `1px solid ${colors.error}`, backgroundColor: 'transparent', color: colors.error, borderRadius: '4px', cursor: 'pointer', opacity: 0.6, transition: 'opacity 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '0.6'; }}>
                {T.delete}
              </button>
            ) : (
              <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.error}`, borderRadius: '8px', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '480px' }}>
                <p style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.textSecondary, lineHeight: 1.6 }}>{T.deleteWarn}</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={handleDelete} disabled={deleting}
                    style={{ fontFamily: fonts.mono, fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '10px 20px', border: 'none', backgroundColor: colors.error, color: '#fff', borderRadius: '4px', cursor: deleting ? 'not-allowed' : 'pointer' }}>
                    {deleting ? '...' : T.deleteConfirm}
                  </button>
                  <button onClick={() => setConfirmDelete(false)}
                    style={{ fontFamily: fonts.mono, fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '10px 20px', border: `1px solid ${colors.border}`, backgroundColor: 'transparent', color: colors.textSecondary, borderRadius: '4px', cursor: 'pointer' }}>
                    {T.cancel}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div style={{ height: '1px', backgroundColor: colors.border, margin: 'clamp(40px,6vw,60px) 0 0' }} />
        <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'clamp(24px,4vw,32px) 0', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(16px,2.5vw,18px)', textTransform: 'uppercase' }}>
            <span style={{ color: colors.textPrimary }}>TYPE</span>
            <span style={{ color: colors.accent }}>RUSH</span>
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
