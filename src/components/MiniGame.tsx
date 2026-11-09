import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BarChart3, CodeXml, Play, RotateCcw, Trophy, Volume2, VolumeX } from 'lucide-react';

interface Bug { id: number; x: number; y: number; }
interface Reward { id: number; x: number; y: number; }
type GameStatus = 'idle' | 'playing' | 'finished';
const BEST_KEY = 'zs-portfolio-best';
const initialBugs: Bug[] = [{ id: 1, x: 15, y: 47 }, { id: 2, x: 39, y: 19 }, { id: 3, x: 57, y: 46 }, { id: 4, x: 83, y: 60 }, { id: 5, x: 43, y: 84 }];
const pixels = 'M5 1h2v2h2V1h2v2h-1v1h2v2h1V4h1v3h-2v2h2v1h-2v2h2v3h-1v-2h-1v2h-2v1H6v-1H4v-2H3v2H2v-3h2v-2H2V9h2V7H2V4h1v2h1V4h2V3H5Zm1 5v2h1V6Zm3 0v2h1V6ZM7 10v4h1v-4Z';
function PixelBug({ small = false }: { small?: boolean }) { return <svg width={small ? 27 : 34} height={small ? 27 : 34} viewBox="0 0 16 18" aria-hidden="true" shapeRendering="crispEdges"><path d={pixels} fill="currentColor" /></svg>; }
function readBest(): number { try { const n = Number(localStorage.getItem(BEST_KEY)); return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0; } catch { return 0; } }

export function MiniGame() {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [bugs, setBugs] = useState<Bug[]>(initialBugs);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(readBest);
  const [remaining, setRemaining] = useState(30);
  const [sound, setSound] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const nextId = useRef(10);
  const scoreRef = useRef(0);
  const claimed = useRef(new Set<number>());
  const deadline = useRef(0);
  const audio = useRef<AudioContext | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reducedMotion = useReducedMotion();

  function finish() {
    setStatus('finished'); setRemaining(0);
    setBest(old => { const value = Math.max(old, scoreRef.current); try { localStorage.setItem(BEST_KEY, String(value)); } catch { /* Storage can be unavailable in private browsing. */ } return value; });
  }
  function start() {
    timers.current.forEach(clearTimeout); timers.current = [];
    claimed.current.clear(); scoreRef.current = 0; setScore(0); setRemaining(30); setRewards([]);
    setBugs(initialBugs.map(bug => ({ ...bug, id: nextId.current++ })));
    deadline.current = Date.now() + 30_000; setStatus('playing');
    if (sound) enableAudio();
  }
  function enableAudio() {
    try { audio.current ??= new AudioContext(); void audio.current.resume().catch(() => undefined); } catch { /* Audio is optional. */ }
  }
  function beep() {
    if (!sound || !audio.current) return;
    const ctx = audio.current; const oscillator = ctx.createOscillator(); const gain = ctx.createGain();
    oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(740, ctx.currentTime); oscillator.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + .07);
    gain.gain.setValueAtTime(.035, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .1);
    oscillator.connect(gain); gain.connect(ctx.destination); oscillator.start(); oscillator.stop(ctx.currentTime + .11);
  }
  useEffect(() => {
    if (status !== 'playing') return;
    const clock = setInterval(() => { const seconds = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)); setRemaining(seconds); if (seconds === 0) finish(); }, 100);
    const movement = setInterval(() => setBugs(current => current.map(bug => ({ ...bug, x: Math.min(87, Math.max(8, bug.x + (Math.random() - .5) * 23)), y: Math.min(82, Math.max(13, bug.y + (Math.random() - .5) * 30)) }))), 1050);
    return () => { clearInterval(clock); clearInterval(movement); };
  }, [status]);
  useEffect(() => () => { timers.current.forEach(clearTimeout); void audio.current?.close(); }, []);

  function catchBug(bug: Bug) {
    if (status !== 'playing' || claimed.current.has(bug.id)) return;
    if (Date.now() >= deadline.current) { finish(); return; }
    claimed.current.add(bug.id); scoreRef.current += 10; setScore(scoreRef.current);
    setBugs(current => current.filter(item => item.id !== bug.id));
    setRewards(current => [...current, bug]); beep();
    timers.current.push(setTimeout(() => setRewards(current => current.filter(item => item.id !== bug.id)), 650));
    timers.current.push(setTimeout(() => setBugs(current => [...current, { id: nextId.current++, x: 9 + Math.random() * 77, y: 15 + Math.random() * 65 }]), 250));
  }
  return <section className="mini-game" id="mini-game" aria-labelledby="game-heading">
    <div className="game-intro"><h2><span>//</span> MINI_GAME</h2><h3 id="game-heading"><span className="game-title-bug"><PixelBug small /></span> Catch the Bugs</h3><p>A quick game for developers!<br />Click on the bugs and<br className="desktop-break" /> collect points.</p><button className="button button-green" onClick={start} disabled={status === 'playing'}>{status === 'finished' ? <RotateCcw size={17} /> : <Play size={17} />}{status === 'playing' ? `PLAYING · ${remaining}s` : status === 'finished' ? 'RESTART' : 'START GAME'}</button></div>
    <div className={`game-board ${status === 'playing' ? 'is-playing' : ''}`} aria-label="Catch the Bugs game area"><div className="board-corners"><i /><i /><i /><i /></div>
      {status !== 'finished' && <AnimatePresence>{bugs.map(bug => <motion.button key={bug.id} className="pixel-bug" style={{ left: `${bug.x}%`, top: `${bug.y}%` }} layout={!reducedMotion} transition={{ layout: { duration: 1, ease: 'linear' } }} exit={{ scale: 0, opacity: 0, rotate: reducedMotion ? 0 : 30 }} onClick={() => catchBug(bug)} disabled={status !== 'playing'} aria-label="Catch bug for 10 XP"><PixelBug /></motion.button>)}</AnimatePresence>}
      {status === 'idle' && <span className="sample-xp" aria-hidden="true">+10 XP</span>}
      <AnimatePresence>{rewards.map(reward => <motion.span key={reward.id} className="xp-reward" style={{ left: `${reward.x}%`, top: `${reward.y}%` }} initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: reducedMotion ? 0 : -35 }} transition={{ duration: .65 }}>+10 XP</motion.span>)}</AnimatePresence>
      {status === 'playing' && <div className="game-timer" role="timer" aria-label={`${remaining} seconds remaining`}>{String(remaining).padStart(2, '0')}s</div>}
      {status === 'finished' && <div className="game-result" role="status"><Trophy size={25} /><strong>TIME’S UP!</strong><span>{score} XP COLLECTED</span><button onClick={start}><RotateCcw size={14} /> RESTART</button></div>}
    </div>
    <div className="game-stats"><div className="stat"><Trophy size={23} /><span>SCORE: <strong data-testid="score">{String(score).padStart(4, '0')}</strong></span></div><div className="stat"><BarChart3 size={23} /><span>BEST: <strong data-testid="best">{String(best).padStart(4, '0')}</strong></span></div><div className="game-tools"><CodeXml className="code-icon" size={35} /><button className="sound-button" onClick={() => { if (!sound) enableAudio(); setSound(!sound); }} aria-label={sound ? 'Mute game sound' : 'Enable game sound'} aria-pressed={sound}>{sound ? <Volume2 size={17} /> : <VolumeX size={17} />}</button></div></div>
  </section>;
}

