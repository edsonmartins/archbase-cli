# Archbase CLI

> AI-friendly CLI tool for Archbase React V3 ecosystem component querying and code generation

## Overview

Archbase CLI is a powerful, AI-friendly development tool that bridges the gap between Java backend development and modern TypeScript/React frontends. It solves the problem of AI assistants not knowing custom libraries by providing a structured interface for querying component information and generating production-ready code based on tested patterns from real projects.

**Key Innovation**: Complete domain-driven development workflow from Java classes to production-ready React components using Archbase React V3 modular architecture, following established patterns from powerview-admin.

**V3 Architecture**: Built on Archbase React V3's modular package system (@archbase/core, @archbase/components, @archbase/security, etc.) for better tree-shaking, reduced bundle sizes, and improved maintainability.

## Features

- 🔍 **Component Query** - Search and get detailed information about Archbase V3 components
- 🏗️ **Code Generation** - Generate forms, views, pages, components, navigation and security components from V3 templates
- 🎯 **Domain-Driven Development** - Generate TypeScript DTOs from Java classes with full type safety
- 🔄 **Java-to-TypeScript** - Automatic conversion with validation decorators and enum support
- 📊 **DTO-Based Generation** - Create forms and views directly from existing DTOs
- 🔒 **Security Components** - Generate login views, user management, API tokens using @archbase/security
- 🔧 **Service Generation** - Generate remote services with Java controller analysis using @archbase/data
- 🚀 **Project Scaffolding** - Create complete V3 projects from boilerplates (local and remote)
- 🤖 **AI-Friendly** - Optimized outputs for AI consumption and integration
- 📚 **Knowledge Base** - V3 component analysis with manual curation support
- 🎯 **Production Patterns** - Templates based on real powerview-admin V3 patterns
- 📱 **ArchbaseDataSource V2** - Full support for modern data source patterns with @archbase/data
- 🔍 **Advanced Scanning** - Real-time V3 component analysis and pattern detection
- 🔄 **Migration Tools** - Automated V1→V2→V3 migration with AST transformations
- 🔌 **Plugin System** - Extensible architecture for custom generators, commands, and analyzers
- ⚡ **Modular Packages** - V3 architecture with @archbase/* packages for optimal tree-shaking

## Installation

### From NPM (Coming Soon)
```bash
npm install -g @archbase/cli
```

### From Source (Development)
```bash
# Clone and build
git clone https://github.com/edsonmartins/archbase-cli.git
cd archbase-cli
npm install
npm run build
npm link

# Verify installation
archbase --version
```

### From Release Package
```bash
# Download the .tgz file from releases
npm install -g ./archbase-cli-0.1.4.tgz
```

📚 **For detailed compilation and distribution instructions, see [Compilation and Distribution Guide](docs/compilation-and-distribution.md)**

## Domain-Driven Development Workflow

Archbase CLI implements a complete workflow from Java backend entities to production-ready React components:

```bash
# 1. Generate TypeScript DTOs from Java entities
archbase generate domain UserDto --java-text ./User.java --output ./src/domain

# 2. Generate remote services with Java controller analysis
archbase generate service UserRemoteService --entity User --type UserDto --java ./UserController.java

# 3. Create forms with DataSource V2 integration
archbase generate form UserForm --dto ./src/domain/UserDto.ts --category=usuarios

# 4. Generate CRUD list views with permissions
archbase generate view UserView --dto ./src/domain/UserDto.ts --category=usuarios

# 5. Create navigation items with proper routing
archbase generate navigation UserNavigation --category=usuarios --with-view --with-form --icon=IconUser
```

**Generated Output:**
- ✅ TypeScript DTOs with validation decorators
- ✅ Remote services with Java controller method analysis
- ✅ Enums with utility functions and UI rendering configs
- ✅ Forms using ArchbaseFormTemplate (real pattern)
- ✅ CRUD views with ArchbaseGridTemplate + ArchbaseViewSecurityProvider
- ✅ Navigation items following `/admin/{category}/{feature}` pattern

## Quick Start

```bash
# Query component information
archbase query component ArchbaseEdit

# Generate a form with DataSource V2 (with enhanced type mapping)
archbase generate form UserRegistration --fields=name:text,email:email,password:password --datasource-version=v2

# Generate a CRUD list view (with fixed JSX rendering)
archbase generate view UserManagement --category=usuarios --feature=usuario --with-permissions

# Generate navigation items
archbase generate navigation UserNavigation --category=usuarios --with-view --with-form --icon=IconUser

# Generate DTOs from field specifications (with smart type mapping)
archbase generate domain ProductDto --fields="id:number,name:text,price:decimal,status:enum" --enums="ProductStatus:ACTIVE,INACTIVE,DISCONTINUED"

# Generate forms and views from field specifications (production-ready)
archbase generate form ProductForm --fields="id:number,name:text,price:decimal,status:enum" --category=produtos
archbase generate view ProductView --fields="id:number,name:text,price:decimal,status:enum" --category=produtos --with-permissions

# Validate generated code (recommended)
archbase validate file ./src/domain/ProductDto.ts
archbase validate file ./src/forms/ProductForm.tsx
archbase validate file ./src/views/ProductView.tsx

# Generate DTOs from Java classes
archbase generate domain ProdutoDto --java-text /path/to/Produto.java --output ./src/domain

# Generate remote services
archbase generate service ClienteRemoteService --entity Cliente --type ClienteDto --java ./ClienteController.java
archbase generate service ProdutoRemoteService --entity Produto --type ProdutoDto --endpoint /api/produtos

# Generate security components (V3)
archbase generate security AdminLogin --type=login --with-mobile --with-branding
archbase generate security UserManager --type=user-management --features=user-activation,user-roles
archbase generate security SecurityView --type=security-management --features=custom-permissions,audit-log
archbase generate security ApiTokenView --type=api-tokens --features=token-regeneration

# Use interactive wizard for guided setup (NEW!)
archbase create project MyApp --wizard

# Create a project with V3 packages and security features
archbase create project MyApp --project-type=admin --features=auth,data-grid,file-export,security-management,api-token-management --author="Your Name"

# Create a basic project with core dependencies only
archbase create project BasicApp --project-type=basic

# Create a full-featured project with all capabilities
archbase create project AdvancedApp --project-type=full --features=rich-text,charts,pdf,image-crop

# Generate only package.json with dependencies (for existing projects)
archbase create package-json --name=ExistingApp --project-type=admin --features=auth,data-grid --output=./my-project
```

## Commands

### Query Commands

```bash
# Get component information
archbase query component <name> [--ai-context] [--format=json]

# Search for patterns
archbase query pattern "crud with validation" [--category=forms]

# Find examples
archbase query examples [--component=DataTable] [--tag=filtering]

# Free-form search
archbase query search "how to implement user registration"
```

### Generate Commands

```bash
# Generate form with DataSource V2
archbase generate form <name> --fields=<fields> [--datasource-version=v2] [--validation=yup|zod]
archbase generate form UserForm --fields=name:text,email:email --category=usuarios --feature=usuario

# Generate CRUD list view
archbase generate view <name> [--category=<category>] [--feature=<feature>] [--with-permissions]
archbase generate view UserView --category=usuarios --with-permissions --with-filters

# Generate navigation items
archbase generate navigation <name> --category=<category> [--with-view] [--with-form] [--icon=<icon>]
archbase generate navigation UserNavigation --category=usuarios --with-view --icon=IconUser

# Generate page
archbase generate page <name> --layout=sidebar --components=<list>

# Generate component
archbase generate component <name> --type=display --props=<props>

# Generate DTOs and enums from Java or field specifications
archbase generate domain <name> [--java-text <file-or-text>] [--fields <fields>] [--enums <enums>]
archbase generate domain UserDto --fields=name:String,email:String --enums=StatusUser:ATIVO,INATIVO
archbase generate domain ProdutoDto --java-text ./Produto.java --with-audit-fields

# Generate from DTOs
archbase generate form <name> --dto <dto-file> [--category <category>]
archbase generate view <name> --dto <dto-file> [--category <category>]

# Generate remote services
archbase generate service <name> --entity <entity> --type <type> [--java <controller>] [--dto] [--wizard]
archbase generate service ClienteRemoteService --entity Cliente --type ClienteDto --java ./ClienteController.java
archbase generate service ProdutoRemoteService --entity Produto --type ProdutoDto --endpoint /api/produtos --dto

# Generate security components
archbase generate security <name> --type <type> [--features <features>] [--with-mobile] [--with-branding]
archbase generate security AdminLogin --type=login --with-mobile --with-branding --brand-name="MyApp"
archbase generate security Security --type=security-management --features=custom-permissions,audit-log
archbase generate security UserAdmin --type=user-management --features=user-activation,user-roles
archbase generate security ApiTokens --type=api-tokens --features=token-regeneration
archbase generate security CustomAuth --type=authenticator --features=password-reset,logout
```

### Create Commands

```bash
# Interactive wizard for guided project creation (RECOMMENDED!)
archbase create project <name> --wizard

# Create project with automatic Archbase dependencies
archbase create project <name> --project-type=<basic|admin|full> [--features=<features>] [--author=<author>]

# Create project from local boilerplate (with dependencies)
archbase create project <name> --boilerplate=<template> --project-type=admin --features=auth,data-grid

# Create project from Git repository (with dependencies)
archbase create project <name> --git <url> --project-type=full --features=rich-text,charts,pdf

# Create project from npm package (with dependencies)
archbase create project <name> --npm <package> --project-type=basic

# Generate package.json with Archbase dependencies (standalone)
archbase create package-json --name=<name> --project-type=<type> [--features=<features>] [--output=<dir>]

# Scaffold a full feature module (domain + service + view + form)
archbase create module <name> --with=crud [--fields="name:text,price:number"] [--endpoint=/api/v1/products] [--dto-style=class|interface] [--output=./src]
archbase create module Product --with=crud --fields="name:text,price:number,active:boolean"

# List boilerplates
archbase create list-boilerplates [--category=admin]
```

**Project Types:**
- `basic` - Core Archbase V3 packages (@archbase/*) + Mantine 9.x
- `admin` - Basic + data grids, authentication, file export
- `full` - Admin + rich text, charts, PDF, image processing, color picker

**Available Features:**
- `rich-text` - TipTap editor with Mantine integration
- `data-grid` - Advanced data tables (Material-UI, Mantine React Table)
- `auth` - JWT authentication and cookie management
- `file-export` - CSV, Excel export capabilities
- `pdf` - PDF generation with jsPDF
- `charts` - D3.js and React Konva for visualization
- `image-crop` - Image cropping and processing
- `input-mask` - Input masking for phones, documents
- `color-picker` - Color selection components
- `security-management` - Complete user management using @archbase/security-ui (V3)
- `api-token-management` - API token generation and management using @archbase/security-ui (V3)

### Interactive Wizard (NEW!)

For complex projects or when you need guidance choosing the right configuration, use the interactive wizard:

```bash
archbase create project MyApp --wizard
```

The wizard will guide you through:

1. **📋 Project Information** - Name, description, author
2. **🏗️ Project Architecture** - Basic, Admin, or Full with detailed explanations
3. **🎛️ Features & Capabilities** - Select additional features with descriptions
4. **⚙️ Development Setup** - TypeScript, Git, auto-install options
5. **🔧 Additional Configuration** - API URLs, authentication, database type, deployment target
6. **📋 Confirmation** - Review all choices before creation

**Benefits of the Wizard:**
- 📖 **Detailed Explanations** - Each option includes helpful descriptions
- 🎯 **Guided Decisions** - No need to memorize all available options
- ⚙️ **Complete Setup** - Generates environment files, Git repo, installs dependencies
- 📄 **Project Summary** - Creates detailed documentation of your choices
- 🚀 **Ready to Use** - Complete project structure with working code

**Generated Files:**
- Complete project structure with components, pages, utils
- Environment configuration (.env files)
- Git repository (optional)
- PROJECT-SUMMARY.md with detailed configuration
- Working React app with Archbase components

### Remote Boilerplates

Archbase CLI supports downloading and using boilerplates from remote sources:

```bash
# From GitHub repository
archbase create project MyApp --git https://github.com/user/react-starter.git

# From specific branch and subfolder
archbase create project MyApp --git https://github.com/user/monorepo.git --branch develop --subfolder templates/frontend

# From npm package
archbase create project MyApp --npm create-react-app-template

# From scoped npm package
archbase create project MyApp --npm @company/frontend-template
```

### Cache Management

```bash
# List cached remote boilerplates
archbase cache list [--detailed]

# Show cache information
archbase cache info

# Clear all cache
archbase cache clear

# Remove specific cached boilerplate
archbase cache remove <name>
```

## Advanced Component Analysis

Archbase CLI provides powerful tools for analyzing existing projects and identifying improvement opportunities:

### Project Scanning

```bash
# Complete project analysis
archbase scan project ./my-project --report --output ./scan-report.json

# Component-specific analysis
archbase scan components ./src --component ArchbaseEdit --detailed

# Real-time monitoring during development
archbase scan watch ./src --auto-fix --verbose
```

**Features:**
- **AST Analysis**: Deep analysis using Babel parser for accurate detection
- **Pattern Detection**: Identifies implemented and missing patterns
- **Issue Detection**: Finds configuration problems and optimization opportunities
- **V1/V2 Detection**: Automatically identifies DataSource versions
- **Real-time Feedback**: Live analysis during file changes

### Migration Tools

Automated migration between Archbase versions with intelligent code transformation:

```bash
# Analyze migration opportunities
archbase migrate analyze ./my-project --report

# Automatic V1→V2 migration
archbase migrate v1-to-v2 ./src --backup --dry-run

# Batch migration with advanced options
archbase migrate batch ./my-project --exclude-complex --report
```

**Migration Features:**
- **AST Transformations**: Safe code transformations using Babel
- **Complexity Analysis**: Classifies migrations as simple/medium/complex
- **Automated V1→V2**: Converts ArchbaseDataSource to ArchbaseRemoteDataSource
- **Backup & Rollback**: Automatic backup creation and safety checks
- **Incremental Migration**: Step-by-step migration with validation

**Migration Rules:**
- ✅ **DataSource V1→V2**: ArchbaseDataSource → ArchbaseRemoteDataSource
- ✅ **Remove forceUpdate**: Automatic removal of manual update calls
- ✅ **Form Validation**: Update validation prop patterns
- ✅ **Event Handlers**: Migrate event handler naming conventions

### Health Monitoring

```bash
# Project health assessment
archbase scan health ./my-project --fix

# Continuous monitoring in CI/CD
archbase scan project . --report --output ./ci-scan-results.json
```

**Health Metrics:**
- **Component Health**: V1/V2 ratio, missing props, deprecated patterns
- **Pattern Compliance**: Implementation of recommended patterns
- **Dependency Health**: Missing or outdated dependencies
- **Code Quality Score**: Overall project health assessment (0-100)

## AI Integration

Archbase CLI is designed to work seamlessly with AI assistants like Claude Code:

```bash
# AI-optimized output
archbase query component FormBuilder --ai-context --format=json

# AI mode for structured responses
archbase --ai-mode query suggest-components "user registration form"
```

## Configuration

Create `.archbaserc.json` in your project:

```json
{
  "version": "1.0.0",
  "archbaseReactVersion": "^4.0.0",
  "defaultTemplate": "typescript",
  "outputDir": "./src",
  "structure": {
    "components": "./src/components",
    "views": "./src/views",
    "pages": "./src/pages",
    "forms": "./src/forms",
    "navigation": "./src/navigation"
  },
  "preferences": {
    "typescript": true,
    "includeTests": true,
    "validationLibrary": "yup",
    "datasourceVersion": "v2",
    "adminRoutePattern": "/admin/{category}/{feature}"
  }
}
```

## Development

```bash
# Clone repository
git clone https://github.com/edsonmartins/archbase-cli.git
cd archbase-cli

# Install dependencies
npm install

# Build
npm run build

# Run in development
npm run dev

# Type-check
npm run typecheck

# Test (Vitest)
npm test            # run once
npm run test:watch  # watch mode
```

## Generators Reference

### DomainGenerator
Generate TypeScript DTOs and enums from Java classes or field specifications with intelligent type mapping.

**From Java Classes:**
```bash
# From file path
archbase generate domain ProductDto --java-text ./Product.java

# From direct Java code
archbase generate domain UserDto --java-text "
public class User {
    @NotEmpty private String name;
    @Email private String email;
    private StatusUser status;
}
enum StatusUser { ACTIVE, INACTIVE }"
```

**From Field Specifications (Enhanced Type Mapping):**
```bash
# CLI field types automatically map to TypeScript types
archbase generate domain ProductDto \
  --fields="id:number,name:text,price:decimal,status:enum,active:boolean" \
  --enums="ProductStatus:ACTIVE,INACTIVE,DISCONTINUED" \
  --with-audit-fields --with-validation
```

**Type Mapping:**
- `text` → `string` (text fields)
- `number` → `number` (numeric fields) 
- `decimal` → `number` (decimal/currency fields)
- `enum` → `ProductStatus` (specific enum types)
- `boolean` → `boolean` (boolean fields)
- `date` → `string` (date fields)
- `datetime` → `string` (datetime fields)

**Enhanced Features:**
- **Smart Enum Resolution**: `enum` fields automatically map to specific enum types (e.g., `ProductStatus`)
- **Duplicate Prevention**: Audit fields are filtered when user provides conflicting field names
- **Validation Integration**: Automatic validation decorators based on field types
- **Constructor Logic**: Proper field initialization with type safety

**Generates:**
- `ProductDto.ts` - DTO class with proper TypeScript types and validation decorators
- `ProductStatus.ts` - Enum with utility functions  
- `ProductStatusValues.ts` - UI rendering configurations for dropdowns and displays

### FormGenerator
Generate forms with DataSource V2 integration following powerview-admin patterns and enhanced import handling.

**From DTO:**
```bash
archbase generate form UserForm \
  --dto ./src/domain/UserDto.ts \
  --category=usuarios --feature=usuario
```

**From Fields (Enhanced Type Support):**
```bash
archbase generate form ProductForm \
  --fields="id:number,name:text,price:decimal,status:enum,category:text" \
  --datasource-version=v2 --validation=yup
```

**Enhanced Features (v0.1.3):**
- **Proper Import Generation**: Automatic React and Archbase component imports
- **TypeScript Interface Generation**: Forms now include proper TypeScript interfaces with correct type mapping
- **Enhanced Type Support**: CLI field types (`text`, `decimal`, `enum`) correctly map to TypeScript types
- **Validation Integration**: Seamless Yup/Zod integration with proper import statements
- **Component Selection**: Intelligent component selection based on field types

**Core Features:**
- ArchbaseFormTemplate integration (not FormBuilder)
- DataSource V2 with `useArchbaseRemoteDataSource`
- Admin routing `/admin/{category}/{feature}`
- Validation with Yup/Zod
- TypeScript with proper DTO imports

**Generated Structure (canonical V3 pattern):**
```tsx
import React, { useCallback } from 'react';
import * as yup from 'yup';
import { ArchbaseEdit, ArchbaseNumberEdit } from '@archbase/components';
import { ArchbaseFormTemplate } from '@archbase/template';
import {
  useArchbaseRemoteDataSource,
  useArchbaseRemoteServiceApi,
  useArchbaseStore
} from '@archbase/data';
import { useArchbaseValidator } from '@archbase/core';
import { ProductDto } from '../../domain/ProductDto';
import { ProductService } from '../../services/ProductService';
import { API_TYPE } from '../../ioc/IOCTypes';

export function ProductForm() {
  const serviceApi = useArchbaseRemoteServiceApi<ProductService>(API_TYPE.Product);
  const { dataSource, isLoading } = useArchbaseRemoteDataSource<ProductDto, string>({
    name: 'dsProduct', service: serviceApi, /* ... */
  });

  return (
    <ArchbaseFormTemplate dataSource={dataSource} isLoading={isLoading}>
      <ArchbaseEdit<ProductDto, string> label="Name" dataSource={dataSource} dataField="name" required />
      <ArchbaseNumberEdit<ProductDto, number> label="Price" dataSource={dataSource} dataField="price" />
    </ArchbaseFormTemplate>
  );
}
```

### ViewGenerator
Generate CRUD list views with **ArchbaseGridTemplate** wrapped in **ArchbaseViewSecurityProvider** and permission-aware actions, following the real reference admin projects.

**From DTO:**
```bash
archbase generate view UserView \
  --dto ./src/domain/UserDto.ts \
  --category=usuarios --with-permissions
