"use strict";
/**
 * FormGenerator - Generate form components based on templates
 *
 * Generates forms using Archbase components with proper validation and TypeScript support.
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
exports.FormGenerator = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
class FormGenerator {
    constructor(templatesPath = path.join(__dirname, '../../src/templates')) {
        this.templatesPath = templatesPath;
        this.registerHandlebarsHelpers();
    }
    registerHandlebarsHelpers() {
        // Register equality helper
        handlebars_1.default.registerHelper('eq', (a, b) => {
            return a === b;
        });
        // Register conditional helpers
        handlebars_1.default.registerHelper('if_eq', (a, b, options) => {
            if (a === b) {
                return options.fn(options.data?.root || {});
            }
            return options.inverse(options.data?.root || {});
        });
        // Register array includes helper
        handlebars_1.default.registerHelper('includes', (array, item) => {
            return array && array.includes(item);
        });
        // Register capitalize first helper
        handlebars_1.default.registerHelper('capitalizeFirst', (str) => {
            return str.charAt(0).toUpperCase() + str.slice(1);
        });
        // Register lowercase helper
        handlebars_1.default.registerHelper('toLowerCase', (str) => {
            return str.toLowerCase();
        });
        // Register TypeScript type helper for forms
        handlebars_1.default.registerHelper('tsType', (inputType) => {
            const typeMapping = {
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
        handlebars_1.default.registerHelper('lt', () => '{');
        handlebars_1.default.registerHelper('gt', () => '}');
    }
    async generate(name, config) {
        try {
            let fields;
            // Extract fields from DTO if provided
            if (config.dto) {
                fields = await this.extractFieldsFromDto(config.dto);
            }
            else if (config.fields) {
                fields = this.parseFields(config.fields);
            }
            else {
                // Default fields if neither DTO nor fields provided
                fields = [
                    { name: 'name', type: 'text', label: 'Name', required: true },
                    { name: 'email', type: 'email', label: 'Email', required: true }
                ];
            }
            const context = this.buildTemplateContext(name, fields, config);
            const files = [];
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
        }
        catch (error) {
            return {
                files: [],
                success: false,
                errors: [error.message]
            };
        }
    }
    parseFields(fieldsString) {
        if (!fieldsString) {
            return [
                { name: 'name', type: 'text', label: 'Name', required: true },
                { name: 'email', type: 'email', label: 'Email', required: true }
            ];
        }
        return fieldsString.split(',').map(field => {
            const [name, type = 'text'] = field.trim().split(':');
            return {
                name: name.trim(),
                type: type.trim(),
                label: this.capitalizeFirst(name.trim()),
                required: true,
                placeholder: `Enter ${name.trim()}...`,
                validation: this.getValidationForType(type.trim())
            };
        });
    }
    async extractFieldsFromDto(dtoPath) {
        try {
            // Read DTO file
            const dtoContent = await fs.readFile(dtoPath, 'utf-8');
            const fields = [];
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
                // Skip the new record flag
                if (fieldName.startsWith('isNovo')) {
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
        }
        catch (error) {
            throw new Error(`Failed to extract fields from DTO: ${error.message}`);
        }
    }
    convertTypeScriptToInputType(tsType) {
        // Clean up the type string
        const cleanType = tsType.replace(/\s+/g, '').toLowerCase();
        // Type mapping
        const typeMap = {
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
    buildTemplateContext(name, fields, config) {
        return {
            componentName: name,
            entityName: name.replace(/Form$/, ''),
            fields,
            useValidation: config.validation !== 'none',
            validationLibrary: config.validation,
            typescript: config.typescript,
            hasRequiredFields: fields.some(f => f.required),
            imports: this.generateImports(fields, config),
            validationSchema: this.generateValidationSchema(fields, config.validation),
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
    async generateComponent(name, context, config) {
        // Use DataSource V2 template if specified and has array fields
        let templateName = `forms/${config.template}.hbs`;
        const dsVersion = config.dataSourceVersion || config.datasourceVersion;
        if (dsVersion === 'v2' && (config.withArrayFields || context.hasArrayFields)) {
            templateName = 'forms/datasource-v2.hbs';
        }
        const template = await this.loadTemplate(templateName);
        const compiled = handlebars_1.default.compile(template);
        const content = compiled(context);
        const ext = config.typescript ? '.tsx' : '.jsx';
        const fileName = `${name}${ext}`;
        const filePath = path.resolve(config.output, fileName);
        await fs.ensureDir(config.output);
        await fs.writeFile(filePath, content);
        console.log(`  📄 ${filePath}`);
        return filePath;
    }
    async generateTest(name, context, config) {
        const template = await this.loadTemplate('forms/test.hbs');
        const compiled = handlebars_1.default.compile(template);
        const content = compiled(context);
        const ext = config.typescript ? '.test.tsx' : '.test.jsx';
        const fileName = `${name}${ext}`;
        const filePath = path.join(config.output, '__tests__', fileName);
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, content);
        return filePath;
    }
    async generateStory(name, context, config) {
        const template = await this.loadTemplate('forms/story.hbs');
        const compiled = handlebars_1.default.compile(template);
        const content = compiled(context);
        const fileName = `${name}.stories.tsx`;
        const filePath = path.join(config.output, '__stories__', fileName);
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, content);
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
    getBasicFormTemplate() {
        return `import React from 'react';
{{#if useValidation}}
import * as {{validationLibrary}} from '{{validationLibrary}}';
{{/if}}
import { ArchbaseEdit, ArchbaseButton } from '@archbase/react';

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
      
      <ArchbaseButton
        type="submit"
        loading={loading}
        disabled={loading}
      >
        Submit
      </ArchbaseButton>
    </form>
  );
};

export default {{componentName}};`;
    }
    getTestTemplate() {
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
    getStoryTemplate() {
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
    generateImports(fields, config) {
        const components = ['ArchbaseEdit', 'ArchbaseButton'];
        // Add specific components based on field types
        fields.forEach(field => {
            if (field.type === 'select')
                components.push('ArchbaseSelect');
            if (field.type === 'textarea')
                components.push('ArchbaseTextArea');
            if (field.type === 'checkbox')
                components.push('ArchbaseCheckbox');
        });
        // Remove duplicates and create import statements
        const uniqueComponents = [...new Set(components)];
        return [
            "import React from 'react';",
            `import { ${uniqueComponents.join(', ')} } from '@archbase/react';`,
            config.validation !== 'none' ? `import * as ${config.validation} from '${config.validation}';` : ''
        ].filter(Boolean);
    }
    generateValidationSchema(fields, library) {
        if (library === 'none')
            return '';
        const validations = fields.map(field => {
            let validation = `${field.name}: ${library}.string()`;
            if (field.required) {
                validation += '.required()';
            }
            if (field.type === 'email') {
                validation += '.email()';
            }
            if (field.type === 'number') {
                validation = `${field.name}: ${library}.number()`;
                if (field.required)
                    validation += '.required()';
            }
            return validation;
        });
        return validations.join(',\n  ');
    }
    getValidationForType(type) {
        switch (type) {
            case 'email': return 'yup.string().email().required()';
            case 'password': return 'yup.string().min(6).required()';
            case 'number': return 'yup.number().required()';
            default: return 'yup.string().required()';
        }
    }
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    generateDataSourceImports(version) {
        const baseImports = ['FormBuilder', 'FieldConfig'];
        if (version === 'v2') {
            return [...baseImports, 'ArchbaseDataSourceV2', 'useArchbaseDataSource'];
        }
        else {
            return [...baseImports, 'ArchbaseDataSource'];
        }
    }
    generateArrayFieldMethods() {
        return [
            'appendToFieldArray',
            'removeFromFieldArray',
            'moveInFieldArray'
        ];
    }
    generateFeatureName(componentName) {
        // Convert "ClienteForm" -> "cliente"
        // Convert "UserRegistrationForm" -> "user-registration"
        return componentName
            .replace(/Form$/, '') // Remove "Form" suffix
            .replace(/([A-Z])/g, (match, letter, index) => index === 0 ? letter.toLowerCase() : `-${letter.toLowerCase()}`);
    }
    generateAdminRoute(category, feature, componentName) {
        const cat = category || 'configuracao';
        const feat = feature || this.generateFeatureName(componentName || '');
        return `/admin/${cat}/${feat}`;
    }
}
exports.FormGenerator = FormGenerator;
//# sourceMappingURL=FormGenerator.js.map