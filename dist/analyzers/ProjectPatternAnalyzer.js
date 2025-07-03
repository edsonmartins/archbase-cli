"use strict";
/**
 * ProjectPatternAnalyzer - Analisa projetos existentes para extrair padrões
 *
 * Esta classe analisa projetos Archbase React existentes para identificar:
 * - Padrões de uso de componentes
 * - Estruturas de formulários comuns
 * - Configurações de DataSource V1/V2
 * - Padrões de validação
 * - Estruturas de páginas e layouts
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
exports.ProjectPatternAnalyzer = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
const glob_1 = require("glob");
class ProjectPatternAnalyzer {
    constructor(projectPath) {
        this.projectPath = projectPath;
        this.analysisResult = {
            patterns: [],
            dataSourceUsage: [],
            formPatterns: [],
            componentUsage: [],
            validationPatterns: [],
            pageStructures: [],
            recommendations: []
        };
    }
    /**
     * Analisa um projeto completo
     */
    async analyzeProject() {
        console.log(`🔍 Analisando projeto: ${this.projectPath}`);
        // Encontrar todos os arquivos React/TypeScript
        const files = await this.findReactFiles();
        console.log(`📁 Encontrados ${files.length} arquivos para análise`);
        // Analisar cada arquivo
        for (const file of files) {
            await this.analyzeFile(file);
        }
        // Processar padrões encontrados
        this.processPatterns();
        this.generateRecommendations();
        return this.analysisResult;
    }
    /**
     * Encontra todos os arquivos React/TypeScript no projeto
     */
    async findReactFiles() {
        const glob = new glob_1.Glob('**/*.{tsx,ts,jsx,js}', {
            cwd: this.projectPath,
            ignore: [
                'node_modules/**',
                'dist/**',
                'build/**',
                '**/*.test.*',
                '**/*.spec.*',
                '**/*.d.ts'
            ]
        });
        const files = [];
        for await (const file of glob) {
            files.push(path.join(this.projectPath, file));
        }
        return files;
    }
    /**
     * Analisa um arquivo individual
     */
    async analyzeFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const relativePath = path.relative(this.projectPath, filePath);
            // Parse do AST
            const ast = (0, parser_1.parse)(content, {
                sourceType: 'module',
                plugins: [
                    'typescript',
                    'jsx',
                    'decorators-legacy',
                    'classProperties',
                    'objectRestSpread'
                ]
            });
            // Analisar diferentes aspectos
            this.analyzeDataSourceUsage(ast, relativePath, content);
            this.analyzeFormPatterns(ast, relativePath, content);
            this.analyzeComponentUsage(ast, relativePath, content);
            this.analyzeValidationPatterns(ast, relativePath, content);
            this.analyzePageStructure(ast, relativePath, content);
        }
        catch (error) {
            console.warn(`⚠️  Erro ao analisar ${filePath}: ${error.message}`);
        }
    }
    /**
     * Analisa uso de DataSource V1/V2
     */
    analyzeDataSourceUsage(ast, file, content) {
        let hasV1 = false;
        let hasV2 = false;
        const components = [];
        const props = {};
        (0, traverse_1.default)(ast, {
            ImportDeclaration: (path) => {
                const source = path.node.source.value;
                if (source === '@archbase/react') {
                    path.node.specifiers.forEach(spec => {
                        if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
                            const name = spec.imported.name;
                            if (name.includes('DataSource')) {
                                components.push(name);
                            }
                        }
                    });
                }
            },
            JSXElement: (path) => {
                const elementName = path.node.openingElement.name;
                if (t.isJSXIdentifier(elementName) && elementName.name.startsWith('Archbase')) {
                    const component = elementName.name;
                    // Verificar props para detectar V1/V2
                    path.node.openingElement.attributes.forEach(attr => {
                        if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
                            const propName = attr.name.name;
                            // Props indicativas de V1
                            if (['dataSource', 'dataField'].includes(propName)) {
                                hasV1 = true;
                            }
                            // Props indicativas de V2 (exemplo: novos métodos)
                            if (content.includes('appendToFieldArray') || content.includes('isDataSourceV2')) {
                                hasV2 = true;
                            }
                            props[propName] = (props[propName] || 0) + 1;
                        }
                    });
                }
            }
        });
        if (components.length > 0) {
            const version = hasV2 ? (hasV1 ? 'mixed' : 'v2') : 'v1';
            components.forEach(component => {
                const existing = this.analysisResult.dataSourceUsage.find(ds => ds.component === component && ds.version === version);
                if (existing) {
                    existing.usageCount++;
                    existing.files.push(file);
                    Object.keys(props).forEach(prop => {
                        existing.commonProps[prop] = (existing.commonProps[prop] || 0) + props[prop];
                    });
                }
                else {
                    this.analysisResult.dataSourceUsage.push({
                        version,
                        component,
                        usageCount: 1,
                        commonProps: { ...props },
                        patterns: this.detectDataSourcePatterns(content),
                        files: [file]
                    });
                }
            });
        }
    }
    /**
     * Detecta padrões de DataSource no código
     */
    detectDataSourcePatterns(content) {
        const patterns = [];
        if (content.includes('useArchbaseDataSource')) {
            patterns.push('hook-based');
        }
        if (content.includes('createDataSource')) {
            patterns.push('factory-pattern');
        }
        if (content.includes('dataSource.fieldByName')) {
            patterns.push('field-access');
        }
        if (content.includes('dataSource.search')) {
            patterns.push('search-functionality');
        }
        if (content.includes('dataSource.sort')) {
            patterns.push('sorting');
        }
        if (content.includes('dataSource.pagination')) {
            patterns.push('pagination');
        }
        if (content.includes('appendToFieldArray') || content.includes('removeFromFieldArray')) {
            patterns.push('array-field-management');
        }
        return patterns;
    }
    /**
     * Analisa padrões de formulários
     */
    analyzeFormPatterns(ast, file, content) {
        let validationLibrary = 'none';
        const fieldTypes = new Set();
        const features = new Set();
        let layout = 'vertical';
        // Detectar biblioteca de validação
        if (content.includes('yup.') || content.includes('* as yup')) {
            validationLibrary = 'yup';
        }
        else if (content.includes('z.') || content.includes('from "zod"')) {
            validationLibrary = 'zod';
        }
        else if (content.includes('validate') || content.includes('validation')) {
            validationLibrary = 'custom';
        }
        (0, traverse_1.default)(ast, {
            JSXElement: (path) => {
                const elementName = path.node.openingElement.name;
                if (t.isJSXIdentifier(elementName)) {
                    const name = elementName.name;
                    // Detectar tipos de campo
                    if (name === 'ArchbaseEdit')
                        fieldTypes.add('text');
                    if (name === 'ArchbasePasswordEdit')
                        fieldTypes.add('password');
                    if (name === 'ArchbaseNumberEdit')
                        fieldTypes.add('number');
                    if (name === 'ArchbaseSelect')
                        fieldTypes.add('select');
                    if (name === 'ArchbaseCheckbox')
                        fieldTypes.add('checkbox');
                    if (name === 'ArchbaseDatePicker')
                        fieldTypes.add('date');
                    if (name === 'ArchbaseTextArea')
                        fieldTypes.add('textarea');
                    // Detectar features
                    if (name === 'FormBuilder')
                        features.add('form-builder');
                    if (name.includes('Wizard'))
                        features.add('wizard');
                    if (name.includes('Step'))
                        features.add('multi-step');
                }
                // Detectar layout
                path.node.openingElement.attributes.forEach(attr => {
                    if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
                        if (attr.name.name === 'layout' && t.isStringLiteral(attr.value)) {
                            layout = attr.value.value;
                        }
                    }
                });
            }
        });
        if (fieldTypes.size > 0) {
            const complexity = fieldTypes.size > 5 ? 'high' : fieldTypes.size > 2 ? 'medium' : 'low';
            const existing = this.analysisResult.formPatterns.find(fp => fp.validationLibrary === validationLibrary &&
                fp.layout === layout &&
                fp.complexity === complexity);
            if (existing) {
                existing.frequency++;
            }
            else {
                this.analysisResult.formPatterns.push({
                    fieldTypes: Array.from(fieldTypes),
                    validationLibrary,
                    layout,
                    commonFeatures: Array.from(features),
                    complexity,
                    frequency: 1
                });
            }
        }
    }
    /**
     * Analisa uso de componentes
     */
    analyzeComponentUsage(ast, file, content) {
        const componentUsage = new Map();
        (0, traverse_1.default)(ast, {
            JSXElement: (path) => {
                const elementName = path.node.openingElement.name;
                if (t.isJSXIdentifier(elementName) && elementName.name.startsWith('Archbase')) {
                    const component = elementName.name;
                    if (!componentUsage.has(component)) {
                        componentUsage.set(component, { count: 0, props: {} });
                    }
                    const usage = componentUsage.get(component);
                    usage.count++;
                    // Contar props
                    path.node.openingElement.attributes.forEach(attr => {
                        if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
                            const propName = attr.name.name;
                            usage.props[propName] = (usage.props[propName] || 0) + 1;
                        }
                    });
                }
            }
        });
        // Atualizar estatísticas globais
        componentUsage.forEach((usage, component) => {
            const existing = this.analysisResult.componentUsage.find(cu => cu.component === component);
            if (existing) {
                existing.usageCount += usage.count;
                Object.keys(usage.props).forEach(prop => {
                    existing.commonProps[prop] = (existing.commonProps[prop] || 0) + usage.props[prop];
                });
            }
            else {
                this.analysisResult.componentUsage.push({
                    component,
                    usageCount: usage.count,
                    commonProps: usage.props,
                    patterns: this.detectComponentPatterns(component, content),
                    contexts: this.detectComponentContexts(file)
                });
            }
        });
    }
    /**
     * Detecta padrões de uso de componentes
     */
    detectComponentPatterns(component, content) {
        const patterns = [];
        if (content.includes(`${component}`) && content.includes('useState')) {
            patterns.push('stateful');
        }
        if (content.includes(`${component}`) && content.includes('useEffect')) {
            patterns.push('with-effects');
        }
        if (content.includes(`${component}`) && content.includes('memo')) {
            patterns.push('memoized');
        }
        if (content.includes(`${component}`) && content.includes('forwardRef')) {
            patterns.push('with-ref');
        }
        return patterns;
    }
    /**
     * Detecta contextos de uso de componentes
     */
    detectComponentContexts(file) {
        const contexts = [];
        if (file.includes('form'))
            contexts.push('forms');
        if (file.includes('page'))
            contexts.push('pages');
        if (file.includes('modal'))
            contexts.push('modals');
        if (file.includes('dashboard'))
            contexts.push('dashboard');
        if (file.includes('admin'))
            contexts.push('admin');
        if (file.includes('list'))
            contexts.push('lists');
        return contexts;
    }
    /**
     * Analisa padrões de validação
     */
    analyzeValidationPatterns(ast, file, content) {
        // Implementar análise de validação
        let validationType = 'custom';
        const rules = new Set();
        if (content.includes('yup.')) {
            validationType = 'yup';
            if (content.includes('.required('))
                rules.add('required');
            if (content.includes('.email('))
                rules.add('email');
            if (content.includes('.min('))
                rules.add('min-length');
            if (content.includes('.max('))
                rules.add('max-length');
            if (content.includes('.matches('))
                rules.add('regex');
        }
        else if (content.includes('z.')) {
            validationType = 'zod';
            if (content.includes('z.string()'))
                rules.add('string');
            if (content.includes('z.number()'))
                rules.add('number');
            if (content.includes('z.email()'))
                rules.add('email');
            if (content.includes('z.min('))
                rules.add('min-length');
        }
        if (rules.size > 0) {
            const existing = this.analysisResult.validationPatterns.find(vp => vp.type === validationType);
            if (existing) {
                existing.frequency++;
                rules.forEach(rule => {
                    if (!existing.rules.includes(rule)) {
                        existing.rules.push(rule);
                    }
                });
            }
            else {
                this.analysisResult.validationPatterns.push({
                    type: validationType,
                    rules: Array.from(rules),
                    frequency: 1,
                    examples: [file]
                });
            }
        }
    }
    /**
     * Analisa estrutura de páginas
     */
    analyzePageStructure(ast, file, content) {
        let layout = 'unknown';
        const sections = new Set();
        let hasAuth = false;
        let hasNavigation = false;
        // Detectar layout
        if (content.includes('Sidebar') || content.includes('sidebar'))
            layout = 'sidebar';
        else if (content.includes('Header') || content.includes('header'))
            layout = 'header';
        else if (content.includes('Dashboard') || content.includes('dashboard'))
            layout = 'dashboard';
        // Detectar seções
        if (content.includes('header'))
            sections.add('header');
        if (content.includes('sidebar'))
            sections.add('sidebar');
        if (content.includes('footer'))
            sections.add('footer');
        if (content.includes('main'))
            sections.add('main');
        if (content.includes('navigation') || content.includes('nav')) {
            sections.add('navigation');
            hasNavigation = true;
        }
        // Detectar autenticação
        if (content.includes('auth') || content.includes('login') || content.includes('user')) {
            hasAuth = true;
        }
        if (sections.size > 0) {
            const existing = this.analysisResult.pageStructures.find(ps => ps.layout === layout);
            if (existing) {
                existing.frequency++;
            }
            else {
                this.analysisResult.pageStructures.push({
                    layout,
                    sections: Array.from(sections),
                    navigation: hasNavigation ? 'present' : 'absent',
                    authentication: hasAuth,
                    frequency: 1
                });
            }
        }
    }
    /**
     * Processa padrões detectados e cria templates
     */
    processPatterns() {
        // Criar padrões de formulários
        this.analysisResult.formPatterns.forEach(pattern => {
            if (pattern.frequency >= 2) { // Só padrões que aparecem mais de uma vez
                this.analysisResult.patterns.push({
                    name: `form-${pattern.validationLibrary}-${pattern.layout}`,
                    type: 'form',
                    frequency: pattern.frequency,
                    files: [],
                    description: `Formulário ${pattern.layout} com validação ${pattern.validationLibrary}`,
                    template: `forms/${pattern.validationLibrary}-${pattern.layout}.hbs`,
                    parameters: {
                        validation: pattern.validationLibrary,
                        layout: pattern.layout,
                        fieldTypes: pattern.fieldTypes,
                        complexity: pattern.complexity
                    },
                    examples: []
                });
            }
        });
        // Criar padrões de DataSource
        this.analysisResult.dataSourceUsage.forEach(usage => {
            if (usage.usageCount >= 3) {
                this.analysisResult.patterns.push({
                    name: `datasource-${usage.version}-${usage.component}`,
                    type: 'component',
                    frequency: usage.usageCount,
                    files: usage.files,
                    description: `Uso de ${usage.component} com DataSource ${usage.version}`,
                    template: `components/datasource-${usage.version}.hbs`,
                    parameters: {
                        version: usage.version,
                        component: usage.component,
                        commonProps: usage.commonProps,
                        patterns: usage.patterns
                    },
                    examples: []
                });
            }
        });
    }
    /**
     * Gera recomendações baseadas na análise
     */
    generateRecommendations() {
        // Recomendações para DataSource V2
        const v1Usage = this.analysisResult.dataSourceUsage.filter(ds => ds.version === 'v1');
        const v2Usage = this.analysisResult.dataSourceUsage.filter(ds => ds.version === 'v2');
        if (v1Usage.length > 0 && v2Usage.length === 0) {
            this.analysisResult.recommendations.push({
                type: 'parameter',
                title: 'Adicionar suporte DataSource V2',
                description: 'Projeto usa apenas DataSource V1. Considere migrar para V2 para melhor performance.',
                priority: 'medium',
                implementation: 'Adicionar parâmetro --datasource-version=v2 nos generators'
            });
        }
        // Recomendações para templates mais específicos
        const highFrequencyPatterns = this.analysisResult.patterns.filter(p => p.frequency >= 5);
        if (highFrequencyPatterns.length > 0) {
            this.analysisResult.recommendations.push({
                type: 'template',
                title: 'Criar templates específicos',
                description: `Detectados ${highFrequencyPatterns.length} padrões frequentes que merecem templates dedicados.`,
                priority: 'high',
                implementation: 'Criar templates específicos para os padrões mais utilizados'
            });
        }
        // Recomendações para validação
        const validationLibs = this.analysisResult.validationPatterns.map(vp => vp.type);
        if (validationLibs.includes('zod') && validationLibs.includes('yup')) {
            this.analysisResult.recommendations.push({
                type: 'parameter',
                title: 'Flexibilizar biblioteca de validação',
                description: 'Projeto usa tanto Yup quanto Zod. Adicionar parâmetro para escolher.',
                priority: 'medium',
                implementation: 'Adicionar parâmetro --validation=yup|zod nos form generators'
            });
        }
    }
    /**
     * Exporta resultado da análise
     */
    async exportAnalysis(outputPath) {
        await fs.writeJson(outputPath, this.analysisResult, { spaces: 2 });
        console.log(`📄 Análise exportada para: ${outputPath}`);
    }
}
exports.ProjectPatternAnalyzer = ProjectPatternAnalyzer;
//# sourceMappingURL=ProjectPatternAnalyzer.js.map