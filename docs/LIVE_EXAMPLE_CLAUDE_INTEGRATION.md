# 🎬 Exemplo Prático: Claude Code + Archbase CLI em Ação

## 🎯 **Simulação Real de Desenvolvimento**

Vamos simular uma conversa real entre um desenvolvedor e Claude Code para criar um sistema de gestão de produtos.

---

## 💬 **Conversa Completa: Sistema de Produtos**

### **🎬 CENA 1: Iniciando o Projeto**

**👨‍💻 Desenvolvedor:**
> "Claude, preciso criar um sistema para gerenciar produtos de um e-commerce. Preciso de formulário de cadastro e uma lista para gerenciar. Use Archbase React V3."

**🤖 Claude Code:**
> "Vou te ajudar a criar um sistema completo de gestão de produtos usando Archbase React V3. Primeiro, deixe-me consultar os componentes disponíveis para entender as melhores opções..."

```bash
# Claude executa internamente:
archbase query component ArchbaseFormTemplate
archbase query component ArchbaseDataGrid
archbase query component ArchbaseEdit
archbase query component ArchbaseSelect
archbase query component ArchbaseImageEdit
```

> "Baseado no conhecimento dos componentes Archbase V3, vou criar uma solução completa seguindo os padrões powerview-admin. Aqui está o plano:
>
> 1. **ProductForm** - Formulário usando `ArchbaseFormTemplate` com DataSource V2
> 2. **ProductListView** - Lista CRUD usando `ArchbaseDataGrid`
> 3. **Estrutura de rotas** e navegação
>
> Vamos começar:"

---

### **📝 1. Formulário de Produto (ProductForm.tsx)**

**🤖 Claude Code:**
```typescript
import React, { useCallback } from 'react';
import * as yup from 'yup';
import { 
  useArchbaseRemoteDataSource
} from '@archbase/data';
import {
  ArchbaseEdit,
  ArchbaseSelect,
  ArchbaseSelectItem,
  ArchbaseTextArea,
  ArchbaseNumberEdit,
  ArchbaseImageEdit,
  ArchbaseSwitch
} from '@archbase/components';
import {
  ArchbaseFormTemplate
} from '@archbase/template';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ProductDto } from '../domain/ProductDto';
import { ProductRemoteService } from '../service/ProductRemoteService';

interface ProductFormProps {
  productId?: string;
}

// Validação usando yup (Claude conhece esse padrão)
const validator = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  description: yup.string().required('Descrição é obrigatória'),
  price: yup.number().positive('Preço deve ser positivo').required('Preço é obrigatório'),
  category: yup.string().required('Categoria é obrigatória'),
  stock: yup.number().min(0, 'Estoque não pode ser negativo').required()
});

// Opções de categoria (Claude sugere baseado no contexto)
const categoryOptions = [
  { value: 'electronics', label: 'Eletrônicos' },
  { value: 'clothing', label: 'Roupas' },
  { value: 'books', label: 'Livros' },
  { value: 'home', label: 'Casa e Jardim' }
];

export function ProductForm({ productId }: ProductFormProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Pattern powerview-admin (Claude conhece esse padrão)
  const action = searchParams.get('action') || 'ADD';
  const isViewMode = action === 'VIEW';
  const isEditMode = action === 'EDIT';
  
  // DataSource V2 pattern (Claude aplica automaticamente)
  const { dataSource, isLoading, error } = useArchbaseRemoteDataSource<ProductDto, string>({
    name: 'dsProduct',
    label: 'Product',
    service: ProductRemoteService,
    pageSize: 50,
    loadOnStart: true,
    validator,
    id: isEditMode || isViewMode ? productId : undefined,
    onLoadComplete: (dataSource) => {
      if (action === 'ADD') {
        dataSource.append(ProductDto.newInstance());
      }
    }
  });

  const handleBeforeSave = useCallback(async (entity: ProductDto) => {
    // Claude adiciona validações customizadas
    if (entity.price <= 0) {
      throw new Error('Preço deve ser maior que zero');
    }
    return true;
  }, []);

  const handleAfterSave = useCallback((entity: ProductDto) => {
    // Pattern de navegação admin (Claude conhece)
    navigate('/products');
  }, [navigate]);

  const handleCancel = useCallback(() => {
    navigate('/products');
  }, [navigate]);

  // Error handling pattern (Claude aplica automaticamente)
  if (isLoading) {
    return <div>Carregando produto...</div>;
  }

  if (error) {
    return <div>Erro ao carregar produto: {error.message}</div>;
  }

  return (
    <ArchbaseFormTemplate
      title={`${isEditMode ? 'Editar' : isViewMode ? 'Visualizar' : 'Novo'} Produto`}
      dataSource={dataSource}
      onBeforeSave={handleBeforeSave}
      onAfterSave={handleAfterSave}
      onCancel={handleCancel}
      readOnly={isViewMode}
    >
      <ArchbaseEdit
        label="Nome do Produto"
        dataSource={dataSource}
        dataField="name"
        required
        placeholder="Digite o nome do produto"
      />
      
      <ArchbaseTextArea
        label="Descrição"
        dataSource={dataSource}
        dataField="description"
        required
        placeholder="Descreva o produto..."
        rows={4}
        autosize
      />
      
      <ArchbaseNumberEdit
        label="Preço (R$)"
        dataSource={dataSource}
        dataField="price"
        required
        min={0}
        precision={2}
        placeholder="0,00"
      />
      
      <ArchbaseSelect
        label="Categoria"
        dataSource={dataSource}
        dataField="category"
        required
        placeholder="Selecione uma categoria"
      >
        {categoryOptions.map(option => (
          <ArchbaseSelectItem 
            key={option.value} 
            value={option.value} 
            label={option.label} 
          />
        ))}
      </ArchbaseSelect>
      
      <ArchbaseNumberEdit
        label="Estoque"
        dataSource={dataSource}
        dataField="stock"
        required
        min={0}
        placeholder="Quantidade em estoque"
      />
      
      <ArchbaseImageEdit
        label="Imagem do Produto"
        dataSource={dataSource}
        dataField="image"
        maxSize={5242880} // 5MB
        accept={['image/*']}
        width="100%"
        height={200}
      />
      
      <ArchbaseSwitch
        label="Produto Ativo"
        dataSource={dataSource}
        dataField="active"
        onLabel="SIM"
        offLabel="NÃO"
      />
    </ArchbaseFormTemplate>
  );
}

export default ProductForm;
```

