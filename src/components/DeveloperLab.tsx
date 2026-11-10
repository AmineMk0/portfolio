import { LiveCodeAnimation } from './LiveCodeAnimation';
import { InteractiveTerminal } from './InteractiveTerminal';
import './developer-lab.css';

export function DeveloperLab() {
  return <section id="developer-lab" className="developer-lab" aria-labelledby="lab-heading">
    <div className="section-header"><div><h2 id="lab-heading"><span>//</span> DEVELOPER_LAB</h2><p className="section-subtitle">Explore my development environment.</p></div></div>
    <div className="lab-grid"><LiveCodeAnimation /><InteractiveTerminal /></div>
  </section>;
}
