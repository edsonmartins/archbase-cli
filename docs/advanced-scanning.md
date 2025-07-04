# Advanced Component Scanning

O Archbase CLI oferece um sistema avançado de scanning que analisa projetos em profundidade para detectar padrões, issues e oportunidades de melhoria com componentes Archbase.

## Visão Geral

O sistema de scanning inclui:
- **Análise Estática**: Scanning completo de projetos
- **Análise em Tempo Real**: Monitoramento contínuo de mudanças
- **Detecção de Padrões**: Identificação de patterns conhecidos
- **Análise de Migração**: Identificação de oportunidades V1→V2
- **Health Check**: Avaliação da saúde do projeto
- **Auto-Fix**: Correção automática de issues comuns

## Comandos de Scanning

### 1. Scan de Projeto Completo

```bash
# Análise básica
archbase scan project ./my-project

# Com relatório detalhado
archbase scan project ./my-project --report --output ./scan-report.json

# Análise profunda
archbase scan project ./my-project --deep --fix

# Dry run para ver o que seria corrigido
archbase scan project ./my-project --fix --dry-run
```

### 2. Scan de Componentes Específicos

```bash
# Todos os componentes
archbase scan components ./src

# Componente específico
archbase scan components ./src --component ArchbaseEdit

# Formato JSON
archbase scan components ./src --format json

# Formato CSV para planilhas
archbase scan components ./src --format csv

# Informações detalhadas
archbase scan components ./src --detailed
```

### 3. Análise de Migração

```bash
# Análise de migração V1→V2
archbase scan migration ./my-project

# Foco em componente específico
archbase scan migration ./my-project --component ArchbaseDataGrid

# Migração automática (casos simples)
archbase scan migration ./my-project --auto-migrate

# Preview da migração
archbase scan migration ./my-project --dry-run
```

### 4. Health Check

```bash
# Verificação geral de saúde
archbase scan health ./my-project

# Com correções automáticas
archbase scan health ./my-project --fix
```

### 5. Scanner em Tempo Real

```bash
# Monitoramento básico
archbase scan watch ./my-project

# Com auto-fix habilitado
archbase scan watch ./my-project --auto-fix

# Verbose para desenvolvimento
archbase scan watch ./my-project --verbose

# Padrões customizados
archbase scan watch ./my-project --patterns "src/**/*.tsx,components/**/*.ts"
```

## Tipos de Análise

### Detecção de Componentes

O scanner identifica automaticamente:

**Componentes Archbase:**
- Todos os componentes da biblioteca archbase-react
- Props utilizadas e seus tipos
- Integração com DataSource (V1 ou V2)
- Padrões de uso implementados

**Exemplo de Saída:**
```
📋 Component Usage:

ArchbaseEdit (UserForm.tsx:25)
   Import: archbase-react
   DataSource: V2
   Props: dataSource:variable, dataField:string, label:string
   Patterns: form-with-datasource
   Issues: 0

ArchbaseDataGrid (UserList.tsx:40)
   Import: archbase-react
   DataSource: V1
   Props: dataSource:variable, columns:array
   Patterns: crud-with-datagrid
   Issues: 2
     WARNING: Consider migrating to DataSource V2
     SUGGESTION: Add loading state for better UX
```

### Detecção de Padrões

**Padrões Suportados:**
- `form-with-datasource`: Formulários com integração DataSource
- `crud-with-datagrid`: Interface CRUD com DataGrid
- `async-loading`: Operações assíncronas com loading
- `validation-with-feedback`: Validação com feedback visual

**Análise de Padrões:**
```
✅ Patterns detected:
   • form-with-datasource
   • crud-with-datagrid

💡 Recommended patterns:
   • async-loading
   • validation-with-feedback
```

### Detecção de Issues

**Tipos de Issues:**
- **ERROR**: Props obrigatórias ausentes
- **WARNING**: Uso de padrões V1 ou deprecated
- **SUGGESTION**: Melhorias de performance ou UX

**Categorias:**
- Configuração incorreta de componentes
- Uso de APIs deprecated
- Oportunidades de migração V1→V2
- Melhorias de performance
- Padrões de UX não implementados

### Análise de Dependências

```
📦 Dependencies:
   Archbase React: ^2.1.0
   React: ^18.2.0
   Missing recommended: @mantine/hooks, react-query
```

## Scanner em Tempo Real

### Funcionalidades

**Monitoramento Contínuo:**
- Detecta mudanças em arquivos TypeScript/JavaScript
- Analisa novos componentes automaticamente
- Identifica issues em tempo real
- Sugere melhorias durante desenvolvimento

**Feedback Imediato:**
```
📝 [14:30:25] UserForm.tsx
   Components: 3
   New issues: 1
   Patterns: form-with-datasource
   Critical issues:
     ❌ Missing required prop: dataSource

   Suggestions:
     💡 Consider migrating 1 component(s) to DataSource V2
```

**Auto-Fix:**
- Correções automáticas de issues simples
- Adição de props obrigatórias básicas
- Correção de imports incorretos
- Aplicação de padrões recomendados

### Configuração do Watch

```bash
# Padrões personalizados
archbase scan watch ./project \
  --patterns "src/**/*.{ts,tsx}" \
  --ignore "**/*.test.ts,**/*.spec.tsx"

# Debounce customizado (útil para IDEs que salvam frequentemente)
archbase scan watch ./project --debounce 500

# Auto-fix com logging detalhado
archbase scan watch ./project --auto-fix --verbose
```

## Relatórios de Análise

### Relatório JSON

