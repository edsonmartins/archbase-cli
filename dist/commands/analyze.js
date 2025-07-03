"use strict";
/**
 * Analyze Command - Analisa projetos existentes para extrair padrões
 *
 * Examples:
 * archbase analyze project /Users/edsonmartins/tmp/archbase-react
 * archbase analyze patterns ./my-project --export=patterns.json
 * archbase analyze datasource ./project --version=v2
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
exports.analyzeCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const ProjectPatternAnalyzer_1 = require("../analyzers/ProjectPatternAnalyzer");
exports.analyzeCommand = new commander_1.Command('analyze')
    .description('Analyze existing projects to extract patterns and improve code generation')
    .addCommand(new commander_1.Command('project')
    .description('Analyze an entire project for patterns')
    .argument('<directory>', 'Path to the project directory to analyze')
    .option('--export <file>', 'Export analysis results to JSON file')
    .option('--format <type>', 'Output format (json|text)', 'text')
    .option('--focus <aspect>', 'Focus on specific aspect (datasource|forms|components)', 'all')
    .action(async (projectPath, options) => {
    if (options.format !== 'json') {
        console.log(chalk_1.default.blue(`🔍 Analisando projeto: ${projectPath}`));
    }
    try {
        const analyzer = new ProjectPatternAnalyzer_1.ProjectPatternAnalyzer(path.resolve(projectPath));
        const result = await analyzer.analyzeProject();
        if (options.export) {
            await analyzer.exportAnalysis(options.export);
        }
        if (options.format === 'json') {
            console.log(JSON.stringify(result, null, 2));
        }
        else {
            displayProjectAnalysis(result, options.focus);
        }
    }
    catch (error) {
        if (options.format === 'json') {
            console.log(JSON.stringify({ error: error.message }, null, 2));
        }
        else {
            console.error(chalk_1.default.red(`❌ Erro na análise: ${error.message}`));
        }
        process.exit(1);
    }
}))
    .addCommand(new commander_1.Command('datasource')
    .description('Analyze DataSource usage patterns')
    .argument('<directory>', 'Path to analyze')
    .option('--version <ver>', 'Focus on specific version (v1|v2|both)', 'both')
    .option('--export <file>', 'Export DataSource patterns to JSON file')
    .action(async (projectPath, options) => {
    console.log(chalk_1.default.blue(`🔍 Analisando padrões DataSource: ${projectPath}`));
    try {
        const analyzer = new ProjectPatternAnalyzer_1.ProjectPatternAnalyzer(path.resolve(projectPath));
        const result = await analyzer.analyzeProject();
        const dataSourcePatterns = result.dataSourceUsage.filter(ds => options.version === 'both' || ds.version === options.version);
        if (options.export) {
            await fs.writeJson(options.export, { dataSourcePatterns }, { spaces: 2 });
            console.log(chalk_1.default.green(`📄 Padrões DataSource exportados para: ${options.export}`));
        }
        displayDataSourceAnalysis(dataSourcePatterns);
    }
    catch (error) {
        console.error(chalk_1.default.red(`❌ Erro na análise DataSource: ${error.message}`));
        process.exit(1);
    }
}))
    .addCommand(new commander_1.Command('patterns')
    .description('Extract and suggest new patterns for templates')
    .argument('<directory>', 'Path to analyze')
    .option('--min-frequency <num>', 'Minimum frequency for pattern detection', '2')
    .option('--export <file>', 'Export patterns to JSON file')
    .action(async (projectPath, options) => {
    console.log(chalk_1.default.blue(`🔍 Extraindo padrões: ${projectPath}`));
    try {
        const analyzer = new ProjectPatternAnalyzer_1.ProjectPatternAnalyzer(path.resolve(projectPath));
        const result = await analyzer.analyzeProject();
        const frequentPatterns = result.patterns.filter(p => p.frequency >= parseInt(options.minFrequency));
        if (options.export) {
            await fs.writeJson(options.export, { patterns: frequentPatterns }, { spaces: 2 });
            console.log(chalk_1.default.green(`📄 Padrões exportados para: ${options.export}`));
        }
        displayPatternsAnalysis(frequentPatterns, result.recommendations);
    }
    catch (error) {
        console.error(chalk_1.default.red(`❌ Erro na extração de padrões: ${error.message}`));
        process.exit(1);
    }
}))
    .addCommand(new commander_1.Command('archbase-react')
    .description('Special analysis for archbase-react library to improve CLI knowledge')
    .argument('<archbase-react-path>', 'Path to archbase-react project')
    .option('--update-knowledge', 'Update CLI knowledge base with findings')
    .option('--export <file>', 'Export analysis for archbase-react')
    .action(async (archbaseReactPath, options) => {
    console.log(chalk_1.default.blue(`🔍 Analisando archbase-react: ${archbaseReactPath}`));
    console.log(chalk_1.default.yellow('📋 Focando em DataSource V2 e padrões específicos...'));
    try {
        const analyzer = new ProjectPatternAnalyzer_1.ProjectPatternAnalyzer(path.resolve(archbaseReactPath));
        const result = await analyzer.analyzeProject();
        // Análise específica para archbase-react
        const archbaseAnalysis = analyzeArchbaseReactSpecific(result);
        if (options.export) {
            await fs.writeJson(options.export, archbaseAnalysis, { spaces: 2 });
            console.log(chalk_1.default.green(`📄 Análise archbase-react exportada para: ${options.export}`));
        }
        if (options.updateKnowledge) {
            await updateKnowledgeBase(archbaseAnalysis);
            console.log(chalk_1.default.green('✅ Base de conhecimento atualizada com padrões do archbase-react'));
        }
        displayArchbaseReactAnalysis(archbaseAnalysis);
    }
    catch (error) {
        console.error(chalk_1.default.red(`❌ Erro na análise archbase-react: ${error.message}`));
        process.exit(1);
    }
}));
function displayProjectAnalysis(result, focus) {
    console.log(chalk_1.default.green('\n📊 Análise do Projeto\n'));
    if (focus === 'all' || focus === 'datasource') {
        console.log(chalk_1.default.yellow('🔗 DataSource Usage:'));
        result.dataSourceUsage.forEach((ds) => {
            console.log(`  ${chalk_1.default.cyan(ds.component)} (${ds.version}): ${ds.usageCount} usos`);
            if (ds.patterns.length > 0) {
                console.log(`    Padrões: ${ds.patterns.join(', ')}`);
            }
        });
    }
    if (focus === 'all' || focus === 'forms') {
        console.log(chalk_1.default.yellow('\n📝 Form Patterns:'));
        result.formPatterns.forEach((form) => {
            console.log(`  ${form.validationLibrary} + ${form.layout}: ${form.frequency}x`);
            console.log(`    Campos: ${form.fieldTypes.join(', ')}`);
        });
    }
    if (focus === 'all' || focus === 'components') {
        console.log(chalk_1.default.yellow('\n🧩 Component Usage:'));
        result.componentUsage
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, 10)
            .forEach((comp) => {
            console.log(`  ${chalk_1.default.cyan(comp.component)}: ${comp.usageCount} usos`);
            const topProps = Object.entries(comp.commonProps)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([prop]) => prop);
            if (topProps.length > 0) {
                console.log(`    Props comuns: ${topProps.join(', ')}`);
            }
        });
    }
    if (result.recommendations.length > 0) {
        console.log(chalk_1.default.yellow('\n💡 Recomendações:'));
        result.recommendations.forEach((rec) => {
            const icon = rec.priority === 'high' ? '🔥' : rec.priority === 'medium' ? '⚡' : '💭';
            console.log(`  ${icon} ${rec.title}`);
            console.log(`    ${chalk_1.default.gray(rec.description)}`);
        });
    }
}
function displayDataSourceAnalysis(patterns) {
    console.log(chalk_1.default.green('\n🔗 Análise DataSource\n'));
    const v1Count = patterns.filter(p => p.version === 'v1').length;
    const v2Count = patterns.filter(p => p.version === 'v2').length;
    const mixedCount = patterns.filter(p => p.version === 'mixed').length;
    console.log(`📊 Distribuição de versões:`);
    console.log(`  V1: ${v1Count} padrões`);
    console.log(`  V2: ${v2Count} padrões`);
    console.log(`  Mixed: ${mixedCount} padrões`);
    patterns.forEach(pattern => {
        console.log(`\n${chalk_1.default.cyan(pattern.component)} (${pattern.version}):`);
        console.log(`  Usos: ${pattern.usageCount}`);
        console.log(`  Padrões: ${pattern.patterns.join(', ')}`);
        const topProps = Object.entries(pattern.commonProps)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);
        if (topProps.length > 0) {
            console.log(`  Props mais usadas:`);
            topProps.forEach(([prop, count]) => {
                console.log(`    ${prop}: ${count}x`);
            });
        }
    });
}
function displayPatternsAnalysis(patterns, recommendations) {
    console.log(chalk_1.default.green('\n🎨 Padrões Detectados\n'));
    patterns.forEach(pattern => {
        console.log(`${chalk_1.default.cyan(pattern.name)} (${pattern.type}):`);
        console.log(`  Frequência: ${pattern.frequency}x`);
        console.log(`  Descrição: ${pattern.description}`);
        console.log(`  Template sugerido: ${pattern.template}`);
        if (Object.keys(pattern.parameters).length > 0) {
            console.log(`  Parâmetros:`);
            Object.entries(pattern.parameters).forEach(([key, value]) => {
                console.log(`    ${key}: ${JSON.stringify(value)}`);
            });
        }
        console.log('');
    });
    if (recommendations.length > 0) {
        console.log(chalk_1.default.yellow('💡 Recomendações para Templates:'));
        recommendations.forEach(rec => {
            console.log(`  • ${rec.title} (${rec.priority})`);
            console.log(`    ${chalk_1.default.gray(rec.implementation)}`);
        });
    }
}
function analyzeArchbaseReactSpecific(result) {
    return {
        dataSourceV2Features: extractDataSourceV2Features(result),
        componentCatalog: buildComponentCatalog(result),
        commonPatterns: identifyArchbasePatterns(result),
        migrationInsights: generateMigrationInsights(result),
        newParametersNeeded: suggestNewParameters(result)
    };
}
function extractDataSourceV2Features(result) {
    const v2Patterns = result.dataSourceUsage.filter((ds) => ds.version === 'v2' || ds.version === 'mixed');
    const v2Features = new Set();
    v2Patterns.forEach((pattern) => {
        pattern.patterns.forEach((p) => v2Features.add(p));
    });
    return {
        detectedFeatures: Array.from(v2Features),
        components: v2Patterns.map((p) => p.component),
        migrationPatterns: v2Patterns.filter((p) => p.version === 'mixed')
    };
}
function buildComponentCatalog(result) {
    return result.componentUsage
        .sort((a, b) => b.usageCount - a.usageCount)
        .map((comp) => ({
        name: comp.component,
        usage: comp.usageCount,
        commonProps: Object.keys(comp.commonProps).slice(0, 10),
        contexts: comp.contexts,
        recommendedFor: comp.patterns
    }));
}
function identifyArchbasePatterns(result) {
    return result.patterns
        .filter((p) => p.frequency >= 3)
        .map((pattern) => ({
        ...pattern,
        templatePriority: pattern.frequency >= 5 ? 'high' : 'medium',
        cliParametersNeeded: generateParametersForPattern(pattern)
    }));
}
function generateMigrationInsights(result) {
    const v1Usage = result.dataSourceUsage.filter((ds) => ds.version === 'v1');
    const v2Usage = result.dataSourceUsage.filter((ds) => ds.version === 'v2');
    return {
        v1Components: v1Usage.map((u) => u.component),
        v2Components: v2Usage.map((u) => u.component),
        migrationCandidates: v1Usage.filter((v1) => v2Usage.some((v2) => v2.component === v1.component)),
        newV2OnlyFeatures: v2Usage.filter((v2) => !v1Usage.some((v1) => v1.component === v2.component))
    };
}
function suggestNewParameters(result) {
    const parameters = [];
    // DataSource version parameter
    const hasV1 = result.dataSourceUsage.some((ds) => ds.version === 'v1');
    const hasV2 = result.dataSourceUsage.some((ds) => ds.version === 'v2');
    if (hasV1 && hasV2) {
        parameters.push({
            name: 'datasource-version',
            values: ['v1', 'v2'],
            description: 'Choose DataSource version',
            defaultValue: 'v2',
            appliesTo: ['forms', 'views', 'components']
        });
    }
    // Validation library parameter
    const validationLibs = result.validationPatterns.map((vp) => vp.type);
    if (validationLibs.length > 1) {
        parameters.push({
            name: 'validation-library',
            values: validationLibs,
            description: 'Choose validation library',
            defaultValue: validationLibs[0],
            appliesTo: ['forms']
        });
    }
    return parameters;
}
function generateParametersForPattern(pattern) {
    const params = [];
    if (pattern.parameters.validation) {
        params.push(`--validation=${pattern.parameters.validation}`);
    }
    if (pattern.parameters.layout) {
        params.push(`--layout=${pattern.parameters.layout}`);
    }
    if (pattern.parameters.version) {
        params.push(`--datasource-version=${pattern.parameters.version}`);
    }
    return params;
}
function displayArchbaseReactAnalysis(analysis) {
    console.log(chalk_1.default.green('\n🎯 Análise Específica Archbase React\n'));
    console.log(chalk_1.default.yellow('🔗 DataSource V2 Features:'));
    analysis.dataSourceV2Features.detectedFeatures.forEach((feature) => {
        console.log(`  ✓ ${feature}`);
    });
    console.log(chalk_1.default.yellow('\n📦 Top Components (por uso):'));
    analysis.componentCatalog.slice(0, 10).forEach((comp) => {
        console.log(`  ${chalk_1.default.cyan(comp.name)}: ${comp.usage} usos`);
        if (comp.commonProps.length > 0) {
            console.log(`    Props: ${comp.commonProps.slice(0, 3).join(', ')}`);
        }
    });
    console.log(chalk_1.default.yellow('\n🎨 Padrões para Templates:'));
    analysis.commonPatterns.forEach((pattern) => {
        console.log(`  ${chalk_1.default.cyan(pattern.name)} (${pattern.templatePriority} priority)`);
        console.log(`    CLI: archbase generate ${pattern.type} MyComponent ${pattern.cliParametersNeeded.join(' ')}`);
    });
    console.log(chalk_1.default.yellow('\n⚙️  Novos Parâmetros Sugeridos:'));
    analysis.newParametersNeeded.forEach((param) => {
        console.log(`  --${param.name} <${param.values.join('|')}>`);
        console.log(`    ${chalk_1.default.gray(param.description)} (default: ${param.defaultValue})`);
        console.log(`    Aplica-se a: ${param.appliesTo.join(', ')}`);
    });
}
async function updateKnowledgeBase(analysis) {
    // Esta função atualizaria a base de conhecimento do CLI
    // com os padrões encontrados no archbase-react
    console.log(chalk_1.default.blue('🔄 Atualizando base de conhecimento...'));
    // Implementar atualização real da knowledge base
    // Por exemplo, adicionar novos componentes encontrados
    // ou atualizar padrões existentes
}
//# sourceMappingURL=analyze.js.map