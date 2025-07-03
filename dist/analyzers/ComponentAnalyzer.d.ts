/**
 * ComponentAnalyzer - AST-based analysis of React components
 *
 * This analyzer extracts information from Archbase React components:
 * - Component props and their types
 * - DataSource usage (V1 vs V2)
 * - Component complexity
 * - Dependencies and imports
 */
interface ComponentAnalysis {
    name: string;
    filePath: string;
    props: PropDefinition[];
    imports: ImportInfo[];
    dataSourceUsage: {
        hasDataSource: boolean;
        version: 'v1' | 'v2' | 'both' | 'unknown';
        fields: string[];
    };
    complexity: 'low' | 'medium' | 'high';
    hooks: string[];
    dependencies: string[];
}
interface PropDefinition {
    name: string;
    type: string;
    required: boolean;
    description?: string;
    defaultValue?: any;
}
interface ImportInfo {
    source: string;
    specifiers: string[];
    isDefault: boolean;
}
export declare class ComponentAnalyzer {
    analyzeFile(filePath: string): Promise<ComponentAnalysis | null>;
    analyzeComponent(filePath: string): Promise<ComponentAnalysis | null>;
    analyzeDirectory(dirPath: string, pattern?: string): Promise<ComponentAnalysis[]>;
    private parseCode;
    private extractComponentInfo;
    private isReactComponent;
    private extractPropsFromFunction;
    private extractPropsFromInterface;
    private extractTypeFromTSType;
    private calculateComplexity;
}
export {};
//# sourceMappingURL=ComponentAnalyzer.d.ts.map