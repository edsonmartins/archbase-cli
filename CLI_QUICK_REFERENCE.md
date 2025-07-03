# Archbase CLI - Quick Reference

> **Referência rápida de comandos e funcionalidades**

## 🚀 Instalação

```bash
npm install -g @archbase/cli
archbase --version
```

## 📋 Comandos Essenciais

### Query (Consulta)
```bash
# Buscar componente
archbase query component ArchbaseEdit

# Buscar padrões
archbase query pattern "crud with validation"

# Modo JSON para IA
archbase query component FormBuilder --format=json --ai-context
```

### Generate (Gerar)
```bash
# Form básico
archbase generate form UserForm --fields="name,email,password"

# View CRUD
archbase generate view UserList --template=crud --entity=User

# Página com layout
archbase generate page Dashboard --layout=sidebar --with-auth

# Componente customizado
archbase generate component UserCard --type=display --props="name,avatar"
```

### Create (Projetos)
```bash
# Listar boilerplates
archbase create list-boilerplates

# Criar projeto
archbase create project MyApp --boilerplate=admin-dashboard

# Modo interativo
archbase create project MyApp --boilerplate=admin-dashboard --interactive
```

### Knowledge (Conhecimento)
```bash
# Escanear componentes
archbase knowledge scan ./src/components

# Validar base
archbase knowledge validate

# Exportar docs
archbase knowledge export --format=markdown
```

## 🎨 Templates Disponíveis

### Forms
- `basic` - Formulário simples
- `validation` - Com validação Yup/Zod
- `wizard` - Multi-step wizard

### Views
- `list` - Lista com filtros e paginação
- `crud` - CRUD completo com modal
- `dashboard` - Dashboard com métricas

### Pages
- `sidebar` - Layout com sidebar
- `header` - Layout com header
- `blank` - Layout limpo
- `dashboard` - Layout para dashboards

### Components
- `display` - Componentes de exibição
- `input` - Componentes de entrada
- `layout` - Componentes de layout
- `functional` - Componentes funcionais

## 🏗️ Boilerplates

### Admin Dashboard
```bash
archbase create project MyAdmin --boilerplate=admin-dashboard
```
**Inclui**: Auth, Users, Dashboard, Settings, Reports (opcional)

### Configuração Rápida
```json
{
  "projectName": "MyApp",
  "features": ["authentication", "user-management", "dashboard"],
  "database": "postgresql",
  "apiUrl": "http://localhost:3001/api"
}
```

## 🤖 Integração IA

### Modo AI
```bash
archbase --ai-mode query suggest-components "user registration"
```

### Saída Estruturada
```bash
archbase query component FormBuilder --format=json --ai-context
```

### Workflow Claude Code
1. Query components
2. Generate base code
3. Customize as needed

## ⚡ Exemplos Práticos

### Dashboard Completo (2 minutos)
```bash
archbase create project AdminPanel --boilerplate=admin-dashboard
cd AdminPanel && npm install && npm run dev
```

### CRUD de Usuários
```bash
archbase generate view UserList --template=crud --entity=User
archbase generate form UserForm --fields="name,email,role" --validation=yup
```

### Componente Customizado
```bash
archbase generate component ProductCard \
  --type=display \
  --props="title:string,price:number,image:string" \
  --with-state
```

## 🔧 Troubleshooting

```bash
# Debug mode
DEBUG=archbase:* archbase generate form Test

# Cache limpo
rm -rf ~/.archbase/cache

# Verificar instalação
archbase --version
```

## 📁 Estrutura Gerada

```
projeto/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── pages/         # Páginas da aplicação
│   ├── layouts/       # Layouts
│   ├── hooks/         # Custom hooks
│   ├── services/      # APIs
│   ├── store/         # Estado global
│   ├── utils/         # Utilitários
│   └── types/         # Tipos TS
├── tests/             # Testes
└── .env              # Config
```

## 🎯 Melhores Práticas

1. **Sempre use TypeScript**: `--typescript` (padrão)
2. **Inclua testes**: `--test` para componentes críticos
3. **Use validação**: Yup ou Zod para formulários
4. **Organize por feature**: Separe por domínio/módulo
5. **Configure .archbaserc.json**: Padrões do projeto

---

**💡 Dica**: Use `--dry-run` para preview antes de gerar!