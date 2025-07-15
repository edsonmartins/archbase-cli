# CLAUDE.md

This file provides guidance to Claude Code when working with the Archbase CLI project.

## Project Overview

Archbase CLI is an AI-friendly command-line tool that solves the problem of AI assistants not knowing custom libraries. It provides structured component querying and automated code generation for the Archbase React V3 ecosystem (React + Java).

**Latest Update**: Successfully migrated to Archbase React V3 modular architecture with @archbase/* packages and integrated security features.

## Development Context

**IMPORTANT**: Read `/docs/development-context.md` for complete context of previous development discussions and decisions made.

## Current Status

- ✅ **CLI Framework**: Complete structure with Commander.js
- ✅ **Query System**: Component/pattern search implemented  
- ✅ **FormGenerator**: Complete form generation with validation
- ✅ **ServiceGenerator**: Remote service generation with Java controller analysis
- ✅ **SecurityGenerator**: Security views using @archbase/security components
- ✅ **ViewGenerator**: CRUD/List view generation
- ✅ **NavigationGenerator**: Navigation item generation
- ✅ **DomainGenerator**: DTO generation from Java classes
- ✅ **V3 Migration**: Complete migration to @archbase/* modular packages
- ✅ **Security Features**: ArchbaseSecurityView and ArchbaseApiTokenView integration
- ✅ **Knowledge Base**: V3 component knowledge with manual curation
- ✅ **Component Analyzer**: AST parsing for React/TypeScript
- ✅ **Java Analyzer**: AST parsing for Java controllers and annotations
- ✅ **Boilerplate Integration**: Admin-dashboard with optional security features
- 🚧 **Need Implementation**: PageGenerator, ComponentGenerator enhancements
- 🚧 **Need Creation**: Additional V3 templates for specialized components

## Key Commands

```bash
# Development
npm run dev                                    # Run CLI in development
npm run dev --help                           # See all commands
npm run dev query component ArchbaseEdit     # Test component query
npm run dev generate form TestForm --fields=name,email  # Test form generation
npm run dev generate service TestService --entity Test --type TestDto  # Test service generation
npm run dev generate security SecurityView --type=security-management  # Test security generation

# V3 Project Creation with Security
npm run dev -- create project TestApp --boilerplate admin-dashboard --features security-management,api-token-management,dashboard,authentication

# Build and test
npm run build                                 # Build TypeScript
npm test                                      # Run tests
```

## Architecture

### Core Components
- **Commands**: `/src/commands/` - CLI command implementations
- **Generators**: `/src/generators/` - Code generation logic (all updated for V3)
- **Analyzers**: `/src/analyzers/` - AST parsing and component analysis
- **Knowledge**: `/src/knowledge/` - V3 component knowledge management
- **Templates**: `/src/templates/` - Handlebars templates (updated for @archbase/* imports)
- **Utils**: `/src/utils/` - Error handling, logging, and utilities
- **Boilerplates**: `/src/boilerplates/` - Project templates with V3 dependencies

### V3 Template Structure
- **Security Templates**: `/src/templates/security/` - ArchbaseSecurityView and ArchbaseApiTokenView
- **Form Templates**: Updated to use @archbase/components
- **Service Templates**: Updated to use @archbase/data
- **Domain Templates**: Updated to use @archbase/core
- **Boilerplate Templates**: Admin-dashboard with optional security features

### AI-Friendly Features
- JSON output for programmatic consumption
- Structured component information
- AI hints and context
- Code snippets and examples

## Immediate Priorities

1. **V3 Dashboard Components** - Generate dashboard components using @archbase/components
2. **Complete PageGenerator** - Full page layouts with V3 components
3. **Complete ComponentGenerator** - Custom component generation with V3 imports
4. **Additional V3 Templates** - Specialized templates for V3 ecosystem
5. **Enhanced Security Features** - Additional security component generators
6. **V3 Knowledge Base Expansion** - Complete @archbase/* component documentation

## Development Guidelines

- Follow existing patterns in FormGenerator
- Use TypeScript strict mode
- Implement proper error handling
- Create comprehensive templates
- Test with real use cases
- Focus on AI-friendly outputs

## Related Projects

- **Archbase React V3**: `/archbase-react-v3` - The V3 modular component library this CLI serves
- **DataSource V2**: Understanding of components with V1/V2 compatibility
- **Security Package**: `@archbase/security` - Security components (ArchbaseSecurityView, ArchbaseApiTokenView)
- **Core Package**: `@archbase/core` - Core utilities and types
- **Components Package**: `@archbase/components` - UI components

## Key Files for Context

- `/docs/development-context.md` - Complete development context
- `/src/generators/FormGenerator.ts` - Reference implementation (V3 updated)
- `/src/generators/ServiceGenerator.ts` - Service generation with Java analysis (V3 updated)
- `/src/generators/SecurityGenerator.ts` - Security view generation using @archbase/security
- `/src/knowledge/KnowledgeBase.ts` - V3 component knowledge system
- `/src/analyzers/ComponentAnalyzer.ts` - AST parsing logic
- `/src/analyzers/JavaAnalyzer.ts` - Java controller analysis
- `/src/boilerplates/admin-dashboard/` - V3 admin dashboard boilerplate with security features
- `/src/templates/security/` - Security view templates for V3 components

## V3 Migration Summary

**Completed:**
- ✅ All generators updated to use @archbase/* imports
- ✅ SecurityGenerator created with ArchbaseSecurityView and ArchbaseApiTokenView
- ✅ Admin-dashboard boilerplate enhanced with optional security features
- ✅ Dependencies updated to V3 modular packages
- ✅ React 19 support with Vite 6
- ✅ CLI feature handling fixed for proper boilerplate generation

**Security Features Added:**
- 🔐 `security-management` - Complete user management interface
- 🔑 `api-token-management` - API token lifecycle management
- 🔒 Conditional generation based on selected features
- 🧭 Navigation integration with proper icons and routing

When starting work, always reference the development context document first to understand the full scope and previous decisions made.