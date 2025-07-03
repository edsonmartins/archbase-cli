/**
 * Template Loader - Utility for loading and caching Handlebars templates
 */
export declare class TemplateLoader {
    private cache;
    private templatesPath;
    constructor(templatesPath?: string);
    private registerHelpers;
    loadTemplate(category: string, templateName: string): Promise<HandlebarsTemplateDelegate>;
    templateExists(category: string, templateName: string): Promise<boolean>;
    clearCache(): void;
    registerPartial(name: string, templatePath: string): Promise<void>;
    loadPartials(partialsDir?: string): Promise<void>;
}
//# sourceMappingURL=template-loader.d.ts.map