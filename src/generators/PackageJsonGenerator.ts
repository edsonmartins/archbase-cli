/**
 * PackageJsonGenerator - Generate package.json with Archbase dependencies
 * 
 * Automatically includes all required dependencies based on archbase-react v2.1.3
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { generatePackageJsonDependencies, getMantinePostCSSConfig, getMantineThemeSetup } from '../utils/dependencies';

interface PackageJsonConfig {
  name: string;
  version?: string;
  description?: string;
  author?: string;
  license?: string;
  projectType?: 'basic' | 'admin' | 'full';
  features?: string[];
  outputDir: string;
  typescript?: boolean;
  scripts?: Record<string, string>;
}

interface GenerationResult {
  files: string[];
  success: boolean;
  errors?: string[];
}

export class PackageJsonGenerator {
  
  async generate(config: PackageJsonConfig): Promise<GenerationResult> {
    try {
      const files: string[] = [];
      
      // Generate package.json
      const packageJsonFile = await this.generatePackageJson(config);
      files.push(packageJsonFile);
      
      // Generate PostCSS config if TypeScript project
      if (config.typescript !== false) {
        const postCssFile = await this.generatePostCSSConfig(config.outputDir);
        files.push(postCssFile);
        
        // Generate Mantine theme provider
        const themeFile = await this.generateThemeProvider(config.outputDir);
        files.push(themeFile);
      }
      
      // Generate TypeScript config if needed
      if (config.typescript !== false) {
        const tsConfigFile = await this.generateTsConfig(config.outputDir);
        files.push(tsConfigFile);
      }
      
      return { files, success: true };
      
    } catch (error) {
      return { 
        files: [], 
        success: false, 
        errors: [error.message] 
      };
    }
  }
  
  private async generatePackageJson(config: PackageJsonConfig): Promise<string> {
    const dependencies = generatePackageJsonDependencies(
      config.projectType || 'basic',
      config.features || []
    );
    
    const defaultScripts = {
      "dev": "vite",
      "build": "tsc && vite build",
      "preview": "vite preview",
      "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
      "lint:fix": "eslint . --ext ts,tsx --fix",
      "type-check": "tsc --noEmit"
    };
    
    const packageJson = {
      name: config.name,
      version: config.version || "0.1.0",
      description: config.description || `Archbase React application - ${config.name}`,
      author: config.author || "",
      license: config.license || "MIT",
      type: "module",
      scripts: {
        ...defaultScripts,
        ...(config.scripts || {})
      },
      dependencies: this.sortObjectKeys(dependencies.dependencies),
      devDependencies: this.sortObjectKeys({
        ...dependencies.devDependencies,
        // Add build tools
        "vite": "^5.0.0",
        "@vitejs/plugin-react": "^4.2.1",
        "eslint": "^8.56.0",
        "@typescript-eslint/eslint-plugin": "^6.15.0",
        "@typescript-eslint/parser": "^6.15.0",
        "eslint-plugin-react": "^7.34.2",
        "eslint-plugin-react-hooks": "^4.6.2",
        "eslint-plugin-react-refresh": "^0.4.5"
      }),
      peerDependencies: dependencies.peerDependencies,
      engines: {
        "node": ">=16.0.0",
        "npm": ">=8.0.0"
      },
      browserslist: [
        "> 1%",
        "not dead",
        "not edge <= 18",
        "not ie 11",
        "not op_mini all"
      ]
    };
    
    const content = JSON.stringify(packageJson, null, 2);
    const filePath = path.join(config.outputDir, 'package.json');
    
    await fs.ensureDir(config.outputDir);
    await fs.writeFile(filePath, content);
    
    return filePath;
  }
  
  private async generatePostCSSConfig(outputDir: string): Promise<string> {
    const content = getMantinePostCSSConfig();
    const filePath = path.join(outputDir, 'postcss.config.js');
    
    await fs.writeFile(filePath, content);
    return filePath;
  }
  
  private async generateThemeProvider(outputDir: string): Promise<string> {
    const content = getMantineThemeSetup();
    const filePath = path.join(outputDir, 'src', 'providers', 'AppProvider.tsx');
    
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content);
    return filePath;
  }
  
  private async generateTsConfig(outputDir: string): Promise<string> {
    const tsConfig = {
      compilerOptions: {
        target: "ESNext",
        useDefineForClassFields: true,
        lib: ["DOM", "DOM.Iterable", "ESNext"],
        allowJs: false,
        skipLibCheck: true,
        esModuleInterop: false,
        allowSyntheticDefaultImports: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        experimentalDecorators: true,
        module: "ESNext",
        moduleResolution: "Node",
        resolveJsonModule: true,
        isolatedModules: true,
        noImplicitAny: false,
        noImplicitReturns: false,
        noImplicitThis: true,
        strictPropertyInitialization: false,
        noEmit: true,
        jsx: "react-jsx",
        baseUrl: "./src",
        paths: {
          "@/*": ["./*"]
        }
      },
      include: ["src"],
      exclude: ["**/*.story.tsx"],
      references: [{ path: "./tsconfig.node.json" }]
    };
    
    const content = JSON.stringify(tsConfig, null, 2);
    const filePath = path.join(outputDir, 'tsconfig.json');
    
    await fs.writeFile(filePath, content);
    return filePath;
  }
  
  private async generateViteConfig(outputDir: string): Promise<string> {
    const content = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@domain': path.resolve(__dirname, './src/domain'),
      '@services': path.resolve(__dirname, './src/services'),
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
})`;
    
    const filePath = path.join(outputDir, 'vite.config.ts');
    await fs.writeFile(filePath, content);
    return filePath;
  }
  
  private sortObjectKeys(obj: Record<string, string>): Record<string, string> {
    const sorted: Record<string, string> = {};
    Object.keys(obj).sort().forEach(key => {
      sorted[key] = obj[key];
    });
    return sorted;
  }
  
  /**
   * Generate installation instructions
   */
  generateInstallationInstructions(config: PackageJsonConfig): string {
    const projectType = config.projectType || 'basic';
    const features = config.features || [];
    
    let instructions = `# ${config.name} - Archbase React Project