```

**From Fields (Enhanced JSX Rendering):**
```bash
archbase generate view ProductView \
  --fields="id:number:100,name:text:200,price:decimal:120,status:enum:120,category:text:150" \
  --with-filters --with-pagination --page-size=25
```

**Core Features:**
- **ArchbaseGridTemplate**: high-level grid template (toolbar, paging, row actions) instead of hand-wiring ArchbaseDataGrid
- **Security provider**: view wrapped in `ArchbaseViewSecurityProvider` with `useArchbaseSecureForm` for `canCreate/canEdit/canDelete`
- **DataSource V2**: `useArchbaseRemoteDataSourceV2` bound to the entity service
- **Column definitions**: `<Columns>` + one `ArchbaseDataGridColumn` per field, with type-aware `dataType`
- **Navigation cleanup**: `useArchbaseNavigationListener` clears the store on leave

**Generated JSX Example:**
```tsx
export function ProductView() {
  return (
    <ArchbaseViewSecurityProvider resourceName="product" resourceDescription="Product">
      <ProductViewContent />
    </ArchbaseViewSecurityProvider>
  );
}

function ProductViewContent() {
  const { canCreate, canEdit, canDelete } = useArchbaseSecureForm('product', 'Product');
  const serviceApi = useArchbaseRemoteServiceApi<ProductService>(API_TYPE.Product);
  const { dataSource, isLoading, error } = useArchbaseRemoteDataSourceV2<ProductDto>({
    name: 'dsProduct', service: serviceApi, pageSize: 25, /* ... */
  });
  const columns = useMemo(() => (
    <Columns>
      <ArchbaseDataGridColumn<ProductDto> dataField="price" dataType="number" header="Price" size={120} />
    </Columns>
  ), []);

  return (
    <ArchbaseGridTemplate<ProductDto, string>
      dataSource={dataSource}
      columns={columns}
      isLoading={isLoading}
      isError={!!error}
      getRowId={(row) => row.id}
    />
  );
}
```

### NavigationGenerator
Generate navigation items with route constants and i18n integration.

```bash
archbase generate navigation UserNavigation \
  --category=usuarios --feature=usuario \
  --with-view --with-form \
  --icon=IconUser --color=blue
