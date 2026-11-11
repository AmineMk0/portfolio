import { useEffect, useState } from 'react';
import type { Ref } from 'react';
import { Maximize, Minimize, Menu, X } from 'lucide-react';
import { profile } from '../data/portfolio';

const links = [['home', '01_HOME'], ['about', '02_ABOUT'], ['projects', '03_PROJECTS'], ['stack', '04_STACK'], ['contact', '05_CONTACT'], ['education', '06_EDUCATION']] as const;

export function Navbar({ logoRef }: { logoRef?: Ref<HTMLSpanElement> }) {
  const [active, setActive] = useState('home');
  const [open, setOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    const track = () => {
      const hash = window.location.hash.slice(1);
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 30;
      if (atBottom && window.scrollY > 100) {
        const target = document.getElementById(hash)?.getBoundingClientRect();
        const visibleAnchor = (hash === 'education' || hash === 'stack') && target && target.top >= 0 && target.top < window.innerHeight;
        return setActive(visibleAnchor ? hash : 'contact');
      }

      let current = 'home';
      let closestTop = -Infinity;
      for (const [id] of links) {
        if (id === 'about') continue;
        const top = document.getElementById(id)?.getBoundingClientRect().top ?? Infinity;
        if (top < 180 && top >= closestTop) {
          current = id;
          closestTop = top;
        }
      }
      if (hash === 'about' && current === 'home') current = 'about';
      setActive(current);
    };
    const onFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    track();
    window.addEventListener('scroll', track, { passive: true });
    window.addEventListener('hashchange', track);
    document.addEventListener('fullscreenchange', onFullscreen);
    return () => {
      window.removeEventListener('scroll', track);
      window.removeEventListener('hashchange', track);
      document.removeEventListener('fullscreenchange', onFullscreen);
    };
  }, []);
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch { /* Unsupported browser: keep the page usable. */ }
  }
  return <header className="navbar">
    <a href="#home" className="identity" aria-label={`${profile.name}, home`}><span ref={logoRef} className="logo">{profile.name.split(/\s+/).map(part => part[0]).join('')}</span><span className="identity-name">{profile.name.toUpperCase()}</span><span className="identity-role">{profile.role.toUpperCase()}</span><span className="status-dot" title="Available for projects" /></a>
    <button className="icon-button mobile-menu" onClick={() => setOpen(!open)} aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="main-navigation">{open ? <X /> : <Menu />}</button>
    <nav id="main-navigation" className={open ? 'navigation is-open' : 'navigation'} aria-label="Main navigation">{links.map(([id, label]) => <a key={id} href={`#${id}`} className={active === id ? 'active' : ''} aria-current={active === id ? 'location' : undefined} onClick={() => { setActive(id); setOpen(false); }}>{label}</a>)}</nav>
    <button className="icon-button fullscreen-button" onClick={toggleFullscreen} aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>{fullscreen ? <Minimize /> : <Maximize />}</button>
  </header>;
}

