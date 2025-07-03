/**
 * ViewGenerator - Generate list/grid view components based on powerview-admin patterns
 *
 * Generates CRUD list views using ArchbaseDataGrid with proper navigation,
 * filtering, permissions, and actions following the exact patterns from powerview-admin.
 */
interface ViewConfig {
    fields?: string;
    output: string;
    typescript: boolean;
    test: boolean;
    story: boolean;
    category?: string;
    feature?: string;
    withPermissions?: boolean;
    withFilters?: boolean;
    withPagination?: boolean;
    withSorting?: boolean;
    pageSize?: number;
    dto?: string;
}
interface GenerationResult {
    files: string[];
    success: boolean;
    errors?: string[];
}
export declare class ViewGenerator {
    private templatesPath;
    constructor(templatesPath?: string);
    private registerHandlebarsHelpers;
    generate(name: string, config: ViewConfig): Promise<GenerationResult>;
    private parseFields;
    private extractFieldsFromDto;
    private convertTypeScriptToColumnType;
    private getColumnWidth;
    private buildTemplateContext;
    private generateView;
    private generateTest;
    private generateStory;
    private loadTemplate;
    private getDefaultTemplate;
    private getCrudListTemplate;
    private getViewTestTemplate;
    private getViewStoryTemplate;
    private isFilterableType;
    private isSortableType;
    private getDefaultSize;
    private generateFeatureName;
    private generateAdminRoute;
    private capitalizeFirst;
}
export {};
//# sourceMappingURL=ViewGenerator.d.ts.map