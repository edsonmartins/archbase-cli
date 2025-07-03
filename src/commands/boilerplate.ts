/**
 * Boilerplate Command - Manage custom boilerplates
 * 
 * Examples:
 * archbase boilerplate create my-template ./my-project
 * archbase boilerplate list
 * archbase boilerplate export my-template
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as path from 'path';
import * as fs from 'fs-extra';
import inquirer from 'inquirer';
import { BoilerplateGenerator } from '../generators/BoilerplateGenerator';

export const boilerplateCommand = new Command('boilerplate')
  .description('Manage custom boilerplates')
  .addCommand(
    new Command('create')
      .description('Create a boilerplate from existing project')
      .argument('<name>', 'Boilerplate name')
      .argument('<project-path>', 'Path to existing project')
      .option('--description <desc>', 'Boilerplate description')
      .option('--category <cat>', 'Boilerplate category (admin|frontend|fullstack|api)')
      .option('--interactive', 'Interactive configuration')
      .option('--template-files <pattern>', 'Files to make into templates (comma-separated)', '*.json,*.md,*.env*')
      .option('--ignore <patterns>', 'Patterns to ignore (comma-separated)', 'node_modules,dist,build,.git,.env')
      .option('--output <dir>', 'Output directory for boilerplate', './src/boilerplates')
      .action(async (name: string, projectPath: string, options) => {
        console.log(chalk.blue(`🏗️  Creating boilerplate '${name}' from ${projectPath}`));
        
        try {
          // Validate project path
          if (!await fs.pathExists(projectPath)) {
            console.error(chalk.red(`❌ Project path does not exist: ${projectPath}`));
            process.exit(1);
          }

          const absoluteProjectPath = path.resolve(projectPath);
          const spinner = ora('Analyzing project structure...').start();

          // Check if it's a valid project
          const packageJsonPath = path.join(absoluteProjectPath, 'package.json');
          if (!await fs.pathExists(packageJsonPath)) {
            spinner.fail(chalk.red('❌ No package.json found. Not a valid Node.js project.'));
            process.exit(1);
          }

          const packageJson = await fs.readJson(packageJsonPath);
          
          spinner.succeed('✅ Project structure analyzed');

          // Interactive configuration if requested
          let config = {
            name,
            description: options.description || `Boilerplate generated from ${name}`,
            category: options.category || 'general',
            version: '1.0.0',
            templateFiles: options.templateFiles.split(',').map((f: string) => f.trim()),
            ignorePatterns: options.ignore.split(',').map((p: string) => p.trim()),
            prompts: [] as any[],
            features: {} as Record<string, any>,
            dependencies: packageJson.dependencies || {},
            devDependencies: packageJson.devDependencies || {},
            scripts: packageJson.scripts || {}
          };

          if (options.interactive) {
            console.log(chalk.yellow('\n🎯 Interactive Configuration'));
            
            const answers = await inquirer.prompt([
              {
                type: 'input',
                name: 'description',
                message: 'Boilerplate description:',
                default: config.description
              },
              {
                type: 'list',
                name: 'category',
                message: 'Boilerplate category:',
                choices: [
                  { name: 'Admin Dashboard', value: 'admin' },
                  { name: 'Frontend Application', value: 'frontend' },
                  { name: 'Full-stack Application', value: 'fullstack' },
                  { name: 'API/Backend', value: 'api' },
                  { name: 'General Purpose', value: 'general' }
                ],
                default: config.category
              },
              {
                type: 'checkbox',
                name: 'detectedFeatures',
                message: 'Select features to make configurable:',
                choices: await detectProjectFeatures(absoluteProjectPath, packageJson)
              },
              {
                type: 'confirm',
                name: 'addCustomPrompts',
                message: 'Add custom prompts for users?',
                default: false
              }
            ]);

            config.description = answers.description;
            config.category = answers.category;
            
            // Convert detected features to configurable features
            answers.detectedFeatures.forEach((feature: string) => {
              config.features[feature] = true;
            });

            // Add custom prompts if requested
            if (answers.addCustomPrompts) {
              config.prompts = await configureCustomPrompts();
            } else {
              config.prompts = generateDefaultPrompts(config.features);
            }
          } else {
            // Auto-detect features for non-interactive mode
            const detectedFeatures = await detectProjectFeatures(absoluteProjectPath, packageJson);
            detectedFeatures.forEach(feature => {
              config.features[feature.value] = true;
            });
            config.prompts = generateDefaultPrompts(config.features);
          }

          // Create the boilerplate
          const generator = new BoilerplateGenerator();
          const outputDir = path.resolve(options.output);
          
          spinner.start('Creating boilerplate structure...');
          
          const result = await createCustomBoilerplate(
            config,
            absoluteProjectPath,
            outputDir,
            generator
          );

          if (result.success) {
            spinner.succeed(chalk.green(`✅ Boilerplate '${name}' created successfully!`));
            console.log(chalk.cyan(`📁 Location: ${result.boilerplatePath}`));
            console.log(chalk.yellow('\n📋 Next steps:'));
            console.log(chalk.gray(`  1. Review generated config.json`));
            console.log(chalk.gray(`  2. Test with: archbase create project Test --boilerplate=${name}`));
            console.log(chalk.gray(`  3. Customize templates in template/ directory`));
          } else {
            spinner.fail(chalk.red('❌ Failed to create boilerplate'));
            result.errors?.forEach(error => {
              console.error(chalk.red(`  ${error}`));
            });
            process.exit(1);
          }

        } catch (error) {
          console.error(chalk.red(`❌ Error creating boilerplate: ${error.message}`));
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('list')
      .description('List custom boilerplates')
      .option('--category <cat>', 'Filter by category')
      .option('--path <dir>', 'Custom boilerplates directory', './src/boilerplates')
      .action(async (options) => {
        const spinner = ora('Loading custom boilerplates...').start();
        
        try {
          const generator = new BoilerplateGenerator(options.path);
          const boilerplates = await generator.listBoilerplates();
          
          spinner.succeed(chalk.blue('📋 Custom Boilerplates:'));

          if (boilerplates.length === 0) {
            console.log(chalk.yellow('No custom boilerplates found.'));
            console.log(chalk.gray('Create one with: archbase boilerplate create <name> <project-path>'));
            return;
          }

          for (const name of boilerplates) {
            const config = await generator.getBoilerplateConfig(name);
            if (config && (!options.category || config.category === options.category)) {
              console.log(`\n📦 ${chalk.cyan(name)} ${chalk.gray(`v${config.version} (${config.category || 'general'})`)}`);
              console.log(chalk.white(`   ${config.description}`));
              
              if (config.features) {
                const features = Object.keys(config.features);
                if (features.length > 0) {
                  console.log(chalk.yellow(`   Features: ${features.join(', ')}`));
                }
              }
            }
          }

          console.log(chalk.green(`\n📖 Usage: archbase create project MyApp --boilerplate=<name>`));

        } catch (error) {
          spinner.fail(chalk.red(`❌ Error listing boilerplates: ${error.message}`));
        }
      })
  )
  .addCommand(
    new Command('export')
      .description('Export boilerplate for sharing')
      .argument('<name>', 'Boilerplate name to export')
      .option('--format <fmt>', 'Export format (zip|tar)', 'zip')
      .option('--output <file>', 'Output file path')
      .option('--include-examples', 'Include usage examples')
      .action(async (name: string, options) => {
        const spinner = ora(`Exporting boilerplate '${name}'...`).start();
        
        try {
          const generator = new BoilerplateGenerator();
          const outputPath = options.output || `./${name}-boilerplate`;
          
          const result = await generator.exportBoilerplate(name, outputPath, options.format);
          
          if (result.success) {
            spinner.succeed(chalk.green(`✅ Boilerplate '${name}' exported successfully!`));
            console.log(chalk.cyan(`📁 Location: ${result.projectPath}`));
            console.log(chalk.yellow('📋 Next steps:'));
            console.log(chalk.gray(`  1. Share the exported directory`));
            console.log(chalk.gray(`  2. Import with: archbase boilerplate import ${result.projectPath}`));
          } else {
            spinner.fail(chalk.red('❌ Failed to export boilerplate'));
            result.errors?.forEach(error => {
              console.error(chalk.red(`  ${error}`));
            });
          }
          
        } catch (error) {
          spinner.fail(chalk.red(`❌ Error exporting boilerplate: ${error.message}`));
        }
      })
  )
  .addCommand(
    new Command('import')
      .description('Import boilerplate from exported archive')
      .argument('<archive-path>', 'Path to exported boilerplate')
      .option('--name <name>', 'Custom name for imported boilerplate')
      .action(async (archivePath: string, options) => {
        const spinner = ora('Importing boilerplate...').start();
        
        try {
          const generator = new BoilerplateGenerator();
          const result = await generator.importBoilerplate(archivePath, options.name);
          
          if (result.success) {
            spinner.succeed(chalk.green('✅ Boilerplate imported successfully!'));
            console.log(chalk.cyan(`📁 Location: ${result.projectPath}`));
            console.log(chalk.yellow('📋 Usage:'));
            console.log(chalk.gray(`  archbase create project MyApp --boilerplate=${path.basename(result.projectPath!)}`));
          } else {
            spinner.fail(chalk.red('❌ Failed to import boilerplate'));
            result.errors?.forEach(error => {
              console.error(chalk.red(`  ${error}`));
            });
          }
          
        } catch (error) {
          spinner.fail(chalk.red(`❌ Error importing boilerplate: ${error.message}`));
        }
      })
  )
  .addCommand(
    new Command('validate')
      .description('Validate custom boilerplate')
      .argument('<name>', 'Boilerplate name to validate')
      .option('--path <dir>', 'Custom boilerplates directory', './src/boilerplates')
      .action(async (name: string, options) => {
        const spinner = ora(`Validating boilerplate '${name}'...`).start();
        
        try {
          const generator = new BoilerplateGenerator(options.path);
          const validation = await generator.validateBoilerplate(name);
          
          if (validation.valid) {
            spinner.succeed(chalk.green(`✅ Boilerplate '${name}' is valid`));
          } else {
            spinner.fail(chalk.red(`❌ Boilerplate '${name}' has issues:`));
            validation.errors.forEach(error => {
              console.error(chalk.red(`  • ${error}`));
            });
          }

        } catch (error) {
          spinner.fail(chalk.red(`❌ Error validating boilerplate: ${error.message}`));
        }
      })
  );

/**
 * Detect project features automatically
 */
