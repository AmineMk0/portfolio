export type TerminalAction = 'clear' | 'game' | 'github' | 'hire' | 'matrix';

export interface CommandResult {
  lines: string[];
  action?: TerminalAction;
  url?: string;
}

export interface TerminalCommand {
  description: string;
  hidden?: boolean;
  execute: () => CommandResult;
}

export interface TerminalEntry {
  id: number;
  command?: string;
  lines: string[];
  secret?: boolean;
}
