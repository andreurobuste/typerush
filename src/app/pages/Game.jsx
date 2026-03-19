import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../lib/AuthContext';
import { saveScore } from '../lib/supabase';
import { useLang } from '../components/Layout';
import { colors, fontFamily as fonts } from '../design-system';

const FALLBACK = {
  es:  ['sol','mar','luz','paz','voz','casa','mesa','luna','vida','fuego','agua','viento','cielo','noche','plaza','tiempo','camino','ciudad','bosque','piedra','puerta','palabra','tormenta','estrella','montana','libertad','misterio','horizonte','aventura','velocidad','silencio','puente','ventana','sombra','reflejo','origen','destino','espacio','tierra','fuente','brillo'],
  cat: ['sol','mar','llum','pau','veu','casa','taula','lluna','vida','foc','aigua','vent','cel','nit','placa','temps','cami','ciutat','bosc','pedra','porta','paraula','tempesta','estrella','muntanya','llibertat','misteri','aventura','velocitat','silenci','pont','finestra','ombra','reflexe','origen','desti','espai','terra','font','brillant'],
  en:  ['sun','sea','light','peace','voice','house','table','moon','life','fire','water','wind','sky','night','square','time','road','city','forest','stone','door','word','storm','star','mountain','freedom','mystery','horizon','adventure','velocity','silence','bridge','window','shadow','mirror','origin','space','ground','source','center'],
};

const GAME_DURATION = 60;
const COMBO_X5  = { count: 10, maxSec: 3 };
const COMBO_X20 = { count: 20, maxSec: 5 };

const UI = {
  es:  { resume: 'Continuar', quit: '¿Seguro que quieres salir?', yes: 'Sí, salir', no: 'Seguir jugando', words: 'palabras', bestStreak: 'mejor racha', wpm: 'p/min', combo: 'combo', share: 'Compartir resultado', hide: 'Ocultar', again: 'Jugar de nuevo', home: '← Inicio', anon: 'Anónimo', save: 'Guardar', saving: 'Guardando...', saved: '✓ Guardado', click: 'Haz clic aquí si el teclado no responde', paused: 'PAUSA', loginPrompt: 'Regístrate para guardar tus puntuaciones.', start: 'INICIAR' },
  cat: { resume: 'Continuar', quit: 'Segur que vols sortir?', yes: 'Sí, sortir', no: 'Seguir jugant', words: 'paraules', bestStreak: 'millor ratxa', wpm: 'p/min', combo: 'combo', share: 'Compartir resultat', hide: 'Amagar', again: 'Jugar de nou', home: '← Inici', anon: 'Anònim', save: 'Desar', saving: 'Desant...', saved: '✓ Desat', click: 'Fes clic aquí si el teclat no respon', paused: 'PAUSA', loginPrompt: "Registra't per desar les teves puntuacions.", start: 'INICIAR' },
  en:  { resume: 'Resume', quit: 'Sure you want to quit?', yes: 'Yes, quit', no: 'Keep playing', words: 'words', bestStreak: 'best streak', wpm: 'wpm', combo: 'combo', share: 'Share result', hide: 'Hide', again: 'Play again', home: '← Home', anon: 'Anonymous', save: 'Save', saving: 'Saving...', saved: '✓ Saved', click: 'Click here if keyboard stops responding', paused: 'PAUSED', loginPrompt: 'Sign up to save your scores.', start: 'START' },
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function buildQueue(base) {
  let q = [];
  for (let i = 0; i < 12; i++) q = q.concat(shuffle(base));
  return q;
}
function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function formatDate(lang) {
  return new Date().toLocaleDateString(
    lang === 'es' ? 'es-ES' : lang === 'cat' ? 'ca-ES' : 'en-GB',
    { day: '2-digit', month: 'long', year: 'numeric' }
  );
}
function drawCard(canvas, { score, bestCombo, theme, lang, comboLevel }) {
  const ctx = canvas.getContext('2d');
  const W = 640, H = 360;
  canvas.width = W; canvas.height = H;
  ctx.fillStyle = '#0c0c0b'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.015)';
  for (let i = 0; i < 3000; i++) ctx.fillRect(Math.random()*W, Math.random()*H, 1, 1);
  ctx.fillStyle = '#00ff87'; ctx.fillRect(0, 0, W, 2);
  ctx.font = 'bold 28px Arial Black, sans-serif';
  ctx.fillStyle = '#f5f4f0'; ctx.fillText('TYPE', 52, 68);
  const tw = ctx.measureText('TYPE').width;
  ctx.fillStyle = '#00ff87'; ctx.fillText('RUSH', 52+tw+2, 68);
  ctx.strokeStyle = '#1e1e1b'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(52, 84); ctx.lineTo(W-52, 84); ctx.stroke();
  ctx.font = '900 120px Arial Black, sans-serif'; ctx.fillStyle = '#00ff87';
  ctx.fillText(String(score), 52, 228);
  ctx.font = '400 13px "Courier New", monospace'; ctx.fillStyle = '#5a5850';
  const lbl = lang === 'cat' ? 'PARAULES EN 60 SEG' : lang === 'es' ? 'PALABRAS EN 60 SEG' : 'WORDS IN 60 SEC';
  ctx.fillText(lbl, 54, 258);
  if (comboLevel) {
    ctx.font = '700 14px "Courier New", monospace';
    ctx.fillStyle = comboLevel === 'x20' ? '#ff6b35' : '#f5c542';
    ctx.fillText(`🔥 COMBO ${comboLevel === 'x20' ? '×20' : '×5'}`, 54, 290);
  } else {
    ctx.font = '400 13px "Courier New", monospace'; ctx.fillStyle = '#3a3a36';
    const rLabel = lang === 'cat' ? 'ratxa màx · ' : lang === 'es' ? 'racha máx · ' : 'best streak · ';
    ctx.fillText(rLabel + bestCombo, 54, 290);
  }
  if (theme) { ctx.font = '400 11px "Courier New", monospace'; ctx.fillStyle = '#2a2926'; ctx.fillText('· ' + theme, 54, 318); }
  ctx.textAlign = 'right'; ctx.font = '400 12px Arial Black, sans-serif'; ctx.fillStyle = '#3a3a36';
  ctx.fillText(formatDate(lang), W-52, 318);
  ctx.font = '400 10px "Courier New", monospace'; ctx.fillStyle = '#1e1e1b';
  ctx.fillText('typerush.vercel.app', W-52, 340);
}

