/**
 * ComponentGenerator - Generate custom components
 *
 * Generates reusable components with different types and configurations.
 */
interface ComponentConfig {
    type: 'display' | 'input' | 'layout' | 'functional';
    props?: string;
    hooks?: string;
    output: string;
    typescript: boolean;
    test: boolean;
    story: boolean;
    withState: boolean;
    withEffects: boolean;
    withMemo: boolean;
}
interface GenerationResult {
    files: string[];
    success: boolean;
    errors?: string[];
}
export declare class ComponentGenerator {
    private templatesPath;
    constructor(templatesPath?: string);
    generate(name: string, config: ComponentConfig): Promise<GenerationResult>;
    private parseProps;
    private parseHooks;
    private buildTemplateContext;
    private getRequiredImports;
    private buildInterfaces;
    private buildDefaultProps;
    private getTypeScriptType;
    private generateComponent;
    private generateTest;
    private generateStory;
    private getTemplate;
    private getInlineTemplate;
    private getDisplayTemplate;
    private getInputTemplate;
    private getLayoutTemplate;
    private getFunctionalTemplate;
    private getTestTemplate;
    private getStoryTemplate;
    private capitalizeFirst;
}
export {};
//# sourceMappingURL=ComponentGenerator.d.ts.map