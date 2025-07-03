# CLAUDE.md

This file provides guidance to Claude Code when working with the Archbase CLI project.

## Project Overview

Archbase CLI is an AI-friendly command-line tool that solves the problem of AI assistants not knowing custom libraries. It provides structured component querying and automated code generation for the Archbase ecosystem (React + Java).

## Development Context

**IMPORTANT**: Read `/docs/development-context.md` for complete context of previous development discussions and decisions made.

## Current Status

- ✅ **CLI Framework**: Complete structure with Commander.js
- ✅ **Query System**: Component/pattern search implemented
- ✅ **FormGenerator**: Complete form generation with validation
- ✅ **Knowledge Base**: Hybrid auto/manual component knowledge
- ✅ **Component Analyzer**: AST parsing for React/TypeScript
- 🚧 **Need Implementation**: ViewGenerator, PageGenerator, ComponentGenerator
- 🚧 **Need Creation**: Handlebars templates in `/templates` directory

## Key Commands

```bash
# Development
npm run dev                                    # Run CLI in development
npm run dev --help                           # See all commands
npm run dev query component ArchbaseEdit     # Test component query
npm run dev generate form TestForm --fields=name,email  # Test form generation

# Build and test
npm run build                                 # Build TypeScript
npm test                                      # Run tests
```

## Architecture

### Core Components
- **Commands**: `/src/commands/` - CLI command implementations
- **Generators**: `/src/generators/` - Code generation logic
- **Analyzers**: `/src/analyzers/` - AST parsing and component analysis
- **Knowledge**: `/src/knowledge/` - Component knowledge management
- **Templates**: `/src/templates/` - Handlebars templates (to be created)

### AI-Friendly Features
- JSON output for programmatic consumption
- Structured component information
- AI hints and context
- Code snippets and examples

## Immediate Priorities

1. **Complete ViewGenerator** - CRUD/List/Dashboard view generation
2. **Complete PageGenerator** - Full page layouts with components
3. **Complete ComponentGenerator** - Custom component generation
4. **Create Templates** - Handlebars templates for all generators
5. **Archbase Integration** - Auto-scan archbase-react components

## Development Guidelines

- Follow existing patterns in FormGenerator
- Use TypeScript strict mode
- Implement proper error handling
- Create comprehensive templates
- Test with real use cases
- Focus on AI-friendly outputs

## Related Projects

- **Archbase React**: `/archbase-react` - The component library this CLI serves
- **DataSource V2**: Understanding of 91 migrated components with V1/V2 compatibility

## Key Files for Context

- `/docs/development-context.md` - Complete development context
- `/src/generators/FormGenerator.ts` - Reference implementation
- `/src/knowledge/KnowledgeBase.ts` - Component knowledge system
- `/src/analyzers/ComponentAnalyzer.ts` - AST parsing logic

When starting work, always reference the development context document first to understand the full scope and previous decisions made.