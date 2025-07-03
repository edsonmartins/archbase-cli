"use strict";
/**
 * Cache Command - Manage remote boilerplate cache
 *
 * Examples:
 * archbase cache list
 * archbase cache clear
 * archbase cache info
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const RemoteBoilerplateManager_1 = require("../generators/RemoteBoilerplateManager");
exports.cacheCommand = new commander_1.Command('cache')
    .description('Manage remote boilerplate cache')
    .addCommand(new commander_1.Command('list')
    .description('List cached boilerplates')
    .option('--detailed', 'Show detailed information')
    .action(async (options) => {
    const spinner = (0, ora_1.default)('Loading cached boilerplates...').start();
    try {
        const manager = new RemoteBoilerplateManager_1.RemoteBoilerplateManager();
        const cached = await manager.listCached();
        spinner.succeed(chalk_1.default.blue('📦 Cached Boilerplates:'));
        if (cached.length === 0) {
            console.log(chalk_1.default.yellow('No cached boilerplates found.'));
            return;
        }
        cached.forEach((metadata, index) => {
            const sourceType = metadata.source.type === 'git' ? '🔗' : '📦';
            console.log(`\n${sourceType} ${chalk_1.default.cyan(metadata.name)} ${chalk_1.default.gray(`v${metadata.version}`)}`);
            console.log(chalk_1.default.white(`   ${metadata.description}`));
            console.log(chalk_1.default.gray(`   Source: ${metadata.source.url}`));
            console.log(chalk_1.default.gray(`   Cached: ${new Date(metadata.lastUpdated).toLocaleDateString()}`));
            if (options.detailed) {
                if (metadata.author) {
                    console.log(chalk_1.default.gray(`   Author: ${metadata.author}`));
                }
                if (metadata.license) {
                    console.log(chalk_1.default.gray(`   License: ${metadata.license}`));
                }
                if (metadata.archbaseVersion) {
                    console.log(chalk_1.default.gray(`   Archbase: ${metadata.archbaseVersion}`));
                }
                if (metadata.source.branch) {
                    console.log(chalk_1.default.gray(`   Branch: ${metadata.source.branch}`));
                }
                if (metadata.source.subfolder) {
                    console.log(chalk_1.default.gray(`   Subfolder: ${metadata.source.subfolder}`));
                }
            }
        });
        console.log(chalk_1.default.green(`\n📊 Total: ${cached.length} cached boilerplate(s)`));
    }
    catch (error) {
        spinner.fail(chalk_1.default.red(`❌ Error listing cache: ${error.message}`));
    }
}))
    .addCommand(new commander_1.Command('clear')
    .description('Clear all cached boilerplates')
    .option('--force', 'Force clear without confirmation')
    .action(async (options) => {
    const manager = new RemoteBoilerplateManager_1.RemoteBoilerplateManager();
    if (!options.force) {
        const inquirer = require('inquirer');
        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Are you sure you want to clear all cached boilerplates?',
                default: false
            }
        ]);
        if (!confirm) {
            console.log(chalk_1.default.yellow('Cache clear cancelled.'));
            return;
        }
    }
    const spinner = (0, ora_1.default)('Clearing cache...').start();
    try {
        await manager.clearCache();
        spinner.succeed(chalk_1.default.green('✅ Cache cleared successfully'));
    }
    catch (error) {
        spinner.fail(chalk_1.default.red(`❌ Error clearing cache: ${error.message}`));
    }
}))
    .addCommand(new commander_1.Command('info')
    .description('Show cache information')
    .action(async () => {
    const spinner = (0, ora_1.default)('Loading cache information...').start();
    try {
        const manager = new RemoteBoilerplateManager_1.RemoteBoilerplateManager();
        const cached = await manager.listCached();
        const cacheSize = await manager.getCacheSize();
        const formattedSize = manager.formatCacheSize(cacheSize);
        spinner.succeed(chalk_1.default.blue('ℹ️  Cache Information:'));
        console.log(`\n${chalk_1.default.cyan('Cache Directory:')} ~/.archbase/boilerplates-cache`);
        console.log(`${chalk_1.default.cyan('Total Boilerplates:')} ${cached.length}`);
        console.log(`${chalk_1.default.cyan('Cache Size:')} ${formattedSize}`);
        if (cached.length > 0) {
            const gitCount = cached.filter(c => c.source.type === 'git').length;
            const npmCount = cached.filter(c => c.source.type === 'npm').length;
            console.log(`${chalk_1.default.cyan('Git Repositories:')} ${gitCount}`);
            console.log(`${chalk_1.default.cyan('npm Packages:')} ${npmCount}`);
            const mostRecent = cached[0]; // Already sorted by date
            console.log(`${chalk_1.default.cyan('Most Recent:')} ${mostRecent.name} (${new Date(mostRecent.lastUpdated).toLocaleDateString()})`);
        }
    }
    catch (error) {
        spinner.fail(chalk_1.default.red(`❌ Error getting cache info: ${error.message}`));
    }
}))
    .addCommand(new commander_1.Command('remove')
    .description('Remove specific cached boilerplate')
    .argument('<name>', 'Boilerplate name or cache key')
    .action(async (name) => {
    const spinner = (0, ora_1.default)(`Removing ${name} from cache...`).start();
    try {
        const manager = new RemoteBoilerplateManager_1.RemoteBoilerplateManager();
        const cached = await manager.listCached();
        // Find boilerplate by name
        const found = cached.find(c => c.name === name || c.name.includes(name));
        if (!found) {
            spinner.fail(chalk_1.default.red(`❌ Boilerplate '${name}' not found in cache`));
            return;
        }
        // Generate cache key and remove
        const cacheKey = manager.createCacheKey(found.source.type, found.source.url, found.version, found.source.subfolder);
        await manager.removeCached(cacheKey);
        spinner.succeed(chalk_1.default.green(`✅ Removed '${found.name}' from cache`));
    }
    catch (error) {
        spinner.fail(chalk_1.default.red(`❌ Error removing from cache: ${error.message}`));
    }
}));
//# sourceMappingURL=cache.js.map