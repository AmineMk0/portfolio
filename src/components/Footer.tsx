import { profile } from '../data/portfolio';
import { MoroccoFlag } from './MoroccoFlag';

export function Footer() {
  return <footer id="contact"><p>© 2026 {profile.name}. All rights reserved.</p><div>{profile.email ? <a href={`mailto:${profile.email}`} className="footer-contact">LET’S TALK ↗</a> : null}<p>BASED IN {profile.location.toUpperCase()} <MoroccoFlag /><span className="status-dot" /></p></div></footer>;
}

