import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const logs = [['10:30:15', 'Portfolio initialized'], ['10:30:16', 'Loading projects'], ['10:30:17', 'Game module ready'], ['10:30:18', 'Ready.']];
export function SystemLog() {
  return <section className="system-log" aria-labelledby="log-heading"><h2 id="log-heading"><span>//</span> SYSTEM_LOG</h2><div>{logs.map(([time, message], index) => <motion.p key={time} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: index * .3, duration: .3 }}><span>[{time}]</span> {message}{index === 2 && <Check size={22} aria-label="ready" />}</motion.p>)}</div></section>;
}

