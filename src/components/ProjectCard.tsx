import { ArrowUpRight, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Project } from '../types';
import { ProjectPreviewModal } from './ProjectPreviewModal';

export function ProjectCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);
  return <>
    <motion.article className="project-card" tabIndex={0} aria-label={`${project.name} project card`} aria-haspopup="dialog" whileHover={{ y: -4 }} transition={{ duration: .2 }} onClick={event => { if (!(event.target as Element).closest('a, button')) setExpanded(true); }} onKeyDown={event => { if (event.target === event.currentTarget && ['Enter', ' '].includes(event.key)) { event.preventDefault(); setExpanded(true); } }}>
      <div className="project-number"><span>{project.id}</span><button className="icon-button" aria-label={`View ${project.name} details`} onClick={() => setExpanded(true)}><Plus size={21} /></button></div>
      <p className="project-category"><span>//</span> {project.category}</p><h3>{project.name}</h3><p className="project-description">{project.description}</p>
      <button className="project-preview" onClick={() => setExpanded(true)} aria-label={`Preview ${project.name}`}><img src={project.image} alt={`${project.name} website preview`} width="620" height="284" loading="lazy" /><span className="project-preview-hint">QUICK PREVIEW <ArrowUpRight size={14} /></span></button>
      <div className="project-bottom"><ul className="badges" aria-label="Technologies">{project.technologies.map(tech => <li key={tech}>{tech}</li>)}</ul><button className="project-arrow" onClick={() => setExpanded(true)} aria-label={`Explore ${project.name}`}><ArrowUpRight size={26} /></button></div>
    </motion.article>
    {expanded && <ProjectPreviewModal project={project} onClose={() => setExpanded(false)} />}
  </>;
}

