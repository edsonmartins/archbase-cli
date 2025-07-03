/**
 * DomainGenerator - Generate DTOs and enums following powerview-admin patterns
 *
 * Can generate TypeScript DTOs from:
 * - Java classes (parsed from text input)
 * - Field specifications
 * - Existing DTO analysis
 *
 * Generates:
 * - DTO classes with validation decorators
 * - Enum definitions with proper TypeScript syntax
 * - Status value arrays for UI rendering
 * - Constructor patterns and factory methods
 */
interface DomainField {
    name: string;
    type: string;
    required?: boolean;
    validation?: string;
    description?: string;
    enumValues?: string[];
    isArray?: boolean;
    nested?: boolean;
}
interface DomainConfig {
    name: string;
    output: string;
    typescript: boolean;
    fields: DomainField[];
    enums?: EnumConfig[];
    withAuditFields?: boolean;
    withValidation?: boolean;
    withConstructor?: boolean;
    withFactory?: boolean;
    javaInput?: string;
}
interface EnumConfig {
    name: string;
    values: string[];
    description?: string;
}
interface GenerationResult {
    files: string[];
    success: boolean;
    errors?: string[];
}
export declare class DomainGenerator {
    private templatesPath;
    constructor(templatesPath?: string);
    private registerHandlebarsHelpers;
    generate(config: DomainConfig): Promise<GenerationResult>;
    parseJavaClass(config: DomainConfig): Promise<DomainConfig>;
    private isPrimitiveType;
    private buildTemplateContext;
    private generateDto;
    private generateEnum;
    private generateStatusValues;
    private loadTemplate;
    private getDefaultTemplate;
    private getDtoTemplate;
    private getEnumTemplate;
    private getStatusValuesTemplate;
    private toCamelCase;
}
export {};
//# sourceMappingURL=DomainGenerator.d.ts.map