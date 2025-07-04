/**
 * PageGenerator - Generate page components with layouts
 * 
 * Generates complete page components with different layout configurations.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import Handlebars from 'handlebars';

interface PageConfig {
  layout: 'sidebar' | 'header' | 'blank' | 'dashboard';
  components?: string;
  title?: string;
  output: string;
  typescript: boolean;
  test: boolean;
  story: boolean;
  withAuth: boolean;
  withNavigation: boolean;
  withFooter: boolean;
}

interface ComponentDefinition {
  name: string;
  type: string;
  props?: string[];
}

interface GenerationResult {
  files: string[];
  success: boolean;
  errors?: string[];
}

export class PageGenerator {
  private templatesPath: string;
  
  constructor(templatesPath: string = path.join(__dirname, '../../templates')) {
    this.templatesPath = templatesPath;
  }
  
  async generate(name: string, config: PageConfig): Promise<GenerationResult> {
    try {
      const components = config.components ? this.parseComponents(config.components) : [];
      const context = this.buildTemplateContext(name, components, config);
      const files: string[] = [];
      
      // Generate main page component
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
  
  private parseComponents(componentsString: string): ComponentDefinition[] {
    return componentsString.split(',').map(comp => {
      const [name, type = 'component'] = comp.trim().split(':');
      return {
        name: name.trim(),
        type: type.trim()
      };
    });
  }
  
  private buildTemplateContext(name: string, components: ComponentDefinition[], config: PageConfig) {
    return {
      componentName: name,
      pageName: name,
      pageTitle: config.title || name,
      layout: config.layout,
      components,
      typescript: config.typescript,
      withAuth: config.withAuth,
      withNavigation: config.withNavigation,
      withFooter: config.withFooter,
      imports: this.getRequiredImports(config, components),
      interfaces: this.buildInterfaces(name, components, config.typescript)
    };
  }
  
  private getRequiredImports(config: PageConfig, components: ComponentDefinition[]): string[] {
    const imports = [
      "import React from 'react';"
    ];
    
    // Layout-specific imports
    switch (config.layout) {
      case 'sidebar':
        imports.push("import { ArchbaseSidebar, ArchbaseLayout } from 'archbase-react';");
        break;
      case 'header':
        imports.push("import { ArchbaseHeader, ArchbaseLayout } from 'archbase-react';");
        break;
      case 'dashboard':
        imports.push("import { ArchbaseDashboard, ArchbaseLayout, ArchbaseCard } from 'archbase-react';");
        break;
      case 'blank':
        imports.push("import { ArchbaseContainer } from 'archbase-react';");
        break;
    }
    
    // Authentication imports
    if (config.withAuth) {
      imports.push("import { ArchbaseAuthProvider, ProtectedRoute } from 'archbase-react';");
    }
    
    // Navigation imports
    if (config.withNavigation) {
      imports.push("import { ArchbaseNavigation, ArchbaseBreadcrumb } from 'archbase-react';");
    }
    
    // Component-specific imports
    const componentImports = components.map(comp => {
      return `import ${comp.name} from '../components/${comp.name}';`;
    });
    
    return [...imports, ...componentImports];
  }
  
  private buildInterfaces(pageName: string, components: ComponentDefinition[], typescript: boolean): string {
    if (!typescript) return '';
    
    const propsInterface = `interface ${pageName}Props {
  title?: string;
  children?: React.ReactNode;
}`;
    
    return propsInterface;
  }
  
  private async generateComponent(name: string, context: any, config: PageConfig): Promise<string> {
    const template = await this.getTemplate(config.layout);
    const content = template(context);
    
    const outputPath = path.join(config.output, `${name}.tsx`);
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, content);
    
    return outputPath;
  }
  
  private async generateTest(name: string, context: any, config: PageConfig): Promise<string> {
    const template = await this.getTemplate('test');
    const content = template({ ...context, testType: 'page' });
    
    const outputPath = path.join(config.output, `${name}.test.tsx`);
    await fs.writeFile(outputPath, content);
    
    return outputPath;
  }
  
  private async generateStory(name: string, context: any, config: PageConfig): Promise<string> {
    const template = await this.getTemplate('story');
    const content = template({ ...context, storyType: 'page' });
    
    const outputPath = path.join(config.output, `${name}.stories.tsx`);
    await fs.writeFile(outputPath, content);
    
    return outputPath;
  }
  
  private async getTemplate(templateName: string): Promise<HandlebarsTemplateDelegate> {
    // For now, return inline templates
    return this.getInlineTemplate(templateName);
  }
  
  private getInlineTemplate(templateName: string): HandlebarsTemplateDelegate {
    const templates: { [key: string]: string } = {
      sidebar: this.getSidebarTemplate(),
      header: this.getHeaderTemplate(),
      blank: this.getBlankTemplate(),
      dashboard: this.getDashboardTemplate(),
      test: this.getTestTemplate(),
      story: this.getStoryTemplate()
    };
    
    return Handlebars.compile(templates[templateName] || templates.blank);
  }
  
  private getSidebarTemplate(): string {
    return `{{#each imports}}
{{{this}}}
{{/each}}

{{#if typescript}}
{{{interfaces}}}
{{/if}}

const {{componentName}}{{#if typescript}}: React.FC<{{componentName}}Props>{{/if}} = ({
  title = '{{pageTitle}}',
  children
}) => {
  const sidebarItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Usuários', path: '/users', icon: 'users' },
    { label: 'Configurações', path: '/settings', icon: 'settings' },
  ];

  return (
    {{#if withAuth}}
    <ProtectedRoute>
    {{/if}}
      <ArchbaseLayout>
        <ArchbaseSidebar
          items={sidebarItems}
          title="{{pageTitle}}"
          collapsible
        />
        
        <div className="{{componentName}}__content">
          {{#if withNavigation}}
          <ArchbaseBreadcrumb />
          {{/if}}
          
          <div className="{{componentName}}__header">
            <h1>{title}</h1>
          </div>
          
          <div className="{{componentName}}__main">
            {{#each components}}
            <{{name}} />
            {{/each}}
            {children}
          </div>
          
          {{#if withFooter}}
          <footer className="{{componentName}}__footer">
            <p>&copy; 2024 {{pageTitle}}. Todos os direitos reservados.</p>
          </footer>
          {{/if}}
        </div>
      </ArchbaseLayout>
    {{#if withAuth}}
    </ProtectedRoute>
    {{/if}}
  );
};

export default {{componentName}};`;
  }
  
  private getHeaderTemplate(): string {
    return `{{#each imports}}
{{{this}}}
{{/each}}

{{#if typescript}}
{{{interfaces}}}
{{/if}}

const {{componentName}}{{#if typescript}}: React.FC<{{componentName}}Props>{{/if}} = ({
  title = '{{pageTitle}}',
  children
}) => {
  const headerActions = [
    { label: 'Perfil', action: () => console.log('Profile') },
    { label: 'Sair', action: () => console.log('Logout') },
  ];

  return (
    {{#if withAuth}}
    <ProtectedRoute>
    {{/if}}
      <ArchbaseLayout>
        <ArchbaseHeader
          title="{{pageTitle}}"
          actions={headerActions}
          showSearch
        />
        
        <div className="{{componentName}}__content">
          {{#if withNavigation}}
          <ArchbaseNavigation />
          <ArchbaseBreadcrumb />
          {{/if}}
          
          <main className="{{componentName}}__main">
            <div className="{{componentName}}__header">
              <h1>{title}</h1>
            </div>
            
            <div className="{{componentName}}__body">
              {{#each components}}
              <{{name}} />
              {{/each}}
              {children}
            </div>
          </main>
          
          {{#if withFooter}}
          <footer className="{{componentName}}__footer">
            <p>&copy; 2024 {{pageTitle}}. Todos os direitos reservados.</p>
          </footer>
          {{/if}}
        </div>
      </ArchbaseLayout>
    {{#if withAuth}}
    </ProtectedRoute>
    {{/if}}
  );
};

export default {{componentName}};`;
  }
  
  private getBlankTemplate(): string {
    return `{{#each imports}}
{{{this}}}
{{/each}}

{{#if typescript}}
{{{interfaces}}}
{{/if}}

const {{componentName}}{{#if typescript}}: React.FC<{{componentName}}Props>{{/if}} = ({
  title = '{{pageTitle}}',
  children
}) => {
  return (
    {{#if withAuth}}
    <ProtectedRoute>
    {{/if}}
      <ArchbaseContainer className="{{componentName}}">
        {{#if withNavigation}}
        <ArchbaseBreadcrumb />
        {{/if}}
        
        <div className="{{componentName}}__header">
          <h1>{title}</h1>
        </div>
        
        <div className="{{componentName}}__main">
          {{#each components}}
          <{{name}} />
          {{/each}}
          {children}
        </div>
        
        {{#if withFooter}}
        <footer className="{{componentName}}__footer">
          <p>&copy; 2024 {{pageTitle}}. Todos os direitos reservados.</p>
        </footer>
        {{/if}}
      </ArchbaseContainer>
    {{#if withAuth}}
    </ProtectedRoute>
    {{/if}}
  );
};

export default {{componentName}};`;
  }
  
  private getDashboardTemplate(): string {
    return `{{#each imports}}
{{{this}}}
{{/each}}

{{#if typescript}}
{{{interfaces}}}

interface DashboardMetrics {
  totalUsers: number;
  totalSales: number;
  revenue: number;
  growth: number;
}
{{/if}}

const {{componentName}}{{#if typescript}}: React.FC<{{componentName}}Props>{{/if}} = ({
  title = '{{pageTitle}}',
  children
}) => {
  {{#if typescript}}
  const metrics: DashboardMetrics = {
  {{else}}
  const metrics = {
  {{/if}}
    totalUsers: 1250,
    totalSales: 350,
    revenue: 45000,
    growth: 12.5
  };

  return (
    {{#if withAuth}}
    <ProtectedRoute>
    {{/if}}
      <ArchbaseDashboard>
        {{#if withNavigation}}
        <ArchbaseBreadcrumb />
        {{/if}}
        
        <div className="{{componentName}}__header">
          <h1>{title}</h1>
        </div>
        
        <div className="{{componentName}}__metrics">
          <ArchbaseCard title="Total de Usuários">
            <div className="metric-value">{metrics.totalUsers}</div>
          </ArchbaseCard>
          
          <ArchbaseCard title="Vendas">
            <div className="metric-value">{metrics.totalSales}</div>
          </ArchbaseCard>
          
          <ArchbaseCard title="Receita">
            <div className="metric-value">R$ {metrics.revenue.toLocaleString()}</div>
          </ArchbaseCard>
          
          <ArchbaseCard title="Crescimento">
            <div className="metric-value">{metrics.growth}%</div>
          </ArchbaseCard>
        </div>
        
        <div className="{{componentName}}__content">
          {{#each components}}
          <{{name}} />
          {{/each}}
          {children}
        </div>
        
        {{#if withFooter}}
        <footer className="{{componentName}}__footer">
          <p>&copy; 2024 {{pageTitle}}. Todos os direitos reservados.</p>
        </footer>
        {{/if}}
      </ArchbaseDashboard>
    {{#if withAuth}}
    </ProtectedRoute>
    {{/if}}
  );
};

export default {{componentName}};`;
  }
  
  private getTestTemplate(): string {
    return `import { render, screen } from '@testing-library/react';
import {{componentName}} from './{{componentName}}';

describe('{{componentName}}', () => {
  it('renders without crashing', () => {
    render(<{{componentName}} />);
    expect(screen.getByText('{{pageTitle}}')).toBeInTheDocument();
  });

  it('displays the correct title', () => {
    const customTitle = 'Custom Title';
    render(<{{componentName}} title={customTitle} />);
    expect(screen.getByText(customTitle)).toBeInTheDocument();
  });

  {{#if withAuth}}
  it('renders protected route when withAuth is true', () => {
    render(<{{componentName}} />);
    // Test authentication wrapper
  });
  {{/if}}

  {{#if withNavigation}}
  it('renders navigation components when withNavigation is true', () => {
    render(<{{componentName}} />);
    // Test navigation components
  });
  {{/if}}
});`;
  }
  
  private getStoryTemplate(): string {
    return `import type { Meta, StoryObj } from '@storybook/react';
import {{componentName}} from './{{componentName}}';

const meta: Meta<typeof {{componentName}}> = {
  title: 'Pages/{{componentName}}',
  component: {{componentName}},
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: '{{pageTitle}}',
  },
};

export const WithCustomTitle: Story = {
  args: {
    title: 'Custom Page Title',
  },
};

{{#if withAuth}}
export const Authenticated: Story = {
  args: {
    title: '{{pageTitle}} - Authenticated',
  },
};
{{/if}}

{{#if withNavigation}}
export const WithNavigation: Story = {
  args: {
    title: '{{pageTitle}} - With Navigation',
  },
};
{{/if}};`;
  }
  
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}