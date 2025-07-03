export interface ServiceGeneratorOptions {
    serviceName: string;
    entityName: string;
    entityType: string;
    idType?: string;
    endpoint?: string;
    javaController?: string;
    outputPath?: string;
    generateDto?: boolean;
}
export interface ServiceMethod {
    name: string;
    httpMethod: string;
    returnType: string;
    parameters: Array<{
        name: string;
        type: string;
        source: 'path' | 'query' | 'body';
    }>;
    endpoint: string;
}
export declare class ServiceGenerator {
    private handlebars;
    private templatesDir;
    private logger;
    private javaAnalyzer;
    constructor();
    private registerHelpers;
    generate(options: ServiceGeneratorOptions): Promise<string>;
    private validateOptions;
    private prepareTemplateData;
    private readJavaController;
    private transformJavaMethods;
    private extractHttpMethod;
    private extractEndpoint;
    private extractParameters;
    private getParameterSource;
    private mapJavaTypeToTypeScript;
    private getDefaultImports;
    private updateImports;
    private generateService;
    private generateDto;
    private writeService;
    private writeDto;
}
export default ServiceGenerator;
//# sourceMappingURL=ServiceGenerator.d.ts.map