/**
 * ProjectPatternAnalyzer - Analisa projetos existentes para extrair padrões
 *
 * Esta classe analisa projetos Archbase React existentes para identificar:
 * - Padrões de uso de componentes
 * - Estruturas de formulários comuns
 * - Configurações de DataSource V1/V2
 * - Padrões de validação
 * - Estruturas de páginas e layouts
 */
export interface ProjectAnalysisResult {
    patterns: DetectedPattern[];
    dataSourceUsage: DataSourceUsagePattern[];
    formPatterns: FormPattern[];
    componentUsage: ComponentUsageStats[];
    validationPatterns: ValidationPattern[];
    pageStructures: PageStructurePattern[];
    recommendations: AnalysisRecommendation[];
}
export interface DetectedPattern {
    name: string;
    type: 'form' | 'view' | 'page' | 'component' | 'layout';
    frequency: number;
    files: string[];
    description: string;
    template: string;
    parameters: Record<string, any>;
    examples: PatternExample[];
}
export interface DataSourceUsagePattern {
    version: 'v1' | 'v2' | 'mixed';
    component: string;
    usageCount: number;
    commonProps: Record<string, any>;
    patterns: string[];
    files: string[];
}
export interface FormPattern {
    fieldTypes: string[];
    validationLibrary: 'yup' | 'zod' | 'custom' | 'none';
    layout: 'vertical' | 'horizontal' | 'inline' | 'grid';
    commonFeatures: string[];
    complexity: 'low' | 'medium' | 'high';
    frequency: number;
}
export interface ComponentUsageStats {
    component: string;
    usageCount: number;
    commonProps: Record<string, number>;
    patterns: string[];
    contexts: string[];
}
export interface ValidationPattern {
    type: 'yup' | 'zod' | 'custom';
    rules: string[];
    frequency: number;
    examples: string[];
}
export interface PageStructurePattern {
    layout: string;
    sections: string[];
    navigation: string;
    authentication: boolean;
    frequency: number;
}
export interface PatternExample {
    file: string;
    code: string;
    description: string;
}
export interface AnalysisRecommendation {
    type: 'template' | 'parameter' | 'pattern' | 'optimization';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    implementation: string;
}
export declare class ProjectPatternAnalyzer {
    private projectPath;
    private analysisResult;
    constructor(projectPath: string);
    /**
     * Analisa um projeto completo
     */
    analyzeProject(): Promise<ProjectAnalysisResult>;
    /**
     * Encontra todos os arquivos React/TypeScript no projeto
     */
    private findReactFiles;
    /**
     * Analisa um arquivo individual
     */
    private analyzeFile;
    /**
     * Analisa uso de DataSource V1/V2
     */
    private analyzeDataSourceUsage;
    /**
     * Detecta padrões de DataSource no código
     */
    private detectDataSourcePatterns;
    /**
     * Analisa padrões de formulários
     */
    private analyzeFormPatterns;
    /**
     * Analisa uso de componentes
     */
    private analyzeComponentUsage;
    /**
     * Detecta padrões de uso de componentes
     */
    private detectComponentPatterns;
    /**
     * Detecta contextos de uso de componentes
     */
    private detectComponentContexts;
    /**
     * Analisa padrões de validação
     */
    private analyzeValidationPatterns;
    /**
     * Analisa estrutura de páginas
     */
    private analyzePageStructure;
    /**
     * Processa padrões detectados e cria templates
     */
    private processPatterns;
    /**
     * Gera recomendações baseadas na análise
     */
    private generateRecommendations;
    /**
     * Exporta resultado da análise
     */
    exportAnalysis(outputPath: string): Promise<void>;
}
//# sourceMappingURL=ProjectPatternAnalyzer.d.ts.map