**👨‍💻 Desenvolvedor:**
> "Excelente! Agora preciso da lista para gerenciar esses produtos."

---

### **📋 2. Lista de Produtos (ProductListView.tsx)**

**🤖 Claude Code:**
> "Agora vou criar a lista CRUD seguindo o padrão powerview-admin com `ArchbaseDataGrid`. Vou incluir filtros, ações de linha e toolbar personalizada:"

```typescript
import React, { useMemo, useRef, useState, useCallback } from 'react';
import { 
  Paper, Group, Button, ActionIcon, Badge, NumberFormatter
} from '@mantine/core';
import {
  IconPlus, IconEdit, IconTrash, IconEye, IconPhoto
} from '@tabler/icons-react';
import {
  ArchbaseDataGrid,
  ArchbaseDataGridColumn,
  Columns,
  ArchbaseNotifications,
  ArchbaseDialog
} from '@archbase/components';
import {
  useArchbaseRemoteDataSource
} from '@archbase/data';
import {
  useArchbaseStore,
  useArchbaseRemoteServiceApi,
  useArchbaseGetLoggedUser,
  useArchbaseNavigateParams,
  useArchbaseTheme
} from '@archbase/core';
import { useTranslation } from 'react-i18next';
import { ProductDto } from '../../domain/ProductDto';
import { ProductService } from '../../services/ProductService';
import { API_TYPE } from '../../ioc/IOCTypes';

interface ProductListViewProps {}

// Navigation constants (pattern powerview-admin)
const PRODUCTS_ROUTE = '/products';
const ADD_ACTION = 'ADD';
const EDIT_ACTION = 'EDIT';
const VIEW_ACTION = 'VIEW';

function ProductListView({}: ProductListViewProps) {
  const { t } = useTranslation();
  const loggedUser = useArchbaseGetLoggedUser();
  const templateStore = useArchbaseStore('productStore');
  const serviceApi = useArchbaseRemoteServiceApi<ProductService>(API_TYPE.Product);
  const navigate = useArchbaseNavigateParams();
  const [lastError, setLastError] = useState<string>('');
  const gridRef = useRef<any>(null);
  const theme = useArchbaseTheme();

  // Permission check (Claude adiciona automaticamente)
  const isAdministrator = (): boolean => {
    return loggedUser?.isAdmin || false;
  };

  // Remote DataSource (pattern Claude conhece)
  const { dataSource, isLoading, error, isError } = useArchbaseRemoteDataSource<ProductDto, string>({
    name: 'dsProducts',
    service: serviceApi,
    store: templateStore,
    pageSize: 25,
    loadOnStart: true,
    onError: (error, origin) => {
      ArchbaseNotifications.showError('Erro', error, origin);
    }
  });

  // Navigation handlers (pattern powerview-admin)
  const handleAdd = useCallback(() => {
    navigate(
      PRODUCTS_ROUTE + '/novo-' + Date.now(),
      {},
      { action: ADD_ACTION, redirectUrl: PRODUCTS_ROUTE }
    );
  }, [navigate]);

  const handleEdit = useCallback(() => {
    const record = dataSource.getCurrentRecord();
    if (record) {
      navigate(
        PRODUCTS_ROUTE + '/' + record.id,
        {},
        { action: EDIT_ACTION, redirectUrl: PRODUCTS_ROUTE }
      );
    }
  }, [dataSource, navigate]);

  const handleView = useCallback(() => {
    const record = dataSource.getCurrentRecord();
    if (record) {
      navigate(
        PRODUCTS_ROUTE + '/' + record.id,
        {},
        { action: VIEW_ACTION, redirectUrl: PRODUCTS_ROUTE }
      );
    }
  }, [dataSource, navigate]);

  const handleRemove = useCallback(() => {
    if (!dataSource.isEmpty()) {
      const record = dataSource.getCurrentRecord();
      if (record) {
        ArchbaseDialog.showConfirmDialogYesNo(
          'Confirmar Exclusão',
          `Deseja realmente remover o produto "${record.name}"?`,
          () => {
            dataSource.remove();
            ArchbaseNotifications.showSuccess('Sucesso', 'Produto removido com sucesso');
          },
          () => {}
        );
      }
    }
  }, [dataSource]);

  // Custom renderers (Claude adiciona baseado no contexto)
  const renderPrice = useCallback((value: number) => {
    return (
      <NumberFormatter
        value={value}
        prefix="R$ "
        thousandSeparator="."
        decimalSeparator=","
        decimalScale={2}
        fixedDecimalScale
      />
    );
  }, []);

  const renderCategory = useCallback((value: string) => {
    const categoryColors = {
      electronics: 'blue',
      clothing: 'pink',
      books: 'green',
      home: 'orange'
    };
    
    const categoryLabels = {
      electronics: 'Eletrônicos',
      clothing: 'Roupas',
      books: 'Livros',
      home: 'Casa e Jardim'
    };

    return (
      <Badge color={categoryColors[value] || 'gray'}>
        {categoryLabels[value] || value}
      </Badge>
    );
  }, []);

  const renderStock = useCallback((value: number) => {
    const color = value === 0 ? 'red' : value < 10 ? 'yellow' : 'green';
    return <Badge color={color}>{value}</Badge>;
  }, []);

  const renderActive = useCallback((value: boolean) => {
    return (
      <Badge color={value ? 'green' : 'red'}>
        {value ? 'Ativo' : 'Inativo'}
      </Badge>
    );
  }, []);

  // Row actions (Claude conhece esse pattern)
  const buildRowActions = useCallback((row: ProductDto): React.ReactNode => {
    return (
      <Group gap={4} wrap="nowrap">
        <ActionIcon variant="transparent" color="gray" onClick={() => {
          dataSource.gotoRecordByData(row);
          handleView();
        }}>
          <IconEye size={20} />
        </ActionIcon>
        
        {isAdministrator() && (
          <>
            <ActionIcon variant="transparent" color="blue" onClick={() => {
              dataSource.gotoRecordByData(row);
              handleEdit();
            }}>
              <IconEdit size={20} />
            </ActionIcon>
            <ActionIcon variant="transparent" color="red" onClick={() => {
              dataSource.gotoRecordByData(row);
              handleRemove();
            }}>
              <IconTrash size={20} />
            </ActionIcon>
          </>
        )}
      </Group>
    );
  }, [dataSource, handleView, handleEdit, handleRemove, isAdministrator]);

  // Toolbar actions
  const renderToolbarActions = useCallback(() => {
    return (
      <Group align="end" gap="8px" wrap="nowrap">
        {isAdministrator() && (
          <>
            <Button color="green" leftSection={<IconPlus />} onClick={handleAdd}>
              Novo Produto
            </Button>
            <Button color="blue" leftSection={<IconEdit />} onClick={handleEdit}>
              Editar
            </Button>
            <Button color="red" leftSection={<IconTrash />} onClick={handleRemove}>
              Remover
            </Button>
          </>
        )}
        <Button color="gray" leftSection={<IconEye />} onClick={handleView}>
          Visualizar
        </Button>
      </Group>
    );
  }, [handleAdd, handleEdit, handleRemove, handleView, isAdministrator]);

  // Column definitions (Claude otimiza baseado no contexto)
  const columns = useMemo(() => {
    return (
      <Columns>
        <ArchbaseDataGridColumn
          dataField="image"
          header="Foto"
          size={80}
          enableSorting={false}
          customRenderer={(value) => (
            value ? (
              <img 
                src={value} 
                alt="Produto" 
                style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
              />
            ) : (
              <IconPhoto size={40} color="gray" />
            )
          )}
        />
        <ArchbaseDataGridColumn
          dataField="name"
          header="Nome"
          inputFilterType="text"
          size={200}
        />
        <ArchbaseDataGridColumn
          dataField="category"
          header="Categoria"
          inputFilterType="select"
          size={150}
          customRenderer={renderCategory}
        />
        <ArchbaseDataGridColumn
          dataField="price"
          header="Preço"
          dataType="number"
          size={120}
          customRenderer={renderPrice}
        />
        <ArchbaseDataGridColumn
          dataField="stock"
          header="Estoque"
          dataType="number"
          size={100}
          customRenderer={renderStock}
        />
        <ArchbaseDataGridColumn
          dataField="active"
          header="Status"
          dataType="boolean"
          inputFilterType="select"
          size={100}
          customRenderer={renderActive}
        />
        <ArchbaseDataGridColumn
          dataField="createdAt"
          header="Criado em"
          dataType="datetime"
          size={150}
        />
      </Columns>
    );
  }, [renderCategory, renderPrice, renderStock, renderActive]);

  return (
    <Paper>
      <ArchbaseDataGrid<ProductDto, string>
        gridRef={gridRef}
        printTitle="Lista de Produtos"
        width="100%"
        height="100%"
        withBorder={false}
        dataSource={dataSource}
        withColumnBorders={true}
        striped={true}
        enableTopToolbar={true}
        enableRowActions={true}
        pageSize={25}
        isLoading={isLoading}
        isError={isError || lastError !== ''}
        error={error || lastError}
        enableGlobalFilter={true}
        getRowId={(row: ProductDto) => row.id}
        toolbarLeftContent={renderToolbarActions()}
        renderRowActions={buildRowActions}
      >
        {columns}
      </ArchbaseDataGrid>
    </Paper>
  );
}

export { ProductListView };
export default ProductListView;
```

