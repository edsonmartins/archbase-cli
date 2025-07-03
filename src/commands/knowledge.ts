/**
 * Knowledge commands - Manage component knowledge base
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as path from 'path';
import * as fs from 'fs-extra';
import { ComponentAnalyzer } from '../analyzers/ComponentAnalyzer';
import { KnowledgeBase } from '../knowledge/KnowledgeBase';

const knowledgeCommand = new Command('knowledge')
  .description('Manage Archbase component knowledge base');

knowledgeCommand
  .command('scan <directory>')
  .description('Scan directory for Archbase components and update knowledge base')
  .option('--output <file>', 'Output file for scanned components', './archbase-knowledge.json')
  .option('--pattern <pattern>', 'File pattern to scan', '**/*.{ts,tsx,js,jsx}')
  .option('--exclude <patterns>', 'Patterns to exclude (comma-separated)', 'node_modules,dist,build')
  .option('--merge', 'Merge with existing knowledge base')
  .option('--dry-run', 'Show what would be scanned without saving')
  .action(async (directory: string, options) => {
    const spinner = ora('Scanning for Archbase components...').start();
    
    try {
      const analyzer = new ComponentAnalyzer();
      const kb = new KnowledgeBase();
      
      // Validate directory
      const scanPath = path.resolve(directory);
      if (!await fs.pathExists(scanPath)) {
        throw new Error(`Directory not found: ${scanPath}`);
      }
      
      spinner.text = `Scanning ${scanPath}...`;
      
      // Get files to analyze
      const glob = await import('glob');
      const excludePatterns = options.exclude.split(',').map((p: string) => p.trim());
      
      const files = await glob.glob(options.pattern, {
        cwd: scanPath,
        ignore: excludePatterns,
        absolute: true
      });
      
      spinner.text = `Found ${files.length} files to analyze`;
      
      const components: any[] = [];
      const errors: string[] = [];
      
      // Analyze each file
      for (const file of files) {
        try {
          const analysis = await analyzer.analyzeFile(file);
          
          if (analysis && analysis.name) {
            components.push({
              name: analysis.name || path.basename(file, path.extname(file)),
              file: path.relative(scanPath, file),
              analysis,
              category: determineCategory(analysis.name || '', file),
              complexity: analysis.complexity
            });
          }
        } catch (error) {
          errors.push(`Error analyzing ${file}: ${error.message}`);
        }
      }
      
      spinner.succeed(`Scanned ${files.length} files, found ${components.length} components`);
      
      // Display results
      console.log('\n📊 Scan Results:');
      console.log(chalk.gray('─'.repeat(50)));
      
      const byCategory = components.reduce((acc, comp) => {
        acc[comp.category] = (acc[comp.category] || 0) + 1;
        return acc;
      }, {});
      
      Object.entries(byCategory).forEach(([category, count]) => {
        console.log(chalk.blue(`  ${category}: ${count} components`));
      });
      
      if (errors.length > 0) {
        console.log(chalk.yellow(`\n⚠️  ${errors.length} errors during scan`));
        if (options.verbose) {
          errors.forEach(err => console.log(chalk.red(`  - ${err}`)));
        }
      }
      
      // Save or display results
      if (!options.dryRun) {
        const existingKnowledge = options.merge && await fs.pathExists(options.output) 
          ? await fs.readJson(options.output)
          : { components: {}, patterns: {}, examples: {} };
        
        // Transform components for knowledge base
        const knowledgeData = {
          ...existingKnowledge,
          components: {
            ...existingKnowledge.components,
            ...transformToKnowledgeFormat(components)
          },
          lastScan: new Date().toISOString(),
          scanPath: scanPath
        };
        
        await fs.writeJson(options.output, knowledgeData, { spaces: 2 });
        console.log(chalk.green(`\n✅ Knowledge base saved to: ${options.output}`));
      } else {
        console.log(chalk.yellow('\n🔍 Dry run - no files were saved'));
      }
      
    } catch (error) {
      spinner.fail(chalk.red(`Scan failed: ${error.message}`));
      process.exit(1);
    }
  });

