import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useOutletContext } from 'react-router';
import { colors, fontFamily as fonts, breakpoints } from '../design-system';
import { useAuth } from '../lib/AuthContext';
import { sendMagicLink, signOut } from '../lib/supabase';

export function useLang() { return useOutletContext(); }

export default function Layout() {
  const [lang,      setLang]      = useState('es');
  const [isMobile,  setIsMobile]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [email,     setEmail]     = useState('');
  const [username,  setUsername]  = useState('');
  const [mailSent,  setMailSent]  = useState(false);
  const [sending,   setSending]   = useState(false);
  const [mailError, setMailError] = useState('');
  const { user, loading, displayName } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoints.md);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleSendMagicLink = async (e) => {
    e.preventDefault();
    setMailError('');
    setSending(true);
    try {
      // Guardamos el nombre en localStorage para aplicarlo cuando confirme el email
      if (username.trim()) {
        localStorage.setItem('typerush_pending_name', username.trim());
      }
      await sendMagicLink(email);
      setMailSent(true);
    } catch {
      setMailError(
        lang === 'en'  ? 'Error sending email. Try again.' :
        lang === 'cat' ? 'Error enviant el correu. Torna a provar.' :
                         'Error al enviar el email. Inténtalo de nuevo.'
      );
    } finally {
      setSending(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setMenuOpen(false);
    navigate('/');
  };

  const openModal  = () => { setShowModal(true); setMailSent(false); setEmail(''); setUsername(''); setMailError(''); };
  const closeModal = () => setShowModal(false);

  // Textos según idioma
  const T = {
    profileLabel: lang === 'en' ? 'My profile'  : lang === 'cat' ? 'El meu perfil'    : 'Mi perfil',
    signOut:      lang === 'en' ? 'Sign out'     : lang === 'cat' ? 'Sortir'           : 'Salir',
    modalTitle:   lang === 'en' ? 'Create your profile' : lang === 'cat' ? 'Crea el teu perfil' : 'Crea tu perfil',
    modalSub:     lang === 'en' ? "Enter your name and email. We'll send you a magic link — no password needed." : lang === 'cat' ? "Introdueix el teu nom i correu. T'enviarem un enllaç màgic — sense contrasenya." : 'Introduce tu nombre y email. Te enviaremos un enlace mágico — sin contraseña.',
    namePlaceholder:  lang === 'en' ? 'Your name (optional)' : lang === 'cat' ? 'El teu nom (opcional)' : 'Tu nombre (opcional)',
    emailPlaceholder: 'tu@email.com',
    nameLabel:    lang === 'en' ? 'Name'   : lang === 'cat' ? 'Nom'   : 'Nombre',
    emailLabel:   lang === 'en' ? 'Email'  : lang === 'cat' ? 'Correu' : 'Email',
    sendLabel:    lang === 'en' ? 'Send magic link' : lang === 'cat' ? 'Enviar enllaç màgic' : 'Enviar enlace mágico',
    sending:      lang === 'en' ? 'Sending...' : lang === 'cat' ? 'Enviant...' : 'Enviando...',
    sentTitle:    lang === 'en' ? 'Check your email!' : lang === 'cat' ? 'Revisa el teu correu!' : '¡Revisa tu email!',
    sentSub:      lang === 'en' ? 'We sent a magic link to' : lang === 'cat' ? "Hem enviat un enllaç màgic a" : 'Hemos enviado un enlace mágico a',
    sentNote:     lang === 'en' ? 'Click the link to sign in instantly.' : lang === 'cat' ? "Fes clic a l'enllaç per entrar." : 'Haz clic en el enlace para entrar.',
    close:        lang === 'en' ? 'Close'  : lang === 'cat' ? 'Tancar'  : 'Cerrar',
    cancel:       lang === 'en' ? 'Cancel' : lang === 'cat' ? 'Cancel·lar' : 'Cancelar',
  };

  const inputStyle = {
    fontFamily: fonts.mono, fontSize: '14px', padding: '12px',
    backgroundColor: colors.background, border: `1px solid ${colors.border}`,
    borderRadius: '4px', color: colors.textPrimary, outline: 'none',
    transition: 'border-color 0.2s', width: '100%',
  };
  const labelStyle = {
    fontFamily: fonts.mono, fontSize: '11px', color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px',
  };

  return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh', color: colors.textPrimary, fontFamily: fonts.mono }}>

      {/* ── MODAL ── */}
      {showModal && (
        <div onClick={closeModal} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(12,12,11,0.85)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: colors.surface, border: `1px solid ${colors.borderMedium}`, borderRadius: '8px', padding: 'clamp(28px,5vw,40px)', maxWidth: '400px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div style={{ textAlign: 'center' }}>
              <span style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                <span style={{ color: colors.textPrimary }}>TYPE</span>
                <span style={{ color: colors.accent }}>RUSH</span>
              </span>
            </div>

            {!mailSent ? (
              <>
                <div>
                  <h2 style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(18px,3vw,22px)', textTransform: 'uppercase', letterSpacing: '-0.02em', color: colors.textPrimary, marginBottom: '8px', textAlign: 'center' }}>{T.modalTitle}</h2>
                  <p style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.textSecondary, textAlign: 'center', lineHeight: 1.6 }}>{T.modalSub}</p>
                </div>

                {mailError && (
                  <div style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.error, backgroundColor: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: '4px', padding: '10px 12px' }}>
                    {mailError}
                  </div>
                )}

                <form onSubmit={handleSendMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Nombre */}
                  <div>
                    <label style={labelStyle}>{T.nameLabel}</label>
                    <input
                      type="text" value={username} onChange={e => setUsername(e.target.value)}
                      placeholder={T.namePlaceholder} maxLength={20} autoFocus
                      style={inputStyle}
                      onFocus={e => { e.currentTarget.style.borderColor = colors.accent; }}
                      onBlur={e => { e.currentTarget.style.borderColor = colors.border; }}
                    />
                  </div>
                  {/* Email */}
                  <div>
                    <label style={labelStyle}>{T.emailLabel}</label>
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder={T.emailPlaceholder} required
                      style={inputStyle}
                      onFocus={e => { e.currentTarget.style.borderColor = colors.accent; }}
                      onBlur={e => { e.currentTarget.style.borderColor = colors.border; }}
                    />
                  </div>
                  <button type="submit" disabled={sending}
                    style={{ fontFamily: fonts.mono, fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '14px', border: 'none', backgroundColor: sending ? colors.accentPressed : colors.accent, color: '#000', borderRadius: '4px', cursor: sending ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s' }}
                    onMouseEnter={e => { if (!sending) e.currentTarget.style.backgroundColor = colors.accentHover; }}
                    onMouseLeave={e => { if (!sending) e.currentTarget.style.backgroundColor = colors.accent; }}>
                    {sending ? T.sending : T.sendLabel}
                  </button>
                </form>

                <button onClick={closeModal} style={{ background: 'transparent', border: 'none', color: colors.textMuted, fontFamily: fonts.mono, fontSize: '11px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px' }}>
                  {T.cancel}
                </button>
              </>
            ) : (
              <>
                <div style={{ textAlign: 'center', fontSize: '48px' }}>✉️</div>
                <div>
                  <h2 style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(18px,3vw,22px)', textTransform: 'uppercase', color: colors.accent, marginBottom: '8px', textAlign: 'center' }}>{T.sentTitle}</h2>
                  <p style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.textSecondary, textAlign: 'center', lineHeight: 1.6 }}>
                    {T.sentSub} <strong style={{ color: colors.textPrimary }}>{email}</strong>.<br />{T.sentNote}
                  </p>
                </div>
                <button onClick={closeModal}
                  style={{ fontFamily: fonts.mono, fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '12px', border: `1px solid ${colors.accent}`, backgroundColor: 'transparent', color: colors.accent, borderRadius: '4px', cursor: 'pointer' }}>
                  {T.close}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── NAV ── */}
      <nav style={{ borderBottom: `1px solid ${colors.border}`, padding: 'clamp(16px,3vw,20px) clamp(20px,4vw,32px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: colors.background, zIndex: 100 }}>
        <Link to="/" style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(18px,2.5vw,22px)', textTransform: 'uppercase', letterSpacing: '-0.02em', textDecoration: 'none' }}>
          <span style={{ color: colors.textPrimary }}>TYPE</span>
          <span style={{ color: colors.accent }}>RUSH</span>
        </Link>

        <div style={{ display: 'flex', gap: 'clamp(8px,2vw,16px)', alignItems: 'center' }}>
          {isMobile ? (
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ fontSize: '22px', background: 'transparent', border: 'none', color: colors.textPrimary, cursor: 'pointer' }}>
              {menuOpen ? '✕' : '☰'}
            </button>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['ES','CAT','EN'].map(l => (
                  <button key={l} onClick={() => setLang(l.toLowerCase())}
                    style={{ fontFamily: fonts.mono, fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 8px', border: `1px solid ${lang === l.toLowerCase() ? colors.accent : colors.border}`, backgroundColor: 'transparent', color: lang === l.toLowerCase() ? colors.accent : '#444', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}>
                    {l}
                  </button>
                ))}
              </div>
              {!loading && (user ? (
                <>
                  <button onClick={() => navigate('/perfil')}
                    style={{ fontFamily: fonts.mono, fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px 14px', border: `1px solid ${colors.accent}`, backgroundColor: 'transparent', color: colors.accent, borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,255,135,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                    {displayName || T.profileLabel}
                  </button>
                  <button onClick={handleSignOut}
                    style={{ fontFamily: fonts.mono, fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px 14px', border: `1px solid ${colors.border}`, backgroundColor: 'transparent', color: colors.textSecondary, borderRadius: '4px', cursor: 'pointer' }}>
                    {T.signOut}
                  </button>
                </>
              ) : (
                <button onClick={openModal}
                  style={{ fontFamily: fonts.mono, fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px 14px', border: `1px solid ${colors.accent}`, backgroundColor: 'transparent', color: colors.accent, borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,255,135,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  {T.profileLabel}
                </button>
              ))}
            </>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div style={{ backgroundColor: colors.surface, borderBottom: `1px solid ${colors.border}`, padding: '16px clamp(20px,4vw,32px)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['ES','CAT','EN'].map(l => (
              <button key={l} onClick={() => { setLang(l.toLowerCase()); setMenuOpen(false); }}
                style={{ fontFamily: fonts.mono, fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', padding: '6px 12px', border: `1px solid ${lang === l.toLowerCase() ? colors.accent : colors.border}`, backgroundColor: 'transparent', color: lang === l.toLowerCase() ? colors.accent : '#444', borderRadius: '4px', cursor: 'pointer', flex: 1 }}>
                {l}
              </button>
            ))}
          </div>
          {!loading && (user ? (
            <>
              <button onClick={() => { navigate('/perfil'); setMenuOpen(false); }}
                style={{ fontFamily: fonts.mono, fontSize: '12px', textTransform: 'uppercase', padding: '10px', border: `1px solid ${colors.accent}`, backgroundColor: 'transparent', color: colors.accent, borderRadius: '4px', cursor: 'pointer' }}>
                {displayName || T.profileLabel}
              </button>
              <button onClick={handleSignOut}
                style={{ fontFamily: fonts.mono, fontSize: '12px', textTransform: 'uppercase', padding: '10px', border: `1px solid ${colors.border}`, backgroundColor: 'transparent', color: colors.textSecondary, borderRadius: '4px', cursor: 'pointer' }}>
                {T.signOut}
              </button>
            </>
          ) : (
            <button onClick={() => { openModal(); setMenuOpen(false); }}
              style={{ fontFamily: fonts.mono, fontSize: '12px', textTransform: 'uppercase', padding: '10px', border: `1px solid ${colors.accent}`, backgroundColor: 'transparent', color: colors.accent, borderRadius: '4px', cursor: 'pointer' }}>
              {T.profileLabel}
            </button>
          ))}
        </div>
      )}

      <Outlet context={{ lang, setLang }} />
    </div>
  );
}