**👨‍💻 Desenvolvedor:**
> "Perfeito! Agora como integro isso em um layout admin completo?"

---

### **🏗️ 3. Layout Admin Integrado**

**🤖 Claude Code:**
> "Vou criar a estrutura completa do admin usando `ArchbaseAdminMainLayout`. Aqui está a integração completa:"

```typescript
// App.tsx
import React, { useState, Fragment } from 'react';
import {
  ArchbaseGlobalProvider,
  ArchbaseAppProvider
} from '@archbase/core';
import {
  ArchbaseAdminMainLayout,
  ArchbaseAdminTabContainer,
  ArchbaseNavigationProvider,
  useArchbaseAdminStore
} from '@archbase/admin';
import {
  ArchbaseLogin,
  useArchbaseAuthenticationManager
} from '@archbase/security';
import { Routes, Route } from 'react-router-dom';
import { ProductForm } from './views/products/ProductForm';
import { ProductListView } from './views/products/ProductListView';

// Navigation data (Claude estrutura seguindo padrões)
const navigationData = [
  {
    id: 'dashboard',
    text: 'Dashboard',
    icon: 'IconDashboard',
    route: '/dashboard'
  },
  {
    id: 'products',
    text: 'Produtos',
    icon: 'IconPackage',
    route: '/products',
    children: [
      { id: 'product-list', text: 'Lista', route: '/products' },
      { id: 'product-new', text: 'Novo', route: '/products/new' }
    ]
  },
  {
    id: 'orders',
    text: 'Pedidos',
    icon: 'IconShoppingCart',
    route: '/orders'
  },
  {
    id: 'customers',
    text: 'Clientes',
    icon: 'IconUsers',
    route: '/customers'
  }
];

function Main() {
  const [currentUser, setCurrentUser] = useState(undefined);
  const adminStore = useArchbaseAdminStore();
  
  const { isAuthenticated, login, logout, username, error } = 
    useArchbaseAuthenticationManager({});

  const handleLogin = (username: string, password: string, rememberMe: boolean) => {
    login(username, password, rememberMe);
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(undefined);
  };

  if (!isAuthenticated) {
    return (
      <ArchbaseLogin
        onLogin={handleLogin}
        error={error}
        title="E-commerce Admin"
        subtitle="Sistema de Gestão de Produtos"
      />
    );
  }

  return (
    <ArchbaseNavigationProvider navigationData={navigationData}>
      <ArchbaseAdminMainLayout
        navigationData={navigationData}
        sideBarWidth="280px"
        sideBarCollapsedWidth="60px"
        enableSecurity={true}
        showHeader={true}
        sideBarHeaderContent={
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <h3>E-commerce Admin</h3>
          </div>
        }
      >
        <ArchbaseAdminTabContainer
          onChangeActiveTabId={(activeTabId) => adminStore.setActiveTabId(activeTabId)}
          onChangeOpenedTabs={(openedTabs) => adminStore.setOpenedTabs(openedTabs)}
          openedTabs={adminStore.openedTabs}
          activeTabId={adminStore.activeTabId}
          navigationData={navigationData}
        >
          <Routes>
            <Route path="/products" element={<ProductListView />} />
            <Route path="/products/:productId" element={<ProductForm />} />
            <Route path="/products/new" element={<ProductForm />} />
            {/* Outras rotas... */}
          </Routes>
        </ArchbaseAdminTabContainer>
      </ArchbaseAdminMainLayout>
    </ArchbaseNavigationProvider>
  );
}

export default function App() {
  return (
    <ArchbaseGlobalProvider>
      <ArchbaseAppProvider>
        <Main />
      </ArchbaseAppProvider>
    </ArchbaseGlobalProvider>
  );
}
```

