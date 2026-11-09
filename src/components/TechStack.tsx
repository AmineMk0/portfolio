import { SiReact, SiLaravel, SiPhp, SiMysql, SiJavascript, SiTypescript, SiDocker } from 'react-icons/si';

const technologies = [{ name: 'React', Icon: SiReact, color: '#14cee3' }, { name: 'Laravel', Icon: SiLaravel, color: '#ff2d20' }, { name: 'PHP', Icon: SiPhp, color: '#8d80cc' }, { name: 'MySQL', Icon: SiMysql, color: '#00758f' }, { name: 'JavaScript', Icon: SiJavascript, color: '#efd900' }, { name: 'TypeScript', Icon: SiTypescript, color: '#087fe7' }, { name: 'Docker', Icon: SiDocker, color: '#1688e9' }];
export function TechStack() {
  return <section className="tech-stack" id="stack" aria-labelledby="stack-heading"><h2 id="stack-heading"><span>//</span> TECH_STACK</h2><ul>{technologies.map(({ name, Icon, color }) => <li key={name} title={name} tabIndex={0}><Icon size={47} color={color} aria-label={name} /><span>{name}</span></li>)}</ul></section>;
}