```

**Generates:**
- Navigation item definitions
- Route constants with helper functions
- i18n integration with `mentors:` prefix
- Support for grouped menu items

### ServiceGenerator
Generate remote services following the Archbase pattern with optional Java controller analysis.

**Basic Service Structure:**
```bash
# Generate basic service with inheritance only
archbase generate service ProdutoRemoteService \
  --entity Produto --type ProdutoDto \
  --endpoint /api/produtos --id-type string
```

**With Java Controller Analysis:**
```bash
# Analyze Java controller and generate custom methods
archbase generate service ClienteRemoteService \
  --entity Cliente --type ClienteDto \
  --java ./ClienteController.java --dto
```

**Interactive Wizard:**
```bash
# Use wizard for guided setup
archbase generate service UserRemoteService --wizard
```

**Generated Structure:**
```typescript
@injectable()
export class ClienteRemoteService extends ArchbaseRemoteApiService<ClienteDto, string> {
    constructor(@inject(ARCHBASE_IOC_API_TYPE.ApiClient) client: ArchbaseRemoteApiClient) {
        super(client);
    }

    // Required method implementations
    configureHeaders(): Record<string, string> { return {}; }
    transform(data: any): ClienteDto { return new ClienteDto(data); }
    getEndpoint(): string { return '/api/clientes'; }
    getId(entity: ClienteDto): string { return entity.id; }
    isNewRecord(entity: ClienteDto): boolean { return !entity.id || entity.id === ''; }

