/**
 * CodeValidator - Validates generated code for syntax and quality
 *
 * This class provides validation for TypeScript/JavaScript code generated
 * by the CLI to ensure it's syntactically correct and follows best practices.
 */
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    metrics: CodeMetrics;
}
export interface ValidationError {
    type: 'syntax' | 'import' | 'type' | 'structure';
    message: string;
    line?: number;
    column?: number;
    severity: 'error' | 'warning';
}
export interface ValidationWarning {
    type: 'best-practice' | 'performance' | 'accessibility' | 'security';
    message: string;
    line?: number;
    suggestion?: string;
}
export interface CodeMetrics {
    linesOfCode: number;
    complexity: number;
    componentCount: number;
    hookCount: number;
    importCount: number;
    hasTests: boolean;
    hasTypeScript: boolean;
}
export declare class CodeValidator {
    private rules;
    constructor();
    /**
     * Validate a TypeScript/React file
     */
    validateFile(filePath: string): Promise<ValidationResult>;
    /**
     * Validate code string
     */
    validateCode(code: string, fileName?: string): ValidationResult;
    /**
     * Validate generated project structure
     */
    validateProject(projectPath: string): Promise<ValidationResult>;
    private initializeDefaultRules;
    private runValidationRules;
    private calculateMetrics;
    private validateSourceDirectory;
    private validatePackageJson;
    private getEmptyMetrics;
}
//# sourceMappingURL=CodeValidator.d.ts.map