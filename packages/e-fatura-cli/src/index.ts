#!/usr/bin/env node
import dayjs from 'dayjs';
import { commands } from './commands';
import { createCommand } from 'commander';
import { EInvoiceApiClient } from './utils';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

import {
  version as pkgVersion,
  description as pkgDescription
} from '../package.json';

dayjs.extend(customParseFormat);

const program = createCommand('e-fatura');

process.on('SIGINT', () => {
  EInvoiceApiClient.logout().finally(() => {
    process.exit(0);
  });
});

process.on('SIGHUP', () => {
  EInvoiceApiClient.logout().finally(() => {
    process.exit(0);
  });
});

process.on('beforeExit', async () => {
  await EInvoiceApiClient.logout();
});

for (const command of commands) {
  program.addCommand(command);
}

program.version(pkgVersion).description(pkgDescription).parse(process.argv);
