import { useEffect, useState } from 'react';
import { Maximize, Minimize, Menu, X } from 'lucide-react';
import { profile } from '../data/portfolio';

const links = [['home', '01_HOME'], ['about', '02_ABOUT'], ['projects', '03_PROJECTS'], ['stack', '04_STACK'], ['contact', '05_CONTACT']] as const;

export function Navbar() {
  const [active, setActive] = useState('home');
  const [open, setOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    const track = () => {
      const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 30;
      if (nearBottom && window.scrollY > 100) return setActive('contact');
      let current = 'home';
      for (const [id] of links) {
        if (id !== 'about' && (document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) < 180) current = id;
      }
      if (window.location.hash === '#about' && current === 'home') current = 'about';
      setActive(current);
    };
    const onFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    window.addEventListener('scroll', track, { passive: true });
    document.addEventListener('fullscreenchange', onFullscreen);
    return () => { window.removeEventListener('scroll', track); document.removeEventListener('fullscreenchange', onFullscreen); };
  }, []);
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch { /* Unsupported browser: keep the page usable. */ }
  }
  return <header className="navbar">
    <a href="#home" className="identity" aria-label={`${profile.name}, home`}><span className="logo">{profile.name.split(/\s+/).map(part => part[0]).join('')}</span><span className="identity-name">{profile.name.toUpperCase()}</span><span className="identity-role">{profile.role.toUpperCase()}</span><span className="status-dot" title="Available for projects" /></a>
    <button className="icon-button mobile-menu" onClick={() => setOpen(!open)} aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="main-navigation">{open ? <X /> : <Menu />}</button>
    <nav id="main-navigation" className={open ? 'navigation is-open' : 'navigation'} aria-label="Main navigation">{links.map(([id, label]) => <a key={id} href={`#${id}`} className={active === id ? 'active' : ''} aria-current={active === id ? 'location' : undefined} onClick={() => { setActive(id); setOpen(false); }}>{label}</a>)}</nav>
    <button className="icon-button fullscreen-button" onClick={toggleFullscreen} aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>{fullscreen ? <Minimize /> : <Maximize />}</button>
  </header>;
}

