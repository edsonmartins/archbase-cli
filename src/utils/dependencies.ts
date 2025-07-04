/**
 * Dependencies Management for Archbase CLI
 * 
 * Manages required dependencies based on archbase-react v2.1.3
 * Automatically includes all necessary dependencies in generated projects
 */

export interface DependencyConfig {
  name: string;
  version: string;
  required: boolean;
  category: 'core' | 'ui' | 'data' | 'utils' | 'dev';
  description?: string;
}

export interface ProjectDependencies {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
}

/**
 * Core dependencies required by archbase-react
 * Based on archbase-react v2.1.3 package.json analysis
 */
export const ARCHBASE_CORE_DEPENDENCIES: DependencyConfig[] = [
  // React ecosystem (peer dependencies)
  { name: 'react', version: '^18.3.1', required: true, category: 'core', description: 'React library' },
  { name: 'react-dom', version: '^18.3.1', required: true, category: 'core', description: 'React DOM library' },
  
  // Archbase main library
  { name: 'archbase-react', version: '^2.1.3', required: true, category: 'core', description: 'Archbase React components library' },
  
  // Mantine 8.x ecosystem (all required by archbase-react)
  { name: '@mantine/core', version: '8.1.2', required: true, category: 'ui', description: 'Mantine core components' },
  { name: '@mantine/hooks', version: '8.1.2', required: true, category: 'ui', description: 'Mantine hooks' },
  { name: '@mantine/emotion', version: '8.1.2', required: true, category: 'ui', description: 'Mantine emotion styling' },
  { name: '@mantine/dates', version: '8.1.2', required: true, category: 'ui', description: 'Mantine date components' },
  { name: '@mantine/dropzone', version: '8.1.2', required: true, category: 'ui', description: 'Mantine dropzone component' },
  { name: '@mantine/modals', version: '8.1.2', required: true, category: 'ui', description: 'Mantine modal system' },
  { name: '@mantine/notifications', version: '8.1.2', required: true, category: 'ui', description: 'Mantine notifications' },
  
  // Icons and UI utilities
  { name: '@tabler/icons-react', version: '^2.47.0', required: true, category: 'ui', description: 'Tabler icons for React' },
  
  // Data management
  { name: '@tanstack/react-query', version: '^5.81.5', required: true, category: 'data', description: 'React Query for data fetching' },
  { name: 'axios', version: '^1.7.2', required: true, category: 'data', description: 'HTTP client' },
  
  // Utility libraries
  { name: 'clsx', version: '^2.1.1', required: true, category: 'utils', description: 'Conditional class names' },
  { name: 'dayjs', version: '1.11.10', required: true, category: 'utils', description: 'Date manipulation library' },
  { name: 'uuid', version: '^9.0.1', required: true, category: 'utils', description: 'UUID generation' },
  { name: 'lodash', version: '4.17.21', required: true, category: 'utils', description: 'Utility functions' },
  
  // Internationalization
  { name: 'i18next', version: '23.7.6', required: true, category: 'utils', description: 'Internationalization framework' },
  { name: 'react-i18next', version: '13.4.1', required: true, category: 'utils', description: 'React bindings for i18next' },
  { name: 'i18next-browser-languagedetector', version: '^7.2.1', required: true, category: 'utils', description: 'Language detection plugin' },
  
  // Dependency injection
  { name: 'inversify', version: '6.0.1', required: true, category: 'core', description: 'IoC container' },
  { name: 'inversify-react', version: '^1.1.1', required: true, category: 'core', description: 'React bindings for Inversify' },
  { name: 'reflect-metadata', version: '^0.1.14', required: true, category: 'core', description: 'Metadata reflection API' },
  
  // Routing
  { name: 'react-router', version: '6.21.2', required: true, category: 'core', description: 'React router' },
  { name: 'react-router-dom', version: '6.21.2', required: true, category: 'core', description: 'React router DOM bindings' },
  
  // Forms and validation
  { name: 'final-form', version: '^4.20.10', required: true, category: 'data', description: 'Final Form core' },
  { name: 'react-final-form', version: '^6.5.9', required: true, category: 'data', description: 'React Final Form bindings' },
  { name: 'final-form-arrays', version: '^3.1.0', required: true, category: 'data', description: 'Final Form arrays support' },
  { name: 'react-final-form-arrays', version: '^3.1.4', required: true, category: 'data', description: 'React Final Form arrays' },
];