    // Standard CRUD methods
    async delete<R>(id: string): Promise<R> { /* ... */ }
    async findOne(id: string): Promise<ClienteDto> { /* ... */ }

    // Custom methods from Java controller (if provided)
    async buscarPorCpf(cpf: string): Promise<ClienteDto> { /* ... */ }
    async listarAtivos(page: number, size: number): Promise<ClienteDto[]> { /* ... */ }
}
```

**Java Controller Analysis Features:**
- **Method Extraction**: Analyzes `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`
- **Parameter Analysis**: Handles `@PathVariable`, `@RequestParam`, `@RequestBody`
- **Type Conversion**: Maps Java types to TypeScript (String → string, List<ClienteDto> → ClienteDto[])
- **Endpoint Building**: Constructs API endpoints with path variables
- **HTTP Method Detection**: Automatically maps annotations to HTTP methods

**Supported Java Annotations:**
- `@GetMapping("/path")` → GET requests
- `@PostMapping("/path")` → POST requests with body
- `@PutMapping("/path")` → PUT requests with body
- `@DeleteMapping("/path")` → DELETE requests
- `@PathVariable` → URL path parameters
- `@RequestParam` → Query parameters
- `@RequestBody` → Request body content

**Options:**
- `--entity`: Entity name (e.g., Cliente, Produto)
- `--type`: DTO type (e.g., ClienteDto, ProdutoDto)
- `--id-type`: ID type (default: string, options: string, number)
- `--endpoint`: API endpoint (default: auto-generated)
- `--java`: Java controller file path or code
- `--dto`: Also generate basic DTO
- `--wizard`: Use interactive wizard
- `--output`: Output directory

**Generated Files:**
- `services/[ServiceName].ts` - The remote service class
- `dto/[EntityName]Dto.ts` - Basic DTO (if --dto flag used)

### SecurityGenerator (V3)
Generate complete security infrastructure using Archbase React V3 @archbase/security package, including login views, user management, API tokens, and authentication components.

**Login Views:**
```bash
# Desktop and mobile login views
archbase generate security AdminLogin \
  --type=login --with-mobile --with-branding \
  --brand-name="MyApp" --logo-path="/assets/logo.png"

# Features: password-remember, forgot-password, branding
```

**Security Management:**
```bash
# Complete security management interface
archbase generate security Security \
  --type=security-management \
  --features=custom-permissions,audit-log,export-users
```

**User Management:**
```bash
# User CRUD with roles and permissions
archbase generate security UserAdmin \
  --type=user-management \
  --features=user-activation,user-roles,bulk-operations
```

**API Token Management:**
```bash
# API token generation and management
archbase generate security ApiTokens \
  --type=api-tokens \
  --features=token-regeneration,token-scopes
```

**Authentication Infrastructure:**
```bash
# Custom authenticator with IoC container
archbase generate security CustomAuth \
  --type=authenticator \
  --features=password-reset,logout,change-password \
  --authenticator-class=MyAuthenticator \
  --user-class=MyUser
```

**Generated Files** (each `--type` produces the corresponding component):
- `--type=login` → `LoginView.tsx`
- `--type=security-management` → `SecurityView.tsx` (uses `ArchbaseSecurityView`)
- `--type=user-management` → `UserManagementView.tsx` with full CRUD interface
- `--type=api-tokens` → `ApiTokenManagementView.tsx` (uses `ArchbaseApiTokenView`)
- `--type=authenticator` → `Authenticator.ts` with IoC setup

**V3 Security Features:**
- **ArchbaseSecurityView**: Complete user management interface from @archbase/security-ui
- **ArchbaseApiTokenView**: API token management (from @archbase/security-ui) with generation and revocation
- **JWT Authentication**: Complete implementation with refresh tokens
- **Role-based Security**: Permission checking throughout all views
- **Mobile Support**: Dedicated responsive mobile login views
- **Secure Token Display**: Visibility controls and copy-to-clipboard
- **User Activation**: Enable/disable user accounts
- **API Token Scopes**: Granular permission control for API access
- **IoC Integration**: Proper dependency injection with Inversify
- **Audit Support**: User action logging and export capabilities
- **Modern UI**: Mantine components with consistent styling
- **Modular Architecture**: Tree-shakable @archbase/security package

**Boilerplate Integration:**
The admin-dashboard boilerplate now includes optional security features that can be enabled during project creation:

```bash
# Create admin project with security features
archbase create project MyAdminApp --boilerplate admin-dashboard --features security-management,api-token-management,authentication,dashboard

