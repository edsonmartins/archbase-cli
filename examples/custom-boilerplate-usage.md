# Exemplos de Uso: Boilerplates Customizados

Este documento demonstra como usar a funcionalidade de boilerplates customizados com exemplos práticos.

## Scenario 1: Empresa com Template Padrão

### Situação
Uma empresa de desenvolvimento quer padronizar seus projetos React com configurações específicas.

### Solução

```bash
# 1. Criar boilerplate a partir do projeto modelo da empresa
archbase boilerplate create company-react-template ./company-frontend-base \
  --description "Template React padrão da empresa com ESLint, Prettier e Tailwind" \
  --category frontend \
  --interactive

# 2. Durante a configuração interativa, selecionar:
# - Features: React, TypeScript, Tailwind, ESLint, Prettier, Testing
# - Prompts customizados: projectName, useTypeScript, includeTests, apiUrl

# 3. Todos os desenvolvedores podem usar
archbase create project ClientPortal --boilerplate=company-react-template --interactive

# 4. Exportar para compartilhamento
archbase boilerplate export company-react-template --output ./shared-templates/
```

### Resultado
- Template padronizado para toda a equipe
- Configurações consistentes entre projetos
- Setup automatizado com hooks personalizados

## Scenario 2: API Template com Docker

### Situação
Equipe de backend quer template para APIs Node.js com Docker, TypeScript e estrutura específica.

### Projeto Base
```
backend-api-base/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   └── app.ts
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
└── .env.example
```

### Criação do Boilerplate

```bash
# Criar boilerplate da API
archbase boilerplate create node-api-template ./backend-api-base \
  --description "Template Node.js + TypeScript + Docker para APIs" \
  --category api \
  --template-files "package.json,README.md,.env.example,docker-compose.yml" \
  --ignore "node_modules,dist,logs,.env,coverage"

# Usar para novos projetos
archbase create project UserAPI --boilerplate=node-api-template
archbase create project ProductAPI --boilerplate=node-api-template
```

### Configuração Customizada

**config.json gerado:**
```json
{
  "name": "node-api-template",
  "description": "Template Node.js + TypeScript + Docker para APIs",
  "category": "api",
  "features": {
    "typescript": true,
    "express": true,
    "docker": true,
    "jest": true
  },
  "prompts": [
    {
      "name": "projectName",
      "message": "Nome da API:",
      "type": "input",
      "validate": "required|alphanumeric"
    },
    {
      "name": "dbType",
      "message": "Tipo de banco de dados:",
      "type": "list",
      "choices": [
        {"name": "postgresql", "message": "PostgreSQL"},
        {"name": "mongodb", "message": "MongoDB"},
        {"name": "mysql", "message": "MySQL"}
      ]
    },
    {
      "name": "useAuthentication",
      "message": "Incluir autenticação JWT?",
      "type": "confirm",
      "default": true
    }
  ]
}
```

## Scenario 3: Template Monorepo

### Situação
Organização quer template para projetos monorepo com frontend e backend.

### Estrutura Base
```
monorepo-base/
├── apps/
│   ├── frontend/          # React app
│   └── backend/           # Node.js API
├── packages/
│   ├── shared-types/      # TypeScript types
│   └── shared-utils/      # Utilities
├── package.json           # Root package.json
├── lerna.json
└── nx.json
```

### Implementação

```bash
# Criar boilerplate monorepo
archbase boilerplate create fullstack-monorepo ./monorepo-base \
  --description "Template monorepo com React + Node.js + shared packages" \
  --category fullstack \
  --template-files "package.json,lerna.json,nx.json,*/package.json" \
  --interactive

# Configurar prompts avançados para:
# - Nome do projeto
# - Nome da aplicação frontend
# - Nome da API backend
# - Workspace manager (Lerna, Nx, Rush)
# - Banco de dados
# - Autenticação
```

## Scenario 4: Template com CI/CD

### Situação
Empresa quer incluir configurações de CI/CD nos templates.

### Estrutura com CI/CD
```
project-with-cicd/
├── src/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy-staging.yml
│       └── deploy-production.yml
├── Dockerfile
├── docker-compose.yml
├── package.json
└── .env.example
```

### Template com CI/CD

```bash
archbase boilerplate create react-cicd-template ./project-with-cicd \
  --description "Template React com CI/CD configurado" \
  --category frontend \
  --template-files "package.json,.github/workflows/*.yml,docker-compose.yml,.env.example"
```

**Hook personalizado (hooks/post-install.js):**
```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

async function setupCICD() {
  const answers = JSON.parse(process.env.ARCHBASE_ANSWERS || '{}');
  const projectPath = process.env.PROJECT_PATH;

  // Configurar secrets do GitHub Actions baseado nas respostas
  const envTemplate = `
# GitHub Actions Secrets (configure no repositório)
# DOCKER_USERNAME=\${DOCKER_USERNAME}
# DOCKER_PASSWORD=\${DOCKER_PASSWORD}
# STAGING_URL=${answers.stagingUrl || 'https://staging.example.com'}
# PRODUCTION_URL=${answers.productionUrl || 'https://production.example.com'}
`;

  fs.writeFileSync(path.join(projectPath, '.env.cicd'), envTemplate);
  
  console.log('🔧 CI/CD configurado!');
  console.log('📝 Configure os secrets no GitHub:');
  console.log('   - DOCKER_USERNAME');
  console.log('   - DOCKER_PASSWORD');
  console.log('   - STAGING_URL');
  console.log('   - PRODUCTION_URL');
}

setupCICD();
```

