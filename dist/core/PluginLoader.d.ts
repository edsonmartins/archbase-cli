/**
 * PluginLoader - Integration layer for loading plugins into CLI
 *
 * Integrates the PluginManager with the main CLI application
 */
import { Command } from 'commander';
import { PluginManager } from './PluginManager';
export declare class PluginLoader {
    private pluginManager;
    private originalGenerators;
    private originalCommands;
    constructor(cliVersion: string, rootPath: string);
    /**
     * Setup original CLI generators
     */
    private setupOriginalGenerators;
    /**
     * Initialize plugin system
     */
    initialize(): Promise<void>;
    /**
     * Shutdown plugin system
     */
    shutdown(): Promise<void>;
    /**
     * Get all available generators (original + plugin)
     */
    getGenerators(): Map<string, any>;
    /**
     * Get all available commands (original + plugin)
     */
    getCommands(): Map<string, Command>;
    /**
     * Get all analyzers
     */
    getAnalyzers(): Map<string, any>;
    /**
     * Get all boilerplates
     */
    getBoilerplates(): Map<string, any>;
    /**
     * Get knowledge base entries
     */
    getKnowledgeBaseEntries(): any[];
    /**
     * Get active plugins
     */
    getActivePlugins(): string[];
    /**
     * Register plugin commands with main program
     */
    registerPluginCommands(program: Command): void;
    /**
     * Check if generator exists (original or plugin)
     */
    hasGenerator(name: string): boolean;
    /**
     * Get generator by name
     */
    getGenerator(name: string): any;
    /**
     * List all available generator names
     */
    listGeneratorNames(): string[];
    /**
     * Get plugin manager instance
     */
    getPluginManager(): PluginManager;
}
//# sourceMappingURL=PluginLoader.d.ts.map