"use strict";
/**
 * Query Command - Search and retrieve information about Archbase components
 *
 * Examples:
 * archbase query component FormBuilder
 * archbase query pattern "crud with validation"
 * archbase query examples --component=DataTable
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const KnowledgeBase_1 = require("../knowledge/KnowledgeBase");
exports.queryCommand = new commander_1.Command('query')
    .description('Query information about Archbase components and patterns')
    .addCommand(new commander_1.Command('component')
    .description('Get information about a specific component')
    .argument('<name>', 'Component name (e.g., FormBuilder, DataTable)')
    .option('--ai-context', 'Include AI-friendly context and suggestions')
    .option('--format <type>', 'Output format (json|yaml|text)', 'text')
    .action(async (componentName, options) => {
    if (options.format !== 'json') {
        console.log(chalk_1.default.blue(`🔍 Querying component: ${componentName}`));
    }
    try {
        const knowledgeBase = new KnowledgeBase_1.KnowledgeBase();
        const componentInfo = await knowledgeBase.getComponent(componentName);
        if (!componentInfo) {
            if (options.format === 'json') {
                console.log(JSON.stringify({ error: `Component '${componentName}' not found` }, null, 2));
            }
            else {
                console.error(chalk_1.default.red(`❌ Component '${componentName}' not found in knowledge base`));
                console.log(chalk_1.default.yellow('\n💡 Available components:'));
                console.log(chalk_1.default.gray('  • ArchbaseEdit - Text input with DataSource integration'));
                console.log(chalk_1.default.gray('  • ArchbaseDataTable - Advanced data table with sorting and filtering'));
                console.log(chalk_1.default.blue('\n🔍 Run "archbase knowledge scan" to discover more components'));
            }
            process.exit(1);
        }
        if (options.format === 'json') {
            console.log(JSON.stringify(componentInfo, null, 2));
            return;
        }
        displayComponentInfo(componentInfo, options.aiContext);
    }
    catch (error) {
        if (options.format === 'json') {
            console.log(JSON.stringify({ error: error.message }, null, 2));
        }
        else {
            console.error(chalk_1.default.red(`❌ Error querying component: ${error.message}`));
        }
        process.exit(1);
    }
}))
    .addCommand(new commander_1.Command('pattern')
    .description('Search for usage patterns')
    .argument('<description>', 'Pattern description (e.g., "crud with validation")')
    .option('--category <cat>', 'Filter by category (forms|tables|auth)')
    .action(async (description, options) => {
    console.log(chalk_1.default.blue(`🔍 Searching patterns: ${description}`));
    try {
        const knowledgeBase = new KnowledgeBase_1.KnowledgeBase();
        const patterns = await knowledgeBase.searchPatterns(description, options.category);
        displayPatterns(patterns);
    }
    catch (error) {
        console.error(chalk_1.default.red(`❌ Error searching patterns: ${error.message}`));
        process.exit(1);
    }
}))
    .addCommand(new commander_1.Command('examples')
    .description('Find code examples')
    .option('--component <name>', 'Filter by component')
    .option('--pattern <pattern>', 'Filter by pattern')
    .option('--tag <tag>', 'Filter by tag')
    .action(async (options) => {
    console.log(chalk_1.default.blue('🔍 Searching examples...'));
    try {
        const knowledgeBase = new KnowledgeBase_1.KnowledgeBase();
        const examples = await knowledgeBase.searchExamples(options);
        displayExamples(examples);
    }
    catch (error) {
        console.error(chalk_1.default.red(`❌ Error searching examples: ${error.message}`));
        process.exit(1);
    }
}))
    .addCommand(new commander_1.Command('search')
    .description('Free-form search across all knowledge')
    .argument('<query>', 'Search query (e.g., "how to implement user registration")')
    .action(async (query) => {
    console.log(chalk_1.default.blue(`🔍 Searching: ${query}`));
    try {
        const knowledgeBase = new KnowledgeBase_1.KnowledgeBase();
        const results = await knowledgeBase.freeSearch(query);
        displaySearchResults(results);
    }
    catch (error) {
        console.error(chalk_1.default.red(`❌ Error searching: ${error.message}`));
        process.exit(1);
    }
}));
function displayComponentInfo(component, includeAiContext = false) {
    console.log(chalk_1.default.green(`\n📦 ${component.name}`));
    console.log(chalk_1.default.gray(component.description));
    if (component.props) {
        console.log(chalk_1.default.yellow('\n🔧 Props:'));
        Object.entries(component.props).forEach(([name, info]) => {
            console.log(`  ${chalk_1.default.cyan(name)}: ${info.type}${info.required ? chalk_1.default.red(' *') : ''}`);
            if (info.description) {
                console.log(chalk_1.default.gray(`    ${info.description}`));
            }
        });
    }
    if (component.examples) {
        console.log(chalk_1.default.yellow('\n💡 Examples:'));
        component.examples.forEach((example) => {
            console.log(`  ${chalk_1.default.cyan(example.title)}`);
            console.log(chalk_1.default.gray(`    ${example.description}`));
        });
    }
    if (includeAiContext && component.aiHints) {
        console.log(chalk_1.default.magenta('\n🤖 AI Context:'));
        component.aiHints.forEach((hint) => {
            console.log(chalk_1.default.gray(`  • ${hint}`));
        });
    }
}
function displayPatterns(patterns) {
    console.log(chalk_1.default.green(`\n📋 Found ${patterns.length} patterns:`));
    patterns.forEach((pattern) => {
        console.log(`\n${chalk_1.default.cyan(pattern.title)}`);
        console.log(chalk_1.default.gray(pattern.description));
        console.log(chalk_1.default.yellow(`Components: ${pattern.components.join(', ')}`));
        console.log(chalk_1.default.blue(`Complexity: ${pattern.complexity}`));
    });
}
function displayExamples(examples) {
    console.log(chalk_1.default.green(`\n💡 Found ${examples.length} examples:`));
    examples.forEach((example) => {
        console.log(`\n${chalk_1.default.cyan(example.title)}`);
        console.log(chalk_1.default.gray(example.description));
        console.log(chalk_1.default.yellow(`File: ${example.file}`));
        if (example.tags) {
            console.log(chalk_1.default.blue(`Tags: ${example.tags.join(', ')}`));
        }
    });
}
function displaySearchResults(results) {
    console.log(chalk_1.default.green(`\n🎯 Search Results:`));
    if (results.components.length > 0) {
        console.log(chalk_1.default.yellow('\n📦 Components:'));
        results.components.forEach((comp) => {
            console.log(`  ${chalk_1.default.cyan(comp.name)} - ${chalk_1.default.gray(comp.description)}`);
        });
    }
    if (results.patterns.length > 0) {
        console.log(chalk_1.default.yellow('\n📋 Patterns:'));
        results.patterns.forEach((pattern) => {
            console.log(`  ${chalk_1.default.cyan(pattern.title)} - ${chalk_1.default.gray(pattern.description)}`);
        });
    }
    if (results.examples.length > 0) {
        console.log(chalk_1.default.yellow('\n💡 Examples:'));
        results.examples.forEach((example) => {
            console.log(`  ${chalk_1.default.cyan(example.title)} - ${chalk_1.default.gray(example.description)}`);
        });
    }
}
//# sourceMappingURL=query.js.map