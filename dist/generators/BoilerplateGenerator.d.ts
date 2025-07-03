/**
 * BoilerplateGenerator - Generate complete projects from boilerplates
 */
import { RemoteBoilerplateOptions } from './RemoteBoilerplateManager';
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
    choices?: Array<{
        name: string;
        message: string;
        checked?: boolean;
    }>;
    default?: any;
    validate?: string;
}
interface GenerationResult {
    success: boolean;
    projectPath?: string;
    files?: string[];
    errors?: string[];
}
export declare class BoilerplateGenerator {
    private boilerplatesPath;
    private remoteManager;
    constructor(boilerplatesPath?: string);
    private registerHandlebarsHelpers;
    listBoilerplates(): Promise<string[]>;
    getBoilerplateConfig(name: string): Promise<BoilerplateConfig | null>;
    generateProject(boilerplateName: string, projectName: string, outputDir: string, answers?: Record<string, any>): Promise<GenerationResult>;
    private promptUser;
    private createValidator;
    private generateFiles;
    private runHooks;
    validateBoilerplate(name: string): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    /**
     * Generate project from remote boilerplate
     */
    generateFromRemote(projectName: string, remoteOptions: RemoteBoilerplateOptions, outputDir: string, answers?: Record<string, any>): Promise<GenerationResult>;
    /**
     * Prompt for answers using config prompts
     */
    private promptForAnswers;
    /**
     * Extract features from user answers
     */
    private extractFeaturesFromAnswers;
    /**
     * Load configuration from remote boilerplate
     */
    private loadRemoteConfig;
    /**
     * Generate files from remote boilerplate
     */
    private generateRemoteFiles;
    /**
     * Run hooks from remote boilerplate
     */
    private runRemoteHooks;
    createBoilerplateFromProject(projectPath: string, boilerplateName: string, config: Partial<BoilerplateConfig>): Promise<GenerationResult>;
    /**
     * List boilerplates from multiple sources
     */
    listAllBoilerplates(): Promise<{
        builtin: string[];
        custom: string[];
    }>;
    /**
     * Get boilerplate info with source indication
     */
    getBoilerplateInfo(name: string): Promise<{
        config: BoilerplateConfig | null;
        source: 'builtin' | 'custom' | null;
    }>;
    /**
     * Generate from any boilerplate source
     */
    generateFromAnySource(boilerplateName: string, projectName: string, outputDir: string, answers?: Record<string, any>): Promise<GenerationResult>;
    /**
     * Export boilerplate for sharing
     */
    exportBoilerplate(name: string, outputPath: string, format?: 'zip' | 'tar'): Promise<GenerationResult>;
    /**
     * Import boilerplate from exported archive
     */
    importBoilerplate(archivePath: string, targetName?: string): Promise<GenerationResult>;
}
export {};
//# sourceMappingURL=BoilerplateGenerator.d.ts.map