# Exemplos de Componentes Archbase

Esta pasta contém exemplos funcionais e práticos dos componentes Archbase React.

## 📋 Estrutura

```
components/
├── editors/          # Componentes de entrada de dados
├── forms/           # Formulários completos
├── grids/           # Tabelas e grids de dados
├── navigation/      # Componentes de navegação
└── feedback/        # Notificações e feedback
```

## 🎯 Exemplos Disponíveis

### 📝 Editors

#### [`async-select-users.tsx`](./editors/async-select-users.tsx)
**ArchbaseAsyncSelect** - Seleção assíncrona de usuários
- Carregamento dinâmico de opções
- Debounce para otimização
- Paginação de resultados
- Renderização customizada de opções
- Estados de loading

```tsx
<ArchbaseAsyncSelect
  loadOptions={loadUsers}
  getOptionLabel={(user) => user.name}
  getOptionValue={(user) => user.id}
  debounce={500}
/>
```

#### [`rich-text-article.tsx`](./editors/rich-text-article.tsx)
**ArchbaseRichTextEdit** - Editor WYSIWYG para artigos
- Editor completo com toolbar
- Upload de imagens
- Preview em tempo real
- Integração com DataSource V2
- Configuração customizada

```tsx
<ArchbaseRichTextEdit
  dataSource={dataSource}
  dataField="content"
  height="500px"
  onImageUploadBefore={handleImageUpload}
/>
```

#### [`mask-cpf-cnpj.tsx`](./editors/mask-cpf-cnpj.tsx)
**ArchbaseMaskEdit** - Máscaras brasileiras
- CPF e CNPJ com validação
- Telefone, CEP, Placa
- Máscaras customizadas
- Detecção automática de tipo
- Validação em tempo real

```tsx
<ArchbaseMaskEdit
  mask={MaskPattern.CPF}
  dataSource={dataSource}
  dataField="document"
/>
```

#### [`lookup-products.tsx`](./editors/lookup-products.tsx)
**ArchbaseLookupEdit** - Seleção de produtos com modal
- Modal de busca com grid
- Filtros avançados
- Seleção por duplo clique
- Integração com DataGrid
- Busca em tempo real

```tsx
<ArchbaseLookupEdit
  lookupDataSource={productsDataSource}
  onLookup={() => setModalVisible(true)}
  getOptionLabel={(product) => product.name}
/>
```

### 📋 Forms

#### [`form-datasource-v2.tsx`](./forms/form-datasource-v2.tsx)
**ArchbaseFormTemplate** - Formulário completo com DataSource V2
- Validação com Yup
- Campos diversos (texto, select, data, checkbox)
- Tratamento de erros
- Estados de loading
- Padrão admin completo

```tsx
<ArchbaseFormTemplate
  dataSource={dataSource}
  validator={validator}
  onSaveComplete={handleSaveComplete}
>
  {/* Campos do formulário */}
</ArchbaseFormTemplate>
```

### 📊 Grids

#### [`admin-crud-grid.tsx`](./grids/admin-crud-grid.tsx)
**ArchbaseDataGrid** - Grid CRUD administrativo
- Ações por linha (View/Edit/Delete)
- Verificação de permissões
- Toolbar com busca
- Formatação de colunas
- Paginação e filtros

```tsx
<ArchbaseDataGrid
  dataSource={dataSource}
  enableRowActions
  renderRowActions={(row) => <ActionsMenu />}
  toolbarLeftContent={<Toolbar />}
>
  <ArchbaseDataGridColumn accessor="name" header="Nome" />
</ArchbaseDataGrid>
```

### 🧭 Navigation

#### [`admin-navigation.tsx`](./navigation/admin-navigation.tsx)
**ArchbaseNavigation** - Navegação administrativa
- Menu hierárquico
- Verificação de permissões
- Estados ativo/colapso
- Routing integrado
- Ícones e agrupamento

```tsx
<ArchbaseNavigation
  navigationData={menuItems}
  collapsed={collapsed}
  onItemClick={handleNavigation}
/>
```

### 💬 Feedback

#### [`notification-success.tsx`](./feedback/notification-success.tsx)
**ArchbaseNotifications** - Sistema de notificações
- Notificações de sucesso, erro, aviso
- Estados de loading com update
- Ações customizadas
- Posicionamento configurável
- Manager utility class

```tsx
<ArchbaseNotifications 
  position="top-right"
  limit={5}
  autoClose={4000}
/>
```

## 🚀 Como Usar

### 1. Pré-requisitos
```bash
npm install archbase-react @mantine/core @mantine/hooks
npm install react react-dom react-router-dom
npm install @tabler/icons-react axios yup
```

### 2. Configuração Base
```tsx
// main.tsx
import { MantineProvider } from '@mantine/core';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <MantineProvider>
      <BrowserRouter>
        <YourApp />
      </BrowserRouter>
    </MantineProvider>
  );
}
```

### 3. Importação dos Exemplos
```tsx
import { UserFormExample } from './examples/components/forms/form-datasource-v2';
import { ProductGridExample } from './examples/components/grids/admin-crud-grid';

export function MyPage() {
  return (
    <div>
      <UserFormExample />
      <ProductGridExample />
    </div>
  );
}
```

## 🎨 Padrões Seguidos

### DataSource V2
```tsx
const dataSource = useArchbaseRemoteDataSource<DTO, ID>({
  name: 'entityName',
  endPointUrl: '/api/endpoint',
  updateType: 'manual',
  inserting: true
});
```

### Validação
```tsx
const schema = yup.object().shape({
  field: yup.string().required('Campo obrigatório')
});

const validator = new ArchbaseValidator(schema);
```

### Permissões
```tsx
{isAdministrator() && <AdminFeature />}
{hasPermission('entity.action') && <ActionButton />}
```

### Tratamento de Erros
```tsx
try {
  await dataSource.save();
  showSuccessNotification();
} catch (error) {
  showErrorNotification();
}
```

## 📚 Documentação

- [Knowledge Base](../../src/knowledge/KnowledgeBase.ts) - Documentação completa dos componentes
- [Generators](../../src/generators/) - Geradores que usam estes padrões
- [Templates](../../src/templates/) - Templates baseados nestes exemplos

## 🤝 Contribuindo

Para adicionar novos exemplos:

1. Siga a estrutura de pastas existente
2. Use os padrões DataSource V2 e validação
3. Inclua comentários explicativos
4. Adicione diferentes variações de uso
5. Atualize esta documentação

---

**Nota**: Todos os exemplos são baseados em padrões reais extraídos do projeto powerview-admin e seguem as melhores práticas do ecossistema Archbase.