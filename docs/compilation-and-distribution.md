# Archbase CLI - Compilação e Distribuição

Este documento descreve como compilar, empacotar e distribuir o Archbase CLI para uso em projetos reais.

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Compilação Local](#compilação-local)
- [Teste Local com npm link](#teste-local-com-npm-link)
- [Empacotamento para Distribuição](#empacotamento-para-distribuição)
- [Instalação em Outros Projetos](#instalação-em-outros-projetos)
- [Publicação no NPM](#publicação-no-npm)
- [Solução de Problemas](#solução-de-problemas)
- [Testes de Funcionalidade](#testes-de-funcionalidade)

## 🔧 Pré-requisitos

- Node.js >= 16.0.0
- npm ou yarn
- TypeScript instalado globalmente (opcional)

## 🏗️ Compilação Local

### 1. Clone o repositório

```bash
git clone https://github.com/edsonmartins/archbase-cli.git
cd archbase-cli
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Compile o projeto

```bash
npm run build
```

Isso irá:
- Compilar TypeScript para JavaScript em `/dist`
- Gerar arquivos de definição TypeScript (`.d.ts`)
- Preparar o projeto para execução

### 4. Copie os templates (importante!)

```bash
cp -r src/templates dist/
```

Os templates Handlebars precisam estar disponíveis no diretório `dist` após a compilação.

## 🔗 Teste Local com npm link

O método mais rápido para testar o CLI localmente:

### 1. Crie um link global

No diretório do archbase-cli:

```bash
npm link
```

### 2. Verifique a instalação

```bash
archbase --version
# Output: 0.1.0

archbase --help
# Mostra todos os comandos disponíveis
```

### 3. Para remover o link

```bash
npm unlink -g @archbase/cli
```

## 📦 Empacotamento para Distribuição

### 1. Crie o pacote

```bash
npm pack
```

Isso gera um arquivo `.tgz` (ex: `archbase-cli-0.1.0.tgz`) contendo:
- Código compilado em `/dist`
- Templates
- Documentação
- package.json e dependências

### 2. Verifique o conteúdo do pacote

```bash
npm pack --dry-run
# Lista todos os arquivos que serão incluídos
```

### 3. Teste o pacote localmente

```bash
# Em outro diretório
npm install -g /caminho/completo/para/archbase-cli-0.1.0.tgz
```

## 🚀 Instalação em Outros Projetos

### Opção 1: Arquivo Local

```bash
# Usando caminho absoluto
npm install -g /Users/usuario/projetos/archbase-cli/archbase-cli-0.1.0.tgz

# Ou copie o arquivo .tgz e instale
cp archbase-cli-0.1.0.tgz /outro/projeto/
cd /outro/projeto/
npm install -g ./archbase-cli-0.1.0.tgz
```

### Opção 2: Repositório Git

```bash
# Direto do GitHub
npm install -g git+https://github.com/edsonmartins/archbase-cli.git

# Branch específica
npm install -g git+https://github.com/edsonmartins/archbase-cli.git#develop
```

### Opção 3: NPM Registry (Futuro)

```bash
# Quando publicado no NPM
npm install -g @archbase/cli
```

## 📤 Publicação no NPM

### 1. Configure suas credenciais

```bash
npm login
```

### 2. Verifique o package.json

```json
{
  "name": "@archbase/cli",
  "version": "0.1.0",
  "description": "CLI tool for Archbase ecosystem",
  "bin": {
    "archbase": "dist/bin/archbase.js"
  },
  "files": [
    "dist/**/*",
    "README.md",
    "LICENSE"
  ]
}
```

### 3. Publique

```bash
# Publicação normal
npm publish

# Como beta
npm publish --tag beta

# Com acesso público (para pacotes com escopo)
npm publish --access public
```

### 4. Verifique a publicação

```bash
npm info @archbase/cli
```

## 🔍 Solução de Problemas

### Erro: "Cannot find module 'chokidar'"

```bash
# Limpe e reinstale
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Erro: "Template not found"

```bash
# Certifique-se de copiar os templates
cp -r src/templates dist/
```

### Erro: "Command not found: archbase"

```bash
# Verifique se o npm global está no PATH
npm config get prefix
# Adicione ao PATH se necessário
export PATH=$PATH:$(npm config get prefix)/bin
```

### Erro de parsing em templates Handlebars

Alguns templates complexos podem ter problemas com expressões aninhadas. Soluções:

1. Use helpers personalizados (`{{lt}}` e `{{gt}}` para `{` e `}`)
2. Separe condicionais complexas
3. Use templates simplificados para teste

## ✅ Testes de Funcionalidade

### Teste básico de instalação

```bash
archbase --version
archbase --help
```

### Teste de geradores

```bash
# Crie um diretório de teste
mkdir test-archbase-cli
cd test-archbase-cli

# Teste o Security Generator
archbase generate security AdminLogin \
  --type=login \
  --with-mobile \
  --with-branding \
  --brand-name="MyApp"

# Teste o Form Generator
archbase generate form UserForm \
  --fields=name:text,email:email \
  --datasource-version=v2

# Teste o Domain Generator
archbase generate domain UserDto \
  --fields=name:String,email:String,active:Boolean
```

### Verificação de arquivos gerados

```bash
# Liste os arquivos criados
ls -la src/security/
ls -la src/forms/
ls -la src/domain/
```

## 📊 Status Atual dos Generators

| Generator | Status | Observações |
|-----------|--------|-------------|
| SecurityGenerator (login) | ✅ Funcional | Template simplificado funcionando |
| SecurityGenerator (authenticator) | ✅ Funcional | Template simplificado funcionando |
| FormGenerator | ⚠️ Testar | Templates complexos podem precisar ajustes |
| ViewGenerator | ⚠️ Testar | Templates complexos podem precisar ajustes |
| DomainGenerator | ⚠️ Testar | Deve funcionar corretamente |
| NavigationGenerator | ⚠️ Testar | Deve funcionar corretamente |
| ComponentGenerator | ⚠️ Testar | Deve funcionar corretamente |
| PageGenerator | ⚠️ Testar | Deve funcionar corretamente |

## 🚦 Checklist de Distribuição

- [ ] Código TypeScript compila sem erros
- [ ] Templates copiados para `/dist`
- [ ] `npm link` funciona localmente
- [ ] `npm pack` gera arquivo .tgz válido
- [ ] Instalação do .tgz funciona em outro diretório
- [ ] Comandos básicos funcionam (`--version`, `--help`)
- [ ] Pelo menos um generator testado com sucesso
- [ ] README.md atualizado com instruções de instalação
- [ ] Versão no package.json está correta
- [ ] Licença definida (MIT)

## 🔄 Processo de Release Recomendado

1. **Desenvolvimento**
   ```bash
   # Feature branch
   git checkout -b feature/new-generator
   # Desenvolva e teste
   npm run build && npm link
   # Teste localmente
   ```

2. **Pre-release**
   ```bash
   # Atualize versão
   npm version prerelease --preid=beta
   # Gere pacote
   npm pack
   # Teste em projeto separado
   ```

3. **Release**
   ```bash
   # Merge para main
   git checkout main
   git merge feature/new-generator
   # Versão final
   npm version minor
   # Publicar
   npm publish
   # Tag no git
   git push --tags
   ```

## 📚 Recursos Adicionais

- [npm-link documentation](https://docs.npmjs.com/cli/v8/commands/npm-link)
- [npm-pack documentation](https://docs.npmjs.com/cli/v8/commands/npm-pack)
- [npm-publish documentation](https://docs.npmjs.com/cli/v8/commands/npm-publish)
- [Creating Node.js CLI tools](https://nodejs.org/en/knowledge/command-line/how-to-create-a-nodejs-command-line-module/)

---

**Nota**: Este documento reflete o estado atual do Archbase CLI v0.1.0. Alguns templates complexos ainda precisam de ajustes para funcionar completamente. Os templates simplificados estão funcionais e podem ser usados como base para desenvolvimento.