# Generated navigation automatically includes:
# - Gerenciar Usuários (ArchbaseSecurityView)
# - Tokens de API (ArchbaseApiTokenView)
# - Proper routing and icons
```

**Generated Security Components:**
- `SecurityView.tsx` - Uses ArchbaseSecurityView for complete user management
- `ApiTokenView.tsx` - Uses ArchbaseApiTokenView for token lifecycle management
- Navigation items with proper icons (IconShield, IconKey)
- Category-based organization in "Segurança" section

## Production-Ready Templates

All generators follow real patterns from powerview-admin:

#### FormGenerator
- **DataSource V2 Support**: Modern `useArchbaseRemoteDataSource` hooks
- **ArchbaseFormTemplate**: Real form components, not fictional FormBuilder
- **Admin Navigation**: Follows `/admin/{category}/{feature}` pattern
- **Validation**: Yup/Zod integration with proper error handling
- **TypeScript**: Full type safety with DTOs and interfaces

#### ViewGenerator  
- **CRUD List Views**: `ArchbaseGridTemplate` with built-in toolbar and row actions
- **Permission-Based UI**: `ArchbaseViewSecurityProvider` + `useArchbaseSecureForm` (`canCreate/canEdit/canDelete`)
- **Navigation Integration**: Proper route handling and store cleanup via `useArchbaseNavigationListener`
- **Filter/Pagination**: Built-in filtering and pagination support
- **Row Actions**: View/Edit/Delete with confirmation dialogs

#### NavigationGenerator
- **ArchbaseNavigationItem**: Complete navigation item definitions
- **Route Constants**: Helper functions for route management
- **i18n Integration**: Proper internationalization keys
- **Icon Support**: Tabler icons with proper styling
- **Sidebar/Hidden Items**: Forms hidden from sidebar, views shown

#### SecurityGenerator
- **JWT Authentication**: Complete ArchbaseAuthenticator implementation
- **Login Views**: Desktop and mobile responsive designs with branding
- **Security Management**: ArchbaseSecurityView integration with permissions
- **User Management**: Full CRUD with ArchbaseDataGrid and role management
- **API Token Management**: Secure token generation with scopes and regeneration
- **IoC Container**: Proper dependency injection setup with Inversify
- **Modern Styling**: Responsive design with Mantine components and CSS modules

### Usage Examples

```bash
# Complete workflow: Java → DTO → Services → Forms/Views → Navigation
archbase generate domain UserDto --java-text ./User.java --output ./src/domain
archbase generate service UserRemoteService --entity User --type UserDto --java ./UserController.java
archbase generate form UserForm --dto ./src/domain/UserDto.ts --category=usuarios
archbase generate view UserView --dto ./src/domain/UserDto.ts --category=usuarios  
archbase generate navigation UserNavigation --category=usuarios --with-view --with-form --icon=IconUser

# Complete security infrastructure
archbase generate security AdminLogin --type=login --with-mobile --with-branding --brand-name="MyApp"
archbase generate security Security --type=security-management --features=custom-permissions,audit-log
archbase generate security UserAdmin --type=user-management --features=user-activation,user-roles
archbase generate security ApiTokens --type=api-tokens --features=token-regeneration
archbase generate security CustomAuth --type=authenticator --authenticator-class=MyAuthenticator

# Field-based generation with proper type mapping
archbase generate domain ProductDto --fields="id:number,name:text,price:decimal,status:enum,category:text" --enums="ProductStatus:ACTIVE,INACTIVE,DISCONTINUED"
archbase generate form ProductForm --fields="id:number,name:text,price:decimal,status:enum,category:text" --category=produtos
archbase generate view ProductView --fields="id:number,name:text,price:decimal,status:enum,category:text" --category=produtos --with-permissions

# Validate generated code
archbase validate file ./src/domain/ProductDto.ts
archbase validate file ./src/forms/ProductForm.tsx
archbase validate file ./src/views/ProductView.tsx
```

## Plugin System

Archbase CLI features a powerful plugin system that allows extending functionality without modifying core code:

### Plugin Management

```bash
# List available plugins
archbase plugin list

# Install a plugin
archbase plugin install archbase-cli-plugin-storybook

# Create your own plugin
archbase plugin create my-custom-plugin --template generator

# Enable/disable plugins
archbase plugin enable my-plugin
archbase plugin disable my-plugin

# Configure plugins
archbase plugin config my-plugin --set apiKey=abc123
```

### Plugin Types

**Generator Plugins**: Add custom code generators
```bash
archbase generate my-component UserCard --props="name:string,age:number"
```

**Command Plugins**: Add custom CLI commands
```bash
archbase my-custom-command --option value
```

**Analyzer Plugins**: Add custom project analyzers
```bash
archbase scan project . --analyzer my-analyzer
```

**Boilerplate Plugins**: Add custom project templates
```bash
archbase create project MyApp --template my-template
```

### Developing Plugins

```typescript
// Basic plugin structure
export default function createPlugin(): Plugin {
  return {
    metadata: {
      name: 'my-plugin',
      version: '1.0.0',
      description: 'My custom plugin'
    },

    async activate(context: PluginContext): Promise<void> {
      // Register generators, commands, analyzers
      context.registerGenerator('my-component', new MyGenerator());
      context.registerCommand(new MyCommand());
    }
  };
}
```

**Plugin Features:**
- **Automatic Discovery**: Plugins are discovered automatically from multiple sources
- **Type Safety**: Full TypeScript support with proper typing
- **Hot Loading**: Plugins can be enabled/disabled without restart
- **Configuration**: Per-plugin configuration with CLI management
- **Validation**: Automatic validation of plugin structure and dependencies

## Command Reference

### Scanning Commands

```bash
# Project analysis
archbase scan project <path> [--report] [--output path] [--deep] [--fix] [--dry-run]

# Component analysis  
archbase scan components <path> [--component name] [--format table|json|csv] [--detailed]

# Migration analysis
archbase scan migration <path> [--component name] [--auto-migrate] [--dry-run]

# Health check
archbase scan health <path> [--fix]

# Real-time monitoring
archbase scan watch <path> [--patterns glob] [--auto-fix] [--verbose] [--debounce ms]
```

### Migration Commands

```bash
# Migration analysis
archbase migrate analyze <path> [--component name] [--report] [--output path]

# V1 to V2 migration
archbase migrate v1-to-v2 <path> [--component name] [--dry-run] [--backup] [--include patterns] [--exclude patterns]

# Batch migration
archbase migrate batch <path> [--rules ids] [--exclude-complex] [--dry-run] [--report] [--output path]
```

### Plugin Commands

```bash
# Plugin management
archbase plugin list [--installed] [--format table|json]
archbase plugin install <plugin> [--global] [--local]
archbase plugin uninstall <plugin> [--global]
archbase plugin enable <plugin>
archbase plugin disable <plugin>

# Plugin development
archbase plugin create <name> [--template basic|generator|analyzer|command]
archbase plugin info <plugin>
archbase plugin config <plugin> [--set key=value] [--get key] [--list]
```

**Migration Options:**
- `--dry-run`: Preview changes without applying them
- `--backup`: Create backup files (.backup extension)
- `--exclude-complex`: Skip complex migrations requiring manual review
- `--rules`: Apply specific migration rules (comma-separated)
- `--component`: Focus on specific component type

### Integration Examples

**CI/CD Pipeline:**
```yaml
# .github/workflows/archbase-quality.yml
- name: Archbase Quality Check
  run: |
    archbase scan project . --report --output ./quality-report.json
    archbase migrate analyze . --report --output ./migration-report.json
    archbase scan health . --fix
```

**Pre-commit Hook:**
```bash
#!/bin/sh
# .git/hooks/pre-commit
archbase scan health . --fix
archbase migrate analyze . | grep -q "Complex: 0" || {
  echo "Complex migrations detected. Please review manually."
  exit 1
}
```

**Development Workflow:**
```bash
# Start real-time monitoring
archbase scan watch ./src --auto-fix --verbose &

# Continue development - scanner provides live feedback
# When ready, check project health
archbase scan health ./src