async function detectProjectFeatures(projectPath: string, packageJson: any): Promise<Array<{name: string, value: string}>> {
  const features: Array<{name: string, value: string}> = [];
  
  // Check dependencies for common frameworks/libraries
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  if (deps.react) features.push({ name: 'React Application', value: 'react' });
  if (deps.typescript) features.push({ name: 'TypeScript Support', value: 'typescript' });
  if (deps['next'] || deps['@next/core']) features.push({ name: 'Next.js Framework', value: 'nextjs' });
  if (deps.vue) features.push({ name: 'Vue.js Application', value: 'vue' });
  if (deps.angular) features.push({ name: 'Angular Application', value: 'angular' });
  if (deps.express) features.push({ name: 'Express.js Server', value: 'express' });
  if (deps['react-router-dom']) features.push({ name: 'Client-side Routing', value: 'routing' });
  if (deps.redux || deps['@reduxjs/toolkit']) features.push({ name: 'Redux State Management', value: 'redux' });
  if (deps.zustand) features.push({ name: 'Zustand State Management', value: 'zustand' });
  if (deps['react-query'] || deps['@tanstack/react-query']) features.push({ name: 'React Query', value: 'react-query' });
  if (deps.tailwindcss) features.push({ name: 'Tailwind CSS', value: 'tailwind' });
  if (deps['styled-components']) features.push({ name: 'Styled Components', value: 'styled-components' });
  if (deps.jest) features.push({ name: 'Jest Testing', value: 'jest' });
  if (deps.cypress) features.push({ name: 'Cypress E2E Testing', value: 'cypress' });
  if (deps.eslint) features.push({ name: 'ESLint Linting', value: 'eslint' });
  if (deps.prettier) features.push({ name: 'Prettier Formatting', value: 'prettier' });
  if (deps.vite) features.push({ name: 'Vite Build Tool', value: 'vite' });
  if (deps.webpack) features.push({ name: 'Webpack Build', value: 'webpack' });
  
  // Check for configuration files
  if (await fs.pathExists(path.join(projectPath, 'docker-compose.yml'))) {
    features.push({ name: 'Docker Support', value: 'docker' });
  }
  if (await fs.pathExists(path.join(projectPath, '.env.example'))) {
    features.push({ name: 'Environment Configuration', value: 'env-config' });
  }
  if (await fs.pathExists(path.join(projectPath, 'README.md'))) {
    features.push({ name: 'Documentation', value: 'documentation' });
  }
  
  return features;
}

