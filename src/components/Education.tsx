import { motion, useReducedMotion } from 'framer-motion';
import { Code2, GraduationCap, Laptop } from 'lucide-react';
import type { EducationEntry } from '../types';
import './education.css';

interface EducationProps {
  entries: readonly EducationEntry[];
}

const educationIcons = {
  science: GraduationCap,
  diploma: Code2,
  degree: Laptop,
};

export function Education({ entries }: EducationProps) {
  const reducedMotion = useReducedMotion();

  return (
    <section id="education" className="education" aria-labelledby="education-heading">
      <div className="section-header">
        <div>
          <h2 id="education-heading"><span>//</span> EDUCATION</h2>
          <p className="section-subtitle">My academic background and continuous learning journey.</p>
        </div>
      </div>
      <ol className="education-grid" role="list">
        {entries.map((entry, index) => {
          const current = entry.status === 'Currently Studying';
          const status = current ? 'IN PROGRESS' : 'COMPLETED';
          const Icon = educationIcons[entry.icon];

          return (
            <motion.li
              className="education-step"
              key={entry.id}
              initial={reducedMotion ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
            >
              <motion.article
                className="education-card"
                variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: reducedMotion ? 0 : 0.25, delay: reducedMotion ? 0 : index * 0.08, ease: 'easeOut' }}
              >
                <div className="education-card-meta">
                  <span className="education-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  {entry.year ? <time dateTime={String(entry.year)}>{entry.year}</time> : <span>{status}</span>}
                </div>
                <span className="education-icon"><Icon size={20} aria-hidden="true" /></span>
                <h3>{entry.degree}</h3>
                {entry.field && <p className="education-field">{entry.field}</p>}
                {entry.specialization && <p className="education-specialization">{entry.specialization}</p>}
                {entry.institution && <p className="education-institution">{entry.institution}</p>}
                <div className="education-card-bottom">
                  <span className={current ? 'education-status education-status-current' : 'education-status'}>
                    {current && <span className="status-dot" aria-hidden="true" />}
                    {status}
                  </span>
                  {current && <p className="education-subtitle">Currently Studying</p>}
                </div>
              </motion.article>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
