/**
 * PageGenerator - Generate page components with layouts
 *
 * Generates complete page components with different layout configurations.
 */
interface PageConfig {
    layout: 'sidebar' | 'header' | 'blank' | 'dashboard';
    components?: string;
    title?: string;
    output: string;
    typescript: boolean;
    test: boolean;
    story: boolean;
    withAuth: boolean;
    withNavigation: boolean;
    withFooter: boolean;
}
interface GenerationResult {
    files: string[];
    success: boolean;
    errors?: string[];
}
export declare class PageGenerator {
    private templatesPath;
    constructor(templatesPath?: string);
    generate(name: string, config: PageConfig): Promise<GenerationResult>;
    private parseComponents;
    private buildTemplateContext;
    private getRequiredImports;
    private buildInterfaces;
    private generateComponent;
    private generateTest;
    private generateStory;
    private getTemplate;
    private getInlineTemplate;
    private getSidebarTemplate;
    private getHeaderTemplate;
    private getBlankTemplate;
    private getDashboardTemplate;
    private getTestTemplate;
    private getStoryTemplate;
    private capitalizeFirst;
}
export {};
//# sourceMappingURL=PageGenerator.d.ts.map