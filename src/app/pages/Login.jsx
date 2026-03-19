import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { colors, fontFamily as fonts } from '../design-system';
import { signIn, signInWithGoogle } from '../lib/supabase';

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const inputStyle = { width: '100%', fontFamily: fonts.mono, fontSize: '14px', padding: '12px', backgroundColor: colors.background, border: `1px solid ${colors.border}`, borderRadius: '4px', color: colors.textPrimary, outline: 'none', transition: 'border-color 0.2s' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await signIn(email, password); navigate('/'); }
    catch (err) { setError(err.message?.includes('Invalid') ? 'Email o contraseña incorrectos.' : 'Error al iniciar sesión.'); }
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
        <h1 style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(22px,4vw,28px)', textTransform: 'uppercase', letterSpacing: '-0.02em', color: colors.textPrimary, marginBottom: '8px', textAlign: 'center' }}>INICIAR SESIÓN</h1>
        <p style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.textSecondary, textAlign: 'center', marginBottom: 'clamp(24px,4vw,32px)' }}>Entra y demuestra tu velocidad</p>

        <button onClick={() => signInWithGoogle()}
          style={{ width: '100%', fontFamily: fonts.mono, fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', padding: '12px', border: `1px solid ${colors.border}`, backgroundColor: 'transparent', color: colors.textPrimary, borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = colors.accent; e.currentTarget.style.backgroundColor = 'rgba(0,255,135,0.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.backgroundColor = 'transparent'; }}>
          <span style={{ fontSize: '16px', fontWeight: 900 }}>G</span> Continuar con Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: colors.border }} />
          <span style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textMuted, textTransform: 'uppercase' }}>o con email</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: colors.border }} />
        </div>

        {error && <div style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.error, backgroundColor: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: '4px', padding: '10px 12px', marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.textSecondary, textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = colors.accent; }}
              onBlur={e => { e.currentTarget.style.borderColor = colors.border; }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.textSecondary, textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = colors.accent; }}
              onBlur={e => { e.currentTarget.style.borderColor = colors.border; }} />
          </div>
          <div style={{ textAlign: 'right', marginBottom: '24px' }}>
            <Link to="/forgot-password" style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.accent, textDecoration: 'none' }}>¿Olvidaste tu contraseña?</Link>
          </div>
          <button type="submit" disabled={loading}
            style={{ width: '100%', fontFamily: fonts.mono, fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.02em', padding: '14px', border: 'none', backgroundColor: loading ? colors.accentPressed : colors.accent, color: '#000', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '24px' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = colors.accentHover; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = colors.accent; }}>
            {loading ? 'Iniciando...' : 'Iniciar sesión'}
          </button>
        </form>
        <p style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.textSecondary, textAlign: 'center' }}>
          ¿No tienes cuenta?{' '}<Link to="/signup" style={{ color: colors.accent, textDecoration: 'none', fontWeight: 600 }}>Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
