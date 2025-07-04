# Funcionalidades Avançadas do Archbase CLI

Este documento detalha as funcionalidades mais avançadas do Archbase CLI, incluindo scanning de projetos, ferramentas de migração, e integração com workflows de desenvolvimento.

## Índice

1. [Sistema de Scanning Avançado](#sistema-de-scanning-avançado)
2. [Ferramentas de Migração](#ferramentas-de-migração)
3. [Análise de Código AST](#análise-de-código-ast)
4. [Padrões e Anti-padrões](#padrões-e-anti-padrões)
5. [Integração com CI/CD](#integração-com-cicd)
6. [Monitoramento em Tempo Real](#monitoramento-em-tempo-real)
7. [Relatórios e Métricas](#relatórios-e-métricas)

## Sistema de Scanning Avançado

### Visão Geral

O sistema de scanning do Archbase CLI utiliza análise AST (Abstract Syntax Tree) para identificar componentes, padrões de uso, e oportunidades de melhoria em projetos existentes.

### Funcionalidades Principais

**Detecção de Componentes:**
- Identificação automática de todos os componentes Archbase
- Análise de props utilizadas e seus tipos
- Detecção de versão do DataSource (V1 vs V2)
- Mapeamento de importações e dependências

**Análise de Padrões:**
- Identificação de patterns implementados
- Detecção de anti-patterns e code smells
- Sugestões de melhorias arquiteturais
- Validação de convenções de nomenclatura

**Detecção de Issues:**
- Props obrigatórias ausentes
- Uso de APIs deprecated
- Configurações incorretas
- Oportunidades de otimização

### Comandos de Scanning

```bash
# Análise completa do projeto
archbase scan project ./my-project

# Análise específica de componentes
archbase scan components ./src --component ArchbaseEdit

# Análise de migração
archbase scan migration ./project

# Health check
archbase scan health ./project

# Monitoramento em tempo real
archbase scan watch ./src
```

### Exemplo de Saída

```
🔍 Scanning project for Archbase components...
📁 Found 45 files to analyze

📊 Scan Results:
   Files scanned: 45
   Archbase components found: 28
   DataSource V1 components: 5
   DataSource V2 components: 23
   Issues found: 12

✅ Patterns detected:
   • form-with-datasource
   • crud-with-datagrid

💡 Recommended patterns:
   • async-loading
   • validation-with-feedback

🔄 Migration Opportunities:
   Components that can be migrated to V2: 5
   Estimated effort: Medium
   • Migrate 5 components to DataSource V2
   • Use ArchbaseRemoteDataSource for better performance
```

## Ferramentas de Migração

### Migração V1 → V2

O sistema de migração utiliza transformações AST para converter automaticamente código DataSource V1 para V2.

**Transformações Aplicadas:**

1. **Imports:**
   ```typescript
   // ANTES
   import { ArchbaseDataSource } from 'archbase-react';
   
   // DEPOIS
   import { ArchbaseRemoteDataSource } from 'archbase-react';
   ```

2. **Instanciação:**
   ```typescript
   // ANTES
   const dataSource = new ArchbaseDataSource();
   
   // DEPOIS
   const dataSource = new ArchbaseRemoteDataSource();
   ```

3. **Props de Componente:**
   ```typescript
   // ANTES
   <ArchbaseEdit 
     dataSource={ds}
     forceUpdate={true}
   />
   
   // DEPOIS
   <ArchbaseEdit 
     dataSource={ds}
     // forceUpdate removido
   />
   ```

4. **Chamadas de Método:**
   ```typescript
   // ANTES
   dataSource.forceUpdate();
   
   // DEPOIS
   // Removido - automático no V2
   ```

### Classificação de Complexidade

**Simple (Automática):**
- Componentes básicos com poucos props
- Sem configurações customizadas
- Padrões V1 diretos

**Medium (Semi-automática):**
- Componentes com configurações moderadas
- Issues menores identificados
- Requer revisão após migração

**Complex (Manual):**
- Lógica de negócio complexa
- Muitas customizações
- Hooks ou HOCs customizados

### Comandos de Migração

```bash
# Análise de migração
archbase migrate analyze ./project --report

# Migração V1→V2 com preview
archbase migrate v1-to-v2 ./src --dry-run

# Migração automática com backup
archbase migrate v1-to-v2 ./src --backup

# Migração em lote excluindo casos complexos
archbase migrate batch ./project --exclude-complex
```

## Análise de Código AST

### Parser Configuration

O sistema utiliza Babel parser com configuração otimizada para TypeScript e JSX:

```typescript
const ast = parser.parse(content, {
  sourceType: 'module',
  plugins: ['typescript', 'jsx']
});
```

### Traversal Patterns

**Detecção de Imports:**
```typescript
traverse(ast, {
  ImportDeclaration: (path) => {
    const source = path.node.source.value;
    if (source.includes('archbase-react')) {
      // Analisar imports Archbase
    }
  }
});
```

**Análise de JSX:**
```typescript
traverse(ast, {
  JSXElement: (path) => {
    const componentName = path.node.openingElement.name.name;
    if (archbaseComponents.has(componentName)) {
      // Analisar uso do componente
    }
  }
});
```

**Detecção de Props:**
```typescript
element.attributes.forEach(attr => {
  if (t.isJSXAttribute(attr)) {
    const propName = attr.name.name;
    const propValue = extractValue(attr.value);
    // Analisar prop
  }
});
```

### Geração de Código

Para migrações, o sistema regenera código usando Babel Generator:

```typescript
const generate = require('@babel/generator').default;
const result = generate(ast, { 
  retainLines: true,
  compact: false 
});
```

## Padrões e Anti-padrões

### Padrões Identificados

**form-with-datasource:**
- ArchbaseFormTemplate + ArchbaseRemoteDataSource
- Integração adequada de dados
- Validação configurada

**crud-with-datagrid:**
- ArchbaseDataGrid + ArchbaseRemoteDataSource
- Ações de linha configuradas
- Toolbar com operações CRUD

**async-loading:**
- Componentes com estados de loading
- Tratamento adequado de erros
- UX otimizada para operações assíncronas

**validation-with-feedback:**
- Validação configurada
- Feedback visual para usuário
- Mensagens de erro claras

### Anti-padrões Detectados

**Missing DataSource:**
```typescript
// ANTI-PATTERN
<ArchbaseEdit dataField="name" />
// Sem dataSource

// PATTERN
<ArchbaseEdit 
  dataSource={dataSource}
  dataField="name"
/>
```

**Manual forceUpdate:**
```typescript
// ANTI-PATTERN (V1)
dataSource.setFieldValue('name', value);
dataSource.forceUpdate();

// PATTERN (V2)
dataSource.setFieldValue('name', value);
// Update automático
```

**Mixed V1/V2:**
```typescript
// ANTI-PATTERN
const ds1 = new ArchbaseDataSource(); // V1
const ds2 = new ArchbaseRemoteDataSource(); // V2
// Mistura de versões
```

## Integração com CI/CD

### GitHub Actions

```yaml
name: Archbase Quality Gate
on: [push, pull_request]

jobs:
  archbase-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Archbase CLI
        run: npm install -g @archbase/cli
        
      - name: Archbase Health Check
        run: archbase scan health . --fix
        
      - name: Migration Analysis
        run: |
          archbase migrate analyze . --report --output migration-report.json
          
      - name: Project Scan
        run: |
          archbase scan project . --report --output scan-report.json
          
      - name: Upload Reports
        uses: actions/upload-artifact@v3
        with:
          name: archbase-reports
          path: |
            migration-report.json
            scan-report.json
            
      - name: Check Migration Complexity
        run: |
          COMPLEX=$(cat migration-report.json | jq '.issues[] | select(.complexity=="complex") | length')
          if [ "$COMPLEX" -gt 0 ]; then
            echo "::warning::$COMPLEX complex migrations detected"
          fi
```

### Jenkins Pipeline

```groovy
pipeline {
    agent any
    
    stages {
        stage('Archbase Analysis') {
            steps {
                sh 'npm install -g @archbase/cli'
                
                script {
                    // Health check
                    def healthResult = sh(
                        script: 'archbase scan health . --fix',
                        returnStatus: true
                    )
                    
                    // Migration analysis
                    sh 'archbase migrate analyze . --report --output migration-report.json'
                    
                    // Project scan
                    sh 'archbase scan project . --report --output scan-report.json'
                    
                    // Archive reports
                    archiveArtifacts artifacts: '*-report.json'
                    
                    // Parse results
                    def scanReport = readJSON file: 'scan-report.json'
                    def healthScore = scanReport.healthScore
                    
                    if (healthScore < 80) {
                        unstable("Health score below threshold: ${healthScore}")
                    }
                }
            }
        }
        
        stage('Auto Migration') {
            when {
                expression { 
                    def report = readJSON file: 'migration-report.json'
                    return report.issues.findAll { it.complexity == 'simple' }.size() > 0
                }
            }
            steps {
                sh 'archbase migrate v1-to-v2 . --exclude-complex --backup'
            }
        }
    }
    
    post {
        always {
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: '.',
                reportFiles: 'scan-report.json',
                reportName: 'Archbase Scan Report'
            ])
        }
    }
}
```

## Monitoramento em Tempo Real

### RealtimeScanner

O sistema de monitoramento em tempo real observa mudanças nos arquivos e fornece feedback instantâneo.

**Funcionalidades:**
- Detecção de mudanças com `chokidar`
- Análise incremental de arquivos modificados
- Debounce para evitar análises excessivas
- Auto-fix de issues simples
- Feedback contextual durante desenvolvimento

**Configuração:**
```typescript
interface RealtimeScanOptions {
  projectPath: string;
  watchPatterns?: string[];
  ignorePatterns?: string[];
  debounceMs?: number;
  autoFix?: boolean;
  verboseLogging?: boolean;
}
```

**Exemplo de Uso:**
```bash
# Monitoramento básico
archbase scan watch ./src

# Com auto-fix e logging detalhado
archbase scan watch ./src --auto-fix --verbose --debounce 500

# Padrões customizados
archbase scan watch ./src \
  --patterns "components/**/*.tsx,pages/**/*.ts" \
  --ignore "**/*.test.*,**/*.stories.*"
```

**Saída em Tempo Real:**
```
👀 Starting real-time scanner for: ./src
📊 Initial Scan Summary:
   Files: 23
   Components: 15
   V2 Components: 12
   V1 Components: 3
   Issues: 5

📝 [14:30:25] UserForm.tsx
   Components: 2
   New issues: 1
   Patterns: form-with-datasource
   Critical issues:
     ❌ Missing required prop: dataSource

   Suggestions:
     💡 Consider migrating 1 component(s) to DataSource V2
     🔧 Auto-fixed 1 issue(s)
```

## Relatórios e Métricas

### Estrutura de Relatórios

**Scan Report:**
```json
{
  "generatedAt": "2024-12-03T14:30:00.000Z",
  "summary": {
    "totalComponents": 25,
    "archbaseComponents": 18,
    "v1Components": 5,
    "v2Components": 13,
    "filesScanned": 12,
    "issuesFound": 8,
    "healthScore": 85
  },
  "components": [
    {
      "name": "ArchbaseEdit",
      "file": "src/UserForm.tsx",
      "line": 25,
      "hasDataSource": true,
      "dataSourceVersion": "v2",
      "props": [...],
      "patterns": ["form-with-datasource"],
      "issues": []
    }
  ],
  "patterns": {
    "detected": ["form-with-datasource"],
    "missing": ["async-loading"],
    "recommended": ["validation-with-feedback"]
  },
  "migration": {
    "v1ToV2Candidates": [...],
    "estimatedEffort": "Medium",
    "recommendations": [...]
  },
  "dependencies": {
    "archbaseVersion": "^2.1.0",
    "missingDependencies": [],
    "outdatedDependencies": []
  }
}
```

**Migration Report:**
```json
{
  "timestamp": "2024-12-03T15:45:00.000Z",
  "analysis": {
    "totalFiles": 45,
    "migrableFiles": 12,
    "issues": [...],
    "estimatedEffort": "Medium"
  },
  "migration": {
    "processedFiles": 12,
    "totalChanges": 34,
    "errors": [],
    "warnings": [
      "Manual review recommended for CustomDataGrid component"
    ],
    "changes": [
      {
        "file": "src/UserForm.tsx",
        "changes": [
          {
            "type": "replace",
            "description": "Updated import from ArchbaseDataSource to ArchbaseRemoteDataSource",
            "line": 5,
            "before": "import { ArchbaseDataSource }",
            "after": "import { ArchbaseRemoteDataSource }"
          }
        ]
      }
    ]
  }
}
```

### Métricas de Qualidade

**Health Score Calculation:**
```typescript
function calculateHealthScore(result: ProjectScanResult): number {
  let score = 100;

  // Deduct for V1 components
  const v1Ratio = result.statistics.v1Components / 
                  (result.statistics.archbaseComponents || 1);
  score -= v1Ratio * 30;

  // Deduct for issues
  const issueRatio = result.statistics.issuesFound / 
                     (result.statistics.archbaseComponents || 1);
  score -= issueRatio * 20;

  // Deduct for missing dependencies
  score -= result.dependencies.missingDependencies.length * 5;

  // Bonus for implemented patterns
  score += result.patterns.detected.length * 5;

  return Math.max(0, Math.round(score));
}
```

**Interpretação do Score:**
- **90-100**: Excelente ✅ - Projeto em ótimo estado
- **80-89**: Muito Bom ✅ - Pequenos ajustes recomendados
- **70-79**: Bom ⚠️ - Algumas melhorias necessárias
- **60-69**: Regular ⚠️ - Atenção a issues importantes
- **0-59**: Precisa Melhorias ❌ - Revisão significativa necessária

### Dashboard e Visualização

**Métricas Principais:**
- Distribuição de componentes V1/V2
- Evolução do health score ao longo do tempo
- Top issues por categoria
- Progresso de migração
- Padrões implementados vs recomendados

**Integração com Ferramentas:**
- Grafana dashboards para métricas contínuas
- SonarQube integration para quality gates
- Slack/Teams notifications para alertas
- JIRA integration para issue tracking

As funcionalidades avançadas do Archbase CLI transformam a manutenção e evolução de projetos em um processo automatizado e orientado por dados, garantindo qualidade consistente e facilitando migrações entre versões.