# Migrate simple cases automatically  
archbase migrate v1-to-v2 ./src --exclude-complex --backup
```

## Knowledge Base

The CLI maintains a comprehensive knowledge base about Archbase components:

- **900+ Components Indexed**: the full Archbase V3 catalog (derived from `component-catalog.json`) is loaded, mapped to its `@archbase/*` package, on top of a richly curated core set
- **Auto-generated**: AST analysis extracts component props, types, and complexity
- **Manual curation**: Descriptions, use cases, examples, and AI hints for the key components
- **Production Patterns**: Real patterns from the reference admin projects
- **Examples**: Real-world code examples and best practices

### Component Categories

**Basic Editors** (10 components)
- Text inputs: ArchbaseEdit, ArchbaseTextArea, ArchbasePasswordEdit
- Selections: ArchbaseSelect, ArchbaseRadio, ArchbaseCheckbox, ArchbaseSwitch
- Numbers: ArchbaseNumber, ArchbaseDate, ArchbaseTime

**Advanced Editors** (15 components)
- ArchbaseAsyncSelect - Dynamic data loading
- ArchbaseRichTextEdit - WYSIWYG editing
- ArchbaseMaskEdit - Formatted inputs (CPF/CNPJ/Phone)
- ArchbaseLookupEdit - Complex entity selection
- ArchbaseTreeSelect - Hierarchical selection
- ArchbaseChipGroup - Tag management
- ArchbaseRating - Star ratings
- ArchbaseColorPicker - Color selection
- ArchbaseCronExpressionEdit - Cron builder
- ArchbaseJsonEdit - JSON editor
- ArchbaseKeyValueEditor - Dynamic properties
- ArchbaseOperationHoursEditor - Business hours
- ArchbaseFileAttachment - File uploads
- ArchbaseImageEdit - Image management
- ArchbaseAvatarEdit - Profile pictures

**Data Display** (5 components)
- ArchbaseDataTable - Advanced tables
- ArchbaseDataGrid - CRUD grids
- ArchbaseList - Simple lists
- ArchbaseFormTemplate - Form containers
- ArchbaseModal - Overlays

**Navigation & Feedback** (5 components)
- ArchbaseNavigation - Menu system
- Button - Actions
- ArchbaseNotifications - User feedback
- ArchbaseBreadcrumbs - Path navigation
- ArchbaseDialog - Confirmations

### Updating Knowledge Base

```bash
# Scan project for components
archbase knowledge scan ./src/components

# Validate the knowledge base (use --fix to backfill missing metadata)
archbase knowledge validate --fix

# Export the knowledge base (json | markdown | html)
archbase knowledge export --format=markdown
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Changelog

### v0.1.6 - Archbase React V3 Migration with Security Features (Latest)

**Major V3 Migration:**
- ✅ **Complete V3 Architecture**: Migrated from monolithic archbase-react to modular @archbase/* packages
- ✅ **Modular Packages**: @archbase/core, @archbase/components, @archbase/data, @archbase/security, @archbase/admin, @archbase/layout, @archbase/template
- ✅ **React 19 Support**: Updated to React 19 with backward compatibility for React 18
- ✅ **Vite 6**: Upgraded build system to Vite 6 for improved performance
- ✅ **Tree-shaking Optimization**: Reduced bundle sizes through modular architecture

**New Security Features:**
- ✅ **ArchbaseSecurityView Integration**: Complete user management using @archbase/security component
- ✅ **ArchbaseApiTokenView Integration**: API token management with existing V3 component
- ✅ **Security Boilerplate Options**: Admin-dashboard boilerplate now includes optional security features
- ✅ **Conditional Security Generation**: Security views generated only when features are selected
- ✅ **Navigation Integration**: Automatic security navigation with proper icons and routing

**Updated Dependencies:**
- 🔄 **@archbase/core**: Core utilities and types
- 🔄 **@archbase/components**: UI components (forms, grids, editors)
- 🔄 **@archbase/data**: Data management and remote services
- 🔄 **@archbase/security**: Security components and authentication
- 🔄 **@archbase/admin**: Admin dashboard layouts and navigation
- 🔄 **@archbase/layout**: Layout components and templates
- 🔄 **@archbase/template**: Template system for forms and views
- 🔄 **@mantine/spotlight**: Search and command palette (added)
- ❌ **mantine-react-table**: Removed in favor of integrated solutions

**Template Updates:**
- 🔄 **All Templates**: Updated to use V3 modular imports
- 🔄 **Security Templates**: New templates for SecurityView and ApiTokenView
- 🔄 **Navigation Templates**: Enhanced with conditional security features
- 🔄 **Dependency Templates**: Updated package.json generation for V3 packages

**CLI Enhancements:**
- ✅ **Feature-based Generation**: Proper --features handling for boilerplate creation
- ✅ **Security Generators**: New generators for security views using existing V3 components
- ✅ **Enhanced Validation**: Better error handling and TypeScript compliance

**Migration Benefits:**
- 📦 **Smaller Bundles**: Tree-shaking eliminates unused components
- ⚡ **Better Performance**: Optimized imports and reduced load times
- 🔧 **Improved Maintainability**: Cleaner package separation and dependencies
- 🛡️ **Enhanced Security**: Built-in security components with established patterns
- 🔄 **Future-ready**: Prepared for continued V3 ecosystem evolution

### v0.1.5 - Service Generation with Java Controller Analysis

**New Features:**
- ✅ **ServiceGenerator**: Complete remote service generation following Archbase patterns
- ✅ **Java Controller Analysis**: Automatically analyze Java controllers and generate TypeScript methods
- ✅ **JavaAnalyzer**: Advanced AST parsing for Java annotations and method signatures
- ✅ **Service Templates**: Handlebars templates for remote services with dependency injection
- ✅ **Interactive Service Wizard**: Guided service creation with Java controller integration
- ✅ **Method Mapping**: Automatic HTTP method detection and parameter analysis
- ✅ **Type Conversion**: Java to TypeScript type mapping (String → string, List<T> → T[])

**Service Generation Features:**
- 🔧 **ArchbaseRemoteApiService Inheritance**: Follows established Archbase patterns
- 🎯 **Java Controller Integration**: Analyzes real Java controllers for method generation
- 📊 **Annotation Support**: `@GetMapping`, `@PostMapping`, `@PathVariable`, `@RequestParam`, `@RequestBody`
- 🔄 **Dependency Injection**: Uses Inversify with `@injectable()` and `@inject()` decorators
- 📝 **TypeScript Safety**: Full type safety with generic parameters and proper DTOs
- 🎨 **Template System**: Extensible Handlebars templates for customization

**Java Analysis Capabilities:**
- **Method Extraction**: Parses complex method signatures including multi-line parameters
- **Annotation Processing**: Handles Spring Boot REST annotations with values and attributes
- **Parameter Analysis**: Distinguishes between path variables, query params, and request bodies
- **Return Type Mapping**: Converts complex Java generics to TypeScript (ResponseEntity<List<Dto>> → Dto[])
- **Endpoint Construction**: Builds API endpoints with proper path variable substitution

**Generated Service Structure:**
```typescript
@injectable()
export class ClienteRemoteService extends ArchbaseRemoteApiService<ClienteDto, string> {
    // Required implementations
    configureHeaders(): Record<string, string> { return {}; }
    transform(data: any): ClienteDto { return new ClienteDto(data); }
    
    // Standard CRUD methods
    async delete<R>(id: string): Promise<R> { /* ... */ }
    async findOne(id: string): Promise<ClienteDto> { /* ... */ }
    
    // Custom methods from Java controller analysis
    async buscarPorCpf(cpf: string): Promise<ClienteDto> { /* ... */ }
    async listarAtivos(page: number, size: number): Promise<ClienteDto[]> { /* ... */ }
}
```

**New CLI Commands:**
```bash
# Generate service with Java controller analysis
archbase generate service ClienteRemoteService --entity Cliente --type ClienteDto --java ./ClienteController.java

# Generate basic service structure only
archbase generate service ProdutoRemoteService --entity Produto --type ProdutoDto --endpoint /api/produtos

