/**
 * Migration Command - Tools for migrating between Archbase versions
 *
 * Examples:
 * archbase migrate v1-to-v2 ./src --component ArchbaseEdit
 * archbase migrate analyze ./project --report
 * archbase migrate batch ./src --dry-run
 */
import { Command } from 'commander';
export interface MigrationRule {
    id: string;
    name: string;
    description: string;
    fromVersion: string;
    toVersion: string;
    componentNames: string[];
    transform: (code: string, filePath: string) => Promise<MigrationResult>;
}
export interface MigrationResult {
    success: boolean;
    code?: string;
    changes: MigrationChange[];
    errors: string[];
    warnings: string[];
}
export interface MigrationChange {
    type: 'replace' | 'add' | 'remove' | 'update';
    description: string;
    line?: number;
    column?: number;
    before?: string;
    after?: string;
}
export interface MigrationOptions {
    projectPath: string;
    component?: string;
    dryRun?: boolean;
    backup?: boolean;
    report?: boolean;
    outputPath?: string;
    includePatterns?: string[];
    excludePatterns?: string[];
}
export declare class MigrationEngine {
    private rules;
    constructor();
    private initializeRules;
    analyzeProject(options: MigrationOptions): Promise<{
        totalFiles: number;
        migrableFiles: number;
        issues: Array<{
            file: string;
            component: string;
            rule: string;
            complexity: 'simple' | 'medium' | 'complex';
            description: string;
        }>;
        estimatedEffort: string;
    }>;
    private assessComplexity;
    migrateFile(filePath: string, options: MigrationOptions): Promise<MigrationResult>;
    private shouldApplyRule;
    private transformDataSourceV1ToV2;
    private transformFormValidation;
    private transformEventHandlers;
}
export declare const migrateCommand: Command;
//# sourceMappingURL=migrate.d.ts.map