import { useState } from 'react';
import { Link } from 'react-router';
import { colors, fontFamily as fonts } from '../design-system';
import { signUp, signInWithGoogle } from '../lib/supabase';

export default function SignUp() {
  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState(false);
  const [loading,         setLoading]         = useState(false);

  const inputStyle = { width: '100%', fontFamily: fonts.mono, fontSize: '14px', padding: '12px', backgroundColor: colors.background, border: `1px solid ${colors.border}`, borderRadius: '4px', color: colors.textPrimary, outline: 'none', transition: 'border-color 0.2s' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden.'); return; }
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
    setLoading(true);
    try { await signUp(email, password, name); setSuccess(true); }
    catch (err) { setError(err.message?.includes('already registered') ? 'Este email ya está registrado.' : 'Error al crear la cuenta.'); }
    finally { setLoading(false); }
  };

  if (success) return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '440px', width: '100%', backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: 'clamp(32px,5vw,48px)', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>✉️</div>
        <h2 style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(20px,4vw,24px)', textTransform: 'uppercase', color: colors.accent, marginBottom: '16px' }}>¡CUENTA CREADA!</h2>
        <p style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.textSecondary, marginBottom: '24px', lineHeight: 1.6 }}>
          Hemos enviado un email de confirmación a <strong style={{ color: colors.textPrimary }}>{email}</strong>. Confirma tu cuenta para iniciar sesión.
        </p>
        <Link to="/login" style={{ display: 'inline-block', fontFamily: fonts.mono, fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', padding: '12px 24px', border: `1px solid ${colors.accent}`, backgroundColor: 'transparent', color: colors.accent, borderRadius: '4px', textDecoration: 'none' }}>
          Ir al inicio de sesión
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '440px', width: '100%', backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: 'clamp(32px,5vw,48px)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(32px,5vw,40px)' }}>
          <Link to="/" style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(24px,4vw,32px)', textTransform: 'uppercase', letterSpacing: '-0.02em', textDecoration: 'none' }}>
            <span style={{ color: colors.textPrimary }}>TYPE</span><span style={{ color: colors.accent }}>RUSH</span>
          </Link>
        </div>
        <h1 style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(22px,4vw,28px)', textTransform: 'uppercase', letterSpacing: '-0.02em', color: colors.textPrimary, marginBottom: '8px', textAlign: 'center' }}>CREAR CUENTA</h1>
        <p style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.textSecondary, textAlign: 'center', marginBottom: 'clamp(24px,4vw,32px)' }}>Únete a la comunidad de TypeRush</p>

        <button onClick={() => signInWithGoogle()}
          style={{ width: '100%', fontFamily: fonts.mono, fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', padding: '12px', border: `1px solid ${colors.border}`, backgroundColor: 'transparent', color: colors.textPrimary, borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}
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
          {[
            { id: 'name',    label: 'Nombre',              type: 'text',     value: name,            set: setName },
            { id: 'email',   label: 'Email',               type: 'email',    value: email,           set: setEmail },
            { id: 'pass',    label: 'Contraseña',          type: 'password', value: password,        set: setPassword },
            { id: 'confirm', label: 'Confirmar contraseña', type: 'password', value: confirmPassword, set: setConfirmPassword },
          ].map(f => (
            <div key={f.id} style={{ marginBottom: '16px' }}>
              <label style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.textSecondary, textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>{f.label}</label>
              <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} required style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = colors.accent; }}
                onBlur={e => { e.currentTarget.style.borderColor = colors.border; }} />
            </div>
          ))}
          <div style={{ marginBottom: '24px' }} />
          <button type="submit" disabled={loading}
            style={{ width: '100%', fontFamily: fonts.mono, fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', padding: '14px', border: 'none', backgroundColor: loading ? colors.accentPressed : colors.accent, color: '#000', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '24px' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = colors.accentHover; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = colors.accent; }}>
            {loading ? 'Creando...' : 'Crear cuenta'}
          </button>
        </form>
        <p style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.textSecondary, textAlign: 'center' }}>
          ¿Ya tienes cuenta?{' '}<Link to="/login" style={{ color: colors.accent, textDecoration: 'none', fontWeight: 600 }}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
