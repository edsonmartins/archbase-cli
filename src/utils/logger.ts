import chalk from 'chalk';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  debug(message: string): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.log(chalk.gray(`[DEBUG] ${message}`));
    }
  }

  info(message: string): void {
    if (this.logLevel <= LogLevel.INFO) {
      console.log(chalk.blue(message));
    }
  }

  warn(message: string): void {
    if (this.logLevel <= LogLevel.WARN) {
      console.log(chalk.yellow(`⚠️  ${message}`));
    }
  }

  error(message: string): void {
    if (this.logLevel <= LogLevel.ERROR) {
      console.error(chalk.red(`❌ ${message}`));
    }
  }

  success(message: string): void {
    console.log(chalk.green(message));
  }

  file(filePath: string): void {
    console.log(chalk.gray(`  📄 ${filePath}`));
  }
}