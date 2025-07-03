#!/usr/bin/env node
"use strict";
/**
 * Archbase CLI - Main Entry Point
 *
 * AI-friendly CLI for Archbase ecosystem component querying and code generation.
 * Designed to solve the problem of AI assistants not knowing custom libraries.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const query_1 = require("../commands/query");
const generate_1 = require("../commands/generate");
const create_1 = require("../commands/create");
const knowledge_1 = __importDefault(require("../commands/knowledge"));
const validate_1 = require("../commands/validate");
const cache_1 = require("../commands/cache");
const boilerplate_1 = require("../commands/boilerplate");
const scan_1 = require("../commands/scan");
const migrate_1 = require("../commands/migrate");
const plugin_1 = require("../commands/plugin");
const program = new commander_1.Command();
program
    .name('archbase')
    .description('AI-friendly CLI for Archbase ecosystem')
    .version('0.1.0');
// ASCII Art Banner (only if not JSON output)
const isJsonMode = process.argv.includes('--format=json') ||
    process.argv.includes('--format') && process.argv[process.argv.indexOf('--format') + 1] === 'json';
if (!isJsonMode) {
    console.log(chalk_1.default.cyan(`
╔═══════════════════════════════════════╗
║           ARCHBASE CLI v0.1.0         ║
║     AI-Friendly Development Tool      ║
╚═══════════════════════════════════════╝
`));
}
// Register commands
program.addCommand(query_1.queryCommand);
program.addCommand(generate_1.generateCommand);
program.addCommand(create_1.createCommand);
program.addCommand(knowledge_1.default);
program.addCommand(validate_1.validateCommand);
program.addCommand(cache_1.cacheCommand);
program.addCommand(boilerplate_1.boilerplateCommand);
program.addCommand(scan_1.scanCommand);
program.addCommand(migrate_1.migrateCommand);
program.addCommand(plugin_1.pluginCommand);
// Global options
program
    .option('--ai-mode', 'Output optimized for AI consumption')
    .option('--verbose', 'Verbose logging')
    .option('--dry-run', 'Show what would be done without executing');
// Handle unknown commands
program.on('command:*', () => {
    console.error(chalk_1.default.red(`Invalid command: ${program.args.join(' ')}`));
    console.log(chalk_1.default.yellow('See --help for a list of available commands.'));
    process.exit(1);
});
// Parse arguments
program.parse();
// Show help if no command provided
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
//# sourceMappingURL=archbase.js.map