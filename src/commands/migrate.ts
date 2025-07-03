/**
 * Migration Command - Tools for migrating between Archbase versions
 * 
 * Examples:
 * archbase migrate v1-to-v2 ./src --component ArchbaseEdit
 * archbase migrate analyze ./project --report
 * archbase migrate batch ./src --dry-run
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { ProjectScanner } from '../analyzers/ProjectScanner';

export interface MigrationRule {
  id: string;
  name: string;
  description: string;
  fromVersion: string;
  toVersion: string;
  componentNames: string[];
  transform: (code: string, filePath: string) => Promise<MigrationResult>;
}

export interface MigrationResult {
  success: boolean;
  code?: string;
  changes: MigrationChange[];
  errors: string[];
  warnings: string[];
}

export interface MigrationChange {
  type: 'replace' | 'add' | 'remove' | 'update';
  description: string;
  line?: number;
  column?: number;
  before?: string;
  after?: string;
}

export interface MigrationOptions {
  projectPath: string;
  component?: string;
  dryRun?: boolean;
  backup?: boolean;
  report?: boolean;
  outputPath?: string;
  includePatterns?: string[];
  excludePatterns?: string[];
}

export class MigrationEngine {
  private rules: MigrationRule[] = [];

  constructor() {
    this.initializeRules();
  }

  private initializeRules(): void {
    // DataSource V1 to V2 migration rules
    this.rules.push({
      id: 'datasource-v1-to-v2',
      name: 'DataSource V1 to V2 Migration',
      description: 'Migrates from ArchbaseDataSource to ArchbaseRemoteDataSource',
      fromVersion: '1.x',
      toVersion: '2.x',
      componentNames: ['ArchbaseEdit', 'ArchbaseSelect', 'ArchbaseTextArea', 'ArchbaseDataGrid'],
      transform: async (code: string, filePath: string) => {
        return this.transformDataSourceV1ToV2(code, filePath);
      }
    });

    // Form validation migration
    this.rules.push({
      id: 'form-validation-upgrade',
      name: 'Form Validation Upgrade',
      description: 'Updates form validation patterns to V2',
      fromVersion: '1.x',
      toVersion: '2.x',
      componentNames: ['ArchbaseFormTemplate'],
      transform: async (code: string, filePath: string) => {
        return this.transformFormValidation(code, filePath);
      }
    });

    // Event handler migration
    this.rules.push({
      id: 'event-handler-upgrade',
      name: 'Event Handler Upgrade',
      description: 'Updates event handler patterns for V2',
      fromVersion: '1.x',
      toVersion: '2.x',
      componentNames: ['ArchbaseDataGrid', 'ArchbaseFormTemplate'],
      transform: async (code: string, filePath: string) => {
        return this.transformEventHandlers(code, filePath);
      }
    });
  }

  async analyzeProject(options: MigrationOptions): Promise<{
    totalFiles: number;
    migrableFiles: number;
    issues: Array<{
      file: string;
      component: string;
      rule: string;
      complexity: 'simple' | 'medium' | 'complex';
      description: string;
    }>;
    estimatedEffort: string;
  }> {
    const scanner = new ProjectScanner();
    const result = await scanner.scanProject({
      projectPath: options.projectPath,
      includePatterns: options.includePatterns || ['**/*.{ts,tsx,js,jsx}'],
      excludePatterns: options.excludePatterns || ['node_modules/**', 'dist/**', 'build/**']
    });

    const issues: Array<{
      file: string;
      component: string;
      rule: string;
      complexity: 'simple' | 'medium' | 'complex';
      description: string;
    }> = [];
    const migrableFiles = new Set<string>();

    for (const component of result.components) {
      if (component.dataSourceVersion === 'v1' || !component.dataSourceVersion) {
        migrableFiles.add(component.file);
        
        const applicableRules = this.rules.filter(rule => 
          rule.componentNames.includes(component.name)
        );

        for (const rule of applicableRules) {
          const complexity = this.assessComplexity(component, rule);
          issues.push({
            file: component.file,
            component: component.name,
            rule: rule.id,
            complexity,
            description: rule.description
          });
        }
      }
    }

    let estimatedEffort = 'Low';
    if (issues.length > 10) estimatedEffort = 'Medium';
    if (issues.length > 25) estimatedEffort = 'High';

    return {
      totalFiles: result.statistics.filesScanned,
      migrableFiles: migrableFiles.size,
      issues,
      estimatedEffort
    };
  }

  private assessComplexity(component: any, rule: MigrationRule): 'simple' | 'medium' | 'complex' {
    const issueCount = component.issues.length;
    const propCount = component.props.length;

    if (issueCount === 0 && propCount <= 5) return 'simple';
    if (issueCount <= 2 && propCount <= 10) return 'medium';
    return 'complex';
  }

  async migrateFile(filePath: string, options: MigrationOptions): Promise<MigrationResult> {
    const code = await fs.readFile(filePath, 'utf-8');
    const allChanges: MigrationChange[] = [];
    const allErrors: string[] = [];
    const allWarnings: string[] = [];
    let currentCode = code;

    // Apply each applicable rule
    for (const rule of this.rules) {
      if (this.shouldApplyRule(currentCode, rule, options)) {
        const result = await rule.transform(currentCode, filePath);
        
        if (result.success && result.code) {
          currentCode = result.code;
          allChanges.push(...result.changes);
          allWarnings.push(...result.warnings);
        } else {
          allErrors.push(...result.errors);
        }
      }
    }

    return {
      success: allErrors.length === 0,
      code: currentCode,
      changes: allChanges,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  private shouldApplyRule(code: string, rule: MigrationRule, options: MigrationOptions): boolean {
    if (options.component && !rule.componentNames.includes(options.component)) {
      return false;
    }

    // Check if rule is applicable to this code
    const hasTargetComponents = rule.componentNames.some(comp => 
      code.includes(comp)
    );

    return hasTargetComponents;
  }

  private async transformDataSourceV1ToV2(code: string, filePath: string): Promise<MigrationResult> {
    const changes: MigrationChange[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx']
      });

      let modified = false;

      traverse(ast, {
        // Transform imports
        ImportDeclaration: (path) => {
          const source = path.node.source.value;
          if (source.includes('@archbase/react')) {
            path.node.specifiers.forEach(spec => {
              if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
                if (spec.imported.name === 'ArchbaseDataSource') {
                  spec.imported.name = 'ArchbaseRemoteDataSource';
                  modified = true;
                  changes.push({
                    type: 'replace',
                    description: 'Updated import from ArchbaseDataSource to ArchbaseRemoteDataSource',
                    line: path.node.loc?.start.line
                  });
                }
              }
            });
          }
        },

        // Transform JSX props
        JSXAttribute: (path) => {
          if (t.isJSXIdentifier(path.node.name)) {
            // Handle forceUpdate removal
            if (path.node.name.name === 'forceUpdate') {
              path.remove();
              modified = true;
              changes.push({
                type: 'remove',
                description: 'Removed forceUpdate prop (no longer needed in V2)',
                line: path.node.loc?.start.line
              });
            }
          }
        },

        // Transform method calls
        CallExpression: (path) => {
          if (t.isMemberExpression(path.node.callee) && 
              t.isIdentifier(path.node.callee.property)) {
            
            // Remove forceUpdate() calls
            if (path.node.callee.property.name === 'forceUpdate') {
              path.remove();
              modified = true;
              changes.push({
                type: 'remove',
                description: 'Removed forceUpdate() call (automatic in V2)',
                line: path.node.loc?.start.line
              });
            }

            // Update setFieldValue to use reactive pattern
            if (path.node.callee.property.name === 'setFieldValue') {
              warnings.push('setFieldValue calls should be reviewed for V2 reactive patterns');
            }
          }
        }
      });

      if (modified) {
        // Convert AST back to code
        const generate = require('@babel/generator').default;
        const result = generate(ast, { 
          retainLines: true,
          compact: false 
        });

        return {
          success: true,
          code: result.code,
          changes,
          errors,
          warnings
        };
      }

      return {
        success: true,
        code,
        changes,
        errors,
        warnings
      };

    } catch (error) {
      errors.push(`Failed to parse file: ${error.message}`);
      return {
        success: false,
        changes,
        errors,
        warnings
      };
    }
  }

  private async transformFormValidation(code: string, filePath: string): Promise<MigrationResult> {
    const changes: MigrationChange[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    // Simple text-based transformations for form validation
    let transformedCode = code;

    // Update validation prop patterns
    const validationPatterns = [
      {
        from: /validation={([^}]+)}/g,
        to: 'validationRules={$1}',
        description: 'Updated validation prop to validationRules'
      },
      {
        from: /onValidationError={([^}]+)}/g,
        to: 'onValidationFailed={$1}',
        description: 'Updated onValidationError to onValidationFailed'
      }
    ];

    for (const pattern of validationPatterns) {
      if (pattern.from.test(transformedCode)) {
        transformedCode = transformedCode.replace(pattern.from, pattern.to);
        changes.push({
          type: 'replace',
          description: pattern.description
        });
      }
    }

    return {
      success: true,
      code: transformedCode,
      changes,
      errors,
      warnings
    };
  }

  private async transformEventHandlers(code: string, filePath: string): Promise<MigrationResult> {
    const changes: MigrationChange[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    let transformedCode = code;

    // Update event handler patterns
    const eventPatterns = [
      {
        from: /onRowClick={([^}]+)}/g,
        to: 'onRowSelect={$1}',
        description: 'Updated onRowClick to onRowSelect'
      },
      {
        from: /onCellClick={([^}]+)}/g,
        to: 'onCellSelect={$1}',
        description: 'Updated onCellClick to onCellSelect'
      }
    ];

    for (const pattern of eventPatterns) {
      if (pattern.from.test(transformedCode)) {
        transformedCode = transformedCode.replace(pattern.from, pattern.to);
        changes.push({
          type: 'replace',
          description: pattern.description
        });
      }
    }

    return {
      success: true,
      code: transformedCode,
      changes,
      errors,
      warnings
    };
  }
}