```json
{
  "generatedAt": "2024-12-03T14:30:00.000Z",
  "summary": {
    "totalComponents": 25,
    "archbaseComponents": 18,
    "v1Components": 5,
    "v2Components": 13,
    "filesScanned": 12,
    "issuesFound": 8
  },
  "components": [
    {
      "name": "ArchbaseEdit",
      "file": "src/components/UserForm.tsx",
      "line": 25,
      "hasDataSource": true,
      "dataSourceVersion": "v2",
      "props": [
        {"name": "dataSource", "type": "variable"},
        {"name": "dataField", "type": "string", "value": "name"}
      ],
      "patterns": ["form-with-datasource"],
      "issues": []
    }
  ],
  "patterns": {
    "detected": ["form-with-datasource", "crud-with-datagrid"],
    "missing": ["async-loading"],
    "recommended": ["validation-with-feedback"]
  },
  "migration": {
    "v1ToV2Candidates": [
      {
        "name": "ArchbaseDataGrid",
        "file": "src/components/UserList.tsx",
        "estimatedEffort": "Medium"
      }
    ],
    "estimatedEffort": "Medium",
    "recommendations": [
      "Migrate 5 components to DataSource V2",
      "Add validation feedback to forms"
    ]
  }
}
```

### Health Score

**Cálculo do Score:**
- Base: 100 pontos
- -30 pontos por componentes V1 (proporcionalmente)
- -20 pontos por issues (proporcionalmente)
- -5 pontos por dependência ausente
- +5 pontos por padrão implementado

**Interpretação:**
- 80-100: Excelente ✅
- 60-79: Bom ⚠️
- 0-59: Precisa melhorias ❌

```
📊 Health Score: 85/100

💡 Recommendations:
   • Migrate to DataSource V2 for better performance
   • Install recommended dependencies
   • Implement recommended patterns
```

## Casos de Uso

### 1. Auditoria de Projeto

```bash
# Análise completa para auditoria
archbase scan project ./enterprise-app \
  --report \
  --output ./audit-report.json \
  --deep

# Análise de saúde
archbase scan health ./enterprise-app

# Verificar oportunidades de migração
archbase scan migration ./enterprise-app
```

### 2. Desenvolvimento Ativo

```bash
# Monitoramento durante desenvolvimento
archbase scan watch ./src --auto-fix --verbose

# Em outro terminal, continuar desenvolvendo
# Scanner vai dar feedback em tempo real
```

### 3. Code Review

```bash
# Análise antes do commit
archbase scan project ./feature-branch --fix

# Gerar relatório para o PR
archbase scan project ./feature-branch \
  --report \
  --output ./pr-analysis.json
```

### 4. Migração Planejada

```bash
# 1. Análise inicial
archbase scan migration ./legacy-project

# 2. Migração automática (casos simples)
archbase scan migration ./legacy-project --auto-migrate

# 3. Análise pós-migração
archbase scan project ./legacy-project --report
```

### 5. Monitoramento de Qualidade

```bash
# CI/CD Pipeline
archbase scan project . --report --output ./scan-results.json
archbase scan health . --fix

# Script de qualidade diária
#!/bin/bash
archbase scan project ./src --fix
archbase scan health ./src
```

## Integração com IDEs

### VS Code

**Configuração de tarefa (.vscode/tasks.json):**
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Archbase: Scan Project",
      "type": "shell",
      "command": "archbase",
      "args": ["scan", "project", "."],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    },
    {
      "label": "Archbase: Start Watcher",
      "type": "shell",
      "command": "archbase",
      "args": ["scan", "watch", ".", "--auto-fix"],
      "group": "build",
      "isBackground": true,
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "dedicated"
      }
    }
  ]
}
```

### Configuração de Workspace

**settings.json:**
```json
{
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/dist/**": true,
    "**/build/**": true,
    "**/.git/**": true
  },
  "typescript.preferences.organizeImports": true,
  "editor.formatOnSave": true
}
```

## Performance e Otimizações

### Para Projetos Grandes

```bash
# Scanning seletivo
archbase scan components ./src/critical-components

# Exclusão de diretórios grandes
archbase scan project . \
  --exclude "node_modules/**,dist/**,coverage/**,docs/**"

# Padrões específicos para reduzir carga
archbase scan watch ./src \
  --patterns "src/components/**/*.tsx" \
  --debounce 2000
```

### Cache e Performance

- **Cache Inteligente**: Resultados em cache para arquivos não modificados
- **Análise Incremental**: Apenas arquivos alterados são re-analisados
- **Debounce**: Evita análises excessivas durante edição
- **Background Processing**: Scanner não bloqueia outras operações

## Troubleshooting

### Problemas Comuns

**Scanner muito lento:**
```bash
# Reduzir escopo
archbase scan project ./src/components --exclude "**/*.test.*"

# Reduzir profundidade
archbase scan project . --include "**/*.tsx"
```

**Muitos falsos positivos:**
```bash
# Ajustar sensibilidade
archbase scan components . --component ArchbaseEdit
```

**Watcher consumindo muitos recursos:**
```bash
# Aumentar debounce
archbase scan watch . --debounce 3000

# Reduzir padrões
archbase scan watch . --patterns "src/**/*.tsx"
```

### Debug Mode

```bash
# Debug completo
DEBUG=archbase:* archbase scan project .

# Debug específico
DEBUG=archbase:scanner archbase scan components .
DEBUG=archbase:watcher archbase scan watch .
```

O sistema de scanning avançado transforma a manutenção de projetos Archbase, oferecendo insights contínuos e melhorias automáticas para garantir código de alta qualidade.