import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { BlinkingCursor } from '../components/BlinkingCursor';
import { colors, fontFamily as fonts } from '../design-system';
import { getRecentScores, getTotalPlayers } from '../lib/supabase';
import { useLang } from '../components/Layout';

const COPY = {
  es: {
    eyebrow: 'TYPERUSH — PACK DIARIO',
    hero: ['EL JUEGO DIARIO', 'QUE ENTRENA', 'TU ESCRITURA'],
    sub: 'Un juego de velocidad tipográfica. Una temática nueva cada día. 60 segundos para darlo todo.',
    cta: 'JUGAR AHORA',
    players: 'partidas jugadas',
    rulesLabel: 'LAS REGLAS',
    rulesTitle: 'NO ES COMPLICADO.',
    shareTitle: 'PRESUME. O NO.',
    shareDesc: 'Genera una card con tu puntuación lista para que tus amigos sepan que tienes demasiado tiempo libre.',
    rankLabel: 'RANKING',
    rankTitle: 'TOP 10 LEYENDAS DEL TECLADO',
    noScores: 'SÉ EL PRIMERO EN JUGAR HOY.',
    loading: 'CARGANDO...',
    footer: 'TU BREAK DIARIO DE 60 SEGUNDOS',
    rules: [
      { n: '01', t: 'ESCRIBE LA PALABRA',  d: 'Aparece en pantalla. La escribes. No hay más.' },
      { n: '02', t: 'VERDE O ROJO',         d: 'Verde significa que no la has cagado. Rojo significa que sí.' },
      { n: '03', t: '60 SEGUNDOS',          d: 'Un minuto. Ni más ni menos. El reloj no negocia.' },
      { n: '04', t: 'COMBOS',               d: '10 palabras rápidas = ×5. 20 palabras rápidas = ×20. Suerte.' },
    ],
  },
  cat: {
    eyebrow: 'TYPERUSH — PACK DIARI',
    hero: ['EL JOC DIARI', 'QUE ENTRENA', 'LA TEVA ESCRIPTURA'],
    sub: 'Un joc de velocitat tipogràfica. Una temàtica nova cada dia. 60 segons per donar-ho tot.',
    cta: 'JUGAR ARA',
    players: 'partides jugades',
    rulesLabel: 'LES REGLES',
    rulesTitle: 'NO ÉS COMPLICAT.',
    shareTitle: 'PRESUMEIX. O NO.',
    shareDesc: 'Genera una card amb la teva puntuació llesta perquè els teus amics sàpiguen que tens massa temps lliure.',
    rankLabel: 'RÀNQUING',
    rankTitle: 'TOP 10 LLEGENDS DEL TECLAT',
    noScores: 'SIGUES EL PRIMER A JUGAR AVUI.',
    loading: 'CARREGANT...',
    footer: 'EL TEU BREAK DIARI DE 60 SEGONS',
    rules: [
      { n: '01', t: 'ESCRIU LA PARAULA',  d: "Apareix a la pantalla. L'escrius. No hi ha més." },
      { n: '02', t: 'VERD O VERMELL',     d: "Verd vol dir que no l'has cagat. Vermell vol dir que sí." },
      { n: '03', t: '60 SEGONS',          d: 'Un minut. Ni més ni menys. El rellotge no negocia.' },
      { n: '04', t: 'COMBOS',             d: '10 paraules ràpides = ×5. 20 paraules ràpides = ×20. Sort.' },
    ],
  },
  en: {
    eyebrow: 'TYPERUSH — DAILY PACK',
    hero: ['THE DAILY GAME', 'THAT TRAINS', 'YOUR TYPING'],
    sub: 'A typing speed game. A new theme every day. 60 seconds to give it everything.',
    cta: 'PLAY NOW',
    players: 'games played',
    rulesLabel: 'THE RULES',
    rulesTitle: "IT'S NOT COMPLICATED.",
    shareTitle: 'SHOW OFF. OR NOT.',
    shareDesc: "Generate a score card so your friends know you have too much free time.",
    rankLabel: 'RANKING',
    rankTitle: 'TOP 10 KEYBOARD LEGENDS',
    noScores: 'BE THE FIRST TO PLAY TODAY.',
    loading: 'LOADING...',
    footer: 'YOUR DAILY 60-SECOND BREAK',
    rules: [
      { n: '01', t: 'TYPE THE WORD',  d: "It appears on screen. You type it. That's it." },
      { n: '02', t: 'GREEN OR RED',   d: "Green means you didn't screw up. Red means you did." },
      { n: '03', t: '60 SECONDS',     d: "One minute. No more, no less. The clock doesn't negotiate." },
      { n: '04', t: 'COMBOS',         d: '10 fast words = ×5. 20 fast words = ×20. Good luck.' },
    ],
  },
};

