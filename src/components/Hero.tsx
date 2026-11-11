import { useState } from 'react';
import { ArrowDown, ArrowUpRight, Download, X } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { profile } from '../data/portfolio';
import { MoroccoFlag } from './MoroccoFlag';

export function Hero({ revealed = true }: { revealed?: boolean }) {
  const reducedMotion = useReducedMotion();
  const [notice, setNotice] = useState(false);
  const details = [['WHO_AM_I', profile.name], ['ROLE', profile.role], ['LOCATION', profile.location], ['EXPERIENCE', profile.experience], ['AVAILABILITY', profile.availability]];
  return <motion.section className="hero" aria-label="Introduction" initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: revealed ? 1 : 0, y: revealed || reducedMotion ? 0 : 10 }} transition={{ duration: reducedMotion ? 0 : .45 }}>
    <div className="hero-copy"><div className="terminal-intro"><p><span>&gt;</span> INITIALIZING_PORTFOLIO.EXE<span className="cursor" aria-hidden="true">_</span></p><p><span>&gt;</span> STATUS: <strong>ONLINE</strong></p></div>
      <h1>Building Systems<br />Behind the <span>Interface.</span></h1>
      <p className="hero-description">I design and build scalable digital products with clean architecture, focused on real problems and measurable impact.</p>
      <div className="hero-actions"><a href="#projects" className="button button-outline">VIEW MY WORK <ArrowUpRight size={21} /></a>{profile.cvUrl ? <a href={profile.cvUrl} download className="button button-secondary">DOWNLOAD CV <Download size={20} /></a> : <button className="button button-secondary" onClick={() => setNotice(true)}>DOWNLOAD CV <Download size={20} /></button>}</div>
      {notice && <div className="cv-notice" role="status">CV coming soon. <button onClick={() => setNotice(false)} aria-label="Dismiss CV notice"><X size={14} /></button></div>}
      <a href="#mini-game" className="scroll-link"><span>&gt;</span> SCROLL_TO_EXPLORE <ArrowDown size={20} /></a>
    </div>
    <div className="portrait-frame"><img src={profile.photo} alt={`Portrait of ${profile.name}`} width="298" height="364" fetchPriority="high" /><i /><i /><i /><i /></div>
    <aside className="profile-details" id="about" aria-label={`About ${profile.name}`}>{details.map(([label, value]) => <div className="profile-detail" key={label}><h2><span>&gt;</span> {label}</h2><p>{value}{label === 'LOCATION' && <MoroccoFlag />}</p></div>)}</aside>
  </motion.section>;
}

