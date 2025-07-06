/**
 * Interactive Wizard for Archbase CLI
 * 
 * Provides guided project creation with detailed explanations
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { BoilerplateGenerator } from '../generators/BoilerplateGenerator';

export interface WizardResult {
  projectName: string;
  projectType: 'basic' | 'admin' | 'full';
  features: string[];
  author: string;
  description: string;
  useTypeScript: boolean;
  setupGit: boolean;
  installDependencies: boolean;
  selectedBoilerplate?: string;
  boilerplateSource: 'builtin' | 'git' | 'npm' | 'blank';
  remoteOptions?: {
    url: string;
    branch?: string;
    subfolder?: string;
  };
  additionalConfig: {
    apiUrl?: string;
    database?: string;
    authentication?: string;
    deployment?: string;
  };
}

export class ProjectWizard {
  
  async run(suggestedName?: string): Promise<WizardResult> {
    console.log(chalk.blue.bold('\n🧙‍♂️ Archbase Project Creation Wizard'));
    console.log(chalk.gray('Let\'s create your perfect Archbase React project step by step.\n'));
    
    const result = await this.runWizardSteps(suggestedName);
    return result;
  }
  
  private async runWizardSteps(suggestedName?: string): Promise<WizardResult> {
    // Step 1: Project basics
    const basics = await this.askProjectBasics(suggestedName);
    
    // Step 2: Project type and architecture
    const architecture = await this.askProjectArchitecture();
    
    // Step 3: Template selection
    const template = await this.askTemplateSelection();
    
    // Step 4: Features and capabilities
    const features = await this.askProjectFeatures(architecture.projectType);
    
    // Step 5: Development setup
    const devSetup = await this.askDevelopmentSetup();
    
    // Step 6: Additional configuration
    const additionalConfig = await this.askAdditionalConfig(architecture.projectType);
    
    // Step 7: Confirmation
    const confirmation = await this.confirmChoices({
      ...basics,
      ...architecture,
      ...template,
      ...features,
      ...devSetup,
      additionalConfig
    });
    
    if (!confirmation.confirmed) {
      console.log(chalk.yellow('🔄 Let\'s start over...'));
      return this.runWizardSteps();
    }
    
    return {
      ...basics,
      ...architecture,
      ...template,
      ...features,
      ...devSetup,
      additionalConfig
    };
  }
  
  private async askProjectBasics(suggestedName?: string) {
    console.log(chalk.yellow.bold('📋 Step 1: Project Information'));
    console.log(chalk.gray('Basic information about your project.\n'));
    
    const questions: any[] = [];
    
    // Se não temos um nome sugerido, perguntamos
    if (!suggestedName) {
      questions.push({
        type: 'input',
        name: 'projectName',
        message: 'What is your project name?',
        validate: (input: string) => {
          if (!input.trim()) return 'Project name is required';
          if (!/^[a-zA-Z0-9-_]+$/.test(input)) return 'Use only letters, numbers, hyphens, and underscores';
          return true;
        }
      });
    } else {
      console.log(chalk.green(`✅ Project name: ${suggestedName}`));
    }
    
    questions.push(
      {
        type: 'input',
        name: 'description',
        message: 'Brief description of your project:',
        default: `Modern React application built with Archbase - ${suggestedName || '{{projectName}}'}`
      },
      {
        type: 'input',
        name: 'author',
        message: 'Author name (for package.json):',
        default: 'Your Name'
      }
    );
    
    const answers = await inquirer.prompt(questions);
    
    // Se temos um nome sugerido, o adicionamos ao resultado
    if (suggestedName) {
      answers.projectName = suggestedName;
    }
    
    return answers;
  }
  
  private async askProjectArchitecture() {
    console.log(chalk.yellow.bold('\n🏗️  Step 2: Project Architecture'));
    console.log(chalk.gray('Choose the type of project that best fits your needs.\n'));
    
    return inquirer.prompt([
      {
        type: 'list',
        name: 'projectType',
        message: 'What type of project are you building?',
        choices: [
          {
            name: `${chalk.green('Basic')} - Simple web application with core components`,
            short: 'Basic',
            value: 'basic'
          },
          {
            name: `${chalk.blue('Admin')} - Administrative dashboard with data management`,
            short: 'Admin',
            value: 'admin'
          },
          {
            name: `${chalk.magenta('Full')} - Enterprise application with all features`,
            short: 'Full',
            value: 'full'
          }
        ],
        when: () => {
          console.log(chalk.gray('📖 Project Types Explained:'));
          console.log(chalk.green('   Basic:') + chalk.gray(' Core Archbase components + Mantine UI + TypeScript'));
          console.log(chalk.blue('   Admin:') + chalk.gray(' Basic + Data grids + Authentication + File export'));
          console.log(chalk.magenta('   Full:') + chalk.gray(' Admin + Rich text + Charts + PDF + Image processing'));
          console.log('');
          return true;
        }
      }
    ]);
  }
  
  private async askTemplateSelection() {
    console.log(chalk.yellow.bold('\n📦 Step 3: Template Selection'));
    console.log(chalk.gray('Choose a starting template for your project.\n'));
    
    const boilerplateGenerator = new BoilerplateGenerator();
    let availableBoilerplates: string[] = [];
    
    try {
      const allBoilerplates = await boilerplateGenerator.listAllBoilerplates();
      availableBoilerplates = [...allBoilerplates.builtin, ...allBoilerplates.custom];
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not load boilerplates, continuing with basic options'));
    }
    
    const templateChoices: Array<{
      name: string;
      short: string;
      value: { source: string; name: string | undefined };
    }> = [
      {
        name: `${chalk.green('Blank Project')} - Start from scratch with minimal structure`,
        short: 'Blank',
        value: { source: 'blank', name: undefined }
      }
    ];
    
    // Add built-in boilerplates
    for (const name of availableBoilerplates) {
      try {
        const config = await boilerplateGenerator.getBoilerplateConfig(name);
        if (config) {
          templateChoices.push({
            name: `${chalk.cyan(config.name)} - ${config.description}`,
            short: config.name,
            value: { source: 'builtin', name: name }
          });
        }
      } catch (error) {
        // Skip invalid boilerplates
      }
    }
    
    templateChoices.push(
      {
        name: `${chalk.blue('Remote Git Repository')} - Use template from Git`,
        short: 'Git Repository',
        value: { source: 'git', name: undefined }
      },
      {
        name: `${chalk.blue('npm Package')} - Use template from npm`,
        short: 'npm Package',
        value: { source: 'npm', name: undefined }
      }
    );
    
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'templateSelection',
        message: 'Select a project template:',
        choices: templateChoices,
        when: () => {
          console.log(chalk.gray('📖 Template Types:'));
          console.log(chalk.green('   Blank:') + chalk.gray(' Minimal structure with just essential files'));
          console.log(chalk.cyan('   Built-in:') + chalk.gray(' Pre-configured templates with components and features'));
          console.log(chalk.blue('   Remote:') + chalk.gray(' Custom templates from external sources'));
          console.log('');
          return true;
        }
      }
    ]);
    
    const selection = answers.templateSelection;
    
    if (selection.source === 'git') {
      const gitAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'gitUrl',
          message: 'Git repository URL:',
          validate: (input: string) => {
            if (!input.trim()) return 'Git URL is required';
            if (!input.includes('git') && !input.includes('github') && !input.includes('gitlab')) {
              return 'Please provide a valid Git repository URL';
            }
            return true;
          }
        },
        {
          type: 'input',
          name: 'gitBranch',
          message: 'Git branch:',
          default: 'main'
        },
        {
          type: 'input',
          name: 'gitSubfolder',
          message: 'Subfolder (optional):',
          default: ''
        }
      ]);
      
      return {
        selectedBoilerplate: undefined,
        boilerplateSource: 'git' as const,
        remoteOptions: {
          url: gitAnswers.gitUrl,
          branch: gitAnswers.gitBranch,
          subfolder: gitAnswers.gitSubfolder || undefined
        }
      };
    }
    
    if (selection.source === 'npm') {
      const npmAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'npmPackage',
          message: 'npm package name:',
          validate: (input: string) => {
            if (!input.trim()) return 'Package name is required';
            return true;
          }
        },
        {
          type: 'input',
          name: 'npmSubfolder',
          message: 'Subfolder in package (optional):',
          default: ''
        }
      ]);
      
      return {
        selectedBoilerplate: undefined,
        boilerplateSource: 'npm' as const,
        remoteOptions: {
          url: npmAnswers.npmPackage,
          subfolder: npmAnswers.npmSubfolder || undefined
        }
      };
    }
    
    return {
      selectedBoilerplate: selection.name,
      boilerplateSource: selection.source as 'builtin' | 'blank',
      remoteOptions: undefined
    };
  }
  
  private async askProjectFeatures(projectType: string) {
    console.log(chalk.yellow.bold('\n🎛️  Step 4: Features & Capabilities'));
    console.log(chalk.gray('Select additional features for your project.\n'));
    
    const baseFeatures = this.getBaseFeaturesForType(projectType);
    const availableFeatures = this.getAvailableFeatures(projectType);
    
    if (availableFeatures.length === 0) {
      console.log(chalk.gray(`✅ All features for ${projectType} projects are included by default.`));
      return { features: baseFeatures };
    }
    
    const answers = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'additionalFeatures',
        message: 'Select additional features to include:',
        choices: availableFeatures,
        when: () => {
          console.log(chalk.gray('📦 Included by default:'));
          baseFeatures.forEach(feature => {
            console.log(chalk.green(`   ✓ ${feature}`));
          });
          console.log('');
          return true;
        }
      }
    ]);
    
    return {
      features: [...baseFeatures, ...answers.additionalFeatures]
    };
  }
  
  private async askDevelopmentSetup() {
    console.log(chalk.yellow.bold('\n⚙️  Step 5: Development Setup'));
    console.log(chalk.gray('Configure your development environment.\n'));
    
    return inquirer.prompt([
      {
        type: 'confirm',
        name: 'useTypeScript',
        message: 'Use TypeScript?',
        default: true,
        when: () => {
          console.log(chalk.gray('💡 TypeScript provides:'));
          console.log(chalk.gray('   • Static type checking'));
          console.log(chalk.gray('   • Better IDE support'));
          console.log(chalk.gray('   • Fewer runtime errors'));
          console.log(chalk.gray('   • Better refactoring'));
          console.log('');
          return true;
        }
      },
      {
        type: 'confirm',
        name: 'setupGit',
        message: 'Initialize Git repository?',
        default: true
      },
      {
        type: 'confirm',
        name: 'installDependencies',
        message: 'Install dependencies automatically?',
        default: true,
        when: () => {
          console.log(chalk.gray('📦 This will run: npm install'));
          console.log('');
          return true;
        }
      }
    ]);
  }
  
  private async askAdditionalConfig(projectType: string) {
    console.log(chalk.yellow.bold('\n🔧 Step 6: Additional Configuration'));
    console.log(chalk.gray('Optional configuration for advanced features.\n'));
    
    const questions: any[] = [];
    
    if (projectType === 'admin' || projectType === 'full') {
      questions.push(
        {
          type: 'input',
          name: 'apiUrl',
          message: 'API base URL (for data services):',
          default: 'http://localhost:3001/api',
          when: () => {
            console.log(chalk.gray('🌐 API Configuration:'));
            console.log(chalk.gray('   Used for ArchbaseRemoteDataSource and authentication'));
            console.log('');
            return true;
          }
        },
        {
          type: 'list',
          name: 'authentication',
          message: 'Authentication method:',
          choices: [
            { name: 'JWT (JSON Web Tokens)', value: 'jwt' },
            { name: 'OAuth 2.0', value: 'oauth' },
            { name: 'Custom Authentication', value: 'custom' },
            { name: 'None (configure later)', value: 'none' }
          ],
          default: 'jwt'
        }
      );
    }
    
    if (projectType === 'admin' || projectType === 'full') {
      questions.push({
        type: 'list',
        name: 'database',
        message: 'Primary database type (for reference):',
        choices: [
          { name: 'PostgreSQL', value: 'postgresql' },
          { name: 'MySQL/MariaDB', value: 'mysql' },
          { name: 'MongoDB', value: 'mongodb' },
          { name: 'SQL Server', value: 'sqlserver' },
          { name: 'Other/Multiple', value: 'other' }
        ],
        default: 'postgresql'
      });
    }
    
    questions.push({
      type: 'list',
      name: 'deployment',
      message: 'Planned deployment target:',
      choices: [
        { name: 'Vercel', value: 'vercel' },
        { name: 'Netlify', value: 'netlify' },
        { name: 'AWS', value: 'aws' },
        { name: 'Docker Container', value: 'docker' },
        { name: 'Traditional Server', value: 'server' },
        { name: 'Not decided yet', value: 'undecided' }
      ],
      default: 'undecided'
    });
    
    if (questions.length === 0) {
      return {};
    }
    
    return inquirer.prompt(questions);
  }
  
  private async confirmChoices(choices: any) {
    console.log(chalk.yellow.bold('\n📋 Step 7: Confirmation'));
    console.log(chalk.gray('Review your project configuration:\n'));
    
    // Display choices
    console.log(chalk.blue.bold('Project Information:'));
    console.log(`  Name: ${chalk.white(choices.projectName)}`);
    console.log(`  Type: ${chalk.white(choices.projectType)}`);
    console.log(`  Author: ${chalk.white(choices.author)}`);
    console.log(`  Description: ${chalk.gray(choices.description)}`);
    
    console.log(chalk.blue.bold('\nTemplate:'));
    if (choices.boilerplateSource === 'blank') {
      console.log(`  ${chalk.green('Blank Project')} - Starting from scratch`);
    } else if (choices.boilerplateSource === 'builtin') {
      console.log(`  ${chalk.cyan(choices.selectedBoilerplate)} - Built-in template`);
    } else if (choices.boilerplateSource === 'git') {
      console.log(`  ${chalk.blue('Git Repository')} - ${choices.remoteOptions?.url}`);
      if (choices.remoteOptions?.branch) {
        console.log(`    Branch: ${choices.remoteOptions.branch}`);
      }
      if (choices.remoteOptions?.subfolder) {
        console.log(`    Subfolder: ${choices.remoteOptions.subfolder}`);
      }
    } else if (choices.boilerplateSource === 'npm') {
      console.log(`  ${chalk.blue('npm Package')} - ${choices.remoteOptions?.url}`);
      if (choices.remoteOptions?.subfolder) {
        console.log(`    Subfolder: ${choices.remoteOptions.subfolder}`);
      }
    }
    
    console.log(chalk.blue.bold('\nFeatures:'));
    choices.features.forEach((feature: string) => {
      console.log(`  ${chalk.green('✓')} ${feature}`);
    });
    
    console.log(chalk.blue.bold('\nDevelopment Setup:'));
    console.log(`  TypeScript: ${choices.useTypeScript ? chalk.green('Yes') : chalk.red('No')}`);
    console.log(`  Git Repository: ${choices.setupGit ? chalk.green('Yes') : chalk.red('No')}`);
    console.log(`  Auto Install: ${choices.installDependencies ? chalk.green('Yes') : chalk.red('No')}`);
    
    if (Object.keys(choices.additionalConfig).length > 0) {
      console.log(chalk.blue.bold('\nAdditional Configuration:'));
      Object.entries(choices.additionalConfig).forEach(([key, value]) => {
        if (value) {
          console.log(`  ${key}: ${chalk.white(value)}`);
        }
      });
    }
    
    console.log('');
    
    return inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: 'Create project with these settings?',
        default: true
      }
    ]);
  }
  
  private getBaseFeaturesForType(projectType: string): string[] {
    const features = ['core-components', 'mantine-ui', 'typescript-support', 'routing'];
    
    if (projectType === 'admin' || projectType === 'full') {
      features.push('data-grid', 'auth', 'file-export');
    }
    
    if (projectType === 'full') {
      features.push('rich-text', 'charts', 'pdf', 'image-crop', 'color-picker');
    }
    
    return features;
  }
  
  private getAvailableFeatures(projectType: string): any[] {
    const allFeatures = [
      {
        name: `${chalk.cyan('Rich Text Editor')} - TipTap with Mantine integration`,
        short: 'Rich Text',
        value: 'rich-text',
        checked: false
      },
      {
        name: `${chalk.cyan('Advanced Data Grid')} - Material-UI DataGrid + Mantine React Table`,
        short: 'Data Grid',
        value: 'data-grid',
        checked: false
      },
      {
        name: `${chalk.cyan('Authentication')} - JWT tokens + cookie management`,
        short: 'Authentication',
        value: 'auth',
        checked: false
      },
      {
        name: `${chalk.cyan('File Export')} - CSV, Excel export capabilities`,
        short: 'File Export',
        value: 'file-export',
        checked: false
      },
      {
        name: `${chalk.cyan('PDF Generation')} - jsPDF with table support`,
        short: 'PDF',
        value: 'pdf',
        checked: false
      },
      {
        name: `${chalk.cyan('Charts & Visualization')} - D3.js + React Konva`,
        short: 'Charts',
        value: 'charts',
        checked: false
      },
      {
        name: `${chalk.cyan('Image Processing')} - Crop, resize, edit images`,
        short: 'Image Processing',
        value: 'image-crop',
        checked: false
      },
      {
        name: `${chalk.cyan('Input Masking')} - Phone, document, custom masks`,
        short: 'Input Masking',
        value: 'input-mask',
        checked: false
      },
      {
        name: `${chalk.cyan('Color Picker')} - Advanced color selection`,
        short: 'Color Picker',
        value: 'color-picker',
        checked: false
      }
    ];
    
    const baseFeatures = this.getBaseFeaturesForType(projectType);
    
    return allFeatures.filter(feature => !baseFeatures.includes(feature.value));
  }
  
  /**
   * Generate configuration summary
   */
  generateSummary(result: WizardResult): string {
    return `
# ${result.projectName}

${result.description}

## Project Configuration

- **Type**: ${result.projectType}
- **Author**: ${result.author}
- **TypeScript**: ${result.useTypeScript ? 'Yes' : 'No'}
- **Git**: ${result.setupGit ? 'Initialized' : 'Not initialized'}

## Features Included

${result.features.map(feature => `- ${feature}`).join('\n')}

## Additional Configuration

${Object.entries(result.additionalConfig)
  .filter(([_, value]) => value)
  .map(([key, value]) => `- **${key}**: ${value}`)
  .join('\n')}

## Getting Started

\`\`\`bash
cd ${result.projectName}
${result.installDependencies ? '# Dependencies already installed' : 'npm install'}
npm run dev
\`\`\`

## Next Steps

1. Review the generated code structure
2. Configure your API endpoints
3. Customize the theme and styling
4. Start building your components

Built with ❤️ using [Archbase CLI](https://github.com/edsonmartins/archbase-cli)
`;
  }
}