# Use interactive wizard
archbase generate service UserRemoteService --wizard
```

**Integration with Existing Workflow:**
- Works seamlessly with existing DomainGenerator for DTOs
- Integrates with FormGenerator and ViewGenerator for complete CRUD workflows
- Compatible with SecurityGenerator for authenticated API services
- Follows same patterns as powerview-admin project analysis

### v0.1.4 - Automatic Dependency Management + Interactive Wizard

**New Features:**
- ✅ **Interactive Project Wizard**: Guided project creation with detailed explanations and questions
- ✅ **Automatic Dependency Management**: Projects now include all required Archbase dependencies automatically
- ✅ **Mantine 8.x Complete Setup**: Full Mantine ecosystem with PostCSS configuration and theme provider
- ✅ **Project Type Support**: Basic, Admin, and Full project configurations with appropriate dependencies
- ✅ **Feature-based Dependencies**: Optional dependencies based on selected features (rich-text, charts, auth, etc.)
- ✅ **Complete Build Configuration**: TypeScript, Vite, ESLint, and PostCSS pre-configured
- ✅ **Package.json Generator**: Standalone command to generate package.json with Archbase dependencies

**Interactive Wizard Features:**
- 🧙‍♂️ **6-Step Guided Setup**: From project info to final confirmation
- 📖 **Detailed Explanations**: Each option includes helpful descriptions and use cases
- ⚙️ **Complete Environment Setup**: Environment files, Git initialization, dependency installation
- 📄 **Auto-Generated Documentation**: PROJECT-SUMMARY.md with all configuration details
- 🚀 **Working Project**: Complete React app with Archbase components ready to run

**Dependencies Included (V3):**
- **Core**: @archbase/core, @archbase/components, @mantine/core 8.x ecosystem, React 19, TypeScript
- **Admin Features**: @archbase/admin, @archbase/data, @mui/x-data-grid, JWT auth, file export
- **Security Features**: @archbase/security with ArchbaseSecurityView and ArchbaseApiTokenView components
- **Layout & Templates**: @archbase/layout, @archbase/template for structured admin interfaces
- **Full Features**: Rich text editing, charts (D3), PDF generation, image processing, color picker
- **Build Tools**: Vite 6, ESLint, TypeScript compiler, PostCSS with Mantine preset

**New Commands:**
```bash
# Create project with automatic dependencies
archbase create project MyApp --project-type=admin --features=auth,data-grid,file-export

# Generate only package.json with dependencies
archbase create package-json --name=MyApp --project-type=full --features=rich-text,charts,pdf
```

**Generated Files:**
- `package.json` - Complete dependency configuration
- `postcss.config.js` - Mantine 8.x PostCSS setup
- `tsconfig.json` - TypeScript configuration with path mapping
- `src/providers/AppProvider.tsx` - Mantine theme provider setup
- `README.md` - Installation and setup instructions

### v0.1.3 - Template Fixes and Type Safety

**Bug Fixes:**
- ✅ **JSX Template Parsing**: Fixed JSX syntax issues in Handlebars templates using `{{lt}}` and `{{gt}}` helpers
- ✅ **TypeScript Type Mapping**: Enhanced CLI field type conversion (`text` → `string`, `decimal` → `number`, `enum` → specific enum types)
- ✅ **Enum Type Resolution**: Improved enum field mapping to specific TypeScript enum types (e.g., `ProductStatus`)
- ✅ **Duplicate Field Prevention**: Fixed duplicate audit fields in DTOs by filtering against user-defined fields
- ✅ **Form Import Generation**: Fixed missing React imports in generated forms
- ✅ **Template Type Consistency**: Added `tsType` helper to all generators for consistent type mapping

**Technical Improvements:**
- Enhanced `DomainGenerator` with CLI field type mappings (`text`, `decimal`, `enum`, etc.)
- Improved `FormGenerator` import statement generation for proper React component structure
- Fixed template parsing for JSX props (e.g., `pageSize={25}` instead of `pageSize=25`)
- Added deduplication logic for audit fields vs. user-defined fields
- Enhanced enum type resolution in DTO field mapping

**Quality Assurance:**
- ✅ **Comprehensive Testing**: All generators tested and validated
- ✅ **Domain Generation**: TypeScript DTOs with correct type mappings
- ✅ **Form Generation**: React components with proper imports and TypeScript types
- ✅ **View Generation**: CRUD views with JSX syntax fixes
- ✅ **Security Generation**: Authentication components generating correctly
- ✅ **File Validation**: All generated files pass TypeScript compilation and linting

**Template Fixes:**
- `forms/basic.hbs` - Fixed import generation and TypeScript interface types
- `views/crud-list.hbs` - Fixed JSX prop syntax using template helpers
- `domain/dto.hbs` - Enhanced type mapping and field deduplication
- All templates now generate valid, parseable TypeScript/React code

**Production Ready:**
- All generators now produce valid, compilable code
- Type safety ensured across all generated components
- No more template parsing errors or invalid syntax
- Full workflow tested from domain generation to UI components

### v0.1.2 - Security Infrastructure Generator

**New Features:**
- ✅ **SecurityGenerator**: Complete security infrastructure generation
- ✅ **Login Views**: Desktop and mobile login views with branding support
- ✅ **User Management**: Full CRUD interface with role-based permissions
- ✅ **API Token Management**: Secure token generation, regeneration, and scoping
- ✅ **Authentication Infrastructure**: Custom authenticator with JWT and refresh tokens
- ✅ **Security Management**: ArchbaseSecurityView integration with audit logging
- ✅ **IoC Container**: Dependency injection setup with Inversify
- ✅ **Mobile Support**: Responsive design with dedicated mobile components
- ✅ **Permission System**: Granular permission checking throughout all views

**Security Components Added:**
- `LoginView.tsx` - Desktop login with branding and validation
- `LoginMobileView.tsx` - Mobile-optimized login interface
- `SecurityView.tsx` - Main security management dashboard
- `UserManagementView.tsx` - Complete user CRUD with roles
- `ApiTokenManagementView.tsx` - API token lifecycle management
- `Authenticator.ts` - JWT authentication with refresh token support
- `SecurityContainer.tsx` - IoC container configuration
- `SecurityNavigation.tsx` - Navigation components for security routes
- `SecurityRoutes.tsx` - Route definitions and path constants
- `Login.module.css` - Responsive styling with dark/light mode support

**Security Features:**
- JWT authentication with automatic refresh
- Role-based access control (RBAC)
- API token scoping and regeneration
- User activation/deactivation
- Audit logging and user export
- Password remember functionality
- Forgot password workflow
- Multi-device support (desktop/mobile)
- Secure token display with visibility controls
- Bulk user operations

### v0.1.1 - Extended Editor Components

**New Features:**
- ✅ **Enhanced Knowledge Base**: 35+ Archbase components now documented (up from 15)
- ✅ **Advanced Editors**: Added documentation for specialized editor components
- ✅ **Rich Text Editing**: ArchbaseRichTextEdit with SunEditor integration
- ✅ **Async Data Loading**: ArchbaseAsyncSelect with pagination support
- ✅ **Masked Inputs**: ArchbaseMaskEdit with CPF/CNPJ/CEP patterns
- ✅ **Lookup Components**: ArchbaseLookupEdit for complex entity selection
- ✅ **File Management**: ArchbaseFileAttachment and ArchbaseImageEdit
- ✅ **Specialized Inputs**: JSON, KeyValue, CronExpression, and OperationHours editors
- ✅ **UI Components**: Rating, Switch, ColorPicker, and AvatarEdit

**Editor Components Added:**
- `ArchbaseAsyncSelect` - Dynamic option loading with debounce
- `ArchbaseRichTextEdit` - WYSIWYG editor with base64 support
- `ArchbaseMaskEdit` - Formatted inputs for documents/phones
- `ArchbaseLookupEdit` - Modal-based entity selection
- `ArchbaseImageEdit` - Image upload with drag-and-drop
- `ArchbaseJsonEdit` - JSON editor with syntax highlighting
- `ArchbaseSwitch` - Toggle switch for boolean values
- `ArchbaseRating` - Star rating with fractional support
- `ArchbaseCronExpressionEdit` - Visual cron builder
- `ArchbaseKeyValueEditor` - Dynamic property management
- `ArchbaseOperationHoursEditor` - Business hours configuration
- `ArchbaseTimeRangeSelector` - Time period selection
- `ArchbaseTreeSelect` - Hierarchical data selection
- `ArchbaseChipGroup` - Tag/category selection
- `ArchbaseFileAttachment` - Multiple file uploads
- `ArchbasePasswordEdit` - Password with strength indicator
- `ArchbaseColorPicker` - Color selection with formats
- `ArchbaseAvatarEdit` - Profile picture with cropping

### v0.1.0 - Production Pattern Integration

**New Features:**
- ✅ **DomainGenerator**: Generate TypeScript DTOs from Java classes or field specifications
- ✅ **Java-to-TypeScript**: Automatic conversion with validation decorators and enum support
- ✅ **DTO Integration**: Generate forms and views directly from existing DTOs
- ✅ **Initial Knowledge Base**: 15 core Archbase components with documentation
- ✅ **Enhanced Pattern Library**: 10+ production patterns including DataSource V2 workflows
- ✅ **FormGenerator Enhanced**: Full ArchbaseDataSource V2 support with real powerview-admin patterns
- ✅ **ViewGenerator**: Complete CRUD list views with ArchbaseDataGrid, permissions, and row actions
- ✅ **NavigationGenerator**: Admin navigation items with route constants and i18n integration
- ✅ **Real Pattern Analysis**: Templates based on actual powerview-admin codebase analysis
- ✅ **TypeScript Support**: Full type safety with proper interfaces and DTOs

**Technical Updates:**
- Handlebars template engine with custom helpers
- Template path resolution for dist directory
- Admin routing pattern `/admin/{category}/{feature}`
- Permission-based UI with `isAdministrator()` checks
- ArchbaseFormTemplate instead of fictional FormBuilder
- Proper error handling and validation integration

**Templates Added:**
- `domain/dto.hbs` - TypeScript DTO with validation decorators
- `domain/enum.hbs` - Enum definitions with utility functions
- `domain/status-values.hbs` - UI rendering configurations for enums
- `forms/datasource-v2.hbs` - Modern form with DataSource V2
- `views/crud-list.hbs` - Complete CRUD list view
- `navigation/navigation-item.hbs` - Navigation item definitions
- `navigation/route-constants.hbs` - Route management helpers

## Troubleshooting

### Common Issues (Fixed in v0.1.3)

**Q: Generated forms are missing React imports**  
**A:** ✅ Fixed in v0.1.3 - FormGenerator now automatically includes proper import statements

**Q: JSX syntax errors in generated views (e.g., `pageSize=25` instead of `pageSize={25}`)**  
**A:** ✅ Fixed in v0.1.3 - Templates now use `{{lt}}` and `{{gt}}` helpers for proper JSX rendering

**Q: TypeScript errors with field types (`text` showing as `text` instead of `string`)**  
**A:** ✅ Fixed in v0.1.3 - Enhanced type mapping converts CLI field types to proper TypeScript types

**Q: Duplicate `id` fields in generated DTOs**  
**A:** ✅ Fixed in v0.1.3 - Audit fields are now filtered to prevent conflicts with user-defined fields

**Q: Enum fields not resolving to proper enum types**  
**A:** ✅ Fixed in v0.1.3 - Enum fields now correctly map to specific enum types (e.g., `ProductStatus`)

### Validation

Always validate generated code to ensure it compiles correctly:

```bash
# Validate individual files
archbase validate file ./src/domain/ProductDto.ts
archbase validate file ./src/forms/ProductForm.tsx
archbase validate file ./src/views/ProductView.tsx