knowledgeCommand
  .command('validate [file]')
  .description('Validate knowledge base file')
  .option('--fix', 'Attempt to fix validation errors')
  .action(async (file: string = './archbase-knowledge.json', options) => {
    const spinner = ora('Validating knowledge base...').start();
    
    try {
      if (!await fs.pathExists(file)) {
        throw new Error(`Knowledge base file not found: ${file}`);
      }
      
      const data = await fs.readJson(file);
      const errors: string[] = [];
      const warnings: string[] = [];
      
      // Validate structure
      if (!data.components || typeof data.components !== 'object') {
        errors.push('Missing or invalid components section');
      }
      
      // Validate each component
      Object.entries(data.components || {}).forEach(([name, comp]: [string, any]) => {
        if (!comp.description) {
          warnings.push(`Component ${name} missing description`);
        }
        if (!comp.props || Object.keys(comp.props).length === 0) {
          warnings.push(`Component ${name} has no props defined`);
        }
        if (!comp.category) {
          warnings.push(`Component ${name} missing category`);
        }
      });
      
      spinner.succeed('Validation complete');
      
      if (errors.length === 0 && warnings.length === 0) {
        console.log(chalk.green('✅ Knowledge base is valid!'));
      } else {
        if (errors.length > 0) {
          console.log(chalk.red(`\n❌ ${errors.length} errors found:`));
          errors.forEach(err => console.log(chalk.red(`  - ${err}`)));
        }
        
        if (warnings.length > 0) {
          console.log(chalk.yellow(`\n⚠️  ${warnings.length} warnings:`));
          warnings.forEach(warn => console.log(chalk.yellow(`  - ${warn}`)));
        }
        
        if (options.fix && errors.length === 0) {
          // Apply fixes for warnings
          console.log(chalk.blue('\n🔧 Applying fixes...'));
          // TODO: Implement fix logic
        }
      }
      
    } catch (error) {
      spinner.fail(chalk.red(`Validation failed: ${error.message}`));
      process.exit(1);
    }
  });

knowledgeCommand
  .command('export [file]')
  .description('Export knowledge base in different formats')
  .option('--format <format>', 'Export format (json|markdown|html)', 'markdown')
  .option('--output <file>', 'Output file')
  .action(async (file: string = './archbase-knowledge.json', options) => {
    try {
      if (!await fs.pathExists(file)) {
        throw new Error(`Knowledge base file not found: ${file}`);
      }
      
      const data = await fs.readJson(file);
      const outputFile = options.output || `archbase-knowledge.${options.format}`;
      
      switch (options.format) {
        case 'markdown':
          const markdown = generateMarkdown(data);
          await fs.writeFile(outputFile, markdown);
          break;
          
        case 'html':
          const html = generateHTML(data);
          await fs.writeFile(outputFile, html);
          break;
          
        case 'json':
          await fs.writeJson(outputFile, data, { spaces: 2 });
          break;
          
        default:
          throw new Error(`Unsupported format: ${options.format}`);
      }
      
      console.log(chalk.green(`✅ Knowledge base exported to: ${outputFile}`));
      
    } catch (error) {
      console.error(chalk.red(`Export failed: ${error.message}`));
      process.exit(1);
    }
  });

// Helper functions
function determineCategory(componentName: string, filePath: string): string {
  const pathParts = filePath.toLowerCase().split(path.sep);
  
  // Check path for category hints
  if (pathParts.includes('forms') || componentName.includes('Form')) return 'forms';
  if (pathParts.includes('tables') || componentName.includes('Table')) return 'tables';
  if (pathParts.includes('modals') || componentName.includes('Modal')) return 'modals';
  if (pathParts.includes('layout') || componentName.includes('Layout')) return 'layout';
  if (pathParts.includes('navigation') || componentName.includes('Nav')) return 'navigation';
  if (pathParts.includes('inputs') || componentName.includes('Input')) return 'inputs';
  
  return 'components';
}

