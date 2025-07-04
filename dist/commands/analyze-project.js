"use strict";
/**
 * Analyze Project Command - Analisa projetos que usam archbase-react
 *
 * Examples:
 * archbase analyze-project ./my-admin-project
 * archbase analyze-project ./my-project --focus=datasource
 * archbase analyze-project ./my-project --suggest-improvements
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
exports.analyzeProjectCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const ProjectPatternAnalyzer_1 = require("../analyzers/ProjectPatternAnalyzer");
exports.analyzeProjectCommand = new commander_1.Command('analyze-project')
    .description('Analyze projects using archbase-react to extract patterns and suggest improvements')
    .argument('<directory>', 'Path to the project directory to analyze')
    .option('--focus <aspect>', 'Focus analysis on specific aspect (datasource|forms|components|all)', 'all')
    .option('--suggest-improvements', 'Generate specific improvement suggestions')
    .option('--export <file>', 'Export analysis results to JSON file')
    .option('--format <type>', 'Output format (json|text)', 'text')
    .action(async (projectPath, options) => {
    if (options.format !== 'json') {
        console.log(chalk_1.default.blue(`🔍 Analisando projeto Archbase React: ${projectPath}`));
        console.log(chalk_1.default.gray(`📋 Foco: ${options.focus}`));
    }
    try {
        // Verificar se é um projeto que usa archbase-react
        await validateArchbaseProject(projectPath);
        const analyzer = new ProjectPatternAnalyzer_1.ProjectPatternAnalyzer(path.resolve(projectPath));
        const result = await analyzer.analyzeProject();
        // Processar análise específica para projetos archbase-react
        const archbaseAnalysis = processArchbaseProjectAnalysis(result);
        if (options.suggestImprovements) {
            archbaseAnalysis.improvements = generateImprovementSuggestions(result);
        }
        if (options.export) {
            await fs.writeJson(options.export, archbaseAnalysis, { spaces: 2 });
            console.log(chalk_1.default.green(`📄 Análise exportada para: ${options.export}`));
        }
        if (options.format === 'json') {
            console.log(JSON.stringify(archbaseAnalysis, null, 2));
        }
        else {
            displayArchbaseProjectAnalysis(archbaseAnalysis, options.focus, options.suggestImprovements);
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
});
async function validateArchbaseProject(projectPath) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (!(await fs.pathExists(packageJsonPath))) {
        throw new Error('Diretório não contém um package.json válido');
    }
    const packageJson = await fs.readJson(packageJsonPath);
    const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
    };
    if (!dependencies['archbase-react']) {
        throw new Error('Projeto não usa archbase-react como dependência');
    }
    console.log(chalk_1.default.green(`✅ Projeto válido usando archbase-react ${dependencies['archbase-react']}`));
}
function processArchbaseProjectAnalysis(result) {
    return {
        projectInfo: {
            archbaseComponents: result.componentUsage.filter((c) => c.component.startsWith('Archbase')),
            dataSourceVersion: detectPrimaryDataSourceVersion(result),
            formPatterns: result.formPatterns,
            validationLibraries: result.validationPatterns.map((v) => v.type),
            pageStructures: result.pageStructures
        },
        dataSourceAnalysis: {
            usage: result.dataSourceUsage,
            migrationOpportunities: findMigrationOpportunities(result),
            performanceIssues: findPerformanceIssues(result),
            modernizationSuggestions: generateModernizationSuggestions(result)
        },
        codeQuality: {
            componentComplexity: assessComponentComplexity(result),
            consistencyIssues: findConsistencyIssues(result),
            bestPracticeViolations: findBestPracticeViolations(result)
        },
        recommendations: result.recommendations
    };
}
function detectPrimaryDataSourceVersion(result) {
    const v1Count = result.dataSourceUsage.filter((ds) => ds.version === 'v1').length;
    const v2Count = result.dataSourceUsage.filter((ds) => ds.version === 'v2').length;
    const mixedCount = result.dataSourceUsage.filter((ds) => ds.version === 'mixed').length;
    if (v2Count > v1Count)
        return 'v2';
    if (v1Count > v2Count)
        return 'v1';
    if (mixedCount > 0)
        return 'mixed';
    return 'unknown';
}
function findMigrationOpportunities(result) {
    const opportunities = [];
    // V1 components que poderiam migrar para V2
    const v1Components = result.dataSourceUsage.filter((ds) => ds.version === 'v1');
    v1Components.forEach((comp) => {
        if (comp.usageCount >= 3) {
            opportunities.push({
                type: 'datasource-migration',
                component: comp.component,
                description: `${comp.component} usado ${comp.usageCount}x com DataSource V1, considere migrar para V2`,
                effort: 'medium',
                benefits: ['Melhor performance', 'Novas funcionalidades', 'Código mais limpo'],
                files: comp.files.slice(0, 3) // Mostrar apenas alguns arquivos
            });
        }
    });
    // Formulários que poderiam usar validação mais moderna
    const formPatterns = result.formPatterns.filter((fp) => fp.validationLibrary === 'none');
    if (formPatterns.length > 0) {
        opportunities.push({
            type: 'validation-upgrade',
            description: `${formPatterns.length} formulários sem validação poderiam usar Yup ou Zod`,
            effort: 'low',
            benefits: ['Melhor UX', 'Validação consistente', 'Menos bugs']
        });
    }
    return opportunities;
}
function findPerformanceIssues(result) {
    const issues = [];
    // Componentes com alta complexidade
    const complexComponents = result.componentUsage.filter((c) => c.usageCount > 10 && c.patterns.includes('stateful'));
    complexComponents.forEach(comp => {
        issues.push({
            type: 'component-complexity',
            component: comp.component,
            description: `${comp.component} usado ${comp.usageCount}x com estado - considere memoização`,
            suggestion: 'Adicionar React.memo ou useMemo para otimizar re-renders'
        });
    });
    // DataSource V1 em componentes frequentes
    const frequentV1 = result.dataSourceUsage.filter((ds) => ds.version === 'v1' && ds.usageCount > 5);
    frequentV1.forEach(ds => {
        issues.push({
            type: 'datasource-performance',
            component: ds.component,
            description: `${ds.component} usando DataSource V1 ${ds.usageCount}x - V2 tem melhor performance`,
            suggestion: 'Migrar para DataSource V2 para melhor performance e funcionalidades'
        });
    });
    return issues;
}
function generateModernizationSuggestions(result) {
    const suggestions = [];
    // Sugestão para usar hooks customizados
    const dataSourceUsage = result.dataSourceUsage.length;
    if (dataSourceUsage > 5) {
        suggestions.push({
            type: 'custom-hooks',
            description: 'Considere criar hooks customizados para padrões comuns de DataSource',
            example: 'useUserDataSource, useProductDataSource, etc.',
            benefits: ['Reutilização de código', 'Lógica centralizada', 'Fácil manutenção']
        });
    }
    // Sugestão para padronização de formulários
    const formPatterns = result.formPatterns;
    if (formPatterns.length > 3) {
        suggestions.push({
            type: 'form-standardization',
            description: 'Padronizar formulários usando FormBuilder para maior consistência',
            benefits: ['Menos código repetitivo', 'Validação consistente', 'Manutenção mais fácil']
        });
    }
    return suggestions;
}
function assessComponentComplexity(result) {
    const totalComponents = result.componentUsage.length;
    const complexComponents = result.componentUsage.filter((c) => c.patterns.includes('stateful') && c.patterns.includes('with-effects')).length;
    return {
        totalComponents,
        complexComponents,
        complexityRatio: totalComponents > 0 ? complexComponents / totalComponents : 0,
        assessment: complexComponents / totalComponents > 0.3 ? 'high' :
            complexComponents / totalComponents > 0.1 ? 'medium' : 'low'
    };
}
function findConsistencyIssues(result) {
    const issues = [];
    // Múltiplas bibliotecas de validação
    const validationLibs = result.validationPatterns.map((v) => v.type);
    if (validationLibs.length > 1) {
        issues.push({
            type: 'validation-inconsistency',
            description: `Projeto usa múltiplas bibliotecas de validação: ${validationLibs.join(', ')}`,
            suggestion: 'Padronizar em uma biblioteca de validação'
        });
    }
    // DataSource versions mixed
    const hasV1 = result.dataSourceUsage.some((ds) => ds.version === 'v1');
    const hasV2 = result.dataSourceUsage.some((ds) => ds.version === 'v2');
    if (hasV1 && hasV2) {
        issues.push({
            type: 'datasource-inconsistency',
            description: 'Projeto mistura DataSource V1 e V2',
            suggestion: 'Migrar todos os componentes para DataSource V2'
        });
    }
    return issues;
}
function findBestPracticeViolations(result) {
    const violations = [];
    // Componentes sem TypeScript
    const hasNonTSComponents = result.componentUsage.some((c) => !c.contexts.includes('typescript'));
    if (hasNonTSComponents) {
        violations.push({
            type: 'typescript-usage',
            description: 'Alguns componentes não usam TypeScript',
            suggestion: 'Migrar todos os componentes para TypeScript para type safety'
        });
    }
    // Formulários sem validação
    const noValidationForms = result.formPatterns.filter((fp) => fp.validationLibrary === 'none').length;
    if (noValidationForms > 0) {
        violations.push({
            type: 'form-validation',
            description: `${noValidationForms} formulários sem validação`,
            suggestion: 'Adicionar validação em todos os formulários para melhor UX'
        });
    }
    return violations;
}
function generateImprovementSuggestions(result) {
    const improvements = [];
    // Sugestões específicas baseadas na análise
    const dataSourceAnalysis = result.dataSourceUsage;
    const formAnalysis = result.formPatterns;
    // CLI commands para melhorar o projeto
    improvements.push({
        category: 'code-generation',
        title: 'Use Archbase CLI para padronizar código',
        suggestions: [
            {
                description: 'Gerar formulários padronizados',
                command: 'archbase generate form --template=validation --datasource-version=v2',
                benefit: 'Formulários consistentes com validação e DataSource V2'
            },
            {
                description: 'Gerar views CRUD modernas',
                command: 'archbase generate view --template=crud --datasource-version=v2 --with-filters',
                benefit: 'Views completas com filtros e DataSource V2'
            }
        ]
    });
    if (dataSourceAnalysis.some((ds) => ds.version === 'v1')) {
        improvements.push({
            category: 'modernization',
            title: 'Migração DataSource V1 → V2',
            suggestions: [
                {
                    description: 'Migrar componentes prioritários para DataSource V2',
                    steps: [
                        'Identificar componentes mais usados',
                        'Atualizar imports para DataSource V2',
                        'Usar novos métodos como appendToFieldArray',
                        'Testar funcionalidades migradas'
                    ]
                }
            ]
        });
    }
    return improvements;
}
function displayArchbaseProjectAnalysis(analysis, focus, suggestImprovements) {
    console.log(chalk_1.default.green('\n📊 Análise do Projeto Archbase React\n'));
    // Project Info
    if (focus === 'all') {
        console.log(chalk_1.default.yellow('📦 Informações do Projeto:'));
        console.log(`  Componentes Archbase: ${analysis.projectInfo.archbaseComponents.length}`);
        console.log(`  DataSource Version: ${analysis.projectInfo.dataSourceVersion}`);
        console.log(`  Padrões de Form: ${analysis.projectInfo.formPatterns.length}`);
        console.log(`  Bibliotecas de validação: ${analysis.projectInfo.validationLibraries.join(', ')}`);
    }
    // DataSource Analysis
    if (focus === 'all' || focus === 'datasource') {
        console.log(chalk_1.default.yellow('\n🔗 Análise DataSource:'));
        analysis.dataSourceAnalysis.usage.forEach((ds) => {
            console.log(`  ${chalk_1.default.cyan(ds.component)} (${ds.version}): ${ds.usageCount} usos`);
            if (ds.patterns.length > 0) {
                console.log(`    Padrões: ${ds.patterns.join(', ')}`);
            }
        });
        if (analysis.dataSourceAnalysis.migrationOpportunities.length > 0) {
            console.log(chalk_1.default.yellow('\n🚀 Oportunidades de Migração:'));
            analysis.dataSourceAnalysis.migrationOpportunities.forEach((opp) => {
                console.log(`  📈 ${opp.description}`);
                console.log(`    Esforço: ${opp.effort} | Benefícios: ${opp.benefits.join(', ')}`);
            });
        }
        if (analysis.dataSourceAnalysis.performanceIssues.length > 0) {
            console.log(chalk_1.default.yellow('\n⚡ Issues de Performance:'));
            analysis.dataSourceAnalysis.performanceIssues.forEach((issue) => {
                console.log(`  ⚠️  ${issue.description}`);
                console.log(`    💡 ${issue.suggestion}`);
            });
        }
    }
    // Code Quality
    if (focus === 'all') {
        console.log(chalk_1.default.yellow('\n🎯 Qualidade do Código:'));
        console.log(`  Complexidade: ${analysis.codeQuality.componentComplexity.assessment}`);
        console.log(`  Componentes complexos: ${analysis.codeQuality.componentComplexity.complexComponents}/${analysis.codeQuality.componentComplexity.totalComponents}`);
        if (analysis.codeQuality.consistencyIssues.length > 0) {
            console.log(chalk_1.default.yellow('\n⚠️  Issues de Consistência:'));
            analysis.codeQuality.consistencyIssues.forEach((issue) => {
                console.log(`  • ${issue.description}`);
                console.log(`    💡 ${issue.suggestion}`);
            });
        }
    }
    // Improvement Suggestions
    if (suggestImprovements && analysis.improvements) {
        console.log(chalk_1.default.yellow('\n💡 Sugestões de Melhoria:'));
        analysis.improvements.forEach((improvement) => {
            console.log(`\n${chalk_1.default.cyan(improvement.title)}:`);
            improvement.suggestions.forEach((suggestion) => {
                console.log(`  • ${suggestion.description}`);
                if (suggestion.command) {
                    console.log(`    ${chalk_1.default.green('$ ' + suggestion.command)}`);
                    console.log(`    ${chalk_1.default.gray(suggestion.benefit)}`);
                }
                if (suggestion.steps) {
                    suggestion.steps.forEach((step, index) => {
                        console.log(`    ${index + 1}. ${step}`);
                    });
                }
            });
        });
    }
    console.log(chalk_1.default.green('\n✅ Análise concluída!'));
}
//# sourceMappingURL=analyze-project.js.map