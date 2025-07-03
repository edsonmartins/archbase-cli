# Exemplos Práticos de Plugins Archbase CLI

Este documento apresenta exemplos detalhados de implementação de plugins para diferentes cenários de uso.

## Índice

1. [Plugin Básico de Geração](#plugin-básico-de-geração)
2. [Plugin de Análise de Código](#plugin-de-análise-de-código)
3. [Plugin de Comando Customizado](#plugin-de-comando-customizado)
4. [Plugin de Integração Externa](#plugin-de-integração-externa)
5. [Plugin de Template Avançado](#plugin-de-template-avançado)
6. [Plugin de Migração Customizada](#plugin-de-migração-customizada)
7. [Plugin de Knowledge Base](#plugin-de-knowledge-base)
8. [Plugin Empresarial Completo](#plugin-empresarial-completo)

## Plugin Básico de Geração

### Cenário: Gerador de Card Components

**Objetivo**: Criar um plugin que gera componentes de card padronizados para a empresa.

#### Estrutura do Plugin

```
archbase-cli-plugin-card-generator/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── generators/
│   │   └── CardGenerator.ts
│   └── templates/
│       ├── Card.tsx.hbs
│       ├── Card.test.tsx.hbs
│       └── Card.stories.tsx.hbs
├── test/
│   └── CardGenerator.test.ts
└── README.md
```

#### Implementação

**package.json**:
```json
{
  "name": "archbase-cli-plugin-card-generator",
  "version": "1.0.0",
  "description": "Generates standardized card components",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "jest"
  },
  "keywords": ["archbase", "cli", "plugin", "card", "component"],
  "author": "Your Company",
  "license": "MIT",
  "archbaseCliVersion": "^0.1.0",
  "devDependencies": {
    "@archbase/cli": "^0.1.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "handlebars": "^4.7.8"
  }
}
```

**src/index.ts**:
```typescript
import { Plugin, PluginContext } from '@archbase/cli';
import { CardGenerator } from './generators/CardGenerator';

export default function createPlugin(): Plugin {
  return {
    metadata: {
      name: 'archbase-cli-plugin-card-generator',
      version: '1.0.0',
      description: 'Generates standardized card components'
    },

    async activate(context: PluginContext): Promise<void> {
      context.logger.info('Card Generator plugin activated!');
      
      // Registrar gerador
      context.registerGenerator('card', new CardGenerator());
    },

    async deactivate(): Promise<void> {
      // Cleanup se necessário
    }
  };
}
```

**src/generators/CardGenerator.ts**:
```typescript
import * as fs from 'fs-extra';
import * as path from 'path';
import * as Handlebars from 'handlebars';

export interface CardOptions {
  props?: string;
  variant?: 'elevated' | 'outlined' | 'filled';
  withActions?: boolean;
  withImage?: boolean;
  testFramework?: 'jest' | 'vitest';
  generateStory?: boolean;
  outputDir?: string;
}

export class CardGenerator {
  private templateDir: string;

  constructor() {
    this.templateDir = path.join(__dirname, '../templates');
    this.registerHandlebarsHelpers();
  }

  async generate(name: string, options: CardOptions = {}): Promise<void> {
    const {
      props = '',
      variant = 'elevated',
      withActions = false,
      withImage = false,
      testFramework = 'jest',
      generateStory = true,
      outputDir = './src/components'
    } = options;

    console.log(`🃏 Generating card component: ${name}`);

    // Parse props
    const propsList = this.parseProps(props);

    // Preparar contexto do template
    const templateContext = {
      componentName: name,
      props: propsList,
      variant,
      withActions,
      withImage,
      hasProps: propsList.length > 0,
      propsInterface: this.generatePropsInterface(name, propsList),
      imports: this.generateImports(withActions, withImage)
    };

    // Gerar component
    await this.generateComponent(name, templateContext, outputDir);

    // Gerar teste
    await this.generateTest(name, templateContext, outputDir, testFramework);

    // Gerar story (se solicitado)
    if (generateStory) {
      await this.generateStory(name, templateContext, outputDir);
    }

    console.log(`✅ Generated ${name} card component in ${outputDir}`);
    
    if (generateStory) {
      console.log(`📚 Storybook story created`);
    }
  }

  private parseProps(propsString: string): Array<{name: string, type: string, optional: boolean}> {
    if (!propsString) return [];
    
    return propsString.split(',').map(prop => {
      const [name, typeWithOptional] = prop.trim().split(':');
      const isOptional = typeWithOptional.endsWith('?');
      const type = isOptional ? typeWithOptional.slice(0, -1) : typeWithOptional;
      
      return {
        name: name.trim(),
        type: type.trim(),
        optional: isOptional
      };
    });
  }

  private generatePropsInterface(componentName: string, props: any[]): string {
    if (props.length === 0) return '';

    const propsDeclaration = props.map(prop => 
      `  ${prop.name}${prop.optional ? '?' : ''}: ${prop.type};`
    ).join('\n');

    return `interface ${componentName}Props {\n${propsDeclaration}\n}`;
  }

  private generateImports(withActions: boolean, withImage: boolean): string[] {
    const imports = ['Card', 'Text'];
    
    if (withActions) imports.push('Button', 'Group');
    if (withImage) imports.push('Image');
    
    return imports;
  }

  private async generateComponent(name: string, context: any, outputDir: string): Promise<void> {
    const template = await this.loadTemplate('Card.tsx.hbs');
    const compiled = Handlebars.compile(template);
    const content = compiled(context);

    const outputPath = path.join(outputDir, name, `${name}.tsx`);
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, content);
  }

  private async generateTest(name: string, context: any, outputDir: string, framework: string): Promise<void> {
    const template = await this.loadTemplate('Card.test.tsx.hbs');
    const compiled = Handlebars.compile(template);
    const testContext = { ...context, testFramework: framework };
    const content = compiled(testContext);

    const outputPath = path.join(outputDir, name, `${name}.test.tsx`);
    await fs.writeFile(outputPath, content);
  }

  private async generateStory(name: string, context: any, outputDir: string): Promise<void> {
    const template = await this.loadTemplate('Card.stories.tsx.hbs');
    const compiled = Handlebars.compile(template);
    const content = compiled(context);

    const outputPath = path.join(outputDir, name, `${name}.stories.tsx`);
    await fs.writeFile(outputPath, content);
  }

  private async loadTemplate(templateName: string): Promise<string> {
    const templatePath = path.join(this.templateDir, templateName);
    return fs.readFile(templatePath, 'utf-8');
  }

  private registerHandlebarsHelpers(): void {
    Handlebars.registerHelper('eq', (a, b) => a === b);
    Handlebars.registerHelper('capitalizeFirst', (str) => 
      str.charAt(0).toUpperCase() + str.slice(1)
    );
    Handlebars.registerHelper('join', (array, separator) => 
      array.join(separator)
    );
  }
}
```

**src/templates/Card.tsx.hbs**:
```handlebars
import React from 'react';
import { {{join imports ', '}} } from '@mantine/core';

{{#if propsInterface}}
{{propsInterface}}
{{/if}}

export function {{componentName}}({{#if hasProps}}props: {{componentName}}Props{{/if}}) {
  {{#if hasProps}}
  const { {{#each props}}{{name}}{{#unless @last}}, {{/unless}}{{/each}} } = props;
  {{/if}}

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder{{#if (eq variant "outlined")}}={{else}}={false}{{/if}}
      {{#if (eq variant "elevated")}}
      style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
      {{/if}}
    >
      {{#if withImage}}
      <Card.Section>
        <Image
          src="https://via.placeholder.com/300x200"
          height={200}
          alt="Card image"
        />
      </Card.Section>
      {{/if}}

      <div>
        <Text size="lg" fw={500}>
          {{componentName}}
        </Text>
        
        {{#each props}}
        <Text size="sm" c="dimmed">
          {{name}}: {{{name}}}
        </Text>
        {{/each}}
      </div>

      {{#if withActions}}
      <Card.Section inheritPadding mt="sm" pt="md" withBorder>
        <Group justify="flex-end">
          <Button variant="light" size="sm">
            Action 1
          </Button>
          <Button size="sm">
            Action 2
          </Button>
        </Group>
      </Card.Section>
      {{/if}}
    </Card>
  );
}
```

**src/templates/Card.test.tsx.hbs**:
```handlebars
import React from 'react';
import { render, screen } from '@testing-library/react';
{{#if (eq testFramework "vitest")}}
import { describe, it, expect } from 'vitest';
{{/if}}
import { {{componentName}} } from './{{componentName}}';

describe('{{componentName}}', () => {
  it('renders without crashing', () => {
    render(<{{componentName}}{{#if hasProps}} {{#each props}}{{name}}={{#if (eq type "string")}}"test"{{else if (eq type "number")}}42{{else if (eq type "boolean")}}true{{else}}{{"{}"}}{{/if}}{{#unless @last}} {{/unless}}{{/each}}{{/if}} />);
    
    expect(screen.getByText('{{componentName}}')).toBeInTheDocument();
  });

  {{#if hasProps}}
  {{#each props}}
  it('displays {{name}} prop correctly', () => {
    const test{{capitalizeFirst name}} = {{#if (eq type "string")}}"test value"{{else if (eq type "number")}}123{{else if (eq type "boolean")}}true{{else}}{{"{}"}}{{/if}};
    
    render(<{{../componentName}} {{name}}={test{{capitalizeFirst name}}} />);
    
    {{#if (eq type "string")}}
    expect(screen.getByText(test{{capitalizeFirst name}})).toBeInTheDocument();
    {{else}}
    expect(screen.getByText(/{{name}}/)).toBeInTheDocument();
    {{/if}}
  });
  {{/each}}
  {{/if}}

  {{#if withActions}}
  it('renders action buttons when withActions is true', () => {
    render(<{{componentName}} />);
    
    expect(screen.getByText('Action 1')).toBeInTheDocument();
    expect(screen.getByText('Action 2')).toBeInTheDocument();
  });
  {{/if}}
});
```

**src/templates/Card.stories.tsx.hbs**:
```handlebars
import type { Meta, StoryObj } from '@storybook/react';
import { {{componentName}} } from './{{componentName}}';

const meta: Meta<typeof {{componentName}}> = {
  title: 'Components/{{componentName}}',
  component: {{componentName}},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    {{#each props}}
    {{name}}: {
      description: '{{name}} prop',
      control: {{#if (eq type "string")}}'text'{{else if (eq type "number")}}'number'{{else if (eq type "boolean")}}'boolean'{{else}}'object'{{/if}}
    }{{#unless @last}},{{/unless}}
    {{/each}}
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    {{#each props}}
    {{name}}: {{#if (eq type "string")}}"Example {{name}}"{{else if (eq type "number")}}42{{else if (eq type "boolean")}}true{{else}}{{"{}"}}{{/if}}{{#unless @last}},{{/unless}}
    {{/each}}
  },
};

{{#if (eq variant "elevated")}}
export const Elevated: Story = {
  args: {
    ...Default.args,
  },
};
{{/if}}

{{#if (eq variant "outlined")}}
export const Outlined: Story = {
  args: {
    ...Default.args,
  },
};
{{/if}}

{{#if withActions}}
export const WithActions: Story = {
  args: {
    ...Default.args,
  },
};
{{/if}}

{{#if withImage}}
export const WithImage: Story = {
  args: {
    ...Default.args,
  },
};
{{/if}}
```

#### Uso do Plugin

**Instalação**:
```bash
cd archbase-cli-plugin-card-generator
npm run build
archbase plugin install . --local
```

**Uso Básico**:
```bash
# Card simples
archbase generate card UserCard

# Card com props
archbase generate card ProductCard --props="title:string,price:number,inStock:boolean"

# Card avançado
archbase generate card FeatureCard \
  --props="title:string,description:string,icon:string" \
  --variant=elevated \
  --with-actions \
  --with-image \
  --output-dir=./src/components/cards
```

## Plugin de Análise de Código

### Cenário: Analisador de Acessibilidade

**Objetivo**: Plugin que analisa componentes React para problemas de acessibilidade.

#### Implementação

**src/analyzers/AccessibilityAnalyzer.ts**:
```typescript
import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

export interface AccessibilityIssue {
  type: 'missing-alt' | 'missing-label' | 'missing-role' | 'color-contrast' | 'keyboard-nav';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  file: string;
  line: number;
  column: number;
  fix?: string;
  element?: string;
}

export interface AccessibilityReport {
  summary: {
    filesAnalyzed: number;
    issuesFound: number;
    criticalIssues: number;
    warningIssues: number;
    infoIssues: number;
  };
  issues: AccessibilityIssue[];
  recommendations: string[];
  score: number; // 0-100
}

export class AccessibilityAnalyzer {
  private a11yRules = [
    {
      name: 'img-alt',
      check: this.checkImageAlt.bind(this),
      severity: 'critical' as const
    },
    {
      name: 'input-label',
      check: this.checkInputLabel.bind(this),
      severity: 'warning' as const
    },
    {
      name: 'button-accessible',
      check: this.checkButtonAccessible.bind(this),
      severity: 'warning' as const
    },
    {
      name: 'heading-hierarchy',
      check: this.checkHeadingHierarchy.bind(this),
      severity: 'info' as const
    },
    {
      name: 'focus-management',
      check: this.checkFocusManagement.bind(this),
      severity: 'warning' as const
    }
  ];

  async analyze(projectPath: string): Promise<AccessibilityReport> {
    console.log('🔍 Analyzing accessibility issues...');

    const files = await this.findComponentFiles(projectPath);
    const issues: AccessibilityIssue[] = [];

    for (const file of files) {
      const fileIssues = await this.analyzeFile(file);
      issues.push(...fileIssues);
    }

    const summary = this.generateSummary(files.length, issues);
    const recommendations = this.generateRecommendations(issues);
    const score = this.calculateAccessibilityScore(summary);

    return {
      summary,
      issues,
      recommendations,
      score
    };
  }

  private async findComponentFiles(projectPath: string): Promise<string[]> {
    return glob('**/*.{tsx,jsx}', {
      cwd: projectPath,
      absolute: true,
      ignore: ['node_modules/**', 'dist/**', '**/*.test.*', '**/*.stories.*']
    });
  }

  private async analyzeFile(filePath: string): Promise<AccessibilityIssue[]> {
    const content = await fs.readFile(filePath, 'utf-8');
    const issues: AccessibilityIssue[] = [];

    try {
      const ast = parser.parse(content, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx']
      });

      // Analyze JSX elements
      traverse(ast, {
        JSXElement: (path) => {
          for (const rule of this.a11yRules) {
            const ruleIssues = rule.check(path, filePath);
            issues.push(...ruleIssues);
          }
        }
      });

    } catch (error) {
      console.warn(`Could not parse ${filePath}: ${error.message}`);
    }

    return issues;
  }

  private checkImageAlt(path: any, filePath: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const element = path.node;

    if (this.isImageElement(element)) {
      const hasAlt = this.hasAttribute(element, 'alt');
      const hasAriaLabel = this.hasAttribute(element, 'aria-label');
      const hasAriaLabelledBy = this.hasAttribute(element, 'aria-labelledby');
      const hasRole = this.getAttributeValue(element, 'role');

      // Decorative images should have empty alt or role="presentation"
      const isDecorative = hasRole === 'presentation' || hasRole === 'none';

      if (!hasAlt && !hasAriaLabel && !hasAriaLabelledBy && !isDecorative) {
        issues.push({
          type: 'missing-alt',
          severity: 'critical',
          message: 'Image element missing alt text',
          file: filePath,
          line: element.loc?.start.line || 0,
          column: element.loc?.start.column || 0,
          fix: 'Add alt attribute with descriptive text, or role="presentation" for decorative images',
          element: 'img'
        });
      }

      // Check for empty alt without decorative role
      if (hasAlt && this.getAttributeValue(element, 'alt') === '' && !isDecorative) {
        issues.push({
          type: 'missing-alt',
          severity: 'warning',
          message: 'Image has empty alt text but is not marked as decorative',
          file: filePath,
          line: element.loc?.start.line || 0,
          column: element.loc?.start.column || 0,
          fix: 'Add descriptive alt text or role="presentation" if decorative'
        });
      }
    }

    return issues;
  }

  private checkInputLabel(path: any, filePath: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const element = path.node;

    if (this.isInputElement(element)) {
      const hasLabel = this.hasAttribute(element, 'aria-label');
      const hasLabelledBy = this.hasAttribute(element, 'aria-labelledby');
      const hasId = this.hasAttribute(element, 'id');

      // Check if there's an associated label (would need more complex analysis)
      if (!hasLabel && !hasLabelledBy) {
        issues.push({
          type: 'missing-label',
          severity: 'warning',
          message: 'Form input missing accessible label',
          file: filePath,
          line: element.loc?.start.line || 0,
          column: element.loc?.start.column || 0,
          fix: 'Add aria-label attribute or associate with a <label> element',
          element: 'input'
        });
      }
    }

    return issues;
  }

  private checkButtonAccessible(path: any, filePath: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const element = path.node;

    if (this.isButtonElement(element)) {
      const hasAccessibleText = this.hasAccessibleText(element);
      const hasAriaLabel = this.hasAttribute(element, 'aria-label');

      if (!hasAccessibleText && !hasAriaLabel) {
        issues.push({
          type: 'missing-label',
          severity: 'warning',
          message: 'Button element missing accessible text or label',
          file: filePath,
          line: element.loc?.start.line || 0,
          column: element.loc?.start.column || 0,
          fix: 'Add text content or aria-label attribute to button',
          element: 'button'
        });
      }
    }

    return issues;
  }

  private checkHeadingHierarchy(path: any, filePath: string): AccessibilityIssue[] {
    // This would require more complex state tracking across the entire component
    // For now, return empty array
    return [];
  }

  private checkFocusManagement(path: any, filePath: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const element = path.node;

    // Check for interactive elements without proper focus management
    if (this.isInteractiveElement(element)) {
      const hasTabIndex = this.hasAttribute(element, 'tabIndex');
      const tabIndexValue = this.getAttributeValue(element, 'tabIndex');

      // Check for positive tabIndex (anti-pattern)
      if (hasTabIndex && typeof tabIndexValue === 'number' && tabIndexValue > 0) {
        issues.push({
          type: 'keyboard-nav',
          severity: 'warning',
          message: 'Positive tabIndex disrupts natural tab order',
          file: filePath,
          line: element.loc?.start.line || 0,
          column: element.loc?.start.column || 0,
          fix: 'Remove positive tabIndex or use 0 or -1',
          element: this.getElementName(element)
        });
      }
    }

    return issues;
  }

  private isImageElement(element: t.JSXElement): boolean {
    return this.getElementName(element) === 'img' || 
           this.getElementName(element) === 'Image';
  }

  private isInputElement(element: t.JSXElement): boolean {
    const elementName = this.getElementName(element);
    return ['input', 'Input', 'TextInput', 'PasswordInput', 'NumberInput'].includes(elementName);
  }

  private isButtonElement(element: t.JSXElement): boolean {
    const elementName = this.getElementName(element);
    return ['button', 'Button'].includes(elementName);
  }

  private isInteractiveElement(element: t.JSXElement): boolean {
    const elementName = this.getElementName(element);
    return ['button', 'input', 'select', 'textarea', 'a', 'Button', 'Input', 'Select'].includes(elementName);
  }

  private getElementName(element: t.JSXElement): string {
    const openingElement = element.openingElement;
    if (t.isJSXIdentifier(openingElement.name)) {
      return openingElement.name.name;
    }
    return '';
  }

  private hasAttribute(element: t.JSXElement, attrName: string): boolean {
    return element.openingElement.attributes.some(attr =>
      t.isJSXAttribute(attr) && 
      t.isJSXIdentifier(attr.name) && 
      attr.name.name === attrName
    );
  }

  private getAttributeValue(element: t.JSXElement, attrName: string): any {
    const attr = element.openingElement.attributes.find(attr =>
      t.isJSXAttribute(attr) && 
      t.isJSXIdentifier(attr.name) && 
      attr.name.name === attrName
    ) as t.JSXAttribute;

    if (!attr || !attr.value) return null;

    if (t.isStringLiteral(attr.value)) {
      return attr.value.value;
    }

    if (t.isJSXExpressionContainer(attr.value)) {
      if (t.isStringLiteral(attr.value.expression)) {
        return attr.value.expression.value;
      }
      if (t.isNumericLiteral(attr.value.expression)) {
        return attr.value.expression.value;
      }
      if (t.isBooleanLiteral(attr.value.expression)) {
        return attr.value.expression.value;
      }
    }

    return null;
  }

  private hasAccessibleText(element: t.JSXElement): boolean {
    // Simplified check - would need more sophisticated text extraction
    return element.children.some(child => 
      t.isJSXText(child) && child.value.trim().length > 0
    );
  }

  private generateSummary(filesAnalyzed: number, issues: AccessibilityIssue[]) {
    return {
      filesAnalyzed,
      issuesFound: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'critical').length,
      warningIssues: issues.filter(i => i.severity === 'warning').length,
      infoIssues: issues.filter(i => i.severity === 'info').length
    };
  }

  private generateRecommendations(issues: AccessibilityIssue[]): string[] {
    const recommendations: string[] = [];

    const missingAltCount = issues.filter(i => i.type === 'missing-alt').length;
    if (missingAltCount > 0) {
      recommendations.push(`Add alt attributes to ${missingAltCount} image(s)`);
    }

    const missingLabelCount = issues.filter(i => i.type === 'missing-label').length;
    if (missingLabelCount > 0) {
      recommendations.push(`Add accessible labels to ${missingLabelCount} form element(s)`);
    }

    const keyboardNavCount = issues.filter(i => i.type === 'keyboard-nav').length;
    if (keyboardNavCount > 0) {
      recommendations.push(`Fix keyboard navigation issues in ${keyboardNavCount} element(s)`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Great job! No major accessibility issues found.');
    } else {
      recommendations.push('Consider using automated accessibility testing tools like axe-core');
      recommendations.push('Test with screen readers and keyboard-only navigation');
    }

    return recommendations;
  }

  private calculateAccessibilityScore(summary: any): number {
    if (summary.issuesFound === 0) return 100;

    const totalPossibleIssues = summary.filesAnalyzed * 10; // Assuming max 10 issues per file
    const weightedIssues = (summary.criticalIssues * 3) + (summary.warningIssues * 2) + summary.infoIssues;
    
    const score = Math.max(0, 100 - (weightedIssues / totalPossibleIssues * 100));
    return Math.round(score);
  }
}
```

**src/commands/a11yCommand.ts**:
```typescript
import { Command } from 'commander';
import chalk from 'chalk';
import { AccessibilityAnalyzer } from '../analyzers/AccessibilityAnalyzer';

export const a11yCommand = new Command('a11y')
  .description('Analyze accessibility issues in React components')
  .argument('<path>', 'Path to analyze')
  .option('--format <fmt>', 'Output format (table|json|detailed)', 'table')
  .option('--severity <level>', 'Minimum severity level (critical|warning|info)', 'warning')
  .option('--fix', 'Show fix suggestions')
  .option('--output <file>', 'Save report to file')
  .action(async (projectPath: string, options) => {
    const analyzer = new AccessibilityAnalyzer();
    
    try {
      const report = await analyzer.analyze(projectPath);
      
      if (options.format === 'json') {
        const output = JSON.stringify(report, null, 2);
        if (options.output) {
          await require('fs-extra').writeFile(options.output, output);
          console.log(chalk.green(`Report saved to ${options.output}`));
        } else {
          console.log(output);
        }
        return;
      }

      // Display summary
      console.log(chalk.cyan('\n♿ Accessibility Analysis Report'));
      console.log(chalk.gray('=' .repeat(50)));
      
      console.log(`📁 Files analyzed: ${report.summary.filesAnalyzed}`);
      console.log(`🚨 Issues found: ${report.summary.issuesFound}`);
      console.log(`📊 Accessibility score: ${getScoreColor(report.score)}${report.score}/100${chalk.reset()}`);
      
      if (report.summary.criticalIssues > 0) {
        console.log(chalk.red(`   Critical: ${report.summary.criticalIssues}`));
      }
      if (report.summary.warningIssues > 0) {
        console.log(chalk.yellow(`   Warnings: ${report.summary.warningIssues}`));
      }
      if (report.summary.infoIssues > 0) {
        console.log(chalk.blue(`   Info: ${report.summary.infoIssues}`));
      }

      // Filter issues by severity
      const minSeverityLevel = ['critical', 'warning', 'info'].indexOf(options.severity);
      const severityOrder = ['critical', 'warning', 'info'];
      
      const filteredIssues = report.issues.filter(issue => 
        severityOrder.indexOf(issue.severity) <= minSeverityLevel
      );

      if (filteredIssues.length > 0) {
        console.log(chalk.cyan('\n🔍 Issues Found:'));
        
        filteredIssues.forEach(issue => {
          const severityColor = issue.severity === 'critical' ? chalk.red : 
                               issue.severity === 'warning' ? chalk.yellow : chalk.blue;
          
          console.log(`\n${severityColor(issue.severity.toUpperCase())} - ${issue.message}`);
          console.log(chalk.gray(`   File: ${issue.file}:${issue.line}:${issue.column}`));
          
          if (issue.element) {
            console.log(chalk.gray(`   Element: <${issue.element}>`));
          }
          
          if (options.fix && issue.fix) {
            console.log(chalk.green(`   Fix: ${issue.fix}`));
          }
        });
      }

      // Show recommendations
      if (report.recommendations.length > 0) {
        console.log(chalk.cyan('\n💡 Recommendations:'));
        report.recommendations.forEach(rec => {
          console.log(`   • ${rec}`);
        });
      }

      function getScoreColor(score: number): string {
        if (score >= 90) return chalk.green;
        if (score >= 70) return chalk.yellow;
        return chalk.red;
      }

    } catch (error) {
      console.error(chalk.red(`Analysis failed: ${error.message}`));
      process.exit(1);
    }
  });
```

#### Registro e Uso

**src/index.ts**:
```typescript
import { Plugin, PluginContext } from '@archbase/cli';
import { a11yCommand } from './commands/a11yCommand';
import { AccessibilityAnalyzer } from './analyzers/AccessibilityAnalyzer';

export default function createPlugin(): Plugin {
  return {
    metadata: {
      name: 'archbase-cli-plugin-a11y',
      version: '1.0.0',
      description: 'Accessibility analysis for React components'
    },

    async activate(context: PluginContext): Promise<void> {
      context.logger.info('Accessibility plugin activated!');
      
      // Registrar comando
      context.registerCommand(a11yCommand);
      
      // Registrar analyzer para integração com scan
      context.registerAnalyzer('accessibility', new AccessibilityAnalyzer());
    }
  };
}
```

**Uso**:
```bash
# Análise básica
archbase a11y ./src

# Análise detalhada com fixes
archbase a11y ./src --format detailed --fix

# Apenas issues críticos
archbase a11y ./src --severity critical

# Salvar relatório
archbase a11y ./src --output accessibility-report.json

# Integração com scan
archbase scan project ./src --analyzer accessibility
```

**Exemplo de Saída**:
```
♿ Accessibility Analysis Report
==================================================
📁 Files analyzed: 15
🚨 Issues found: 8
📊 Accessibility score: 75/100
   Critical: 2
   Warnings: 5
   Info: 1

🔍 Issues Found:

CRITICAL - Image element missing alt text
   File: src/components/ProductCard.tsx:25:8
   Element: <img>
   Fix: Add alt attribute with descriptive text, or role="presentation" for decorative images

WARNING - Form input missing accessible label
   File: src/components/SearchForm.tsx:15:6
   Element: <input>
   Fix: Add aria-label attribute or associate with a <label> element

💡 Recommendations:
   • Add alt attributes to 2 image(s)
   • Add accessible labels to 5 form element(s)
   • Consider using automated accessibility testing tools like axe-core
   • Test with screen readers and keyboard-only navigation
```

Este sistema de plugins oferece flexibilidade total para estender o Archbase CLI com funcionalidades específicas, mantendo a qualidade e segurança através de validação rigorosa e isolamento adequado.