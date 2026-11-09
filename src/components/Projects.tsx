import { Maximize, Minimize } from 'lucide-react';
import { useState } from 'react';
import { projects } from '../data/portfolio';
import { ProjectCard } from './ProjectCard';

export function Projects() {
  const [expanded, setExpanded] = useState(false);
  return <section id="projects" className={expanded ? 'projects projects-expanded' : 'projects'} aria-labelledby="projects-heading"><div className="section-header"><h2 id="projects-heading"><span>//</span> SELECTED PROJECTS</h2><button className="view-projects" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>{expanded ? 'COMPACT_VIEW' : 'VIEW_ALL_PROJECTS'}{expanded ? <Minimize size={22} /> : <Maximize size={22} />}</button></div><div className="project-grid">{projects.map(project => <ProjectCard key={project.id} project={project} />)}</div></section>;
}

