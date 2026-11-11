import { MotionConfig } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { IntroAnimation, shouldPlayIntro } from './components/IntroAnimation';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MiniGame } from './components/MiniGame';
import { Projects } from './components/Projects';
import { SystemLog } from './components/SystemLog';
import { TechStack } from './components/TechStack';
import { Footer } from './components/Footer';
import { DeveloperLab } from './components/DeveloperLab';
import { Education } from './components/Education';
import { education } from './data/portfolio';

export default function App() {
  const [introPlaying, setIntroPlaying] = useState(shouldPlayIntro);
  const [revealed, setRevealed] = useState(!introPlaying);
  const logoRef = useRef<HTMLSpanElement>(null);
  const restoreIntroFocus = useRef(false);
  const reveal = useCallback(() => setRevealed(true), []);
  const complete = useCallback((restoreFocus = false) => {
    restoreIntroFocus.current = restoreFocus;
    setRevealed(true);
    setIntroPlaying(false);
  }, []);
  useEffect(() => {
    if (!introPlaying && restoreIntroFocus.current) {
      restoreIntroFocus.current = false;
      logoRef.current?.closest('a')?.focus({ preventScroll: true });
    }
  }, [introPlaying]);

  return <MotionConfig reducedMotion="user"><div className={`site-shell${introPlaying ? ' intro-running' : ''}`} id="home" inert={introPlaying} aria-hidden={introPlaying || undefined}>
    <Navbar logoRef={logoRef} />
    <main><Hero revealed={revealed} /><MiniGame /><Projects /><DeveloperLab /><Education entries={education} /><div className="system-panel"><SystemLog /><TechStack /></div></main>
    <Footer />
  </div>{introPlaying && <IntroAnimation targetRef={logoRef} onReveal={reveal} onComplete={complete} />}</MotionConfig>;
}

