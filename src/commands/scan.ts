/**
 * Scan Command - Advanced project analysis and component scanning
 * 
 * Examples:
 * archbase scan project ./my-project
 * archbase scan components ./src --report
 * archbase scan migration ./project --auto-fix
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as path from 'path';
import { ProjectScanner, ScanOptions } from '../analyzers/ProjectScanner';
import { RealtimeScanner } from '../analyzers/RealtimeScanner';

export const scanCommand = new Command('scan')
  .description('Advanced project analysis and component scanning')
  .addCommand(
    new Command('project')
      .description('Scan entire project for Archbase components and patterns')
      .argument('<project-path>', 'Path to project to scan')
      .option('--report', 'Generate detailed JSON report')
      .option('--output <path>', 'Output path for report', './archbase-scan-report.json')
      .option('--include <patterns>', 'Include file patterns (comma-separated)', '**/*.{ts,tsx,js,jsx}')
      .option('--exclude <patterns>', 'Exclude patterns (comma-separated)', 'node_modules/**,dist/**,build/**')
      .option('--deep', 'Deep analysis with performance impact')
      .option('--fix', 'Auto-fix common issues')
      .option('--dry-run', 'Show what would be fixed without applying changes')
      .action(async (projectPath: string, options) => {
        console.log(chalk.blue(`🔍 Scanning project: ${projectPath}`));
        
        const spinner = ora('Initializing project scanner...').start();
        
        try {
          const scanner = new ProjectScanner();
          
          const scanOptions: ScanOptions = {
            projectPath: path.resolve(projectPath),
            includePatterns: options.include.split(',').map((p: string) => p.trim()),
            excludePatterns: options.exclude.split(',').map((p: string) => p.trim()),
            deep: options.deep,
            generateReport: options.report,
            outputPath: options.output,
            fixIssues: options.fix
          };

          spinner.text = 'Scanning project files...';
          const result = await scanner.scanProject(scanOptions);
          
          spinner.succeed('✅ Project scan completed!');
          
          // Display summary
          console.log(chalk.cyan('\n📊 Scan Results:'));
          console.log(`   Files scanned: ${result.statistics.filesScanned}`);
          console.log(`   Archbase components found: ${result.statistics.archbaseComponents}`);
          console.log(`   DataSource V1 components: ${result.statistics.v1Components}`);
          console.log(`   DataSource V2 components: ${result.statistics.v2Components}`);
          console.log(`   Issues found: ${result.statistics.issuesFound}`);

          // Display patterns
          if (result.patterns.detected.length > 0) {
            console.log(chalk.green(`\n✅ Patterns detected:`));
            result.patterns.detected.forEach(pattern => {
              console.log(`   • ${pattern}`);
            });
          }

          if (result.patterns.recommended.length > 0) {
            console.log(chalk.yellow(`\n💡 Recommended patterns:`));
            result.patterns.recommended.forEach(pattern => {
              console.log(`   • ${pattern}`);
            });
          }

          // Display migration opportunities
          if (result.migration.v1ToV2Candidates.length > 0) {
            console.log(chalk.blue(`\n🔄 Migration Opportunities:`));
            console.log(`   Components that can be migrated to V2: ${result.migration.v1ToV2Candidates.length}`);
            console.log(`   Estimated effort: ${result.migration.estimatedEffort}`);
            
            result.migration.recommendations.forEach(rec => {
              console.log(`   • ${rec}`);
            });
          }

          // Display issues
          if (result.statistics.issuesFound > 0) {
            console.log(chalk.red(`\n⚠️  Issues Found:`));
            
            const issues = result.components.flatMap(c => 
              c.issues.map(issue => ({ ...issue, component: c.name, file: c.file }))
            );

            // Group by type
            const errors = issues.filter(i => i.type === 'error');
            const warnings = issues.filter(i => i.type === 'warning');
            const suggestions = issues.filter(i => i.type === 'suggestion');

            if (errors.length > 0) {
              console.log(chalk.red(`\n   Errors (${errors.length}):`));
              errors.slice(0, 5).forEach(issue => {
                console.log(`   ❌ ${issue.component} in ${issue.file}: ${issue.message}`);
              });
              if (errors.length > 5) {
                console.log(chalk.gray(`   ... and ${errors.length - 5} more errors`));
              }
            }

            if (warnings.length > 0) {
              console.log(chalk.yellow(`\n   Warnings (${warnings.length}):`));
              warnings.slice(0, 3).forEach(issue => {
                console.log(`   ⚠️  ${issue.component} in ${issue.file}: ${issue.message}`);
              });
              if (warnings.length > 3) {
                console.log(chalk.gray(`   ... and ${warnings.length - 3} more warnings`));
              }
            }

            if (suggestions.length > 0) {
              console.log(chalk.blue(`\n   Suggestions (${suggestions.length}):`));
              suggestions.slice(0, 3).forEach(issue => {
                console.log(`   💡 ${issue.component} in ${issue.file}: ${issue.message}`);
              });
              if (suggestions.length > 3) {
                console.log(chalk.gray(`   ... and ${suggestions.length - 3} more suggestions`));
              }
            }
          }

          // Auto-fix if requested
          if (options.fix || options.dryRun) {
            console.log(chalk.blue('\n🔧 Auto-fixing issues...'));
            const fixResult = await scanner.autoFix(result, { dryRun: options.dryRun });
            
            if (options.dryRun) {
              console.log(chalk.gray(`   Would fix: ${fixResult.fixed} issues`));
              console.log(chalk.gray(`   Would skip: ${fixResult.skipped} issues`));
            } else {
              console.log(chalk.green(`   Fixed: ${fixResult.fixed} issues`));
              console.log(chalk.yellow(`   Skipped: ${fixResult.skipped} issues`));
            }

            if (fixResult.errors.length > 0) {
              console.log(chalk.red(`   Errors during fixing:`));
              fixResult.errors.forEach(error => {
                console.log(`   ❌ ${error}`);
              });
            }
          }

          // Show next steps
          console.log(chalk.green('\n🎯 Next Steps:'));
          
          if (options.report) {
            console.log(`   📄 View detailed report: ${options.output}`);
          }
          
          if (result.migration.v1ToV2Candidates.length > 0) {
            console.log(`   🔄 Run migration: archbase scan migration ${projectPath}`);
          }
          
          if (result.patterns.recommended.length > 0) {
            console.log(`   🎨 Implement patterns: archbase generate <pattern>`);
          }

          if (result.statistics.issuesFound > 0 && !options.fix) {
            console.log(`   🔧 Auto-fix issues: archbase scan project ${projectPath} --fix`);
          }

        } catch (error) {
          spinner.fail(chalk.red(`❌ Scan failed: ${error.message}`));
          console.error(error);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('components')
      .description('Scan for component usage and analyze patterns')
      .argument('<path>', 'Path to scan for components')
      .option('--component <name>', 'Focus on specific component')
      .option('--format <fmt>', 'Output format (table|json|csv)', 'table')
      .option('--detailed', 'Show detailed component information')
      .action(async (scanPath: string, options) => {
        const spinner = ora('Scanning components...').start();
        
        try {
          const scanner = new ProjectScanner();
          const result = await scanner.scanProject({
            projectPath: path.resolve(scanPath),
            deep: options.detailed
          });

          spinner.succeed('✅ Component scan completed!');

          let componentsToShow = result.components;
          
          if (options.component) {
            componentsToShow = result.components.filter(c => 
              c.name.toLowerCase().includes(options.component.toLowerCase())
            );
          }

          if (options.format === 'json') {
            console.log(JSON.stringify(componentsToShow, null, 2));
          } else if (options.format === 'csv') {
            console.log('Component,File,Line,HasDataSource,Version,Issues');
            componentsToShow.forEach(c => {
              console.log(`${c.name},${c.file},${c.line},${c.hasDataSource},${c.dataSourceVersion || 'unknown'},${c.issues.length}`);
            });
          } else {
            // Table format
            console.log(chalk.cyan('\n📋 Component Usage:'));
            
            if (componentsToShow.length === 0) {
              console.log(chalk.yellow('No components found matching criteria.'));
              return;
            }

            componentsToShow.forEach(component => {
              console.log(`\n${chalk.cyan(component.name)} ${chalk.gray(`(${component.file}:${component.line})`)}`);
              console.log(`   Import: ${component.importPath}`);
              
              if (component.hasDataSource) {
                const version = component.dataSourceVersion || 'unknown';
                const versionColor = version === 'v2' ? chalk.green : version === 'v1' ? chalk.yellow : chalk.gray;
                console.log(`   DataSource: ${versionColor(version.toUpperCase())}`);
              }

              if (component.props.length > 0) {
                console.log(`   Props: ${component.props.map(p => `${p.name}:${p.type}`).join(', ')}`);
              }

              if (component.patterns.length > 0) {
                console.log(`   Patterns: ${component.patterns.join(', ')}`);
              }

              if (component.issues.length > 0) {
                console.log(`   Issues: ${component.issues.length}`);
                if (options.detailed) {
                  component.issues.forEach(issue => {
                    const color = issue.type === 'error' ? chalk.red : issue.type === 'warning' ? chalk.yellow : chalk.blue;
                    console.log(`     ${color(issue.type.toUpperCase())}: ${issue.message}`);
                  });
                }
              }
            });

            console.log(chalk.green(`\n📊 Total: ${componentsToShow.length} components`));
          }

        } catch (error) {
          spinner.fail(chalk.red(`❌ Component scan failed: ${error.message}`));
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('migration')
      .description('Analyze and assist with DataSource V1 to V2 migration')
      .argument('<project-path>', 'Path to project')
      .option('--component <name>', 'Focus on specific component')
      .option('--auto-migrate', 'Automatically migrate simple cases')
      .option('--dry-run', 'Show migration plan without executing')
      .action(async (projectPath: string, options) => {
        const spinner = ora('Analyzing migration opportunities...').start();
        
        try {
          const scanner = new ProjectScanner();
          const result = await scanner.scanProject({
            projectPath: path.resolve(projectPath),
            deep: true
          });

          spinner.succeed('✅ Migration analysis completed!');

          const candidates = result.migration.v1ToV2Candidates;
          
          if (candidates.length === 0) {
            console.log(chalk.green('🎉 No migration candidates found! Your project is using DataSource V2 patterns.'));
            return;
          }

          console.log(chalk.blue(`\n🔄 Migration Analysis:`));
          console.log(`   Components to migrate: ${candidates.length}`);
          console.log(`   Estimated effort: ${result.migration.estimatedEffort}`);

          // Filter by component if specified
          let componentsToMigrate = candidates;
          if (options.component) {
            componentsToMigrate = candidates.filter(c => 
              c.name.toLowerCase().includes(options.component.toLowerCase())
            );
          }

          console.log(chalk.yellow(`\n📋 Migration Candidates:`));
          componentsToMigrate.forEach(component => {
            console.log(`\n   ${chalk.cyan(component.name)} ${chalk.gray(`(${component.file}:${component.line})`)}`);
            console.log(`     Current: ${component.dataSourceVersion || 'V1/Unknown'}`);
            console.log(`     Target: V2`);
            
            const migrationSteps = generateMigrationSteps(component);
            console.log(`     Steps:`);
            migrationSteps.forEach(step => {
              console.log(`       • ${step}`);
            });
          });

          // Show recommendations
          console.log(chalk.blue(`\n💡 Recommendations:`));
          result.migration.recommendations.forEach(rec => {
            console.log(`   • ${rec}`);
          });

          if (options.autoMigrate || options.dryRun) {
            console.log(chalk.blue('\n🔧 Migration Plan:'));
            
            // Simple migrations that can be automated
            const simpleMigrations = componentsToMigrate.filter(c => 
              canAutoMigrate(c)
            );

            if (simpleMigrations.length > 0) {
              console.log(chalk.green(`   Automatic migrations: ${simpleMigrations.length}`));
              simpleMigrations.forEach(c => {
                console.log(`     ✓ ${c.name} in ${c.file}`);
              });
            }

            const manualMigrations = componentsToMigrate.length - simpleMigrations.length;
            if (manualMigrations > 0) {
              console.log(chalk.yellow(`   Manual migrations needed: ${manualMigrations}`));
            }

            if (options.dryRun) {
              console.log(chalk.gray('\n   (This is a dry run - no changes will be made)'));
            } else if (options.autoMigrate) {
              console.log(chalk.blue('\n🚀 Executing automatic migrations...'));
              // TODO: Implement actual migration logic
              console.log(chalk.yellow('🚧 Auto-migration coming soon...'));
            }
          }

          console.log(chalk.green('\n🎯 Next Steps:'));
          console.log(`   📚 Review migration guide: docs/migration-v1-to-v2.md`);
          console.log(`   🔧 Start with simple cases: archbase scan migration ${projectPath} --auto-migrate`);
          console.log(`   📄 Generate migration report: archbase scan project ${projectPath} --report`);

        } catch (error) {
          spinner.fail(chalk.red(`❌ Migration analysis failed: ${error.message}`));
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('health')
      .description('Health check for Archbase project setup')
      .argument('<project-path>', 'Path to project')
      .option('--fix', 'Auto-fix configuration issues')
      .action(async (projectPath: string, options) => {
        const spinner = ora('Running health check...').start();
        
        try {
          const scanner = new ProjectScanner();
          const result = await scanner.scanProject({
            projectPath: path.resolve(projectPath)
          });

          spinner.succeed('✅ Health check completed!');

          console.log(chalk.cyan('\n🏥 Project Health Report:'));

          // Dependencies check
          const deps = result.dependencies;
          console.log(chalk.blue('\n📦 Dependencies:'));
          console.log(`   Archbase React: ${deps.archbaseVersion || chalk.red('Not installed')}`);
          console.log(`   React: ${deps.reactVersion || chalk.red('Not found')}`);

          if (deps.missingDependencies.length > 0) {
            console.log(chalk.yellow(`   Missing recommended: ${deps.missingDependencies.join(', ')}`));
          }

          // Component health
          console.log(chalk.blue('\n🧩 Components:'));
          console.log(`   Total Archbase components: ${result.statistics.archbaseComponents}`);
          console.log(`   V2 components: ${chalk.green(result.statistics.v2Components)}`);
          console.log(`   V1 components: ${chalk.yellow(result.statistics.v1Components)}`);

          // Pattern compliance
          console.log(chalk.blue('\n🎨 Patterns:'));
          console.log(`   Implemented: ${result.patterns.detected.join(', ') || 'None'}`);
          console.log(`   Recommended: ${result.patterns.recommended.join(', ') || 'None'}`);

          // Issues summary
          console.log(chalk.blue('\n⚠️  Issues:'));
          console.log(`   Total issues: ${result.statistics.issuesFound}`);
          
          const errorCount = result.components.reduce((sum, c) => 
            sum + c.issues.filter(i => i.type === 'error').length, 0
          );
          
          console.log(`   Critical: ${errorCount}`);

          // Health score
          const healthScore = calculateHealthScore(result);
          const scoreColor = healthScore >= 80 ? chalk.green : healthScore >= 60 ? chalk.yellow : chalk.red;
          console.log(chalk.blue(`\n📊 Health Score: ${scoreColor(healthScore + '/100')}`));

          // Recommendations
          if (healthScore < 80) {
            console.log(chalk.yellow('\n💡 Recommendations:'));
            if (result.statistics.v1Components > 0) {
              console.log('   • Migrate to DataSource V2 for better performance');
            }
            if (deps.missingDependencies.length > 0) {
              console.log('   • Install recommended dependencies');
            }
            if (result.patterns.recommended.length > 0) {
              console.log('   • Implement recommended patterns');
            }
            if (errorCount > 0) {
              console.log('   • Fix critical component issues');
            }
          }

        } catch (error) {
          spinner.fail(chalk.red(`❌ Health check failed: ${error.message}`));
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('watch')
      .description('Real-time component analysis and suggestions')
      .argument('<project-path>', 'Path to project to watch')
      .option('--patterns <patterns>', 'File patterns to watch (comma-separated)', '**/*.{ts,tsx,js,jsx}')
      .option('--ignore <patterns>', 'Patterns to ignore (comma-separated)', 'node_modules/**,dist/**,build/**')
      .option('--debounce <ms>', 'Debounce delay in milliseconds', '1000')
      .option('--auto-fix', 'Automatically fix simple issues')
      .option('--verbose', 'Enable verbose logging')
      .action(async (projectPath: string, options) => {
        console.log(chalk.blue(`👀 Starting real-time scanner for: ${projectPath}`));
        
        try {
          const scanner = new RealtimeScanner();
          
          await scanner.start({
            projectPath: path.resolve(projectPath),
            watchPatterns: options.patterns.split(',').map((p: string) => p.trim()),
            ignorePatterns: options.ignore.split(',').map((p: string) => p.trim()),
            debounceMs: parseInt(options.debounce),
            autoFix: options.autoFix,
            verboseLogging: options.verbose
          });

        } catch (error) {
          console.error(chalk.red(`❌ Real-time scanner failed: ${error.message}`));
          process.exit(1);
        }
      })
  );

// Helper functions for migration
function generateMigrationSteps(component: any): string[] {
  const steps: string[] = [];
  
  if (component.name === 'ArchbaseEdit' || component.name === 'ArchbaseSelect') {
    steps.push('Replace ArchbaseDataSource with ArchbaseRemoteDataSource');
    steps.push('Remove manual forceUpdate calls');
    steps.push('Update props for V2 API');
  }

  if (component.name === 'ArchbaseDataGrid') {
    steps.push('Update dataSource to use V2 pattern');
    steps.push('Review column definitions');
    steps.push('Update event handlers');
  }

  if (steps.length === 0) {
    steps.push('Review component documentation for V2 migration');
  }

  return steps;
}

function canAutoMigrate(component: any): boolean {
  // Simple heuristics for what can be auto-migrated
  const simpleComponents = ['ArchbaseEdit', 'ArchbaseSelect', 'ArchbaseTextArea'];
  return simpleComponents.includes(component.name) && 
         component.issues.length <= 2;
}

function calculateHealthScore(result: any): number {
  let score = 100;

  // Deduct for V1 components
  const v1Ratio = result.statistics.v1Components / (result.statistics.archbaseComponents || 1);
  score -= v1Ratio * 30;

  // Deduct for issues
  const issueRatio = result.statistics.issuesFound / (result.statistics.archbaseComponents || 1);
  score -= issueRatio * 20;

  // Deduct for missing dependencies
  score -= result.dependencies.missingDependencies.length * 5;

  // Bonus for implemented patterns
  score += result.patterns.detected.length * 5;

  return Math.max(0, Math.round(score));
}