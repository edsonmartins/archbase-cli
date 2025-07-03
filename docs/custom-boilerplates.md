# Custom Boilerplates

O Archbase CLI permite criar boilerplates customizados a partir de projetos existentes, facilitando a reutilização de estruturas e padrões específicos da sua organização ou projetos pessoais.

## Visão Geral

Os boilerplates customizados permitem:
- Transformar projetos existentes em templates reutilizáveis
- Compartilhar estruturas de projeto entre equipes
- Padronizar configurações e setup de projetos
- Criar templates com prompts interativos
- Exportar e importar boilerplates entre ambientes

## Comandos Disponíveis

### 1. Criar Boilerplate

```bash
# Básico
archbase boilerplate create my-template ./my-existing-project

# Com configuração específica
archbase boilerplate create react-company-template ./company-frontend \
  --description "Template padrão React da empresa" \
  --category frontend \
  --interactive

# Com configuração avançada
archbase boilerplate create api-template ./my-api \
  --description "Template API Node.js" \
  --category api \
  --template-files "*.json,*.md,*.env*,*.yml" \
  --ignore "node_modules,dist,logs,.env,coverage"
```

### 2. Listar Boilerplates

```bash
# Listar todos
archbase boilerplate list

# Por categoria
archbase boilerplate list --category frontend

# Com detalhes
archbase boilerplate list --detailed
```

### 3. Validar Boilerplate

```bash
# Validar estrutura e configuração
archbase boilerplate validate my-template
```

### 4. Exportar Boilerplate

```bash
# Exportar para compartilhamento
archbase boilerplate export my-template --output ./my-template-export

# Formato específico
archbase boilerplate export my-template --format zip --output ./shared-templates/
```

### 5. Importar Boilerplate

```bash
# Importar boilerplate exportado
archbase boilerplate import ./shared-templates/my-template-export

# Com nome customizado
archbase boilerplate import ./downloaded-template --name company-frontend
```

## Processo de Criação

### Modo Interativo

O modo interativo orienta você através da configuração do boilerplate:

```bash
archbase boilerplate create my-template ./my-project --interactive
```

**Perguntas do Wizard:**
1. **Descrição**: Descrição do boilerplate
2. **Categoria**: admin | frontend | fullstack | api | general
3. **Features Detectadas**: Lista de funcionalidades detectadas automaticamente
4. **Prompts Customizados**: Opção de configurar prompts específicos

### Detecção Automática de Features

O CLI detecta automaticamente funcionalidades baseado nas dependências:

- **React**: Presença de `react` nas dependências
- **TypeScript**: Presença de `typescript`
- **Next.js**: Presença de `next`
- **Vue.js**: Presença de `vue`
- **Express**: Presença de `express`
- **Tailwind CSS**: Presença de `tailwindcss`
- **Testing**: Jest, Cypress, etc.
- **Docker**: Arquivo `docker-compose.yml`
- **Configuração**: Arquivos `.env.example`, `README.md`

### Transformação de Templates

Arquivos especificados em `--template-files` são transformados em templates Handlebars:

**Antes (package.json):**
```json
{
  "name": "my-specific-project",
  "description": "My specific project description"
}
```

**Depois (package.json.hbs):**
```json
{
  "name": "{{projectName}}",
  "description": "{{projectDescription}}"
}
```

## Estrutura do Boilerplate Customizado

```
my-custom-template/
├── config.json              # Configuração do boilerplate
├── template/                 # Arquivos do projeto template
│   ├── src/
│   ├── public/
│   ├── package.json.hbs     # Template com variáveis
│   ├── README.md.hbs        # Template de documentação
│   └── .env.example.hbs     # Template de configuração
├── hooks/                    # Scripts de pós-instalação
│   └── post-install.js      # Hook executado após criação
├── docs/                     # Documentação adicional
└── README.md                # Documentação do boilerplate
```

### config.json

```json
{
  "name": "my-custom-template",
  "version": "1.0.0",
  "description": "Template customizado para projetos React",
  "category": "frontend",
  "features": {
    "react": true,
    "typescript": true,
    "tailwind": true,
    "testing": true
  },
  "prompts": [
    {
      "name": "projectName",
      "message": "Nome do projeto:",
      "type": "input",
      "validate": "required|alphanumeric"
    },
    {
      "name": "useTypeScript",
      "message": "Usar TypeScript?",
      "type": "confirm",
      "default": true
    }
  ],
  "dependencies": {
    "react": "^18.0.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

### Hooks de Pós-Instalação

```javascript
// hooks/post-install.js
#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚀 Configurando projeto...');