/**
 * Configure custom prompts interactively
 */
async function configureCustomPrompts(): Promise<any[]> {
  const prompts: any[] = [];
  let addMore = true;
  
  while (addMore) {
    const promptConfig = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Prompt variable name:',
        validate: (input) => input.trim() !== '' || 'Name is required'
      },
      {
        type: 'input',
        name: 'message',
        message: 'Prompt message:',
        validate: (input) => input.trim() !== '' || 'Message is required'
      },
      {
        type: 'list',
        name: 'type',
        message: 'Prompt type:',
        choices: [
          { name: 'Text Input', value: 'input' },
          { name: 'Yes/No', value: 'confirm' },
          { name: 'Single Choice', value: 'list' },
          { name: 'Multiple Choice', value: 'checkbox' }
        ]
      }
    ]);

    if (promptConfig.type === 'list' || promptConfig.type === 'checkbox') {
      const choices: any[] = [];
      let addChoice = true;
      
      while (addChoice) {
        const choice = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Choice value:',
            validate: (input) => input.trim() !== '' || 'Value is required'
          },
          {
            type: 'input',
            name: 'message',
            message: 'Choice label:',
            validate: (input) => input.trim() !== '' || 'Label is required'
          }
        ]);
        
        choices.push(choice);
        
        const { continueChoices } = await inquirer.prompt([{
          type: 'confirm',
          name: 'continueChoices',
          message: 'Add another choice?',
          default: false
        }]);
        
        addChoice = continueChoices;
      }
      
      promptConfig.choices = choices;
    }

    prompts.push(promptConfig);
    
    const { continuePrompts } = await inquirer.prompt([{
      type: 'confirm',
      name: 'continuePrompts',
      message: 'Add another prompt?',
      default: false
    }]);
    
    addMore = continuePrompts;
  }
  
  return prompts;
}

