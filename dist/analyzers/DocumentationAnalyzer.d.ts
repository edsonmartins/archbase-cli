/**
 * DocumentationAnalyzer - Analisa documentação markdown para extrair padrões
 *
 * Esta classe analisa documentação markdown do archbase-react para identificar:
 * - Padrões de uso do DataSource V2
 * - Exemplos de código nos docs
 * - APIs e métodos disponíveis
 * - Melhores práticas documentadas
 */
export interface DocumentationAnalysisResult {
    dataSourceV2: DataSourceV2Analysis;
    componentPatterns: ComponentPattern[];
    codeExamples: CodeExample[];
    apiReference: ApiReference[];
    bestPractices: BestPractice[];
    migrationGuides: MigrationGuide[];
    recommendations: DocumentationRecommendation[];
}
export interface DataSourceV2Analysis {
    newFeatures: string[];
    newMethods: string[];
    migrationPatterns: string[];
    usageExamples: string[];
    performanceImprovements: string[];
    breakingChanges: string[];
}
export interface ComponentPattern {
    component: string;
    pattern: string;
    description: string;
    codeExample: string;
    dataSourceVersion: 'v1' | 'v2' | 'both';
    complexity: 'low' | 'medium' | 'high';
}
export interface CodeExample {
    title: string;
    description: string;
    code: string;
    language: string;
    tags: string[];
    dataSourceFeatures: string[];
}
export interface ApiReference {
    method: string;
    component: string;
    description: string;
    parameters: string[];
    returnType: string;
    version: 'v1' | 'v2' | 'both';
    examples: string[];
}
export interface BestPractice {
    category: string;
    title: string;
    description: string;
    example?: string;
    doExample?: string;
    dontExample?: string;
    relatedComponents: string[];
}
export interface MigrationGuide {
    from: string;
    to: string;
    description: string;
    steps: string[];
    codeExample?: string;
    benefits: string[];
}
export interface DocumentationRecommendation {
    type: 'parameter' | 'template' | 'generator' | 'knowledge';
    title: string;
    description: string;
    implementation: string;
    priority: 'high' | 'medium' | 'low';
    affectedGenerators: string[];
}
export declare class DocumentationAnalyzer {
    private docsPath;
    private analysisResult;
    constructor(docsPath: string);
    /**
     * Analisa toda a documentação
     */
    analyzeDocumentation(): Promise<DocumentationAnalysisResult>;
    /**
     * Encontra todos os arquivos markdown
     */
    private findMarkdownFiles;
    /**
     * Analisa um arquivo markdown individual
     */
    private analyzeMarkdownFile;
    /**
     * Analisa conteúdo específico do DataSource V2
     */
    private analyzeDataSourceV2Content;
    /**
     * Extrai exemplos de código da documentação
     */
    private extractCodeExamples;
    /**
     * Extrai referências de API
     */
    private extractApiReferences;
    /**
     * Extrai boas práticas
     */
    private extractBestPractices;
    /**
     * Extrai guias de migração
     */
    private extractMigrationGuides;
    /**
     * Extrai padrões de componentes
     */
    private extractComponentPatterns;
    private isDataSourceMethod;
    private detectDataSourceFeatures;
    private detectCodeTags;
    private extractTitleFromLine;
    private extractDescriptionFromContext;
    private extractMethodDescription;
    private extractMethodParameters;
    private extractReturnType;
    private detectApiVersion;
    private getMethodContext;
    private extractMethodExamples;
    private categorizeFromPath;
    private extractComponentsFromText;
    private extractMigrationSteps;
    private extractMigrationBenefits;
    private extractComponentFromPath;
    private extractNearbyCodeExample;
    private detectDataSourceVersionFromExample;
    private extractPatternDescription;
    private assessComplexity;
    /**
     * Processa a análise e organiza os dados
     */
    private processAnalysis;
    /**
     * Gera recomendações baseadas na análise
     */
    private generateRecommendations;
    /**
     * Exporta resultado da análise
     */
    exportAnalysis(outputPath: string): Promise<void>;
}
//# sourceMappingURL=DocumentationAnalyzer.d.ts.map