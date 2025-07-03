# Archbase CLI

> AI-friendly CLI tool for Archbase ecosystem component querying and code generation

## Overview

Archbase CLI is a powerful, AI-friendly development tool that bridges the gap between Java backend development and modern TypeScript/React frontends. It solves the problem of AI assistants not knowing custom libraries by providing a structured interface for querying component information and generating production-ready code based on tested patterns from real projects.

**Key Innovation**: Complete domain-driven development workflow from Java classes to production-ready React components, following established patterns from powerview-admin.

## Features

- 🔍 **Component Query** - Search and get detailed information about Archbase components
- 🏗️ **Code Generation** - Generate forms, views, pages, components, navigation and security components from templates
- 🎯 **Domain-Driven Development** - Generate TypeScript DTOs from Java classes with full type safety
- 🔄 **Java-to-TypeScript** - Automatic conversion with validation decorators and enum support
- 📊 **DTO-Based Generation** - Create forms and views directly from existing DTOs
- 🔒 **Security Components** - Generate login views, user management, API tokens, and authentication infrastructure
- 🚀 **Project Scaffolding** - Create complete projects from boilerplates (local and remote)
- 🤖 **AI-Friendly** - Optimized outputs for AI consumption and integration
- 📚 **Knowledge Base** - Automatic component analysis with manual curation support
- 🎯 **Production Patterns** - Templates based on real powerview-admin patterns
- 📱 **ArchbaseDataSource V2** - Full support for modern data source patterns
- 🔍 **Advanced Scanning** - Real-time component analysis and pattern detection
- 🔄 **Migration Tools** - Automated V1→V2 migration with AST transformations
- 🔌 **Plugin System** - Extensible architecture for custom generators, commands, and analyzers

## Installation

```bash
npm install -g @archbase/cli
```

## Domain-Driven Development Workflow

Archbase CLI implements a complete workflow from Java backend entities to production-ready React components:

```bash
# 1. Generate TypeScript DTOs from Java entities
archbase generate domain UserDto --java-text ./User.java --output ./src/domain

# 2. Create forms with DataSource V2 integration
archbase generate form UserForm --dto ./src/domain/UserDto.ts --category=usuarios

# 3. Generate CRUD list views with permissions
archbase generate view UserView --dto ./src/domain/UserDto.ts --category=usuarios

# 4. Create navigation items with proper routing
archbase generate navigation UserNavigation --category=usuarios --with-view --with-form --icon=IconUser
```

**Generated Output:**
- ✅ TypeScript DTOs with validation decorators
- ✅ Enums with utility functions and UI rendering configs
- ✅ Forms using ArchbaseFormTemplate (real pattern)
- ✅ CRUD views with ArchbaseDataGrid
- ✅ Navigation items following `/admin/{category}/{feature}` pattern

## Quick Start

```bash
# Query component information
archbase query component ArchbaseEdit

# Generate a form with DataSource V2
archbase generate form UserRegistration --fields=name:text,email:email,password:password --datasource-version=v2

# Generate a CRUD list view
archbase generate view UserManagement --category=usuarios --feature=usuario --with-permissions

# Generate navigation items
archbase generate navigation UserNavigation --category=usuarios --with-view --with-form --icon=IconUser

# Generate DTOs from Java classes
archbase generate domain ProdutoDto --java-text /path/to/Produto.java --output ./src/domain

# Generate forms and views from DTOs
archbase generate form ProdutoForm --dto ./src/domain/ProdutoDto.ts --category=produtos
archbase generate view ProdutoView --dto ./src/domain/ProdutoDto.ts --category=produtos

# Generate security components
archbase generate security AdminLogin --type=login --with-mobile --with-branding
archbase generate security UserManager --type=user-management --features=user-activation,user-roles

# Create a project from boilerplate
archbase create project MyApp --boilerplate=admin-dashboard
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
# Create project from local boilerplate
archbase create project <name> --boilerplate=<template>

# Create project from Git repository
archbase create project <name> --git <url> [--branch <branch>] [--subfolder <path>]

# Create project from npm package
archbase create project <name> --npm <package> [--subfolder <path>]

# Create module
archbase create module <name> --with=forms,lists,details

# List boilerplates
archbase create list-boilerplates [--category=admin]
```

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
  "archbaseReactVersion": "^2.0.0",
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

# Test
npm test
```

## Generators Reference

### DomainGenerator
Generate TypeScript DTOs and enums from Java classes or field specifications.

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

**From Field Specifications:**
```bash
archbase generate domain UserDto \
  --fields="name:String,email:String,age:Integer" \
  --enums="StatusUser:ACTIVE|INACTIVE|PENDING" \
  --with-audit-fields --with-validation
```

**Generates:**
- `UserDto.ts` - DTO class with validation decorators
- `StatusUser.ts` - Enum with utility functions  
- `UserStatusValues.ts` - UI rendering configurations

### FormGenerator
Generate forms with DataSource V2 integration following powerview-admin patterns.

**From DTO:**
```bash
archbase generate form UserForm \
  --dto ./src/domain/UserDto.ts \
  --category=usuarios --feature=usuario
