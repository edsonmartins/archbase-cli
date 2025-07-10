# 🚀 Archbase CLI V3 - Demonstração de Comandos

## 📋 Visão Geral
Demonstração das capacidades do Archbase CLI após migração para V3, mostrando consultas de componentes, geração de código e integração com Claude Code.

---

## 🔍 **1. CONSULTAS DE COMPONENTES**

### Componentes de Formulário
```bash
# Consultar componente de input básico
npm run dev query component ArchbaseEdit

# Consultar componente de seleção
npm run dev query component ArchbaseSelect

# Consultar componente de data
npm run dev query component ArchbaseDatePicker

# Consultar componente de número
npm run dev query component ArchbaseNumberEdit

# Consultar área de texto
npm run dev query component ArchbaseTextArea
```

### Componentes de Dados
```bash
# Consultar grid de dados principal
npm run dev query component ArchbaseDataGrid

# Consultar colunas do grid
npm run dev query component ArchbaseDataGridColumn

# Consultar lista simples
npm run dev query component ArchbaseList

# Consultar árvore hierárquica
npm run dev query component ArchbaseTreeSelect
```

### Componentes Admin
```bash
# Consultar layout principal admin
npm run dev query component ArchbaseAdminMainLayout

# Consultar navegação admin
npm run dev query component ArchbaseNavigation

# Consultar container de abas
npm run dev query component ArchbaseAdminTabContainer

# Consultar sidebar avançada
npm run dev query component ArchbaseAdvancedSidebar
```

### Componentes de Segurança
```bash
# Consultar componente de login
npm run dev query component ArchbaseLogin

# Consultar reset de senha
npm run dev query component ArchbaseResetPassword

# Consultar gerenciador de segurança
npm run dev query component ArchbaseSecurityManager

# Consultar tokens de API
npm run dev query component ArchbaseApiTokenView
```

### Componentes de Template
```bash
# Consultar template de formulário
npm run dev query component ArchbaseFormTemplate

# Consultar template de grid
npm run dev query component ArchbaseGridTemplate

# Consultar template de modal
npm run dev query component ArchbaseModalTemplate
```

---

## 🏗️ **2. GERAÇÃO DE CÓDIGO**

### Gerar Formulários
```bash
# Formulário básico de usuário
npm run dev generate form UserForm \
  --fields="name:text:Nome,email:email:E-mail,active:boolean:Ativo" \
  --validation=yup \
  --typescript

# Formulário de produto com validação
npm run dev generate form ProductForm \
  --fields="name:text:Nome do Produto,price:number:Preço,category:select:Categoria,description:textarea:Descrição" \
  --validation=yup \
  --required="name,price,category"

# Formulário de cliente complexo
npm run dev generate form CustomerForm \
  --fields="name:text:Nome,email:email:E-mail,phone:text:Telefone,birthDate:date:Data Nascimento,status:select:Status" \
  --validation=yup \
  --typescript \
  --datasource-v2
```

### Gerar Views CRUD
```bash
# View de listagem de usuários
npm run dev generate view UserListView \
  --entity=User \
  --type=crud-list \
  --fields="name,email,active,createdAt" \
  --filterable="name,email" \
  --permissions

# View de produtos com filtros
npm run dev generate view ProductListView \
  --entity=Product \
  --type=crud-list \
  --fields="name,price,category,stock" \
  --filterable="name,category" \
  --sortable="price,name"

# View de clientes admin
npm run dev generate view CustomerListView \
  --entity=Customer \
  --type=admin-crud \
  --fields="name,email,phone,status,lastLogin" \
  --permissions \
  --export
```

### Gerar Services
```bash
# Service básico de usuário
npm run dev generate service UserService \
  --entity=User \
  --type=UserDto \
  --endpoints="findAll,findById,create,update,delete"

# Service de produtos com cache
npm run dev generate service ProductService \
  --entity=Product \
  --type=ProductDto \
  --endpoints="findAll,findById,create,update,delete,findByCategory" \
  --cache

# Service complexo de pedidos
npm run dev generate service OrderService \
  --entity=Order \
  --type=OrderDto \
  --endpoints="findAll,findById,create,update,delete,findByCustomer,findByStatus" \
  --typescript \
  --validation
```

---

## 📱 **3. GERAÇÃO DE PROJETOS COMPLETOS**

### Projeto Admin Dashboard
```bash
# Projeto admin completo
npm run dev generate project ecommerce-admin \
  --template=admin-dashboard \
  --features="authentication,navigation,crud,permissions" \
  --typescript \
  --tests

# Projeto com múltiplas entidades
npm run dev generate project inventory-system \
  --template=admin-dashboard \
  --entities="Product,Category,Supplier,Order" \
  --features="authentication,reports,export" \
  --typescript
```

### Dashboards Específicos
```bash
# Dashboard de vendas
npm run dev generate dashboard SalesDashboard \
  --charts="line,bar,pie" \
  --metrics="revenue,orders,customers" \
  --filters="date-range,category"

# Dashboard analítico
npm run dev generate dashboard AnalyticsDashboard \
  --charts="area,donut,scatter" \
  --metrics="users,sessions,conversion" \
  --realtime
```

