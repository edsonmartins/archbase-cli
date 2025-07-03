/**
 * Create Command - Project scaffolding and boilerplates
 * 
 * Examples:
 * archbase create project MyApp --boilerplate=admin-dashboard
 * archbase create module Products --with=forms,lists,details
 * archbase create list-boilerplates
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as path from 'path';
import { BoilerplateGenerator } from '../generators/BoilerplateGenerator';

export const createCommand = new Command('create')
  .description('Create projects and modules from boilerplates')
  .addCommand(
    new Command('project')
      .description('Create a new project from boilerplate')
      .argument('<name>', 'Project name')
      .option('--boilerplate <template>', 'Boilerplate name (admin-dashboard|marketplace|saas-starter)')
      .option('--git <url>', 'Git repository URL for remote boilerplate')
      .option('--npm <package>', 'npm package name for remote boilerplate')
      .option('--branch <branch>', 'Git branch to use (default: main)')
      .option('--subfolder <path>', 'Subfolder in repository to use as template')
      .option('--interactive', 'Interactive setup with prompts')
      .option('--config <file>', 'Configuration file path')
      .option('--dry-run', 'Show what would be created without executing')
      .action(async (name: string, options) => {
        console.log(chalk.blue(`🚀 Creating project: ${name}`));
        
        // Validate boilerplate source
        const hasLocal = !!options.boilerplate;
        const hasGit = !!options.git;
        const hasNpm = !!options.npm;
        
        if (!hasLocal && !hasGit && !hasNpm) {
          console.error(chalk.red('❌ Boilerplate source is required:'));
          console.error(chalk.gray('   --boilerplate <name>  (local boilerplate)'));
          console.error(chalk.gray('   --git <url>           (Git repository)'));
          console.error(chalk.gray('   --npm <package>       (npm package)'));
          console.error(chalk.gray('   Use list-boilerplates to see available local templates'));
          process.exit(1);
        }
        
        if ([hasLocal, hasGit, hasNpm].filter(Boolean).length > 1) {
          console.error(chalk.red('❌ Only one boilerplate source can be specified'));
          process.exit(1);
        }
        
        const spinner = ora('Creating project...').start();
        
        try {
          const generator = new BoilerplateGenerator();
          const outputDir = process.cwd();
          
          let result;
          
          if (options.boilerplate) {
            // Local boilerplate
            spinner.text = `Generating project from ${options.boilerplate} boilerplate...`;
            
            // Use default answers if not interactive
            const answers = options.interactive 
              ? undefined 
              : {
                  projectName: name,
                  projectDescription: `Project generated with Archbase CLI`,
                  features: ['authentication', 'user-management', 'dashboard', 'settings'],
                  database: 'postgresql',
                  apiUrl: 'http://localhost:3001/api',
                  useDocker: true,
                  useTests: true
                };
            
            result = await generator.generateFromAnySource(options.boilerplate, name, outputDir, answers);
            
          } else if (options.git) {
            // Git repository
            spinner.text = `Downloading from Git repository: ${options.git}...`;
            
            const remoteOptions = {
              source: 'git' as const,
              url: options.git,
              branch: options.branch || 'main',
              subfolder: options.subfolder,
              cache: true
            };
            
            result = await generator.generateFromRemote(name, remoteOptions, outputDir);
            
          } else if (options.npm) {
            // npm package
            spinner.text = `Downloading from npm: ${options.npm}...`;
            
            const remoteOptions = {
              source: 'npm' as const,
              url: options.npm,
              packageName: options.npm,
              subfolder: options.subfolder,
              cache: true
            };
            
            result = await generator.generateFromRemote(name, remoteOptions, outputDir);
          }
          
          if (result.success) {
            spinner.succeed(chalk.green(`✅ Project '${name}' created successfully!`));
            console.log(chalk.cyan(`📁 Location: ${result.projectPath}`));
            console.log(chalk.yellow('\n📋 Next steps:'));
            console.log(chalk.gray(`  cd ${name}`));
            console.log(chalk.gray('  npm install'));
            console.log(chalk.gray('  npm run dev'));
          } else {
            spinner.fail(chalk.red('❌ Failed to create project'));
            result.errors?.forEach(error => {
              console.error(chalk.red(`  ${error}`));
            });
            process.exit(1);
          }
          
        } catch (error) {
          spinner.fail(chalk.red(`❌ Error creating project: ${error.message}`));
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('module')
      .description('Create a new module with components')
      .argument('<name>', 'Module name')
      .option('--with <components>', 'Comma-separated component list (forms|lists|details|crud)')
      .action(async (name: string, options) => {
        console.log(chalk.blue(`🧩 Creating module: ${name}`));
        
        try {
          // TODO: Implement module creation
          console.log(chalk.yellow('🚧 Module creation coming soon...'));
          console.log(chalk.gray(`  Name: ${name}`));
          console.log(chalk.gray(`  Components: ${options.with || 'default'}`));
          
        } catch (error) {
          console.error(chalk.red(`❌ Error creating module: ${error.message}`));
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('list-boilerplates')
      .description('List available boilerplates')
      .option('--category <cat>', 'Filter by category (admin|ecommerce|saas)')
      .option('--detailed', 'Show detailed information')
      .action(async (options) => {
        const spinner = ora('Loading boilerplates...').start();
        
        try {
          const generator = new BoilerplateGenerator();
          const allBoilerplates = await generator.listAllBoilerplates();
          
          spinner.succeed(chalk.blue('📋 Available Boilerplates:'));
          
          const boilerplateDetails: Array<{
            name: string;
            category: string;
            description: string;
            features: string[];
            version: string;
            source: string;
          }> = [];
          
          // Process builtin boilerplates
          for (const name of allBoilerplates.builtin) {
            const config = await generator.getBoilerplateConfig(name);
            if (config) {
              boilerplateDetails.push({
                name: config.name,
                category: config.category || 'general',
                description: config.description,
                features: Object.keys(config.features || {}),
                version: config.version,
                source: 'builtin'
              });
            }
          }
          
          // Process custom boilerplates
          for (const name of allBoilerplates.custom) {
            const info = await generator.getBoilerplateInfo(name);
            if (info.config) {
              boilerplateDetails.push({
                name: info.config.name,
                category: info.config.category || 'general',
                description: info.config.description,
                features: Object.keys(info.config.features || {}),
                version: info.config.version,
                source: 'custom'
              });
            }
          }
          
          const filtered = options.category 
            ? boilerplateDetails.filter(b => b.category === options.category)
            : boilerplateDetails;
          
          if (filtered.length === 0) {
            console.log(chalk.yellow('No boilerplates found matching the criteria.'));
            return;
          }
          
          // Group by source
          const builtin = filtered.filter(b => b.source === 'builtin');
          const custom = filtered.filter(b => b.source === 'custom');
          
          if (builtin.length > 0) {
            console.log(`\n${chalk.magenta('📦 Built-in Boilerplates:')}`);
            builtin.forEach((boilerplate) => {
              console.log(`\n${chalk.cyan(boilerplate.name)} ${chalk.gray(`v${boilerplate.version} (${boilerplate.category})`)}`);
              console.log(chalk.white(boilerplate.description));
              
              if (options.detailed && boilerplate.features.length > 0) {
                console.log(chalk.yellow(`  Features: ${boilerplate.features.join(', ')}`));
              }
            });
          }
          
          if (custom.length > 0) {
            console.log(`\n${chalk.magenta('🔧 Custom Boilerplates:')}`);
            custom.forEach((boilerplate) => {
              console.log(`\n${chalk.cyan(boilerplate.name)} ${chalk.gray(`v${boilerplate.version} (${boilerplate.category})`)}`);
              console.log(chalk.white(boilerplate.description));
              
              if (options.detailed && boilerplate.features.length > 0) {
                console.log(chalk.yellow(`  Features: ${boilerplate.features.join(', ')}`));
              }
            });
          }
          
          console.log(chalk.green(`\n📖 Usage: archbase create project MyApp --boilerplate=<name>`));
          console.log(chalk.gray(`📝 Create custom: archbase boilerplate create <name> <project-path>`));
          
        } catch (error) {
          spinner.fail(chalk.red(`❌ Error loading boilerplates: ${error.message}`));
        }
      })
  );