```

**From Fields:**
```bash
archbase generate form UserForm \
  --fields="name:text,email:email,status:select" \
  --datasource-version=v2 --validation=yup
```

**Features:**
- ArchbaseFormTemplate integration (not FormBuilder)
- DataSource V2 with `useArchbaseRemoteDataSource`
- Admin routing `/admin/{category}/{feature}`
- Validation with Yup/Zod
- TypeScript with proper DTO imports

### ViewGenerator
Generate CRUD list views with ArchbaseDataGrid and permissions.

**From DTO:**
```bash
archbase generate view UserView \
  --dto ./src/domain/UserDto.ts \
  --category=usuarios --with-permissions
```

**From Fields:**
```bash
archbase generate view UserView \
  --fields="name:text,email:text,status:enum" \
  --with-filters --with-pagination --page-size=50
```

**Features:**
- ArchbaseDataGrid with row actions
- Permission-based UI (`isAdministrator()` checks)
- Toolbar actions (Add/Edit/Delete/View)
- Column definitions with proper types
- Filter and pagination support

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

### SecurityGenerator
Generate complete security infrastructure including login views, user management, API tokens, and authentication components.

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

**Generated Files:**
- **Login**: `LoginView.tsx`, `LoginMobileView.tsx`, `Login.module.css`
- **Security**: `SecurityView.tsx`, `SecurityNavigation.tsx`, `SecurityRoutes.tsx`
- **Users**: `UserManagementView.tsx` with full CRUD interface
- **Tokens**: `ApiTokenManagementView.tsx` with secure token handling
- **Auth**: `Authenticator.ts`, `SecurityContainer.tsx` with IoC setup

**Features:**
- **JWT Authentication**: Complete implementation with refresh tokens
- **Role-based Security**: Permission checking throughout all views
- **Mobile Support**: Dedicated responsive mobile login views
- **Secure Token Display**: Visibility controls and copy-to-clipboard
- **User Activation**: Enable/disable user accounts
- **API Token Scopes**: Granular permission control for API access
- **IoC Integration**: Proper dependency injection with Inversify
- **Audit Support**: User action logging and export capabilities
- **Modern UI**: Mantine components with consistent styling

## Production-Ready Templates

All generators follow real patterns from powerview-admin:

#### FormGenerator
- **DataSource V2 Support**: Modern `useArchbaseRemoteDataSource` hooks
- **ArchbaseFormTemplate**: Real form components, not fictional FormBuilder
- **Admin Navigation**: Follows `/admin/{category}/{feature}` pattern
- **Validation**: Yup/Zod integration with proper error handling
- **TypeScript**: Full type safety with DTOs and interfaces

#### ViewGenerator  
- **CRUD List Views**: `ArchbaseDataGrid` with toolbar and row actions
- **Permission-Based UI**: Admin-only operations with `isAdministrator()` checks
- **Navigation Integration**: Proper route handling and redirects
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
# Complete workflow: Java → DTO → Forms/Views → Navigation
archbase generate domain UserDto --java-text ./User.java --output ./src/domain
archbase generate form UserForm --dto ./src/domain/UserDto.ts --category=usuarios
archbase generate view UserView --dto ./src/domain/UserDto.ts --category=usuarios  
archbase generate navigation UserNavigation --category=usuarios --with-view --with-form --icon=IconUser

# Complete security infrastructure
archbase generate security AdminLogin --type=login --with-mobile --with-branding --brand-name="MyApp"
archbase generate security Security --type=security-management --features=custom-permissions,audit-log
archbase generate security UserAdmin --type=user-management --features=user-activation,user-roles
archbase generate security ApiTokens --type=api-tokens --features=token-regeneration
archbase generate security CustomAuth --type=authenticator --authenticator-class=MyAuthenticator

# Traditional field-based generation
archbase generate form UserForm --fields=name:text,email:email --category=usuarios --datasource-version=v2
archbase generate view UserView --category=usuarios --with-permissions
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

- **35+ Components Documented**: From basic inputs to specialized editors
- **Auto-generated**: AST analysis extracts component props, types, and complexity
- **Manual curation**: Descriptions, use cases, examples, and AI hints
- **Production Patterns**: Real patterns from powerview-admin analysis
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
- ArchbaseButton - Actions
- ArchbaseNotifications - User feedback
- ArchbaseBreadcrumbs - Path navigation
- ArchbaseDialog - Confirmations

### Updating Knowledge Base

```bash
# Scan project for components
archbase knowledge scan ./src/components

# Validate knowledge base
archbase knowledge validate

# Update from remote
archbase knowledge update
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Changelog

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

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://docs.archbase.com/cli)
- 🐛 [Issues](https://github.com/edsonmartins/archbase-cli/issues)
- 💬 [Discussions](https://github.com/edsonmartins/archbase-cli/discussions)

---

**Archbase CLI - Making AI-friendly development a reality**