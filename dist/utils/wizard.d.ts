/**
 * Interactive Wizard for Archbase CLI
 *
 * Provides guided project creation with detailed explanations
 */
export interface WizardResult {
    projectName: string;
    projectType: 'basic' | 'admin' | 'full';
    features: string[];
    author: string;
    description: string;
    useTypeScript: boolean;
    setupGit: boolean;
    installDependencies: boolean;
    additionalConfig: {
        apiUrl?: string;
        database?: string;
        authentication?: string;
        deployment?: string;
    };
}
export declare class ProjectWizard {
    run(): Promise<WizardResult>;
    private runWizardSteps;
    private askProjectBasics;
    private askProjectArchitecture;
    private askProjectFeatures;
    private askDevelopmentSetup;
    private askAdditionalConfig;
    private confirmChoices;
    private getBaseFeaturesForType;
    private getAvailableFeatures;
    /**
     * Generate configuration summary
     */
    generateSummary(result: WizardResult): string;
}
//# sourceMappingURL=wizard.d.ts.map