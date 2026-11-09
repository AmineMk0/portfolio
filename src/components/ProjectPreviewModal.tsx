import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Github, X } from 'lucide-react';
import type { Project } from '../types';
import { externalUrl } from '../data/terminalCommands';
import './project-preview.css';

export function ProjectPreviewModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [closing, setClosing] = useState(false);
  const reducedMotion = useReducedMotion();
  const titleId = useId();
  const descriptionId = useId();
  const github = externalUrl(project.githubUrl);
  const demo = externalUrl(project.liveDemoUrl ?? project.url);

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    element?.showModal(); closeButton.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      element?.close(); document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  function requestClose() {
    if (reducedMotion) onClose(); else setClosing(true);
  }

  function keepFocusInside(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return;
    const controls = dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex="0"]');
    if (!controls?.length) return;
    const first = controls[0]; const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  return <motion.dialog ref={dialog} className="project-dialog project-preview-modal" aria-labelledby={titleId} aria-describedby={descriptionId} aria-modal="true" initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }} animate={{ opacity: closing ? 0 : 1, y: closing && !reducedMotion ? 8 : 0 }} transition={{ duration: reducedMotion ? 0 : .18 }} onKeyDown={keepFocusInside} onAnimationComplete={() => { if (closing) onClose(); }} onCancel={event => { event.preventDefault(); requestClose(); }} onClick={event => { if (event.target === dialog.current) requestClose(); }}>
    <div className="dialog-content"><div className="preview-modal-header"><p className="project-category"><span>//</span> {project.category}</p><button ref={closeButton} className="icon-button" onClick={requestClose} aria-label="Close project details"><X size={21} /></button></div>
      <h2 id={titleId}>{project.name}</h2><img className="modal-project-image" src={project.image} alt={`${project.name} website screenshot`} />
      <p id={descriptionId}>{project.description}</p><ul className="badges" aria-label="Project technologies">{project.technologies.map(tech => <li key={tech}>{tech}</li>)}</ul>
      {Boolean(project.features?.length) && <div className="project-features"><h3><span>//</span> KEY FEATURES</h3><ul>{project.features!.map(feature => <li key={feature}>{feature}</li>)}</ul></div>}
      {(github || demo) ? <div className="preview-modal-links">{github && <a className="button button-outline" href={github} target="_blank" rel="noopener noreferrer"><Github size={16} /> GITHUB</a>}{demo && <a className="button button-outline" href={demo} target="_blank" rel="noopener noreferrer">LIVE DEMO <ArrowUpRight size={16} /></a>}</div> : <p className="project-unpublished">Public project links are not configured yet.</p>}
    </div>
  </motion.dialog>;
}
