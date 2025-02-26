import chalk from 'chalk';
import figures from '@inquirer/figures';

abstract class Print {
  static info(...args: any[]): void {
    if (process.stdout.isTTY) {
      console.info(chalk.blue(figures.info), ...args);
    }
  }

  static warn(...args: any[]): void {
    if (process.stdout.isTTY) {
      console.warn(chalk.yellow(figures.warning), ...args);
    }
  }

  static error(...args: any[]): void {
    if (process.stdout.isTTY) {
      console.error(chalk.red(figures.cross), ...args);
    }
  }

  static success(...args: any[]): void {
    if (process.stdout.isTTY) {
      console.log(chalk.green(figures.tick), ...args);
    }
  }
}

export default Print;
