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

import * as fs from 'fs-extra';
import * as path from 'path';
import Handlebars from 'handlebars';

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
  style?: 'class' | 'interface';
  typescript: boolean;
  fields: DomainField[];
  enums?: EnumConfig[];
  withAuditFields?: boolean;
  withValidation?: boolean;
  withConstructor?: boolean;
  withFactory?: boolean;
  javaInput?: string; // Java class as string input
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

export class DomainGenerator {
  private readonly handlebars = Handlebars.create();
  private templatesPath: string;
  
  constructor(templatesPath: string = path.join(__dirname, '../../src/templates')) {
    this.templatesPath = templatesPath;
    this.registerHandlebarsHelpers();
  }
  
  private registerHandlebarsHelpers() {
    // Register equality helper
    this.handlebars.registerHelper('eq', (a: any, b: any) => {
      return a === b;
    });
    
    // Register capitalize first helper
    this.handlebars.registerHelper('capitalizeFirst', (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    });
    
    // Register lowercase helper
    this.handlebars.registerHelper('toLowerCase', (str: string) => {
      return str.toLowerCase();
    });
    
    // Register uppercase helper
    this.handlebars.registerHelper('toUpperCase', (str: string) => {
      return str.toUpperCase();
    });
    
    // Register camelCase helper
    this.handlebars.registerHelper('toCamelCase', (str: string) => {
      return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      }).replace(/\s+/g, '');
    });
    
    // Register validation message helper (kept for backwards-compat with any
    // external template; the bundled dto.hbs now uses precomputed decorators).
    this.handlebars.registerHelper('validationMessage', (fieldName: string, _entityName: string) => {
      return `${fieldName} é obrigatório`;
    });
    
    // Register concat helper
    this.handlebars.registerHelper('concat', (...args: any[]) => {
      // Remove the options object (last argument)
      const values = args.slice(0, -1);
      return values.join('');
    });
    
    // Register TypeScript type helper
    this.handlebars.registerHelper('tsType', (javaType: string) => {
      const typeMapping: { [key: string]: string } = {
        // Java types
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
        'BigDecimal': 'number',
        // CLI field types
        'string': 'string',
        'text': 'string',
        'email': 'string',
        'password': 'string',
        'textarea': 'string',
        'select': 'string',
        'number': 'number',
        'decimal': 'number',
        'date': 'string',
        'datetime': 'string',
        'bool': 'boolean',
        'checkbox': 'boolean',
        'switch': 'boolean',
        'enum': 'string' // Default to string, will be overridden by specific enum types
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
  
  async generate(config: DomainConfig): Promise<GenerationResult> {
    try {
      let processedConfig = config;
      
      // Parse Java input if provided
      if (config.javaInput) {
        processedConfig = await this.parseJavaClass(config);
      }
      
      const context = this.buildTemplateContext(processedConfig);
      const files: string[] = [];
      
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
      
      // Generate status values for UI rendering (only when enums exist;
      // generateStatusValues returns '' otherwise, which must not be listed).
      const statusFile = await this.generateStatusValues(processedConfig.name, context, processedConfig);
      if (statusFile) {
        files.push(statusFile);
      }

      return { files, success: true };
      
    } catch (error) {
      return { 
        files: [], 
        success: false, 
        errors: [error.message] 
      };
    }
  }
  
  async parseJavaClass(config: DomainConfig): Promise<DomainConfig> {
    const javaInput = config.javaInput!;
    const fields: DomainField[] = [];
    const enums: EnumConfig[] = [];
    
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
            } else if (annotation.includes('@Size')) {
              validation = 'size';
            } else if (annotation.includes('@Min') || annotation.includes('@Max')) {
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
  
  private isPrimitiveType(type: string): boolean {
    const primitives = [
      'String', 'Integer', 'int', 'Long', 'long', 'Double', 'double', 
      'Float', 'float', 'Boolean', 'boolean', 'Date', 'LocalDate', 
      'LocalDateTime', 'LocalTime', 'UUID', 'BigDecimal'
    ];
    
    const baseType = type.replace(/\[\]|List<|Set<|>/g, '');
    return primitives.includes(baseType);
  }
  
  private buildTemplateContext(config: DomainConfig) {
    const entityName = config.name.replace(/Dto$/, '');
    const dtoName = config.name.endsWith('Dto') ? config.name : `${config.name}Dto`;
    
    // Add audit fields if requested (only if not already present)
    const auditFields: DomainField[] = config.withAuditFields ? [
      // id is server/uuid-generated → optional (matches the reference DTOs)
      { name: 'id', type: 'string', required: false },
      { name: 'code', type: 'string', required: false },
      { name: 'version', type: 'number', required: false },
      { name: 'createEntityDate', type: 'string', required: false },
      { name: 'updateEntityDate', type: 'string', required: false },
      { name: 'createdByUser', type: 'string', required: false },
      { name: 'lastModifiedByUser', type: 'string', required: false }
    ] : [];
    
    // Filter out duplicate fields (user fields take precedence)
    const userFieldNames = config.fields.map(f => f.name);
    const filteredAuditFields = auditFields.filter(auditField => 
      !userFieldNames.includes(auditField.name)
    );
    
    const allFields = [...filteredAuditFields, ...config.fields];
    
    // Map enum types to specific enum names
    const processedFields = allFields.map(field => {
      if (field.type === 'enum') {
        // Default enum type naming: EntityName + Status
        const enumTypeName = `${entityName}Status`;
        return {
          ...field,
          type: enumTypeName
        };
      }
      return field;
    });

    // Precompute validation decorators per field and the exact import set, so
    // the template emits only the decorators it actually uses (no unused imports,
    // proper @IsString/@IsNumber/@IsEnum alongside @IsNotEmpty/@IsOptional).
    const needsValidation = !!config.withValidation && config.style !== 'interface';
    const validationImportSet = new Set<string>();
    const decoratedFields = processedFields.map(field => {
      const decorators: string[] = [];
      if (needsValidation) {
        // Presence decorator: required → @IsNotEmpty, optional → @IsOptional.
        if (field.required) {
          decorators.push(`@IsNotEmpty({\n    message: "${field.name} é obrigatório",\n  })`);
          validationImportSet.add('IsNotEmpty');
        } else {
          decorators.push('@IsOptional()');
          validationImportSet.add('IsOptional');
        }
        // Format/type decorator: @IsEmail / @IsString / @IsNumber / @IsBoolean / @IsEnum.
        const td = this.getTypeDecorator(field);
        if (td) {
          decorators.push(td.decorator);
          validationImportSet.add(td.importName);
        }
      }
      return { ...field, decorators };
    });

    const IMPORT_ORDER = [
      'IsNotEmpty', 'IsEmail', 'IsOptional',
      'IsString', 'IsNumber', 'IsBoolean', 'IsEnum', 'IsArray', 'ValidateNested',
    ];
    const validationImports = IMPORT_ORDER.filter(name => validationImportSet.has(name));

    return {
      // Basic info
      name: config.name,
      entityName,
      dtoName,

      // Fields
      fields: decoratedFields,
      hasRequiredFields: processedFields.some(f => f.required),
      hasEnumFields: processedFields.some(f => f.type.includes('Status') || f.type.includes('Type')),
      hasNestedFields: processedFields.some(f => f.nested),
      hasArrayFields: processedFields.some(f => f.isArray),
      
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
      newInstanceFlag: 'isNew',

      // Style: 'class' (decorators + constructor + newInstance) or 'interface'
      style: config.style || 'class',

      // Imports
      needsValidation,
      validationImports,
      needsUuid: config.withFactory || config.withAuditFields
    };
  }

  /**
   * Pick the class-validator type decorator for a field (alongside the
   * required/optional decorator), and the import symbol it needs.
   */
  private getTypeDecorator(field: DomainField): { decorator: string; importName: string } | null {
    if ((field as any).isArray) return { decorator: '@IsArray()', importName: 'IsArray' };
    if ((field as any).nested) return { decorator: '@ValidateNested()', importName: 'ValidateNested' };
    const t = field.type;
    if (t === 'email') return { decorator: '@IsEmail()', importName: 'IsEmail' };
    if (/Status$|Type$/.test(t)) return { decorator: `@IsEnum(${t})`, importName: 'IsEnum' };
    switch (t) {
      case 'number':
      case 'decimal':
      case 'integer':
      case 'float':
        return { decorator: '@IsNumber()', importName: 'IsNumber' };
      case 'boolean':
        return { decorator: '@IsBoolean()', importName: 'IsBoolean' };
      default:
        return { decorator: '@IsString()', importName: 'IsString' };
    }
  }
  
  private async generateDto(name: string, context: any, config: DomainConfig): Promise<string> {
    const templateName = (config.style === 'interface')
      ? 'domain/dto-interface.hbs'
      : 'domain/dto.hbs';
    const template = await this.loadTemplate(templateName);
    const compiled = this.handlebars.compile(template);
    const content = compiled(context);
    
    const fileName = `${context.dtoName}.ts`;
    const filePath = path.resolve(config.output, fileName);
    
    await fs.ensureDir(config.output);
    await fs.writeFile(filePath, content);
    
    console.log(`  📄 ${filePath}`);
    return filePath;
  }
  
  private async generateEnum(enumConfig: EnumConfig, context: any, config: DomainConfig): Promise<string> {
    const templateName = 'domain/enum.hbs';
    const template = await this.loadTemplate(templateName);
    const compiled = this.handlebars.compile(template);
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
  
  private async generateStatusValues(name: string, context: any, config: DomainConfig): Promise<string> {
    // Only generate status values if we have enums
    if (!context.hasEnums) {
      return '';
    }
    
    const templateName = 'domain/status-values.hbs';
    const template = await this.loadTemplate(templateName);
    const compiled = this.handlebars.compile(template);
    const content = compiled(context);
    
    const fileName = `${context.entityName}StatusValues.ts`;
    const filePath = path.resolve(config.output, fileName);
    
    await fs.ensureDir(config.output);
    await fs.writeFile(filePath, content);
    
    console.log(`  📄 ${filePath}`);
    return filePath;
  }
  
  private async loadTemplate(templateName: string): Promise<string> {
    const templatePath = path.join(this.templatesPath, templateName);
    
    if (await fs.pathExists(templatePath)) {
      return fs.readFile(templatePath, 'utf-8');
    }
    
    // Return default template if specific template not found
    return this.getDefaultTemplate(templateName);
  }
  
  private getDefaultTemplate(templateName: string): string {
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
  
  private getDtoTemplate(): string {
    return `// DTO template - generated by DomainGenerator
export class {{dtoName}} {
  {{#each fields}}
  {{name}}: {{tsType type}};
  {{/each}}
}`;
  }
  
  private getEnumTemplate(): string {
    return `// Enum template - generated by DomainGenerator
export enum {{enumName}} {
  {{#each enumValues}}
  {{this}} = "{{this}}"{{#unless @last}},{{/unless}}
  {{/each}}
}`;
  }
  
  private getStatusValuesTemplate(): string {
    return `// Status values template - generated by DomainGenerator`;
  }
  
  private toCamelCase(str: string): string {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }
}