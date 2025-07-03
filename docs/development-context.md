# Archbase CLI - Development Context

> **Complete development context for Claude Code sessions**

## 🎯 **Project Purpose**

Archbase CLI is an **AI-friendly command-line tool** designed to solve the problem of AI assistants not knowing custom libraries. It provides structured component querying and automated code generation for the Archbase ecosystem.

## 📊 **Current Status**

- ✅ **Project Structure**: Complete CLI structure implemented
- ✅ **Core Commands**: query, generate, create commands implemented
- ✅ **Query System**: Full component search and pattern discovery
- ✅ **FormGenerator**: Complete form generation with validation
- ✅ **Knowledge Base**: Hybrid auto/manual system implemented
- ✅ **Component Analyzer**: AST parsing for React/TypeScript
- 🚧 **TODO**: ViewGenerator, PageGenerator, ComponentGenerator
- 🚧 **TODO**: Handlebars templates creation
- 🚧 **TODO**: Integration with real archbase-react scanning

## 🏗️ **Technical Stack**

```json
{
  "language": "Node.js + TypeScript",
  "cliFramework": "Commander.js",
  "templates": "Handlebars.js", 
  "parsing": "@babel/parser",
  "prompts": "Inquirer.js",
  "testing": "Jest"
}
```

## 📁 **Project Structure**

```
src/
├── bin/archbase.ts           # ✅ CLI entry point
├── commands/
│   ├── query.ts              # ✅ Component/pattern search
│   ├── generate.ts           # ✅ Code generation commands  
│   └── create.ts             # ✅ Project scaffolding
├── analyzers/
│   └── ComponentAnalyzer.ts  # ✅ AST parsing for React/TS
├── knowledge/
│   └── KnowledgeBase.ts      # ✅ Component knowledge system
├── generators/
│   ├── FormGenerator.ts      # ✅ Complete form generation
│   ├── ViewGenerator.ts      # 🚧 TODO: CRUD/List/Dashboard views
│   ├── PageGenerator.ts      # 🚧 TODO: Full page layouts
│   └── ComponentGenerator.ts # 🚧 TODO: Custom components
├── templates/                # 📁 TODO: Handlebars templates
└── utils/                    # 📁 TODO: Shared utilities
```