## Installation

\`\`\`bash
# Install dependencies
npm install

# Or with yarn
yarn install

# Or with pnpm
pnpm install
\`\`\`

## Development

\`\`\`bash
# Start development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Build for production
npm run build
\`\`\`

## Project Configuration

This project includes all necessary dependencies for Archbase React development:

### Core Dependencies
- **archbase-react**: Component library
- **@mantine/core**: UI components (v8.x)
- **React**: ^18.3.1
- **TypeScript**: Full type safety
- **Vite**: Fast build tool

### Project Type: ${projectType}
`;

    if (projectType === 'admin') {
      instructions += `
### Admin Features Included
- Data grids and tables
- Authentication support
- File export capabilities
- Admin navigation patterns
`;
    }

    if (projectType === 'full') {
      instructions += `
### Full Feature Set Included
- Rich text editing
- Advanced data components
- Authentication
- File handling and export
- PDF generation
- Charts and visualization
- Image processing
- Input masking
- Color picker
`;
    }

    if (features.length > 0) {
      instructions += `
### Additional Features
${features.map(feature => `- ${feature}`).join('\n')}
`;
    }

    instructions += `
## Mantine Configuration

The project is pre-configured with Mantine 8.x:
- PostCSS configuration included
- Theme provider setup
- All necessary CSS imports
- Responsive breakpoints configured

## Getting Started

1. Import the AppProvider in your main.tsx:

\`\`\`tsx
import { AppProvider } from './providers/AppProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>,
)
\`\`\`

2. Start using Archbase components:

\`\`\`tsx
import { ArchbaseEdit } from 'archbase-react';
import { Button } from '@mantine/core'

function MyComponent() {
  return (
    <div>
      <ArchbaseEdit label="Name" />
      <Button>Submit</Button>
    </div>
  )
}
\`\`\`

## Documentation

- [Archbase React Docs](https://react.archbase.com.br)
- [Mantine Docs](https://mantine.dev)
- [Vite Docs](https://vitejs.dev)
`;

    return instructions;
  }
}