**👨‍💻 Desenvolvedor:**
> "Fantástico! Uma última pergunta: como adiciono um dashboard com gráficos de vendas?"

---

### **📊 4. Dashboard com Gráficos**

**🤖 Claude Code:**
> "Vou consultar os componentes de chart disponíveis..."

```bash
# Claude consulta:
archbase query component ArchbaseChart
archbase search --query="dashboard chart"
```

> "Vou criar um dashboard usando componentes de layout e gráficos:"

```typescript
// ProductDashboard.tsx
import React, { useMemo } from 'react';
import { Grid, Paper, Title, Group, Text, Badge } from '@mantine/core';
import {
  ArchbaseSpace,
  ArchbaseSpaceFill
} from '@archbase/layout';
import {
  useArchbaseRemoteDataSource
} from '@archbase/data';
import { LineChart, BarChart, PieChart, AreaChart } from 'recharts';

export function ProductDashboard() {
  // Dashboard data sources (Claude aplica patterns)
  const { dataSource: salesData } = useArchbaseRemoteDataSource({
    name: 'dsSalesMetrics',
    service: SalesMetricsService,
    loadOnStart: true
  });

  const { dataSource: productsData } = useArchbaseRemoteDataSource({
    name: 'dsProductMetrics', 
    service: ProductMetricsService,
    loadOnStart: true
  });

  // Metrics calculation (Claude adiciona lógica)
  const metrics = useMemo(() => {
    const totalProducts = productsData.getRecordCount();
    const activeProducts = productsData.getRecords().filter(p => p.active).length;
    const lowStock = productsData.getRecords().filter(p => p.stock < 10).length;
    
    return { totalProducts, activeProducts, lowStock };
  }, [productsData]);

  return (
    <ArchbaseSpace direction="column" gap="md" fill>
      <Title order={2}>Dashboard de Produtos</Title>
      
      {/* Metrics Cards */}
      <Grid>
        <Grid.Col span={4}>
          <Paper p="md" withBorder>
            <Group justify="space-between">
              <Text size="sm" color="dimmed">Total de Produtos</Text>
              <Badge color="blue" size="lg">{metrics.totalProducts}</Badge>
            </Group>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={4}>
          <Paper p="md" withBorder>
            <Group justify="space-between">
              <Text size="sm" color="dimmed">Produtos Ativos</Text>
              <Badge color="green" size="lg">{metrics.activeProducts}</Badge>
            </Group>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={4}>
          <Paper p="md" withBorder>
            <Group justify="space-between">
              <Text size="sm" color="dimmed">Estoque Baixo</Text>
              <Badge color="red" size="lg">{metrics.lowStock}</Badge>
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Charts */}
      <Grid>
        <Grid.Col span={6}>
          <Paper p="md" withBorder>
            <Title order={4} mb="md">Vendas por Mês</Title>
            <LineChart width={400} height={250} data={salesData.getRecords()}>
              {/* Chart configuration */}
            </LineChart>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={6}>
          <Paper p="md" withBorder>
            <Title order={4} mb="md">Produtos por Categoria</Title>
            <PieChart width={400} height={250}>
              {/* Chart configuration */}
            </PieChart>
          </Paper>
        </Grid.Col>
      </Grid>
    </ArchbaseSpace>
  );
}
```

