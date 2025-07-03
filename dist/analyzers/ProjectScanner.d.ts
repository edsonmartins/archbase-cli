/**
 * ProjectScanner - Advanced component scanning for Archbase projects
 *
 * Analyzes projects to:
 * - Detect Archbase components usage
 * - Find patterns and anti-patterns
 * - Suggest improvements
 * - Generate component usage statistics
 * - Identify migration opportunities
 */
export interface ComponentUsage {
    name: string;
    importPath: string;
    props: Array<{
        name: string;
        type: string;
        value?: any;
        isRequired?: boolean;
    }>;
    file: string;
    line: number;
    column: number;
    hasDataSource: boolean;
    dataSourceVersion?: 'v1' | 'v2';
    patterns: string[];
    issues: ComponentIssue[];
}
export interface ComponentIssue {
    type: 'warning' | 'error' | 'suggestion';
    message: string;
    fix?: string;
    line?: number;
    column?: number;
}
export interface ProjectScanResult {
    components: ComponentUsage[];
    statistics: {
        totalComponents: number;
        archbaseComponents: number;
        v1Components: number;
        v2Components: number;
        filesScanned: number;
        issuesFound: number;
    };
    patterns: {
        detected: string[];
        missing: string[];
        recommended: string[];
    };
    migration: {
        v1ToV2Candidates: ComponentUsage[];
        estimatedEffort: string;
        recommendations: string[];
    };
    dependencies: {
        archbaseVersion?: string;
        reactVersion?: string;
        missingDependencies: string[];
        outdatedDependencies: Array<{
            name: string;
            current: string;
            latest: string;
        }>;
    };
}
export interface ScanOptions {
    projectPath: string;
    includePatterns?: string[];
    excludePatterns?: string[];
    includeNodeModules?: boolean;
    deep?: boolean;
    generateReport?: boolean;
    outputPath?: string;
    fixIssues?: boolean;
}
export declare class ProjectScanner {
    private archbaseComponents;
    private patterns;
    scanProject(options: ScanOptions): Promise<ProjectScanResult>;
    private findFiles;
    private analyzeFile;
    private analyzeComponentUsage;
    private detectDataSourceVersion;
    private detectComponentIssues;
    private getRequiredProps;
    private detectComponentPatterns;
    private analyzeDependencies;
    private detectPatterns;
    private analyzeMigrationOpportunities;
    private generateStatistics;
    private generateReport;
    private generateRecommendations;
    /**
     * Auto-fix common issues
     */
    autoFix(result: ProjectScanResult, options?: {
        dryRun?: boolean;
    }): Promise<{
        fixed: number;
        skipped: number;
        errors: string[];
    }>;
}
//# sourceMappingURL=ProjectScanner.d.ts.map