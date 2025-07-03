"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginManager = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const glob_1 = require("glob");
class PluginManager {
    constructor(cliVersion, rootPath) {
        this.cliVersion = cliVersion;
        this.rootPath = rootPath;
        this.plugins = new Map();
        this.activePlugins = new Set();
        this.generators = new Map();
        this.commands = new Map();
        this.analyzers = new Map();
        this.boilerplates = new Map();
        this.knowledgeBaseEntries = [];
        this.config = {};
        this.logger = new DefaultPluginLogger();
        this.loadPluginConfig();
    }
    /**
     * Discover plugins from various sources
     */
    async discoverPlugins() {
        const found = [];
        const errors = [];
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
    async discoverLocalPlugins() {
        const found = [];
        const errors = [];
        try {
            // Check for plugins in local node_modules
            const pluginPaths = await (0, glob_1.glob)('node_modules/archbase-cli-plugin-*', {
                cwd: process.cwd(),
                absolute: true
            });
            // Check for plugins in .archbase/plugins
            const localPluginDir = path.join(process.cwd(), '.archbase', 'plugins');
            if (await fs.pathExists(localPluginDir)) {
                const localPaths = await (0, glob_1.glob)('*', {
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
                }
                catch (error) {
                    errors.push({
                        path: pluginPath,
                        error: error.message
                    });
                }
            }
        }
        catch (error) {
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
    async discoverGlobalPlugins() {
        const found = [];
        const errors = [];
        try {
            // Try to find global node_modules path
            const { spawn } = require('child_process');
            const globalPath = await new Promise((resolve, reject) => {
                const proc = spawn('npm', ['root', '-g'], { stdio: 'pipe' });
                let output = '';
                proc.stdout.on('data', (data) => {
                    output += data.toString();
                });
                proc.on('close', (code) => {
                    if (code === 0) {
                        resolve(output.trim());
                    }
                    else {
                        reject(new Error('Failed to find global npm path'));
                    }
                });
            });
            const globalPluginPaths = await (0, glob_1.glob)('archbase-cli-plugin-*', {
                cwd: globalPath,
                absolute: true
            });
            for (const pluginPath of globalPluginPaths) {
                try {
                    const descriptor = await this.loadPluginDescriptor(pluginPath);
                    if (descriptor) {
                        found.push(descriptor);
                    }
                }
                catch (error) {
                    errors.push({
                        path: pluginPath,
                        error: error.message
                    });
                }
            }
        }
        catch (error) {
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
    async discoverBuiltinPlugins() {
        const found = [];
        const errors = [];
        try {
            const builtinPath = path.join(this.rootPath, 'plugins');
            if (await fs.pathExists(builtinPath)) {
                const builtinPaths = await (0, glob_1.glob)('*', {
                    cwd: builtinPath,
                    absolute: true
                });
                for (const pluginPath of builtinPaths) {
                    try {
                        const descriptor = await this.loadPluginDescriptor(pluginPath);
                        if (descriptor) {
                            found.push(descriptor);
                        }
                    }
                    catch (error) {
                        errors.push({
                            path: pluginPath,
                            error: error.message
                        });
                    }
                }
            }
        }
        catch (error) {
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
    async loadPluginDescriptor(pluginPath) {
        if (!await fs.pathExists(pluginPath)) {
            return null;
        }
        const packageJsonPath = path.join(pluginPath, 'package.json');
        if (!await fs.pathExists(packageJsonPath)) {
            return null;
        }
        const packageJson = await fs.readJson(packageJsonPath);
        const validationErrors = [];
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
        const metadata = {
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
    async loadPlugin(descriptor) {
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
            let plugin;
            if (typeof pluginModule === 'function') {
                // Plugin is a factory function
                plugin = pluginModule();
            }
            else if (pluginModule.default) {
                // ES6 default export
                plugin = typeof pluginModule.default === 'function'
                    ? pluginModule.default()
                    : pluginModule.default;
            }
            else {
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
        }
        catch (error) {
            this.logger.error(`Failed to load plugin ${descriptor.name}: ${error.message}`);
            return false;
        }
    }
    /**
     * Unload and deactivate a plugin
     */
    async unloadPlugin(pluginName) {
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
        }
        catch (error) {
            this.logger.error(`Failed to unload plugin ${pluginName}: ${error.message}`);
            return false;
        }
    }
    /**
     * Create plugin context
     */
    createPluginContext(pluginName) {
        return {
            registerGenerator: (name, generator) => {
                this.generators.set(`${pluginName}:${name}`, generator);
                this.logger.debug(`Plugin ${pluginName} registered generator: ${name}`);
            },
            registerCommand: (command) => {
                this.commands.set(`${pluginName}:${command.name()}`, command);
                this.logger.debug(`Plugin ${pluginName} registered command: ${command.name()}`);
            },
            registerAnalyzer: (name, analyzer) => {
                this.analyzers.set(`${pluginName}:${name}`, analyzer);
                this.logger.debug(`Plugin ${pluginName} registered analyzer: ${name}`);
            },
            registerBoilerplate: (name, boilerplate) => {
                this.boilerplates.set(`${pluginName}:${name}`, boilerplate);
                this.logger.debug(`Plugin ${pluginName} registered boilerplate: ${name}`);
            },
            registerKnowledgeBase: (entries) => {
                this.knowledgeBaseEntries.push(...entries.map(entry => ({
                    ...entry,
                    source: pluginName
                })));
                this.logger.debug(`Plugin ${pluginName} registered ${entries.length} knowledge base entries`);
            },
            getConfig: (configPluginName) => {
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
    getGenerators() {
        return new Map(this.generators);
    }
    /**
     * Get registered commands
     */
    getCommands() {
        return new Map(this.commands);
    }
    /**
     * Get registered analyzers
     */
    getAnalyzers() {
        return new Map(this.analyzers);
    }
    /**
     * Get registered boilerplates
     */
    getBoilerplates() {
        return new Map(this.boilerplates);
    }
    /**
     * Get knowledge base entries
     */
    getKnowledgeBaseEntries() {
        return [...this.knowledgeBaseEntries];
    }
    /**
     * Get active plugins
     */
    getActivePlugins() {
        return Array.from(this.activePlugins);
    }
    /**
     * Load plugin configuration
     */
    loadPluginConfig() {
        try {
            const configPath = this.getUserConfigPath();
            const pluginConfigPath = path.join(path.dirname(configPath), 'plugins.json');
            if (fs.existsSync(pluginConfigPath)) {
                this.config = fs.readJsonSync(pluginConfigPath);
            }
        }
        catch (error) {
            this.logger.debug(`Failed to load plugin config: ${error.message}`);
        }
    }
    /**
     * Save plugin configuration
     */
    async savePluginConfig() {
        try {
            const configPath = this.getUserConfigPath();
            const pluginConfigPath = path.join(path.dirname(configPath), 'plugins.json');
            await fs.ensureDir(path.dirname(pluginConfigPath));
            await fs.writeJson(pluginConfigPath, this.config, { spaces: 2 });
        }
        catch (error) {
            this.logger.error(`Failed to save plugin config: ${error.message}`);
        }
    }
    /**
     * Enable/disable plugin
     */
    async setPluginEnabled(pluginName, enabled) {
        if (!this.config[pluginName]) {
            this.config[pluginName] = { enabled: true };
        }
        this.config[pluginName].enabled = enabled;
        await this.savePluginConfig();
    }
    /**
     * Set plugin configuration
     */
    async setPluginConfig(pluginName, config) {
        if (!this.config[pluginName]) {
            this.config[pluginName] = { enabled: true };
        }
        this.config[pluginName].config = config;
        await this.savePluginConfig();
    }
    /**
     * Get user config path
     */
    getUserConfigPath() {
        const os = require('os');
        return path.join(os.homedir(), '.archbase', 'config.json');
    }
    /**
     * Initialize plugin system
     */
    async initialize() {
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
    async shutdown() {
        this.logger.info('Shutting down plugin system...');
        const pluginNames = Array.from(this.activePlugins);
        for (const pluginName of pluginNames) {
            await this.unloadPlugin(pluginName);
        }
        this.logger.info('Plugin system shutdown complete');
    }
}
exports.PluginManager = PluginManager;
class DefaultPluginLogger {
    info(message) {
        console.log(chalk_1.default.blue(`[PLUGIN] ${message}`));
    }
    warn(message) {
        console.log(chalk_1.default.yellow(`[PLUGIN] ${message}`));
    }
    error(message) {
        console.log(chalk_1.default.red(`[PLUGIN] ${message}`));
    }
    debug(message) {
        if (process.env.DEBUG) {
            console.log(chalk_1.default.gray(`[PLUGIN] ${message}`));
        }
    }
}
//# sourceMappingURL=PluginManager.js.map