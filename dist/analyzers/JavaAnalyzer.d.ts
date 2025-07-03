export interface JavaMethod {
    name: string;
    returnType: string;
    parameters: JavaParameter[];
    annotations: JavaAnnotation[];
    modifiers: string[];
}
export interface JavaParameter {
    name: string;
    type: string;
    annotations: JavaAnnotation[];
}
export interface JavaAnnotation {
    name: string;
    value?: string;
    attributes?: Record<string, string>;
}
export interface JavaControllerAnalysis {
    className: string;
    baseMapping?: string;
    methods: JavaMethod[];
}
export declare class JavaAnalyzer {
    analyzeController(javaCode: string): Promise<JavaControllerAnalysis>;
    private extractAnnotations;
    private parseParameters;
    private splitParameters;
    private parseAttributes;
    private normalizeType;
}
export default JavaAnalyzer;
//# sourceMappingURL=JavaAnalyzer.d.ts.map