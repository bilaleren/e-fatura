import * as readline from 'node:readline';
import exitProgram from './exitProgram';

function registerShutdownHooks(): void {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('SIGINT', () => exitProgram());

  process.on('SIGINT', () => exitProgram());
  process.on('SIGHUP', () => exitProgram());
  process.on('SIGTERM', () => exitProgram());
  process.on('uncaughtException', () => exitProgram(1));
  process.on('unhandledRejection', () => exitProgram(1));
  process.on('exit', () => rl.close());
}

export default registerShutdownHooks;
