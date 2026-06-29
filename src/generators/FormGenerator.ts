/**
 * FormGenerator - Generate form components based on templates
 * 
 * Generates forms using Archbase components with proper validation and TypeScript support.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import Handlebars from 'handlebars';
import { resolveCommonTemplateFallback } from '../utils/templates';

interface FormConfig {
  fields?: string;
  validation: 'yup' | 'zod' | 'none';
  template: 'basic' | 'wizard' | 'validation';
  output: string;
  typescript: boolean;
  test: boolean;
  story: boolean;
  dataSourceVersion?: 'v1' | 'v2';
  datasourceVersion?: 'v1' | 'v2'; // Alternative camelCase format from CLI
  withArrayFields?: boolean;
  layout?: 'vertical' | 'horizontal' | 'grid';
  category?: string; // Admin navigation category
  feature?: string;  // Feature name for routing
  dto?: string; // Path to DTO file for field extraction
}

interface FieldDefinition {
  name: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  validation?: string;
  /** For enum fields: the enum type name (e.g. ProductStatus) the select binds to. */
  enumName?: string;
}

interface GenerationResult {
  files: string[];
  success: boolean;
  errors?: string[];
}

export class FormGenerator {
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
    
    // Register conditional helpers
    this.handlebars.registerHelper('if_eq', (a: any, b: any, options: any) => {
      if (a === b) {
        return options.fn(options.data?.root || {});
      }
      return options.inverse(options.data?.root || {});
    });
    
    // Register array includes helper
    this.handlebars.registerHelper('includes', (array: any[], item: any) => {
      return array && array.includes(item);
    });
    
    // Register capitalize first helper
    this.handlebars.registerHelper('capitalizeFirst', (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    });
    
    // Register lowercase helper
    this.handlebars.registerHelper('toLowerCase', (str: string) => {
      return str.toLowerCase();
    });
    
    // Register TypeScript type helper for forms
    this.handlebars.registerHelper('tsType', (inputType: string) => {
      const typeMapping: { [key: string]: string } = {
        'text': 'string',
        'email': 'string',
        'password': 'string',
        'textarea': 'string',
        'number': 'number',
        'decimal': 'number',
        'date': 'string',
        'datetime': 'string',
        'checkbox': 'boolean',
        'select': 'string',
        'enum': 'string'
      };
      
      return typeMapping[inputType] || 'string';
    });
    