/**
 * Optional dependencies for specific features
 */
export const ARCHBASE_OPTIONAL_DEPENDENCIES: DependencyConfig[] = [
  // Rich text editing
  { name: '@mantine/tiptap', version: '8.1.2', required: false, category: 'ui', description: 'Mantine TipTap integration' },
  { name: 'suneditor', version: '^2.46.3', required: false, category: 'ui', description: 'WYSIWYG editor' },
  { name: 'suneditor-react', version: '^3.6.1', required: false, category: 'ui', description: 'SunEditor React wrapper' },
  
  // Advanced data components
  { name: '@mui/x-data-grid', version: '^7.28.3', required: false, category: 'ui', description: 'Material-UI DataGrid' },
  { name: 'mantine-react-table', version: '2.0.0-beta.8', required: false, category: 'ui', description: 'Mantine React Table' },
  
  // Authentication
  { name: 'jwt-decode', version: '^3.1.2', required: false, category: 'utils', description: 'JWT token decoding' },
  { name: 'js-cookie', version: '^3.0.5', required: false, category: 'utils', description: 'Cookie management' },
  
  // File handling
  { name: 'file-saver', version: '^2.0.5', required: false, category: 'utils', description: 'File saving utility' },
  { name: 'export-to-csv', version: '^0.2.2', required: false, category: 'utils', description: 'CSV export utility' },
  { name: 'xlsx', version: '^0.18.5', required: false, category: 'utils', description: 'Excel file handling' },
  
  // PDF generation
  { name: 'jspdf', version: '^2.5.1', required: false, category: 'utils', description: 'PDF generation' },
  { name: 'jspdf-autotable', version: '^3.8.2', required: false, category: 'utils', description: 'PDF table generation' },
  
  // Charts and visualization
  { name: 'd3', version: '^7.9.0', required: false, category: 'ui', description: 'D3.js visualization library' },
  { name: 'react-konva', version: '^18.2.10', required: false, category: 'ui', description: 'Canvas library for React' },
  
  // Image handling
  { name: 'react-easy-crop', version: '^5.4.1', required: false, category: 'ui', description: 'Image cropping component' },
  
  // Masking and formatting
  { name: 'react-imask', version: '^7.6.1', required: false, category: 'ui', description: 'Input masking' },
  { name: 'libphonenumber-js', version: '^1.11.3', required: false, category: 'utils', description: 'Phone number formatting' },
  
  // Color utilities
  { name: 'react-color', version: '^2.19.3', required: false, category: 'ui', description: 'Color picker components' },
  { name: 'color', version: '^4.2.3', required: false, category: 'utils', description: 'Color manipulation' },
];

/**
 * Development dependencies for TypeScript and tooling
 */
export const ARCHBASE_DEV_DEPENDENCIES: DependencyConfig[] = [
  // TypeScript
  { name: 'typescript', version: '^5.6.3', required: true, category: 'dev', description: 'TypeScript compiler' },
  { name: '@types/react', version: '^18.3.3', required: true, category: 'dev', description: 'React type definitions' },
  { name: '@types/react-dom', version: '^18.3.0', required: true, category: 'dev', description: 'React DOM type definitions' },
  { name: '@types/node', version: '^20.14.2', required: true, category: 'dev', description: 'Node.js type definitions' },
  { name: '@types/uuid', version: '^9.0.1', required: true, category: 'dev', description: 'UUID type definitions' },
  { name: '@types/lodash', version: '^4.17.7', required: true, category: 'dev', description: 'Lodash type definitions' },
  
  // PostCSS and Mantine styling
  { name: 'postcss', version: '^8.4.38', required: true, category: 'dev', description: 'CSS processing tool' },
  { name: 'postcss-preset-mantine', version: '^1.15.0', required: true, category: 'dev', description: 'Mantine PostCSS preset' },
  { name: 'postcss-simple-vars', version: '^7.0.1', required: true, category: 'dev', description: 'PostCSS variables' },
];

