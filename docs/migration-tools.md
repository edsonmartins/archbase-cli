# Ferramentas de Migração Archbase

O Archbase CLI oferece ferramentas avançadas para migração automática e semi-automática entre versões, especialmente para a migração do DataSource V1 para V2.

## Visão Geral

As ferramentas de migração incluem:
- **Análise de Migração**: Identificação automática de oportunidades
- **Migração V1→V2**: Transformação automática de código
- **Migração em Lote**: Processamento de múltiplos arquivos
- **Validação Pós-Migração**: Verificação de integridade

## Comandos de Migração

### 1. Análise de Migração

```bash
# Análise básica do projeto
archbase migrate analyze ./my-project

# Análise com relatório detalhado
archbase migrate analyze ./my-project --report --output ./migration-plan.json

# Focar em componente específico
archbase migrate analyze ./src --component ArchbaseEdit
```

**Exemplo de Saída:**
```
📊 Migration Analysis Results:
   Total files scanned: 45
   Files requiring migration: 12
   Migration issues found: 28
   Estimated effort: Medium

🔄 Migration Issues:
   Simple: 15 (auto-migratable)
   Medium: 8 (semi-automatic)
   Complex: 5 (manual review needed)

📋 Top Migration Issues:
   SIMPLE - ArchbaseEdit in src/UserForm.tsx
     Migrates from ArchbaseDataSource to ArchbaseRemoteDataSource
   MEDIUM - ArchbaseDataGrid in src/UserList.tsx
     Updates event handler patterns for V2
```

### 2. Migração V1 para V2

```bash
# Migração automática
archbase migrate v1-to-v2 ./src

# Preview das mudanças (dry run)
archbase migrate v1-to-v2 ./src --dry-run

# Focar em componente específico
archbase migrate v1-to-v2 ./src --component ArchbaseEdit

# Com backup automático
archbase migrate v1-to-v2 ./src --backup

# Padrões customizados
archbase migrate v1-to-v2 ./src \
  --include "components/**/*.tsx" \
  --exclude "**/*.test.tsx"
```

### 3. Migração em Lote

```bash
# Migração em lote básica
archbase migrate batch ./my-project

# Excluir migrações complexas
archbase migrate batch ./my-project --exclude-complex

# Aplicar regras específicas
archbase migrate batch ./my-project --rules "datasource-v1-to-v2,form-validation-upgrade"

# Com relatório completo
archbase migrate batch ./my-project --report --output ./batch-migration-report.json
```

## Regras de Migração

### DataSource V1 → V2

**O que é migrado:**
```typescript
// ANTES (V1)
import { ArchbaseDataSource } from 'archbase-react';

const dataSource = new ArchbaseDataSource();
dataSource.forceUpdate();

<ArchbaseEdit 
  dataSource={dataSource}
  dataField="name"
  forceUpdate={true}
/>

// DEPOIS (V2)
import { ArchbaseRemoteDataSource } from 'archbase-react';

const dataSource = new ArchbaseRemoteDataSource();
// forceUpdate removido - automático no V2

<ArchbaseEdit 
  dataSource={dataSource}
  dataField="name"
  // forceUpdate removido
/>
```

**Transformações aplicadas:**
- ✅ `ArchbaseDataSource` → `ArchbaseRemoteDataSource`
- ✅ Remoção de props `forceUpdate`
- ✅ Remoção de chamadas `forceUpdate()`
- ✅ Atualização de imports

### Validação de Formulários

```typescript
// ANTES (V1)
<ArchbaseFormTemplate
  validation={validationRules}
  onValidationError={handleError}
/>

// DEPOIS (V2)
<ArchbaseFormTemplate
  validationRules={validationRules}
  onValidationFailed={handleError}
/>
```

### Event Handlers

```typescript
// ANTES (V1)
<ArchbaseDataGrid
  onRowClick={handleRowClick}
  onCellClick={handleCellClick}
/>

// DEPOIS (V2)
<ArchbaseDataGrid
  onRowSelect={handleRowClick}
  onCellSelect={handleCellClick}
/>
```

## Classificação de Complexidade

