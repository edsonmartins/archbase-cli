/**
 * ComponentAnalyzer - AST-based analysis of React components
 * 
 * This analyzer extracts information from Archbase React components:
 * - Component props and their types
 * - DataSource usage (V1 vs V2)
 * - Component complexity
 * - Dependencies and imports
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

interface ComponentAnalysis {
  name: string;
  filePath: string;
  props: PropDefinition[];
  imports: ImportInfo[];
  dataSourceUsage: {
    hasDataSource: boolean;
    version: 'v1' | 'v2' | 'both' | 'unknown';
    fields: string[];
  };
  complexity: 'low' | 'medium' | 'high';
  hooks: string[];
  dependencies: string[];
}

interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  defaultValue?: any;
}

interface ImportInfo {
  source: string;
  specifiers: string[];
  isDefault: boolean;
}

export class ComponentAnalyzer {
  
  async analyzeFile(filePath: string): Promise<ComponentAnalysis | null> {
    return this.analyzeComponent(filePath);
  }
  
  async analyzeComponent(filePath: string): Promise<ComponentAnalysis | null> {
    try {
      const code = await fs.readFile(filePath, 'utf-8');
      const ast = this.parseCode(code);
      
      if (!ast) return null;
      
      const analysis: ComponentAnalysis = {
        name: '',
        filePath,
        props: [],
        imports: [],
        dataSourceUsage: {
          hasDataSource: false,
          version: 'unknown',
          fields: []
        },
        complexity: 'low',
        hooks: [],
        dependencies: []
      };
      
      this.extractComponentInfo(ast, analysis);
      this.calculateComplexity(analysis);
      
      return analysis;
      
    } catch (error) {
      console.warn(`Failed to analyze component at ${filePath}:`, error.message);
      return null;
    }
  }
  
  async analyzeDirectory(dirPath: string, pattern: string = '**/*.{ts,tsx}'): Promise<ComponentAnalysis[]> {
    const glob = require('glob');
    const files = glob.sync(pattern, { cwd: dirPath, absolute: true });
    
    const analyses: ComponentAnalysis[] = [];
    
    for (const file of files) {
      const analysis = await this.analyzeComponent(file);
      if (analysis && analysis.name) {
        analyses.push(analysis);
      }
    }
    
    return analyses;
  }
  
  private parseCode(code: string) {
    try {
      return parse(code, {
        sourceType: 'module',
        plugins: [
          'typescript',
          'jsx',
          'decorators-legacy',
          'classProperties',
          'objectRestSpread'
        ]
      });
    } catch (error) {
      console.warn('Failed to parse code:', error.message);
      return null;
    }
  }
  
  private extractComponentInfo(ast: any, analysis: ComponentAnalysis): void {
    traverse(ast, {
      // Extract imports
      ImportDeclaration: (path) => {
        const source = path.node.source.value;
        const specifiers: string[] = [];
        let isDefault = false;
        
        path.node.specifiers.forEach((spec) => {
          if (t.isImportDefaultSpecifier(spec)) {
            specifiers.push(spec.local.name);
            isDefault = true;
          } else if (t.isImportSpecifier(spec)) {
            specifiers.push(t.isIdentifier(spec.imported) ? spec.imported.name : spec.imported.value);
          }
        });
        
        analysis.imports.push({ source, specifiers, isDefault });
        
        // Check for Archbase dependencies
        if (source.includes('@archbase') || source.includes('./datasource')) {
          analysis.dependencies.push(source);
        }
      },
      
      // Extract function components
      FunctionDeclaration: (path) => {
        if (this.isReactComponent(path.node)) {
          analysis.name = path.node.id?.name || '';
          this.extractPropsFromFunction(path.node, analysis);
        }
      },
      
      // Extract arrow function components
      VariableDeclarator: (path) => {
        if (t.isArrowFunctionExpression(path.node.init) || t.isFunctionExpression(path.node.init)) {
          if (this.isReactComponent(path.node.init)) {
            analysis.name = (path.node.id as t.Identifier)?.name || '';
            this.extractPropsFromFunction(path.node.init, analysis);
          }
        }
      },
      
      // Extract TypeScript interfaces (for props)
      TSInterfaceDeclaration: (path) => {
        const interfaceName = path.node.id.name;
        if (interfaceName.includes('Props')) {
          this.extractPropsFromInterface(path.node, analysis);
        }
      },
      
      // Detect DataSource usage
      MemberExpression: (path) => {
        if (t.isIdentifier(path.node.object) && 
            path.node.object.name === 'dataSource') {
          analysis.dataSourceUsage.hasDataSource = true;
          
          if (t.isIdentifier(path.node.property)) {
            const method = path.node.property.name;
            
            // Detect V2 methods
            if (['appendToFieldArray', 'updateFieldArrayItem', 'removeFromFieldArray'].includes(method)) {
              analysis.dataSourceUsage.version = 'v2';
            } else if (analysis.dataSourceUsage.version === 'unknown') {
              analysis.dataSourceUsage.version = 'v1';
            }
          }
        }
      },
      
      // Detect hooks usage
      CallExpression: (path) => {
        if (t.isIdentifier(path.node.callee) && 
            path.node.callee.name.startsWith('use')) {
          analysis.hooks.push(path.node.callee.name);
        }
      }
    });
  }
  
  private isReactComponent(node: any): boolean {
    // Check if function returns JSX
    if (t.isFunctionDeclaration(node) || t.isArrowFunctionExpression(node) || t.isFunctionExpression(node)) {
      // Simple heuristic: component name starts with capital letter
      const name = (t.isFunctionDeclaration(node) && node.id) ? node.id.name : '';
      return /^[A-Z]/.test(name);
    }
    return false;
  }
  
  private extractPropsFromFunction(node: any, analysis: ComponentAnalysis): void {
    // Extract props from function parameters
    if (node.params && node.params.length > 0) {
      const param = node.params[0];
      
      if (t.isObjectPattern(param)) {
        param.properties.forEach((prop) => {
          if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
            analysis.props.push({
              name: prop.key.name,
              type: 'unknown', // Would need more sophisticated type extraction
              required: false,
              description: undefined
            });
          }
        });
      }
    }
  }
  
  private extractPropsFromInterface(node: t.TSInterfaceDeclaration, analysis: ComponentAnalysis): void {
    node.body.body.forEach((member) => {
      if (t.isTSPropertySignature(member) && t.isIdentifier(member.key)) {
        const prop: PropDefinition = {
          name: member.key.name,
          type: this.extractTypeFromTSType(member.typeAnnotation?.typeAnnotation),
          required: !member.optional,
          description: undefined // Could extract from JSDoc comments
        };
        
        analysis.props.push(prop);
        
        // Check for DataSource props
        if (prop.name === 'dataSource' || prop.name === 'dataField') {
          analysis.dataSourceUsage.hasDataSource = true;
          if (prop.name === 'dataField') {
            analysis.dataSourceUsage.fields.push(prop.name);
          }
        }
      }
    });
  }
  
  private extractTypeFromTSType(typeNode: any): string {
    if (!typeNode) return 'unknown';
    
    if (t.isTSStringKeyword(typeNode)) return 'string';
    if (t.isTSNumberKeyword(typeNode)) return 'number';
    if (t.isTSBooleanKeyword(typeNode)) return 'boolean';
    if (t.isTSAnyKeyword(typeNode)) return 'any';
    
    if (t.isTSTypeReference(typeNode) && t.isIdentifier(typeNode.typeName)) {
      return typeNode.typeName.name;
    }
    
    if (t.isTSUnionType(typeNode)) {
      const types = typeNode.types.map(t => this.extractTypeFromTSType(t));
      return types.join(' | ');
    }
    
    return 'unknown';
  }
  
  private calculateComplexity(analysis: ComponentAnalysis): void {
    let score = 0;
    
    // Base score from props count
    score += analysis.props.length;
    
    // DataSource usage adds complexity
    if (analysis.dataSourceUsage.hasDataSource) {
      score += 2;
    }
    
    // Hooks usage
    score += analysis.hooks.length;
    
    // Dependencies
    score += analysis.dependencies.length;
    
    // Classify complexity
    if (score <= 5) {
      analysis.complexity = 'low';
    } else if (score <= 15) {
      analysis.complexity = 'medium';
    } else {
      analysis.complexity = 'high';
    }
  }
}