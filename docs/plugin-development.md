# Desenvolvimento de Plugins para Archbase CLI

O Archbase CLI oferece um sistema de plugins extensível que permite adicionar funcionalidades customizadas sem modificar o código principal da ferramenta.

## Índice

1. [Visão Geral do Sistema de Plugins](#visão-geral)
2. [Tipos de Plugins](#tipos-de-plugins)
3. [Criando seu Primeiro Plugin](#criando-seu-primeiro-plugin)
4. [Desenvolvendo Geradores Customizados](#geradores-customizados)
5. [Comandos Customizados](#comandos-customizados)
6. [Analisadores Customizados](#analisadores-customizados)
7. [Distribuição e Publicação](#distribuição-e-publicação)
8. [Exemplos Práticos](#exemplos-práticos)

## Visão Geral

### Arquitetura do Sistema de Plugins

O sistema de plugins do Archbase CLI é baseado em descoberta automática e carregamento dinâmico:

```
📦 Plugin System
├── 🔍 Discovery (Local, Global, Built-in)
├── ✅ Validation (Structure, Dependencies)
├── 🔄 Loading (Dynamic require/import)
├── 🎯 Context (API for plugin interaction)
└── 🔧 Management (Enable/Disable/Configure)
```

### Benefícios dos Plugins

- **Extensibilidade**: Adicione funcionalidades sem modificar o código core
- **Reutilização**: Compartilhe plugins entre projetos e equipes
- **Modularidade**: Mantenha funcionalidades específicas isoladas
- **Comunidade**: Contribua para o ecossistema Archbase

## Tipos de Plugins

### 1. Generator Plugins
Adiciona novos geradores de código:
```bash
archbase generate my-custom-component UserCard --props="name:string,age:number"
```

### 2. Command Plugins
Adiciona novos comandos ao CLI:
```bash
archbase my-custom-command --option value
```

### 3. Analyzer Plugins
Adiciona novos analisadores de código:
```bash
archbase scan project . --analyzer my-custom-analyzer
```

### 4. Boilerplate Plugins
Adiciona novos templates de projeto:
```bash
archbase create project MyApp --template my-custom-template
```

### 5. Knowledge Base Plugins
Adiciona informações sobre componentes customizados:
```bash
archbase query component MyCustomComponent
```

## Criando seu Primeiro Plugin

### Instalação das Ferramentas

```bash
# Instalar Archbase CLI
npm install -g @archbase/cli

# Criar template de plugin
archbase plugin create my-first-plugin --template basic
cd archbase-cli-plugin-my-first-plugin

# Instalar dependências
npm install

# Build do plugin
npm run build
```

### Estrutura do Plugin

```
archbase-cli-plugin-my-first-plugin/
├── package.json              # Metadados do plugin
├── tsconfig.json             # Configuração TypeScript
├── src/
│   ├── index.ts              # Entry point do plugin
│   ├── generators/           # Geradores customizados
│   ├── commands/             # Comandos customizados
│   ├── analyzers/            # Analisadores customizados
│   └── templates/            # Templates para geração
├── test/                     # Testes do plugin
├── dist/                     # Código compilado
└── README.md                 # Documentação
```

### package.json Básico

```json
{
  "name": "archbase-cli-plugin-my-first-plugin",
  "version": "1.0.0",
  "description": "My first Archbase CLI plugin",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "keywords": ["archbase", "cli", "plugin"],
  "archbaseCliVersion": "^0.1.0",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "jest"
  },
  "devDependencies": {
    "@archbase/cli": "^0.1.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### Plugin Básico (src/index.ts)

```typescript
import { Plugin, PluginContext } from '@archbase/cli';

export default function createPlugin(): Plugin {
  return {
    metadata: {
      name: 'archbase-cli-plugin-my-first-plugin',
      version: '1.0.0',
      description: 'My first Archbase CLI plugin'
    },

    async activate(context: PluginContext): Promise<void> {
      context.logger.info('My first plugin activated!');
      
      // Registrar funcionalidades aqui
    },

    async deactivate(): Promise<void> {
      // Cleanup quando necessário
    }
  };
}
```

### Instalação e Teste

```bash
# Build do plugin
npm run build

# Instalar localmente
archbase plugin install .

# Verificar instalação
archbase plugin list

# Testar plugin
archbase plugin info archbase-cli-plugin-my-first-plugin
```

## Geradores Customizados

### Criando um Gerador

```typescript
// src/generators/CardGenerator.ts
export class CardGenerator {
  async generate(name: string, options: any): Promise<void> {
    const { props = '', style = 'default' } = options;
    
    // Parse props
    const propsList = this.parseProps(props);
    
    // Generate component file
    const componentCode = this.generateComponent(name, propsList, style);
    
    // Write to file
    const outputPath = `${name}.tsx`;
    await fs.writeFile(outputPath, componentCode);
    
    console.log(`✅ Generated ${name} component`);
  }

  private parseProps(propsString: string): Array<{name: string, type: string}> {
    if (!propsString) return [];
    
    return propsString.split(',').map(prop => {
      const [name, type] = prop.trim().split(':');
      return { name: name.trim(), type: type.trim() };
    });
  }

  private generateComponent(name: string, props: any[], style: string): string {
    const propsInterface = props.length > 0 
      ? `interface ${name}Props {\n${props.map(p => `  ${p.name}: ${p.type};`).join('\n')}\n}`
      : '';

    const propsParam = props.length > 0 ? `props: ${name}Props` : '';
    const propsDestructure = props.length > 0 
      ? `const { ${props.map(p => p.name).join(', ')} } = props;`
      : '';

    return `import React from 'react';
import { Card } from '@mantine/core';

${propsInterface}

export function ${name}(${propsParam}) {
  ${propsDestructure}

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <div>
        <h3>${name}</h3>
        ${props.map(p => `<p>{${p.name}}</p>`).join('\n        ')}
      </div>
    </Card>
  );
}`;
  }
}
```

### Registrando o Gerador

```typescript
// src/index.ts
import { Plugin, PluginContext } from '@archbase/cli';
import { CardGenerator } from './generators/CardGenerator';

export default function createPlugin(): Plugin {
  return {
    metadata: {
      name: 'archbase-cli-plugin-card-generator',
      version: '1.0.0',
      description: 'Generates card components'
    },

    async activate(context: PluginContext): Promise<void> {
      context.logger.info('Card generator plugin activated!');
      
      // Registrar gerador
      context.registerGenerator('card', new CardGenerator());
    }
  };
}
```

### Usando o Gerador

```bash
# Após instalar o plugin
archbase generate card UserCard --props="name:string,email:string,avatar:string"
```

## Comandos Customizados

### Criando um Comando

```typescript
// src/commands/analyzeCommand.ts
import { Command } from 'commander';
import chalk from 'chalk';

export const analyzeCommand = new Command('analyze-performance')
  .description('Analyze component performance patterns')
  .argument('<path>', 'Path to analyze')
  .option('--threshold <number>', 'Performance threshold (ms)', '100')
  .option('--output <file>', 'Output report file')
  .action(async (path: string, options) => {
    console.log(chalk.blue(`🔍 Analyzing performance in: ${path}`));
    
    const threshold = parseInt(options.threshold);
    
    // Análise customizada
    const results = await analyzePerformance(path, threshold);
    
    if (options.output) {
      await fs.writeJson(options.output, results, { spaces: 2 });
      console.log(chalk.green(`📊 Report saved: ${options.output}`));
    } else {
      displayResults(results);
    }
  });

async function analyzePerformance(path: string, threshold: number) {
  // Implementar análise customizada
  return {
    path,
    threshold,
    slowComponents: [],
    recommendations: []
  };
}

function displayResults(results: any) {
  console.log(chalk.cyan('\n📊 Performance Analysis Results:'));
  console.log(`   Threshold: ${results.threshold}ms`);
  console.log(`   Slow components: ${results.slowComponents.length}`);
}
```

### Registrando o Comando

```typescript
// src/index.ts
import { analyzeCommand } from './commands/analyzeCommand';

export default function createPlugin(): Plugin {
  return {
    // ...metadata

    async activate(context: PluginContext): Promise<void> {
      context.registerCommand(analyzeCommand);
    }
  };
}
```

### Usando o Comando

```bash
archbase analyze-performance ./src --threshold 50 --output performance-report.json
```

## Analisadores Customizados

### Criando um Analisador

```typescript
// src/analyzers/AccessibilityAnalyzer.ts
export class AccessibilityAnalyzer {
  async analyze(projectPath: string): Promise<AccessibilityReport> {
    const files = await this.findComponentFiles(projectPath);
    const issues: AccessibilityIssue[] = [];

    for (const file of files) {
      const fileIssues = await this.analyzeFile(file);
      issues.push(...fileIssues);
    }

    return {
      summary: {
        filesAnalyzed: files.length,
        issuesFound: issues.length,
        criticalIssues: issues.filter(i => i.severity === 'critical').length
      },
      issues,
      recommendations: this.generateRecommendations(issues)
    };
  }

  private async analyzeFile(filePath: string): Promise<AccessibilityIssue[]> {
    const content = await fs.readFile(filePath, 'utf-8');
    const issues: AccessibilityIssue[] = [];

    // Parse JSX and check for accessibility issues
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx']
    });

    traverse(ast, {
      JSXElement: (path) => {
        // Check for missing alt attributes on images
        if (this.isImageElement(path.node)) {
          if (!this.hasAltAttribute(path.node)) {
            issues.push({
              type: 'missing-alt',
              severity: 'critical',
              message: 'Image element missing alt attribute',
              file: filePath,
              line: path.node.loc?.start.line || 0,
              fix: 'Add alt attribute to image element'
            });
          }
        }

        // Check for missing labels on form inputs
        if (this.isInputElement(path.node)) {
          if (!this.hasAssociatedLabel(path.node)) {
            issues.push({
              type: 'missing-label',
              severity: 'warning',
              message: 'Form input missing associated label',
              file: filePath,
              line: path.node.loc?.start.line || 0,
              fix: 'Add label element or aria-label attribute'
            });
          }
        }
      }
    });

    return issues;
  }

  private generateRecommendations(issues: AccessibilityIssue[]): string[] {
    const recommendations: string[] = [];

    const missingAltCount = issues.filter(i => i.type === 'missing-alt').length;
    if (missingAltCount > 0) {
      recommendations.push(`Add alt attributes to ${missingAltCount} image(s)`);
    }

    const missingLabelCount = issues.filter(i => i.type === 'missing-label').length;
    if (missingLabelCount > 0) {
      recommendations.push(`Add labels to ${missingLabelCount} form input(s)`);
    }

    return recommendations;
  }
}

interface AccessibilityReport {
  summary: {
    filesAnalyzed: number;
    issuesFound: number;
    criticalIssues: number;
  };
  issues: AccessibilityIssue[];
  recommendations: string[];
}

interface AccessibilityIssue {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  file: string;
  line: number;
  fix: string;
}
```

### Registrando o Analisador

```typescript
// src/index.ts
import { AccessibilityAnalyzer } from './analyzers/AccessibilityAnalyzer';

export default function createPlugin(): Plugin {
  return {
    // ...metadata

    async activate(context: PluginContext): Promise<void> {
      context.registerAnalyzer('accessibility', new AccessibilityAnalyzer());
    }
  };
}
```

### Usando o Analisador

```bash
# O analisador seria integrado ao sistema de scanning
archbase scan project ./src --analyzer accessibility
```

## Distribuição e Publicação

### Preparação para Publicação

```json
// package.json
{
  "name": "archbase-cli-plugin-my-awesome-plugin",
  "version": "1.0.0",
  "description": "An awesome plugin for Archbase CLI",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist", "README.md", "package.json"],
  "repository": {
    "type": "git",
    "url": "https://github.com/username/archbase-cli-plugin-my-awesome-plugin"
  },
  "bugs": {
    "url": "https://github.com/username/archbase-cli-plugin-my-awesome-plugin/issues"
  },
  "homepage": "https://github.com/username/archbase-cli-plugin-my-awesome-plugin#readme",
  "keywords": [
    "archbase",
    "cli",
    "plugin",
    "react",
    "typescript"
  ],
  "archbaseCliVersion": "^0.1.0"
}
```

### Publicação no npm

```bash
# Build final
npm run build

# Executar testes
npm test

# Publicar
npm publish

# Ou usar np para release automático
npx np
```

### Instalação pelos Usuários

```bash
# Instalação global
npm install -g archbase-cli-plugin-my-awesome-plugin

# Instalação local no projeto
npm install archbase-cli-plugin-my-awesome-plugin

# Verificar instalação
archbase plugin list
archbase plugin info archbase-cli-plugin-my-awesome-plugin
```

## Exemplos Práticos

### 1. Plugin de Geração de Storybook

```typescript
// archbase-cli-plugin-storybook
export class StorybookGenerator {
  async generate(componentName: string, options: any): Promise<void> {
    const storyContent = `
import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from './${componentName}';

const meta: Meta<typeof ${componentName}> = {
  title: 'Components/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add your component props here
  },
};
`;

    await fs.writeFile(`${componentName}.stories.tsx`, storyContent);
    console.log(`✅ Generated Storybook story for ${componentName}`);
  }
}
```

### 2. Plugin de Análise de Bundle

```typescript
// archbase-cli-plugin-bundle-analyzer
export class BundleAnalyzer {
  async analyze(projectPath: string): Promise<BundleReport> {
    // Analisar arquivos de build
    // Calcular tamanhos de dependências
    // Identificar duplicações
    // Sugerir otimizações
    
    return {
      totalSize: '2.3MB',
      chunks: [...],
      duplicates: [...],
      recommendations: [
        'Consider code splitting for large components',
        'Remove unused dependencies'
      ]
    };
  }
}
```

### 3. Plugin de Migração Customizada

```typescript
// archbase-cli-plugin-migration-helper
export class MigrationHelper {
  async migrate(projectPath: string, fromVersion: string, toVersion: string): Promise<void> {
    const migrationRules = this.getMigrationRules(fromVersion, toVersion);
    
    for (const rule of migrationRules) {
      await this.applyMigrationRule(projectPath, rule);
    }
  }
  
  private getMigrationRules(from: string, to: string): MigrationRule[] {
    // Retornar regras específicas para a migração
    return [];
  }
}
```

## Configuração e Personalização

### Configuração de Plugin

```bash
# Configurar plugin
archbase plugin config my-plugin --set apiKey=abc123
archbase plugin config my-plugin --set endpoint=https://api.example.com

# Ver configuração
archbase plugin config my-plugin --list

# Usar configuração no plugin
```

```typescript
// No plugin, acessar configuração
export default function createPlugin(): Plugin {
  return {
    async activate(context: PluginContext): Promise<void> {
      const config = context.getConfig('my-plugin');
      const apiKey = config.apiKey;
      const endpoint = config.endpoint;
      
      // Usar configuração
    }
  };
}
```

### Habilitar/Desabilitar Plugins

```bash
# Desabilitar plugin
archbase plugin disable problematic-plugin

# Habilitar novamente
archbase plugin enable problematic-plugin

# Status dos plugins
archbase plugin list --installed
```

## Debugging e Testes

### Debug Mode

```bash
# Executar com debug
DEBUG=archbase:plugin archbase generate my-component Test

# Ver logs detalhados
archbase --verbose plugin list
```

### Testes de Plugin

```typescript
// test/index.test.ts
import createPlugin from '../src/index';

describe('My Plugin', () => {
  let plugin: Plugin;
  let mockContext: PluginContext;

  beforeEach(() => {
    plugin = createPlugin();
    mockContext = {
      registerGenerator: jest.fn(),
      registerCommand: jest.fn(),
      logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn()
      },
      cli: {
        version: '0.1.0',
        rootPath: '/test',
        userConfigPath: '/test/.archbase'
      }
    };
  });

  it('should activate successfully', async () => {
    await plugin.activate(mockContext);
    
    expect(mockContext.registerGenerator).toHaveBeenCalled();
    expect(mockContext.logger.info).toHaveBeenCalledWith(
      expect.stringContaining('activated')
    );
  });
});
```

## Boas Práticas

### 1. Nomenclatura
- Use prefixo `archbase-cli-plugin-`
- Nome descritivo e único
- Versioning semântico

### 2. Documentação
- README detalhado com exemplos
- Documentar todas as opções
- Incluir troubleshooting

### 3. Testes
- Testes unitários abrangentes
- Testes de integração
- CI/CD pipeline

### 4. Performance
- Carregamento lazy quando possível
- Cache de resultados
- Evitar dependências pesadas

### 5. Compatibilidade
- Especificar versão do Archbase CLI
- Testes em múltiplas versões
- Backward compatibility

O sistema de plugins do Archbase CLI oferece flexibilidade total para extensão da ferramenta, permitindo que desenvolvedores e equipes criem soluções específicas para suas necessidades sem comprometer a estabilidade do core da aplicação.