### Migração Simples (Automática)
- ✅ Componentes com poucos props (≤5)
- ✅ Sem issues conhecidos
- ✅ Padrões V1 básicos
- ✅ **Componentes:** ArchbaseEdit, ArchbaseSelect, ArchbaseTextArea

**Exemplo:**
```typescript
// Migração automática 100% confiável
<ArchbaseEdit dataSource={ds} dataField="name" />
```

### Migração Média (Semi-automática)
- ⚠️ Componentes com props moderados (6-10)
- ⚠️ Issues menores identificados
- ⚠️ Configurações customizadas
- ⚠️ **Componentes:** ArchbaseDataGrid, ArchbaseFormTemplate

**Exemplo:**
```typescript
// Requer revisão após migração
<ArchbaseDataGrid 
  dataSource={ds}
  columns={customColumns}
  onRowClick={customHandler}
  pagination={customPagination}
/>
```

### Migração Complexa (Manual)
- ❌ Muitos props customizados (>10)
- ❌ Issues críticos identificados
- ❌ Lógica de negócio complexa
- ❌ **Situações:** Hooks customizados, HOCs, patterns avançados

**Exemplo:**
```typescript
// Migração manual necessária
<CustomDataGrid 
  dataSource={ds}
  customRenderer={complexRenderer}
  onRowClick={(row) => {
    // Lógica complexa específica do projeto
    handleComplexLogic(row);
  }}
  // ... muitos outros props
/>
```

## Fluxo de Migração Recomendado

### 1. Análise Inicial
```bash
# Primeiro, entenda o escopo
archbase migrate analyze ./my-project --report
```

### 2. Backup
```bash
# Crie um backup do projeto
cp -r ./my-project ./my-project-backup

# Ou use Git
git add . && git commit -m "Backup before migration"
```

### 3. Migração Incremental
```bash
# Comece com migrações simples
archbase migrate v1-to-v2 ./src --dry-run

# Execute se estiver satisfeito
archbase migrate v1-to-v2 ./src --backup

# Teste a aplicação
npm test
npm run build
```

### 4. Migração Média
```bash
# Migre componentes médios
archbase migrate batch ./src --exclude-complex --dry-run

# Execute com cuidado
archbase migrate batch ./src --exclude-complex
```

### 5. Revisão Manual
```bash
# Identifique casos complexos
archbase migrate analyze ./src --component ArchbaseDataGrid

# Migre manualmente casos complexos
# (edição manual necessária)
```

### 6. Validação Final
```bash
# Verifique saúde do projeto
archbase scan health ./my-project

# Execute testes completos
npm test
npm run e2e-test

# Verifique build
npm run build
```

## Relatórios de Migração

### Relatório de Análise

```json
{
  "timestamp": "2024-12-03T14:30:00.000Z",
  "totalFiles": 45,
  "migrableFiles": 12,
  "issues": [
    {
      "file": "src/UserForm.tsx",
      "component": "ArchbaseEdit",
      "rule": "datasource-v1-to-v2",
      "complexity": "simple",
      "description": "Migrates from ArchbaseDataSource to ArchbaseRemoteDataSource"
    }
  ],
  "estimatedEffort": "Medium",
  "recommendations": [
    "Start with simple migrations first",
    "Review medium complexity cases manually",
    "Test thoroughly after each batch"
  ]
}
```

### Relatório de Migração

```json
{
  "timestamp": "2024-12-03T15:45:00.000Z",
  "analysis": { /* análise completa */ },
  "migration": {
    "processedFiles": 12,
    "totalChanges": 34,
    "errors": [],
    "changes": [
      {
        "file": "src/UserForm.tsx",
        "changes": [
          {
            "type": "replace",
            "description": "Updated import from ArchbaseDataSource to ArchbaseRemoteDataSource",
            "line": 5
          },
          {
            "type": "remove", 
            "description": "Removed forceUpdate prop",
            "line": 25
          }
        ]
      }
    ]
  }
}
```

## Tratamento de Casos Especiais

### 1. Hooks Customizados

