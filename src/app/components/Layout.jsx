import { useState, useEffect } from 'react';
import { Outlet, Link, useOutletContext } from 'react-router';
import { colors, fontFamily as fonts, breakpoints } from '../design-system';

export function useLang() { return useOutletContext(); }

export default function Layout() {
  const [lang,     setLang]     = useState('es');
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoints.md);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh', color: colors.textPrimary, fontFamily: fonts.mono }}>
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
            <div style={{ display: 'flex', gap: '4px' }}>
              {['ES','CAT','EN'].map(l => (
                <button key={l} onClick={() => setLang(l.toLowerCase())}
                  style={{ fontFamily: fonts.mono, fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 8px', border: `1px solid ${lang === l.toLowerCase() ? colors.accent : colors.border}`, backgroundColor: 'transparent', color: lang === l.toLowerCase() ? colors.accent : '#444', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>
      {isMobile && menuOpen && (
        <div style={{ backgroundColor: colors.surface, borderBottom: `1px solid ${colors.border}`, padding: '16px clamp(20px,4vw,32px)', display: 'flex', gap: '8px' }}>
          {['ES','CAT','EN'].map(l => (
            <button key={l} onClick={() => { setLang(l.toLowerCase()); setMenuOpen(false); }}
              style={{ fontFamily: fonts.mono, fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', padding: '6px 12px', border: `1px solid ${lang === l.toLowerCase() ? colors.accent : colors.border}`, backgroundColor: 'transparent', color: lang === l.toLowerCase() ? colors.accent : '#444', borderRadius: '4px', cursor: 'pointer', flex: 1 }}>
              {l}
            </button>
          ))}
        </div>
      )}
      <Outlet context={{ lang, setLang }} />
    </div>
  );
}
