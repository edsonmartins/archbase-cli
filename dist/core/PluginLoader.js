"use strict";
/**
 * PluginLoader - Integration layer for loading plugins into CLI
 *
 * Integrates the PluginManager with the main CLI application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginLoader = void 0;
const PluginManager_1 = require("./PluginManager");
const FormGenerator_1 = require("../generators/FormGenerator");
const ViewGenerator_1 = require("../generators/ViewGenerator");
const NavigationGenerator_1 = require("../generators/NavigationGenerator");
const DomainGenerator_1 = require("../generators/DomainGenerator");
class PluginLoader {
    constructor(cliVersion, rootPath) {
        this.originalGenerators = new Map();
        this.originalCommands = new Map();
        this.pluginManager = new PluginManager_1.PluginManager(cliVersion, rootPath);
        this.setupOriginalGenerators();
    }
    /**
     * Setup original CLI generators
     */
    setupOriginalGenerators() {
        this.originalGenerators.set('form', FormGenerator_1.FormGenerator);
        this.originalGenerators.set('view', ViewGenerator_1.ViewGenerator);
        this.originalGenerators.set('navigation', NavigationGenerator_1.NavigationGenerator);
        this.originalGenerators.set('domain', DomainGenerator_1.DomainGenerator);
    }
    /**
     * Initialize plugin system
     */
    async initialize() {
        await this.pluginManager.initialize();
    }
    /**
     * Shutdown plugin system
     */
    async shutdown() {
        await this.pluginManager.shutdown();
    }
    /**
     * Get all available generators (original + plugin)
     */
    getGenerators() {
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
    getCommands() {
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
    getAnalyzers() {
        return this.pluginManager.getAnalyzers();
    }
    /**
     * Get all boilerplates
     */
    getBoilerplates() {
        return this.pluginManager.getBoilerplates();
    }
    /**
     * Get knowledge base entries
     */
    getKnowledgeBaseEntries() {
        return this.pluginManager.getKnowledgeBaseEntries();
    }
    /**
     * Get active plugins
     */
    getActivePlugins() {
        return this.pluginManager.getActivePlugins();
    }
    /**
     * Register plugin commands with main program
     */
    registerPluginCommands(program) {
        const pluginCommands = this.pluginManager.getCommands();
        for (const [name, command] of pluginCommands) {
            try {
                program.addCommand(command);
            }
            catch (error) {
                console.warn(`Failed to register plugin command ${name}: ${error.message}`);
            }
        }
    }
    /**
     * Check if generator exists (original or plugin)
     */
    hasGenerator(name) {
        return this.originalGenerators.has(name) ||
            this.pluginManager.getGenerators().has(name);
    }
    /**
     * Get generator by name
     */
    getGenerator(name) {
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
    listGeneratorNames() {
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
    getPluginManager() {
        return this.pluginManager;
    }
}
exports.PluginLoader = PluginLoader;
//# sourceMappingURL=PluginLoader.js.map