---

## 🎯 **Resultado Final**

**🤖 Claude Code:**
> "Sistema completo criado! Aqui está o que foi gerado:
>
> ✅ **ProductForm** - Formulário completo com validação yup e upload de imagem
> ✅ **ProductListView** - Lista CRUD com filtros avançados e ações
> ✅ **Layout Admin** - Estrutura completa com navegação e autenticação  
> ✅ **Dashboard** - Métricas e gráficos em tempo real
>
> **Características aplicadas automaticamente:**
> - ✅ Imports V3 organizados por pacote
> - ✅ DataSource V2 com patterns powerview-admin
> - ✅ Error handling consistente
> - ✅ Navegação admin padronizada
> - ✅ Permissões e segurança integradas
> - ✅ Validação robusta com yup
> - ✅ UI responsiva e acessível
>
> **O sistema está pronto para produção seguindo todos os padrões Archbase!**"

**👨‍💻 Desenvolvedor:**
> "Incrível! Em poucos minutos você criou um sistema completo seguindo todos os padrões. Isso vai revolucionar nossa produtividade!"

---

## 🚀 **Por que isso é Revolucionário?**

### **✨ Antes (sem integração):**
- 📚 Desenvolvedor consulta documentação manualmente
- 🔍 Busca exemplos em projetos antigos  
- ⚠️ Pode usar padrões inconsistentes
- 🐛 Imports incorretos ou dependências erradas
- ⏱️ Demora horas para criar estruturas básicas

### **🚀 Agora (com integração):**
- 🤖 Claude conhece TODOS os 149 componentes V3
- ⚡ Código gerado instantaneamente com padrões corretos
- 📦 Imports V3 sempre organizados por pacote
- 🎯 Best practices aplicadas automaticamente
- ✅ Zero possibilidade de erro de estrutura
- 🏗️ Sistemas completos em minutos, não horas

**É como ter um arquiteto sênior Archbase trabalhando 24/7 com cada desenvolvedor da equipe!** 🎯