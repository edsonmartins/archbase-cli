/**
 * Cache Command - Manage remote boilerplate cache
 * 
 * Examples:
 * archbase cache list
 * archbase cache clear
 * archbase cache info
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { RemoteBoilerplateManager } from '../generators/RemoteBoilerplateManager';

export const cacheCommand = new Command('cache')
  .description('Manage remote boilerplate cache')
  .addCommand(
    new Command('list')
      .description('List cached boilerplates')
      .option('--detailed', 'Show detailed information')
      .action(async (options) => {
        const spinner = ora('Loading cached boilerplates...').start();
        
        try {
          const manager = new RemoteBoilerplateManager();
          const cached = await manager.listCached();
          
          spinner.succeed(chalk.blue('📦 Cached Boilerplates:'));
          
          if (cached.length === 0) {
            console.log(chalk.yellow('No cached boilerplates found.'));
            return;
          }
          
          cached.forEach((metadata, index) => {
            const sourceType = metadata.source.type === 'git' ? '🔗' : '📦';
            console.log(`\n${sourceType} ${chalk.cyan(metadata.name)} ${chalk.gray(`v${metadata.version}`)}`);
            console.log(chalk.white(`   ${metadata.description}`));
            console.log(chalk.gray(`   Source: ${metadata.source.url}`));
            console.log(chalk.gray(`   Cached: ${new Date(metadata.lastUpdated).toLocaleDateString()}`));
            
            if (options.detailed) {
              if (metadata.author) {
                console.log(chalk.gray(`   Author: ${metadata.author}`));
              }
              if (metadata.license) {
                console.log(chalk.gray(`   License: ${metadata.license}`));
              }
              if (metadata.archbaseVersion) {
                console.log(chalk.gray(`   Archbase: ${metadata.archbaseVersion}`));
              }
              if (metadata.source.branch) {
                console.log(chalk.gray(`   Branch: ${metadata.source.branch}`));
              }
              if (metadata.source.subfolder) {
                console.log(chalk.gray(`   Subfolder: ${metadata.source.subfolder}`));
              }
            }
          });
          
          console.log(chalk.green(`\n📊 Total: ${cached.length} cached boilerplate(s)`));
          
        } catch (error) {
          spinner.fail(chalk.red(`❌ Error listing cache: ${error.message}`));
        }
      })
  )
  .addCommand(
    new Command('clear')
      .description('Clear all cached boilerplates')
      .option('--force', 'Force clear without confirmation')
      .action(async (options) => {
        const manager = new RemoteBoilerplateManager();
        
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
            console.log(chalk.yellow('Cache clear cancelled.'));
            return;
          }
        }
        
        const spinner = ora('Clearing cache...').start();
        
        try {
          await manager.clearCache();
          spinner.succeed(chalk.green('✅ Cache cleared successfully'));
        } catch (error) {
          spinner.fail(chalk.red(`❌ Error clearing cache: ${error.message}`));
        }
      })
  )
  .addCommand(
    new Command('info')
      .description('Show cache information')
      .action(async () => {
        const spinner = ora('Loading cache information...').start();
        
        try {
          const manager = new RemoteBoilerplateManager();
          const cached = await manager.listCached();
          const cacheSize = await manager.getCacheSize();
          const formattedSize = manager.formatCacheSize(cacheSize);
          
          spinner.succeed(chalk.blue('ℹ️  Cache Information:'));
          
          console.log(`\n${chalk.cyan('Cache Directory:')} ~/.archbase/boilerplates-cache`);
          console.log(`${chalk.cyan('Total Boilerplates:')} ${cached.length}`);
          console.log(`${chalk.cyan('Cache Size:')} ${formattedSize}`);
          
          if (cached.length > 0) {
            const gitCount = cached.filter(c => c.source.type === 'git').length;
            const npmCount = cached.filter(c => c.source.type === 'npm').length;
            
            console.log(`${chalk.cyan('Git Repositories:')} ${gitCount}`);
            console.log(`${chalk.cyan('npm Packages:')} ${npmCount}`);
            
            const mostRecent = cached[0]; // Already sorted by date
            console.log(`${chalk.cyan('Most Recent:')} ${mostRecent.name} (${new Date(mostRecent.lastUpdated).toLocaleDateString()})`);
          }
          
        } catch (error) {
          spinner.fail(chalk.red(`❌ Error getting cache info: ${error.message}`));
        }
      })
  )
  .addCommand(
    new Command('remove')
      .description('Remove specific cached boilerplate')
      .argument('<name>', 'Boilerplate name or cache key')
      .action(async (name: string) => {
        const spinner = ora(`Removing ${name} from cache...`).start();
        
        try {
          const manager = new RemoteBoilerplateManager();
          const cached = await manager.listCached();
          
          // Find boilerplate by name
          const found = cached.find(c => c.name === name || c.name.includes(name));
          
          if (!found) {
            spinner.fail(chalk.red(`❌ Boilerplate '${name}' not found in cache`));
            return;
          }
          
          // Generate cache key and remove
          const cacheKey = (manager as any).createCacheKey(
            found.source.type,
            found.source.url,
            found.version,
            found.source.subfolder
          );
          
          await manager.removeCached(cacheKey);
          spinner.succeed(chalk.green(`✅ Removed '${found.name}' from cache`));
          
        } catch (error) {
          spinner.fail(chalk.red(`❌ Error removing from cache: ${error.message}`));
        }
      })
  );