function transformToKnowledgeFormat(components: any[]): any {
  return components.reduce((acc, comp) => {
    const { name, analysis, category, file } = comp;
    
    acc[name] = {
      category,
      description: `Component from ${file}`,
      props: analysis.props || {},
      imports: analysis.imports || [],
      dependencies: analysis.dependencies || [],
      hasDataSource: analysis.hasDataSource || false,
      complexity: analysis.complexity || 'low',
      examples: [],
      patterns: [],
      aiHints: generateAIHints(analysis)
    };
    
    return acc;
  }, {});
}

function generateAIHints(analysis: any): string[] {
  const hints: string[] = [];
  
  if (analysis.hasDataSource) {
    hints.push('This component integrates with Archbase DataSource');
    hints.push('Always provide a valid dataSource prop when using');
  }
  
  if (analysis.hasV1V2Compatibility) {
    hints.push('Supports both DataSource V1 and V2');
    hints.push('Use useArchbaseV1V2Compatibility hook for compatibility');
  }
  
  if (analysis.complexity === 'high') {
    hints.push('Complex component - consider breaking into smaller parts');
  }
  
  return hints;
}

function generateMarkdown(data: any): string {
  let markdown = '# Archbase Component Knowledge Base\n\n';
  markdown += `Generated: ${new Date().toLocaleDateString()}\n\n`;
  
  // Group by category
  const byCategory: any = {};
  Object.entries(data.components || {}).forEach(([name, comp]: [string, any]) => {
    const category = comp.category || 'uncategorized';
    if (!byCategory[category]) byCategory[category] = [];
    byCategory[category].push({ name, ...comp });
  });
  
  // Generate markdown for each category
  Object.entries(byCategory).forEach(([category, components]: [string, any]) => {
    markdown += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
    
    components.forEach((comp: any) => {
      markdown += `### ${comp.name}\n\n`;
      markdown += `${comp.description || 'No description available'}\n\n`;
      
      if (comp.props && Object.keys(comp.props).length > 0) {
        markdown += '**Props:**\n';
        Object.entries(comp.props).forEach(([prop, info]: [string, any]) => {
          markdown += `- \`${prop}\`: ${info.type || 'any'}${info.required ? ' (required)' : ''}\n`;
        });
        markdown += '\n';
      }
      
      if (comp.aiHints && comp.aiHints.length > 0) {
        markdown += '**AI Hints:**\n';
        comp.aiHints.forEach((hint: string) => {
          markdown += `- ${hint}\n`;
        });
        markdown += '\n';
      }
    });
  });
  
  return markdown;
}

function generateHTML(data: any): string {
  // Simple HTML generation
  let html = `<!DOCTYPE html>
<html>
<head>
  <title>Archbase Component Knowledge Base</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #333; }
    h2 { color: #555; margin-top: 30px; }
    h3 { color: #777; }
    .prop { margin-left: 20px; }
    .hint { color: #0066cc; font-style: italic; }
  </style>
</head>
<body>
  <h1>Archbase Component Knowledge Base</h1>
  <p>Generated: ${new Date().toLocaleDateString()}</p>
`;
  
  // Group and generate HTML
  const byCategory: any = {};
  Object.entries(data.components || {}).forEach(([name, comp]: [string, any]) => {
    const category = comp.category || 'uncategorized';
    if (!byCategory[category]) byCategory[category] = [];
    byCategory[category].push({ name, ...comp });
  });
  
  Object.entries(byCategory).forEach(([category, components]: [string, any]) => {
    html += `<h2>${category.charAt(0).toUpperCase() + category.slice(1)}</h2>\n`;
    
    components.forEach((comp: any) => {
      html += `<h3>${comp.name}</h3>\n`;
      html += `<p>${comp.description || 'No description available'}</p>\n`;
      
      if (comp.props && Object.keys(comp.props).length > 0) {
        html += '<h4>Props:</h4><ul>\n';
        Object.entries(comp.props).forEach(([prop, info]: [string, any]) => {
          html += `<li class="prop"><code>${prop}</code>: ${info.type || 'any'}${info.required ? ' <strong>(required)</strong>' : ''}</li>\n`;
        });
        html += '</ul>\n';
      }
    });
  });
  
  html += '</body></html>';
  return html;
}

export default knowledgeCommand;