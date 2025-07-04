# Exemplos Funcionais - Archbase CLI

Este diretório contém exemplos práticos e funcionais de todos os componentes Archbase documentados na CLI.

## 📁 Estrutura dos Exemplos

### 🎨 Components
Exemplos de uso dos componentes Archbase organizados por categoria.

#### 📝 Editors
- [`async-select-users.tsx`](./components/editors/async-select-users.tsx) - ArchbaseAsyncSelect com busca de usuários
- [`rich-text-article.tsx`](./components/editors/rich-text-article.tsx) - ArchbaseRichTextEdit para criação de artigos
- [`mask-cpf-cnpj.tsx`](./components/editors/mask-cpf-cnpj.tsx) - ArchbaseMaskEdit com máscaras brasileiras
- [`lookup-products.tsx`](./components/editors/lookup-products.tsx) - ArchbaseLookupEdit para seleção de produtos

#### 📋 Forms
- [`form-datasource-v2.tsx`](./components/forms/form-datasource-v2.tsx) - Formulário completo com DataSource V2

#### 📊 Grids
- [`admin-crud-grid.tsx`](./components/grids/admin-crud-grid.tsx) - Grid CRUD com permissões e ações

#### 🧭 Navigation
- [`admin-navigation.tsx`](./components/navigation/admin-navigation.tsx) - Navegação admin com menu hierárquico

#### 💬 Feedback
- [`notification-success.tsx`](./components/feedback/notification-success.tsx) - Sistema de notificações completo

## 🎯 Como Usar os Exemplos

### 1. Instalação das Dependências
```bash
npm install archbase-react @mantine/core @mantine/hooks
npm install react react-dom react-router-dom
npm install @tabler/icons-react
npm install axios yup
```

### 2. Configuração do Projeto
```tsx
// App.tsx
import { MantineProvider } from '@mantine/core';
import { BrowserRouter } from 'react-router-dom';
import { ArchbaseNotifications } from 'archbase-react';

function App() {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <BrowserRouter>
        <ArchbaseNotifications />
        {/* Seus componentes aqui */}
      </BrowserRouter>
    </MantineProvider>
  );
}
```

### 3. Uso dos Exemplos
Cada exemplo pode ser importado e usado diretamente:

```tsx
import { UserFormExample } from './examples/components/forms/form-datasource-v2';
import { ProductGridExample } from './examples/components/grids/admin-crud-grid';

function MyPage() {
  return (
    <div>
      <h1>Minha Página</h1>
      <UserFormExample />
      <ProductGridExample />
    </div>
  );
}
```

## 📚 Exemplos por Categoria

### 📝 Editores Básicos
- **ArchbaseEdit** - Input de texto com DataSource
- **ArchbaseTextArea** - Área de texto expansível
- **ArchbaseSelect** - Seleção com opções
- **ArchbaseCheckbox** - Checkbox com binding
- **ArchbaseRadio** - Grupo de radio buttons
- **ArchbaseDate** - Seletor de data
- **ArchbaseNumber** - Input numérico
- **ArchbaseSwitch** - Toggle switch

### 🔧 Editores Avançados
- **ArchbaseAsyncSelect** - Seleção com carregamento assíncrono
- **ArchbaseRichTextEdit** - Editor WYSIWYG completo
- **ArchbaseMaskEdit** - Inputs com máscaras (CPF/CNPJ/Phone)
- **ArchbaseLookupEdit** - Seleção com modal de busca
- **ArchbaseTreeSelect** - Seleção hierárquica
- **ArchbaseChipGroup** - Seleção por chips/tags
- **ArchbaseRating** - Avaliação com estrelas
- **ArchbaseColorPicker** - Seletor de cores
- **ArchbaseCronExpressionEdit** - Editor de expressões cron
- **ArchbaseJsonEdit** - Editor JSON com sintaxe
- **ArchbaseKeyValueEditor** - Editor de propriedades
- **ArchbaseOperationHoursEditor** - Horário de funcionamento
- **ArchbaseFileAttachment** - Upload de arquivos
- **ArchbaseImageEdit** - Upload de imagens
- **ArchbaseAvatarEdit** - Upload de avatar
- **ArchbasePasswordEdit** - Input de senha com força

### 📊 Exibição de Dados
- **ArchbaseDataTable** - Tabela avançada
- **ArchbaseDataGrid** - Grid CRUD com ações
- **ArchbaseFormTemplate** - Container de formulário
- **ArchbaseModal** - Modal para overlays

### 🧭 Navegação e Feedback
- **ArchbaseNavigation** - Sistema de navegação
- **Button** - Botões com estados (Mantine)
- **ArchbaseNotifications** - Sistema de notificações

## 🛠️ Padrões dos Exemplos

### DataSource V2
Todos os exemplos utilizam o padrão DataSource V2 do Archbase:

```tsx
const dataSource = useArchbaseRemoteDataSource<DTO, ID>({
  name: 'entityName',
  endPointUrl: '/api/endpoint',
  updateType: 'manual', // ou 'auto'
  inserting: true // para novos registros
});
```

### Validação
Exemplos incluem validação com Yup:

```tsx
const schema = yup.object().shape({
  field: yup.string().required('Campo obrigatório')
});

const validator = new ArchbaseValidator(schema);
```

### Permissões
Uso de verificações de permissão:

```tsx
import { isAdministrator, hasPermission } from 'archbase-react';

// Verificação de admin
{isAdministrator() && <AdminButton />}

// Verificação de permissão específica
{hasPermission('users.write') && <EditButton />}
```

### Roteamento Admin
Padrão de rotas administrativas:

```
/admin/{categoria}/{funcionalidade}
/admin/{categoria}/{funcionalidade}/:id
```

## 📖 Documentação Adicional

- [Knowledge Base](../src/knowledge/KnowledgeBase.ts) - Base de conhecimento completa
- [Generators](../src/generators/) - Geradores de código
- [Templates](../src/templates/) - Templates Handlebars
- [README Principal](../README.md) - Documentação do projeto

## 🤝 Contribuindo

Para adicionar novos exemplos:

1. Crie o arquivo na categoria apropriada
2. Use o padrão DataSource V2
3. Inclua validação e tratamento de erros
4. Adicione comentários explicativos
5. Atualize este índice

## 📝 Licença

MIT License - veja o arquivo [LICENSE](../LICENSE) para detalhes.