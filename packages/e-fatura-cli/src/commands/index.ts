import listInvoicesCommand from './listInvoicesCommand';
import signInvoicesCommand from './signInvoicesCommand';
import exportInvoicesCommand from './exportInvoicesCommand';
import downloadInvoicesCommand from './downloadInvoicesCommand';
import xsltRendererCommand from './xsltRendererCommand';
import type { Command } from 'commander';

export const commands: readonly Command[] = [
  listInvoicesCommand,
  signInvoicesCommand,
  exportInvoicesCommand,
  downloadInvoicesCommand,
  xsltRendererCommand
];

export {
  listInvoicesCommand,
  signInvoicesCommand,
  exportInvoicesCommand,
  downloadInvoicesCommand,
  xsltRendererCommand
};
