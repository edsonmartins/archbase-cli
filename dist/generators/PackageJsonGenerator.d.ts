/**
 * PackageJsonGenerator - Generate package.json with Archbase dependencies
 *
 * Automatically includes all required dependencies based on archbase-react v2.1.3
 */
interface PackageJsonConfig {
    name: string;
    version?: string;
    description?: string;
    author?: string;
    license?: string;
    projectType?: 'basic' | 'admin' | 'full';
    features?: string[];
    outputDir: string;
    typescript?: boolean;
    scripts?: Record<string, string>;
}
interface GenerationResult {
    files: string[];
    success: boolean;
    errors?: string[];
}
export declare class PackageJsonGenerator {
    generate(config: PackageJsonConfig): Promise<GenerationResult>;
    private generatePackageJson;
    private generatePostCSSConfig;
    private generateThemeProvider;
    private generateTsConfig;
    private generateViteConfig;
    private sortObjectKeys;
    /**
     * Generate installation instructions
     */
    generateInstallationInstructions(config: PackageJsonConfig): string;
}
export {};
//# sourceMappingURL=PackageJsonGenerator.d.ts.map