# Check TypeScript compilation
npm run build

# Run linting
npm run lint
```

### Best Practices

1. **Use Validation**: Always validate generated files before using in production
2. **Test Compilation**: Ensure generated TypeScript code compiles without errors
3. **Review Templates**: Check generated code matches your project patterns
4. **Type Safety**: Verify that type mappings are correct for your use case

## Complete Workflow Example

Here's a complete example of creating a production-ready Archbase project:

### Option 1: Using the Interactive Wizard (Recommended)

```bash
# Start the wizard for guided setup
archbase create project MyAdminApp --wizard

# The wizard will guide you through:
# 1. Project information (name, description, author)
# 2. Architecture choice (Basic/Admin/Full)
# 3. Feature selection (auth, data-grid, file-export, etc.)
# 4. Development setup (TypeScript, Git, auto-install)
# 5. Configuration (API URL, database type, deployment)
# 6. Final confirmation

# Result: Complete project ready to run!
cd MyAdminApp
npm run dev  # Dependencies already installed!
```

### Option 2: Command Line Setup

```bash
# Create admin project with specific features
archbase create project MyAdminApp \
  --project-type=admin \
  --features=auth,data-grid,file-export \
  --author="Your Name" \
  --description="Modern admin dashboard"

# Install dependencies and start
cd MyAdminApp
npm install
npm run dev
```

### Option 3: Add to Existing Project

```bash
# Add Archbase dependencies to existing project
cd my-existing-project
archbase create package-json \
  --name=my-existing-project \
  --project-type=full \
  --features=rich-text,charts,pdf \
  --output=.

# Install new dependencies
npm install
```

### What You Get

After creation, your project includes:

```
MyAdminApp/
├── src/
│   ├── components/          # Reusable components
│   ├── pages/              # Application pages
│   ├── domain/             # DTOs and types (admin/full)
│   ├── services/           # API services (admin/full)
│   ├── providers/          # Mantine theme provider
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── package.json            # All dependencies configured
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
├── postcss.config.js       # Mantine PostCSS setup
├── .env.example            # Environment template
├── .env.local              # Local environment
├── .gitignore              # Git ignore rules
└── PROJECT-SUMMARY.md      # Configuration documentation
```

### Start Building

```tsx
// src/components/MyComponent.tsx
import { ArchbaseEdit } from '@archbase/components';
import { Button, Container, Title } from '@mantine/core';

export function MyComponent() {
  return (
    <Container>
      <Title>Welcome to Archbase!</Title>
      <ArchbaseEdit label="Name" />
      <Button>Save</Button>
    </Container>
  );
}
```

### Generate More Components

```bash
# Generate domain objects
archbase generate domain User --fields="name:text,email:text,status:enum" --enums="UserStatus:ACTIVE,INACTIVE"

# Generate forms
archbase generate form UserForm --dto=./src/domain/UserDto.ts --category=users

# Generate CRUD views
archbase generate view UserView --dto=./src/domain/UserDto.ts --with-permissions

# Generate security components
archbase generate security AdminSecurity --features=jwt,user-management,api-tokens
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://docs.archbase.com/cli)
- 🐛 [Issues](https://github.com/edsonmartins/archbase-cli/issues)
- 💬 [Discussions](https://github.com/edsonmartins/archbase-cli/discussions)

---

**Archbase CLI - Making AI-friendly development a reality**