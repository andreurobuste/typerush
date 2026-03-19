import { useState } from 'react';
import { Link } from 'react-router';
import { colors, fontFamily as fonts } from '../design-system';
import { sendPasswordReset } from '../lib/supabase';

export default function ForgotPassword() {
  const [email,       setEmail]       = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await sendPasswordReset(email); setIsSubmitted(true); }
    catch { setError('Error al enviar el email. Verifica la dirección.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '440px', width: '100%', backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: 'clamp(32px,5vw,48px)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(32px,5vw,40px)' }}>
          <Link to="/" style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(24px,4vw,32px)', textTransform: 'uppercase', letterSpacing: '-0.02em', textDecoration: 'none' }}>
            <span style={{ color: colors.textPrimary }}>TYPE</span><span style={{ color: colors.accent }}>RUSH</span>
          </Link>
        </div>
        {!isSubmitted ? (
          <>
            <h1 style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(22px,4vw,28px)', textTransform: 'uppercase', letterSpacing: '-0.02em', color: colors.textPrimary, marginBottom: '8px', textAlign: 'center', lineHeight: 1.2 }}>RECUPERAR CONTRASEÑA</h1>
            <p style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.textSecondary, textAlign: 'center', marginBottom: 'clamp(24px,4vw,32px)', lineHeight: 1.6 }}>Introduce tu email y te enviaremos un enlace para restablecer tu contraseña</p>
            {error && <div style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.error, backgroundColor: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: '4px', padding: '10px 12px', marginBottom: '16px' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.textSecondary, textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@email.com"
                  style={{ width: '100%', fontFamily: fonts.mono, fontSize: '14px', padding: '12px', backgroundColor: colors.background, border: `1px solid ${colors.border}`, borderRadius: '4px', color: colors.textPrimary, outline: 'none' }}
                  onFocus={e => { e.currentTarget.style.borderColor = colors.accent; }}
                  onBlur={e => { e.currentTarget.style.borderColor = colors.border; }} />
              </div>
              <button type="submit" disabled={loading}
                style={{ width: '100%', fontFamily: fonts.mono, fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', padding: '14px', border: 'none', backgroundColor: loading ? colors.accentPressed : colors.accent, color: '#000', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '24px' }}>
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>
            <p style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.textSecondary, textAlign: 'center' }}>
              <Link to="/login" style={{ color: colors.accent, textDecoration: 'none', fontWeight: 600 }}>← Volver al inicio de sesión</Link>
            </p>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✉️</div>
            <h2 style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(20px,4vw,24px)', textTransform: 'uppercase', color: colors.accent, marginBottom: '16px' }}>¡EMAIL ENVIADO!</h2>
            <p style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.textSecondary, marginBottom: '24px', lineHeight: 1.6 }}>
              Enlace enviado a <strong style={{ color: colors.textPrimary }}>{email}</strong>. Expira en 1 hora.
            </p>
            <Link to="/login" style={{ display: 'inline-block', fontFamily: fonts.mono, fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', padding: '12px 24px', border: `1px solid ${colors.accent}`, backgroundColor: 'transparent', color: colors.accent, borderRadius: '4px', textDecoration: 'none' }}>
              Volver al inicio de sesión
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
