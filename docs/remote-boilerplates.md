# Remote Boilerplates

The Archbase CLI supports downloading and using boilerplates from remote sources like Git repositories and npm packages. This allows you to use community-created templates or your own organization's templates.

## Supported Sources

### Git Repositories
- GitHub repositories
- GitLab repositories  
- Bitbucket repositories
- Any accessible Git repository

### npm Packages
- Public npm packages
- Private npm packages (if you have access)
- Organization-scoped packages

## Usage Examples

### Using Git Repository

```bash
# From GitHub repository
archbase create project MyApp --git https://github.com/user/react-starter.git

# From specific branch
archbase create project MyApp --git https://github.com/user/react-starter.git --branch develop

# From subfolder in repository
archbase create project MyApp --git https://github.com/user/monorepo.git --subfolder packages/frontend-template

# From GitLab
archbase create project MyApp --git https://gitlab.com/user/vue-starter.git
```

### Using npm Package

```bash
# From npm package
archbase create project MyApp --npm create-react-app-template

# From scoped package
archbase create project MyApp --npm @company/frontend-template

# From specific version
archbase create project MyApp --npm react-boilerplate@2.1.0

# From subfolder in package
archbase create project MyApp --npm @company/templates --subfolder frontend
```

## Boilerplate Configuration

Remote boilerplates can include configuration files to define prompts, features, and customization options:

### archbase.config.json (Recommended)

```json
{
  "name": "My Custom Template",
  "version": "1.0.0",
  "description": "Custom React template with TypeScript",
  "category": "frontend",
  "features": {
    "typescript": true,
    "tailwind": true,
    "testing": true
  },
  "prompts": [
    {
      "name": "projectName",
      "message": "Project name:",
      "type": "input",
      "validate": "required|alphanumeric"
    },
    {
      "name": "useTypeScript",
      "message": "Use TypeScript?",
      "type": "confirm",
      "default": true
    },
    {
      "name": "features",
      "message": "Select features:",
      "type": "multiselect",
      "choices": [
        { "name": "routing", "message": "React Router" },
        { "name": "state-management", "message": "Redux Toolkit" },
        { "name": "ui-library", "message": "Material-UI" }
      ]
    }
  ],
  "dependencies": {
    "react": "^18.0.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "vite": "^4.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Fallback to package.json

If no `archbase.config.json` is found, the CLI will use information from `package.json`:

```json
{
  "name": "my-template",
  "version": "1.0.0",
  "description": "My custom template",
  "keywords": ["archbase-boilerplate"],
  "archbase": {
    "version": "0.1.0"
  }
}
```

## Template Structure

### With Template Directory

```
my-template/
├── archbase.config.json
├── template/
│   ├── src/
│   ├── public/
│   ├── package.json.hbs
│   └── README.md.hbs
└── hooks/
    └── setup.js
```

### Direct Structure

```
my-template/
├── archbase.config.json
├── src/
├── public/
├── package.json.hbs
├── README.md.hbs
└── hooks/
    └── setup.js
```

## Handlebars Templates

Template files ending with `.hbs` will be processed with Handlebars:

### package.json.hbs
```json
{
  "name": "{{projectName}}",
  "description": "{{projectDescription}}",
  "dependencies": {
    {{#if features.typescript}}
    "typescript": "^5.0.0",
    {{/if}}
    {{#if features.routing}}
    "react-router-dom": "^6.0.0",
    {{/if}}
    "react": "^18.0.0"
  }
}
```

### README.md.hbs
```markdown
# {{projectName}}

{{projectDescription}}

## Features

{{#each features}}
- {{this}}
{{/each}}

## Getting Started

```bash
npm install
npm run dev
```
```

## Post-Install Hooks

You can include setup scripts that run after project creation:

### hooks/setup.js
```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up your project...');

// Access environment variables
const projectName = process.env.PROJECT_NAME;
const projectPath = process.env.PROJECT_PATH;
const answers = JSON.parse(process.env.ARCHBASE_ANSWERS || '{}');

// Perform custom setup
if (answers.installDependencies) {
  console.log('📦 Installing dependencies...');
  execSync('npm install', { cwd: projectPath, stdio: 'inherit' });
}

if (answers.initializeGit) {
  console.log('🔧 Initializing Git repository...');
  execSync('git init', { cwd: projectPath });
  execSync('git add .', { cwd: projectPath });
  execSync('git commit -m "Initial commit"', { cwd: projectPath });
}

console.log('✅ Setup complete!');
```

## Cache Management

The CLI caches downloaded boilerplates for faster subsequent use:

```bash
# List cached boilerplates
archbase cache list

# Show detailed cache information
archbase cache info

# Clear all cache
archbase cache clear

# Remove specific cached boilerplate
archbase cache remove my-template
```

## Best Practices

### For Template Authors

1. **Include Configuration**: Always include `archbase.config.json` for better user experience
2. **Use Handlebars**: Make templates dynamic with Handlebars variables
3. **Add Validation**: Use prompt validation to ensure correct input
4. **Include Hooks**: Add setup scripts for complex initialization
5. **Document Usage**: Include clear README with usage instructions
6. **Mark as Archbase Template**: Add `archbase-boilerplate` keyword to package.json

### For Template Users

1. **Review Templates**: Check the repository/package before using
2. **Use Cache**: Take advantage of caching for frequently used templates
3. **Specify Versions**: Pin to specific versions for reproducible builds
4. **Check Compatibility**: Ensure template is compatible with your environment

## Security Considerations

- Only use templates from trusted sources
- Review template code before using in production
- Be cautious with post-install hooks that execute scripts
- Use specific versions/branches rather than latest for production

## Examples

### Creating a React + TypeScript Template

```bash
# Use community template
archbase create project MyApp --git https://github.com/vitejs/vite-react-ts-template.git

# Use organization template  
archbase create project MyApp --npm @mycompany/react-template --branch production
```

### Creating a Next.js Template

```bash
# Official Next.js template
archbase create project MyApp --npm create-next-app --subfolder templates/typescript

# Custom Next.js template
archbase create project MyApp --git https://github.com/myorg/nextjs-boilerplate.git
```