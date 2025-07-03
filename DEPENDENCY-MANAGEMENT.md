# Archbase CLI - Automatic Dependency Management

O Archbase CLI agora inclui gerenciamento automático de dependências baseado na análise completa do archbase-react v2.1.3. Isso elimina a necessidade de descobrir manualmente quais dependências são necessárias.

## 🎯 Problema Resolvido

Anteriormente, os desenvolvedores perdiam tempo descobrindo e configurando todas as dependências necessárias:

- **Mantine 8.x** - Ecossistema completo (@mantine/core, @mantine/hooks, @mantine/dates, etc.)
- **TypeScript** - Configuração e tipos
- **PostCSS** - Configuração para Mantine
- **Build Tools** - Vite, ESLint, etc.
- **Dependências Opcionais** - Para recursos específicos

## ✅ Solução Implementada

### Análise Completa das Dependências

Baseado na análise do `package.json` do archbase-react v2.1.3:

```bash
# 👀 Dependências analisadas
- 60+ dependências diretas do archbase-react
- Mantine 8.x completo (8 pacotes)
- Ferramentas de build e desenvolvimento
- Dependências opcionais por feature
```

### Tipos de Projeto

1. **Basic** - Dependências essenciais
   - @archbase/react + dependências core
   - @mantine/core 8.x ecosystem
   - React 18, TypeScript, Vite

2. **Admin** - Para aplicações administrativas
   - Basic + data grids
   - Autenticação JWT
   - Exportação de arquivos

3. **Full** - Todos os recursos
   - Admin + rich text editing
   - Charts e visualização
   - Geração de PDF
   - Processamento de imagens

### Features Específicas

```bash
--features=rich-text,data-grid,auth,file-export,pdf,charts,image-crop,input-mask,color-picker
```

## 📋 Comandos Disponíveis

### Criar Projeto Completo

```bash
# Projeto administrativo com autenticação e grids
archbase create project AdminApp \
  --project-type=admin \
  --features=auth,data-grid,file-export \
  --author="Seu Nome" \
  --description="Sistema administrativo"

# Projeto completo com todos os recursos
archbase create project FullApp \
  --project-type=full \
  --features=rich-text,charts,pdf,image-crop \
  --author="Equipe Dev"
```

### Gerar Apenas package.json

```bash
# Para projetos existentes
archbase create package-json \
  --name=MeuProjeto \
  --project-type=admin \
  --features=auth,data-grid \
  --output=./meu-projeto-existente
```

## 📦 Dependências Incluídas Automaticamente

### Core (Todos os Projetos)
```json
{
  "@archbase/react": "^2.1.3",
  "@mantine/core": "8.1.2",
  "@mantine/hooks": "8.1.2",
  "@mantine/emotion": "8.1.2",
  "@mantine/dates": "8.1.2",
  "@mantine/dropzone": "8.1.2",
  "@mantine/modals": "8.1.2",
  "@mantine/notifications": "8.1.2",
  "@tabler/icons-react": "^2.47.0",
  "@tanstack/react-query": "^5.81.5",
  "axios": "^1.7.2",
  "clsx": "^2.1.1",
  "dayjs": "1.11.10",
  "inversify": "6.0.1",
  "inversify-react": "^1.1.1",
  "reflect-metadata": "^0.1.14",
  "react-router": "6.21.2",
  "react-router-dom": "6.21.2",
  "final-form": "^4.20.10",
  "react-final-form": "^6.5.9",
  "i18next": "23.7.6",
  "react-i18next": "13.4.1"
}
```

### Admin Features
```json
{
  "@mui/x-data-grid": "^7.28.3",
  "mantine-react-table": "2.0.0-beta.8",
  "jwt-decode": "^3.1.2",
  "js-cookie": "^3.0.5",
  "file-saver": "^2.0.5",
  "export-to-csv": "^0.2.2",
  "xlsx": "^0.18.5"
}
```

### Full Features
```json
{
  "@mantine/tiptap": "8.1.2",
  "suneditor": "^2.46.3",
  "suneditor-react": "^3.6.1",
  "d3": "^7.9.0",
  "react-konva": "^18.2.10",
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.8.2",
  "react-easy-crop": "^5.4.1",
  "react-imask": "^7.6.1",
  "libphonenumber-js": "^1.11.3",
  "react-color": "^2.19.3",
  "color": "^4.2.3"
}
```

## 🔧 Configurações Incluídas

### PostCSS (postcss.config.js)
```javascript
module.exports = {
  plugins: {
    'postcss-preset-mantine': {},
    'postcss-simple-vars': {
      variables: {
        'mantine-breakpoint-xs': '36em',
        'mantine-breakpoint-sm': '48em',
        'mantine-breakpoint-md': '62em',
        'mantine-breakpoint-lg': '75em',
        'mantine-breakpoint-xl': '88em',
      },
    },
  },
};
```

### TypeScript (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "jsx": "react-jsx",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@domain/*": ["./src/domain/*"]
    }
  }
}
```

### Mantine Provider (src/providers/AppProvider.tsx)
```tsx
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

// Import Mantine styles
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider>
      <ModalsProvider>
        <Notifications />
        {children}
      </ModalsProvider>
    </MantineProvider>
  );
}
```

### Vite Configuration (vite.config.ts)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@domain': path.resolve(__dirname, './src/domain'),
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
})
```

## 🎉 Benefícios

1. **Zero Configuration** - Tudo configurado automaticamente
2. **Compatibilidade Garantida** - Versões testadas e compatíveis
3. **Mantine 8.x Completo** - PostCSS, temas, e providers configurados
4. **TypeScript Optimizado** - Configuração completa com path mapping
5. **Build Tools** - Vite, ESLint, tudo pronto para usar
6. **Features Específicas** - Instale apenas o que precisa

## 🚀 Próximos Passos

Após gerar o projeto:

```bash
cd MeuProjeto
npm install
npm run dev
```

E comece a usar os componentes Archbase imediatamente:

```tsx
import { ArchbaseEdit, ArchbaseButton } from '@archbase/react'

function MyComponent() {
  return (
    <div>
      <ArchbaseEdit label="Nome" />
      <ArchbaseButton>Salvar</ArchbaseButton>
    </div>
  )
}
```

## 📖 Documentação

- [Archbase React](https://react.archbase.com.br)
- [Mantine 8.x](https://mantine.dev)
- [Vite](https://vitejs.dev)