```typescript
// ANTES - requer migração manual
const useCustomDataSource = () => {
  const ds = new ArchbaseDataSource();
  // lógica customizada
  return ds;
};

// DEPOIS - adaptar para V2
const useCustomDataSource = () => {
  const ds = new ArchbaseRemoteDataSource();
  // adaptar lógica para V2
  return ds;
};
```

### 2. HOCs (Higher-Order Components)

```typescript
// ANTES
const withDataSource = (Component) => {
  return (props) => {
    const ds = new ArchbaseDataSource();
    return <Component {...props} dataSource={ds} />;
  };
};

// DEPOIS - migração manual
const withDataSource = (Component) => {
  return (props) => {
    const ds = new ArchbaseRemoteDataSource();
    return <Component {...props} dataSource={ds} />;
  };
};
```

### 3. Configurações Complexas

```typescript
// ANTES - migração manual necessária
const complexConfig = {
  dataSource: new ArchbaseDataSource({
    // configurações específicas V1
  }),
  validation: {
    // regras V1
  },
  events: {
    onDataChange: () => dataSource.forceUpdate()
  }
};

// DEPOIS - adaptar configurações
const complexConfig = {
  dataSource: new ArchbaseRemoteDataSource({
    // adaptar para V2
  }),
  validationRules: {
    // migrar regras para V2
  },
  events: {
    onDataChange: () => {
      // V2 não precisa forceUpdate manual
    }
  }
};
```

## Solução de Problemas

### Erro de Parsing
```bash
❌ Failed to parse file: Unexpected token
```
**Solução:**
- Verifique sintaxe TypeScript/JavaScript
- Certifique-se que plugins Babel estão corretos
- Use `--dry-run` primeiro para identificar problemas

### Conflitos de Migração
```bash
⚠️ Multiple migration rules conflict for component
```
**Solução:**
- Use `--rules` para aplicar regras específicas
- Execute migrações em etapas separadas
- Revise manualmente casos conflitantes

### Backup não Funcionando
```bash
❌ Failed to create backup
```
**Solução:**
- Verifique permissões de arquivo
- Certifique-se que há espaço em disco
- Use Git como backup alternativo

### Performance Lenta
```bash
⏳ Migration taking too long...
```
**Solução:**
- Use padrões mais específicos (`--include`)
- Exclua diretórios desnecessários (`--exclude`)
- Execute em lotes menores

## Integração com CI/CD

### GitHub Actions

```yaml
name: Archbase Migration Check
on: [pull_request]

jobs:
  migration-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Archbase CLI
        run: npm install -g @archbase/cli
      
      - name: Check Migration Status
        run: |
          archbase migrate analyze . --report --output migration-status.json
          archbase scan health . 
      
      - name: Upload Migration Report
        uses: actions/upload-artifact@v3
        with:
          name: migration-report
          path: migration-status.json
```

### Script de Migração Contínua

```bash
#!/bin/bash
# migrate-check.sh

echo "🔍 Checking migration status..."
archbase migrate analyze . --report --output migration-check.json

# Extrair contadores
SIMPLE=$(cat migration-check.json | jq '.issues[] | select(.complexity=="simple") | length')
MEDIUM=$(cat migration-check.json | jq '.issues[] | select(.complexity=="medium") | length')
COMPLEX=$(cat migration-check.json | jq '.issues[] | select(.complexity=="complex") | length')

echo "📊 Migration Status:"
echo "   Simple: $SIMPLE (can auto-migrate)"
echo "   Medium: $MEDIUM (needs review)"
echo "   Complex: $COMPLEX (manual migration)"

# Auto-migrate simple cases
if [ "$SIMPLE" -gt 0 ]; then
  echo "🚀 Auto-migrating simple cases..."
  archbase migrate v1-to-v2 . --backup
fi

# Report on remaining work
if [ "$MEDIUM" -gt 0 ] || [ "$COMPLEX" -gt 0 ]; then
  echo "⚠️  Manual migration required for $((MEDIUM + COMPLEX)) components"
  exit 1
fi

echo "✅ All migrations completed!"
```

As ferramentas de migração do Archbase CLI tornam a atualização entre versões segura, previsível e amplamente automatizada, reduzindo significativamente o esforço manual necessário.