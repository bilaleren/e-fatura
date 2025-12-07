#!/usr/bin/env node
import dayjs from 'dayjs';
import { commands } from './commands';
import { createCommand } from 'commander';
import { registerShutdownHooks } from './utils';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

import {
  version as pkgVersion,
  description as pkgDescription
} from '../package.json';

registerShutdownHooks();

dayjs.extend(customParseFormat);

const program = createCommand('e-fatura');

for (const command of commands) {
  program.addCommand(command);
}

program.version(pkgVersion).description(pkgDescription).parse(process.argv);