## 🚀 **Quick Start Commands**

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Test basic functionality
npm run dev --help
npm run dev query component ArchbaseEdit
npm run dev generate form TestForm --fields=name,email
```

## 📝 **Key Features Implemented**

### **1. Query System**
- Component search: `archbase query component FormBuilder`
- Pattern search: `archbase query pattern "crud with validation"`
- Example search: `archbase query examples --component=DataTable`
- Free search: `archbase query search "user registration"`

### **2. FormGenerator (Complete)**
- Field parsing: `--fields=name:text,email:email,password:password`
- Validation support: `--validation=yup|zod|none`
- Template types: `--template=basic|wizard|validation`
- Test generation: `--test`
- Story generation: `--story`

### **3. Component Analysis**
- AST parsing of React/TypeScript components
- Automatic prop extraction with types
- DataSource V1/V2 usage detection
- Complexity calculation
- Dependency analysis

### **4. Knowledge Base**
- Hybrid system: auto-generated + manual curation
- Component caching for performance
- Pattern matching and search
- AI-friendly output formats

## 🎯 **Immediate Next Steps**

### **Priority 1: Complete Generators**

1. **ViewGenerator Implementation**
   ```typescript
   // TODO: Implement in src/generators/ViewGenerator.ts
   - CRUD view template (list + form + details)
   - List view template (table + filters)
   - Dashboard view template (metrics + charts)
   ```

2. **PageGenerator Implementation**
   ```typescript
   // TODO: Implement in src/generators/PageGenerator.ts
   - Sidebar layout template
   - Header layout template
   - Blank layout template
   - Component composition
   ```

3. **ComponentGenerator Implementation**
   ```typescript
   // TODO: Implement in src/generators/ComponentGenerator.ts
   - Display component template
   - Input component template
   - Layout component template
   ```

### **Priority 2: Template System**

1. **Create Handlebars Templates**
   ```
   templates/
   ├── forms/
   │   ├── basic.hbs
   │   ├── wizard.hbs
   │   └── validation.hbs
   ├── views/
   │   ├── crud.hbs
   │   ├── list.hbs
   │   └── dashboard.hbs
   ├── pages/
   │   ├── sidebar-layout.hbs
   │   └── header-layout.hbs
   └── components/
       ├── display.hbs
       └── input.hbs
   ```

### **Priority 3: Archbase-React Integration**

1. **Auto-scan Implementation**
   ```bash
   # TODO: Command to scan archbase-react
   archbase knowledge scan /path/to/archbase-react/src/components
   ```

2. **V1/V2 Pattern Detection**
   ```typescript
   // TODO: Detect the 91 migrated components
   // TODO: Extract useArchbaseV1V2Compatibility usage
   // TODO: Identify DataSource V1 vs V2 patterns
   ```

## 🤖 **AI-Friendly Features**

### **JSON Output**
```bash
archbase query component ArchbaseEdit --format=json --ai-context
```

### **AI Mode**
```bash
archbase --ai-mode query suggest-components "user registration form"
```

### **Structured Responses**
```json
{
  "component": "ArchbaseEdit",
  "aiSummary": "Text input with DataSource integration",
  "complexity": "low",
  "codeSnippets": {
    "basic": "<ArchbaseEdit dataSource={ds} dataField='name' />",
    "withValidation": "// validation example"
  },
  "aiHints": [
    "Always include onChangeValue for external state",
    "Use dataSource for automatic binding"
  ]
}
```

## 🔧 **Development Guidelines**

### **Code Style**
- Use TypeScript strict mode
- Implement proper error handling
- Add JSDoc comments for public APIs
- Follow existing naming conventions

### **Testing Strategy**
```typescript
// TODO: Add tests for each generator
describe('FormGenerator', () => {
  it('should generate basic form with validation', () => {
    // Test implementation
  });
});
```

### **Template Guidelines**
- Use Handlebars helpers for common operations
- Include AI_PLACEHOLDER comments for customization
- Support both TypeScript and JavaScript output
- Include proper imports and exports

## 📋 **Configuration Files**

### **User Configuration (.archbaserc.json)**
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
    "forms": "./src/forms"
  },
  "preferences": {
    "typescript": true,
    "includeTests": true,
    "validationLibrary": "yup"
  }
}
```

## 🎮 **Development Workflow**

### **When Starting a Session**
1. Reference this document for context
2. Check current implementation status
3. Focus on Priority 1 tasks first
4. Test changes with `npm run dev`
5. Update this document if needed

### **When Implementing Generators**
1. Study the FormGenerator as reference
2. Follow the same pattern for configuration
3. Implement proper error handling
4. Add comprehensive templates
5. Test with real use cases

### **When Adding Templates**
1. Start with basic templates
2. Add proper TypeScript support
3. Include AI_PLACEHOLDER comments
4. Test template rendering
5. Add example usage

## 🔗 **Related Documentation**

- **Original Spec**: `/docs/archbase_cli_spec.md` (in archbase-react project)
- **Archbase React**: Context about the 91 migrated components with V1/V2 compatibility
- **DataSource V2**: Understanding of the new architecture for better code generation

## 💡 **Key Insights for Development**

1. **AI Integration is Core**: Every feature should consider AI consumption
2. **Templates are Critical**: Good templates = good generated code
3. **Knowledge Base is Dynamic**: Should grow with component analysis
4. **Performance Matters**: CLI should be fast and responsive
5. **TypeScript First**: All generated code should be type-safe

---

**Ready to continue development!** 🚀

Focus on implementing the remaining generators and creating comprehensive templates for the Archbase ecosystem.