"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainGenerator = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
class DomainGenerator {
    constructor(templatesPath = path.join(__dirname, '../../src/templates')) {
        this.templatesPath = templatesPath;
        this.registerHandlebarsHelpers();
    }
    registerHandlebarsHelpers() {
        // Register equality helper
        handlebars_1.default.registerHelper('eq', (a, b) => {
            return a === b;
        });
        // Register capitalize first helper
        handlebars_1.default.registerHelper('capitalizeFirst', (str) => {
            return str.charAt(0).toUpperCase() + str.slice(1);
        });
        // Register lowercase helper
        handlebars_1.default.registerHelper('toLowerCase', (str) => {
            return str.toLowerCase();
        });
        // Register uppercase helper
        handlebars_1.default.registerHelper('toUpperCase', (str) => {
            return str.toUpperCase();
        });
        // Register camelCase helper
        handlebars_1.default.registerHelper('toCamelCase', (str) => {
            return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
                return index === 0 ? word.toLowerCase() : word.toUpperCase();
            }).replace(/\s+/g, '');
        });
        // Register validation message helper
        handlebars_1.default.registerHelper('validationMessage', (fieldName, entityName) => {
            return `mentors:${fieldName} ${entityName.toLowerCase()} dever ser informado`;
        });
        // Register concat helper
        handlebars_1.default.registerHelper('concat', (...args) => {
            // Remove the options object (last argument)
            const values = args.slice(0, -1);
            return values.join('');
        });
        // Register TypeScript type helper
        handlebars_1.default.registerHelper('tsType', (javaType) => {
            const typeMapping = {
                'String': 'string',
                'Integer': 'number',
                'int': 'number',
                'Long': 'number',
                'long': 'number',
                'Double': 'number',
                'double': 'number',
                'Float': 'number',
                'float': 'number',
                'Boolean': 'boolean',
                'boolean': 'boolean',
                'Date': 'string',
                'LocalDate': 'string',
                'LocalDateTime': 'string',
                'LocalTime': 'string',
                'UUID': 'string',
                'BigDecimal': 'number'
            };
            // Handle array types
            if (javaType.includes('[]') || javaType.includes('List<') || javaType.includes('Set<')) {
                const baseType = javaType.replace(/\[\]|List<|Set<|>/g, '');
                const tsBaseType = typeMapping[baseType] || baseType;
                return tsBaseType + '[]';
            }
            return typeMapping[javaType] || javaType;
        });
    }
    async generate(config) {
        try {
            let processedConfig = config;
            // Parse Java input if provided
            if (config.javaInput) {
                processedConfig = await this.parseJavaClass(config);
            }
            const context = this.buildTemplateContext(processedConfig);
            const files = [];
            // Generate DTO
            const dtoFile = await this.generateDto(processedConfig.name, context, processedConfig);
            files.push(dtoFile);
            // Generate enums if specified
            if (processedConfig.enums && processedConfig.enums.length > 0) {
                for (const enumConfig of processedConfig.enums) {
                    const enumFile = await this.generateEnum(enumConfig, context, processedConfig);
                    files.push(enumFile);
                }
            }
            // Generate status values for UI rendering
            const statusFile = await this.generateStatusValues(processedConfig.name, context, processedConfig);
            files.push(statusFile);
            return { files, success: true };
        }
        catch (error) {
            return {
                files: [],
                success: false,
                errors: [error.message]
            };
        }
    }
    async parseJavaClass(config) {
        const javaInput = config.javaInput;
        const fields = [];
        const enums = [];
        // Extract class name if not provided
        let className = config.name;
        const classMatch = javaInput.match(/class\s+(\w+)/);
        if (classMatch && !config.name) {
            className = classMatch[1];
        }
        // Extract enum definitions
        const enumMatches = javaInput.match(/enum\s+(\w+)\s*\{([^}]+)\}/g);
        if (enumMatches) {
            for (const enumMatch of enumMatches) {
                const enumNameMatch = enumMatch.match(/enum\s+(\w+)/);
                const enumValuesMatch = enumMatch.match(/\{([^}]+)\}/);
                if (enumNameMatch && enumValuesMatch) {
                    const enumName = enumNameMatch[1];
                    const enumValues = enumValuesMatch[1]
                        .split(',')
                        .map(v => v.trim().replace(/;.*$/, ''))
                        .filter(v => v.length > 0);
                    enums.push({
                        name: enumName,
                        values: enumValues
                    });
                }
            }
        }
        // Extract field definitions
        const fieldMatches = javaInput.match(/(?:private|public|protected)?\s*(\w+(?:<\w+>)?(?:\[\])?)\s+(\w+)\s*(?:=.*?)?;/g);
        if (fieldMatches) {
            for (const fieldMatch of fieldMatches) {
                const fieldParts = fieldMatch.match(/(?:private|public|protected)?\s*(\w+(?:<\w+>)?(?:\[\])?)\s+(\w+)/);
                if (fieldParts) {
                    const javaType = fieldParts[1];
                    const fieldName = fieldParts[2];
                    // Skip common framework fields
                    if (['serialVersionUID', 'logger', 'log'].includes(fieldName)) {
                        continue;
                    }
                    // Check for validation annotations
                    const validationMatch = javaInput.match(new RegExp(`@\\w+[^\\n]*\\n\\s*(?:private|public|protected)?\\s*${javaType}\\s+${fieldName}`));
                    let required = false;
                    let validation = '';
                    if (validationMatch) {
                        const annotation = validationMatch[0];
                        required = annotation.includes('@NotNull') || annotation.includes('@NotEmpty') || annotation.includes('@NotBlank');
                        if (annotation.includes('@Email')) {
                            validation = 'email';
                        }
                        else if (annotation.includes('@Size')) {
                            validation = 'size';
                        }
                        else if (annotation.includes('@Min') || annotation.includes('@Max')) {
                            validation = 'numeric';
                        }
                    }
                    fields.push({
                        name: fieldName,
                        type: javaType,
                        required,
                        validation,
                        isArray: javaType.includes('[]') || javaType.includes('List<') || javaType.includes('Set<'),
                        nested: !this.isPrimitiveType(javaType)
                    });
                }
            }
        }
        return {
            ...config,
            name: className,
            fields,
            enums: enums.length > 0 ? enums : config.enums
        };
    }
    isPrimitiveType(type) {
        const primitives = [
            'String', 'Integer', 'int', 'Long', 'long', 'Double', 'double',
            'Float', 'float', 'Boolean', 'boolean', 'Date', 'LocalDate',
            'LocalDateTime', 'LocalTime', 'UUID', 'BigDecimal'
        ];
        const baseType = type.replace(/\[\]|List<|Set<|>/g, '');
        return primitives.includes(baseType);
    }
    buildTemplateContext(config) {
        const entityName = config.name.replace(/Dto$/, '');
        const dtoName = config.name.endsWith('Dto') ? config.name : `${config.name}Dto`;
        // Add audit fields if requested
        const auditFields = config.withAuditFields ? [
            { name: 'id', type: 'string', required: true },
            { name: 'code', type: 'string', required: false },
            { name: 'version', type: 'number', required: false },
            { name: 'createEntityDate', type: 'string', required: false },
            { name: 'updateEntityDate', type: 'string', required: false },
            { name: 'createdByUser', type: 'string', required: false },
            { name: 'lastModifiedByUser', type: 'string', required: false }
        ] : [];
        const allFields = [...auditFields, ...config.fields];
        return {
            // Basic info
            name: config.name,
            entityName,
            dtoName,
            // Fields
            fields: allFields,
            hasRequiredFields: allFields.some(f => f.required),
            hasEnumFields: allFields.some(f => f.type.includes('Status') || f.type.includes('Type')),
            hasNestedFields: allFields.some(f => f.nested),
            hasArrayFields: allFields.some(f => f.isArray),
            // Enums
            enums: config.enums || [],
            hasEnums: config.enums && config.enums.length > 0,
            // Features
            withAuditFields: config.withAuditFields,
            withValidation: config.withValidation,
            withConstructor: config.withConstructor !== false,
            withFactory: config.withFactory !== false,
            // Naming
            camelCaseName: this.toCamelCase(entityName),
            newInstanceFlag: `isNovo${entityName}`,
            // Imports
            needsValidation: config.withValidation && allFields.some(f => f.required),
            needsUuid: config.withFactory || config.withAuditFields
        };
    }
    async generateDto(name, context, config) {
        const templateName = 'domain/dto.hbs';
        const template = await this.loadTemplate(templateName);
        const compiled = handlebars_1.default.compile(template);
        const content = compiled(context);
        const fileName = `${context.dtoName}.ts`;
        const filePath = path.resolve(config.output, fileName);
        await fs.ensureDir(config.output);
        await fs.writeFile(filePath, content);
        console.log(`  📄 ${filePath}`);
        return filePath;
    }
    async generateEnum(enumConfig, context, config) {
        const templateName = 'domain/enum.hbs';
        const template = await this.loadTemplate(templateName);
        const compiled = handlebars_1.default.compile(template);
        const content = compiled({
            ...context,
            enumName: enumConfig.name,
            enumValues: enumConfig.values,
            enumDescription: enumConfig.description
        });
        const fileName = `${enumConfig.name}.ts`;
        const filePath = path.resolve(config.output, fileName);
        await fs.ensureDir(config.output);
        await fs.writeFile(filePath, content);
        console.log(`  📄 ${filePath}`);
        return filePath;
    }
    async generateStatusValues(name, context, config) {
        // Only generate status values if we have enums
        if (!context.hasEnums) {
            return '';
        }
        const templateName = 'domain/status-values.hbs';
        const template = await this.loadTemplate(templateName);
        const compiled = handlebars_1.default.compile(template);
        const content = compiled(context);
        const fileName = `${context.entityName}StatusValues.ts`;
        const filePath = path.resolve(config.output, fileName);
        await fs.ensureDir(config.output);
        await fs.writeFile(filePath, content);
        console.log(`  📄 ${filePath}`);
        return filePath;
    }
    async loadTemplate(templateName) {
        const templatePath = path.join(this.templatesPath, templateName);
        if (await fs.pathExists(templatePath)) {
            return fs.readFile(templatePath, 'utf-8');
        }
        // Return default template if specific template not found
        return this.getDefaultTemplate(templateName);
    }
    getDefaultTemplate(templateName) {
        if (templateName.includes('dto')) {
            return this.getDtoTemplate();
        }
        if (templateName.includes('enum')) {
            return this.getEnumTemplate();
        }
        if (templateName.includes('status-values')) {
            return this.getStatusValuesTemplate();
        }
        return this.getDtoTemplate();
    }
    getDtoTemplate() {
        return `// DTO template - generated by DomainGenerator
export class {{dtoName}} {
  {{#each fields}}
  {{name}}: {{tsType type}};
  {{/each}}
}`;
    }
    getEnumTemplate() {
        return `// Enum template - generated by DomainGenerator
export enum {{enumName}} {
  {{#each enumValues}}
  {{this}} = "{{this}}"{{#unless @last}},{{/unless}}
  {{/each}}
}`;
    }
    getStatusValuesTemplate() {
        return `// Status values template - generated by DomainGenerator`;
    }
    toCamelCase(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
    }
}
exports.DomainGenerator = DomainGenerator;
//# sourceMappingURL=DomainGenerator.js.map