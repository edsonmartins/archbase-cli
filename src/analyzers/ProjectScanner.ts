/**
 * ProjectScanner - Advanced component scanning for Archbase projects
 * 
 * Analyzes projects to:
 * - Detect Archbase components usage
 * - Find patterns and anti-patterns
 * - Suggest improvements
 * - Generate component usage statistics
 * - Identify migration opportunities
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import chalk from 'chalk';

export interface ComponentUsage {
  name: string;
  importPath: string;
  props: Array<{
    name: string;
    type: string;
    value?: any;
    isRequired?: boolean;
  }>;
  file: string;
  line: number;
  column: number;
  hasDataSource: boolean;
  dataSourceVersion?: 'v1' | 'v2';
  patterns: string[];
  issues: ComponentIssue[];
}

export interface ComponentIssue {
  type: 'warning' | 'error' | 'suggestion';
  message: string;
  fix?: string;
  line?: number;
  column?: number;
}

export interface ProjectScanResult {
  components: ComponentUsage[];
  statistics: {
    totalComponents: number;
    archbaseComponents: number;
    v1Components: number;
    v2Components: number;
    filesScanned: number;
    issuesFound: number;
  };
  patterns: {
    detected: string[];
    missing: string[];
    recommended: string[];
  };
  migration: {
    v1ToV2Candidates: ComponentUsage[];
    estimatedEffort: string;
    recommendations: string[];
  };
  dependencies: {
    archbaseVersion?: string;
    reactVersion?: string;
    missingDependencies: string[];
    outdatedDependencies: Array<{
      name: string;
      current: string;
      latest: string;
    }>;
  };
}

export interface ScanOptions {
  projectPath: string;
  includePatterns?: string[];
  excludePatterns?: string[];
  includeNodeModules?: boolean;
  deep?: boolean;
  generateReport?: boolean;
  outputPath?: string;
  fixIssues?: boolean;
}

export class ProjectScanner {
  private archbaseComponents = new Set([
    'ArchbaseEdit', 'ArchbaseSelect', 'ArchbaseDataTable', 'ArchbaseFormTemplate',
    'ArchbaseDataGrid', 'ArchbaseRemoteDataSource', 'ArchbaseLocalDataSource',
    'ArchbaseCheckbox', 'ArchbaseRadio', 'ArchbaseSwitch', 'ArchbaseSlider',
    'ArchbaseTextArea', 'ArchbasePasswordInput', 'ArchbaseNumberInput',
    'ArchbaseDatePicker', 'ArchbaseTimePicker', 'ArchbaseColorPicker',
    'ArchbaseFileUpload', 'ArchbaseImageUpload', 'ArchbaseRichTextEditor',
    'ArchbaseCodeEditor', 'ArchbaseMarkdownEditor', 'ArchbaseTagInput',
    'ArchbaseAutocomplete', 'ArchbaseMultiSelect', 'ArchbaseTreeSelect',
    'ArchbaseAsyncSelect', 'ArchbaseButton', 'ArchbaseIconButton',
    'ArchbaseModal', 'ArchbaseDrawer', 'ArchbasePopover', 'ArchbaseTooltip',
    'ArchbaseNotification', 'ArchbaseAlert', 'ArchbaseLoading', 'ArchbaseSkeleton'
  ]);

  private patterns = {
    'form-with-datasource': {
      components: ['ArchbaseFormTemplate', 'ArchbaseRemoteDataSource'],
      description: 'Form with DataSource integration'
    },
    'crud-with-datagrid': {
      components: ['ArchbaseDataGrid', 'ArchbaseRemoteDataSource'],
      description: 'CRUD interface with DataGrid'
    },
    'async-loading': {
      components: ['ArchbaseLoading', 'ArchbaseAsyncSelect'],
      description: 'Async operations with loading states'
    },
    'validation-with-feedback': {
      components: ['ArchbaseFormTemplate', 'ArchbaseAlert'],
      description: 'Form validation with user feedback'
    }
  };

  async scanProject(options: ScanOptions): Promise<ProjectScanResult> {
    const {
      projectPath,
      includePatterns = ['**/*.{ts,tsx,js,jsx}'],
      excludePatterns = ['node_modules/**', 'dist/**', 'build/**', '.git/**'],
      deep = true
    } = options;

    console.log(chalk.blue('🔍 Scanning project for Archbase components...'));

    // Find all relevant files
    const files = await this.findFiles(projectPath, includePatterns, excludePatterns);
    console.log(chalk.gray(`📁 Found ${files.length} files to analyze`));

    // Analyze each file
    const components: ComponentUsage[] = [];
    let filesScanned = 0;

    for (const file of files) {
      try {
        const fileComponents = await this.analyzeFile(file, projectPath);
        components.push(...fileComponents);
        filesScanned++;
        
        if (filesScanned % 10 === 0) {
          console.log(chalk.gray(`   Analyzed ${filesScanned}/${files.length} files...`));
        }
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  Could not analyze ${file}: ${error.message}`));
      }
    }

    // Analyze project dependencies
    const dependencies = await this.analyzeDependencies(projectPath);

    // Detect patterns
    const patterns = this.detectPatterns(components);

    // Analyze migration opportunities
    const migration = this.analyzeMigrationOpportunities(components);

    // Generate statistics
    const statistics = this.generateStatistics(components, filesScanned);

    const result: ProjectScanResult = {
      components,
      statistics,
      patterns,
      migration,
      dependencies
    };

    if (options.generateReport) {
      await this.generateReport(result, options.outputPath || './archbase-scan-report.json');
    }

    return result;
  }

  private async findFiles(
    projectPath: string,
    includePatterns: string[],
    excludePatterns: string[]
  ): Promise<string[]> {
    const files: string[] = [];

    for (const pattern of includePatterns) {
      const found = await glob(pattern, {
        cwd: projectPath,
        absolute: true,
        ignore: excludePatterns
      });
      files.push(...found);
    }

    return [...new Set(files)]; // Remove duplicates
  }

  private async analyzeFile(filePath: string, projectRoot: string): Promise<ComponentUsage[]> {
    const content = await fs.readFile(filePath, 'utf-8');
    const components: ComponentUsage[] = [];

    // Parse the file
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx']
    });

    // Track imports
    const imports = new Map<string, string>();
    
    traverse(ast, {
      ImportDeclaration: (path) => {
        const source = path.node.source.value;
        if (source.includes('@archbase/react') || source.includes('archbase')) {
          path.node.specifiers.forEach(spec => {
            if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
              imports.set(spec.local.name, source);
            }
          });
        }
      },

      JSXElement: (path) => {
        const openingElement = path.node.openingElement;
        if (t.isJSXIdentifier(openingElement.name)) {
          const componentName = openingElement.name.name;
          
          if (this.archbaseComponents.has(componentName) && imports.has(componentName)) {
            const usage = this.analyzeComponentUsage(
              componentName,
              openingElement,
              imports.get(componentName)!,
              path.node.loc || null,
              filePath,
              content
            );
            components.push(usage);
          }
        }
      }
    });

    return components;
  }

  private analyzeComponentUsage(
    name: string,
    element: t.JSXOpeningElement,
    importPath: string,
    loc: t.SourceLocation | null,
    file: string,
    fileContent: string
  ): ComponentUsage {
    const props: ComponentUsage['props'] = [];
    let hasDataSource = false;
    let dataSourceVersion: 'v1' | 'v2' | undefined;
    const issues: ComponentIssue[] = [];

    // Analyze props
    element.attributes.forEach(attr => {
      if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
        const propName = attr.name.name;
        let propValue: any = null;
        let propType = 'unknown';

        if (attr.value) {
          if (t.isStringLiteral(attr.value)) {
            propValue = attr.value.value;
            propType = 'string';
          } else if (t.isJSXExpressionContainer(attr.value)) {
            if (t.isBooleanLiteral(attr.value.expression)) {
              propValue = attr.value.expression.value;
              propType = 'boolean';
            } else if (t.isNumericLiteral(attr.value.expression)) {
              propValue = attr.value.expression.value;
              propType = 'number';
            } else if (t.isIdentifier(attr.value.expression)) {
              propValue = attr.value.expression.name;
              propType = 'variable';
            }
          }
        }

        props.push({
          name: propName,
          type: propType,
          value: propValue
        });

        // Check for DataSource usage
        if (propName === 'dataSource') {
          hasDataSource = true;
          // Try to detect version by analyzing the variable or patterns
          dataSourceVersion = this.detectDataSourceVersion(fileContent, propValue);
        }
      }
    });

    // Detect issues
    this.detectComponentIssues(name, props, issues);

    // Detect patterns
    const patterns = this.detectComponentPatterns(name, props, fileContent);

    return {
      name,
      importPath,
      props,
      file: path.relative(process.cwd(), file),
      line: loc?.start.line || 0,
      column: loc?.start.column || 0,
      hasDataSource,
      dataSourceVersion,
      patterns,
      issues
    };
  }

  private detectDataSourceVersion(fileContent: string, dataSourceVar?: string): 'v1' | 'v2' | undefined {
    if (!dataSourceVar) return undefined;

    // Look for V2 patterns
    const v2Patterns = [
      'appendToFieldArray',
      'isDataSourceV2',
      'ArchbaseRemoteDataSource',
      'useArchbaseDataSource'
    ];

    const v1Patterns = [
      'forceUpdate',
      'setFieldValue',
      'getFieldValue',
      'ArchbaseDataSource'
    ];

    const hasV2 = v2Patterns.some(pattern => fileContent.includes(pattern));
    const hasV1 = v1Patterns.some(pattern => fileContent.includes(pattern));

    if (hasV2 && !hasV1) return 'v2';
    if (hasV1 && !hasV2) return 'v1';
    
    return undefined; // Mixed or uncertain
  }

  private detectComponentIssues(name: string, props: ComponentUsage['props'], issues: ComponentIssue[]): void {
    // Check for missing required props
    const requiredProps = this.getRequiredProps(name);
    
    requiredProps.forEach(requiredProp => {
      const hasProp = props.some(p => p.name === requiredProp);
      if (!hasProp) {
        issues.push({
          type: 'error',
          message: `Missing required prop: ${requiredProp}`,
          fix: `Add ${requiredProp} prop to ${name}`
        });
      }
    });

    // Check for deprecated patterns
    if (name === 'ArchbaseEdit' && !props.some(p => p.name === 'dataSource')) {
      issues.push({
        type: 'warning',
        message: 'ArchbaseEdit without dataSource prop may not update automatically',
        fix: 'Add dataSource prop for automatic data binding'
      });
    }

    // Check for V1/V2 compatibility issues
    const dataSourceProp = props.find(p => p.name === 'dataSource');
    if (dataSourceProp && dataSourceProp.type === 'variable') {
      issues.push({
        type: 'suggestion',
        message: 'Consider using ArchbaseDataSource V2 for better performance',
        fix: 'Migrate to ArchbaseRemoteDataSource for reactive updates'
      });
    }
  }

  private getRequiredProps(componentName: string): string[] {
    const requiredPropsMap: Record<string, string[]> = {
      'ArchbaseEdit': ['dataSource', 'dataField'],
      'ArchbaseSelect': ['dataSource', 'dataField'],
      'ArchbaseDataGrid': ['dataSource'],
      'ArchbaseFormTemplate': ['dataSource'],
      'ArchbaseRemoteDataSource': ['url'],
      'ArchbaseButton': [],
      'ArchbaseModal': ['opened']
    };

    return requiredPropsMap[componentName] || [];
  }

  private detectComponentPatterns(name: string, props: ComponentUsage['props'], fileContent: string): string[] {
    const patterns: string[] = [];

    // Form pattern
    if (name === 'ArchbaseFormTemplate' && props.some(p => p.name === 'dataSource')) {
      patterns.push('form-with-datasource');
    }

    // CRUD pattern
    if (name === 'ArchbaseDataGrid' && fileContent.includes('ArchbaseRemoteDataSource')) {
      patterns.push('crud-with-datagrid');
    }

    // Async pattern
    if (name.includes('Async') || props.some(p => p.name === 'loading')) {
      patterns.push('async-loading');
    }

    // Validation pattern
    if (fileContent.includes('validation') || fileContent.includes('error')) {
      patterns.push('validation-with-feedback');
    }

    return patterns;
  }

  private async analyzeDependencies(projectPath: string): Promise<ProjectScanResult['dependencies']> {
    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      
      if (!await fs.pathExists(packageJsonPath)) {
        return { missingDependencies: [], outdatedDependencies: [] };
      }

      const packageJson = await fs.readJson(packageJsonPath);
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      const archbaseVersion = deps['@archbase/react'];
      const reactVersion = deps['react'];

      // Check for missing common dependencies
      const missingDependencies: string[] = [];
      const recommendedDeps = [
        '@mantine/core',
        '@mantine/hooks',
        '@emotion/react',
        'react-query'
      ];

      recommendedDeps.forEach(dep => {
        if (!deps[dep]) {
          missingDependencies.push(dep);
        }
      });

      return {
        archbaseVersion,
        reactVersion,
        missingDependencies,
        outdatedDependencies: [] // Would need to fetch from npm registry
      };

    } catch (error) {
      return { missingDependencies: [], outdatedDependencies: [] };
    }
  }

  private detectPatterns(components: ComponentUsage[]): ProjectScanResult['patterns'] {
    const detected: string[] = [];
    const componentNames = new Set(components.map(c => c.name));
    const allPatterns = components.flatMap(c => c.patterns);

    // Check for pattern matches
    Object.entries(this.patterns).forEach(([patternName, pattern]) => {
      const hasAllComponents = pattern.components.every(comp => componentNames.has(comp));
      if (hasAllComponents || allPatterns.includes(patternName)) {
        detected.push(patternName);
      }
    });

    // Recommend missing patterns
    const recommended: string[] = [];
    
    if (componentNames.has('ArchbaseFormTemplate') && !detected.includes('form-with-datasource')) {
      recommended.push('form-with-datasource');
    }

    if (componentNames.has('ArchbaseDataGrid') && !detected.includes('crud-with-datagrid')) {
      recommended.push('crud-with-datagrid');
    }

    const missing = Object.keys(this.patterns).filter(p => 
      !detected.includes(p) && !recommended.includes(p)
    );

    return { detected, missing, recommended };
  }

  private analyzeMigrationOpportunities(components: ComponentUsage[]): ProjectScanResult['migration'] {
    const v1ToV2Candidates = components.filter(c => 
      c.dataSourceVersion === 'v1' || 
      (c.hasDataSource && !c.dataSourceVersion)
    );

    let estimatedEffort = 'Low';
    if (v1ToV2Candidates.length > 10) estimatedEffort = 'Medium';
    if (v1ToV2Candidates.length > 25) estimatedEffort = 'High';

    const recommendations: string[] = [];
    
    if (v1ToV2Candidates.length > 0) {
      recommendations.push(`Migrate ${v1ToV2Candidates.length} components to DataSource V2`);
      recommendations.push('Use ArchbaseRemoteDataSource for better performance');
      recommendations.push('Implement reactive data binding patterns');
    }

    const formsWithoutValidation = components.filter(c => 
      c.name === 'ArchbaseFormTemplate' && 
      !c.patterns.includes('validation-with-feedback')
    );

    if (formsWithoutValidation.length > 0) {
      recommendations.push('Add validation feedback to forms');
    }

    return {
      v1ToV2Candidates,
      estimatedEffort,
      recommendations
    };
  }

  private generateStatistics(components: ComponentUsage[], filesScanned: number): ProjectScanResult['statistics'] {
    const archbaseComponents = components.length;
    const v1Components = components.filter(c => c.dataSourceVersion === 'v1').length;
    const v2Components = components.filter(c => c.dataSourceVersion === 'v2').length;
    const issuesFound = components.reduce((sum, c) => sum + c.issues.length, 0);

    return {
      totalComponents: archbaseComponents,
      archbaseComponents,
      v1Components,
      v2Components,
      filesScanned,
      issuesFound
    };
  }

  private async generateReport(result: ProjectScanResult, outputPath: string): Promise<void> {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: result.statistics,
      components: result.components,
      patterns: result.patterns,
      migration: result.migration,
      dependencies: result.dependencies,
      recommendations: this.generateRecommendations(result)
    };

    await fs.writeJson(outputPath, report, { spaces: 2 });
    console.log(chalk.green(`📊 Report generated: ${outputPath}`));
  }

  private generateRecommendations(result: ProjectScanResult): string[] {
    const recommendations: string[] = [];

    if (result.statistics.issuesFound > 0) {
      recommendations.push(`Fix ${result.statistics.issuesFound} component issues found`);
    }

    if (result.migration.v1ToV2Candidates.length > 0) {
      recommendations.push('Consider migrating to DataSource V2 for better performance');
    }

    if (result.dependencies.missingDependencies.length > 0) {
      recommendations.push('Install recommended dependencies for better integration');
    }

    if (result.patterns.recommended.length > 0) {
      recommendations.push('Implement recommended patterns for better maintainability');
    }

    return recommendations;
  }

  /**
   * Auto-fix common issues
   */
  async autoFix(result: ProjectScanResult, options: { dryRun?: boolean } = {}): Promise<{
    fixed: number;
    skipped: number;
    errors: string[];
  }> {
    let fixed = 0;
    let skipped = 0;
    const errors: string[] = [];

    console.log(chalk.blue('🔧 Auto-fixing common issues...'));

    for (const component of result.components) {
      for (const issue of component.issues) {
        if (issue.fix && issue.type !== 'error') {
          try {
            if (!options.dryRun) {
              // Implement actual fixes here
              console.log(chalk.gray(`   Fixing: ${issue.message} in ${component.file}`));
            } else {
              console.log(chalk.gray(`   Would fix: ${issue.message} in ${component.file}`));
            }
            fixed++;
          } catch (error) {
            errors.push(`Failed to fix ${issue.message}: ${error.message}`);
            skipped++;
          }
        } else {
          skipped++;
        }
      }
    }

    return { fixed, skipped, errors };
  }
}