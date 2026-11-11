import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { motion } from 'framer-motion';
import './intro-animation.css';

const SESSION_KEY = 'amine-portfolio-intro-seen';
// Temporary testing mode: set false to restore once-per-session playback.
const REPLAY_INTRO_ON_EVERY_LOAD = true;

export function shouldPlayIntro() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (REPLAY_INTRO_ON_EVERY_LOAD) return true;
  try {
    return sessionStorage.getItem(SESSION_KEY) !== 'true';
  } catch {
    return false;
  }
}

interface IntroAnimationProps {
  targetRef: RefObject<HTMLSpanElement | null>;
  onReveal: () => void;
  onComplete: (restoreFocus?: boolean) => void;
}

export function IntroAnimation({ targetRef, onReveal, onComplete }: IntroAnimationProps) {
  const logoRef = useRef<HTMLSpanElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const skipAction = useRef<() => void>(() => {});
  const [phase, setPhase] = useState<'drawing' | 'moving' | 'revealing'>('drawing');
  const [skipping, setSkipping] = useState(false);

  useEffect(() => {
    if (!REPLAY_INTRO_ON_EVERY_LOAD) {
      try { sessionStorage.setItem(SESSION_KEY, 'true'); } catch { /* Storage is optional. */ }
    }

    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousGutter = root.style.scrollbarGutter;
    // Reserve space only for classic scrollbars; overlay scrollbars use none.
    if (window.innerWidth > root.clientWidth) root.style.scrollbarGutter = 'stable';
    root.style.overflow = 'hidden';
    body.style.overflow = 'hidden';

    let frame = 0;
    let cancelled = false;
    let revealed = false;
    let moving = false;
    let restoreFocus = false;
    let exitStarted: number | null = null;
    const start = performance.now();
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');

    const reveal = () => {
      if (revealed) return;
      revealed = true;
      setPhase('revealing');
      onReveal();
    };

    const finish = () => {
      if (cancelled) return;
      cancelled = true;
      cancelAnimationFrame(frame);
      onComplete(restoreFocus);
    };

    const placeLogo = (progress: number) => {
      const target = targetRef.current;
      const logo = logoRef.current;
      if (!target || !logo) return false;
      const rect = target.getBoundingClientRect();
      const style = getComputedStyle(target);
      logo.style.font = style.font;
      logo.style.letterSpacing = style.letterSpacing;
      logo.style.color = style.color;
      logo.style.width = `${rect.width}px`;
      logo.style.height = `${rect.height}px`;
      const scale = Math.min(3.5, window.innerWidth / (rect.width * 3));
      const fromX = (root.clientWidth - rect.width * scale) / 2;
      const fromY = (window.innerHeight - rect.height * scale) / 2;
      const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      const x = fromX + (rect.left - fromX) * eased;
      const y = fromY + (rect.top - fromY) * eased;
      logo.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale + (1 - scale) * eased})`;
      logo.style.visibility = 'visible';
      return true;
    };

    const tick = (now: number) => {
      if (cancelled) return;
      const elapsed = now - start;
      if (!placeLogo(exitStarted !== null ? 1 : Math.max(0, Math.min(1, (elapsed - 1200) / 900)))) {
        finish();
        return;
      }
      if (exitStarted !== null) {
        if (now - exitStarted >= 180) return finish();
      } else {
        if (elapsed >= 1200 && !moving) {
          moving = true;
          setPhase('moving');
        }
        if (elapsed >= 2100) reveal();
        if (elapsed >= 2600) return finish();
      }
      frame = requestAnimationFrame(tick);
    };

    skipAction.current = () => {
      if (cancelled || exitStarted !== null) return;
      restoreFocus = document.activeElement === skipRef.current;
      exitStarted = performance.now();
      setSkipping(true);
      placeLogo(1);
      reveal();
    };
    const motionChange = () => { if (media.matches) { reveal(); finish(); } };
    media.addEventListener('change', motionChange);
    if (media.matches) motionChange();
    else {
      placeLogo(0);
      frame = requestAnimationFrame(tick);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      media.removeEventListener('change', motionChange);
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      root.style.scrollbarGutter = previousGutter;
    };
  }, [targetRef, onReveal, onComplete]);

  return (
    <div className="intro-animation" data-phase={phase} data-skipping={skipping || undefined} role="region" aria-label="Amine Moutaki portfolio introduction">
      <motion.div className="intro-backdrop" initial={false} animate={{ opacity: phase === 'revealing' ? 0 : 1 }} transition={{ duration: skipping ? 0.18 : 0.5 }} />
      <span ref={logoRef} className="logo intro-logo" aria-hidden="true">AM</span>
      <motion.div className="intro-caption" initial={false} animate={{ opacity: phase === 'drawing' ? 1 : 0, y: phase === 'drawing' ? 0 : -6 }} transition={{ duration: skipping ? 0 : 0.2 }}>
        <p className="intro-name" aria-label="Amine Moutaki">
          {Array.from('AMINE MOUTAKI').map((letter, index) => (
            <motion.span key={index} aria-hidden="true" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + index * 0.025, duration: 0.22 }}>{letter === ' ' ? '\u00a0' : letter}</motion.span>
          ))}
        </p>
        <motion.p className="intro-subtitle" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.25 }}>FULLSTACK DEVELOPER</motion.p>
      </motion.div>
      <button ref={skipRef} className="intro-skip" type="button" onClick={() => skipAction.current()}>SKIP INTRO <span aria-hidden="true">→</span></button>
    </div>
  );
}
