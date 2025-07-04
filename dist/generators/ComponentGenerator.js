"use strict";
/**
 * ComponentGenerator - Generate custom components
 *
 * Generates reusable components with different types and configurations.
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
exports.ComponentGenerator = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
class ComponentGenerator {
    constructor(templatesPath = path.join(__dirname, '../../templates')) {
        this.templatesPath = templatesPath;
    }
    async generate(name, config) {
        try {
            const props = config.props ? this.parseProps(config.props) : [];
            const hooks = config.hooks ? this.parseHooks(config.hooks) : [];
            const context = this.buildTemplateContext(name, props, hooks, config);
            const files = [];
            // Generate main component file
            const componentFile = await this.generateComponent(name, context, config);
            files.push(componentFile);
            // Generate test file if requested
            if (config.test) {
                const testFile = await this.generateTest(name, context, config);
                files.push(testFile);
            }
            // Generate story file if requested
            if (config.story) {
                const storyFile = await this.generateStory(name, context, config);
                files.push(storyFile);
            }
            return {
                files,
                success: true
            };
        }
        catch (error) {
            return {
                files: [],
                success: false,
                errors: [error.message]
            };
        }
    }
    parseProps(propsString) {
        return propsString.split(',').map(prop => {
            const [nameType, defaultValue] = prop.trim().split('=');
            const [name, type = 'string'] = nameType.split(':');
            const required = !defaultValue;
            return {
                name: name.trim(),
                type: type.trim(),
                required,
                defaultValue: defaultValue?.trim()
            };
        });
    }
    parseHooks(hooksString) {
        return hooksString.split(',').map(hook => {
            const [name, type = 'state'] = hook.trim().split(':');
            return {
                name: name.trim(),
                type: type.trim()
            };
        });
    }
    buildTemplateContext(name, props, hooks, config) {
        return {
            componentName: name,
            componentType: config.type,
            props,
            hooks,
            typescript: config.typescript,
            withState: config.withState,
            withEffects: config.withEffects,
            withMemo: config.withMemo,
            imports: this.getRequiredImports(config, props, hooks),
            interfaces: this.buildInterfaces(name, props, config.typescript),
            defaultProps: this.buildDefaultProps(props)
        };
    }
    getRequiredImports(config, props, hooks) {
        const imports = [];
        // Base React import
        let reactImports = ['React'];
        if (config.withState || hooks.some(h => h.type === 'state')) {
            reactImports.push('useState');
        }
        if (config.withEffects || hooks.some(h => h.type === 'effect')) {
            reactImports.push('useEffect');
        }
        if (config.withMemo) {
            reactImports.push('useMemo', 'useCallback');
        }
        if (reactImports.length === 1) {
            imports.push(`import ${reactImports[0]} from 'react';`);
        }
        else {
            const [first, ...rest] = reactImports;
            imports.push(`import ${first}, { ${rest.join(', ')} } from 'react';`);
        }
        // Type-specific imports
        switch (config.type) {
            case 'input':
                imports.push("import { ArchbaseEdit, ArchbaseSelect, ArchbaseCheckbox } from 'archbase-react';");
                break;
            case 'display':
                imports.push("import { ArchbaseCard, ArchbaseText, ArchbaseImage } from 'archbase-react';");
                break;
            case 'layout':
                imports.push("import { ArchbaseContainer, ArchbaseRow, ArchbaseCol } from 'archbase-react';");
                break;
        }
        return imports;
    }
    buildInterfaces(componentName, props, typescript) {
        if (!typescript || props.length === 0)
            return '';
        const propsInterface = props.map(prop => {
            const optional = !prop.required ? '?' : '';
            const comment = prop.description ? ` // ${prop.description}` : '';
            return `  ${prop.name}${optional}: ${this.getTypeScriptType(prop.type)};${comment}`;
        }).join('\n');
        return `interface ${componentName}Props {\n${propsInterface}\n}`;
    }
    buildDefaultProps(props) {
        const defaultProps = props
            .filter(prop => prop.defaultValue)
            .map(prop => `${prop.name}: ${prop.defaultValue}`)
            .join(',\n  ');
        return defaultProps ? `{\n  ${defaultProps}\n}` : '{}';
    }
    getTypeScriptType(type) {
        switch (type) {
            case 'number': return 'number';
            case 'boolean': return 'boolean';
            case 'function': return '() => void';
            case 'node': return 'React.ReactNode';
            case 'string[]': return 'string[]';
            case 'object': return 'Record<string, any>';
            default: return 'string';
        }
    }
    async generateComponent(name, context, config) {
        const template = await this.getTemplate(config.type);
        const content = template(context);
        const outputPath = path.join(config.output, `${name}.tsx`);
        await fs.ensureDir(path.dirname(outputPath));
        await fs.writeFile(outputPath, content);
        return outputPath;
    }
    async generateTest(name, context, config) {
        const template = await this.getTemplate('test');
        const content = template({ ...context, testType: 'component' });
        const outputPath = path.join(config.output, `${name}.test.tsx`);
        await fs.writeFile(outputPath, content);
        return outputPath;
    }
    async generateStory(name, context, config) {
        const template = await this.getTemplate('story');
        const content = template({ ...context, storyType: 'component' });
        const outputPath = path.join(config.output, `${name}.stories.tsx`);
        await fs.writeFile(outputPath, content);
        return outputPath;
    }
    async getTemplate(templateName) {
        // For now, return inline templates
        return this.getInlineTemplate(templateName);
    }
    getInlineTemplate(templateName) {
        // Register helper functions for Handlebars
        handlebars_1.default.registerHelper('eq', function (a, b) {
            return a === b;
        });
        handlebars_1.default.registerHelper('capitalizeFirst', function (str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        });
        const templates = {
            display: this.getDisplayTemplate(),
            input: this.getInputTemplate(),
            layout: this.getLayoutTemplate(),
            functional: this.getFunctionalTemplate(),
            test: this.getTestTemplate(),
            story: this.getStoryTemplate()
        };
        return handlebars_1.default.compile(templates[templateName] || templates.functional);
    }
    getDisplayTemplate() {
        return `{{#each imports}}
{{{this}}}
{{/each}}

{{#if typescript}}
{{{interfaces}}}
{{/if}}

const {{componentName}}{{#if typescript}}: React.FC<{{componentName}}Props>{{/if}} = ({
  {{#each props}}
  {{name}}{{#if defaultValue}} = {{defaultValue}}{{/if}},
  {{/each}}
}) => {
  {{#if withState}}
  {{#each hooks}}
  {{#if (eq type "state")}}
  const [{{name}}, set{{@root.componentName}}{{../name}}] = useState{{#if typescript}}<string>{{/if}}('');
  {{/if}}
  {{/each}}
  {{/if}}
  
  {{#if withEffects}}
  {{#each hooks}}
  {{#if (eq type "effect")}}
  useEffect(() => {
    // Effect logic for {{name}}
  }, []);
  {{/if}}
  {{/each}}
  {{/if}}
  
  return (
    <ArchbaseCard className="{{componentName}}">
      {{#each props}}
      {{#if (eq type "string")}}
      <ArchbaseText>{{{name}}}</ArchbaseText>
      {{/if}}
      {{#if (eq type "node")}}
      {{{name}}}
      {{/if}}
      {{/each}}
    </ArchbaseCard>
  );
};

{{#if typescript}}
{{componentName}}.defaultProps = {{defaultProps}};
{{/if}}

export default {{componentName}};`;
    }
    getInputTemplate() {
        return `{{#each imports}}
{{{this}}}
{{/each}}

{{#if typescript}}
{{{interfaces}}}
{{/if}}

const {{componentName}}{{#if typescript}}: React.FC<{{componentName}}Props>{{/if}} = ({
  {{#each props}}
  {{name}}{{#if defaultValue}} = {{defaultValue}}{{/if}},
  {{/each}}
}) => {
  {{#if withState}}
  {{#each hooks}}
  {{#if (eq type "state")}}
  const [{{name}}, set{{@root.componentName}}{{../name}}] = useState{{#if typescript}}<string>{{/if}}('');
  {{/if}}
  {{/each}}
  {{/if}}
  
  const handleChange = (value{{#if typescript}}: string{{/if}}) => {
    // Handle input change
    console.log('Value changed:', value);
  };
  
  return (
    <div className="{{componentName}}">
      {{#each props}}
      {{#if (eq type "string")}}
      <ArchbaseEdit
        label="{{../componentName}} {{name}}"
        value={{{name}}}
        onChange={handleChange}
        placeholder="Digite {{name}}..."
      />
      {{/if}}
      {{#if (eq type "boolean")}}
      <ArchbaseCheckbox
        label="{{../componentName}} {{name}}"
        checked={{{name}}}
        onChange={handleChange}
      />
      {{/if}}
      {{/each}}
    </div>
  );
};

{{#if typescript}}
{{componentName}}.defaultProps = {{defaultProps}};
{{/if}}

export default {{componentName}};`;
    }
    getLayoutTemplate() {
        return `{{#each imports}}
{{{this}}}
{{/each}}

{{#if typescript}}
{{{interfaces}}}
{{/if}}

const {{componentName}}{{#if typescript}}: React.FC<{{componentName}}Props>{{/if}} = ({
  {{#each props}}
  {{name}}{{#if defaultValue}} = {{defaultValue}}{{/if}},
  {{/each}}
  children
}) => {
  return (
    <ArchbaseContainer className="{{componentName}}">
      {{#each props}}
      {{#if (eq type "string")}}
      <ArchbaseRow>
        <ArchbaseCol>
          <h2>{{{name}}}</h2>
        </ArchbaseCol>
      </ArchbaseRow>
      {{/if}}
      {{/each}}
      
      <ArchbaseRow>
        <ArchbaseCol>
          {children}
        </ArchbaseCol>
      </ArchbaseRow>
    </ArchbaseContainer>
  );
};

{{#if typescript}}
{{componentName}}.defaultProps = {{defaultProps}};
{{/if}}

export default {{componentName}};`;
    }
    getFunctionalTemplate() {
        return `{{#each imports}}
{{{this}}}
{{/each}}

{{#if typescript}}
{{{interfaces}}}
{{/if}}

const {{componentName}}{{#if typescript}}: React.FC<{{componentName}}Props>{{/if}} = ({
  {{#each props}}
  {{name}}{{#if defaultValue}} = {{defaultValue}}{{/if}},
  {{/each}}
}) => {
  {{#if withState}}
  {{#each hooks}}
  {{#if (eq type "state")}}
  const [{{name}}, set{{@root.componentName}}{{../name}}] = useState{{#if typescript}}<any>{{/if}}(null);
  {{/if}}
  {{/each}}
  {{/if}}
  
  {{#if withEffects}}
  {{#each hooks}}
  {{#if (eq type "effect")}}
  useEffect(() => {
    // Effect logic for {{name}}
  }, []);
  {{/if}}
  {{/each}}
  {{/if}}
  
  {{#if withMemo}}
  const memoizedValue = useMemo(() => {
    // Compute expensive value
    return {{#each props}}{{name}}{{#unless @last}} + {{/unless}}{{/each}};
  }, [{{#each props}}{{name}}{{#unless @last}}, {{/unless}}{{/each}}]);
  
  const handleCallback = useCallback(() => {
    // Callback logic
  }, []);
  {{/if}}
  
  return (
    <div className="{{componentName}}">
      <h3>{{componentName}}</h3>
      {{#each props}}
      <p><strong>{{name}}:</strong> {{{name}}}</p>
      {{/each}}
      {{#if withMemo}}
      <p><strong>Memoized Value:</strong> {memoizedValue}</p>
      {{/if}}
    </div>
  );
};

{{#if typescript}}
{{componentName}}.defaultProps = {{defaultProps}};
{{/if}}

export default {{componentName}};`;
    }
    getTestTemplate() {
        return `import { render, screen } from '@testing-library/react';
import {{componentName}} from './{{componentName}}';

describe('{{componentName}}', () => {
  const defaultProps = {
    {{#each props}}
    {{name}}: {{#if defaultValue}}{{defaultValue}}{{else}}{{#if (eq type "string")}}'test {{name}}'{{else}}{{#if (eq type "number")}}123{{else}}{{#if (eq type "boolean")}}true{{else}}null{{/if}}{{/if}}{{/if}}{{/if}},
    {{/each}}
  };

  it('renders without crashing', () => {
    render(<{{componentName}} {...defaultProps} />);
    expect(screen.getByText('{{componentName}}')).toBeInTheDocument();
  });

  {{#each props}}
  it('displays {{name}} prop correctly', () => {
    const testValue = {{#if (eq type "string")}}'test {{name}} value'{{else}}{{#if (eq type "number")}}456{{else}}{{#if (eq type "boolean")}}false{{else}}'test'{{/if}}{{/if}}{{/if}};
    render(<{{../componentName}} {...defaultProps} {{name}}={testValue} />);
    {{#if (eq type "string")}}
    expect(screen.getByText(testValue)).toBeInTheDocument();
    {{/if}}
  });
  {{/each}}

  {{#if withState}}
  it('manages state correctly', () => {
    render(<{{componentName}} {...defaultProps} />);
    // Test state management
  });
  {{/if}}
});`;
    }
    getStoryTemplate() {
        return `import type { Meta, StoryObj } from '@storybook/react';
import {{componentName}} from './{{componentName}}';

const meta: Meta<typeof {{componentName}}> = {
  title: 'Components/{{componentName}}',
  component: {{componentName}},
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    {{#each props}}
    {{name}}: {
      control: '{{#if (eq type "boolean")}}boolean{{else}}{{#if (eq type "number")}}number{{else}}text{{/if}}{{/if}}',
      description: 'The {{name}} prop',
    },
    {{/each}}
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    {{#each props}}
    {{name}}: {{#if defaultValue}}{{defaultValue}}{{else}}{{#if (eq type "string")}}'Sample {{name}}'{{else}}{{#if (eq type "number")}}123{{else}}{{#if (eq type "boolean")}}true{{else}}null{{/if}}{{/if}}{{/if}}{{/if}},
    {{/each}}
  },
};

{{#each props}}
export const With{{@root.capitalizeFirst name}}: Story = {
  args: {
    ...Default.args,
    {{name}}: {{#if (eq type "string")}}'Custom {{name}} value'{{else}}{{#if (eq type "number")}}999{{else}}{{#if (eq type "boolean")}}false{{else}}'custom'{{/if}}{{/if}}{{/if}},
  },
};
{{/each}}

{{#if withState}}
export const Interactive: Story = {
  args: {
    ...Default.args,
  },
};
{{/if}};`;
    }
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
exports.ComponentGenerator = ComponentGenerator;
//# sourceMappingURL=ComponentGenerator.js.map