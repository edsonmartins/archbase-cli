/**
 * BoilerplateGenerator - Generate complete projects from boilerplates
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import Handlebars from 'handlebars';
import { glob } from 'glob';
import inquirer from 'inquirer';
import { RemoteBoilerplateManager, RemoteBoilerplateOptions } from './RemoteBoilerplateManager';

interface BoilerplateConfig {
  name: string;
  version: string;
  description: string;
  category?: string;
  features: Record<string, any>;
  prompts: PromptConfig[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
  customization: Record<string, any>;
}

interface PromptConfig {
  name: string;
  message: string;
  type: 'input' | 'select' | 'multiselect' | 'confirm';
  choices?: Array<{ name: string; message: string; checked?: boolean }>;
  default?: any;
  validate?: string;
}

interface GenerationContext {
  projectName: string;
  answers: Record<string, any>;
  config: BoilerplateConfig;
  features: string[];
  outputPath: string;
}

interface GenerationResult {
  success: boolean;
  projectPath?: string;
  files?: string[];
  errors?: string[];
}

export class BoilerplateGenerator {
  private boilerplatesPath: string;
  private remoteManager: RemoteBoilerplateManager;

  constructor(boilerplatesPath: string = path.join(__dirname, '../boilerplates')) {
    this.boilerplatesPath = boilerplatesPath;
    this.remoteManager = new RemoteBoilerplateManager();
    this.registerHandlebarsHelpers();
  }

  private registerHandlebarsHelpers() {
    // Helper to check if array includes value
    Handlebars.registerHelper('includes', function(array: any[], value: any) {
      return Array.isArray(array) && array.includes(value);
    });

    // Helper for conditional logic
    Handlebars.registerHelper('eq', function(a: any, b: any) {
      return a === b;
    });

    // Helper for joining arrays
    Handlebars.registerHelper('join', function(array: any[], separator: string = ', ') {
      return Array.isArray(array) ? array.join(separator) : '';
    });

    // Helper for uppercase
    Handlebars.registerHelper('uppercase', function(str: string) {
      return str.toUpperCase();
    });

    // Helper for lowercase
    Handlebars.registerHelper('lowercase', function(str: string) {
      return str.toLowerCase();
    });

    // Helper for capitalizing first letter
    Handlebars.registerHelper('capitalize', function(str: string) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    });
  }

  async listBoilerplates(): Promise<string[]> {
    try {
      const boilerplates = await fs.readdir(this.boilerplatesPath);
      const validBoilerplates: string[] = [];

      for (const name of boilerplates) {
        const configPath = path.join(this.boilerplatesPath, name, 'config.json');
        if (await fs.pathExists(configPath)) {
          validBoilerplates.push(name);
        }
      }

      return validBoilerplates;
    } catch (error) {
      console.warn('Failed to list boilerplates:', error.message);
      return [];
    }
  }

  async getBoilerplateConfig(name: string): Promise<BoilerplateConfig | null> {
    try {
      const configPath = path.join(this.boilerplatesPath, name, 'config.json');
      
      if (!await fs.pathExists(configPath)) {
        throw new Error(`Boilerplate config not found: ${configPath}`);
      }

      const config = await fs.readJson(configPath);
      return config;
    } catch (error) {
      console.error(`Failed to load boilerplate config for ${name}:`, error.message);
      return null;
    }
  }

  async generateProject(
    boilerplateName: string, 
    projectName: string,
    outputDir: string,
    answers?: Record<string, any>
  ): Promise<GenerationResult> {
    try {
      // Load boilerplate config
      const config = await this.getBoilerplateConfig(boilerplateName);
      if (!config) {
        return {
          success: false,
          errors: [`Boilerplate '${boilerplateName}' not found`]
        };
      }

      // Create output directory
      const projectPath = path.join(outputDir, projectName);
      
      if (await fs.pathExists(projectPath)) {
        return {
          success: false,
          errors: [`Directory already exists: ${projectPath}`]
        };
      }

      await fs.ensureDir(projectPath);

      // Get user answers (if not provided)
      const userAnswers = answers || await this.promptUser(config);

      // Build generation context
      const context: GenerationContext = {
        projectName,
        answers: { projectName, ...userAnswers },
        config,
        features: userAnswers.features || [],
        outputPath: projectPath
      };

      // Generate project files
      const files = await this.generateFiles(boilerplateName, context);

      // Run post-generation hooks
      await this.runHooks(boilerplateName, context, 'post-install');

      return {
        success: true,
        projectPath,
        files
      };

    } catch (error) {
      return {
        success: false,
        errors: [error.message]
      };
    }
  }

  private async promptUser(config: BoilerplateConfig): Promise<Record<string, any>> {
    const questions = config.prompts.map(prompt => ({
      type: prompt.type === 'multiselect' ? 'checkbox' : prompt.type,
      name: prompt.name,
      message: prompt.message,
      choices: prompt.choices,
      default: prompt.default,
      validate: prompt.validate ? this.createValidator(prompt.validate) : undefined
    }));

    return await inquirer.prompt(questions);
  }

  private createValidator(rule: string) {
    return (input: any) => {
      const rules = rule.split('|');
      
      for (const r of rules) {
        switch (r) {
          case 'required':
            if (!input || input.trim() === '') {
              return 'This field is required';
            }
            break;
          case 'alphanumeric':
            if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
              return 'Only alphanumeric characters, hyphens and underscores allowed';
            }
            break;
        }
      }
      
      return true;
    };
  }

  private async generateFiles(boilerplateName: string, context: GenerationContext): Promise<string[]> {
    const templatePath = path.join(this.boilerplatesPath, boilerplateName, 'template');
    const generatedFiles: string[] = [];

    // Get all template files
    const pattern = path.join(templatePath, '**', '*');
    const files = await glob(pattern, { 
      nodir: true,
      dot: true 
    });

    for (const file of files) {
      const relativePath = path.relative(templatePath, file);
      const isHandlebarsTemplate = file.endsWith('.hbs');
      
      // Determine output path (remove .hbs extension)
      const outputPath = path.join(
        context.outputPath, 
        isHandlebarsTemplate ? relativePath.replace('.hbs', '') : relativePath
      );

      await fs.ensureDir(path.dirname(outputPath));

      if (isHandlebarsTemplate) {
        // Process Handlebars template
        const templateContent = await fs.readFile(file, 'utf-8');
        const template = Handlebars.compile(templateContent);
        const renderedContent = template({
          ...context.answers,
          ...context.config.customization,
          features: context.features
        });

        await fs.writeFile(outputPath, renderedContent);
      } else {
        // Copy file as-is
        await fs.copy(file, outputPath);
      }

      generatedFiles.push(outputPath);
    }

    return generatedFiles;
  }

  private async runHooks(
    boilerplateName: string, 
    context: GenerationContext, 
    hookName: string
  ): Promise<void> {
    try {
      const hookPath = path.join(this.boilerplatesPath, boilerplateName, 'hooks', `${hookName}.js`);
      
      if (await fs.pathExists(hookPath)) {
        const hook = require(hookPath);
        
        if (typeof hook === 'function') {
          await hook(context);
        } else if (hook.default && typeof hook.default === 'function') {
          await hook.default(context);
        }
      }
    } catch (error) {
      console.warn(`Hook ${hookName} failed:`, error.message);
    }
  }

  async validateBoilerplate(name: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      const boilerplatePath = path.join(this.boilerplatesPath, name);
      
      // Check if directory exists
      if (!await fs.pathExists(boilerplatePath)) {
        errors.push(`Boilerplate directory not found: ${boilerplatePath}`);
        return { valid: false, errors };
      }

      // Check config.json
      const configPath = path.join(boilerplatePath, 'config.json');
      if (!await fs.pathExists(configPath)) {
        errors.push('Missing config.json file');
      } else {
        try {
          const config = await fs.readJson(configPath);
          if (!config.name || !config.description) {
            errors.push('Config missing required fields (name, description)');
          }
        } catch (e) {
          errors.push('Invalid config.json format');
        }
      }

      // Check template directory
      const templatePath = path.join(boilerplatePath, 'template');
      if (!await fs.pathExists(templatePath)) {
        errors.push('Missing template directory');
      }

    } catch (error) {
      errors.push(`Validation error: ${error.message}`);
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Generate project from remote boilerplate
   */
  async generateFromRemote(
    projectName: string,
    remoteOptions: RemoteBoilerplateOptions,
    outputDir: string,
    answers?: Record<string, any>
  ): Promise<GenerationResult> {
    try {
      // Download remote boilerplate
      const boilerplatePath = await this.remoteManager.downloadBoilerplate(remoteOptions);
      
      // Load configuration
      const config = await this.loadRemoteConfig(boilerplatePath);
      
      // Get user input if not provided
      const finalAnswers = answers || await this.promptForAnswers(config.prompts);
      
      // Create generation context
      const context: GenerationContext = {
        projectName,
        answers: { projectName, ...finalAnswers },
        config,
        features: this.extractFeaturesFromAnswers(finalAnswers, config),
        outputPath: path.join(outputDir, projectName)
      };
      
      // Ensure output directory
      await fs.ensureDir(context.outputPath);
      
      // Generate files from remote template
      const generatedFiles = await this.generateRemoteFiles(boilerplatePath, context);
      
      // Run post-install hooks if they exist
      await this.runRemoteHooks(boilerplatePath, context);
      
      return {
        success: true,
        projectPath: context.outputPath,
        files: generatedFiles
      };
      
    } catch (error) {
      return {
        success: false,
        errors: [error.message]
      };
    }
  }
  
  /**
   * Prompt for answers using config prompts
   */
  private async promptForAnswers(prompts: PromptConfig[]): Promise<Record<string, any>> {
    if (!prompts || prompts.length === 0) {
      return {};
    }
    
    const questions = prompts.map(prompt => ({
      type: prompt.type === 'multiselect' ? 'checkbox' : prompt.type,
      name: prompt.name,
      message: prompt.message,
      choices: prompt.choices,
      default: prompt.default,
      validate: prompt.validate ? this.createValidator(prompt.validate) : undefined
    }));

    return await inquirer.prompt(questions);
  }
  
  /**
   * Extract features from user answers
   */
  private extractFeaturesFromAnswers(answers: Record<string, any>, config: BoilerplateConfig): string[] {
    // If answers have a features array, use it
    if (answers.features && Array.isArray(answers.features)) {
      return answers.features;
    }
    
    // Extract features from boolean answers
    const features: string[] = [];
    for (const [key, value] of Object.entries(answers)) {
      if (typeof value === 'boolean' && value === true) {
        features.push(key);
      }
    }
    
    // Add default features from config
    if (config.features) {
      for (const [feature, enabled] of Object.entries(config.features)) {
        if (enabled && !features.includes(feature)) {
          features.push(feature);
        }
      }
    }
    
    return features;
  }
  
  /**
   * Load configuration from remote boilerplate
   */
  private async loadRemoteConfig(boilerplatePath: string): Promise<BoilerplateConfig> {
    // Try archbase.config.json first
    const archbaseConfigPath = path.join(boilerplatePath, 'archbase.config.json');
    if (await fs.pathExists(archbaseConfigPath)) {
      return fs.readJson(archbaseConfigPath);
    }
    
    // Try config.json (our standard)
    const configPath = path.join(boilerplatePath, 'config.json');
    if (await fs.pathExists(configPath)) {
      return fs.readJson(configPath);
    }
    
    // Fallback: generate basic config from package.json
    const packageJsonPath = path.join(boilerplatePath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      
      return {
        name: packageJson.name || 'remote-boilerplate',
        version: packageJson.version || '1.0.0',
        description: packageJson.description || 'Remote boilerplate',
        features: {},
        prompts: [
          {
            name: 'projectName',
            message: 'Project name:',
            type: 'input',
            default: 'my-project'
          },
          {
            name: 'projectDescription',
            message: 'Project description:',
            type: 'input',
            default: packageJson.description || 'Generated project'
          }
        ],
        dependencies: packageJson.dependencies || {},
        devDependencies: packageJson.devDependencies || {},
        scripts: packageJson.scripts || {},
        customization: {}
      };
    }
    
    throw new Error('No valid configuration found in remote boilerplate');
  }
  
  /**
   * Generate files from remote boilerplate
   */
  private async generateRemoteFiles(boilerplatePath: string, context: GenerationContext): Promise<string[]> {
    // Check if boilerplate has a template directory
    const templatePath = path.join(boilerplatePath, 'template');
    const sourcePath = await fs.pathExists(templatePath) ? templatePath : boilerplatePath;
    
    const generatedFiles: string[] = [];
    
    // Get all files
    const pattern = path.join(sourcePath, '**', '*');
    const files = await glob(pattern, { 
      nodir: true,
      dot: true,
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.git/**',
        '**/config.json',
        '**/archbase.config.json',
        '**/hooks/**',
        '**/.archbase-metadata.json'
      ]
    });
    
    for (const file of files) {
      const relativePath = path.relative(sourcePath, file);
      const isHandlebarsTemplate = file.endsWith('.hbs');
      
      // Determine output path (remove .hbs extension)
      const outputPath = path.join(
        context.outputPath, 
        isHandlebarsTemplate ? relativePath.replace('.hbs', '') : relativePath
      );
      
      await fs.ensureDir(path.dirname(outputPath));
      
      if (isHandlebarsTemplate) {
        // Process Handlebars template
        const templateContent = await fs.readFile(file, 'utf-8');
        const template = Handlebars.compile(templateContent);
        const renderedContent = template({
          ...context.answers,
          features: context.features,
          config: context.config
        });
        
        await fs.writeFile(outputPath, renderedContent);
      } else {
        // Copy file as-is
        await fs.copy(file, outputPath);
      }
      
      generatedFiles.push(outputPath);
    }
    
    return generatedFiles;
  }
  
  /**
   * Run hooks from remote boilerplate
   */
  private async runRemoteHooks(boilerplatePath: string, context: GenerationContext): Promise<void> {
    const hooksPath = path.join(boilerplatePath, 'hooks');
    
    if (!await fs.pathExists(hooksPath)) {
      return;
    }
    
    // Look for setup script
    const setupScripts = ['setup.js', 'post-install.js', 'setup.sh'];
    
    for (const scriptName of setupScripts) {
      const scriptPath = path.join(hooksPath, scriptName);
      
      if (await fs.pathExists(scriptPath)) {
        try {
          // Set up environment variables for the script
          const env = {
            ...process.env,
            PROJECT_NAME: context.projectName,
            PROJECT_PATH: context.outputPath,
            ARCHBASE_ANSWERS: JSON.stringify(context.answers)
          };
          
          // Execute the script in the project directory
          const { execSync } = require('child_process');
          execSync(`node "${scriptPath}"`, {
            cwd: context.outputPath,
            env,
            stdio: 'inherit'
          });
          
          break; // Only run the first found script
        } catch (error) {
          console.warn(`Warning: Failed to run setup script: ${error.message}`);
        }
      }
    }
  }

  async createBoilerplateFromProject(
    projectPath: string,
    boilerplateName: string,
    config: Partial<BoilerplateConfig>
  ): Promise<GenerationResult> {
    try {
      const outputPath = path.join(this.boilerplatesPath, boilerplateName);
      
      if (await fs.pathExists(outputPath)) {
        return {
          success: false,
          errors: [`Boilerplate '${boilerplateName}' already exists`]
        };
      }

      // Create boilerplate structure
      await fs.ensureDir(path.join(outputPath, 'template'));
      await fs.ensureDir(path.join(outputPath, 'hooks'));
      await fs.ensureDir(path.join(outputPath, 'docs'));

      // Copy project files to template
      await fs.copy(projectPath, path.join(outputPath, 'template'));

      // Create config.json
      const fullConfig: BoilerplateConfig = {
        name: boilerplateName,
        version: '1.0.0',
        description: '',
        features: {},
        prompts: [],
        dependencies: {},
        devDependencies: {},
        scripts: {},
        customization: {},
        ...config
      };

      await fs.writeJson(path.join(outputPath, 'config.json'), fullConfig, { spaces: 2 });

      return {
        success: true,
        projectPath: outputPath,
        files: [path.join(outputPath, 'config.json')]
      };

    } catch (error) {
      return {
        success: false,
        errors: [error.message]
      };
    }
  }

  /**
   * List boilerplates from multiple sources
   */
  async listAllBoilerplates(): Promise<{builtin: string[], custom: string[]}> {
    const builtin = await this.listBoilerplates();
    
    // Check for custom boilerplates in user directory
    const userBoilerplatesPath = path.join(require('os').homedir(), '.archbase', 'boilerplates');
    let custom: string[] = [];
    
    if (await fs.pathExists(userBoilerplatesPath)) {
      const customGenerator = new BoilerplateGenerator(userBoilerplatesPath);
      custom = await customGenerator.listBoilerplates();
    }
    
    return { builtin, custom };
  }

  /**
   * Get boilerplate info with source indication
   */
  async getBoilerplateInfo(name: string): Promise<{config: BoilerplateConfig | null, source: 'builtin' | 'custom' | null}> {
    // Try builtin first
    let config = await this.getBoilerplateConfig(name);
    if (config) {
      return { config, source: 'builtin' };
    }
    
    // Try custom
    const userBoilerplatesPath = path.join(require('os').homedir(), '.archbase', 'boilerplates');
    if (await fs.pathExists(userBoilerplatesPath)) {
      const customGenerator = new BoilerplateGenerator(userBoilerplatesPath);
      config = await customGenerator.getBoilerplateConfig(name);
      if (config) {
        return { config, source: 'custom' };
      }
    }
    
    return { config: null, source: null };
  }

  /**
   * Generate from any boilerplate source
   */
  async generateFromAnySource(
    boilerplateName: string,
    projectName: string,
    outputDir: string,
    answers?: Record<string, any>
  ): Promise<GenerationResult> {
    const info = await this.getBoilerplateInfo(boilerplateName);
    
    if (!info.config) {
      return {
        success: false,
        errors: [`Boilerplate '${boilerplateName}' not found`]
      };
    }
    
    if (info.source === 'custom') {
      const userBoilerplatesPath = path.join(require('os').homedir(), '.archbase', 'boilerplates');
      const customGenerator = new BoilerplateGenerator(userBoilerplatesPath);
      return await customGenerator.generateProject(boilerplateName, projectName, outputDir, answers);
    } else {
      return await this.generateProject(boilerplateName, projectName, outputDir, answers);
    }
  }

  /**
   * Export boilerplate for sharing
   */
  async exportBoilerplate(
    name: string,
    outputPath: string,
    format: 'zip' | 'tar' = 'zip'
  ): Promise<GenerationResult> {
    try {
      const info = await this.getBoilerplateInfo(name);
      
      if (!info.config) {
        return {
          success: false,
          errors: [`Boilerplate '${name}' not found`]
        };
      }
      
      const sourcePath = info.source === 'custom' 
        ? path.join(require('os').homedir(), '.archbase', 'boilerplates', name)
        : path.join(this.boilerplatesPath, name);
      
      // Create temporary export directory
      const tempDir = path.join(require('os').tmpdir(), `archbase-export-${Date.now()}`);
      await fs.ensureDir(tempDir);
      
      // Copy boilerplate to temp directory
      const exportDir = path.join(tempDir, name);
      await fs.copy(sourcePath, exportDir);
      
      // Create export metadata
      const metadata = {
        name: info.config.name,
        version: info.config.version,
        description: info.config.description,
        exportedAt: new Date().toISOString(),
        exportedBy: 'Archbase CLI',
        source: info.source
      };
      
      await fs.writeJson(path.join(exportDir, '.export-metadata.json'), metadata, { spaces: 2 });
      
      // Create archive based on format
      if (format === 'zip') {
        // For now, just copy the directory structure
        // In production, would use archiver or similar for actual ZIP creation
        await fs.copy(exportDir, outputPath);
      } else {
        // TAR format would be implemented similarly
        await fs.copy(exportDir, outputPath);
      }
      
      // Cleanup temp directory
      await fs.remove(tempDir);
      
      return {
        success: true,
        projectPath: outputPath,
        files: [outputPath]
      };
      
    } catch (error) {
      return {
        success: false,
        errors: [error.message]
      };
    }
  }

  /**
   * Import boilerplate from exported archive
   */
  async importBoilerplate(
    archivePath: string,
    targetName?: string
  ): Promise<GenerationResult> {
    try {
      if (!await fs.pathExists(archivePath)) {
        return {
          success: false,
          errors: ['Archive path does not exist']
        };
      }
      
      // Read metadata if available
      const metadataPath = path.join(archivePath, '.export-metadata.json');
      let metadata: any = {};
      
      if (await fs.pathExists(metadataPath)) {
        metadata = await fs.readJson(metadataPath);
      }
      
      const boilerplateName = targetName || metadata.name || path.basename(archivePath);
      const userBoilerplatesPath = path.join(require('os').homedir(), '.archbase', 'boilerplates');
      const targetPath = path.join(userBoilerplatesPath, boilerplateName);
      
      if (await fs.pathExists(targetPath)) {
        return {
          success: false,
          errors: [`Boilerplate '${boilerplateName}' already exists`]
        };
      }
      
      await fs.ensureDir(userBoilerplatesPath);
      await fs.copy(archivePath, targetPath);
      
      // Remove export metadata from imported boilerplate
      const importedMetadataPath = path.join(targetPath, '.export-metadata.json');
      if (await fs.pathExists(importedMetadataPath)) {
        await fs.remove(importedMetadataPath);
      }
      
      return {
        success: true,
        projectPath: targetPath,
        files: [targetPath]
      };
      
    } catch (error) {
      return {
        success: false,
        errors: [error.message]
      };
    }
  }
}