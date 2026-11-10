import { motion, useReducedMotion } from 'framer-motion';
import { FlaskConical, GraduationCap, ScrollText } from 'lucide-react';
import type { EducationEntry } from '../types';
import './education.css';

interface EducationProps {
  entries: readonly EducationEntry[];
}

const educationIcons = {
  science: FlaskConical,
  diploma: ScrollText,
  degree: GraduationCap,
};

export function Education({ entries }: EducationProps) {
  const reducedMotion = useReducedMotion();

  return (
    <section id="education" className="education" aria-labelledby="education-heading">
      <div className="section-header">
        <div>
          <h2 id="education-heading"><span>//</span> EDUCATION_JOURNEY</h2>
          <p className="section-subtitle">My academic background and continuous learning journey.</p>
        </div>
      </div>
      <ol className="education-timeline" role="list">
        {entries.map((entry, index) => {
          const current = entry.status === 'Currently Studying';
          const Icon = educationIcons[entry.icon];

          return (
            <motion.li
              className="education-step"
              key={entry.id}
              initial={reducedMotion ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
            >
              {index < entries.length - 1 && (
                <motion.span
                  className="education-connector"
                  aria-hidden="true"
                  variants={{
                    hidden: { '--education-line-progress': 0 },
                    visible: { '--education-line-progress': 1 },
                  }}
                  transition={{ duration: reducedMotion ? 0 : 0.45, delay: reducedMotion ? 0 : index * 0.08, ease: 'easeOut' }}
                />
              )}
              <span className="education-marker" aria-hidden="true" />
              <motion.article
                className="education-card"
                variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: reducedMotion ? 0 : 0.28, delay: reducedMotion ? 0 : index * 0.08, ease: 'easeOut' }}
              >
                <div className="education-card-meta">
                  <div className="education-card-details">
                    <span className="education-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    {entry.year && <time dateTime={String(entry.year)}>{entry.year}</time>}
                    {entry.institution && <span>{entry.institution}</span>}
                  </div>
                  <span className={current ? 'education-status education-status-current' : 'education-status'}>
                    {current && <span className="status-dot" aria-hidden="true" />}
                    {current ? 'IN PROGRESS' : entry.status}
                  </span>
                </div>
                <h3><Icon size={15} aria-hidden="true" /><span>{entry.degree}</span></h3>
                {entry.specialization && <p>{entry.specialization}</p>}
              </motion.article>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
