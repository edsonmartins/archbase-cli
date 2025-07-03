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
import { Command } from 'commander';
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
export declare class PluginManager {
    private cliVersion;
    private rootPath;
    private plugins;
    private activePlugins;
    private generators;
    private commands;
    private analyzers;
    private boilerplates;
    private knowledgeBaseEntries;
    private config;
    private logger;
    constructor(cliVersion: string, rootPath: string);
    /**
     * Discover plugins from various sources
     */
    discoverPlugins(): Promise<PluginDiscoveryResult>;
    /**
     * Discover plugins in local project
     */
    private discoverLocalPlugins;
    /**
     * Discover globally installed plugins
     */
    private discoverGlobalPlugins;
    /**
     * Discover built-in plugins
     */
    private discoverBuiltinPlugins;
    /**
     * Load plugin descriptor from path
     */
    private loadPluginDescriptor;
    /**
     * Load and activate a plugin
     */
    loadPlugin(descriptor: PluginDescriptor): Promise<boolean>;
    /**
     * Unload and deactivate a plugin
     */
    unloadPlugin(pluginName: string): Promise<boolean>;
    /**
     * Create plugin context
     */
    private createPluginContext;
    /**
     * Get registered generators
     */
    getGenerators(): Map<string, any>;
    /**
     * Get registered commands
     */
    getCommands(): Map<string, Command>;
    /**
     * Get registered analyzers
     */
    getAnalyzers(): Map<string, any>;
    /**
     * Get registered boilerplates
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
     * Load plugin configuration
     */
    private loadPluginConfig;
    /**
     * Save plugin configuration
     */
    savePluginConfig(): Promise<void>;
    /**
     * Enable/disable plugin
     */
    setPluginEnabled(pluginName: string, enabled: boolean): Promise<void>;
    /**
     * Set plugin configuration
     */
    setPluginConfig(pluginName: string, config: any): Promise<void>;
    /**
     * Get user config path
     */
    private getUserConfigPath;
    /**
     * Initialize plugin system
     */
    initialize(): Promise<void>;
    /**
     * Shutdown plugin system
     */
    shutdown(): Promise<void>;
}
//# sourceMappingURL=PluginManager.d.ts.map