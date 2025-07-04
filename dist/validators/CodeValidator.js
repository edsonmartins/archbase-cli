"use strict";
/**
 * CodeValidator - Validates generated code for syntax and quality
 *
 * This class provides validation for TypeScript/JavaScript code generated
 * by the CLI to ensure it's syntactically correct and follows best practices.
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
exports.CodeValidator = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
class CodeValidator {
    constructor() {
        this.rules = [];
        this.initializeDefaultRules();
    }
    /**
     * Validate a TypeScript/React file
     */
    async validateFile(filePath) {
        try {
            const code = await fs.readFile(filePath, 'utf-8');
            return this.validateCode(code, filePath);
        }
        catch (error) {
            return {
                isValid: false,
                errors: [{
                        type: 'syntax',
                        message: `Failed to read file: ${error.message}`,
                        severity: 'error'
                    }],
                warnings: [],
                metrics: this.getEmptyMetrics()
            };
        }
    }
    /**
     * Validate code string
     */
    validateCode(code, fileName = 'generated.tsx') {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            metrics: this.getEmptyMetrics()
        };
        try {
            // Parse the code
            const ast = (0, parser_1.parse)(code, {
                sourceType: 'module',
                plugins: [
                    'typescript',
                    'jsx',
                    'decorators-legacy',
                    'classProperties',
                    'objectRestSpread',
                    'asyncGenerators',
                    'functionBind',
                    'dynamicImport'
                ]
            });
            // Calculate metrics
            result.metrics = this.calculateMetrics(code, ast);
            // Run validation rules
            this.runValidationRules(ast, code, result, fileName);
        }
        catch (error) {
            result.isValid = false;
            result.errors.push({
                type: 'syntax',
                message: `Parse error: ${error.message}`,
                line: error.loc?.line,
                column: error.loc?.column,
                severity: 'error'
            });
        }
        // Set overall validity
        result.isValid = result.errors.filter(e => e.severity === 'error').length === 0;
        return result;
    }
    /**
     * Validate generated project structure
     */
    async validateProject(projectPath) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            metrics: this.getEmptyMetrics()
        };
        try {
            // Check package.json
            const packageJsonPath = path.join(projectPath, 'package.json');
            if (!(await fs.pathExists(packageJsonPath))) {
                result.errors.push({
                    type: 'structure',
                    message: 'Missing package.json file',
                    severity: 'error'
                });
            }
            else {
                const packageJson = await fs.readJson(packageJsonPath);
                this.validatePackageJson(packageJson, result);
            }
            // Check TypeScript config
            const tsconfigPath = path.join(projectPath, 'tsconfig.json');
            if (!(await fs.pathExists(tsconfigPath))) {
                result.warnings.push({
                    type: 'best-practice',
                    message: 'Missing tsconfig.json - TypeScript configuration recommended',
                    suggestion: 'Add tsconfig.json for better type checking'
                });
            }
            // Validate source files
            const srcPath = path.join(projectPath, 'src');
            if (await fs.pathExists(srcPath)) {
                await this.validateSourceDirectory(srcPath, result);
            }
        }
        catch (error) {
            result.errors.push({
                type: 'structure',
                message: `Project validation failed: ${error.message}`,
                severity: 'error'
            });
        }
        result.isValid = result.errors.filter(e => e.severity === 'error').length === 0;
        return result;
    }
    initializeDefaultRules() {
        this.rules = [
            {
                name: 'react-component-structure',
                check: (ast, code, result) => {
                    let hasDefaultExport = false;
                    let componentName = '';
                    (0, traverse_1.default)(ast, {
                        ExportDefaultDeclaration: (path) => {
                            hasDefaultExport = true;
                            if (t.isFunctionDeclaration(path.node.declaration)) {
                                componentName = path.node.declaration.id?.name || '';
                            }
                        },
                        FunctionDeclaration: (path) => {
                            if (path.node.id?.name && /^[A-Z]/.test(path.node.id.name)) {
                                componentName = path.node.id.name;
                            }
                        }
                    });
                    if (!hasDefaultExport) {
                        result.warnings.push({
                            type: 'best-practice',
                            message: 'React component should have a default export',
                            suggestion: 'Add `export default ${componentName}`'
                        });
                    }
                }
            },
            {
                name: 'typescript-props-interface',
                check: (ast, code, result) => {
                    let hasPropsInterface = false;
                    let componentName = '';
                    (0, traverse_1.default)(ast, {
                        TSInterfaceDeclaration: (path) => {
                            const name = path.node.id.name;
                            if (name.endsWith('Props')) {
                                hasPropsInterface = true;
                            }
                        },
                        FunctionDeclaration: (path) => {
                            if (path.node.id?.name && /^[A-Z]/.test(path.node.id.name)) {
                                componentName = path.node.id.name;
                            }
                        }
                    });
                    if (componentName && !hasPropsInterface && code.includes('props')) {
                        result.warnings.push({
                            type: 'best-practice',
                            message: `Component ${componentName} should define a Props interface`,
                            suggestion: `Add interface ${componentName}Props { ... }`
                        });
                    }
                }
            },
            {
                name: 'required-imports',
                check: (ast, code, result) => {
                    let hasReactImport = false;
                    let usesJSX = false;
                    (0, traverse_1.default)(ast, {
                        ImportDeclaration: (path) => {
                            if (path.node.source.value === 'react') {
                                hasReactImport = true;
                            }
                        },
                        JSXElement: () => {
                            usesJSX = true;
                        }
                    });
                    if (usesJSX && !hasReactImport) {
                        result.errors.push({
                            type: 'import',
                            message: 'Missing React import for JSX usage',
                            severity: 'error'
                        });
                    }
                }
            },
            {
                name: 'archbase-imports',
                check: (ast, code, result) => {
                    const archbaseComponents = new Set();
                    let hasArchbaseImport = false;
                    (0, traverse_1.default)(ast, {
                        ImportDeclaration: (path) => {
                            if (path.node.source.value === 'archbase-react') {
                                hasArchbaseImport = true;
                            }
                        },
                        JSXElement: (path) => {
                            const elementName = path.node.openingElement.name;
                            if (t.isJSXIdentifier(elementName) && elementName.name.startsWith('Archbase')) {
                                archbaseComponents.add(elementName.name);
                            }
                        }
                    });
                    if (archbaseComponents.size > 0 && !hasArchbaseImport) {
                        result.errors.push({
                            type: 'import',
                            message: 'Missing archbase-react import for Archbase components',
                            severity: 'error'
                        });
                    }
                }
            }
        ];
    }
    runValidationRules(ast, code, result, fileName) {
        for (const rule of this.rules) {
            try {
                rule.check(ast, code, result);
            }
            catch (error) {
                result.warnings.push({
                    type: 'best-practice',
                    message: `Validation rule '${rule.name}' failed: ${error.message}`
                });
            }
        }
    }
    calculateMetrics(code, ast) {
        const metrics = {
            linesOfCode: code.split('\n').length,
            complexity: 1,
            componentCount: 0,
            hookCount: 0,
            importCount: 0,
            hasTests: false,
            hasTypeScript: code.includes('interface ') || code.includes(': ') || code.includes('type ')
        };
        (0, traverse_1.default)(ast, {
            ImportDeclaration: () => {
                metrics.importCount++;
            },
            FunctionDeclaration: (path) => {
                if (path.node.id?.name && /^[A-Z]/.test(path.node.id.name)) {
                    metrics.componentCount++;
                }
                if (path.node.id?.name && path.node.id.name.startsWith('use')) {
                    metrics.hookCount++;
                }
            },
            CallExpression: (path) => {
                if (t.isIdentifier(path.node.callee) && path.node.callee.name.startsWith('use')) {
                    metrics.hookCount++;
                }
            },
            IfStatement: () => {
                metrics.complexity++;
            },
            ConditionalExpression: () => {
                metrics.complexity++;
            },
            LogicalExpression: () => {
                metrics.complexity++;
            }
        });
        return metrics;
    }
    async validateSourceDirectory(srcPath, result) {
        const files = await fs.readdir(srcPath, { withFileTypes: true });
        for (const file of files) {
            if (file.isDirectory()) {
                await this.validateSourceDirectory(path.join(srcPath, file.name), result);
            }
            else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
                const filePath = path.join(srcPath, file.name);
                const fileResult = await this.validateFile(filePath);
                // Merge results
                result.errors.push(...fileResult.errors);
                result.warnings.push(...fileResult.warnings);
                result.metrics.linesOfCode += fileResult.metrics.linesOfCode;
                result.metrics.componentCount += fileResult.metrics.componentCount;
                result.metrics.hookCount += fileResult.metrics.hookCount;
                result.metrics.importCount += fileResult.metrics.importCount;
            }
        }
    }
    validatePackageJson(packageJson, result) {
        // Check required dependencies
        const requiredDeps = ['react', 'react-dom'];
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
        for (const dep of requiredDeps) {
            if (!dependencies[dep]) {
                result.errors.push({
                    type: 'structure',
                    message: `Missing required dependency: ${dep}`,
                    severity: 'error'
                });
            }
        }
        // Check for recommended dependencies
        const recommendedDeps = ['typescript', '@types/react', '@types/react-dom'];
        for (const dep of recommendedDeps) {
            if (!dependencies[dep]) {
                result.warnings.push({
                    type: 'best-practice',
                    message: `Missing recommended dependency: ${dep}`,
                    suggestion: `Add ${dep} for better development experience`
                });
            }
        }
        // Check scripts
        const requiredScripts = ['build', 'dev'];
        for (const script of requiredScripts) {
            if (!packageJson.scripts?.[script]) {
                result.warnings.push({
                    type: 'best-practice',
                    message: `Missing script: ${script}`,
                    suggestion: `Add "${script}" script to package.json`
                });
            }
        }
    }
    getEmptyMetrics() {
        return {
            linesOfCode: 0,
            complexity: 0,
            componentCount: 0,
            hookCount: 0,
            importCount: 0,
            hasTests: false,
            hasTypeScript: false
        };
    }
}
exports.CodeValidator = CodeValidator;
//# sourceMappingURL=CodeValidator.js.map