function timeAgo(dateStr, lang) {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (lang === 'en')  return s < 60 ? 'Just now'      : s < 3600 ? `${Math.floor(s/60)}m ago`  : `${Math.floor(s/3600)}h ago`;
  if (lang === 'cat') return s < 60 ? 'Fa un moment'  : s < 3600 ? `Fa ${Math.floor(s/60)}m`   : `Fa ${Math.floor(s/3600)}h`;
  return                     s < 60 ? 'Hace un momento': s < 3600 ? `Hace ${Math.floor(s/60)}m` : `Hace ${Math.floor(s/3600)}h`;
}

export default function Home() {
  const { lang } = useLang();
  const t = COPY[lang] || COPY.es;
  const navigate = useNavigate();

  const [isHovered,       setIsHovered]       = useState(false);
  const [isRankHovered,   setIsRankHovered]   = useState(false);
  const [typedText,       setTypedText]       = useState('');
  const [rankTypedText,   setRankTypedText]   = useState('');
  const [showHero,        setShowHero]        = useState(false);
  const [showRules,       setShowRules]       = useState(false);
  const [showShare,       setShowShare]       = useState(false);
  const [showRanking,     setShowRanking]     = useState(false);
  const [showFooter,      setShowFooter]      = useState(false);
  const [scores,          setScores]          = useState([]);
  const [total,           setTotal]           = useState(null);
  const [loadingScores,   setLoadingScores]   = useState(true);

  useEffect(() => {
    const timers = [
      setTimeout(() => setShowHero(true),    200),
      setTimeout(() => setShowRules(true),   600),
      setTimeout(() => setShowShare(true),   900),
      setTimeout(() => setShowRanking(true), 1200),
      setTimeout(() => setShowFooter(true),  1500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    Promise.all([getRecentScores(10), getTotalPlayers()])
      .then(([s, n]) => { setScores(s); setTotal(n); })
      .finally(() => setLoadingScores(false));
  }, []);

  const fullText = t.cta;

  useEffect(() => {
    if (!isHovered) { setTypedText(''); return; }
    let i = 0;
    const iv = setInterval(() => {
      if (i <= fullText.length) { setTypedText(fullText.substring(0, i)); i++; }
      else { setTimeout(() => { i = 0; setTypedText(''); }, 800); }
    }, 80);
    return () => clearInterval(iv);
  }, [isHovered, fullText]);

  useEffect(() => {
    if (!isRankHovered) { setRankTypedText(''); return; }
    let i = 0;
    const iv = setInterval(() => {
      if (i <= fullText.length) { setRankTypedText(fullText.substring(0, i)); i++; }
      else { setTimeout(() => { i = 0; setRankTypedText(''); }, 800); }
    }, 80);
    return () => clearInterval(iv);
  }, [isRankHovered, fullText]);

  const fade = (show) => ({
    opacity: show ? 1 : 0,
    transform: show ? 'translateY(0)' : 'translateY(40px)',
    transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
  });

  const rankTitleParts = t.rankTitle.split(' ');
  const rankTitleFirst = rankTitleParts.slice(0, 2).join(' ');
  const rankTitleRest  = rankTitleParts.slice(2).join(' ');

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 clamp(20px,4vw,32px)' }}>

      {/* Hero */}
      <section style={{ ...fade(showHero), paddingTop: 'clamp(40px,8vw,80px)', paddingBottom: 'clamp(40px,8vw,80px)', textAlign: 'center' }}>
        <div style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.accent, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 'clamp(16px,3vw,24px)' }}>
          {t.eyebrow}
        </div>
        <h1 style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(32px,7vw,88px)', lineHeight: 0.95, letterSpacing: '-0.03em', textTransform: 'uppercase', maxWidth: '900px', margin: '0 auto clamp(20px,3vw,32px) auto', color: colors.textPrimary }}>
          {t.hero.map((line, i) => <span key={i}>{line}{i < t.hero.length - 1 && <br />}</span>)}
        </h1>
        <p style={{ fontFamily: fonts.mono, fontSize: 'clamp(13px,2vw,16px)', color: colors.textSecondary, margin: '0 auto clamp(24px,4vw,32px) auto', lineHeight: 1.6, maxWidth: '600px' }}>
          {t.sub}
        </p>
        <button onClick={() => navigate('/jugar')}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ backgroundColor: isHovered ? colors.accentHover : colors.accent, color: '#000', fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(12px,2vw,14px)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: 'clamp(12px,2vw,16px) clamp(32px,5vw,48px)', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s ease', minWidth: '220px', minHeight: '52px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
          {isHovered ? <>{typedText}<BlinkingCursor color="#000" /></> : <>{t.cta} <BlinkingCursor color="#000" /></>}
        </button>
        {total !== null && (
          <div style={{ fontFamily: fonts.mono, fontSize: 'clamp(11px,1.5vw,12px)', marginTop: 'clamp(16px,3vw,24px)', color: colors.textSecondary }}>
            <span style={{ color: colors.accent, fontWeight: 700 }}>{total.toLocaleString()}</span>{' '}{t.players}
          </div>
        )}
      </section>

      <div style={{ height: '1px', backgroundColor: colors.border }} />

      {/* Reglas */}
      <section style={{ ...fade(showRules), paddingTop: 'clamp(48px,7vw,72px)', paddingBottom: 'clamp(48px,7vw,72px)' }}>
        <div style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.accent, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px' }}>{t.rulesLabel}</div>
        <h2 style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(28px,5vw,56px)', textTransform: 'uppercase', letterSpacing: '-0.02em', color: colors.textPrimary, marginBottom: 'clamp(32px,5vw,48px)', lineHeight: 1.1 }}>{t.rulesTitle}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 'clamp(12px,2vw,16px)' }}>
          {t.rules.map(r => (
            <div key={r.n} style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, padding: 'clamp(20px,3vw,28px)', transition: 'border-color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = colors.borderMedium; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; }}>
              <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: '11px', color: colors.numberMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>{r.n}</div>
              <h3 style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(14px,2vw,18px)', textTransform: 'uppercase', color: colors.textPrimary, marginBottom: '12px', lineHeight: 1.2 }}>{r.t}</h3>
              <p style={{ fontFamily: fonts.mono, fontSize: 'clamp(11px,1.5vw,13px)', color: colors.textSecondary, lineHeight: 1.6 }}>{r.d}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: '1px', backgroundColor: colors.border }} />

      {/* Compartir */}
      <section style={{ ...fade(showShare), paddingTop: 'clamp(48px,7vw,72px)', paddingBottom: 'clamp(48px,7vw,72px)' }}>
        <div style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.accent, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px' }}>SHARE</div>
        <h2 style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(28px,5vw,56px)', textTransform: 'uppercase', letterSpacing: '-0.02em', color: colors.textPrimary, marginBottom: '24px', lineHeight: 1.1 }}>{t.shareTitle}</h2>
        <p style={{ fontFamily: fonts.mono, fontSize: 'clamp(13px,2vw,15px)', color: colors.textSecondary, lineHeight: 1.6, maxWidth: '520px', marginBottom: '32px' }}>{t.shareDesc}</p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[{ l: '𝕏 TWITTER', c: colors.twitter }, { l: 'IN LINKEDIN', c: colors.linkedin }, { l: '◎ INSTAGRAM', c: colors.instagram }].map(({ l, c }) => (
            <span key={l} style={{ fontFamily: fonts.mono, fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.textMuted, border: `1px solid ${colors.borderMedium}`, padding: '6px 14px', cursor: 'default', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = c; e.currentTarget.style.borderColor = c; }}
              onMouseLeave={e => { e.currentTarget.style.color = colors.textMuted; e.currentTarget.style.borderColor = colors.borderMedium; }}>
              {l}
            </span>
          ))}
        </div>
      </section>

      <div style={{ height: '1px', backgroundColor: colors.border, margin: 'clamp(40px,6vw,60px) 0' }} />

      {/* Ranking */}
      <section style={{ ...fade(showRanking), paddingBottom: 'clamp(40px,6vw,60px)', paddingTop: 'clamp(40px,6vw,60px)' }}>
        <div style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.accent, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px', textAlign: 'center' }}>{t.rankLabel}</div>
        <h2 style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(28px,5vw,56px)', textTransform: 'uppercase', letterSpacing: '-0.02em', color: colors.textPrimary, maxWidth: '700px', lineHeight: 1.2, margin: '0 auto clamp(32px,5vw,48px) auto', textAlign: 'center' }}>
          <span style={{ color: colors.accent }}>{rankTitleFirst}</span>{rankTitleRest ? ` ${rankTitleRest}` : ''}
        </h2>

        <div style={{ overflowX: 'auto' }}>
          {loadingScores ? (
            <p style={{ fontFamily: fonts.mono, fontSize: '13px', color: colors.textMuted, textAlign: 'center', padding: '32px 0', letterSpacing: '0.1em' }}>{t.loading}</p>
          ) : scores.length === 0 ? (
            <p style={{ fontFamily: fonts.mono, fontSize: '13px', color: colors.textMuted, textAlign: 'center', padding: '32px 0', letterSpacing: '0.1em' }}>{t.noScores}</p>
          ) : scores.map((s, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '28px 1fr auto auto auto', gap: 'clamp(8px,2vw,16px)', alignItems: 'center', padding: 'clamp(12px,2vw,16px) 0', borderBottom: `1px solid ${colors.border}`, transition: 'background-color 0.2s', minWidth: '320px' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = colors.surface; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
              <div style={{ fontFamily: fonts.mono, fontSize: '14px', color: colors.accent }}>{String(i+1).padStart(2,'0')}</div>
              <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(13px,2vw,15px)', color: colors.textPrimary, textTransform: 'uppercase' }}>{s.player_name}</div>
              <div style={{ fontFamily: fonts.mono, fontWeight: 600, fontSize: '16px', color: s.combo_level === 'x20' ? colors.combo20 : s.combo_level === 'x5' ? colors.combo5 : 'transparent', minWidth: '70px', textAlign: 'right' }}>
                {s.combo_level && <>{s.combo_level === 'x20' ? '×20' : '×5'} 🔥</>}
              </div>
              <div style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.textMuted }}>{timeAgo(s.created_at, lang)}</div>
              <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(20px,3vw,24px)', color: colors.accent, textAlign: 'right', minWidth: '48px' }}>{s.score}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'clamp(24px,4vw,32px)' }}>
          <button onClick={() => navigate('/jugar')}
            onMouseEnter={() => setIsRankHovered(true)}
            onMouseLeave={() => setIsRankHovered(false)}
            style={{ backgroundColor: isRankHovered ? colors.accentHover : colors.accent, color: '#000', fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(11px,1.5vw,13px)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: 'clamp(10px,2vw,14px) clamp(24px,4vw,32px)', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s', minWidth: '200px', minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
            {isRankHovered ? <>{rankTypedText}<BlinkingCursor color="#000" /></> : <>{t.cta} <BlinkingCursor color="#000" /></>}
          </button>
        </div>
      </section>

      <div style={{ height: '1px', backgroundColor: colors.border, margin: '0 0 clamp(24px,4vw,32px) 0' }} />

      {/* Footer */}
      <footer style={{ ...fade(showFooter), display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'clamp(24px,4vw,32px) 0', flexWrap: 'wrap', gap: 'clamp(12px,2vw,16px)' }}>
        <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(16px,2.5vw,18px)', textTransform: 'uppercase' }}>
          <span style={{ color: colors.textPrimary }}>TYPE</span>
          <span style={{ color: colors.accent }}>RUSH</span>
          <span style={{ color: colors.textSecondary, fontFamily: fonts.mono, fontSize: 'clamp(9px,1.5vw,10px)', fontWeight: 400, marginLeft: '8px' }}>— {t.footer}</span>
        </div>
        <a href="https://andreurobuste.com/plaigrund" target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: fonts.mono, fontSize: 'clamp(9px,1.5vw,10px)', color: colors.numberMuted, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.color = colors.accent; }}
          onMouseLeave={e => { e.currentTarget.style.color = colors.numberMuted; }}>
          andreurobuste.com/plaigrund — 2026®
        </a>
      </footer>
    </div>
  );
}