    // Register helpers for template literals
    this.handlebars.registerHelper('lt', () => '{');
    this.handlebars.registerHelper('gt', () => '}');
  }
  
  async generate(name: string, config: FormConfig): Promise<GenerationResult> {
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
          { name: 'name', type: 'text', label: 'Name', required: true },
          { name: 'email', type: 'email', label: 'Email', required: true }
        ];
      }
      
      const context = this.buildTemplateContext(name, fields, config);
      const files: string[] = [];
      
      // Generate main component file
      const componentFile = await this.generateComponent(name, context, config);
      files.push(componentFile);
      
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
        { name: 'name', type: 'text', label: 'Name', required: true },
        { name: 'email', type: 'email', label: 'Email', required: true }
      ];
    }
    
    return fieldsString.split(',').map(field => {
      const parts = field.trim().split(':');
      const name = parts[0].trim();
      const type = (parts[1] || 'text').trim();

      const def: FieldDefinition = {
        name,
        type,
        label: this.capitalizeFirst(name),
        required: true,
        placeholder: `Enter ${name}...`,
        validation: this.getValidationForType(type),
      };
      // Enum fields carry their values in the 3rd token (status:enum:A|B|C); the
      // enum name is resolved against the entity in buildTemplateContext.
      return def;
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
        
        // Skip audit and system fields
        if (['id', 'code', 'version', 'createEntityDate', 'updateEntityDate', 
             'createdByUser', 'lastModifiedByUser'].includes(fieldName)) {
          continue;
        }
        
        // Skip the new record flag (DomainGenerator emits `isNew`; legacy DTOs used `isNovo*`)
        if (fieldName === 'isNew' || fieldName.startsWith('isNovo')) {
          continue;
        }

        // Convert TypeScript type to form input type
        const inputType = this.convertTypeScriptToInputType(fieldType);
        
        // Check if field is required by looking at decorators
        const fieldStart = match.index;
        const fieldSection = dtoContent.substring(Math.max(0, fieldStart - 200), fieldStart);
        const isRequired = fieldSection.includes('@IsNotEmpty') || fieldSection.includes('@NotEmpty');
        
        fields.push({
          name: fieldName,
          type: inputType,
          label: this.capitalizeFirst(fieldName),
          required: isRequired,
          placeholder: `Enter ${fieldName}...`,
          validation: this.getValidationForType(inputType)
        });
      }
      
      return fields;
      
    } catch (error) {
      throw new Error(`Failed to extract fields from DTO: ${error.message}`);
    }
  }
  
  private convertTypeScriptToInputType(tsType: string): string {
    // Clean up the type string
    const cleanType = tsType.replace(/\s+/g, '').toLowerCase();
    
    // Type mapping
    const typeMap: { [key: string]: string } = {
      'string': 'text',
      'number': 'number',
      'boolean': 'checkbox',
      'date': 'date',
      'string[]': 'array',
      'number[]': 'array'
    };
    
    // Check for enum types (uppercase names)
    if (tsType.match(/^[A-Z]/)) {
      return 'select';
    }
    
    // Check for array types
    if (cleanType.includes('[]')) {
      return 'array';
    }
    
    // Check for email in field name
    if (cleanType.includes('email')) {
      return 'email';
    }
    
    return typeMap[cleanType] || 'text';
  }
  
  /** The @archbase/components editors a form needs, based on its field types. */
  private getFormEditorImports(fields: FieldDefinition[]): string[] {
    const used = new Set<string>();
    for (const field of fields) {
      switch (field.type) {
        case 'password': used.add('ArchbasePasswordEdit'); break;
        case 'number': used.add('ArchbaseNumberEdit'); break;
        case 'textarea': used.add('ArchbaseTextArea'); break;
        case 'boolean': used.add('ArchbaseSwitch'); break;
        case 'checkbox': used.add('ArchbaseCheckbox'); break;
        case 'select':
        case 'enum': used.add('ArchbaseSelect'); used.add('ArchbaseSelectItem'); break;
        default: used.add('ArchbaseEdit'); break; // text, email, date, ...
      }
    }
    if (used.size === 0) used.add('ArchbaseEdit');
    const ORDER = [
      'ArchbaseEdit', 'ArchbaseNumberEdit', 'ArchbasePasswordEdit', 'ArchbaseTextArea',
      'ArchbaseSelect', 'ArchbaseSelectItem', 'ArchbaseCheckbox', 'ArchbaseSwitch',
    ];
    return ORDER.filter(component => used.has(component));
  }

  private buildTemplateContext(name: string, fields: FieldDefinition[], config: FormConfig) {
    const entityName = name.replace(/Form$/, '');
    // Resolve each enum field's enum type (matches DomainGenerator: Entity + PascalField).
    const pascal = (s: string) =>
      s.replace(/[_\-\s]+(\w)/g, (_m, c) => c.toUpperCase()).replace(/^(\w)/, (_m, c) => c.toUpperCase());
    for (const field of fields) {
      if (field.type === 'enum') {
        field.enumName = `${entityName}${pascal(field.name)}`;
      }
    }
    const enumImports = Array.from(
      new Set(
        fields
          .filter(f => f.type === 'enum' && f.enumName)
          .map(f => `import { ${f.enumName} } from '../../domain/${f.enumName}';`),
      ),
    );

    return {
      componentName: name,
      entityName,
      iocTypesName: (config as any).iocTypesName || 'IOCTypes',
      formEditorImports: this.getFormEditorImports(fields),
      enumImports,
      fields,
      useValidation: config.validation !== 'none',
      validationLibrary: config.validation,
      typescript: config.typescript,
      // DataSource V2 support
      dataSourceVersion: config.dataSourceVersion || config.datasourceVersion || 'v2',
      withArrayFields: config.withArrayFields || false,
      layout: config.layout || 'vertical',
      // Array field helpers for V2
      hasArrayFields: fields.some(f => f.type === 'array'),
      arrayFields: fields.filter(f => f.type === 'array').map(f => ({
        ...f,
        capitalizedName: this.capitalizeFirst(f.name)
      })),
      // Additional V2 features
      dataSourceImports: this.generateDataSourceImports(config.dataSourceVersion || 'v2'),
      arrayFieldMethods: config.withArrayFields ? this.generateArrayFieldMethods() : [],
      // Admin navigation patterns
      category: config.category || 'configuracao',
      feature: config.feature || this.generateFeatureName(name),
      adminRoute: this.generateAdminRoute(config.category, config.feature, name)
    };
  }
  
  private async generateComponent(name: string, context: any, config: FormConfig): Promise<string> {
    // Use DataSource V2 template if specified and has array fields
    let templateName = `forms/${config.template}.hbs`;
    const dsVersion = config.dataSourceVersion || config.datasourceVersion;
    if (dsVersion === 'v2' && (config.withArrayFields || context.hasArrayFields)) {
      templateName = 'forms/datasource-v2.hbs';
    }
    
    const template = await this.loadTemplate(templateName);
    const compiled = this.handlebars.compile(template);
    const content = compiled(context);
    
    const ext = config.typescript ? '.tsx' : '.jsx';
    const fileName = `${name}${ext}`;
    const filePath = path.resolve(config.output, fileName);
    
    await fs.ensureDir(config.output);
    await fs.writeFile(filePath, content);
    
    console.log(`  📄 ${filePath}`);
    return filePath;
  }
  
  private async generateTest(name: string, context: any, config: FormConfig): Promise<string> {
    const template = await this.loadTemplate('forms/test.hbs');
    const compiled = this.handlebars.compile(template);
    const content = compiled(context);
    
    const ext = config.typescript ? '.test.tsx' : '.test.jsx';
    const fileName = `${name}${ext}`;
    const filePath = path.join(config.output, '__tests__', fileName);
    
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content);
    
    return filePath;
  }
  
  private async generateStory(name: string, context: any, config: FormConfig): Promise<string> {
    const template = await this.loadTemplate('forms/story.hbs');
    const compiled = this.handlebars.compile(template);
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

    // Test/story templates fall back to the shared common templates.
    const common = await resolveCommonTemplateFallback(this.templatesPath, templateName);
    if (common !== null) {
      return common;
    }

    // Return default template if specific template not found
    return this.getDefaultTemplate(templateName);
  }
  
  private getDefaultTemplate(templateName: string): string {
    if (templateName.includes('basic')) {
      return this.getBasicFormTemplate();
    }
    
    if (templateName.includes('test')) {
      return this.getTestTemplate();
    }
    
    if (templateName.includes('story')) {
      return this.getStoryTemplate();
    }
    
    return this.getBasicFormTemplate();
  }
  
  private getBasicFormTemplate(): string {
    return `import React from 'react';
{{#if useValidation}}
import * as {{validationLibrary}} from '{{validationLibrary}}';
{{/if}}
import { ArchbaseEdit } from '@archbase/components';
import { Button } from '@mantine/core';

{{#if typescript}}
interface {{componentName}}Props {
  onSubmit: (values: {{entityName}}) => Promise<void>;
  initialValues?: Partial<{{entityName}}>;
}

interface {{entityName}} {
  {{#each fields}}
  {{name}}: {{#if (eq type 'number')}}number{{else}}string{{/if}};
  {{/each}}
}
{{/if}}

{{#if useValidation}}
const validationSchema = {{validationLibrary}}.object({
  {{#each fields}}
  {{#if validation}}
  {{name}}: {{validation}},
  {{/if}}
  {{/each}}
});
{{/if}}

const {{componentName}}{{#if typescript}}: React.FC<{{componentName}}Props>{{/if}} = ({
  onSubmit,
  initialValues
}) => {
  const [values, setValues] = React.useState(initialValues || {});
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      {{#if useValidation}}
      await validationSchema.validate(values);
      {{/if}}
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: string) => (value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      {{#each fields}}
      <ArchbaseEdit
        label="{{label}}"
        placeholder="{{placeholder}}"
        value={values.{{name}} || ''}
        onChangeValue={handleFieldChange('{{name}}')}
        {{#if required}}required{{/if}}
        {{#if (eq type 'email')}}type="email"{{/if}}
        {{#if (eq type 'password')}}type="password"{{/if}}
      />
      {{/each}}
      
      <Button
        type="submit"
        loading={loading}
        disabled={loading}
      >
        Submit
      </Button>
    </form>
  );
};

export default {{componentName}};`;
  }
  
  private getTestTemplate(): string {
    return `import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {{componentName}} from '../{{componentName}}';

describe('{{componentName}}', () => {
  const mockSubmit = jest.fn();

  beforeEach(() => {
    mockSubmit.mockClear();
  });

  it('renders all form fields', () => {
    render(<{{componentName}} onSubmit={mockSubmit} />);
    
    {{#each fields}}
    expect(screen.getByLabelText('{{label}}')).toBeInTheDocument();
    {{/each}}
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('calls onSubmit with form values', async () => {
    const user = userEvent.setup();
    render(<{{componentName}} onSubmit={mockSubmit} />);

    {{#each fields}}
    await user.type(screen.getByLabelText('{{label}}'), 'test{{name}}');
    {{/each}}
    
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        {{#each fields}}
        {{name}}: 'test{{name}}',
        {{/each}}
      });
    });
  });
});`;
  }
  
  private getStoryTemplate(): string {
    return `import type { Meta, StoryObj } from '@storybook/react';
import {{componentName}} from '../{{componentName}}';

const meta: Meta<typeof {{componentName}}> = {
  title: 'Forms/{{componentName}}',
  component: {{componentName}},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: async (values) => {
      console.log('Form submitted:', values);
    },
  },
};

export const WithInitialValues: Story = {
  args: {
    onSubmit: async (values) => {
      console.log('Form submitted:', values);
    },
    initialValues: {
      {{#each fields}}
      {{name}}: '{{#if (eq type 'email')}}test@example.com{{else}}Sample {{label}}{{/if}}',
      {{/each}}
    },
  },
};`;
  }
  
  private getValidationForType(type: string): string {
    switch (type) {
      case 'email': return 'yup.string().email().required()';
      case 'password': return 'yup.string().min(6).required()';
      case 'number': return 'yup.number().required()';
      default: return 'yup.string().required()';
    }
  }
  
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private generateDataSourceImports(version: 'v1' | 'v2'): string[] {
    const baseImports = ['FormBuilder', 'FieldConfig'];
    
    if (version === 'v2') {
      return [...baseImports, 'ArchbaseDataSourceV2', 'useArchbaseDataSource'];
    } else {
      return [...baseImports, 'ArchbaseDataSource'];
    }
  }

  private generateArrayFieldMethods(): string[] {
    return [
      'appendToFieldArray',
      'removeFromFieldArray', 
      'moveInFieldArray'
    ];
  }

  private generateFeatureName(componentName: string): string {
    // Convert "ClienteForm" -> "cliente"
    // Convert "UserRegistrationForm" -> "user-registration"
    return componentName
      .replace(/Form$/, '') // Remove "Form" suffix
      .replace(/([A-Z])/g, (match, letter, index) => 
        index === 0 ? letter.toLowerCase() : `-${letter.toLowerCase()}`
      );
  }

  private generateAdminRoute(category?: string, feature?: string, componentName?: string): string {
    const cat = category || 'configuracao';
    const feat = feature || this.generateFeatureName(componentName || '');
    return `/admin/${cat}/${feat}`;
  }
}