export default function Game() {
  const { lang } = useLang();
  const { user, displayName } = useAuth();
  const navigate = useNavigate();
  const u = UI[lang] || UI.es;

  const [screen,      setScreen]      = useState('lobby');
  const [packInfo,    setPackInfo]    = useState(null);
  const [words,       setWords]       = useState([]);
  const [wordIndex,   setWordIndex]   = useState(0);
  const [input,       setInput]       = useState('');
  const [timeLeft,    setTimeLeft]    = useState(GAME_DURATION);
  const [score,       setScore]       = useState(0);
  const [status,      setStatus]      = useState('idle');
  const [showCard,    setShowCard]    = useState(false);
  const [comboStreak, setComboStreak] = useState(0);
  const [comboLevel,  setComboLevel]  = useState(null);
  const [comboAnim,   setComboAnim]   = useState(null);
  const [bestCombo,   setBestCombo]   = useState(0);
  const [flashGreen,  setFlashGreen]  = useState(false);
  const [wordKey,     setWordKey]     = useState(0);
  const [quitConfirm, setQuitConfirm] = useState(false);
  const [playerName,  setPlayerName]  = useState('');
  const [saveState,   setSaveState]   = useState('idle');
  const [fullBank,    setFullBank]    = useState([]);

  const inputRef    = useRef(null);
  const timerRef    = useRef(null);
  const canvasRef   = useRef(null);
  const lastTimeRef = useRef(null);
  const streakRef   = useRef(0);

  useEffect(() => {
    const packLang = lang === 'cat' ? 'cat' : lang;
    fetch(`/packs/${packLang}.json`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        // New format: { bank: [...words], themes: { "MM-DD": "theme name" } }
        // Legacy format: { "YYYY-MM-DD": { theme, words } }
        if (data.bank && data.themes) {
          const d = new Date();
          const mmdd = `${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
          const theme = data.themes[mmdd] || '';
          setPackInfo({ theme, words: data.bank });
        } else {
          const today = getTodayKey();
          if (data[today]) setPackInfo({ theme: data[today].theme, words: data[today].words });
          else setPackInfo(null);
        }
      })
      .catch(() => setPackInfo(null));
  }, [lang]);

  useEffect(() => { setPlayerName(displayName || ''); }, [displayName]);

  // Use full bank (500-1000 words) if available, else pack words, else fallback
  const activeWords = fullBank.length > 0 ? fullBank : (packInfo?.words ?? FALLBACK[lang] ?? FALLBACK.es);

  const startGame = useCallback(() => {
    setWords(buildQueue(activeWords));
    setWordIndex(0); setInput(''); setTimeLeft(GAME_DURATION);
    setScore(0); setStatus('idle'); setComboStreak(0);
    setComboLevel(null); setComboAnim(null); setBestCombo(0);
    setFlashGreen(false); setShowCard(false); setWordKey(0);
    setQuitConfirm(false); setSaveState('idle');
    lastTimeRef.current = null; streakRef.current = 0;
    setScreen('playing');
  }, [activeWords]);

  useEffect(() => { if (screen === 'playing') setTimeout(() => inputRef.current?.focus(), 80); }, [screen]);

  useEffect(() => {
    if (screen !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setScreen('results'); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [screen]);

  useEffect(() => {
    if (showCard && canvasRef.current) {
      drawCard(canvasRef.current, { score, bestCombo, theme: packInfo?.theme, lang, comboLevel });
    }
  }, [showCard, score, bestCombo, packInfo, lang, comboLevel]);

  const handlePause  = () => { if (timerRef.current) clearInterval(timerRef.current); setScreen('paused'); };
  const handleResume = () => setScreen('playing');
  const handleQuit   = () => { if (timerRef.current) clearInterval(timerRef.current); setQuitConfirm(false); navigate('/'); };

  const currentWord = words[wordIndex] ?? '';

  const handleInput = (e) => {
    const val = e.target.value;
    setInput(val);
    if (val === currentWord) {
      const now = Date.now();
      const elapsed = lastTimeRef.current ? (now - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = now;
      let newStreak;
      if (streakRef.current === 0 || elapsed === 0) newStreak = 1;
      else if (streakRef.current >= COMBO_X5.count && elapsed <= COMBO_X20.maxSec) newStreak = streakRef.current + 1;
      else if (elapsed <= COMBO_X5.maxSec) newStreak = streakRef.current + 1;
      else { newStreak = 1; setComboLevel(null); }
      streakRef.current = newStreak; setComboStreak(newStreak);
      if (newStreak > bestCombo) setBestCombo(newStreak);
      if (newStreak === COMBO_X20.count) { setComboLevel('x20'); setComboAnim('x20'); setTimeout(() => setComboAnim(null), 2400); }
      else if (newStreak === COMBO_X5.count) { setComboLevel('x5'); setComboAnim('x5'); setTimeout(() => setComboAnim(null), 2400); }
      setScore(s => s + 1); setStatus('correct'); setFlashGreen(true);
      setTimeout(() => { setStatus('idle'); setFlashGreen(false); setInput(''); setWordIndex(i => i + 1); setWordKey(k => k + 1); }, 240);
    } else if (currentWord.startsWith(val)) {
      setStatus('idle');
    } else {
      streakRef.current = 0; setComboStreak(0); setComboLevel(null); setStatus('wrong');
    }
  };

  const handleSave = async () => {
    if (saveState !== 'idle') return;
    setSaveState('saving');
    const name = playerName.trim() || u.anon;
    const ok = await saveScore({ playerName: name, score, bestCombo, comboLevel, lang, theme: packInfo?.theme, userId: user?.id });
    setSaveState(ok ? 'saved' : 'idle');
  };

  const dlPng = () => {
    const a = document.createElement('a');
    a.download = `typerush-${getTodayKey()}.png`;
    a.href = canvasRef.current.toDataURL('image/png');
    a.click();
  };
  const shareTwitter   = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${score} ${u.words} en 60s · TYPERUSH 🔥 typerush.vercel.app`)}`, '_blank');
  const shareLinkedin  = () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://typerush.vercel.app')}`, '_blank');
  const shareInstagram = () => { dlPng(); alert(lang === 'es' ? 'Imagen descargada. Súbela a Instagram Stories.' : lang === 'cat' ? 'Imatge descarregada. Puja-la a Instagram Stories.' : 'Image downloaded. Upload to Instagram Stories.'); };

  const timerPct   = (timeLeft / GAME_DURATION) * 100;
  const timerColor = timeLeft > 30 ? colors.accent : timeLeft > 10 ? colors.combo5 : colors.error;

  const renderLetters = () => currentWord.split('').map((char, i) => {
    let color = colors.textPrimary;
    if (i < input.length) color = input[i] === char ? colors.accent : colors.error;
    return <span key={i} style={{ color, transition: 'color 0.07s' }}>{char}</span>;
  });

  // ── LOBBY ──────────────────────────────────────────────────────────────────
  if (screen === 'lobby') return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.mono, userSelect: 'none' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '40px 24px', maxWidth: 520, width: '100%' }}>
        <button onClick={() => navigate('/')} style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', color: colors.textSecondary, fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '0.1em', cursor: 'pointer', padding: 0, textTransform: 'uppercase' }}>
          {u.home}
        </button>
        <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: '64px', letterSpacing: '-0.03em', lineHeight: 1 }}>
          <span style={{ color: colors.textPrimary }}>TYPE</span><span style={{ color: colors.accent }}>RUSH</span>
        </div>
        {packInfo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: `1px solid ${colors.border}`, borderRadius: '999px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: colors.accent, display: 'inline-block' }} />
            <span style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.accent, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{packInfo.theme}</span>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: 400 }}>
          {[
            ['01', lang === 'cat' ? 'Escriu la paraula exactament com apareix' : lang === 'es' ? 'Escribe la palabra exactamente como aparece' : 'Type the word exactly as it appears'],
            ['02', lang === 'cat' ? 'Verd = correcte · Vermell = error, trenca la ratxa' : lang === 'es' ? 'Verde = correcto · Rojo = error, rompe la racha' : 'Green = correct · Red = mistake, breaks streak'],
            ['03', lang === 'cat' ? '10 paraules en menys de 3s = COMBO ×5' : lang === 'es' ? '10 palabras en menos de 3s = COMBO ×5' : '10 words under 3s each = COMBO ×5'],
            ['04', lang === 'cat' ? '20 paraules en menys de 5s = COMBO ×20' : lang === 'es' ? '20 palabras en menos de 5s = COMBO ×20' : '20 words under 5s each = COMBO ×20'],
          ].map(([n, text]) => (
            <div key={n} style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
              <span style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.numberMuted, width: 20, flexShrink: 0 }}>{n}</span>
              <span style={{ fontFamily: fonts.display, fontSize: '13px', color: colors.textSecondary, lineHeight: 1.5 }}>{text}</span>
            </div>
          ))}
        </div>
        <button onClick={startGame}
          style={{ backgroundColor: colors.accent, color: '#000', border: 'none', borderRadius: '4px', padding: '16px 64px', fontFamily: fonts.mono, fontSize: '15px', fontWeight: 900, letterSpacing: '0.2em', cursor: 'pointer', marginTop: '8px', textTransform: 'uppercase', transition: 'background-color 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = colors.accentHover; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = colors.accent; }}>
          {u.start}
        </button>
        <span style={{ fontFamily: fonts.display, fontSize: '11px', color: colors.numberMuted, letterSpacing: '0.1em' }}>{formatDate(lang)}</span>
      </div>
    </div>
  );

  // ── RESULTS ────────────────────────────────────────────────────────────────
  if (screen === 'results') return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.mono, userSelect: 'none' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '32px 24px', maxWidth: 480, width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontFamily: fonts.display, fontSize: '96px', fontWeight: 900, color: colors.accent, lineHeight: 1 }}>{score}</span>
          <span style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.textSecondary, letterSpacing: '0.2em', textTransform: 'uppercase' }}>{u.words}</span>
        </div>
        <div style={{ width: '100%', height: 1, backgroundColor: colors.border }} />
        <div style={{ display: 'flex', gap: '40px' }}>
          {[{ v: bestCombo, k: u.bestStreak }, { v: score, k: u.wpm }, ...(comboLevel ? [{ v: comboLevel === 'x20' ? '×20' : '×5', k: u.combo, accent: true }] : [])].map((s) => (
            <div key={s.k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontFamily: fonts.display, fontSize: '30px', fontWeight: 900, color: s.accent ? colors.combo5 : colors.textPrimary, lineHeight: 1 }}>{s.v}</span>
              <span style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textSecondary, letterSpacing: '0.2em', textTransform: 'uppercase' }}>{s.k}</span>
            </div>
          ))}
        </div>
        <div style={{ width: '100%', height: 1, backgroundColor: colors.border }} />

        {/* Save */}
        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <input value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder={u.anon} maxLength={20} disabled={!!user}
            style={{ flex: 1, backgroundColor: colors.surface, border: `1px solid ${colors.borderMedium}`, borderRadius: '4px', padding: '10px 14px', fontFamily: fonts.mono, fontSize: '13px', color: colors.textPrimary, outline: 'none' }} />
          <button onClick={handleSave} disabled={saveState !== 'idle'}
            style={{ backgroundColor: saveState === 'saved' ? 'rgba(0,255,135,0.1)' : 'transparent', border: `1px solid ${saveState === 'saved' ? colors.accent : colors.borderMedium}`, color: saveState === 'saved' ? colors.accent : colors.textSecondary, borderRadius: '4px', padding: '10px 16px', fontFamily: fonts.mono, fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: saveState === 'idle' ? 'pointer' : 'default', whiteSpace: 'nowrap' }}>
            {saveState === 'saving' ? u.saving : saveState === 'saved' ? u.saved : u.save}
          </button>
        </div>
        {!user && <p style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.textMuted, textAlign: 'center' }}>{u.loginPrompt} <a href="/signup" style={{ color: colors.accent, textDecoration: 'none' }}>Sign up</a></p>}

        {/* Share card */}
        {showCard && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>
            <canvas ref={canvasRef} style={{ width: '100%', maxWidth: 420, borderRadius: '6px', display: 'block' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%' }}>
              {[
                { label: '⬇ PNG',         onClick: dlPng,           color: '' },
                { label: '𝕏 Twitter',     onClick: shareTwitter,   color: colors.twitter },
                { label: 'in LinkedIn',   onClick: shareLinkedin,  color: colors.linkedin },
                { label: '◎ Instagram',  onClick: shareInstagram, color: colors.instagram },
              ].map(b => (
                <button key={b.label} onClick={b.onClick}
                  style={{ background: 'transparent', border: `1px solid ${b.color || colors.borderMedium}`, color: b.color || colors.textSecondary, borderRadius: '4px', padding: '10px', fontFamily: fonts.mono, fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer' }}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <button onClick={() => setShowCard(v => !v)} style={{ background: 'transparent', border: `1px solid ${colors.accent}`, color: colors.accent, borderRadius: '4px', padding: '13px', fontFamily: fonts.mono, fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'uppercase' }}>
            {showCard ? u.hide : u.share}
          </button>
          <button onClick={startGame} style={{ background: 'transparent', border: `1px solid ${colors.borderMedium}`, color: colors.textSecondary, borderRadius: '4px', padding: '13px', fontFamily: fonts.mono, fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'uppercase' }}>
            {u.again}
          </button>
          <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: colors.textMuted, padding: '8px', fontFamily: fonts.mono, fontSize: '11px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {u.home}
          </button>
        </div>
      </div>
    </div>
  );

  // ── PLAYING + PAUSED ───────────────────────────────────────────────────────
  return (
    <div
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: flashGreen ? `radial-gradient(ellipse at center,#001a0e,${colors.background} 55%)` : colors.background, userSelect: 'none', overflowX: 'hidden', transition: 'background 0.2s', fontFamily: fonts.mono }}
      onClick={() => inputRef.current?.focus()}>

      {comboAnim && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 200, fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(28px,5vw,40px)', letterSpacing: '-0.02em', color: comboAnim === 'x20' ? colors.combo20 : colors.combo5, animation: 'comboSplash 2.2s ease forwards' }}>
          {comboAnim === 'x20' ? 'COMBO ×20' : 'COMBO ×5'}
        </div>
      )}

      {screen === 'paused' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(12,12,11,0.92)', backdropFilter: 'blur(12px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '40px 48px', backgroundColor: colors.surface, border: `1px solid ${colors.borderMedium}`, borderRadius: '8px', minWidth: 280 }}>
            <p style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: '32px', textTransform: 'uppercase', letterSpacing: '-0.02em', color: colors.textPrimary }}>{u.paused}</p>
            {quitConfirm ? (
              <>
                <p style={{ fontFamily: fonts.mono, fontSize: '13px', color: colors.textSecondary, textAlign: 'center' }}>{u.quit}</p>
                <button onClick={handleQuit} style={{ width: '100%', background: 'transparent', border: `1px solid ${colors.error}`, color: colors.error, borderRadius: '4px', padding: '12px', fontFamily: fonts.mono, fontSize: '12px', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}>{u.yes}</button>
                <button onClick={() => setQuitConfirm(false)} style={{ width: '100%', background: 'transparent', border: `1px solid ${colors.borderMedium}`, color: colors.textSecondary, borderRadius: '4px', padding: '12px', fontFamily: fonts.mono, fontSize: '12px', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}>{u.no}</button>
              </>
            ) : (
              <>
                <button onClick={handleResume} style={{ width: '100%', background: colors.accent, border: 'none', color: '#000', borderRadius: '4px', padding: '12px', fontFamily: fonts.mono, fontSize: '12px', fontWeight: 900, cursor: 'pointer', textTransform: 'uppercase' }}>{u.resume}</button>
                <button onClick={() => setQuitConfirm(true)} style={{ width: '100%', background: 'transparent', border: 'none', color: colors.textMuted, padding: '8px', fontFamily: fonts.mono, fontSize: '11px', cursor: 'pointer', textTransform: 'uppercase' }}>{u.home}</button>
              </>
            )}
          </div>
        </div>
      )}

      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: `1px solid ${colors.border}`, background: `${colors.background}ee`, backdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
          <span style={{ fontFamily: fonts.display, fontSize: '22px', fontWeight: 900, color: colors.textPrimary }}>TYPE</span>
          <span style={{ fontFamily: fonts.display, fontSize: '22px', fontWeight: 900, color: colors.accent }}>RUSH</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {comboLevel && <span style={{ fontFamily: fonts.mono, fontSize: '18px', fontWeight: 900, color: comboLevel === 'x20' ? colors.combo20 : colors.combo5 }}>{comboLevel === 'x20' ? '×20' : '×5'}</span>}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
            <span style={{ fontFamily: fonts.display, fontSize: '22px', fontWeight: 900, color: colors.accent, lineHeight: 1 }}>{score}</span>
            <span style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textSecondary, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{u.words}</span>
          </div>
          <button onClick={screen === 'playing' ? handlePause : handleResume}
            style={{ background: 'transparent', border: `1px solid ${colors.border}`, color: colors.textSecondary, borderRadius: '4px', width: 32, height: 32, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {screen === 'playing' ? '⏸' : '▶'}
          </button>
        </div>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '0 24px', marginTop: '16px' }}>
        {packInfo && <span style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.numberMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{packInfo.theme}</span>}
        <div key={wordKey} style={{ fontFamily: fonts.mono, fontWeight: 900, fontSize: 'clamp(48px,10vw,92px)', letterSpacing: '0.04em', lineHeight: 1.05, color: colors.textPrimary }}>
          {renderLetters()}
        </div>
        <div style={{ fontFamily: fonts.mono, fontSize: '28px', fontWeight: 700, minHeight: 40, letterSpacing: '0.02em' }}>
          {input.split('').map((ch, i) => (
            <span key={i} style={{ color: i < currentWord.length && ch === currentWord[i] ? colors.accent : colors.error }}>{ch}</span>
          ))}
          <span style={{ color: colors.accent }}>|</span>
        </div>
        <input ref={inputRef} value={input} onChange={handleInput}
          style={{ position: 'absolute', opacity: 0, width: 1, height: 1, pointerEvents: 'none' }}
          autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} />

        {comboStreak > 0 && comboLevel !== 'x20' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {Array.from({ length: comboLevel === 'x5' ? COMBO_X20.count : COMBO_X5.count }).map((_, i) => {
                const filled = comboLevel === 'x5' ? i < (comboStreak - COMBO_X5.count) : i < comboStreak;
                const col = comboLevel === 'x5' ? colors.combo20 : colors.combo5;
                return <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: filled ? col : colors.border, transition: 'background-color 0.1s' }} />;
              })}
            </div>
            <span style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textSecondary, letterSpacing: '0.1em' }}>
              {comboLevel === 'x5' ? `×5 · ${comboStreak - COMBO_X5.count}/${COMBO_X20.count - COMBO_X5.count} → ×20` : `${comboStreak}/${COMBO_X5.count} → ×5`}
            </span>
          </div>
        )}
      </main>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', maxWidth: 480, padding: '24px 24px 0', marginTop: '20px' }}>
        <div style={{ width: '100%', height: 3, backgroundColor: colors.border, borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: '2px', width: `${timerPct}%`, backgroundColor: timerColor, transition: 'width 1s linear, background-color 0.6s ease' }} />
        </div>
        <span style={{ fontFamily: fonts.mono, fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em', color: timerColor }}>{timeLeft}s</span>
      </div>

      <p style={{ position: 'fixed', bottom: '16px', fontFamily: fonts.mono, fontSize: '10px', color: colors.numberMuted, textAlign: 'center' }}>{u.click}</p>

      <style>{`
        @keyframes comboSplash {
          0%   { opacity:0; transform:translate(-50%,-50%) scale(0.6) rotate(-2deg); }
          15%  { opacity:1; transform:translate(-50%,-50%) scale(1.08) rotate(0deg); }
          70%  { opacity:1; }
          100% { opacity:0; transform:translate(-50%,-50%) scale(0.95); }
        }
      `}</style>
    </div>
  );
}
