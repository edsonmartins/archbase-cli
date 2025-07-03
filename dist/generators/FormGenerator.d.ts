/**
 * FormGenerator - Generate form components based on templates
 *
 * Generates forms using Archbase components with proper validation and TypeScript support.
 */
interface FormConfig {
    fields?: string;
    validation: 'yup' | 'zod' | 'none';
    template: 'basic' | 'wizard' | 'validation';
    output: string;
    typescript: boolean;
    test: boolean;
    story: boolean;
    dataSourceVersion?: 'v1' | 'v2';
    datasourceVersion?: 'v1' | 'v2';
    withArrayFields?: boolean;
    layout?: 'vertical' | 'horizontal' | 'grid';
    category?: string;
    feature?: string;
    dto?: string;
}
interface GenerationResult {
    files: string[];
    success: boolean;
    errors?: string[];
}
export declare class FormGenerator {
    private templatesPath;
    constructor(templatesPath?: string);
    private registerHandlebarsHelpers;
    generate(name: string, config: FormConfig): Promise<GenerationResult>;
    private parseFields;
    private extractFieldsFromDto;
    private convertTypeScriptToInputType;
    private buildTemplateContext;
    private generateComponent;
    private generateTest;
    private generateStory;
    private loadTemplate;
    private getDefaultTemplate;
    private getBasicFormTemplate;
    private getTestTemplate;
    private getStoryTemplate;
    private generateImports;
    private generateValidationSchema;
    private getValidationForType;
    private capitalizeFirst;
    private generateDataSourceImports;
    private generateArrayFieldMethods;
    private generateFeatureName;
    private generateAdminRoute;
}
export {};
//# sourceMappingURL=FormGenerator.d.ts.map