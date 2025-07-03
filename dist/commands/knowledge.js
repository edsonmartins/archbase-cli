"use strict";
/**
 * Knowledge commands - Manage component knowledge base
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const ComponentAnalyzer_1 = require("../analyzers/ComponentAnalyzer");
const KnowledgeBase_1 = require("../knowledge/KnowledgeBase");
const knowledgeCommand = new commander_1.Command('knowledge')
    .description('Manage Archbase component knowledge base');
knowledgeCommand
    .command('scan <directory>')
    .description('Scan directory for Archbase components and update knowledge base')
    .option('--output <file>', 'Output file for scanned components', './archbase-knowledge.json')
    .option('--pattern <pattern>', 'File pattern to scan', '**/*.{ts,tsx,js,jsx}')
    .option('--exclude <patterns>', 'Patterns to exclude (comma-separated)', 'node_modules,dist,build')
    .option('--merge', 'Merge with existing knowledge base')
    .option('--dry-run', 'Show what would be scanned without saving')
    .action(async (directory, options) => {
    const spinner = (0, ora_1.default)('Scanning for Archbase components...').start();
    try {
        const analyzer = new ComponentAnalyzer_1.ComponentAnalyzer();
        const kb = new KnowledgeBase_1.KnowledgeBase();
        // Validate directory
        const scanPath = path.resolve(directory);
        if (!await fs.pathExists(scanPath)) {
            throw new Error(`Directory not found: ${scanPath}`);
        }
        spinner.text = `Scanning ${scanPath}...`;
        // Get files to analyze
        const glob = await Promise.resolve().then(() => __importStar(require('glob')));
        const excludePatterns = options.exclude.split(',').map((p) => p.trim());
        const files = await glob.glob(options.pattern, {
            cwd: scanPath,
            ignore: excludePatterns,
            absolute: true
        });
        spinner.text = `Found ${files.length} files to analyze`;
        const components = [];
        const errors = [];
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
            }
            catch (error) {
                errors.push(`Error analyzing ${file}: ${error.message}`);
            }
        }
        spinner.succeed(`Scanned ${files.length} files, found ${components.length} components`);
        // Display results
        console.log('\n📊 Scan Results:');
        console.log(chalk_1.default.gray('─'.repeat(50)));
        const byCategory = components.reduce((acc, comp) => {
            acc[comp.category] = (acc[comp.category] || 0) + 1;
            return acc;
        }, {});
        Object.entries(byCategory).forEach(([category, count]) => {
            console.log(chalk_1.default.blue(`  ${category}: ${count} components`));
        });
        if (errors.length > 0) {
            console.log(chalk_1.default.yellow(`\n⚠️  ${errors.length} errors during scan`));
            if (options.verbose) {
                errors.forEach(err => console.log(chalk_1.default.red(`  - ${err}`)));
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
            console.log(chalk_1.default.green(`\n✅ Knowledge base saved to: ${options.output}`));
        }
        else {
            console.log(chalk_1.default.yellow('\n🔍 Dry run - no files were saved'));
        }
    }
    catch (error) {
        spinner.fail(chalk_1.default.red(`Scan failed: ${error.message}`));
        process.exit(1);
    }
});
knowledgeCommand
    .command('validate [file]')
    .description('Validate knowledge base file')
    .option('--fix', 'Attempt to fix validation errors')
    .action(async (file = './archbase-knowledge.json', options) => {
    const spinner = (0, ora_1.default)('Validating knowledge base...').start();
    try {
        if (!await fs.pathExists(file)) {
            throw new Error(`Knowledge base file not found: ${file}`);
        }
        const data = await fs.readJson(file);
        const errors = [];
        const warnings = [];
        // Validate structure
        if (!data.components || typeof data.components !== 'object') {
            errors.push('Missing or invalid components section');
        }
        // Validate each component
        Object.entries(data.components || {}).forEach(([name, comp]) => {
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
            console.log(chalk_1.default.green('✅ Knowledge base is valid!'));
        }
        else {
            if (errors.length > 0) {
                console.log(chalk_1.default.red(`\n❌ ${errors.length} errors found:`));
                errors.forEach(err => console.log(chalk_1.default.red(`  - ${err}`)));
            }
            if (warnings.length > 0) {
                console.log(chalk_1.default.yellow(`\n⚠️  ${warnings.length} warnings:`));
                warnings.forEach(warn => console.log(chalk_1.default.yellow(`  - ${warn}`)));
            }
            if (options.fix && errors.length === 0) {
                // Apply fixes for warnings
                console.log(chalk_1.default.blue('\n🔧 Applying fixes...'));
                // TODO: Implement fix logic
            }
        }
    }
    catch (error) {
        spinner.fail(chalk_1.default.red(`Validation failed: ${error.message}`));
        process.exit(1);
    }
});
knowledgeCommand
    .command('export [file]')
    .description('Export knowledge base in different formats')
    .option('--format <format>', 'Export format (json|markdown|html)', 'markdown')
    .option('--output <file>', 'Output file')
    .action(async (file = './archbase-knowledge.json', options) => {
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
        console.log(chalk_1.default.green(`✅ Knowledge base exported to: ${outputFile}`));
    }
    catch (error) {
        console.error(chalk_1.default.red(`Export failed: ${error.message}`));
        process.exit(1);
    }
});
// Helper functions
function determineCategory(componentName, filePath) {
    const pathParts = filePath.toLowerCase().split(path.sep);
    // Check path for category hints
    if (pathParts.includes('forms') || componentName.includes('Form'))
        return 'forms';
    if (pathParts.includes('tables') || componentName.includes('Table'))
        return 'tables';
    if (pathParts.includes('modals') || componentName.includes('Modal'))
        return 'modals';
    if (pathParts.includes('layout') || componentName.includes('Layout'))
        return 'layout';
    if (pathParts.includes('navigation') || componentName.includes('Nav'))
        return 'navigation';
    if (pathParts.includes('inputs') || componentName.includes('Input'))
        return 'inputs';
    return 'components';
}
function transformToKnowledgeFormat(components) {
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
function generateAIHints(analysis) {
    const hints = [];
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
function generateMarkdown(data) {
    let markdown = '# Archbase Component Knowledge Base\n\n';
    markdown += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    // Group by category
    const byCategory = {};
    Object.entries(data.components || {}).forEach(([name, comp]) => {
        const category = comp.category || 'uncategorized';
        if (!byCategory[category])
            byCategory[category] = [];
        byCategory[category].push({ name, ...comp });
    });
    // Generate markdown for each category
    Object.entries(byCategory).forEach(([category, components]) => {
        markdown += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
        components.forEach((comp) => {
            markdown += `### ${comp.name}\n\n`;
            markdown += `${comp.description || 'No description available'}\n\n`;
            if (comp.props && Object.keys(comp.props).length > 0) {
                markdown += '**Props:**\n';
                Object.entries(comp.props).forEach(([prop, info]) => {
                    markdown += `- \`${prop}\`: ${info.type || 'any'}${info.required ? ' (required)' : ''}\n`;
                });
                markdown += '\n';
            }
            if (comp.aiHints && comp.aiHints.length > 0) {
                markdown += '**AI Hints:**\n';
                comp.aiHints.forEach((hint) => {
                    markdown += `- ${hint}\n`;
                });
                markdown += '\n';
            }
        });
    });
    return markdown;
}
function generateHTML(data) {
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
    const byCategory = {};
    Object.entries(data.components || {}).forEach(([name, comp]) => {
        const category = comp.category || 'uncategorized';
        if (!byCategory[category])
            byCategory[category] = [];
        byCategory[category].push({ name, ...comp });
    });
    Object.entries(byCategory).forEach(([category, components]) => {
        html += `<h2>${category.charAt(0).toUpperCase() + category.slice(1)}</h2>\n`;
        components.forEach((comp) => {
            html += `<h3>${comp.name}</h3>\n`;
            html += `<p>${comp.description || 'No description available'}</p>\n`;
            if (comp.props && Object.keys(comp.props).length > 0) {
                html += '<h4>Props:</h4><ul>\n';
                Object.entries(comp.props).forEach(([prop, info]) => {
                    html += `<li class="prop"><code>${prop}</code>: ${info.type || 'any'}${info.required ? ' <strong>(required)</strong>' : ''}</li>\n`;
                });
                html += '</ul>\n';
            }
        });
    });
    html += '</body></html>';
    return html;
}
exports.default = knowledgeCommand;
//# sourceMappingURL=knowledge.js.map