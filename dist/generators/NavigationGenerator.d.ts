/**
 * NavigationGenerator - Generate navigation items for powerview-admin pattern
 *
 * Generates navigation configuration files that follow the exact patterns
 * from powerview-admin, including grouped menus, routes, and i18n integration.
 */
interface NavigationConfig {
    name: string;
    output: string;
    typescript: boolean;
    category: string;
    feature: string;
    label: string;
    icon: string;
    color: string;
    showInSidebar: boolean;
    withForm: boolean;
    withView: boolean;
    group?: string;
}
interface GenerationResult {
    files: string[];
    success: boolean;
    errors?: string[];
}
export declare class NavigationGenerator {
    private templatesPath;
    constructor(templatesPath?: string);
    private registerHandlebarsHelpers;
    generate(config: NavigationConfig): Promise<GenerationResult>;
    private buildTemplateContext;
    private generateNavigationItem;
    private generateRouteConstants;
    private loadTemplate;
    private getDefaultTemplate;
    private getNavigationItemTemplate;
    private getRouteConstantsTemplate;
    private generateFeatureName;
    private capitalizeFirst;
}
export {};
//# sourceMappingURL=NavigationGenerator.d.ts.map