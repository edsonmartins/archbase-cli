/**
 * Query Command - Search and retrieve information about Archbase components
 * 
 * Examples:
 * archbase query component FormBuilder
 * archbase query pattern "crud with validation"
 * archbase query examples --component=DataTable
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { ComponentAnalyzer } from '../analyzers/ComponentAnalyzer';
import { KnowledgeBase } from '../knowledge/KnowledgeBase';

export const queryCommand = new Command('query')
  .description('Query information about Archbase components and patterns')
  .addCommand(
    new Command('component')
      .description('Get information about a specific component')
      .argument('<name>', 'Component name (e.g., FormBuilder, DataTable)')
      .option('--ai-context', 'Include AI-friendly context and suggestions')
      .option('--format <type>', 'Output format (json|yaml|text)', 'text')
      .action(async (componentName: string, options) => {
        if (options.format !== 'json') {
          console.log(chalk.blue(`🔍 Querying component: ${componentName}`));
        }
        
        try {
          const knowledgeBase = new KnowledgeBase();
          const componentInfo = await knowledgeBase.getComponent(componentName);
          
          if (!componentInfo) {
            if (options.format === 'json') {
              console.log(JSON.stringify({ error: `Component '${componentName}' not found` }, null, 2));
            } else {
              console.error(chalk.red(`❌ Component '${componentName}' not found in knowledge base`));
              console.log(chalk.yellow('\n💡 Available components:'));
              console.log(chalk.gray('  • ArchbaseEdit - Text input with DataSource integration'));
              console.log(chalk.gray('  • ArchbaseDataTable - Advanced data table with sorting and filtering'));
              console.log(chalk.blue('\n🔍 Run "archbase knowledge scan" to discover more components'));
            }
            process.exit(1);
          }
          
          if (options.format === 'json') {
            console.log(JSON.stringify(componentInfo, null, 2));
            return;
          }
          
          displayComponentInfo(componentInfo, options.aiContext);
        } catch (error) {
          if (options.format === 'json') {
            console.log(JSON.stringify({ error: error.message }, null, 2));
          } else {
            console.error(chalk.red(`❌ Error querying component: ${error.message}`));
          }
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('pattern')
      .description('Search for usage patterns')
      .argument('<description>', 'Pattern description (e.g., "crud with validation")')
      .option('--category <cat>', 'Filter by category (forms|tables|auth)')
      .action(async (description: string, options) => {
        console.log(chalk.blue(`🔍 Searching patterns: ${description}`));
        
        try {
          const knowledgeBase = new KnowledgeBase();
          const patterns = await knowledgeBase.searchPatterns(description, options.category);
          
          displayPatterns(patterns);
        } catch (error) {
          console.error(chalk.red(`❌ Error searching patterns: ${error.message}`));
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('examples')
      .description('Find code examples')
      .option('--component <name>', 'Filter by component')
      .option('--pattern <pattern>', 'Filter by pattern')
      .option('--tag <tag>', 'Filter by tag')
      .action(async (options) => {
        console.log(chalk.blue('🔍 Searching examples...'));
        
        try {
          const knowledgeBase = new KnowledgeBase();
          const examples = await knowledgeBase.searchExamples(options);
          
          displayExamples(examples);
        } catch (error) {
          console.error(chalk.red(`❌ Error searching examples: ${error.message}`));
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('search')
      .description('Free-form search across all knowledge')
      .argument('<query>', 'Search query (e.g., "how to implement user registration")')
      .action(async (query: string) => {
        console.log(chalk.blue(`🔍 Searching: ${query}`));
        
        try {
          const knowledgeBase = new KnowledgeBase();
          const results = await knowledgeBase.freeSearch(query);
          
          displaySearchResults(results);
        } catch (error) {
          console.error(chalk.red(`❌ Error searching: ${error.message}`));
          process.exit(1);
        }
      })
  );

function displayComponentInfo(component: any, includeAiContext: boolean = false) {
  console.log(chalk.green(`\n📦 ${component.name}`));
  console.log(chalk.gray(component.description));
  
  if (component.props) {
    console.log(chalk.yellow('\n🔧 Props:'));
    Object.entries(component.props).forEach(([name, info]: [string, any]) => {
      console.log(`  ${chalk.cyan(name)}: ${info.type}${info.required ? chalk.red(' *') : ''}`);
      if (info.description) {
        console.log(chalk.gray(`    ${info.description}`));
      }
    });
  }
  
  if (component.examples) {
    console.log(chalk.yellow('\n💡 Examples:'));
    component.examples.forEach((example: any) => {
      console.log(`  ${chalk.cyan(example.title)}`);
      console.log(chalk.gray(`    ${example.description}`));
    });
  }
  
  if (includeAiContext && component.aiHints) {
    console.log(chalk.magenta('\n🤖 AI Context:'));
    component.aiHints.forEach((hint: string) => {
      console.log(chalk.gray(`  • ${hint}`));
    });
  }
}

function displayPatterns(patterns: any[]) {
  console.log(chalk.green(`\n📋 Found ${patterns.length} patterns:`));
  
  patterns.forEach((pattern) => {
    console.log(`\n${chalk.cyan(pattern.title)}`);
    console.log(chalk.gray(pattern.description));
    console.log(chalk.yellow(`Components: ${pattern.components.join(', ')}`));
    console.log(chalk.blue(`Complexity: ${pattern.complexity}`));
  });
}

function displayExamples(examples: any[]) {
  console.log(chalk.green(`\n💡 Found ${examples.length} examples:`));
  
  examples.forEach((example) => {
    console.log(`\n${chalk.cyan(example.title)}`);
    console.log(chalk.gray(example.description));
    console.log(chalk.yellow(`File: ${example.file}`));
    if (example.tags) {
      console.log(chalk.blue(`Tags: ${example.tags.join(', ')}`));
    }
  });
}

function displaySearchResults(results: any) {
  console.log(chalk.green(`\n🎯 Search Results:`));
  
  if (results.components.length > 0) {
    console.log(chalk.yellow('\n📦 Components:'));
    results.components.forEach((comp: any) => {
      console.log(`  ${chalk.cyan(comp.name)} - ${chalk.gray(comp.description)}`);
    });
  }
  
  if (results.patterns.length > 0) {
    console.log(chalk.yellow('\n📋 Patterns:'));
    results.patterns.forEach((pattern: any) => {
      console.log(`  ${chalk.cyan(pattern.title)} - ${chalk.gray(pattern.description)}`);
    });
  }
  
  if (results.examples.length > 0) {
    console.log(chalk.yellow('\n💡 Examples:'));
    results.examples.forEach((example: any) => {
      console.log(`  ${chalk.cyan(example.title)} - ${chalk.gray(example.description)}`);
    });
  }
}