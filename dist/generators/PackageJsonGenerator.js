"use strict";
/**
 * PackageJsonGenerator - Generate package.json with Archbase dependencies
 *
 * Automatically includes all required dependencies based on archbase-react v2.1.3
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageJsonGenerator = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const dependencies_1 = require("../utils/dependencies");
class PackageJsonGenerator {
    async generate(config) {
        try {
            const files = [];
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
        }
        catch (error) {
            return {
                files: [],
                success: false,
                errors: [error.message]
            };
        }
    }
    async generatePackageJson(config) {
        const dependencies = (0, dependencies_1.generatePackageJsonDependencies)(config.projectType || 'basic', config.features || []);
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
    async generatePostCSSConfig(outputDir) {
        const content = (0, dependencies_1.getMantinePostCSSConfig)();
        const filePath = path.join(outputDir, 'postcss.config.js');
        await fs.writeFile(filePath, content);
        return filePath;
    }
    async generateThemeProvider(outputDir) {
        const content = (0, dependencies_1.getMantineThemeSetup)();
        const filePath = path.join(outputDir, 'src', 'providers', 'AppProvider.tsx');
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, content);
        return filePath;
    }
    async generateTsConfig(outputDir) {
        const tsConfig = {
            compilerOptions: {
                target: "ES2020",
                useDefineForClassFields: true,
                lib: ["ES2020", "DOM", "DOM.Iterable"],
                module: "ESNext",
                skipLibCheck: true,
                // Bundle resolution
                moduleResolution: "bundler",
                allowImportingTsExtensions: true,
                resolveJsonModule: true,
                isolatedModules: true,
                noEmit: true,
                jsx: "react-jsx",
                // Linting
                strict: true,
                noUnusedLocals: true,
                noUnusedParameters: true,
                noFallthroughCasesInSwitch: true,
                // Path mapping for cleaner imports
                baseUrl: ".",
                paths: {
                    "@/*": ["./src/*"],
                    "@components/*": ["./src/components/*"],
                    "@pages/*": ["./src/pages/*"],
                    "@utils/*": ["./src/utils/*"],
                    "@types/*": ["./src/types/*"],
                    "@domain/*": ["./src/domain/*"],
                    "@services/*": ["./src/services/*"]
                },
                // Decorators support for Inversify
                experimentalDecorators: true,
                emitDecoratorMetadata: true
            },
            include: ["src"],
            references: [{ path: "./tsconfig.node.json" }]
        };
        const content = JSON.stringify(tsConfig, null, 2);
        const filePath = path.join(outputDir, 'tsconfig.json');
        await fs.writeFile(filePath, content);
        return filePath;
    }
    async generateViteConfig(outputDir) {
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
    sortObjectKeys(obj) {
        const sorted = {};
        Object.keys(obj).sort().forEach(key => {
            sorted[key] = obj[key];
        });
        return sorted;
    }
    /**
     * Generate installation instructions
     */
    generateInstallationInstructions(config) {
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
exports.PackageJsonGenerator = PackageJsonGenerator;
//# sourceMappingURL=PackageJsonGenerator.js.map