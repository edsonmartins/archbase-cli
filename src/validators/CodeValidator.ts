/**
 * CodeValidator - Validates generated code for syntax and quality
 * 
 * This class provides validation for TypeScript/JavaScript code generated
 * by the CLI to ensure it's syntactically correct and follows best practices.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metrics: CodeMetrics;
}

export interface ValidationError {
  type: 'syntax' | 'import' | 'type' | 'structure';
  message: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  type: 'best-practice' | 'performance' | 'accessibility' | 'security';
  message: string;
  line?: number;
  suggestion?: string;
}

export interface CodeMetrics {
  linesOfCode: number;
  complexity: number;
  componentCount: number;
  hookCount: number;
  importCount: number;
  hasTests: boolean;
  hasTypeScript: boolean;
}

export class CodeValidator {
  private rules: ValidationRule[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Validate a TypeScript/React file
   */
  async validateFile(filePath: string): Promise<ValidationResult> {
    try {
      const code = await fs.readFile(filePath, 'utf-8');
      return this.validateCode(code, filePath);
    } catch (error) {
      return {
        isValid: false,
        errors: [{
          type: 'syntax',
          message: `Failed to read file: ${error.message}`,
          severity: 'error'
        }],
        warnings: [],
        metrics: this.getEmptyMetrics()
      };
    }
  }

  /**
   * Validate code string
   */
  validateCode(code: string, fileName: string = 'generated.tsx'): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      metrics: this.getEmptyMetrics()
    };

    try {
      // Parse the code
      const ast = parse(code, {
        sourceType: 'module',
        plugins: [
          'typescript',
          'jsx',
          'decorators-legacy',
          'classProperties',
          'objectRestSpread',
          'asyncGenerators',
          'functionBind',
          'dynamicImport'
        ]
      });

      // Calculate metrics
      result.metrics = this.calculateMetrics(code, ast);

      // Run validation rules
      this.runValidationRules(ast, code, result, fileName);

    } catch (error) {
      result.isValid = false;
      result.errors.push({
        type: 'syntax',
        message: `Parse error: ${error.message}`,
        line: error.loc?.line,
        column: error.loc?.column,
        severity: 'error'
      });
    }

    // Set overall validity
    result.isValid = result.errors.filter(e => e.severity === 'error').length === 0;

    return result;
  }

  /**
   * Validate generated project structure
   */
  async validateProject(projectPath: string): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      metrics: this.getEmptyMetrics()
    };

    try {
      // Check package.json
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (!(await fs.pathExists(packageJsonPath))) {
        result.errors.push({
          type: 'structure',
          message: 'Missing package.json file',
          severity: 'error'
        });
      } else {
        const packageJson = await fs.readJson(packageJsonPath);
        this.validatePackageJson(packageJson, result);
      }

      // Check TypeScript config
      const tsconfigPath = path.join(projectPath, 'tsconfig.json');
      if (!(await fs.pathExists(tsconfigPath))) {
        result.warnings.push({
          type: 'best-practice',
          message: 'Missing tsconfig.json - TypeScript configuration recommended',
          suggestion: 'Add tsconfig.json for better type checking'
        });
      }

      // Validate source files
      const srcPath = path.join(projectPath, 'src');
      if (await fs.pathExists(srcPath)) {
        await this.validateSourceDirectory(srcPath, result);
      }

    } catch (error) {
      result.errors.push({
        type: 'structure',
        message: `Project validation failed: ${error.message}`,
        severity: 'error'
      });
    }

    result.isValid = result.errors.filter(e => e.severity === 'error').length === 0;
    return result;
  }

  private initializeDefaultRules(): void {
    this.rules = [
      {
        name: 'react-component-structure',
        check: (ast, code, result) => {
          let hasDefaultExport = false;
          let componentName = '';

          traverse(ast, {
            ExportDefaultDeclaration: (path) => {
              hasDefaultExport = true;
              if (t.isFunctionDeclaration(path.node.declaration)) {
                componentName = path.node.declaration.id?.name || '';
              }
            },
            FunctionDeclaration: (path) => {
              if (path.node.id?.name && /^[A-Z]/.test(path.node.id.name)) {
                componentName = path.node.id.name;
              }
            }
          });

          if (!hasDefaultExport) {
            result.warnings.push({
              type: 'best-practice',
              message: 'React component should have a default export',
              suggestion: 'Add `export default ${componentName}`'
            });
          }
        }
      },
      {
        name: 'typescript-props-interface',
        check: (ast, code, result) => {
          let hasPropsInterface = false;
          let componentName = '';

          traverse(ast, {
            TSInterfaceDeclaration: (path) => {
              const name = path.node.id.name;
              if (name.endsWith('Props')) {
                hasPropsInterface = true;
              }
            },
            FunctionDeclaration: (path) => {
              if (path.node.id?.name && /^[A-Z]/.test(path.node.id.name)) {
                componentName = path.node.id.name;
              }
            }
          });

          if (componentName && !hasPropsInterface && code.includes('props')) {
            result.warnings.push({
              type: 'best-practice',
              message: `Component ${componentName} should define a Props interface`,
              suggestion: `Add interface ${componentName}Props { ... }`
            });
          }
        }
      },
      {
        name: 'required-imports',
        check: (ast, code, result) => {
          let hasReactImport = false;
          let usesJSX = false;

          traverse(ast, {
            ImportDeclaration: (path) => {
              if (path.node.source.value === 'react') {
                hasReactImport = true;
              }
            },
            JSXElement: () => {
              usesJSX = true;
            }
          });

          if (usesJSX && !hasReactImport) {
            result.errors.push({
              type: 'import',
              message: 'Missing React import for JSX usage',
              severity: 'error'
            });
          }
        }
      },
      {
        name: 'archbase-imports',
        check: (ast, code, result) => {
          const archbaseComponents = new Set<string>();
          let hasArchbaseImport = false;

          traverse(ast, {
            ImportDeclaration: (path) => {
              if (path.node.source.value === '@archbase/react') {
                hasArchbaseImport = true;
              }
            },
            JSXElement: (path) => {
              const elementName = path.node.openingElement.name;
              if (t.isJSXIdentifier(elementName) && elementName.name.startsWith('Archbase')) {
                archbaseComponents.add(elementName.name);
              }
            }
          });

          if (archbaseComponents.size > 0 && !hasArchbaseImport) {
            result.errors.push({
              type: 'import',
              message: 'Missing @archbase/react import for Archbase components',
              severity: 'error'
            });
          }
        }
      }
    ];
  }

  private runValidationRules(ast: any, code: string, result: ValidationResult, fileName: string): void {
    for (const rule of this.rules) {
      try {
        rule.check(ast, code, result);
      } catch (error) {
        result.warnings.push({
          type: 'best-practice',
          message: `Validation rule '${rule.name}' failed: ${error.message}`
        });
      }
    }
  }

  private calculateMetrics(code: string, ast: any): CodeMetrics {
    const metrics: CodeMetrics = {
      linesOfCode: code.split('\n').length,
      complexity: 1,
      componentCount: 0,
      hookCount: 0,
      importCount: 0,
      hasTests: false,
      hasTypeScript: code.includes('interface ') || code.includes(': ') || code.includes('type ')
    };

    traverse(ast, {
      ImportDeclaration: () => {
        metrics.importCount++;
      },
      FunctionDeclaration: (path) => {
        if (path.node.id?.name && /^[A-Z]/.test(path.node.id.name)) {
          metrics.componentCount++;
        }
        if (path.node.id?.name && path.node.id.name.startsWith('use')) {
          metrics.hookCount++;
        }
      },
      CallExpression: (path) => {
        if (t.isIdentifier(path.node.callee) && path.node.callee.name.startsWith('use')) {
          metrics.hookCount++;
        }
      },
      IfStatement: () => {
        metrics.complexity++;
      },
      ConditionalExpression: () => {
        metrics.complexity++;
      },
      LogicalExpression: () => {
        metrics.complexity++;
      }
    });

    return metrics;
  }

  private async validateSourceDirectory(srcPath: string, result: ValidationResult): Promise<void> {
    const files = await fs.readdir(srcPath, { withFileTypes: true });
    
    for (const file of files) {
      if (file.isDirectory()) {
        await this.validateSourceDirectory(path.join(srcPath, file.name), result);
      } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
        const filePath = path.join(srcPath, file.name);
        const fileResult = await this.validateFile(filePath);
        
        // Merge results
        result.errors.push(...fileResult.errors);
        result.warnings.push(...fileResult.warnings);
        result.metrics.linesOfCode += fileResult.metrics.linesOfCode;
        result.metrics.componentCount += fileResult.metrics.componentCount;
        result.metrics.hookCount += fileResult.metrics.hookCount;
        result.metrics.importCount += fileResult.metrics.importCount;
      }
    }
  }

  private validatePackageJson(packageJson: any, result: ValidationResult): void {
    // Check required dependencies
    const requiredDeps = ['react', 'react-dom'];
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    for (const dep of requiredDeps) {
      if (!dependencies[dep]) {
        result.errors.push({
          type: 'structure',
          message: `Missing required dependency: ${dep}`,
          severity: 'error'
        });
      }
    }

    // Check for recommended dependencies
    const recommendedDeps = ['typescript', '@types/react', '@types/react-dom'];
    for (const dep of recommendedDeps) {
      if (!dependencies[dep]) {
        result.warnings.push({
          type: 'best-practice',
          message: `Missing recommended dependency: ${dep}`,
          suggestion: `Add ${dep} for better development experience`
        });
      }
    }

    // Check scripts
    const requiredScripts = ['build', 'dev'];
    for (const script of requiredScripts) {
      if (!packageJson.scripts?.[script]) {
        result.warnings.push({
          type: 'best-practice',
          message: `Missing script: ${script}`,
          suggestion: `Add "${script}" script to package.json`
        });
      }
    }
  }

  private getEmptyMetrics(): CodeMetrics {
    return {
      linesOfCode: 0,
      complexity: 0,
      componentCount: 0,
      hookCount: 0,
      importCount: 0,
      hasTests: false,
      hasTypeScript: false
    };
  }
}

interface ValidationRule {
  name: string;
  check: (ast: any, code: string, result: ValidationResult) => void;
}