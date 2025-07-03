/**
 * Validate Command - Validate generated code and project structure
 * 
 * Examples:
 * archbase validate file ./src/components/UserForm.tsx
 * archbase validate project ./my-admin-app
 * archbase validate generated --last
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs-extra';
import { CodeValidator, ValidationResult } from '../validators/CodeValidator';

export const validateCommand = new Command('validate')
  .description('Validate generated code and project structure')
  .addCommand(
    new Command('file')
      .description('Validate a specific TypeScript/React file')
      .argument('<file>', 'Path to the file to validate')
      .option('--format <type>', 'Output format (json|text)', 'text')
      .option('--strict', 'Enable strict validation rules')
      .action(async (filePath: string, options) => {
        if (options.format !== 'json') {
          console.log(chalk.blue(`🔍 Validating file: ${filePath}`));
        }
        
        try {
          const validator = new CodeValidator();
          const result = await validator.validateFile(path.resolve(filePath));
          
          if (options.format === 'json') {
            console.log(JSON.stringify(result, null, 2));
          } else {
            displayValidationResult(result, 'file');
          }
          
          // Exit with error code if validation failed
          if (!result.isValid) {
            process.exit(1);
          }
        } catch (error) {
          if (options.format === 'json') {
            console.log(JSON.stringify({ error: error.message }, null, 2));
          } else {
            console.error(chalk.red(`❌ Error validating file: ${error.message}`));
          }
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('project')
      .description('Validate entire project structure')
      .argument('<directory>', 'Path to the project directory')
      .option('--format <type>', 'Output format (json|text)', 'text')
      .option('--ignore <patterns>', 'Comma-separated patterns to ignore', 'node_modules,dist,build')
      .action(async (projectPath: string, options) => {
        if (options.format !== 'json') {
          console.log(chalk.blue(`🔍 Validating project: ${projectPath}`));
        }
        
        try {
          const validator = new CodeValidator();
          const result = await validator.validateProject(path.resolve(projectPath));
          
          if (options.format === 'json') {
            console.log(JSON.stringify(result, null, 2));
          } else {
            displayValidationResult(result, 'project');
          }
          
          // Exit with error code if validation failed
          if (!result.isValid) {
            process.exit(1);
          }
        } catch (error) {
          if (options.format === 'json') {
            console.log(JSON.stringify({ error: error.message }, null, 2));
          } else {
            console.error(chalk.red(`❌ Error validating project: ${error.message}`));
          }
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('generated')
      .description('Validate recently generated code')
      .option('--last', 'Validate the last generated files')
      .option('--format <type>', 'Output format (json|text)', 'text')
      .action(async (options) => {
        if (options.format !== 'json') {
          console.log(chalk.blue('🔍 Validating generated code...'));
        }
        
        try {
          // This would typically read from a cache/history of generated files
          // For now, we'll implement a basic version
          const generatedFiles = await getRecentlyGeneratedFiles();
          
          if (generatedFiles.length === 0) {
            if (options.format === 'json') {
              console.log(JSON.stringify({ message: 'No recently generated files found' }, null, 2));
            } else {
              console.log(chalk.yellow('📝 No recently generated files found'));
              console.log(chalk.gray('Generate some code first using archbase generate commands'));
            }
            return;
          }
          
          const validator = new CodeValidator();
          const results: { file: string; result: ValidationResult }[] = [];
          
          for (const file of generatedFiles) {
            const result = await validator.validateFile(file);
            results.push({ file, result });
          }
          
          if (options.format === 'json') {
            console.log(JSON.stringify(results, null, 2));
          } else {
            displayBatchValidationResults(results);
          }
          
          // Exit with error code if any validation failed
          const hasErrors = results.some(r => !r.result.isValid);
          if (hasErrors) {
            process.exit(1);
          }
        } catch (error) {
          if (options.format === 'json') {
            console.log(JSON.stringify({ error: error.message }, null, 2));
          } else {
            console.error(chalk.red(`❌ Error validating generated code: ${error.message}`));
          }
          process.exit(1);
        }
      })
  );

function displayValidationResult(result: ValidationResult, type: 'file' | 'project'): void {
  const icon = result.isValid ? '✅' : '❌';
  const status = result.isValid ? 'VALID' : 'INVALID';
  const color = result.isValid ? chalk.green : chalk.red;
  
  console.log(color(`\n${icon} ${status}`));
  
  // Display metrics
  console.log(chalk.yellow('\n📊 Metrics:'));
  console.log(`  Lines of code: ${result.metrics.linesOfCode}`);
  console.log(`  Components: ${result.metrics.componentCount}`);
  console.log(`  Hooks: ${result.metrics.hookCount}`);
  console.log(`  Imports: ${result.metrics.importCount}`);
  console.log(`  Complexity: ${result.metrics.complexity}`);
  console.log(`  TypeScript: ${result.metrics.hasTypeScript ? '✅' : '❌'}`);
  
  // Display errors
  if (result.errors.length > 0) {
    console.log(chalk.red('\n🚨 Errors:'));
    result.errors.forEach((error, index) => {
      const location = error.line ? ` (line ${error.line}${error.column ? `:${error.column}` : ''})` : '';
      console.log(`  ${index + 1}. ${error.message}${location}`);
    });
  }
  
  // Display warnings
  if (result.warnings.length > 0) {
    console.log(chalk.yellow('\n⚠️  Warnings:'));
    result.warnings.forEach((warning, index) => {
      console.log(`  ${index + 1}. ${warning.message}`);
      if (warning.suggestion) {
        console.log(chalk.gray(`     💡 ${warning.suggestion}`));
      }
    });
  }
  
  if (result.isValid && result.errors.length === 0 && result.warnings.length === 0) {
    console.log(chalk.green('\n🎉 Code is valid and follows best practices!'));
  }
}

function displayBatchValidationResults(results: { file: string; result: ValidationResult }[]): void {
  console.log(chalk.yellow(`\n📝 Validation Results (${results.length} files):`));
  
  const validFiles = results.filter(r => r.result.isValid);
  const invalidFiles = results.filter(r => !r.result.isValid);
  
  console.log(chalk.green(`✅ Valid: ${validFiles.length}`));
  console.log(chalk.red(`❌ Invalid: ${invalidFiles.length}`));
  
  if (invalidFiles.length > 0) {
    console.log(chalk.red('\n🚨 Files with errors:'));
    invalidFiles.forEach(({ file, result }) => {
      console.log(`  ${chalk.cyan(path.basename(file))}: ${result.errors.length} error(s)`);
      result.errors.slice(0, 2).forEach(error => {
        console.log(chalk.gray(`    • ${error.message}`));
      });
    });
  }
  
  // Summary metrics
  const totalLines = results.reduce((sum, r) => sum + r.result.metrics.linesOfCode, 0);
  const totalComponents = results.reduce((sum, r) => sum + r.result.metrics.componentCount, 0);
  const totalComplexity = results.reduce((sum, r) => sum + r.result.metrics.complexity, 0);
  
  console.log(chalk.yellow('\n📊 Summary:'));
  console.log(`  Total lines: ${totalLines}`);
  console.log(`  Total components: ${totalComponents}`);
  console.log(`  Average complexity: ${Math.round(totalComplexity / results.length)}`);
}

async function getRecentlyGeneratedFiles(): Promise<string[]> {
  // This is a simplified implementation
  // In a real scenario, we'd track generated files in a history/cache system
  const possibleDirs = ['./src', './components', './pages', './forms', './views'];
  const files: string[] = [];
  
  for (const dir of possibleDirs) {
    try {
      if (await fs.pathExists(dir)) {
        const dirFiles = await fs.readdir(dir);
        const tsxFiles = dirFiles
          .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'))
          .map(f => path.join(dir, f));
        files.push(...tsxFiles);
      }
    } catch (error) {
      // Ignore errors for directories that don't exist
    }
  }
  
  return files.slice(0, 10); // Limit to 10 most recent files
}