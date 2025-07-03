"use strict";
/**
 * DocumentationAnalyzer - Analisa documentação markdown para extrair padrões
 *
 * Esta classe analisa documentação markdown do archbase-react para identificar:
 * - Padrões de uso do DataSource V2
 * - Exemplos de código nos docs
 * - APIs e métodos disponíveis
 * - Melhores práticas documentadas
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentationAnalyzer = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const glob_1 = require("glob");
class DocumentationAnalyzer {
    constructor(docsPath) {
        this.docsPath = docsPath;
        this.analysisResult = {
            dataSourceV2: {
                newFeatures: [],
                newMethods: [],
                migrationPatterns: [],
                usageExamples: [],
                performanceImprovements: [],
                breakingChanges: []
            },
            componentPatterns: [],
            codeExamples: [],
            apiReference: [],
            bestPractices: [],
            migrationGuides: [],
            recommendations: []
        };
    }
    /**
     * Analisa toda a documentação
     */
    async analyzeDocumentation() {
        console.log(`📚 Analisando documentação: ${this.docsPath}`);
        // Encontrar todos os arquivos markdown
        const markdownFiles = await this.findMarkdownFiles();
        console.log(`📄 Encontrados ${markdownFiles.length} arquivos markdown`);
        // Analisar cada arquivo
        for (const file of markdownFiles) {
            await this.analyzeMarkdownFile(file);
        }
        // Processar análise
        this.processAnalysis();
        this.generateRecommendations();
        return this.analysisResult;
    }
    /**
     * Encontra todos os arquivos markdown
     */
    async findMarkdownFiles() {
        const glob = new glob_1.Glob('**/*.md', {
            cwd: this.docsPath,
            ignore: ['node_modules/**', '**/node_modules/**']
        });
        const files = [];
        for await (const file of glob) {
            files.push(path.join(this.docsPath, file));
        }
        return files;
    }
    /**
     * Analisa um arquivo markdown individual
     */
    async analyzeMarkdownFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const relativePath = path.relative(this.docsPath, filePath);
            console.log(`📖 Analisando: ${relativePath}`);
            // Analisar diferentes aspectos da documentação
            this.analyzeDataSourceV2Content(content, relativePath);
            this.extractCodeExamples(content, relativePath);
            this.extractApiReferences(content, relativePath);
            this.extractBestPractices(content, relativePath);
            this.extractMigrationGuides(content, relativePath);
            this.extractComponentPatterns(content, relativePath);
        }
        catch (error) {
            console.warn(`⚠️  Erro ao analisar ${filePath}: ${error.message}`);
        }
    }
    /**
     * Analisa conteúdo específico do DataSource V2
     */
    analyzeDataSourceV2Content(content, filePath) {
        const lines = content.split('\n');
        // Detectar DataSource V2
        const isV2Doc = content.toLowerCase().includes('datasource v2') ||
            content.toLowerCase().includes('datasourcev2') ||
            content.includes('ArchbaseDataSourceV2');
        if (!isV2Doc)
            return;
        // Extrair novos recursos/features
        const featurePatterns = [
            /(?:new feature|nova funcionalidade|novo recurso)[:\s]*(.+)/gi,
            /(?:introduces|introduz)[:\s]*(.+)/gi,
            /(?:added|adicionado)[:\s]*(.+)/gi
        ];
        featurePatterns.forEach(pattern => {
            const matches = content.matchAll(pattern);
            for (const match of matches) {
                if (match[1] && match[1].trim().length > 0) {
                    this.analysisResult.dataSourceV2.newFeatures.push(match[1].trim());
                }
            }
        });
        // Extrair novos métodos
        const methodPatterns = [
            /(?:```[\w]*\s*)?(\w+(?:To|From|Field|Array)\w*)\s*\(/g,
            /(?:`|\*\*)?(\w+(?:To|From|Field|Array)\w*)\s*\(/g,
            /(?:método|method)[:\s]*`?(\w+)`?/gi
        ];
        methodPatterns.forEach(pattern => {
            const matches = content.matchAll(pattern);
            for (const match of matches) {
                const method = match[1];
                if (method && this.isDataSourceMethod(method)) {
                    this.analysisResult.dataSourceV2.newMethods.push(method);
                }
            }
        });
        // Extrair melhorias de performance
        const performanceKeywords = [
            'performance', 'performante', 'otimização', 'optimization',
            'faster', 'mais rápido', 'efficiency', 'eficiência'
        ];
        performanceKeywords.forEach(keyword => {
            const regex = new RegExp(`([^.]*${keyword}[^.]*\\.?)`, 'gi');
            const matches = content.matchAll(regex);
            for (const match of matches) {
                if (match[1]) {
                    this.analysisResult.dataSourceV2.performanceImprovements.push(match[1].trim());
                }
            }
        });
        // Extrair breaking changes
        const breakingChangePatterns = [
            /(?:breaking change|mudança que quebra|alteração incompatível)[:\s]*(.+)/gi,
            /(?:deprecated|depreciado|obsoleto)[:\s]*(.+)/gi,
            /(?:removed|removido)[:\s]*(.+)/gi
        ];
        breakingChangePatterns.forEach(pattern => {
            const matches = content.matchAll(pattern);
            for (const match of matches) {
                if (match[1]) {
                    this.analysisResult.dataSourceV2.breakingChanges.push(match[1].trim());
                }
            }
        });
    }
    /**
     * Extrai exemplos de código da documentação
     */
    extractCodeExamples(content, filePath) {
        // Regex para blocos de código
        const codeBlockRegex = /```(\w+)?\s*\n([\s\S]*?)\n```/g;
        let match;
        while ((match = codeBlockRegex.exec(content)) !== null) {
            const language = match[1] || 'javascript';
            const code = match[2];
            // Só processar código TypeScript/JavaScript/JSX
            if (!['typescript', 'javascript', 'tsx', 'jsx', 'ts', 'js'].includes(language)) {
                continue;
            }
            // Extrair título do exemplo (geralmente a linha antes do bloco)
            const beforeCode = content.substring(0, match.index);
            const lines = beforeCode.split('\n');
            const titleLine = lines[lines.length - 1] || lines[lines.length - 2] || '';
            const title = this.extractTitleFromLine(titleLine);
            // Detectar features do DataSource
            const dataSourceFeatures = this.detectDataSourceFeatures(code);
            // Detectar tags
            const tags = this.detectCodeTags(code, filePath);
            if (dataSourceFeatures.length > 0 || code.includes('Archbase')) {
                this.analysisResult.codeExamples.push({
                    title: title || 'Exemplo de código',
                    description: this.extractDescriptionFromContext(content, match.index),
                    code: code.trim(),
                    language,
                    tags,
                    dataSourceFeatures
                });
            }
        }
    }
    /**
     * Extrai referências de API
     */
    extractApiReferences(content, filePath) {
        // Procurar por documentação de métodos/APIs
        const methodRegex = /(?:###|##|\*\*)\s*`?(\w+(?:To|From|Field|Array)\w*)`?\s*(?:\([^)]*\))?\s*(?:###|##|\*\*)?/g;
        let match;
        while ((match = methodRegex.exec(content)) !== null) {
            const method = match[1];
            if (this.isDataSourceMethod(method)) {
                // Extrair descrição (próximos parágrafos)
                const afterMatch = content.substring(match.index + match[0].length);
                const description = this.extractMethodDescription(afterMatch);
                // Detectar parâmetros
                const parameters = this.extractMethodParameters(afterMatch);
                // Detectar tipo de retorno
                const returnType = this.extractReturnType(afterMatch);
                // Detectar versão
                const version = this.detectApiVersion(content, method);
                this.analysisResult.apiReference.push({
                    method,
                    component: 'DataSource',
                    description,
                    parameters,
                    returnType,
                    version,
                    examples: this.extractMethodExamples(afterMatch)
                });
            }
        }
    }
    /**
     * Extrai boas práticas
     */
    extractBestPractices(content, filePath) {
        const practicePatterns = [
            /(?:best practice|boa prática|recomendação|recommendation)[:\s]*(.+)/gi,
            /(?:✅|👍|✓)[:\s]*(.+)/gi,
            /(?:❌|👎|✗)[:\s]*(.+)/gi
        ];
        practicePatterns.forEach(pattern => {
            const matches = content.matchAll(pattern);
            for (const match of matches) {
                if (match[1]) {
                    const category = this.categorizeFromPath(filePath);
                    this.analysisResult.bestPractices.push({
                        category,
                        title: 'Prática recomendada',
                        description: match[1].trim(),
                        relatedComponents: this.extractComponentsFromText(match[1])
                    });
                }
            }
        });
    }
    /**
     * Extrai guias de migração
     */
    extractMigrationGuides(content, filePath) {
        const migrationKeywords = ['migration', 'migração', 'upgrade', 'atualização', 'v1 to v2', 'v1 para v2'];
        migrationKeywords.forEach(keyword => {
            if (content.toLowerCase().includes(keyword)) {
                // Extrair seções de migração
                const sections = content.split(/(?:###|##)\s*/);
                sections.forEach(section => {
                    if (section.toLowerCase().includes(keyword)) {
                        const lines = section.split('\n');
                        const title = lines[0] || 'Guia de migração';
                        const steps = this.extractMigrationSteps(section);
                        const benefits = this.extractMigrationBenefits(section);
                        if (steps.length > 0) {
                            this.analysisResult.migrationGuides.push({
                                from: 'DataSource V1',
                                to: 'DataSource V2',
                                description: title,
                                steps,
                                benefits
                            });
                        }
                    }
                });
            }
        });
    }
    /**
     * Extrai padrões de componentes
     */
    extractComponentPatterns(content, filePath) {
        // Procurar por padrões de uso documentados
        const patternRegex = /(?:pattern|padrão)[:\s]*(.+)/gi;
        const matches = content.matchAll(patternRegex);
        for (const match of matches) {
            if (match[1]) {
                const component = this.extractComponentFromPath(filePath);
                const codeExample = this.extractNearbyCodeExample(content, match.index);
                const dataSourceVersion = this.detectDataSourceVersionFromExample(codeExample);
                this.analysisResult.componentPatterns.push({
                    component,
                    pattern: match[1].trim(),
                    description: this.extractPatternDescription(content, match.index),
                    codeExample,
                    dataSourceVersion,
                    complexity: this.assessComplexity(codeExample)
                });
            }
        }
    }
    // Métodos auxiliares
    isDataSourceMethod(method) {
        const dataSourceMethods = [
            'appendToFieldArray', 'removeFromFieldArray', 'moveInFieldArray',
            'fieldByName', 'getFieldValue', 'setFieldValue',
            'search', 'sort', 'filter', 'paginate',
            'createDataSource', 'useArchbaseDataSource'
        ];
        return dataSourceMethods.some(dsMethod => method.toLowerCase().includes(dsMethod.toLowerCase())) || method.includes('DataSource');
    }
    detectDataSourceFeatures(code) {
        const features = [];
        if (code.includes('appendToFieldArray'))
            features.push('array-field-management');
        if (code.includes('removeFromFieldArray'))
            features.push('array-field-management');
        if (code.includes('fieldByName'))
            features.push('field-access');
        if (code.includes('search('))
            features.push('search');
        if (code.includes('sort('))
            features.push('sorting');
        if (code.includes('filter('))
            features.push('filtering');
        if (code.includes('pagination'))
            features.push('pagination');
        if (code.includes('useArchbaseDataSource'))
            features.push('hook-usage');
        if (code.includes('createDataSource'))
            features.push('factory-pattern');
        return features;
    }
    detectCodeTags(code, filePath) {
        const tags = [];
        if (code.includes('Form'))
            tags.push('form');
        if (code.includes('Table') || code.includes('DataTable'))
            tags.push('table');
        if (code.includes('Edit') || code.includes('Input'))
            tags.push('input');
        if (code.includes('Select'))
            tags.push('select');
        if (code.includes('validation'))
            tags.push('validation');
        if (code.includes('yup') || code.includes('zod'))
            tags.push('validation');
        if (filePath.includes('dashboard'))
            tags.push('dashboard');
        if (filePath.includes('admin'))
            tags.push('admin');
        return tags;
    }
    extractTitleFromLine(line) {
        // Remove markdown formatting
        return line.replace(/[#*`_]/g, '').trim();
    }
    extractDescriptionFromContext(content, codeIndex) {
        const beforeCode = content.substring(0, codeIndex);
        const lines = beforeCode.split('\n');
        // Procurar por uma descrição nas linhas anteriores
        for (let i = lines.length - 1; i >= Math.max(0, lines.length - 5); i--) {
            const line = lines[i].trim();
            if (line && !line.startsWith('#') && !line.startsWith('```') && line.length > 20) {
                return line.replace(/[*_`]/g, '');
            }
        }
        return '';
    }
    extractMethodDescription(afterMatch) {
        const lines = afterMatch.split('\n');
        const description = [];
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('```')) {
                break;
            }
            description.push(trimmed);
        }
        return description.join(' ').replace(/[*_`]/g, '');
    }
    extractMethodParameters(afterMatch) {
        const paramRegex = /(?:param|parameter|parâmetro)[:\s]*`?(\w+)`?/gi;
        const matches = afterMatch.matchAll(paramRegex);
        return Array.from(matches).map(match => match[1]);
    }
    extractReturnType(afterMatch) {
        const returnMatch = afterMatch.match(/(?:returns?|retorna)[:\s]*`?([^`\n]+)`?/i);
        return returnMatch ? returnMatch[1].trim() : 'void';
    }
    detectApiVersion(content, method) {
        const methodContext = this.getMethodContext(content, method);
        if (methodContext.includes('v2') || methodContext.includes('V2'))
            return 'v2';
        if (methodContext.includes('v1') || methodContext.includes('V1'))
            return 'v1';
        // Métodos específicos do V2
        if (['appendToFieldArray', 'removeFromFieldArray', 'moveInFieldArray'].includes(method)) {
            return 'v2';
        }
        return 'both';
    }
    getMethodContext(content, method) {
        const methodIndex = content.indexOf(method);
        if (methodIndex === -1)
            return '';
        const start = Math.max(0, methodIndex - 500);
        const end = Math.min(content.length, methodIndex + 500);
        return content.substring(start, end);
    }
    extractMethodExamples(afterMatch) {
        const examples = [];
        const codeBlockRegex = /```[\w]*\s*\n([\s\S]*?)\n```/g;
        let match;
        while ((match = codeBlockRegex.exec(afterMatch.substring(0, 1000))) !== null) {
            examples.push(match[1].trim());
        }
        return examples;
    }
    categorizeFromPath(filePath) {
        if (filePath.includes('form'))
            return 'forms';
        if (filePath.includes('table'))
            return 'tables';
        if (filePath.includes('datasource'))
            return 'datasource';
        if (filePath.includes('component'))
            return 'components';
        return 'general';
    }
    extractComponentsFromText(text) {
        const componentRegex = /Archbase\w+/g;
        const matches = text.matchAll(componentRegex);
        return Array.from(new Set(Array.from(matches).map(match => match[0])));
    }
    extractMigrationSteps(section) {
        const steps = [];
        const stepRegex = /(?:\d+\.|•|\*)\s*(.+)/g;
        const matches = section.matchAll(stepRegex);
        for (const match of matches) {
            if (match[1]) {
                steps.push(match[1].trim());
            }
        }
        return steps;
    }
    extractMigrationBenefits(section) {
        const benefits = [];
        const benefitKeywords = ['benefit', 'vantagem', 'improvement', 'melhoria'];
        benefitKeywords.forEach(keyword => {
            const regex = new RegExp(`([^.]*${keyword}[^.]*\\.?)`, 'gi');
            const matches = section.matchAll(regex);
            for (const match of matches) {
                if (match[1]) {
                    benefits.push(match[1].trim());
                }
            }
        });
        return benefits;
    }
    extractComponentFromPath(filePath) {
        const fileName = path.basename(filePath, '.md');
        if (fileName.startsWith('Archbase')) {
            return fileName;
        }
        return 'General';
    }
    extractNearbyCodeExample(content, matchIndex) {
        const afterMatch = content.substring(matchIndex);
        const codeBlockMatch = afterMatch.match(/```[\w]*\s*\n([\s\S]*?)\n```/);
        return codeBlockMatch ? codeBlockMatch[1].trim() : '';
    }
    detectDataSourceVersionFromExample(code) {
        if (code.includes('appendToFieldArray') || code.includes('removeFromFieldArray')) {
            return 'v2';
        }
        if (code.includes('dataSource') && code.includes('dataField')) {
            return code.includes('V2') ? 'v2' : 'v1';
        }
        return 'both';
    }
    extractPatternDescription(content, matchIndex) {
        const afterMatch = content.substring(matchIndex);
        const lines = afterMatch.split('\n');
        for (let i = 1; i < Math.min(lines.length, 5); i++) {
            const line = lines[i].trim();
            if (line && !line.startsWith('#') && line.length > 10) {
                return line.replace(/[*_`]/g, '');
            }
        }
        return '';
    }
    assessComplexity(code) {
        const lines = code.split('\n').length;
        const hasHooks = code.includes('use');
        const hasValidation = code.includes('validation') || code.includes('yup') || code.includes('zod');
        const hasMultipleComponents = (code.match(/Archbase\w+/g) || []).length > 3;
        if (lines > 30 || (hasHooks && hasValidation && hasMultipleComponents))
            return 'high';
        if (lines > 15 || hasValidation || hasMultipleComponents)
            return 'medium';
        return 'low';
    }
    /**
     * Processa a análise e organiza os dados
     */
    processAnalysis() {
        // Remover duplicatas
        this.analysisResult.dataSourceV2.newFeatures = [...new Set(this.analysisResult.dataSourceV2.newFeatures)];
        this.analysisResult.dataSourceV2.newMethods = [...new Set(this.analysisResult.dataSourceV2.newMethods)];
        // Ordenar por relevância
        this.analysisResult.codeExamples.sort((a, b) => b.dataSourceFeatures.length - a.dataSourceFeatures.length);
        this.analysisResult.apiReference.sort((a, b) => a.method.localeCompare(b.method));
    }
    /**
     * Gera recomendações baseadas na análise
     */
    generateRecommendations() {
        const recommendations = this.analysisResult.recommendations;
        // DataSource V2 parameters
        if (this.analysisResult.dataSourceV2.newFeatures.length > 0) {
            recommendations.push({
                type: 'parameter',
                title: 'Adicionar parâmetro --datasource-version',
                description: 'Permitir escolher entre DataSource V1 e V2 na geração de código',
                implementation: 'Adicionar --datasource-version=v1|v2 a todos os generators',
                priority: 'high',
                affectedGenerators: ['form', 'view', 'component']
            });
        }
        // Array field management
        if (this.analysisResult.dataSourceV2.newMethods.some(m => m.includes('Array'))) {
            recommendations.push({
                type: 'template',
                title: 'Template para gerenciamento de arrays',
                description: 'Criar template específico para components que gerenciam arrays de dados',
                implementation: 'Template com appendToFieldArray, removeFromFieldArray, moveInFieldArray',
                priority: 'medium',
                affectedGenerators: ['form', 'component']
            });
        }
        // Migration templates
        if (this.analysisResult.migrationGuides.length > 0) {
            recommendations.push({
                type: 'generator',
                title: 'Generator de migração V1 para V2',
                description: 'Criar comando para migrar código existente de DataSource V1 para V2',
                implementation: 'archbase migrate datasource --from=v1 --to=v2',
                priority: 'medium',
                affectedGenerators: ['migrate']
            });
        }
        // Knowledge base updates
        if (this.analysisResult.componentPatterns.length > 0) {
            recommendations.push({
                type: 'knowledge',
                title: 'Atualizar base de conhecimento',
                description: 'Adicionar padrões extraídos da documentação à knowledge base',
                implementation: 'Importar padrões, exemplos e melhores práticas para o CLI',
                priority: 'high',
                affectedGenerators: ['knowledge']
            });
        }
    }
    /**
     * Exporta resultado da análise
     */
    async exportAnalysis(outputPath) {
        await fs.writeJson(outputPath, this.analysisResult, { spaces: 2 });
        console.log(`📄 Análise da documentação exportada para: ${outputPath}`);
    }
}
exports.DocumentationAnalyzer = DocumentationAnalyzer;
//# sourceMappingURL=DocumentationAnalyzer.js.map