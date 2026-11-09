import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Eraser, Terminal } from 'lucide-react';
import { contactHref, runTerminalCommand } from '../data/terminalCommands';
import type { TerminalEntry } from '../types/developerLab';

const welcome: TerminalEntry = { id: 0, lines: ["Welcome to Amine's developer terminal.", "Type 'help' to explore."] };
const matrixAlphabet = '01アイウエオカキクケコサシスセソ';
const matrixColumns = Array.from({ length: 18 }, (_, index) => Array.from({ length: 15 }, (_, row) => matrixAlphabet[((index * 7) + row * 3) % matrixAlphabet.length]).join('\n'));

export function InteractiveTerminal() {
  const [entries, setEntries] = useState<TerminalEntry[]>([welcome]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const draft = useRef('');
  const sequence = useRef(1);
  const [matrix, setMatrix] = useState(false);
  const [particles, setParticles] = useState(0);
  const matrixTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const particleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const reducedMotion = useReducedMotion();
  const id = useId();

  useEffect(() => {
    if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight;
  }, [entries]);
  useEffect(() => () => { if (matrixTimer.current) clearTimeout(matrixTimer.current); if (particleTimer.current) clearTimeout(particleTimer.current); }, []);

  function clearOutput() {
    setEntries([]); setMatrix(false); setParticles(0); setInput(''); setHistoryIndex(null);
    if (matrixTimer.current) clearTimeout(matrixTimer.current);
    if (particleTimer.current) clearTimeout(particleTimer.current);
    inputRef.current?.focus({ preventScroll: true });
  }

  function execute(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const command = input.trim();
    if (!command) return;
    const result = runTerminalCommand(command);
    setHistory(current => [...current, command].slice(-100)); setHistoryIndex(null); draft.current = ''; setInput('');
    if (result.action === 'clear') { clearOutput(); return; }
    setEntries(current => [...current, { id: sequence.current++, command, lines: result.lines, secret: result.action === 'hire' }].slice(-100));
    if (result.action === 'game') document.getElementById('mini-game')?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'center' });
    if (result.action === 'github' && result.url) window.open(result.url, '_blank', 'noopener,noreferrer');
    if (result.action === 'matrix') {
      if (matrixTimer.current) clearTimeout(matrixTimer.current);
      setMatrix(true); matrixTimer.current = setTimeout(() => setMatrix(false), 3000);
    }
    if (result.action === 'hire' && !reducedMotion) {
      if (particleTimer.current) clearTimeout(particleTimer.current);
      setParticles(sequence.current); particleTimer.current = setTimeout(() => setParticles(0), 1000);
    }
  }

  function navigateHistory(event: KeyboardEvent<HTMLInputElement>) {
    if (!['ArrowUp', 'ArrowDown'].includes(event.key) || !history.length) return;
    event.preventDefault();
    if (historyIndex === null) draft.current = input;
    const next = event.key === 'ArrowUp' ? Math.max(0, (historyIndex ?? history.length) - 1) : Math.min(history.length, (historyIndex ?? history.length) + 1);
    setHistoryIndex(next === history.length ? null : next);
    setInput(next === history.length ? draft.current : history[next]);
  }

  return <article className="lab-panel terminal-panel" aria-labelledby={id}>
    <header className="lab-panel-header"><h3 id={id}><span>//</span> DEVELOPER_TERMINAL</h3><div className="lab-controls"><button onClick={clearOutput} aria-label="Clear terminal"><Eraser size={13} /><span>CLEAR</span></button></div></header>
    <div className="terminal-session"><Terminal size={12} /><span>amine@portfolio</span><span className="session-status">● ONLINE</span></div>
    <div className="terminal-body">
      <div className="terminal-scroll" ref={scroll} tabIndex={0} role="region" aria-label="Terminal command output"><div role="log" aria-live="polite" aria-relevant="additions">{entries.map(entry => <div className={`terminal-entry${entry.secret ? ' terminal-secret' : ''}`} key={entry.id}>{entry.command && <p className="terminal-command"><span>amine@portfolio:~$</span> {entry.command}</p>}{entry.lines.map((line, index) => <p key={index}>{line}</p>)}{entry.secret && <a href={contactHref()} className="terminal-contact">CONTACT ME <ArrowUpRight size={13} /></a>}</div>)}</div></div>
      <AnimatePresence>{matrix && <motion.div className="matrix-effect" role="status" aria-label="Matrix animation running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : .2 }}><div aria-hidden="true">{matrixColumns.map((column, index) => <span key={index} style={{ animationDelay: `${-(index % 7) * .3}s`, animationDuration: `${1.1 + (index % 4) * .25}s` }}>{column}</span>)}</div><p>MATRIX SEQUENCE · 3s</p></motion.div>}</AnimatePresence>
      {particles > 0 && <div className="hire-particles" key={particles} aria-hidden="true">{Array.from({ length: 14 }, (_, index) => <motion.i key={index} initial={{ opacity: 1, x: 0, y: 0 }} animate={{ opacity: 0, x: Math.cos(index * 2.4) * 110, y: Math.sin(index * 2.4) * 85 }} transition={{ duration: .9 }} />)}</div>}
    </div>
    <form className="terminal-form" onSubmit={execute}><label htmlFor={`${id}-input`} aria-label="Terminal prompt">&gt;</label><input ref={inputRef} id={`${id}-input`} aria-label="Terminal command" placeholder="Type a command…" value={input} onChange={event => { setInput(event.target.value); setHistoryIndex(null); }} onKeyDown={navigateHistory} autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={256} enterKeyHint="send" /><span className="terminal-input-cursor" aria-hidden="true" /><button type="submit" aria-label="Execute terminal command">↵</button></form>
  </article>;
}