async function setup() {
  // Acesso às variáveis de ambiente
  const projectName = process.env.PROJECT_NAME;
  const projectPath = process.env.PROJECT_PATH;
  const answers = JSON.parse(process.env.ARCHBASE_ANSWERS || '{}');

  // Instalar dependências se solicitado
  if (answers.installDependencies !== false) {
    console.log('📦 Instalando dependências...');
    execSync('npm install', { cwd: projectPath, stdio: 'inherit' });
  }

  // Configurações específicas baseadas nas respostas
  if (answers.useTypeScript) {
    console.log('🔧 Configurando TypeScript...');
    // Lógica específica para TypeScript
  }

  console.log('✅ Setup concluído!');
}

setup();
```

## Uso dos Boilerplates Customizados

### Criar Projeto

```bash
# Usar boilerplate customizado
archbase create project MyApp --boilerplate=my-custom-template --interactive

# Modo não-interativo (usa defaults)
archbase create project MyApp --boilerplate=my-custom-template
```

### Localização dos Boilerplates

- **Built-in**: `./src/boilerplates/` (no diretório do CLI)
- **Customizados**: `~/.archbase/boilerplates/` (diretório do usuário)

O CLI automaticamente procura em ambos os locais ao usar `--boilerplate`.

## Compartilhamento de Boilerplates

### Export/Import

```bash
# Exportar boilerplate
archbase boilerplate export my-template --output ./shared/

# Compartilhar via Git, email, etc.
# ...

# Importar em outro ambiente
archbase boilerplate import ./shared/my-template --name team-template
```

### Boilerplate como Repositório Git

Você pode versionar seus boilerplates customizados:

```bash
# Após criar o boilerplate
cd ~/.archbase/boilerplates/my-template
git init
git add .
git commit -m "Initial boilerplate"
git remote add origin https://github.com/company/my-template.git
git push -u origin main

# Outros desenvolvedores podem usar
archbase create project MyApp --git https://github.com/company/my-template.git
```

## Exemplos Práticos

### 1. Template de API Node.js

```bash
# Criar boilerplate a partir de API existente
archbase boilerplate create node-api-template ./my-working-api \
  --description "Template padrão para APIs Node.js da empresa" \
  --category api \
  --template-files "package.json,README.md,.env.example,docker-compose.yml" \
  --interactive
```

### 2. Template Frontend React

```bash
# Criar boilerplate de frontend
archbase boilerplate create react-frontend ./company-frontend \
  --description "Template React com configurações da empresa" \
  --category frontend \
  --template-files "package.json,README.md,.env.example,tailwind.config.js" \
  --ignore "node_modules,dist,build,.env,coverage,*.log"
```

### 3. Template Full-stack

```bash
# Criar boilerplate completo
archbase boilerplate create fullstack-app ./complete-app \
  --description "Template full-stack React + Node.js" \
  --category fullstack \
  --interactive
```

## Best Practices

### Para Criadores de Boilerplates

1. **Documentação Clara**: Sempre inclua README detalhado
2. **Prompts Úteis**: Configure prompts que realmente personalizam o projeto
3. **Hooks Simples**: Mantenha scripts de pós-instalação simples e robustos
4. **Templates Flexíveis**: Use variáveis Handlebars para máxima reutilização
5. **Teste Regularmente**: Valide o boilerplate antes de compartilhar

### Para Usuários

1. **Teste Primeiro**: Sempre teste boilerplates em projetos de exemplo
2. **Mantenha Atualizados**: Atualize boilerplates customizados regularmente
3. **Documente Modificações**: Mantenha histórico de mudanças
4. **Backup**: Faça backup de boilerplates importantes

## Troubleshooting

### Problemas Comuns

**Erro: "Boilerplate already exists"**
```bash
# Usar nome diferente ou remover existente
archbase boilerplate create my-template-v2 ./my-project
```

**Template não aplica variáveis**
```bash
# Verificar sintaxe Handlebars
archbase boilerplate validate my-template
```

**Hook falha na execução**
```bash
# Verificar permissões e sintaxe do script
chmod +x ~/.archbase/boilerplates/my-template/hooks/post-install.js
```

### Debug

```bash
# Modo verbose para debug
DEBUG=archbase:* archbase boilerplate create my-template ./project

# Validar antes de usar
archbase boilerplate validate my-template
```

## Integração com CI/CD

### Automatizar Criação de Boilerplates

```yaml
# .github/workflows/create-boilerplate.yml
name: Create Company Boilerplate

on:
  push:
    tags: ['v*']

jobs:
  create-boilerplate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install Archbase CLI
        run: npm install -g @archbase/cli
      - name: Create Boilerplate
        run: |
          archbase boilerplate create company-frontend . \
            --description "Company frontend template ${{ github.ref_name }}" \
            --category frontend
      - name: Export Boilerplate
        run: archbase boilerplate export company-frontend --output ./boilerplate-export
```

Esta funcionalidade completa o ecossistema de templates do Archbase CLI, permitindo máxima flexibilidade para organizações criarem e compartilharem seus próprios padrões de projeto.