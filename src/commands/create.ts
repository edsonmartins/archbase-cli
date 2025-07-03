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
import { PackageJsonGenerator } from '../generators/PackageJsonGenerator';
import { ProjectWizard } from '../utils/wizard';

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
      .option('--project-type <type>', 'Project type (basic|admin|full) - determines dependency set', 'basic')
      .option('--features <features>', 'Comma-separated features (rich-text,data-grid,auth,file-export,pdf,charts,image-crop,input-mask,color-picker)')
      .option('--author <author>', 'Project author name')
      .option('--description <desc>', 'Project description')
      .option('--interactive', 'Interactive setup with prompts')
      .option('--wizard', 'Use guided wizard for project creation (recommended for complex projects)')
      .option('--config <file>', 'Configuration file path')
      .option('--dry-run', 'Show what would be created without executing')
      .action(async (name: string, options) => {
        // Check if wizard mode is requested
        if (options.wizard) {
          return await handleWizardMode(name, options);
        }
        
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
            // Generate package.json with proper dependencies
            spinner.text = 'Setting up Archbase dependencies...';
            
            const packageGenerator = new PackageJsonGenerator();
            const features = options.features ? options.features.split(',').map(f => f.trim()) : [];
            
            try {
              const packageResult = await packageGenerator.generate({
                name,
                description: options.description || `Archbase React application - ${name}`,
                author: options.author || '',
                projectType: options.projectType as 'basic' | 'admin' | 'full',
                features,
                outputDir: result.projectPath,
                typescript: true
              });
              
              if (packageResult.success) {
                spinner.succeed(chalk.green(`✅ Project '${name}' created with Archbase dependencies!`));
                console.log(chalk.cyan(`📁 Location: ${result.projectPath}`));
                
                // Show project info
                console.log(chalk.yellow('\n📋 Project Configuration:'));
                console.log(chalk.gray(`  Type: ${options.projectType}`));
                if (features.length > 0) {
                  console.log(chalk.gray(`  Features: ${features.join(', ')}`));
                }
                
                console.log(chalk.yellow('\n📦 Dependencies:'));
                console.log(chalk.gray('  ✅ @archbase/react + all required dependencies'));
                console.log(chalk.gray('  ✅ @mantine/core 8.x ecosystem'));
                console.log(chalk.gray('  ✅ TypeScript configuration'));
                console.log(chalk.gray('  ✅ PostCSS + Mantine preset'));
                console.log(chalk.gray('  ✅ Vite build configuration'));
                
                console.log(chalk.yellow('\n📋 Next steps:'));
                console.log(chalk.gray(`  cd ${name}`));
                console.log(chalk.gray('  npm install'));
                console.log(chalk.gray('  npm run dev'));
                
                // Generate installation instructions
                const instructions = packageGenerator.generateInstallationInstructions({
                  name,
                  projectType: options.projectType as 'basic' | 'admin' | 'full',
                  features,
                  outputDir: result.projectPath
                });
                
                // Write README with instructions
                const readmePath = path.join(result.projectPath, 'README.md');
                await require('fs-extra').writeFile(readmePath, instructions);
                
                console.log(chalk.green(`\n📖 Installation guide written to README.md`));
                
              } else {
                console.warn(chalk.yellow('⚠️  Project created but failed to setup dependencies'));
                console.warn(chalk.gray('You may need to manually install Archbase dependencies'));
                packageResult.errors?.forEach(error => {
                  console.error(chalk.red(`   ${error}`));
                });
              }
              
            } catch (error) {
              console.warn(chalk.yellow('⚠️  Project created but failed to setup dependencies'));
              console.warn(chalk.gray(`Error: ${error.message}`));
            }
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
    new Command('package-json')
      .description('Generate package.json with Archbase dependencies')
      .option('--name <name>', 'Project name', 'my-archbase-app')
      .option('--project-type <type>', 'Project type (basic|admin|full)', 'basic')
      .option('--features <features>', 'Comma-separated features (rich-text,data-grid,auth,file-export,pdf,charts,image-crop,input-mask,color-picker)')
      .option('--author <author>', 'Project author name')
      .option('--description <desc>', 'Project description')
      .option('--output <dir>', 'Output directory', '.')
      .action(async (options) => {
        console.log(chalk.blue(`📦 Generating package.json for Archbase project`));
        
        try {
          const packageGenerator = new PackageJsonGenerator();
          const features = options.features ? options.features.split(',').map(f => f.trim()) : [];
          
          const result = await packageGenerator.generate({
            name: options.name,
            description: options.description || `Archbase React application - ${options.name}`,
            author: options.author || '',
            projectType: options.projectType as 'basic' | 'admin' | 'full',
            features,
            outputDir: options.output,
            typescript: true
          });
          
          if (result.success) {
            console.log(chalk.green(`✅ Package.json created successfully!`));
            console.log(chalk.yellow('\n📋 Generated files:'));
            result.files.forEach(file => {
              console.log(chalk.gray(`  📄 ${file}`));
            });
            
            console.log(chalk.yellow('\n📦 Project Configuration:'));
            console.log(chalk.gray(`  Type: ${options.projectType}`));
            if (features.length > 0) {
              console.log(chalk.gray(`  Features: ${features.join(', ')}`));
            }
            
            console.log(chalk.yellow('\n📋 Next steps:'));
            console.log(chalk.gray('  npm install'));
            console.log(chalk.gray('  # Start developing with Archbase components!'));
            
          } else {
            console.error(chalk.red('❌ Failed to generate package.json'));
            result.errors?.forEach(error => {
              console.error(chalk.red(`  ${error}`));
            });
            process.exit(1);
          }
          
        } catch (error) {
          console.error(chalk.red(`❌ Error generating package.json: ${error.message}`));
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

/**
 * Handle wizard mode for project creation
 */
async function handleWizardMode(suggestedName: string, options: any) {
  try {
    const wizard = new ProjectWizard();
    const result = await wizard.run();
    
    // Use suggested name or wizard result
    const projectName = result.projectName || suggestedName;
    const outputDir = path.resolve(process.cwd(), projectName);
    
    console.log(chalk.blue(`\n🚀 Creating project based on wizard configuration...`));
    
    const spinner = ora('Setting up project structure...').start();
    
    // Generate package.json and configuration files
    const packageGenerator = new PackageJsonGenerator();
    
    const packageResult = await packageGenerator.generate({
      name: projectName,
      description: result.description,
      author: result.author,
      projectType: result.projectType,
      features: result.features,
      outputDir,
      typescript: result.useTypeScript,
      scripts: {
        "dev": "vite",
        "build": result.useTypeScript ? "tsc && vite build" : "vite build",
        "preview": "vite preview",
        "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
        "lint:fix": "eslint . --ext ts,tsx --fix",
        ...(result.useTypeScript ? { "type-check": "tsc --noEmit" } : {})
      }
    });
    
    if (!packageResult.success) {
      spinner.fail(chalk.red('❌ Failed to create project configuration'));
      packageResult.errors?.forEach(error => {
        console.error(chalk.red(`  ${error}`));
      });
      return;
    }
    
    // Create additional project structure
    await createProjectStructure(outputDir, result);
    
    // Generate configuration files based on wizard choices
    await generateWizardConfigurations(outputDir, result);
    
    // Initialize Git if requested
    if (result.setupGit) {
      spinner.text = 'Initializing Git repository...';
      try {
        const { execSync } = require('child_process');
        execSync('git init', { cwd: outputDir, stdio: 'ignore' });
        execSync('git add .', { cwd: outputDir, stdio: 'ignore' });
        execSync('git commit -m "Initial commit from Archbase CLI"', { cwd: outputDir, stdio: 'ignore' });
      } catch (error) {
        console.warn(chalk.yellow('⚠️  Git initialization failed (continuing without Git)'));
      }
    }
    
    // Install dependencies if requested
    if (result.installDependencies) {
      spinner.text = 'Installing dependencies...';
      try {
        const { execSync } = require('child_process');
        execSync('npm install', { cwd: outputDir, stdio: 'ignore' });
      } catch (error) {
        console.warn(chalk.yellow('⚠️  Dependency installation failed. Run "npm install" manually.'));
      }
    }
    
    // Generate project summary
    const summary = wizard.generateSummary(result);
    const fs = require('fs-extra');
    await fs.writeFile(path.join(outputDir, 'PROJECT-SUMMARY.md'), summary);
    
    spinner.succeed(chalk.green(`✅ Project '${projectName}' created successfully!`));
    
    // Show completion message
    console.log(chalk.cyan(`📁 Location: ${outputDir}`));
    console.log(chalk.yellow('\n📦 Project Configuration:'));
    console.log(chalk.gray(`  Type: ${result.projectType}`));
    console.log(chalk.gray(`  Features: ${result.features.join(', ')}`));
    console.log(chalk.gray(`  TypeScript: ${result.useTypeScript ? 'Yes' : 'No'}`));
    console.log(chalk.gray(`  Git: ${result.setupGit ? 'Initialized' : 'Not initialized'}`));
    
    if (result.additionalConfig && Object.keys(result.additionalConfig).length > 0) {
      console.log(chalk.yellow('\n🔧 Additional Configuration:'));
      Object.entries(result.additionalConfig).forEach(([key, value]) => {
        if (value) {
          console.log(chalk.gray(`  ${key}: ${value}`));
        }
      });
    }
    
    console.log(chalk.yellow('\n📋 Next steps:'));
    console.log(chalk.gray(`  cd ${projectName}`));
    if (!result.installDependencies) {
      console.log(chalk.gray('  npm install'));
    }
    console.log(chalk.gray('  npm run dev'));
    console.log(chalk.gray('  # Check PROJECT-SUMMARY.md for detailed configuration'));
    
  } catch (error) {
    console.error(chalk.red(`❌ Wizard failed: ${error.message}`));
    process.exit(1);
  }
}

/**
 * Create basic project structure
 */
async function createProjectStructure(outputDir: string, config: any) {
  const fs = require('fs-extra');
  
  const directories = [
    'src/components',
    'src/pages',
    'src/hooks',
    'src/utils',
    'src/types',
    'src/assets',
    'public'
  ];
  
  if (config.projectType === 'admin' || config.projectType === 'full') {
    directories.push(
      'src/domain',
      'src/services',
      'src/store'
    );
  }
  
  for (const dir of directories) {
    await fs.ensureDir(path.join(outputDir, dir));
  }
  
  // Create basic files
  await createBasicFiles(outputDir, config);
}

/**
 * Create basic project files
 */
async function createBasicFiles(outputDir: string, config: any) {
  const fs = require('fs-extra');
  
  // Create main.tsx
  const mainContent = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App${config.useTypeScript ? '.tsx' : '.jsx'}'
import { AppProvider } from './providers/AppProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>,
)`;
  
  await fs.writeFile(
    path.join(outputDir, `src/main.${config.useTypeScript ? 'tsx' : 'jsx'}`), 
    mainContent
  );
  
  // Create App component
  const appContent = `import { Container, Title, Text, Button, Group } from '@mantine/core'
import { ArchbaseButton } from '@archbase/react'

function App() {
  return (
    <Container size="md" py="xl">
      <Title order={1} ta="center" mb="lg">
        Welcome to ${config.projectName}
      </Title>
      
      <Text ta="center" mb="xl">
        ${config.description}
      </Text>
      
      <Group justify="center">
        <ArchbaseButton>Get Started</ArchbaseButton>
        <Button variant="outline">Learn More</Button>
      </Group>
    </Container>
  )
}

export default App`;
  
  await fs.writeFile(
    path.join(outputDir, `src/App.${config.useTypeScript ? 'tsx' : 'jsx'}`), 
    appContent
  );
  
  // Create index.html
  const htmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${config.projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.${config.useTypeScript ? 'tsx' : 'jsx'}"></script>
  </body>
</html>`;
  
  await fs.writeFile(path.join(outputDir, 'index.html'), htmlContent);
}

/**
 * Generate configuration files based on wizard choices
 */
async function generateWizardConfigurations(outputDir: string, config: any) {
  const fs = require('fs-extra');
  
  // Create vite.config
  const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@domain': path.resolve(__dirname, './src/domain'),
      '@services': path.resolve(__dirname, './src/services'),
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    port: 3000,
    open: true
  }${config.additionalConfig?.apiUrl ? `,
  define: {
    'process.env.API_URL': JSON.stringify('${config.additionalConfig.apiUrl}')
  }` : ''}
})`;
  
  await fs.writeFile(path.join(outputDir, 'vite.config.ts'), viteConfig);
  
  // Create environment configuration if API URL is provided
  if (config.additionalConfig?.apiUrl) {
    const envContent = `# Environment Configuration
# Generated by Archbase CLI Wizard

# API Configuration
VITE_API_URL=${config.additionalConfig.apiUrl}
VITE_API_TIMEOUT=10000

# Authentication
${config.additionalConfig.authentication ? `VITE_AUTH_TYPE=${config.additionalConfig.authentication}` : '# VITE_AUTH_TYPE=jwt'}

# Database (for reference)
${config.additionalConfig.database ? `# DATABASE_TYPE=${config.additionalConfig.database}` : '# DATABASE_TYPE=postgresql'}

# Deployment
${config.additionalConfig.deployment ? `# DEPLOYMENT_TARGET=${config.additionalConfig.deployment}` : '# DEPLOYMENT_TARGET=vercel'}
`;
    
    await fs.writeFile(path.join(outputDir, '.env.example'), envContent);
    await fs.writeFile(path.join(outputDir, '.env.local'), envContent.replace(/^# /gm, ''));
  }
  
  // Create .gitignore
  const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production build
dist/
build/

# Environment variables
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Coverage
coverage/
*.lcov

# Temporary files
*.tmp
*.temp
`;
  
  await fs.writeFile(path.join(outputDir, '.gitignore'), gitignoreContent);
}