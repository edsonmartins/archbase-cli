# Remote Boilerplate Usage Examples

This document demonstrates how to use the remote boilerplate functionality in Archbase CLI.

## Quick Start

### 1. Using a Git Repository

```bash
# Create project from a public GitHub repository
archbase create project MyReactApp --git https://github.com/facebook/create-react-app.git

# From a specific branch
archbase create project MyApp --git https://github.com/vitejs/vite.git --branch main --subfolder packages/create-vite/template-react-ts

# From GitLab
archbase create project MyVueApp --git https://gitlab.com/vue/vue-starter.git
```

### 2. Using npm Packages

```bash
# Use an npm boilerplate package
archbase create project MyNextApp --npm create-next-app

# Use a scoped package
archbase create project MyApp --npm @company/react-template

# Use specific version
archbase create project MyApp --npm create-react-app@5.0.0
```

## Cache Management

### Check cache status
```bash
archbase cache info
```

### List cached boilerplates
```bash
archbase cache list --detailed
```

### Clear cache
```bash
archbase cache clear
```

## Local Boilerplate Examples

### 1. Admin Dashboard (Built-in)
```bash
archbase create project AdminPanel --boilerplate admin-dashboard --interactive
```

### 2. Marketplace E-commerce (Built-in)
```bash
archbase create project MyMarketplace --boilerplate marketplace-ecommerce --interactive
```

### 3. SaaS Starter (Built-in)
```bash
archbase create project MySaaS --boilerplate saas-starter --interactive
```

## Available Local Boilerplates

You can see all available local boilerplates:

```bash
archbase create list-boilerplates --detailed
```

## Tips

1. **Use cache**: Remote boilerplates are cached automatically for faster subsequent use
2. **Interactive mode**: Use `--interactive` flag for guided setup with prompts
3. **Check compatibility**: Ensure the remote template is compatible with your needs
4. **Review code**: Always review templates from unknown sources before use

## Creating Your Own Remote Boilerplate

To create a boilerplate that works with Archbase CLI:

1. Create an `archbase.config.json` file with prompts and configuration
2. Use `.hbs` extensions for template files that need variable substitution
3. Add `archbase-boilerplate` keyword to package.json
4. Include setup hooks in a `hooks/` directory
5. Document usage in README

Example structure:
```
my-boilerplate/
├── archbase.config.json
├── template/
│   ├── src/
│   ├── package.json.hbs
│   └── README.md.hbs
└── hooks/
    └── setup.js
```