## Scenario 5: Template Multi-linguagem

### Situação
Produto internacional precisa de template com suporte a múltiplas linguagens.

### Implementação

```bash
# Criar template i18n
archbase boilerplate create react-i18n-template ./international-app \
  --description "Template React com internacionalização" \
  --category frontend \
  --interactive
```

**Prompts específicos:**
```json
{
  "prompts": [
    {
      "name": "defaultLanguage",
      "message": "Idioma padrão:",
      "type": "list",
      "choices": [
        {"name": "en", "message": "English"},
        {"name": "pt", "message": "Português"},
        {"name": "es", "message": "Español"}
      ]
    },
    {
      "name": "supportedLanguages",
      "message": "Idiomas suportados:",
      "type": "checkbox",
      "choices": [
        {"name": "en", "message": "English"},
        {"name": "pt", "message": "Português"},
        {"name": "es", "message": "Español"},
        {"name": "fr", "message": "Français"},
        {"name": "de", "message": "Deutsch"}
      ]
    }
  ]
}
```

## Scenario 6: Template para Testes

### Situação
Equipe de QA quer template específico para projetos de teste automatizado.

### Estrutura de Teste
```
test-automation-base/
├── tests/
│   ├── e2e/               # Cypress tests
│   ├── integration/       # API tests
│   └── unit/             # Unit tests
├── fixtures/             # Test data
├── support/              # Test utilities
├── cypress.config.js
├── jest.config.js
└── package.json
```

### Criação

```bash
archbase boilerplate create test-automation-template ./test-automation-base \
  --description "Template para automação de testes" \
  --category testing \
  --template-files "package.json,cypress.config.js,jest.config.js"
```

## Scenario 7: Compartilhamento Entre Equipes

### Export/Import Workflow

```bash
# Equipe A cria template
archbase boilerplate create team-a-frontend ./our-frontend
archbase boilerplate export team-a-frontend --output ./templates-to-share/

# Compartilhar via repositório Git
cd templates-to-share/
git init
git add .
git commit -m "Team A frontend template"
git remote add origin https://github.com/company/templates.git
git push

# Equipe B importa template
git clone https://github.com/company/templates.git
archbase boilerplate import ./templates/team-a-frontend --name shared-frontend

# Usar template importado
archbase create project NewProject --boilerplate=shared-frontend
```

## Scenario 8: Template com Banco de Dados

### Situação
Template que inclui setup de banco de dados com migrations.

### Estrutura
```
fullstack-db-template/
├── server/
│   ├── migrations/
│   ├── seeders/
│   └── models/
├── client/
├── docker-compose.yml     # Inclui DB
└── package.json
```

### Hook Avançado

```javascript
// hooks/post-install.js
const { execSync } = require('child_process');

async function setupDatabase() {
  const answers = JSON.parse(process.env.ARCHBASE_ANSWERS || '{}');
  
  if (answers.setupDatabase) {
    console.log('🗄️ Configurando banco de dados...');
    
    // Iniciar containers Docker
    execSync('docker-compose up -d db', { stdio: 'inherit' });
    
    // Aguardar banco ficar disponível
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Executar migrations
    execSync('npm run migrate', { stdio: 'inherit' });
    
    // Executar seeders se solicitado
    if (answers.includeSampleData) {
      execSync('npm run seed', { stdio: 'inherit' });
    }
    
    console.log('✅ Banco de dados configurado!');
  }
}
```

## Comandos Úteis para Gerenciamento

### Listar e Validar

```bash
# Ver todos os boilerplates
archbase boilerplate list --detailed

# Validar boilerplate específico
archbase boilerplate validate my-template

# Ver boilerplates por categoria
archbase boilerplate list --category frontend
archbase boilerplate list --category api
```

### Atualizar Templates

```bash
# Recriar boilerplate com versão atualizada
archbase boilerplate create my-template-v2 ./updated-project \
  --description "Versão atualizada do template"

# Exportar nova versão
archbase boilerplate export my-template-v2
```

### Backup e Restore

```bash
# Backup de todos os boilerplates customizados
cp -r ~/.archbase/boilerplates/ ./backup-boilerplates/

# Restore
cp -r ./backup-boilerplates/ ~/.archbase/boilerplates/
```

## Integração com IDEs

### VS Code Settings

Criar template que inclui configurações específicas do VS Code:

```json
// .vscode/settings.json.hbs
{
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

## Tips Avançados

### 1. Templates Aninhados
```bash
# Criar template que referencia outros templates
archbase boilerplate create composite-template ./complex-project \
  --template-files "package.json,docker-compose.yml,*/package.json"
```

### 2. Condicionais Complexas
```handlebars
{{#if (and features.typescript features.testing)}}
import { describe, it, expect } from '@jest/globals';
{{else}}
const { describe, it, expect } = require('@jest/globals');
{{/if}}
```

### 3. Scripts de Validação
```javascript
// hooks/validate.js - executado antes da criação
module.exports = function(answers) {
  if (answers.useDatabase && !answers.dbConnectionString) {
    throw new Error('Connection string é obrigatória quando usar banco de dados');
  }
};
```

Estes exemplos mostram como os boilerplates customizados podem ser usados para resolver problemas reais de padronização e automação de setup de projetos.