/**
 * Get dependencies for a specific project type
 */
export function getProjectDependencies(projectType: 'basic' | 'admin' | 'full' = 'basic'): ProjectDependencies {
  const coreDeps = ARCHBASE_CORE_DEPENDENCIES.filter(dep => dep.required);
  const devDeps = ARCHBASE_DEV_DEPENDENCIES.filter(dep => dep.required);
  
  let optionalDeps: DependencyConfig[] = [];
  
  switch (projectType) {
    case 'admin':
      // Include admin-specific dependencies
      optionalDeps = ARCHBASE_OPTIONAL_DEPENDENCIES.filter(dep => 
        ['@mui/x-data-grid', 'mantine-react-table', 'jwt-decode', 'js-cookie', 'file-saver', 'export-to-csv'].includes(dep.name)
      );
      break;
    case 'full':
      // Include all optional dependencies
      optionalDeps = ARCHBASE_OPTIONAL_DEPENDENCIES;
      break;
    default:
      // Basic project - only core dependencies
      break;
  }
  
  const dependencies: Record<string, string> = {};
  const devDependencies: Record<string, string> = {};
  const peerDependencies: Record<string, string> = {};
  
  // Add core dependencies
  [...coreDeps, ...optionalDeps].forEach(dep => {
    if (dep.name === 'react' || dep.name === 'react-dom') {
      peerDependencies[dep.name] = dep.version;
    } else {
      dependencies[dep.name] = dep.version;
    }
  });
  
  // Add dev dependencies
  devDeps.forEach(dep => {
    devDependencies[dep.name] = dep.version;
  });
  
  return {
    dependencies,
    devDependencies,
    peerDependencies
  };
}

/**
 * Get dependencies for specific features
 */
export function getFeatureDependencies(features: string[]): DependencyConfig[] {
  const featureMap: Record<string, string[]> = {
    'rich-text': ['@mantine/tiptap', 'suneditor', 'suneditor-react'],
    'data-grid': ['@mui/x-data-grid', 'mantine-react-table'],
    'auth': ['jwt-decode', 'js-cookie'],
    'file-export': ['file-saver', 'export-to-csv', 'xlsx'],
    'pdf': ['jspdf', 'jspdf-autotable'],
    'charts': ['d3', 'react-konva'],
    'image-crop': ['react-easy-crop'],
    'input-mask': ['react-imask', 'libphonenumber-js'],
    'color-picker': ['react-color', 'color'],
  };
  
  const requiredDeps: string[] = [];
  features.forEach(feature => {
    if (featureMap[feature]) {
      requiredDeps.push(...featureMap[feature]);
    }
  });
  
  return ARCHBASE_OPTIONAL_DEPENDENCIES.filter(dep => 
    requiredDeps.includes(dep.name)
  );
}

/**
 * Generate package.json dependencies section
 */
export function generatePackageJsonDependencies(
  projectType: 'basic' | 'admin' | 'full' = 'basic',
  additionalFeatures: string[] = []
): ProjectDependencies {
  const baseDeps = getProjectDependencies(projectType);
  const featureDeps = getFeatureDependencies(additionalFeatures);
  
  // Merge feature dependencies
  featureDeps.forEach(dep => {
    baseDeps.dependencies[dep.name] = dep.version;
  });
  
  return baseDeps;
}

/**
 * Get PostCSS configuration for Mantine 8
 */
export function getMantinePostCSSConfig(): string {
  return `module.exports = {
  plugins: {
    'postcss-preset-mantine': {},
    'postcss-simple-vars': {
      variables: {
        'mantine-breakpoint-xs': '36em',
        'mantine-breakpoint-sm': '48em',
        'mantine-breakpoint-md': '62em',
        'mantine-breakpoint-lg': '75em',
        'mantine-breakpoint-xl': '88em',
      },
    },
  },
};`;
}

/**
 * Get Mantine theme provider setup
 */
export function getMantineThemeSetup(): string {
  return `import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

// Import Mantine styles
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider>
      <ModalsProvider>
        <Notifications />
        {children}
      </ModalsProvider>
    </MantineProvider>
  );
}`;
}