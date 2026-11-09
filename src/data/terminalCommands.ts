import { profile, projects } from './portfolio';
import type { CommandResult, TerminalCommand } from '../types/developerLab';

export function externalUrl(value?: string): string | undefined {
  if (!value) return undefined;
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined; } catch { return undefined; }
}

export function contactHref(): string {
  return externalUrl(profile.contactUrl) ?? (profile.email ? `mailto:${profile.email}` : '#contact');
}

export const terminalCommands: Readonly<Record<string, TerminalCommand>> = {
  help: { description: 'Show available commands', execute: () => ({ lines: Object.entries(terminalCommands).filter(([, command]) => !command.hidden).map(([name, command]) => `${name.padEnd(10)} ${command.description}`) }) },
  whoami: { description: 'Meet the developer', execute: () => ({ lines: [profile.name, profile.role, profile.location] }) },
  skills: { description: 'List my technologies', execute: () => ({ lines: ['React, TypeScript, JavaScript, Laravel, PHP, MySQL, Docker, Git.'] }) },
  projects: { description: 'Explore selected projects', execute: () => ({ lines: projects.map(project => `${project.id} — ${project.name}`) }) },
  contact: { description: 'Find contact information', execute: () => { const details = [profile.email, externalUrl(profile.contactUrl)].filter((value): value is string => Boolean(value)); return { lines: details.length ? details : ['Contact details are not configured yet.', 'Visit the contact section at the bottom of this page.'] }; } },
  clear: { description: 'Clear terminal output', execute: () => ({ lines: [], action: 'clear' }) },
  date: { description: 'Show local date and time', execute: () => ({ lines: [new Date().toLocaleString()] }) },
  game: { description: 'Jump to Catch the Bugs', execute: () => ({ lines: ['Opening Catch the Bugs…'], action: 'game' }) },
  github: { description: 'Open my GitHub profile', execute: () => { const url = externalUrl(profile.githubUrl); return url ? { lines: ['Opening GitHub…'], action: 'github', url } : { lines: ['GitHub URL is not configured yet. Check back soon.'] }; } },
  'sudo hire amine': { description: '', hidden: true, execute: () => ({ lines: ['ACCESS GRANTED ✓', "Congratulations! You've discovered a secret command.", "Let's build something great together!"], action: 'hire' }) },
  matrix: { description: '', hidden: true, execute: () => ({ lines: ['Matrix sequence initialized…'], action: 'matrix' }) },
};

export function runTerminalCommand(input: string): CommandResult {
  const name = input.trim().replace(/\s+/g, ' ').toLowerCase();
  const command = Object.hasOwn(terminalCommands, name) ? terminalCommands[name] : undefined;
  return command ? command.execute() : { lines: ["Command not found. Type 'help' for available commands."] };
}
