"use strict";
/**
 * ComponentAnalyzer - AST-based analysis of React components
 *
 * This analyzer extracts information from Archbase React components:
 * - Component props and their types
 * - DataSource usage (V1 vs V2)
 * - Component complexity
 * - Dependencies and imports
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
exports.ComponentAnalyzer = void 0;
const fs = __importStar(require("fs-extra"));
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
class ComponentAnalyzer {
    async analyzeFile(filePath) {
        return this.analyzeComponent(filePath);
    }
    async analyzeComponent(filePath) {
        try {
            const code = await fs.readFile(filePath, 'utf-8');
            const ast = this.parseCode(code);
            if (!ast)
                return null;
            const analysis = {
                name: '',
                filePath,
                props: [],
                imports: [],
                dataSourceUsage: {
                    hasDataSource: false,
                    version: 'unknown',
                    fields: []
                },
                complexity: 'low',
                hooks: [],
                dependencies: []
            };
            this.extractComponentInfo(ast, analysis);
            this.calculateComplexity(analysis);
            return analysis;
        }
        catch (error) {
            console.warn(`Failed to analyze component at ${filePath}:`, error.message);
            return null;
        }
    }
    async analyzeDirectory(dirPath, pattern = '**/*.{ts,tsx}') {
        const glob = require('glob');
        const files = glob.sync(pattern, { cwd: dirPath, absolute: true });
        const analyses = [];
        for (const file of files) {
            const analysis = await this.analyzeComponent(file);
            if (analysis && analysis.name) {
                analyses.push(analysis);
            }
        }
        return analyses;
    }
    parseCode(code) {
        try {
            return (0, parser_1.parse)(code, {
                sourceType: 'module',
                plugins: [
                    'typescript',
                    'jsx',
                    'decorators-legacy',
                    'classProperties',
                    'objectRestSpread'
                ]
            });
        }
        catch (error) {
            console.warn('Failed to parse code:', error.message);
            return null;
        }
    }
    extractComponentInfo(ast, analysis) {
        (0, traverse_1.default)(ast, {
            // Extract imports
            ImportDeclaration: (path) => {
                const source = path.node.source.value;
                const specifiers = [];
                let isDefault = false;
                path.node.specifiers.forEach((spec) => {
                    if (t.isImportDefaultSpecifier(spec)) {
                        specifiers.push(spec.local.name);
                        isDefault = true;
                    }
                    else if (t.isImportSpecifier(spec)) {
                        specifiers.push(t.isIdentifier(spec.imported) ? spec.imported.name : spec.imported.value);
                    }
                });
                analysis.imports.push({ source, specifiers, isDefault });
                // Check for Archbase dependencies
                if (source.includes('@archbase') || source.includes('./datasource')) {
                    analysis.dependencies.push(source);
                }
            },
            // Extract function components
            FunctionDeclaration: (path) => {
                if (this.isReactComponent(path.node)) {
                    analysis.name = path.node.id?.name || '';
                    this.extractPropsFromFunction(path.node, analysis);
                }
            },
            // Extract arrow function components
            VariableDeclarator: (path) => {
                if (t.isArrowFunctionExpression(path.node.init) || t.isFunctionExpression(path.node.init)) {
                    if (this.isReactComponent(path.node.init)) {
                        analysis.name = path.node.id?.name || '';
                        this.extractPropsFromFunction(path.node.init, analysis);
                    }
                }
            },
            // Extract TypeScript interfaces (for props)
            TSInterfaceDeclaration: (path) => {
                const interfaceName = path.node.id.name;
                if (interfaceName.includes('Props')) {
                    this.extractPropsFromInterface(path.node, analysis);
                }
            },
            // Detect DataSource usage
            MemberExpression: (path) => {
                if (t.isIdentifier(path.node.object) &&
                    path.node.object.name === 'dataSource') {
                    analysis.dataSourceUsage.hasDataSource = true;
                    if (t.isIdentifier(path.node.property)) {
                        const method = path.node.property.name;
                        // Detect V2 methods
                        if (['appendToFieldArray', 'updateFieldArrayItem', 'removeFromFieldArray'].includes(method)) {
                            analysis.dataSourceUsage.version = 'v2';
                        }
                        else if (analysis.dataSourceUsage.version === 'unknown') {
                            analysis.dataSourceUsage.version = 'v1';
                        }
                    }
                }
            },
            // Detect hooks usage
            CallExpression: (path) => {
                if (t.isIdentifier(path.node.callee) &&
                    path.node.callee.name.startsWith('use')) {
                    analysis.hooks.push(path.node.callee.name);
                }
            }
        });
    }
    isReactComponent(node) {
        // Check if function returns JSX
        if (t.isFunctionDeclaration(node) || t.isArrowFunctionExpression(node) || t.isFunctionExpression(node)) {
            // Simple heuristic: component name starts with capital letter
            const name = (t.isFunctionDeclaration(node) && node.id) ? node.id.name : '';
            return /^[A-Z]/.test(name);
        }
        return false;
    }
    extractPropsFromFunction(node, analysis) {
        // Extract props from function parameters
        if (node.params && node.params.length > 0) {
            const param = node.params[0];
            if (t.isObjectPattern(param)) {
                param.properties.forEach((prop) => {
                    if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                        analysis.props.push({
                            name: prop.key.name,
                            type: 'unknown', // Would need more sophisticated type extraction
                            required: false,
                            description: undefined
                        });
                    }
                });
            }
        }
    }
    extractPropsFromInterface(node, analysis) {
        node.body.body.forEach((member) => {
            if (t.isTSPropertySignature(member) && t.isIdentifier(member.key)) {
                const prop = {
                    name: member.key.name,
                    type: this.extractTypeFromTSType(member.typeAnnotation?.typeAnnotation),
                    required: !member.optional,
                    description: undefined // Could extract from JSDoc comments
                };
                analysis.props.push(prop);
                // Check for DataSource props
                if (prop.name === 'dataSource' || prop.name === 'dataField') {
                    analysis.dataSourceUsage.hasDataSource = true;
                    if (prop.name === 'dataField') {
                        analysis.dataSourceUsage.fields.push(prop.name);
                    }
                }
            }
        });
    }
    extractTypeFromTSType(typeNode) {
        if (!typeNode)
            return 'unknown';
        if (t.isTSStringKeyword(typeNode))
            return 'string';
        if (t.isTSNumberKeyword(typeNode))
            return 'number';
        if (t.isTSBooleanKeyword(typeNode))
            return 'boolean';
        if (t.isTSAnyKeyword(typeNode))
            return 'any';
        if (t.isTSTypeReference(typeNode) && t.isIdentifier(typeNode.typeName)) {
            return typeNode.typeName.name;
        }
        if (t.isTSUnionType(typeNode)) {
            const types = typeNode.types.map(t => this.extractTypeFromTSType(t));
            return types.join(' | ');
        }
        return 'unknown';
    }
    calculateComplexity(analysis) {
        let score = 0;
        // Base score from props count
        score += analysis.props.length;
        // DataSource usage adds complexity
        if (analysis.dataSourceUsage.hasDataSource) {
            score += 2;
        }
        // Hooks usage
        score += analysis.hooks.length;
        // Dependencies
        score += analysis.dependencies.length;
        // Classify complexity
        if (score <= 5) {
            analysis.complexity = 'low';
        }
        else if (score <= 15) {
            analysis.complexity = 'medium';
        }
        else {
            analysis.complexity = 'high';
        }
    }
}
exports.ComponentAnalyzer = ComponentAnalyzer;
//# sourceMappingURL=ComponentAnalyzer.js.map