/**
 * Generate default prompts based on detected features
 */
function generateDefaultPrompts(features: Record<string, any>): any[] {
  const prompts: any[] = [
    {
      name: 'projectName',
      message: 'Project name:',
      type: 'input',
      validate: 'required|alphanumeric'
    },
    {
      name: 'projectDescription',
      message: 'Project description:',
      type: 'input',
      default: 'Generated with Archbase CLI'
    }
  ];

  // Add feature-specific prompts
  if (features.typescript) {
    prompts.push({
      name: 'useTypeScript',
      message: 'Use TypeScript?',
      type: 'confirm',
      default: true
    });
  }

  if (features.docker) {
    prompts.push({
      name: 'useDocker',
      message: 'Use Docker for development?',
      type: 'confirm',
      default: true
    });
  }

  if (features.jest || features.cypress) {
    prompts.push({
      name: 'useTests',
      message: 'Include test setup?',
      type: 'confirm',
      default: true
    });
  }

  return prompts;
}

/**
 * Create custom boilerplate from project
 */
async function createCustomBoilerplate(
  config: any,
  projectPath: string,
  outputDir: string,
  generator: BoilerplateGenerator
): Promise<{success: boolean, boilerplatePath?: string, errors?: string[]}> {
  try {
    const boilerplatePath = path.join(outputDir, config.name);
    
    // Create boilerplate directory structure
    await fs.ensureDir(boilerplatePath);
    await fs.ensureDir(path.join(boilerplatePath, 'template'));
    await fs.ensureDir(path.join(boilerplatePath, 'hooks'));
    await fs.ensureDir(path.join(boilerplatePath, 'docs'));

    // Copy project files to template directory
    const templateDir = path.join(boilerplatePath, 'template');
    await copyProjectToTemplate(projectPath, templateDir, config);

    // Create config.json
    const configPath = path.join(boilerplatePath, 'config.json');
    await fs.writeJson(configPath, config, { spaces: 2 });

    // Create README
    const readmePath = path.join(boilerplatePath, 'README.md');
    await createBoilerplateReadme(readmePath, config);

    // Create example hook
    const hookPath = path.join(boilerplatePath, 'hooks', 'post-install.js');
    await createExampleHook(hookPath, config);

    return {
      success: true,
      boilerplatePath
    };

  } catch (error) {
    return {
      success: false,
      errors: [error.message]
    };
  }
}

/**
 * Copy project files to template directory with transformations
 */
