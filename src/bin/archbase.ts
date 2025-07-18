#!/usr/bin/env node

/**
 * Archbase CLI - Main Entry Point
 * 
 * AI-friendly CLI for Archbase ecosystem component querying and code generation.
 * Designed to solve the problem of AI assistants not knowing custom libraries.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { queryCommand } from '../commands/query';
import { generateCommand } from '../commands/generate';
import { createCommand } from '../commands/create';
import knowledgeCommand from '../commands/knowledge';
import { validateCommand } from '../commands/validate';
import { cacheCommand } from '../commands/cache';
import { boilerplateCommand } from '../commands/boilerplate';
import { scanCommand } from '../commands/scan';
import { migrateCommand } from '../commands/migrate';
import { pluginCommand } from '../commands/plugin';

// Read version from package.json
const packageJsonPath = path.join(__dirname, '../../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const program = new Command();

program
  .name('archbase')
  .description('AI-friendly CLI for Archbase ecosystem')
  .version(packageJson.version);

// ASCII Art Banner (only if not JSON output)
const isJsonMode = process.argv.includes('--format=json') || 
                   process.argv.includes('--format') && process.argv[process.argv.indexOf('--format') + 1] === 'json';

if (!isJsonMode) {
  const versionText = `ARCHBASE CLI v${packageJson.version}`;
  const padding = Math.max(0, 39 - versionText.length);
  const leftPad = Math.floor(padding / 2);
  const rightPad = padding - leftPad;
  
  console.log(chalk.cyan(`
╔═══════════════════════════════════════╗
║${' '.repeat(leftPad)}${versionText}${' '.repeat(rightPad)}║
║     AI-Friendly Development Tool      ║
╚═══════════════════════════════════════╝
`));
}

// Register commands
program.addCommand(queryCommand);
program.addCommand(generateCommand);
program.addCommand(createCommand);
program.addCommand(knowledgeCommand);
program.addCommand(validateCommand);
program.addCommand(cacheCommand);
program.addCommand(boilerplateCommand);
program.addCommand(scanCommand);
program.addCommand(migrateCommand);
program.addCommand(pluginCommand);

// Global options
program
  .option('--ai-mode', 'Output optimized for AI consumption')
  .option('--verbose', 'Verbose logging')
  .option('--dry-run', 'Show what would be done without executing');

// Handle unknown commands
program.on('command:*', () => {
  console.error(chalk.red(`Invalid command: ${program.args.join(' ')}`));
  console.log(chalk.yellow('See --help for a list of available commands.'));
  process.exit(1);
});

// Parse arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}