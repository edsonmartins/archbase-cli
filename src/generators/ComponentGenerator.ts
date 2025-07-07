/**
 * ComponentGenerator - Generate custom components
 * 
 * Generates reusable components with different types and configurations.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import Handlebars from 'handlebars';

interface ComponentConfig {
  type: 'display' | 'input' | 'layout' | 'functional';
  props?: string;
  hooks?: string;
  output: string;
  typescript: boolean;
  test: boolean;
  story: boolean;
  withState: boolean;
  withEffects: boolean;
  withMemo: boolean;
}

interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
}

interface HookDefinition {
  name: string;
  type: string;
  dependencies?: string[];
}

interface GenerationResult {
  files: string[];
  success: boolean;
  errors?: string[];
}

export class ComponentGenerator {
  private templatesPath: string;
  
  constructor(templatesPath: string = path.join(__dirname, '../../templates')) {
    this.templatesPath = templatesPath;
  }
  
  async generate(name: string, config: ComponentConfig): Promise<GenerationResult> {
    try {
      const props = config.props ? this.parseProps(config.props) : [];
      const hooks = config.hooks ? this.parseHooks(config.hooks) : [];
      const context = this.buildTemplateContext(name, props, hooks, config);
      const files: string[] = [];
      
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
    } catch (error) {
      return {
        files: [],
        success: false,
        errors: [error.message]
      };
    }
  }
  
  private parseProps(propsString: string): PropDefinition[] {
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
  
  private parseHooks(hooksString: string): HookDefinition[] {
    return hooksString.split(',').map(hook => {
      const [name, type = 'state'] = hook.trim().split(':');
      return {
        name: name.trim(),
        type: type.trim()
      };
    });
  }
  
  private buildTemplateContext(name: string, props: PropDefinition[], hooks: HookDefinition[], config: ComponentConfig) {
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
  
  private getRequiredImports(config: ComponentConfig, props: PropDefinition[], hooks: HookDefinition[]): string[] {
    const imports: string[] = [];
    
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
    } else {
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
  
  private buildInterfaces(componentName: string, props: PropDefinition[], typescript: boolean): string {
    if (!typescript || props.length === 0) return '';
    
    const propsInterface = props.map(prop => {
      const optional = !prop.required ? '?' : '';
      const comment = prop.description ? ` // ${prop.description}` : '';
      return `  ${prop.name}${optional}: ${this.getTypeScriptType(prop.type)};${comment}`;
    }).join('\n');
    
    return `interface ${componentName}Props {\n${propsInterface}\n}`;
  }
  
  private buildDefaultProps(props: PropDefinition[]): string {
    const defaultProps = props
      .filter(prop => prop.defaultValue)
      .map(prop => `${prop.name}: ${prop.defaultValue}`)
      .join(',\n  ');
    
    return defaultProps ? `{\n  ${defaultProps}\n}` : '{}';
  }
  
  private getTypeScriptType(type: string): string {
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
  
  private async generateComponent(name: string, context: any, config: ComponentConfig): Promise<string> {
    const template = await this.getTemplate(config.type);
    const content = template(context);
    
    const outputPath = path.join(config.output, `${name}.tsx`);
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, content);
    
    return outputPath;
  }
  
  private async generateTest(name: string, context: any, config: ComponentConfig): Promise<string> {
    const template = await this.getTemplate('test');
    const content = template({ ...context, testType: 'component' });
    
    const outputPath = path.join(config.output, `${name}.test.tsx`);
    await fs.writeFile(outputPath, content);
    
    return outputPath;
  }
  
  private async generateStory(name: string, context: any, config: ComponentConfig): Promise<string> {
    const template = await this.getTemplate('story');
    const content = template({ ...context, storyType: 'component' });
    
    const outputPath = path.join(config.output, `${name}.stories.tsx`);
    await fs.writeFile(outputPath, content);
    
    return outputPath;
  }
  
  private async getTemplate(templateName: string): Promise<HandlebarsTemplateDelegate> {
    // For now, return inline templates
    return this.getInlineTemplate(templateName);
  }
  
  private getInlineTemplate(templateName: string): HandlebarsTemplateDelegate {
    // Register helper functions for Handlebars
    Handlebars.registerHelper('eq', function(a, b) {
      return a === b;
    });
    
    Handlebars.registerHelper('capitalizeFirst', function(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    });
    
    const templates: { [key: string]: string } = {
      display: this.getDisplayTemplate(),
      input: this.getInputTemplate(),
      layout: this.getLayoutTemplate(),
      functional: this.getFunctionalTemplate(),
      test: this.getTestTemplate(),
      story: this.getStoryTemplate()
    };
    
    return Handlebars.compile(templates[templateName] || templates.functional);
  }
  
  private getDisplayTemplate(): string {
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
  
  private getInputTemplate(): string {
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
  
  private getLayoutTemplate(): string {
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
  
  private getFunctionalTemplate(): string {
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
  
  private getTestTemplate(): string {
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
  
  private getStoryTemplate(): string {
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
  
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}