async function copyProjectToTemplate(
  projectPath: string,
  templateDir: string,
  config: any
): Promise<void> {
  const ignorePatterns = config.ignorePatterns || ['node_modules', 'dist', 'build', '.git', '.env'];
  const templateFiles = config.templateFiles || ['*.json', '*.md', '*.env*'];

  // Copy all files except ignored ones
  await fs.copy(projectPath, templateDir, {
    filter: (src) => {
      const relativePath = path.relative(projectPath, src);
      return !ignorePatterns.some(pattern => {
        if (pattern.includes('*')) {
          // Simple glob matching
          const regex = new RegExp(pattern.replace(/\*/g, '.*'));
          return regex.test(relativePath);
        }
        return relativePath.startsWith(pattern);
      });
    }
  });

  // Transform specified files to Handlebars templates
  for (const pattern of templateFiles) {
    const files = await findFilesByPattern(templateDir, pattern);
    
    for (const file of files) {
      await transformFileToTemplate(file, config);
    }
  }
}

/**
 * Find files matching a pattern
 */
async function findFilesByPattern(dir: string, pattern: string): Promise<string[]> {
  const files: string[] = [];
  
  async function scan(currentDir: string) {
    const entries = await fs.readdir(currentDir);
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        await scan(fullPath);
      } else {
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace(/\*/g, '.*'));
          if (regex.test(entry)) {
            files.push(fullPath);
          }
        } else if (entry === pattern) {
          files.push(fullPath);
        }
      }
    }
  }
  
  await scan(dir);
  return files;
}

/**
 * Transform file to Handlebars template
 */
async function transformFileToTemplate(filePath: string, config: any): Promise<void> {
  const content = await fs.readFile(filePath, 'utf-8');
  
  // Simple transformations - replace common values with Handlebars variables
  let transformed = content
    .replace(/"name":\s*"[^"]*"/g, '"name": "{{projectName}}"')
    .replace(/"description":\s*"[^"]*"/g, '"description": "{{projectDescription}}"')
    .replace(/# .+/g, '# {{projectName}}');
  
  // Add .hbs extension and save
  const templatePath = filePath + '.hbs';
  await fs.writeFile(templatePath, transformed);
  
  // Remove original file
  await fs.remove(filePath);
}

/**
 * Create boilerplate README
 */
async function createBoilerplateReadme(readmePath: string, config: any): Promise<void> {
  const content = `# ${config.name}

${config.description}

## Category
${config.category}

## Features
${Object.keys(config.features).map(f => `- ${f}`).join('\n')}

## Usage

\`\`\`bash
archbase create project MyApp --boilerplate=${config.name} --interactive
\`\`\`

## Configuration

This boilerplate supports the following prompts:

${config.prompts.map((p: any) => `- **${p.name}** (${p.type}): ${p.message}`).join('\n')}

## Generated Files

This boilerplate creates a complete project structure based on the original project template.

## Customization

You can customize this boilerplate by:
1. Modifying files in the \`template/\` directory
2. Updating the configuration in \`config.json\`
3. Adding custom hooks in the \`hooks/\` directory

Generated with Archbase CLI
`;

  await fs.writeFile(readmePath, content);
}

/**
 * Create example post-install hook
 */
async function createExampleHook(hookPath: string, config: any): Promise<void> {
  const content = `#!/usr/bin/env node

/**
 * Post-install hook for ${config.name}
 * 
 * This script runs after project creation to set up the project.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up ${config.name}...');

async function setup() {
  try {
    // Access configuration from environment variables
    const projectName = process.env.PROJECT_NAME;
    const projectPath = process.env.PROJECT_PATH;
    const answers = JSON.parse(process.env.ARCHBASE_ANSWERS || '{}');

    console.log(\`📁 Project: \${projectName}\`);
    console.log(\`📍 Path: \${projectPath}\`);

    // Example: Install dependencies if requested
    if (answers.installDependencies !== false) {
      console.log('📦 Installing dependencies...');
      execSync('npm install', { cwd: projectPath, stdio: 'inherit' });
    }

    // Example: Initialize Git if requested
    if (answers.useGit !== false) {
      console.log('🔧 Initializing Git repository...');
      execSync('git init', { cwd: projectPath });
      execSync('git add .', { cwd: projectPath });
      execSync('git commit -m "Initial commit from ${config.name}"', { cwd: projectPath });
    }

    console.log('✅ Setup completed successfully!');
    console.log('');
    console.log('🎯 Next steps:');
    console.log(\`  cd \${projectName}\`);
    console.log('  npm run dev');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setup();
`;

  await fs.writeFile(hookPath, content);
}