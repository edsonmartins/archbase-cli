"use strict";
/**
 * BoilerplateGenerator - Generate complete projects from boilerplates
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
exports.BoilerplateGenerator = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
const glob_1 = require("glob");
const inquirer_1 = __importDefault(require("inquirer"));
const RemoteBoilerplateManager_1 = require("./RemoteBoilerplateManager");
class BoilerplateGenerator {
    constructor(boilerplatesPath = path.join(__dirname, '../boilerplates')) {
        this.boilerplatesPath = boilerplatesPath;
        this.remoteManager = new RemoteBoilerplateManager_1.RemoteBoilerplateManager();
        this.registerHandlebarsHelpers();
    }
    registerHandlebarsHelpers() {
        // Helper to check if array includes value
        handlebars_1.default.registerHelper('includes', function (array, value) {
            return Array.isArray(array) && array.includes(value);
        });
        // Helper for conditional logic
        handlebars_1.default.registerHelper('eq', function (a, b) {
            return a === b;
        });
        // Helper for joining arrays
        handlebars_1.default.registerHelper('join', function (array, separator = ', ') {
            return Array.isArray(array) ? array.join(separator) : '';
        });
        // Helper for uppercase
        handlebars_1.default.registerHelper('uppercase', function (str) {
            return str.toUpperCase();
        });
        // Helper for lowercase
        handlebars_1.default.registerHelper('lowercase', function (str) {
            return str.toLowerCase();
        });
        // Helper for capitalizing first letter
        handlebars_1.default.registerHelper('capitalize', function (str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        });
    }
    async listBoilerplates() {
        try {
            const boilerplates = await fs.readdir(this.boilerplatesPath);
            const validBoilerplates = [];
            for (const name of boilerplates) {
                const configPath = path.join(this.boilerplatesPath, name, 'config.json');
                if (await fs.pathExists(configPath)) {
                    validBoilerplates.push(name);
                }
            }
            return validBoilerplates;
        }
        catch (error) {
            console.warn('Failed to list boilerplates:', error.message);
            return [];
        }
    }
    async getBoilerplateConfig(name) {
        try {
            const configPath = path.join(this.boilerplatesPath, name, 'config.json');
            if (!await fs.pathExists(configPath)) {
                throw new Error(`Boilerplate config not found: ${configPath}`);
            }
            const config = await fs.readJson(configPath);
            return config;
        }
        catch (error) {
            console.error(`Failed to load boilerplate config for ${name}:`, error.message);
            return null;
        }
    }
    async generateProject(boilerplateName, projectName, outputDir, answers) {
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
            const context = {
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
        }
        catch (error) {
            return {
                success: false,
                errors: [error.message]
            };
        }
    }
    async promptUser(config) {
        const questions = config.prompts.map(prompt => ({
            type: prompt.type === 'multiselect' ? 'checkbox' : prompt.type,
            name: prompt.name,
            message: prompt.message,
            choices: prompt.choices,
            default: prompt.default,
            validate: prompt.validate ? this.createValidator(prompt.validate) : undefined
        }));
        return await inquirer_1.default.prompt(questions);
    }
    createValidator(rule) {
        return (input) => {
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
    async generateFiles(boilerplateName, context) {
        const templatePath = path.join(this.boilerplatesPath, boilerplateName, 'template');
        const generatedFiles = [];
        // Get all template files
        const pattern = path.join(templatePath, '**', '*');
        const files = await (0, glob_1.glob)(pattern, {
            nodir: true,
            dot: true
        });
        for (const file of files) {
            const relativePath = path.relative(templatePath, file);
            const isHandlebarsTemplate = file.endsWith('.hbs');
            // Determine output path (remove .hbs extension)
            const outputPath = path.join(context.outputPath, isHandlebarsTemplate ? relativePath.replace('.hbs', '') : relativePath);
            await fs.ensureDir(path.dirname(outputPath));
            if (isHandlebarsTemplate) {
                // Process Handlebars template
                const templateContent = await fs.readFile(file, 'utf-8');
                const template = handlebars_1.default.compile(templateContent);
                const renderedContent = template({
                    ...context.answers,
                    ...context.config.customization,
                    features: context.features
                });
                await fs.writeFile(outputPath, renderedContent);
            }
            else {
                // Copy file as-is
                await fs.copy(file, outputPath);
            }
            generatedFiles.push(outputPath);
        }
        return generatedFiles;
    }
    async runHooks(boilerplateName, context, hookName) {
        try {
            const hookPath = path.join(this.boilerplatesPath, boilerplateName, 'hooks', `${hookName}.js`);
            if (await fs.pathExists(hookPath)) {
                const hook = require(hookPath);
                if (typeof hook === 'function') {
                    await hook(context);
                }
                else if (hook.default && typeof hook.default === 'function') {
                    await hook.default(context);
                }
            }
        }
        catch (error) {
            console.warn(`Hook ${hookName} failed:`, error.message);
        }
    }
    async validateBoilerplate(name) {
        const errors = [];
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
            }
            else {
                try {
                    const config = await fs.readJson(configPath);
                    if (!config.name || !config.description) {
                        errors.push('Config missing required fields (name, description)');
                    }
                }
                catch (e) {
                    errors.push('Invalid config.json format');
                }
            }
            // Check template directory
            const templatePath = path.join(boilerplatePath, 'template');
            if (!await fs.pathExists(templatePath)) {
                errors.push('Missing template directory');
            }
        }
        catch (error) {
            errors.push(`Validation error: ${error.message}`);
        }
        return { valid: errors.length === 0, errors };
    }
    /**
     * Generate project from remote boilerplate
     */
    async generateFromRemote(projectName, remoteOptions, outputDir, answers) {
        try {
            // Download remote boilerplate
            const boilerplatePath = await this.remoteManager.downloadBoilerplate(remoteOptions);
            // Load configuration
            const config = await this.loadRemoteConfig(boilerplatePath);
            // Get user input if not provided
            const finalAnswers = answers || await this.promptForAnswers(config.prompts);
            // Create generation context
            const context = {
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
        }
        catch (error) {
            return {
                success: false,
                errors: [error.message]
            };
        }
    }
    /**
     * Prompt for answers using config prompts
     */
    async promptForAnswers(prompts) {
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
        return await inquirer_1.default.prompt(questions);
    }
    /**
     * Extract features from user answers
     */
    extractFeaturesFromAnswers(answers, config) {
        // If answers have a features array, use it
        if (answers.features && Array.isArray(answers.features)) {
            return answers.features;
        }
        // Extract features from boolean answers
        const features = [];
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
    async loadRemoteConfig(boilerplatePath) {
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
    async generateRemoteFiles(boilerplatePath, context) {
        // Check if boilerplate has a template directory
        const templatePath = path.join(boilerplatePath, 'template');
        const sourcePath = await fs.pathExists(templatePath) ? templatePath : boilerplatePath;
        const generatedFiles = [];
        // Get all files
        const pattern = path.join(sourcePath, '**', '*');
        const files = await (0, glob_1.glob)(pattern, {
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
            const outputPath = path.join(context.outputPath, isHandlebarsTemplate ? relativePath.replace('.hbs', '') : relativePath);
            await fs.ensureDir(path.dirname(outputPath));
            if (isHandlebarsTemplate) {
                // Process Handlebars template
                const templateContent = await fs.readFile(file, 'utf-8');
                const template = handlebars_1.default.compile(templateContent);
                const renderedContent = template({
                    ...context.answers,
                    features: context.features,
                    config: context.config
                });
                await fs.writeFile(outputPath, renderedContent);
            }
            else {
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
    async runRemoteHooks(boilerplatePath, context) {
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
                }
                catch (error) {
                    console.warn(`Warning: Failed to run setup script: ${error.message}`);
                }
            }
        }
    }
    async createBoilerplateFromProject(projectPath, boilerplateName, config) {
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
            const fullConfig = {
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
        }
        catch (error) {
            return {
                success: false,
                errors: [error.message]
            };
        }
    }
    /**
     * List boilerplates from multiple sources
     */
    async listAllBoilerplates() {
        const builtin = await this.listBoilerplates();
        // Check for custom boilerplates in user directory
        const userBoilerplatesPath = path.join(require('os').homedir(), '.archbase', 'boilerplates');
        let custom = [];
        if (await fs.pathExists(userBoilerplatesPath)) {
            const customGenerator = new BoilerplateGenerator(userBoilerplatesPath);
            custom = await customGenerator.listBoilerplates();
        }
        return { builtin, custom };
    }
    /**
     * Get boilerplate info with source indication
     */
    async getBoilerplateInfo(name) {
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
    async generateFromAnySource(boilerplateName, projectName, outputDir, answers) {
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
        }
        else {
            return await this.generateProject(boilerplateName, projectName, outputDir, answers);
        }
    }
    /**
     * Export boilerplate for sharing
     */
    async exportBoilerplate(name, outputPath, format = 'zip') {
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
            }
            else {
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
        }
        catch (error) {
            return {
                success: false,
                errors: [error.message]
            };
        }
    }
    /**
     * Import boilerplate from exported archive
     */
    async importBoilerplate(archivePath, targetName) {
        try {
            if (!await fs.pathExists(archivePath)) {
                return {
                    success: false,
                    errors: ['Archive path does not exist']
                };
            }
            // Read metadata if available
            const metadataPath = path.join(archivePath, '.export-metadata.json');
            let metadata = {};
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
        }
        catch (error) {
            return {
                success: false,
                errors: [error.message]
            };
        }
    }
}
exports.BoilerplateGenerator = BoilerplateGenerator;
//# sourceMappingURL=BoilerplateGenerator.js.map