---

## 🧪 **4. DEMONSTRAÇÃO PRÁTICA - SISTEMA DE E-COMMERCE**

### Passo 1: Criar o Projeto Base
```bash
npm run dev generate project ecommerce-admin \
  --template=admin-dashboard \
  --features="authentication,navigation,security" \
  --typescript \
  --description="Sistema administrativo para e-commerce"
```

### Passo 2: Gerar Entidades Principais
```bash
# Formulário de Produtos
npm run dev generate form ProductForm \
  --fields="name:text:Nome,description:textarea:Descrição,price:number:Preço,category:select:Categoria,images:array:Imagens,active:boolean:Ativo" \
  --validation=yup \
  --required="name,price,category" \
  --typescript

# Lista de Produtos
npm run dev generate view ProductListView \
  --entity=Product \
  --type=crud-list \
  --fields="name,price,category,stock,active" \
  --filterable="name,category,active" \
  --sortable="name,price,createdAt" \
  --permissions

# Service de Produtos
npm run dev generate service ProductService \
  --entity=Product \
  --type=ProductDto \
  --endpoints="findAll,findById,create,update,delete,findByCategory,updateStock"
```

### Passo 3: Gerar Sistema de Usuários
```bash
# Formulário de Clientes
npm run dev generate form CustomerForm \
  --fields="name:text:Nome,email:email:E-mail,phone:text:Telefone,address:textarea:Endereço,birthDate:date:Nascimento" \
  --validation=yup \
  --required="name,email" \
  --typescript

# Lista de Clientes
npm run dev generate view CustomerListView \
  --entity=Customer \
  --type=crud-list \
  --fields="name,email,phone,createdAt,totalOrders" \
  --filterable="name,email" \
  --export
```

### Passo 4: Dashboard Executivo
```bash
# Dashboard principal
npm run dev generate dashboard ExecutiveDashboard \
  --charts="line:sales,bar:products,pie:categories,area:customers" \
  --metrics="totalRevenue,totalOrders,totalCustomers,averageOrder" \
  --filters="date-range,category" \
  --realtime
```

---

## 🎯 **5. COMANDOS DE BUSCA E AJUDA**

### Busca de Componentes
```bash
# Buscar componentes por categoria
npm run dev search --category=editor
npm run dev search --category=admin
npm run dev search --category=security

# Busca livre
npm run dev search --query="form validation"
npm run dev search --query="data grid"
npm run dev search --query="authentication"

# Listar todas as categorias
npm run dev list categories

# Listar todos os templates
npm run dev list templates
```

### Informações de Ajuda
```bash
# Ajuda geral
npm run dev --help

# Ajuda específica do generate
npm run dev generate --help

# Ajuda específica do query
npm run dev query --help

# Versão e informações
npm run dev --version
npm run dev info
```

---

## 🔧 **6. INTEGRAÇÃO COM CLAUDE CODE**

### Contexto para IA
```bash
# Gerar contexto completo para Claude
npm run dev export context --format=json --output=archbase-context.json

# Exportar apenas componentes específicos
npm run dev export components --category=editor --format=markdown

# Gerar documentação para IA
npm run dev docs generate --target=claude-code --format=structured
```

### Exemplos de Prompt para Claude Code
```markdown
Usando o Archbase CLI V3, ajude-me a:

1. "Criar um formulário de cadastro de usuário com validação"
   → npm run dev query component ArchbaseFormTemplate
   → npm run dev generate form UserForm --validation=yup

2. "Implementar uma lista CRUD com permissões"
   → npm run dev query component ArchbaseDataGrid
   → npm run dev generate view UserListView --permissions

3. "Criar um dashboard com gráficos de vendas"
   → npm run dev generate dashboard SalesDashboard --charts=line,bar
```

---

## 📊 **7. COMPARAÇÃO V2 vs V3**

### Antes (V2)
```bash
# Import monolítico
import { ArchbaseEdit, ArchbaseDataGrid } from 'archbase-react'

# Dependência única
"archbase-react": "^2.1.4"
```

### Agora (V3) ✨
```bash
# Imports organizados por domínio
import { ArchbaseEdit } from '@archbase/components'
import { ArchbaseFormTemplate } from '@archbase/template'
import { ArchbaseAdminMainLayout } from '@archbase/admin'

# Dependências modulares
"@archbase/components": "^3.0.0"
"@archbase/template": "^3.0.0"
"@archbase/admin": "^3.0.0"
```

---

## 🎉 **RESULTADO FINAL**

Com estes comandos, a equipe pode:
- ✅ **Consultar** qualquer um dos 149 componentes V3
- ✅ **Gerar** código modular usando a nova arquitetura
- ✅ **Criar** projetos completos com estrutura organizada
- ✅ **Integrar** perfeitamente com Claude Code
- ✅ **Escalar** desenvolvimento com padrões consistentes

**O Archbase CLI V3 está pronto para acelerar o desenvolvimento da equipe!** 🚀