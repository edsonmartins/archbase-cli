/**
 * Dependencies Management for Archbase CLI
 *
 * Manages required dependencies based on archbase-react v2.1.3
 * Automatically includes all necessary dependencies in generated projects
 */
export interface DependencyConfig {
    name: string;
    version: string;
    required: boolean;
    category: 'core' | 'ui' | 'data' | 'utils' | 'dev';
    description?: string;
}
export interface ProjectDependencies {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    peerDependencies: Record<string, string>;
}
/**
 * Core dependencies required by archbase-react
 * Based on archbase-react v2.1.3 package.json analysis
 */
export declare const ARCHBASE_CORE_DEPENDENCIES: DependencyConfig[];
/**
 * Optional dependencies for specific features
 */
export declare const ARCHBASE_OPTIONAL_DEPENDENCIES: DependencyConfig[];
/**
 * Development dependencies for TypeScript and tooling
 */
export declare const ARCHBASE_DEV_DEPENDENCIES: DependencyConfig[];
/**
 * Get dependencies for a specific project type
 */
export declare function getProjectDependencies(projectType?: 'basic' | 'admin' | 'full'): ProjectDependencies;
/**
 * Get dependencies for specific features
 */
export declare function getFeatureDependencies(features: string[]): DependencyConfig[];
/**
 * Generate package.json dependencies section
 */
export declare function generatePackageJsonDependencies(projectType?: 'basic' | 'admin' | 'full', additionalFeatures?: string[]): ProjectDependencies;
/**
 * Get PostCSS configuration for Mantine 8
 */
export declare function getMantinePostCSSConfig(): string;
/**
 * Get Mantine theme provider setup
 */
export declare function getMantineThemeSetup(): string;
//# sourceMappingURL=dependencies.d.ts.map