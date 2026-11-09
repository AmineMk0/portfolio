import { useEffect, useId, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Check, FileCode2, Pause, Play, RotateCcw } from 'lucide-react';

export const developerCode = `interface Developer {
  name: string;
  role: string;
  skills: string[];
  available: boolean;
}
const amine: Developer = {
  name: "Amine Moutaki",
  role: "Fullstack Developer",
  skills: [
    "React",
    "TypeScript",
    "Laravel",
    "MySQL"
  ],
  available: true
};
console.log("Let's build something great!");`;

function highlight(line: string) {
  return line.split(/("[^"\n]*"|\b(?:interface|const|true|string|boolean|Developer)\b|\bconsole\b|\blog\b)/g).map((token, index) => {
    const style = token.startsWith('"') ? 'code-string' : /^(interface|const|true)$/.test(token) ? 'code-keyword' : /^(string|boolean|Developer)$/.test(token) ? 'code-type' : /^(console|log)$/.test(token) ? 'code-function' : undefined;
    return <span className={style} key={index}>{token}</span>;
  });
}

export function LiveCodeAnimation() {
  const panel = useRef<HTMLElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const inView = useInView(panel, { amount: .15 });
  const reducedMotion = useReducedMotion();
  const [position, setPosition] = useState(0);
  const [paused, setPaused] = useState(false);
  const id = useId();
  const visiblePosition = reducedMotion ? developerCode.length : position;
  const complete = visiblePosition >= developerCode.length;
  const lines = developerCode.slice(0, visiblePosition).split('\n');

  useEffect(() => {
    if (!inView || paused || complete || reducedMotion) return;
    const next = developerCode[position];
    const delay = next === '\n' ? 120 : /[;{},]/.test(next) ? 65 : 24 + (position % 5) * 5;
    const timer = setTimeout(() => setPosition(current => current + 1), delay);
    return () => clearTimeout(timer);
  }, [inView, paused, complete, position, reducedMotion]);

  useEffect(() => {
    if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight;
  }, [visiblePosition]);

  return <article className="lab-panel live-code" ref={panel} aria-labelledby={id}>
    <header className="lab-panel-header"><h3 id={id}><span>//</span> LIVE_CODE</h3><div className="lab-controls"><button onClick={() => setPaused(value => !value)} disabled={complete} aria-label={paused ? 'Resume code animation' : 'Pause code animation'}>{paused ? <Play size={13} /> : <Pause size={13} />}<span>{paused ? 'RESUME' : 'PAUSE'}</span></button><button onClick={() => { setPosition(0); setPaused(false); }} aria-label="Replay code animation"><RotateCcw size={13} /><span>REPLAY</span></button></div></header>
    <div className="editor-tab"><FileCode2 size={13} /><span>developer.ts</span><span className="editor-language">TypeScript</span></div>
    <div className="code-viewport" ref={scroll} tabIndex={0} role="region" aria-label="Animated TypeScript demonstration">
      <pre aria-hidden="true">{lines.map((line, index) => <div className="code-line" key={index}><span className="line-number">{index + 1}</span><code>{highlight(line)}{index === lines.length - 1 && !complete && <span className="code-cursor" />}</code></div>)}</pre>
      <span className="sr-only">{developerCode}</span>
    </div>
    <div className="code-output" role="status" aria-live="polite">{complete ? <motion.div initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .4 }}><p className="compile-success">&gt; Compiled successfully <Check size={13} /></p><p>&gt; Developer: Amine Moutaki</p><p>&gt; Status: Available for projects</p></motion.div> : <p className="code-status">{paused ? 'Typing paused.' : !inView ? 'Waiting for viewport…' : 'Typing developer.ts…'}<span className="code-status-dot" /></p>}</div>
  </article>;
}
