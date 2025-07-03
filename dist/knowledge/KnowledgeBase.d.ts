/**
 * KnowledgeBase - Central knowledge management for Archbase components
 *
 * This class manages the knowledge about components, patterns, and examples.
 * It supports both auto-generated (via AST analysis) and manually curated information.
 */
interface ComponentInfo {
    name: string;
    description: string;
    category: string;
    version: string;
    status: 'stable' | 'beta' | 'deprecated';
    props: Record<string, PropInfo>;
    examples: ExampleInfo[];
    patterns: PatternInfo[];
    relatedComponents: string[];
    dependencies: string[];
    aiHints?: string[];
    complexity: 'low' | 'medium' | 'high';
    useCases: string[];
}
interface PropInfo {
    type: string;
    required: boolean;
    description: string;
    defaultValue?: any;
}
interface ExampleInfo {
    title: string;
    description: string;
    file: string;
    tags: string[];
    code?: string;
}
interface PatternInfo {
    name: string;
    title: string;
    description: string;
    components: string[];
    template: string;
    examples: string[];
    complexity: 'low' | 'medium' | 'high';
    tags: string[];
}
export declare class KnowledgeBase {
    private knowledgePath;
    private componentsCache;
    private patternsCache;
    constructor(knowledgePath?: string);
    initialize(): Promise<void>;
    getComponent(name: string): Promise<ComponentInfo | null>;
    searchPatterns(description: string, category?: string): Promise<PatternInfo[]>;
    searchExamples(filters: {
        component?: string;
        pattern?: string;
        tag?: string;
    }): Promise<ExampleInfo[]>;
    freeSearch(query: string): Promise<{
        components: ComponentInfo[];
        patterns: PatternInfo[];
        examples: ExampleInfo[];
    }>;
    private loadComponents;
    private loadPatterns;
    private initializeDefaultComponents;
    private initializeDefaultPatterns;
}
export {};
//# sourceMappingURL=KnowledgeBase.d.ts.map