/**
 * PluginLoader - Integration layer for loading plugins into CLI
 * 
 * Integrates the PluginManager with the main CLI application
 */

import { Command } from 'commander';
import { PluginManager } from './PluginManager';
import { FormGenerator } from '../generators/FormGenerator';
import { ViewGenerator } from '../generators/ViewGenerator';
import { NavigationGenerator } from '../generators/NavigationGenerator';
import { DomainGenerator } from '../generators/DomainGenerator';

export class PluginLoader {
  private pluginManager: PluginManager;
  private originalGenerators = new Map<string, any>();
  private originalCommands = new Map<string, Command>();

  constructor(cliVersion: string, rootPath: string) {
    this.pluginManager = new PluginManager(cliVersion, rootPath);
    this.setupOriginalGenerators();
  }

  /**
   * Setup original CLI generators
   */
  private setupOriginalGenerators(): void {
    this.originalGenerators.set('form', FormGenerator);
    this.originalGenerators.set('view', ViewGenerator);
    this.originalGenerators.set('navigation', NavigationGenerator);
    this.originalGenerators.set('domain', DomainGenerator);
  }

  /**
   * Initialize plugin system
   */
  async initialize(): Promise<void> {
    await this.pluginManager.initialize();
  }

  /**
   * Shutdown plugin system
   */
  async shutdown(): Promise<void> {
    await this.pluginManager.shutdown();
  }

  /**
   * Get all available generators (original + plugin)
   */
  getGenerators(): Map<string, any> {
    const allGenerators = new Map(this.originalGenerators);
    
    // Add plugin generators
    const pluginGenerators = this.pluginManager.getGenerators();
    for (const [key, generator] of pluginGenerators) {
      allGenerators.set(key, generator);
    }
    
    return allGenerators;
  }

  /**
   * Get all available commands (original + plugin)
   */
  getCommands(): Map<string, Command> {
    const allCommands = new Map(this.originalCommands);
    
    // Add plugin commands
    const pluginCommands = this.pluginManager.getCommands();
    for (const [key, command] of pluginCommands) {
      allCommands.set(key, command);
    }
    
    return allCommands;
  }

  /**
   * Get all analyzers
   */
  getAnalyzers(): Map<string, any> {
    return this.pluginManager.getAnalyzers();
  }

  /**
   * Get all boilerplates
   */
  getBoilerplates(): Map<string, any> {
    return this.pluginManager.getBoilerplates();
  }

  /**
   * Get knowledge base entries
   */
  getKnowledgeBaseEntries(): any[] {
    return this.pluginManager.getKnowledgeBaseEntries();
  }

  /**
   * Get active plugins
   */
  getActivePlugins(): string[] {
    return this.pluginManager.getActivePlugins();
  }

  /**
   * Register plugin commands with main program
   */
  registerPluginCommands(program: Command): void {
    const pluginCommands = this.pluginManager.getCommands();
    
    for (const [name, command] of pluginCommands) {
      try {
        program.addCommand(command);
      } catch (error) {
        console.warn(`Failed to register plugin command ${name}: ${error.message}`);
      }
    }
  }

  /**
   * Check if generator exists (original or plugin)
   */
  hasGenerator(name: string): boolean {
    return this.originalGenerators.has(name) || 
           this.pluginManager.getGenerators().has(name);
  }

  /**
   * Get generator by name
   */
  getGenerator(name: string): any {
    // Check original generators first
    if (this.originalGenerators.has(name)) {
      return this.originalGenerators.get(name);
    }
    
    // Check plugin generators
    const pluginGenerators = this.pluginManager.getGenerators();
    for (const [key, generator] of pluginGenerators) {
      if (key.endsWith(`:${name}`)) {
        return generator;
      }
    }
    
    return null;
  }

  /**
   * List all available generator names
   */
  listGeneratorNames(): string[] {
    const names = Array.from(this.originalGenerators.keys());
    
    const pluginGenerators = this.pluginManager.getGenerators();
    for (const key of pluginGenerators.keys()) {
      const generatorName = key.split(':')[1];
      if (generatorName && !names.includes(generatorName)) {
        names.push(generatorName);
      }
    }
    
    return names.sort();
  }

  /**
   * Get plugin manager instance
   */
  getPluginManager(): PluginManager {
    return this.pluginManager;
  }
}