"use strict";
/**
 * Interactive Wizard for Archbase CLI
 *
 * Provides guided project creation with detailed explanations
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectWizard = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
class ProjectWizard {
    async run() {
        console.log(chalk_1.default.blue.bold('\n🧙‍♂️ Archbase Project Creation Wizard'));
        console.log(chalk_1.default.gray('Let\'s create your perfect Archbase React project step by step.\n'));
        const result = await this.runWizardSteps();
        return result;
    }
    async runWizardSteps() {
        // Step 1: Project basics
        const basics = await this.askProjectBasics();
        // Step 2: Project type and architecture
        const architecture = await this.askProjectArchitecture();
        // Step 3: Features and capabilities
        const features = await this.askProjectFeatures(architecture.projectType);
        // Step 4: Development setup
        const devSetup = await this.askDevelopmentSetup();
        // Step 5: Additional configuration
        const additionalConfig = await this.askAdditionalConfig(architecture.projectType);
        // Step 6: Confirmation
        const confirmation = await this.confirmChoices({
            ...basics,
            ...architecture,
            ...features,
            ...devSetup,
            additionalConfig
        });
        if (!confirmation.confirmed) {
            console.log(chalk_1.default.yellow('🔄 Let\'s start over...'));
            return this.runWizardSteps();
        }
        return {
            ...basics,
            ...architecture,
            ...features,
            ...devSetup,
            additionalConfig
        };
    }
    async askProjectBasics() {
        console.log(chalk_1.default.yellow.bold('📋 Step 1: Project Information'));
        console.log(chalk_1.default.gray('Basic information about your project.\n'));
        return inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'projectName',
                message: 'What is your project name?',
                validate: (input) => {
                    if (!input.trim())
                        return 'Project name is required';
                    if (!/^[a-zA-Z0-9-_]+$/.test(input))
                        return 'Use only letters, numbers, hyphens, and underscores';
                    return true;
                }
            },
            {
                type: 'input',
                name: 'description',
                message: 'Brief description of your project:',
                default: (answers) => `Modern React application built with Archbase - ${answers.projectName}`
            },
            {
                type: 'input',
                name: 'author',
                message: 'Author name (for package.json):',
                default: 'Your Name'
            }
        ]);
    }
    async askProjectArchitecture() {
        console.log(chalk_1.default.yellow.bold('\n🏗️  Step 2: Project Architecture'));
        console.log(chalk_1.default.gray('Choose the type of project that best fits your needs.\n'));
        return inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'projectType',
                message: 'What type of project are you building?',
                choices: [
                    {
                        name: `${chalk_1.default.green('Basic')} - Simple web application with core components`,
                        short: 'Basic',
                        value: 'basic'
                    },
                    {
                        name: `${chalk_1.default.blue('Admin')} - Administrative dashboard with data management`,
                        short: 'Admin',
                        value: 'admin'
                    },
                    {
                        name: `${chalk_1.default.magenta('Full')} - Enterprise application with all features`,
                        short: 'Full',
                        value: 'full'
                    }
                ],
                when: () => {
                    console.log(chalk_1.default.gray('📖 Project Types Explained:'));
                    console.log(chalk_1.default.green('   Basic:') + chalk_1.default.gray(' Core Archbase components + Mantine UI + TypeScript'));
                    console.log(chalk_1.default.blue('   Admin:') + chalk_1.default.gray(' Basic + Data grids + Authentication + File export'));
                    console.log(chalk_1.default.magenta('   Full:') + chalk_1.default.gray(' Admin + Rich text + Charts + PDF + Image processing'));
                    console.log('');
                    return true;
                }
            }
        ]);
    }
    async askProjectFeatures(projectType) {
        console.log(chalk_1.default.yellow.bold('\n🎛️  Step 3: Features & Capabilities'));
        console.log(chalk_1.default.gray('Select additional features for your project.\n'));
        const baseFeatures = this.getBaseFeaturesForType(projectType);
        const availableFeatures = this.getAvailableFeatures(projectType);
        if (availableFeatures.length === 0) {
            console.log(chalk_1.default.gray(`✅ All features for ${projectType} projects are included by default.`));
            return { features: baseFeatures };
        }
        const answers = await inquirer_1.default.prompt([
            {
                type: 'checkbox',
                name: 'additionalFeatures',
                message: 'Select additional features to include:',
                choices: availableFeatures,
                when: () => {
                    console.log(chalk_1.default.gray('📦 Included by default:'));
                    baseFeatures.forEach(feature => {
                        console.log(chalk_1.default.green(`   ✓ ${feature}`));
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
    async askDevelopmentSetup() {
        console.log(chalk_1.default.yellow.bold('\n⚙️  Step 4: Development Setup'));
        console.log(chalk_1.default.gray('Configure your development environment.\n'));
        return inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'useTypeScript',
                message: 'Use TypeScript?',
                default: true,
                when: () => {
                    console.log(chalk_1.default.gray('💡 TypeScript provides:'));
                    console.log(chalk_1.default.gray('   • Static type checking'));
                    console.log(chalk_1.default.gray('   • Better IDE support'));
                    console.log(chalk_1.default.gray('   • Fewer runtime errors'));
                    console.log(chalk_1.default.gray('   • Better refactoring'));
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
                    console.log(chalk_1.default.gray('📦 This will run: npm install'));
                    console.log('');
                    return true;
                }
            }
        ]);
    }
    async askAdditionalConfig(projectType) {
        console.log(chalk_1.default.yellow.bold('\n🔧 Step 5: Additional Configuration'));
        console.log(chalk_1.default.gray('Optional configuration for advanced features.\n'));
        const questions = [];
        if (projectType === 'admin' || projectType === 'full') {
            questions.push({
                type: 'input',
                name: 'apiUrl',
                message: 'API base URL (for data services):',
                default: 'http://localhost:3001/api',
                when: () => {
                    console.log(chalk_1.default.gray('🌐 API Configuration:'));
                    console.log(chalk_1.default.gray('   Used for ArchbaseRemoteDataSource and authentication'));
                    console.log('');
                    return true;
                }
            }, {
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
            });
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
        return inquirer_1.default.prompt(questions);
    }
    async confirmChoices(choices) {
        console.log(chalk_1.default.yellow.bold('\n📋 Step 6: Confirmation'));
        console.log(chalk_1.default.gray('Review your project configuration:\n'));
        // Display choices
        console.log(chalk_1.default.blue.bold('Project Information:'));
        console.log(`  Name: ${chalk_1.default.white(choices.projectName)}`);
        console.log(`  Type: ${chalk_1.default.white(choices.projectType)}`);
        console.log(`  Author: ${chalk_1.default.white(choices.author)}`);
        console.log(`  Description: ${chalk_1.default.gray(choices.description)}`);
        console.log(chalk_1.default.blue.bold('\nFeatures:'));
        choices.features.forEach((feature) => {
            console.log(`  ${chalk_1.default.green('✓')} ${feature}`);
        });
        console.log(chalk_1.default.blue.bold('\nDevelopment Setup:'));
        console.log(`  TypeScript: ${choices.useTypeScript ? chalk_1.default.green('Yes') : chalk_1.default.red('No')}`);
        console.log(`  Git Repository: ${choices.setupGit ? chalk_1.default.green('Yes') : chalk_1.default.red('No')}`);
        console.log(`  Auto Install: ${choices.installDependencies ? chalk_1.default.green('Yes') : chalk_1.default.red('No')}`);
        if (Object.keys(choices.additionalConfig).length > 0) {
            console.log(chalk_1.default.blue.bold('\nAdditional Configuration:'));
            Object.entries(choices.additionalConfig).forEach(([key, value]) => {
                if (value) {
                    console.log(`  ${key}: ${chalk_1.default.white(value)}`);
                }
            });
        }
        console.log('');
        return inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'confirmed',
                message: 'Create project with these settings?',
                default: true
            }
        ]);
    }
    getBaseFeaturesForType(projectType) {
        const features = ['core-components', 'mantine-ui', 'typescript-support', 'routing'];
        if (projectType === 'admin' || projectType === 'full') {
            features.push('data-grid', 'auth', 'file-export');
        }
        if (projectType === 'full') {
            features.push('rich-text', 'charts', 'pdf', 'image-crop', 'color-picker');
        }
        return features;
    }
    getAvailableFeatures(projectType) {
        const allFeatures = [
            {
                name: `${chalk_1.default.cyan('Rich Text Editor')} - TipTap with Mantine integration`,
                short: 'Rich Text',
                value: 'rich-text',
                checked: false
            },
            {
                name: `${chalk_1.default.cyan('Advanced Data Grid')} - Material-UI DataGrid + Mantine React Table`,
                short: 'Data Grid',
                value: 'data-grid',
                checked: false
            },
            {
                name: `${chalk_1.default.cyan('Authentication')} - JWT tokens + cookie management`,
                short: 'Authentication',
                value: 'auth',
                checked: false
            },
            {
                name: `${chalk_1.default.cyan('File Export')} - CSV, Excel export capabilities`,
                short: 'File Export',
                value: 'file-export',
                checked: false
            },
            {
                name: `${chalk_1.default.cyan('PDF Generation')} - jsPDF with table support`,
                short: 'PDF',
                value: 'pdf',
                checked: false
            },
            {
                name: `${chalk_1.default.cyan('Charts & Visualization')} - D3.js + React Konva`,
                short: 'Charts',
                value: 'charts',
                checked: false
            },
            {
                name: `${chalk_1.default.cyan('Image Processing')} - Crop, resize, edit images`,
                short: 'Image Processing',
                value: 'image-crop',
                checked: false
            },
            {
                name: `${chalk_1.default.cyan('Input Masking')} - Phone, document, custom masks`,
                short: 'Input Masking',
                value: 'input-mask',
                checked: false
            },
            {
                name: `${chalk_1.default.cyan('Color Picker')} - Advanced color selection`,
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
    generateSummary(result) {
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
exports.ProjectWizard = ProjectWizard;
//# sourceMappingURL=wizard.js.map