export const migrateCommand = new Command('migrate')
  .description('Migration tools for Archbase versions')
  .addCommand(
    new Command('analyze')
      .description('Analyze project for migration opportunities')
      .argument('<project-path>', 'Path to project')
      .option('--component <name>', 'Focus on specific component')
      .option('--report', 'Generate detailed migration report')
      .option('--output <path>', 'Output path for report', './migration-analysis.json')
      .action(async (projectPath: string, options) => {
        const spinner = ora('Analyzing project for migration opportunities...').start();
        
        try {
          const engine = new MigrationEngine();
          const analysis = await engine.analyzeProject({
            projectPath: path.resolve(projectPath),
            component: options.component,
            report: options.report,
            outputPath: options.output
          });

          spinner.succeed('✅ Migration analysis completed!');

          console.log(chalk.cyan('\n📊 Migration Analysis Results:'));
          console.log(`   Total files scanned: ${analysis.totalFiles}`);
          console.log(`   Files requiring migration: ${analysis.migrableFiles}`);
          console.log(`   Migration issues found: ${analysis.issues.length}`);
          console.log(`   Estimated effort: ${analysis.estimatedEffort}`);

          if (analysis.issues.length > 0) {
            console.log(chalk.yellow('\n🔄 Migration Issues:'));
            
            // Group by complexity
            const byComplexity = analysis.issues.reduce((acc, issue) => {
              acc[issue.complexity] = (acc[issue.complexity] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            console.log(`   Simple: ${byComplexity.simple || 0} (auto-migratable)`);
            console.log(`   Medium: ${byComplexity.medium || 0} (semi-automatic)`);
            console.log(`   Complex: ${byComplexity.complex || 0} (manual review needed)`);

            // Show top issues
            console.log(chalk.blue('\n📋 Top Migration Issues:'));
            analysis.issues.slice(0, 10).forEach(issue => {
              const complexityColor = issue.complexity === 'simple' ? chalk.green : 
                                     issue.complexity === 'medium' ? chalk.yellow : chalk.red;
              console.log(`   ${complexityColor(issue.complexity.toUpperCase())} - ${issue.component} in ${issue.file}`);
              console.log(`     ${issue.description}`);
            });

            if (analysis.issues.length > 10) {
              console.log(chalk.gray(`   ... and ${analysis.issues.length - 10} more issues`));
            }
          }

          if (options.report) {
            await fs.writeJson(options.output, analysis, { spaces: 2 });
            console.log(chalk.green(`\n📄 Detailed report saved: ${options.output}`));
          }

          // Next steps
          console.log(chalk.green('\n🎯 Next Steps:'));
          const byComplexity = analysis.issues.reduce((acc, issue) => {
            acc[issue.complexity] = (acc[issue.complexity] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          if (byComplexity?.simple > 0) {
            console.log(`   🚀 Run automatic migration: archbase migrate v1-to-v2 ${projectPath}`);
          }
          if (byComplexity?.medium > 0) {
            console.log(`   📋 Review medium complexity issues manually`);
          }
          if (byComplexity?.complex > 0) {
            console.log(`   🔍 Complex issues require careful manual migration`);
          }

        } catch (error) {
          spinner.fail(chalk.red(`❌ Migration analysis failed: ${error.message}`));
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('v1-to-v2')
      .description('Migrate from DataSource V1 to V2')
      .argument('<project-path>', 'Path to project')
      .option('--component <name>', 'Focus on specific component')
      .option('--dry-run', 'Show changes without applying them')
      .option('--backup', 'Create backup of original files', true)
      .option('--include <patterns>', 'Include file patterns', '**/*.{ts,tsx,js,jsx}')
      .option('--exclude <patterns>', 'Exclude patterns', 'node_modules/**,dist/**,build/**')
      .action(async (projectPath: string, options) => {
        const spinner = ora('Starting V1 to V2 migration...').start();
        
        try {
          const engine = new MigrationEngine();
          const resolvedPath = path.resolve(projectPath);

          // First analyze to understand scope
          const analysis = await engine.analyzeProject({
            projectPath: resolvedPath,
            component: options.component,
            includePatterns: options.include.split(',').map((p: string) => p.trim()),
            excludePatterns: options.exclude.split(',').map((p: string) => p.trim())
          });

          spinner.text = 'Migrating files...';

          const files = await glob(options.include, {
            cwd: resolvedPath,
            absolute: true,
            ignore: options.exclude.split(',').map((p: string) => p.trim())
          });

          let migratedFiles = 0;
          let totalChanges = 0;
          const errors: string[] = [];

          for (const file of files) {
            try {
              const result = await engine.migrateFile(file, {
                projectPath: resolvedPath,
                component: options.component,
                dryRun: options.dryRun,
                backup: options.backup
              });

              if (result.success && result.changes.length > 0) {
                migratedFiles++;
                totalChanges += result.changes.length;

                if (options.dryRun) {
                  console.log(chalk.blue(`\n📝 ${path.relative(resolvedPath, file)}:`));
                  result.changes.forEach(change => {
                    console.log(`   ${change.type}: ${change.description}`);
                  });
                } else {
                  // Create backup if requested
                  if (options.backup) {
                    await fs.copy(file, `${file}.backup`);
                  }

                  // Write migrated code
                  await fs.writeFile(file, result.code!);
                  
                  console.log(chalk.green(`✅ Migrated ${path.relative(resolvedPath, file)} (${result.changes.length} changes)`));
                }

                if (result.warnings.length > 0) {
                  result.warnings.forEach(warning => {
                    console.log(chalk.yellow(`   ⚠️  ${warning}`));
                  });
                }
              }

              if (result.errors.length > 0) {
                errors.push(...result.errors);
              }

            } catch (error) {
              errors.push(`Failed to migrate ${file}: ${error.message}`);
            }
          }

          spinner.succeed('✅ Migration completed!');

          console.log(chalk.cyan('\n📊 Migration Summary:'));
          console.log(`   Files processed: ${files.length}`);
          console.log(`   Files migrated: ${migratedFiles}`);
          console.log(`   Total changes: ${totalChanges}`);

          if (errors.length > 0) {
            console.log(chalk.red(`\n❌ Errors (${errors.length}):`));
            errors.forEach(error => {
              console.log(`   ${error}`);
            });
          }

          if (options.dryRun) {
            console.log(chalk.gray('\n(This was a dry run - no files were modified)'));
          } else {
            console.log(chalk.green('\n🎯 Next Steps:'));
            console.log('   🧪 Test your application thoroughly');
            console.log('   📋 Review any warnings shown above');
            console.log('   🔍 Check complex components manually');
            if (options.backup) {
              console.log('   🗂️  Backup files created with .backup extension');
            }
          }

        } catch (error) {
          spinner.fail(chalk.red(`❌ Migration failed: ${error.message}`));
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('batch')
      .description('Batch migration with advanced options')
      .argument('<project-path>', 'Path to project')
      .option('--rules <ids>', 'Specific migration rules to apply (comma-separated)')
      .option('--exclude-complex', 'Skip complex migrations')
      .option('--dry-run', 'Show changes without applying them')
      .option('--report', 'Generate detailed migration report')
      .option('--output <path>', 'Output path for report', './batch-migration-report.json')
      .action(async (projectPath: string, options) => {
        const spinner = ora('Starting batch migration...').start();
        
        try {
          const engine = new MigrationEngine();
          const resolvedPath = path.resolve(projectPath);

          // Analyze first
          const analysis = await engine.analyzeProject({
            projectPath: resolvedPath,
            report: options.report,
            outputPath: options.output
          });

          spinner.text = 'Applying batch migrations...';

          // Filter issues based on options
          let issuesToMigrate = analysis.issues;
          
          if (options.excludeComplex) {
            issuesToMigrate = analysis.issues.filter(issue => issue.complexity !== 'complex');
          }

          if (options.rules) {
            const ruleIds = options.rules.split(',').map((r: string) => r.trim());
            issuesToMigrate = issuesToMigrate.filter(issue => ruleIds.includes(issue.rule));
          }

          console.log(chalk.blue(`\n🔄 Batch Migration Plan:`));
          console.log(`   Total issues: ${analysis.issues.length}`);
          console.log(`   Issues to migrate: ${issuesToMigrate.length}`);
          console.log(`   Estimated effort: ${analysis.estimatedEffort}`);

          if (options.dryRun) {
            console.log(chalk.gray('\n(Dry run - no changes will be applied)'));
          }

          // Group by file and execute
          const fileGroups = issuesToMigrate.reduce((acc, issue) => {
            acc[issue.file] = acc[issue.file] || [];
            acc[issue.file].push(issue);
            return acc;
          }, {} as Record<string, typeof issuesToMigrate>);

          let processedFiles = 0;
          let totalChanges = 0;
          const migrationErrors: string[] = [];

          for (const [file, issues] of Object.entries(fileGroups)) {
            try {
              const fullPath = path.resolve(resolvedPath, file);
              const result = await engine.migrateFile(fullPath, {
                projectPath: resolvedPath,
                dryRun: options.dryRun
              });

              if (result.success) {
                processedFiles++;
                totalChanges += result.changes.length;

                if (result.changes.length > 0) {
                  console.log(chalk.green(`✅ ${file} (${result.changes.length} changes)`));
                }
              } else {
                migrationErrors.push(`Failed to migrate ${file}: ${result.errors.join(', ')}`);
              }

            } catch (error) {
              migrationErrors.push(`Error processing ${file}: ${error.message}`);
            }
          }

          spinner.succeed('✅ Batch migration completed!');

          console.log(chalk.cyan('\n📊 Batch Migration Results:'));
          console.log(`   Files processed: ${processedFiles}`);
          console.log(`   Total changes: ${totalChanges}`);
          console.log(`   Errors: ${migrationErrors.length}`);

          if (migrationErrors.length > 0) {
            console.log(chalk.red('\n❌ Migration Errors:'));
            migrationErrors.forEach(error => {
              console.log(`   ${error}`);
            });
          }

          if (options.report) {
            const report = {
              timestamp: new Date().toISOString(),
              analysis,
              migration: {
                processedFiles,
                totalChanges,
                errors: migrationErrors
              }
            };

            await fs.writeJson(options.output, report, { spaces: 2 });
            console.log(chalk.green(`\n📄 Migration report saved: ${options.output}`));
          }

        } catch (error) {
          spinner.fail(chalk.red(`❌ Batch migration failed: ${error.message}`));
          process.exit(1);
        }
      })
  );