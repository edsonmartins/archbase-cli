/**
 * PluginManager - Extensible plugin system for Archbase CLI
 * 
 * Allows extending CLI functionality through:
 * - Custom generators
 * - Custom commands
 * - Custom analyzers
 * - Custom boilerplates
 * - Custom knowledge base entries
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { Command } from 'commander';
import chalk from 'chalk';
import { glob } from 'glob';

export interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  author?: string;
  homepage?: string;
  keywords?: string[];
  archbaseCliVersion?: string;
  engines?: {
    node?: string;
    npm?: string;
  };
}

export interface PluginConfig {
  enabled: boolean;
  config?: Record<string, any>;
  priority?: number;
}

export interface Plugin {
  metadata: PluginMetadata;
  activate(context: PluginContext): Promise<void> | void;
  deactivate?(): Promise<void> | void;
}

export interface PluginContext {
  registerGenerator(name: string, generator: any): void;
  registerCommand(command: Command): void;
  registerAnalyzer(name: string, analyzer: any): void;
  registerBoilerplate(name: string, boilerplate: any): void;
  registerKnowledgeBase(entries: any[]): void;
  getConfig(pluginName: string): any;
  logger: PluginLogger;
  cli: {
    version: string;
    rootPath: string;
    userConfigPath: string;
  };
}

export interface PluginLogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  debug(message: string): void;
}

export interface PluginDiscoveryResult {
  found: PluginDescriptor[];
  errors: Array<{
    path: string;
    error: string;
  }>;
}

export interface PluginDescriptor {
  name: string;
  path: string;
  packageJson: any;
  metadata: PluginMetadata;
  isValid: boolean;
  validationErrors: string[];
}

export class PluginManager {
  private plugins = new Map<string, Plugin>();
  private activePlugins = new Set<string>();
  private generators = new Map<string, any>();
  private commands = new Map<string, Command>();
  private analyzers = new Map<string, any>();
  private boilerplates = new Map<string, any>();
  private knowledgeBaseEntries: any[] = [];
  private config: Record<string, PluginConfig> = {};
  private logger: PluginLogger;

  constructor(private cliVersion: string, private rootPath: string) {
    this.logger = new DefaultPluginLogger();
    this.loadPluginConfig();
  }

  /**
   * Discover plugins from various sources
   */
  async discoverPlugins(): Promise<PluginDiscoveryResult> {
    const found: PluginDescriptor[] = [];
    const errors: Array<{ path: string; error: string }> = [];

    // 1. Local plugins in project
    const localPlugins = await this.discoverLocalPlugins();
    found.push(...localPlugins.found);
    errors.push(...localPlugins.errors);

    // 2. Global npm plugins
    const globalPlugins = await this.discoverGlobalPlugins();
    found.push(...globalPlugins.found);
    errors.push(...globalPlugins.errors);

    // 3. Built-in plugins
    const builtinPlugins = await this.discoverBuiltinPlugins();
    found.push(...builtinPlugins.found);
    errors.push(...builtinPlugins.errors);

    return { found, errors };
  }

  /**
   * Discover plugins in local project
   */
  private async discoverLocalPlugins(): Promise<PluginDiscoveryResult> {
    const found: PluginDescriptor[] = [];
    const errors: Array<{ path: string; error: string }> = [];

    try {
      // Check for plugins in local node_modules
      const pluginPaths = await glob('node_modules/archbase-cli-plugin-*', {
        cwd: process.cwd(),
        absolute: true
      });

      // Check for plugins in .archbase/plugins
      const localPluginDir = path.join(process.cwd(), '.archbase', 'plugins');
      if (await fs.pathExists(localPluginDir)) {
        const localPaths = await glob('*', {
          cwd: localPluginDir,
          absolute: true
        });
        pluginPaths.push(...localPaths);
      }

      for (const pluginPath of pluginPaths) {
        try {
          const descriptor = await this.loadPluginDescriptor(pluginPath);
          if (descriptor) {
            found.push(descriptor);
          }
        } catch (error) {
          errors.push({
            path: pluginPath,
            error: error.message
          });
        }
      }
    } catch (error) {
      errors.push({
        path: 'local discovery',
        error: error.message
      });
    }

    return { found, errors };
  }

  /**
   * Discover globally installed plugins
   */
  private async discoverGlobalPlugins(): Promise<PluginDiscoveryResult> {
    const found: PluginDescriptor[] = [];
    const errors: Array<{ path: string; error: string }> = [];

    try {
      // Try to find global node_modules path
      const { spawn } = require('child_process');
      const globalPath = await new Promise<string>((resolve, reject) => {
        const proc = spawn('npm', ['root', '-g'], { stdio: 'pipe' });
        let output = '';
        
        proc.stdout.on('data', (data: Buffer) => {
          output += data.toString();
        });
        
        proc.on('close', (code: number) => {
          if (code === 0) {
            resolve(output.trim());
          } else {
            reject(new Error('Failed to find global npm path'));
          }
        });
      });

      const globalPluginPaths = await glob('archbase-cli-plugin-*', {
        cwd: globalPath,
        absolute: true
      });

      for (const pluginPath of globalPluginPaths) {
        try {
          const descriptor = await this.loadPluginDescriptor(pluginPath);
          if (descriptor) {
            found.push(descriptor);
          }
        } catch (error) {
          errors.push({
            path: pluginPath,
            error: error.message
          });
        }
      }
    } catch (error) {
      // Global discovery is optional, don't fail completely
      errors.push({
        path: 'global discovery',
        error: error.message
      });
    }

    return { found, errors };
  }

  /**
   * Discover built-in plugins
   */
  private async discoverBuiltinPlugins(): Promise<PluginDiscoveryResult> {
    const found: PluginDescriptor[] = [];
    const errors: Array<{ path: string; error: string }> = [];

    try {
      const builtinPath = path.join(this.rootPath, 'plugins');
      
      if (await fs.pathExists(builtinPath)) {
        const builtinPaths = await glob('*', {
          cwd: builtinPath,
          absolute: true
        });

        for (const pluginPath of builtinPaths) {
          try {
            const descriptor = await this.loadPluginDescriptor(pluginPath);
            if (descriptor) {
              found.push(descriptor);
            }
          } catch (error) {
            errors.push({
              path: pluginPath,
              error: error.message
            });
          }
        }
      }
    } catch (error) {
      errors.push({
        path: 'builtin discovery',
        error: error.message
      });
    }

    return { found, errors };
  }

  /**
   * Load plugin descriptor from path
   */
  private async loadPluginDescriptor(pluginPath: string): Promise<PluginDescriptor | null> {
    if (!await fs.pathExists(pluginPath)) {
      return null;
    }

    const packageJsonPath = path.join(pluginPath, 'package.json');
    if (!await fs.pathExists(packageJsonPath)) {
      return null;
    }

    const packageJson = await fs.readJson(packageJsonPath);
    const validationErrors: string[] = [];

    // Validate plugin structure
    if (!packageJson.name) {
      validationErrors.push('Missing package name');
    }

    if (!packageJson.name?.startsWith('archbase-cli-plugin-')) {
      validationErrors.push('Plugin name must start with "archbase-cli-plugin-"');
    }

    if (!packageJson.main) {
      validationErrors.push('Missing main entry point');
    }

    const mainPath = path.join(pluginPath, packageJson.main);
    if (!await fs.pathExists(mainPath)) {
      validationErrors.push(`Main file not found: ${packageJson.main}`);
    }

    // Extract metadata
    const metadata: PluginMetadata = {
      name: packageJson.name,
      version: packageJson.version || '0.0.0',
      description: packageJson.description || '',
      author: packageJson.author,
      homepage: packageJson.homepage,
      keywords: packageJson.keywords || [],
      archbaseCliVersion: packageJson.archbaseCliVersion || packageJson.peerDependencies?.['@archbase/cli'],
      engines: packageJson.engines
    };

    return {
      name: packageJson.name,
      path: pluginPath,
      packageJson,
      metadata,
      isValid: validationErrors.length === 0,
      validationErrors
    };
  }

  /**
   * Load and activate a plugin
   */
  async loadPlugin(descriptor: PluginDescriptor): Promise<boolean> {
    try {
      if (!descriptor.isValid) {
        this.logger.error(`Cannot load invalid plugin ${descriptor.name}: ${descriptor.validationErrors.join(', ')}`);
        return false;
      }

      const config = this.config[descriptor.name];
      if (config && !config.enabled) {
        this.logger.debug(`Plugin ${descriptor.name} is disabled in config`);
        return false;
      }

      // Load plugin module
      const mainPath = path.join(descriptor.path, descriptor.packageJson.main);
      const pluginModule = require(mainPath);
      
      let plugin: Plugin;
      if (typeof pluginModule === 'function') {
        // Plugin is a factory function
        plugin = pluginModule();
      } else if (pluginModule.default) {
        // ES6 default export
        plugin = typeof pluginModule.default === 'function' 
          ? pluginModule.default() 
          : pluginModule.default;
      } else {
        // Direct plugin object
        plugin = pluginModule;
      }

      if (!plugin || typeof plugin.activate !== 'function') {
        this.logger.error(`Plugin ${descriptor.name} does not export a valid plugin object`);
        return false;
      }

      // Create plugin context
      const context = this.createPluginContext(descriptor.name);

      // Activate plugin
      await plugin.activate(context);
      
      this.plugins.set(descriptor.name, plugin);
      this.activePlugins.add(descriptor.name);
      
      this.logger.info(`Loaded plugin: ${descriptor.name}@${descriptor.metadata.version}`);
      return true;

    } catch (error) {
      this.logger.error(`Failed to load plugin ${descriptor.name}: ${error.message}`);
      return false;
    }
  }

  /**
   * Unload and deactivate a plugin
   */
  async unloadPlugin(pluginName: string): Promise<boolean> {
    try {
      const plugin = this.plugins.get(pluginName);
      if (!plugin) {
        return false;
      }

      // Deactivate plugin
      if (plugin.deactivate) {
        await plugin.deactivate();
      }

      // Remove plugin registrations
      this.generators.delete(pluginName);
      this.commands.delete(pluginName);
      this.analyzers.delete(pluginName);
      this.boilerplates.delete(pluginName);

      // Remove from active plugins
      this.plugins.delete(pluginName);
      this.activePlugins.delete(pluginName);

      this.logger.info(`Unloaded plugin: ${pluginName}`);
      return true;

    } catch (error) {
      this.logger.error(`Failed to unload plugin ${pluginName}: ${error.message}`);
      return false;
    }
  }

  /**
   * Create plugin context
   */
  private createPluginContext(pluginName: string): PluginContext {
    return {
      registerGenerator: (name: string, generator: any) => {
        this.generators.set(`${pluginName}:${name}`, generator);
        this.logger.debug(`Plugin ${pluginName} registered generator: ${name}`);
      },

      registerCommand: (command: Command) => {
        this.commands.set(`${pluginName}:${command.name()}`, command);
        this.logger.debug(`Plugin ${pluginName} registered command: ${command.name()}`);
      },

      registerAnalyzer: (name: string, analyzer: any) => {
        this.analyzers.set(`${pluginName}:${name}`, analyzer);
        this.logger.debug(`Plugin ${pluginName} registered analyzer: ${name}`);
      },

      registerBoilerplate: (name: string, boilerplate: any) => {
        this.boilerplates.set(`${pluginName}:${name}`, boilerplate);
        this.logger.debug(`Plugin ${pluginName} registered boilerplate: ${name}`);
      },

      registerKnowledgeBase: (entries: any[]) => {
        this.knowledgeBaseEntries.push(...entries.map(entry => ({
          ...entry,
          source: pluginName
        })));
        this.logger.debug(`Plugin ${pluginName} registered ${entries.length} knowledge base entries`);
      },

      getConfig: (configPluginName: string) => {
        return this.config[configPluginName]?.config || {};
      },

      logger: this.logger,

      cli: {
        version: this.cliVersion,
        rootPath: this.rootPath,
        userConfigPath: this.getUserConfigPath()
      }
    };
  }

  /**
   * Get registered generators
   */
  getGenerators(): Map<string, any> {
    return new Map(this.generators);
  }

  /**
   * Get registered commands
   */
  getCommands(): Map<string, Command> {
    return new Map(this.commands);
  }

  /**
   * Get registered analyzers
   */
  getAnalyzers(): Map<string, any> {
    return new Map(this.analyzers);
  }

  /**
   * Get registered boilerplates
   */
  getBoilerplates(): Map<string, any> {
    return new Map(this.boilerplates);
  }

  /**
   * Get knowledge base entries
   */
  getKnowledgeBaseEntries(): any[] {
    return [...this.knowledgeBaseEntries];
  }

  /**
   * Get active plugins
   */
  getActivePlugins(): string[] {
    return Array.from(this.activePlugins);
  }

  /**
   * Load plugin configuration
   */
  private loadPluginConfig(): void {
    try {
      const configPath = this.getUserConfigPath();
      const pluginConfigPath = path.join(path.dirname(configPath), 'plugins.json');
      
      if (fs.existsSync(pluginConfigPath)) {
        this.config = fs.readJsonSync(pluginConfigPath);
      }
    } catch (error) {
      this.logger.debug(`Failed to load plugin config: ${error.message}`);
    }
  }

  /**
   * Save plugin configuration
   */
  async savePluginConfig(): Promise<void> {
    try {
      const configPath = this.getUserConfigPath();
      const pluginConfigPath = path.join(path.dirname(configPath), 'plugins.json');
      
      await fs.ensureDir(path.dirname(pluginConfigPath));
      await fs.writeJson(pluginConfigPath, this.config, { spaces: 2 });
    } catch (error) {
      this.logger.error(`Failed to save plugin config: ${error.message}`);
    }
  }

  /**
   * Enable/disable plugin
   */
  async setPluginEnabled(pluginName: string, enabled: boolean): Promise<void> {
    if (!this.config[pluginName]) {
      this.config[pluginName] = { enabled: true };
    }
    
    this.config[pluginName].enabled = enabled;
    await this.savePluginConfig();
  }

  /**
   * Set plugin configuration
   */
  async setPluginConfig(pluginName: string, config: any): Promise<void> {
    if (!this.config[pluginName]) {
      this.config[pluginName] = { enabled: true };
    }
    
    this.config[pluginName].config = config;
    await this.savePluginConfig();
  }

  /**
   * Get user config path
   */
  private getUserConfigPath(): string {
    const os = require('os');
    return path.join(os.homedir(), '.archbase', 'config.json');
  }

  /**
   * Initialize plugin system
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing plugin system...');
    
    const discovery = await this.discoverPlugins();
    
    this.logger.info(`Found ${discovery.found.length} plugins`);
    
    if (discovery.errors.length > 0) {
      this.logger.warn(`Plugin discovery errors: ${discovery.errors.length}`);
      discovery.errors.forEach(error => {
        this.logger.debug(`${error.path}: ${error.error}`);
      });
    }

    // Load valid plugins
    const validPlugins = discovery.found.filter(p => p.isValid);
    let loadedCount = 0;

    for (const plugin of validPlugins) {
      const loaded = await this.loadPlugin(plugin);
      if (loaded) {
        loadedCount++;
      }
    }

    this.logger.info(`Loaded ${loadedCount}/${validPlugins.length} plugins`);
  }

  /**
   * Shutdown plugin system
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down plugin system...');
    
    const pluginNames = Array.from(this.activePlugins);
    for (const pluginName of pluginNames) {
      await this.unloadPlugin(pluginName);
    }
    
    this.logger.info('Plugin system shutdown complete');
  }
}

class DefaultPluginLogger implements PluginLogger {
  info(message: string): void {
    console.log(chalk.blue(`[PLUGIN] ${message}`));
  }

  warn(message: string): void {
    console.log(chalk.yellow(`[PLUGIN] ${message}`));
  }

  error(message: string): void {
    console.log(chalk.red(`[PLUGIN] ${message}`));
  }

  debug(message: string): void {
    if (process.env.DEBUG) {
      console.log(chalk.gray(`[PLUGIN] ${message}`));
    }
  }
}