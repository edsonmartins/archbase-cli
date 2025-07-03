/**
 * ViewGenerator - Generate list/grid view components based on powerview-admin patterns
 * 
 * Generates CRUD list views using ArchbaseDataGrid with proper navigation, 
 * filtering, permissions, and actions following the exact patterns from powerview-admin.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import Handlebars from 'handlebars';

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
  dto?: string; // Path to DTO file for field extraction
}

interface FieldDefinition {
  name: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  filterable?: boolean;
  sortable?: boolean;
  size?: number;
  width?: number;
}

interface GenerationResult {
  files: string[];
  success: boolean;
  errors?: string[];
}

export class ViewGenerator {
  private templatesPath: string;
  
  constructor(templatesPath: string = path.join(__dirname, '../../src/templates')) {
    this.templatesPath = templatesPath;
    this.registerHandlebarsHelpers();
  }
  
  private registerHandlebarsHelpers() {
    // Register equality helper
    Handlebars.registerHelper('eq', (a: any, b: any) => {
      return a === b;
    });
    
    // Register conditional helpers
    Handlebars.registerHelper('if_eq', (a: any, b: any, options: any) => {
      if (a === b) {
        return options.fn(options.data?.root || {});
      }
      return options.inverse(options.data?.root || {});
    });
    
    // Register array includes helper
    Handlebars.registerHelper('includes', (array: any[], item: any) => {
      return array && array.includes(item);
    });
    
    // Register capitalize first helper
    Handlebars.registerHelper('capitalizeFirst', (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    });
    
    // Register lowercase helper
    Handlebars.registerHelper('toLowerCase', (str: string) => {
      return str.toLowerCase();
    });
    
    // Register helpers for template literals
    Handlebars.registerHelper('lt', () => '{');
    Handlebars.registerHelper('gt', () => '}');
  }
  
  async generate(name: string, config: ViewConfig): Promise<GenerationResult> {
    try {
      let fields: FieldDefinition[];
      
      // Extract fields from DTO if provided
      if (config.dto) {
        fields = await this.extractFieldsFromDto(config.dto);
      } else if (config.fields) {
        fields = this.parseFields(config.fields);
      } else {
        // Default fields if neither DTO nor fields provided
        fields = [
          { name: 'name', type: 'text', label: 'Name', width: 200, sortable: true, filterable: true },
          { name: 'status', type: 'enum', label: 'Status', width: 120, sortable: true, filterable: true }
        ];
      }
      
      const context = this.buildTemplateContext(name, fields, config);
      const files: string[] = [];
      
      // Generate main view component file
      const viewFile = await this.generateView(name, context, config);
      files.push(viewFile);
      
      // Generate test file if requested
      if (config.test) {
        const testFile = await this.generateTest(name, context, config);
        files.push(testFile);
      }
      
      // Generate Storybook story if requested
      if (config.story) {
        const storyFile = await this.generateStory(name, context, config);
        files.push(storyFile);
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
  
  private parseFields(fieldsString: string): FieldDefinition[] {
    if (!fieldsString) {
      return [
        { name: 'code', type: 'text', label: 'Código', required: true, filterable: true, sortable: true, size: 140 },
        { name: 'nome', type: 'text', label: 'Nome', required: true, filterable: true, sortable: true },
        { name: 'status', type: 'enum', label: 'Status', required: true, filterable: true, sortable: true, size: 120 }
      ];
    }
    
    return fieldsString.split(',').map(field => {
      const [name, type = 'text'] = field.trim().split(':');
      
      return {
        name: name.trim(),
        type: type.trim(),
        label: this.capitalizeFirst(name.trim()),
        required: true,
        filterable: this.isFilterableType(type.trim()),
        sortable: this.isSortableType(type.trim()),
        size: this.getDefaultSize(type.trim())
      };
    });
  }
  
  private async extractFieldsFromDto(dtoPath: string): Promise<FieldDefinition[]> {
    try {
      // Read DTO file
      const dtoContent = await fs.readFile(dtoPath, 'utf-8');
      const fields: FieldDefinition[] = [];
      
      // Extract field definitions from DTO class
      const fieldRegex = /(?:@\w+[^}]*\n\s*)*(\w+):\s*([^;]+);/g;
      let match;
      
      while ((match = fieldRegex.exec(dtoContent)) !== null) {
        const fieldName = match[1];
        const fieldType = match[2].trim();
        
        // Skip audit and system fields for view (keep only relevant display fields)
        if (['id', 'code', 'version', 'createEntityDate', 'updateEntityDate', 
             'createdByUser', 'lastModifiedByUser'].includes(fieldName)) {
          continue;
        }
        
        // Skip the new record flag
        if (fieldName.startsWith('isNovo')) {
          continue;
        }
        
        // Convert TypeScript type to grid column type
        const columnType = this.convertTypeScriptToColumnType(fieldType);
        
        // Determine column width based on type
        const width = this.getColumnWidth(fieldType, fieldName);
        
        fields.push({
          name: fieldName,
          type: columnType,
          label: this.capitalizeFirst(fieldName),
          width,
          sortable: true,
          filterable: true
        });
      }
      
      return fields;
      
    } catch (error) {
      throw new Error(`Failed to extract fields from DTO: ${error.message}`);
    }
  }
  
  private convertTypeScriptToColumnType(tsType: string): string {
    // Clean up the type string
    const cleanType = tsType.replace(/\s+/g, '').toLowerCase();
    
    // Type mapping for DataGrid columns
    const typeMap: { [key: string]: string } = {
      'string': 'text',
      'number': 'number',
      'boolean': 'boolean',
      'date': 'date',
      'string[]': 'text',
      'number[]': 'number'
    };
    
    // Check for enum types (uppercase names)
    if (tsType.match(/^[A-Z]/)) {
      return 'enum';
    }
    
    // Check for date fields
    if (cleanType.includes('date') || cleanType.includes('time')) {
      return 'date';
    }
    
    return typeMap[cleanType] || 'text';
  }
  
  private getColumnWidth(fieldType: string, fieldName: string): number {
    // Default widths based on field type and name patterns
    if (fieldName.toLowerCase().includes('status')) return 120;
    if (fieldName.toLowerCase().includes('code')) return 100;
    if (fieldName.toLowerCase().includes('nome') || fieldName.toLowerCase().includes('name')) return 200;
    if (fieldName.toLowerCase().includes('email')) return 180;
    if (fieldName.toLowerCase().includes('descric')) return 300;
    if (fieldType === 'boolean') return 80;
    if (fieldType === 'number') return 100;
    if (fieldType.includes('Date')) return 150;
    
    return 150; // Default width
  }
  
  private buildTemplateContext(name: string, fields: FieldDefinition[], config: ViewConfig) {
    return {
      componentName: name,
      entityName: name.replace(/View$/, ''),
      fields,
      typescript: config.typescript,
      // Permission features
      withPermissions: config.withPermissions !== false, // Default true
      // Grid features
      withFilters: config.withFilters !== false, // Default true
      withPagination: config.withPagination !== false, // Default true
      withSorting: config.withSorting !== false, // Default true
      pageSize: config.pageSize || 25,
      // Navigation patterns
      category: config.category || 'configuracao',
      feature: config.feature || this.generateFeatureName(name),
      adminRoute: this.generateAdminRoute(config.category, config.feature, name),
      featureConstant: (config.feature || this.generateFeatureName(name)).toUpperCase(),
      // Pre-generated navigation expressions
      addNavigateExpression: `\`\${${(config.feature || this.generateFeatureName(name)).toUpperCase()}_ROUTE}/\${t('Novo')}->\${Date.now()}\``,
      editNavigateExpression: `\`\${${(config.feature || this.generateFeatureName(name)).toUpperCase()}_ROUTE}/\${record.id}\``,
      viewNavigateExpression: `\`\${${(config.feature || this.generateFeatureName(name)).toUpperCase()}_ROUTE}/\${row.id}\``,
      // Column definitions
      textColumns: fields.filter(f => f.type === 'text'),
      enumColumns: fields.filter(f => f.type === 'enum'),
      dateColumns: fields.filter(f => f.type === 'date' || f.type === 'datetime'),
      imageColumns: fields.filter(f => f.type === 'image'),
      uuidColumns: fields.filter(f => f.type === 'uuid'),
      // Grid configuration
      hasFilterableColumns: fields.some(f => f.filterable),
      hasSortableColumns: fields.some(f => f.sortable),
      hasImageColumns: fields.some(f => f.type === 'image'),
      hasEnumColumns: fields.some(f => f.type === 'enum'),
      hasDateColumns: fields.some(f => f.type === 'date' || f.type === 'datetime')
    };
  }
  
  private async generateView(name: string, context: any, config: ViewConfig): Promise<string> {
    const templateName = 'views/crud-list.hbs';
    const template = await this.loadTemplate(templateName);
    const compiled = Handlebars.compile(template);
    const content = compiled(context);
    
    const ext = config.typescript ? '.tsx' : '.jsx';
    const fileName = `${name}${ext}`;
    const filePath = path.resolve(config.output, fileName);
    
    await fs.ensureDir(config.output);
    await fs.writeFile(filePath, content);
    
    console.log(`  📄 ${filePath}`);
    return filePath;
  }
  
  private async generateTest(name: string, context: any, config: ViewConfig): Promise<string> {
    const template = await this.loadTemplate('views/test.hbs');
    const compiled = Handlebars.compile(template);
    const content = compiled(context);
    
    const ext = config.typescript ? '.test.tsx' : '.test.jsx';
    const fileName = `${name}${ext}`;
    const filePath = path.join(config.output, '__tests__', fileName);
    
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content);
    
    return filePath;
  }
  
  private async generateStory(name: string, context: any, config: ViewConfig): Promise<string> {
    const template = await this.loadTemplate('views/story.hbs');
    const compiled = Handlebars.compile(template);
    const content = compiled(context);
    
    const fileName = `${name}.stories.tsx`;
    const filePath = path.join(config.output, '__stories__', fileName);
    
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content);
    
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
    if (templateName.includes('crud-list')) {
      return this.getCrudListTemplate();
    }
    
    if (templateName.includes('test')) {
      return this.getViewTestTemplate();
    }
    
    if (templateName.includes('story')) {
      return this.getViewStoryTemplate();
    }
    
    return this.getCrudListTemplate();
  }
  
  private getCrudListTemplate(): string {
    return `// Default CRUD list template - should be replaced with actual template file`;
  }
  
  private getViewTestTemplate(): string {
    return `// Default view test template`;
  }
  
  private getViewStoryTemplate(): string {
    return `// Default view story template`;
  }
  
  private isFilterableType(type: string): boolean {
    const filterableTypes = ['text', 'email', 'enum', 'date', 'datetime', 'number'];
    return filterableTypes.includes(type);
  }
  
  private isSortableType(type: string): boolean {
    const nonSortableTypes = ['image'];
    return !nonSortableTypes.includes(type);
  }
  
  private getDefaultSize(type: string): number | undefined {
    const sizeMap: Record<string, number> = {
      'uuid': 400,
      'date': 140,
      'datetime': 140,
      'image': 140,
      'enum': 120
    };
    return sizeMap[type];
  }
  
  private generateFeatureName(componentName: string): string {
    // Convert "ClienteView" -> "cliente"
    // Convert "UserManagementView" -> "user-management"
    return componentName
      .replace(/View$/, '') // Remove "View" suffix
      .replace(/([A-Z])/g, (match, letter, index) => 
        index === 0 ? letter.toLowerCase() : `-${letter.toLowerCase()}`
      );
  }
  
  private generateAdminRoute(category?: string, feature?: string, componentName?: string): string {
    const cat = category || 'configuracao';
    const feat = feature || this.generateFeatureName(componentName || '');
    return `/admin/${cat}/${feat}`;
  }
  
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}