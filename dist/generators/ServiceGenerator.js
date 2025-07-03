"use strict";
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
exports.ServiceGenerator = void 0;
const Handlebars = __importStar(require("handlebars"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
const JavaAnalyzer_1 = __importDefault(require("../analyzers/JavaAnalyzer"));
class ServiceGenerator {
    constructor() {
        this.handlebars = Handlebars.create();
        this.templatesDir = path.join(__dirname, '..', 'templates');
        this.logger = logger_1.Logger.getInstance();
        this.javaAnalyzer = new JavaAnalyzer_1.default();
        this.registerHelpers();
    }
    registerHelpers() {
        this.handlebars.registerHelper('eq', (a, b) => a === b);
        this.handlebars.registerHelper('capitalize', (str) => {
            return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
        });
        this.handlebars.registerHelper('lowercase', (str) => {
            return str ? str.toLowerCase() : '';
        });
        this.handlebars.registerHelper('buildMethodParams', (parameters) => {
            return parameters.map(p => `${p.name}: ${p.type}`).join(', ');
        });
        this.handlebars.registerHelper('buildUrlParams', (endpoint, parameters) => {
            let url = endpoint;
            const pathParams = parameters.filter(p => p.source === 'path');
            pathParams.forEach(param => {
                url = url.replace(`{${param.name}}`, `\${${param.name}}`);
            });
            return url;
        });
        this.handlebars.registerHelper('hasQueryParams', (parameters) => {
            return parameters.some(p => p.source === 'query');
        });
        this.handlebars.registerHelper('getQueryParams', (parameters) => {
            return parameters.filter(p => p.source === 'query');
        });
        this.handlebars.registerHelper('shouldTransform', (returnType) => {
            return returnType.includes('Dto') && !returnType.includes('[]') && !returnType.includes('List');
        });
        this.handlebars.registerHelper('isArray', (returnType) => {
            return returnType.includes('[]') || returnType.includes('List<');
        });
        this.handlebars.registerHelper('getBodyParam', (parameters) => {
            const bodyParam = parameters.find(p => p.source === 'body');
            return bodyParam ? bodyParam.name : '{}';
        });
        this.handlebars.registerHelper('hasBodyParam', (parameters) => {
            return parameters.some(p => p.source === 'body');
        });
    }
    async generate(options) {
        try {
            this.logger.info(`Generating service: ${options.serviceName}`);
            // Validate options
            this.validateOptions(options);
            // Prepare data for template
            const templateData = await this.prepareTemplateData(options);
            // Generate service
            const serviceCode = await this.generateService(templateData);
            // Generate DTO if requested
            let dtoCode = '';
            if (options.generateDto) {
                dtoCode = await this.generateDto(templateData);
            }
            // Write files
            const outputPath = options.outputPath || process.cwd();
            const servicePath = await this.writeService(serviceCode, options.serviceName, outputPath);
            let dtoPaths = [];
            if (dtoCode) {
                const dtoPath = await this.writeDto(dtoCode, options.entityName, outputPath);
                dtoPaths.push(dtoPath);
            }
            this.logger.success(`Service generated successfully at: ${servicePath}`);
            if (dtoPaths.length > 0) {
                this.logger.success(`DTOs generated at: ${dtoPaths.join(', ')}`);
            }
            return serviceCode;
        }
        catch (error) {
            this.logger.error(`Error generating service: ${error}`);
            throw new errors_1.GeneratorError(`Failed to generate service: ${error}`);
        }
    }
    validateOptions(options) {
        if (!options.serviceName) {
            throw new errors_1.GeneratorError('Service name is required');
        }
        if (!options.entityName) {
            throw new errors_1.GeneratorError('Entity name is required');
        }
        if (!options.entityType) {
            throw new errors_1.GeneratorError('Entity type is required');
        }
    }
    async prepareTemplateData(options) {
        const data = {
            serviceName: options.serviceName,
            entityName: options.entityName,
            entityType: options.entityType,
            idType: options.idType || 'string',
            endpoint: options.endpoint || `/${options.entityName.toLowerCase()}s`,
            hasCustomMethods: false,
            customMethods: [],
            imports: this.getDefaultImports()
        };
        // If Java controller provided, analyze it
        if (options.javaController) {
            const javaCode = await this.readJavaController(options.javaController);
            const analysis = await this.javaAnalyzer.analyzeController(javaCode);
            if (analysis.methods && analysis.methods.length > 0) {
                data.hasCustomMethods = true;
                data.customMethods = this.transformJavaMethods(analysis.methods, data.endpoint);
                data.imports = this.updateImports(data.imports, data.customMethods);
            }
        }
        return data;
    }
    async readJavaController(controllerPath) {
        try {
            if (await fs.pathExists(controllerPath)) {
                return await fs.readFile(controllerPath, 'utf-8');
            }
            else {
                // If path doesn't exist, assume it's the code itself
                return controllerPath;
            }
        }
        catch (error) {
            throw new errors_1.GeneratorError(`Failed to read Java controller: ${error}`);
        }
    }
    transformJavaMethods(javaMethods, baseEndpoint) {
        return javaMethods.map(method => {
            const httpMethod = this.extractHttpMethod(method);
            const endpoint = this.extractEndpoint(method, baseEndpoint);
            const parameters = this.extractParameters(method);
            let returnType = this.mapJavaTypeToTypeScript(method.returnType);
            // Remove ResponseEntity wrapper if present
            if (returnType.includes('ResponseEntity<')) {
                returnType = returnType.replace(/ResponseEntity<(.+)>/, '$1');
            }
            return {
                name: method.name,
                httpMethod,
                returnType,
                parameters,
                endpoint
            };
        });
    }
    extractHttpMethod(method) {
        const annotations = method.annotations || [];
        for (const annotation of annotations) {
            const name = annotation.name.toLowerCase();
            if (name.includes('getmapping'))
                return 'get';
            if (name.includes('postmapping'))
                return 'post';
            if (name.includes('putmapping'))
                return 'put';
            if (name.includes('deletemapping'))
                return 'delete';
            if (name.includes('patchmapping'))
                return 'patch';
        }
        return 'get'; // default
    }
    extractEndpoint(method, baseEndpoint) {
        const annotations = method.annotations || [];
        for (const annotation of annotations) {
            if (annotation.value) {
                const value = annotation.value.replace(/['"]/g, '');
                if (value.startsWith('/')) {
                    return `${baseEndpoint}${value}`;
                }
                else {
                    return `${baseEndpoint}/${value}`;
                }
            }
        }
        return baseEndpoint;
    }
    extractParameters(method) {
        const params = [];
        if (method.parameters) {
            method.parameters.forEach((param) => {
                const source = this.getParameterSource(param);
                params.push({
                    name: param.name,
                    type: this.mapJavaTypeToTypeScript(param.type),
                    source
                });
            });
        }
        return params;
    }
    getParameterSource(param) {
        const annotations = param.annotations || [];
        for (const annotation of annotations) {
            const name = annotation.name.toLowerCase();
            if (name.includes('pathvariable'))
                return 'path';
            if (name.includes('requestparam'))
                return 'query';
            if (name.includes('requestbody'))
                return 'body';
        }
        return 'query'; // default
    }
    mapJavaTypeToTypeScript(javaType) {
        const typeMap = {
            'String': 'string',
            'Integer': 'number',
            'int': 'number',
            'Long': 'number',
            'long': 'number',
            'Double': 'number',
            'double': 'number',
            'Float': 'number',
            'float': 'number',
            'Boolean': 'boolean',
            'boolean': 'boolean',
            'Date': 'Date',
            'LocalDate': 'Date',
            'LocalDateTime': 'Date',
            'List': 'Array',
            'Set': 'Array',
            'Map': 'Record',
            'void': 'void',
            'Void': 'void'
        };
        // Handle generic types
        const genericMatch = javaType.match(/^(\w+)<(.+)>$/);
        if (genericMatch) {
            const baseType = genericMatch[1];
            const innerType = genericMatch[2];
            const mappedBase = typeMap[baseType] || baseType;
            const mappedInner = this.mapJavaTypeToTypeScript(innerType);
            if (mappedBase === 'Array') {
                return `${mappedInner}[]`;
            }
            if (mappedBase === 'Record') {
                return `Record<string, ${mappedInner}>`;
            }
            return `${mappedBase}<${mappedInner}>`;
        }
        // Handle arrays
        if (javaType.endsWith('[]')) {
            const elementType = javaType.slice(0, -2);
            return `${this.mapJavaTypeToTypeScript(elementType)}[]`;
        }
        // Direct mapping or keep original
        return typeMap[javaType] || javaType;
    }
    getDefaultImports() {
        return [
            "import { injectable, inject } from 'inversify';",
            "import { ArchbaseRemoteApiService, ArchbaseRemoteApiClient, API_TYPE } from 'archbase-react';"
        ];
    }
    updateImports(imports, methods) {
        const additionalImports = new Set();
        // Check if we need additional imports based on return types
        methods.forEach(method => {
            // Extract DTO types from return types (handle arrays and generics)
            const dtoMatch = method.returnType.match(/(\w+Dto)/);
            if (dtoMatch && dtoMatch[1] !== 'ClienteDto') { // Don't re-import the main DTO
                additionalImports.add(`import { ${dtoMatch[1]} } from '../dto/${dtoMatch[1]}';`);
            }
        });
        return [...imports, ...Array.from(additionalImports)];
    }
    async generateService(data) {
        const templatePath = path.join(this.templatesDir, 'service.hbs');
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        const template = this.handlebars.compile(templateContent);
        return template(data);
    }
    async generateDto(data) {
        const templatePath = path.join(this.templatesDir, 'dto.hbs');
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        const template = this.handlebars.compile(templateContent);
        return template(data);
    }
    async writeService(code, serviceName, outputPath) {
        const servicePath = path.join(outputPath, 'services');
        await fs.ensureDir(servicePath);
        const filePath = path.join(servicePath, `${serviceName}.ts`);
        await fs.writeFile(filePath, code);
        return filePath;
    }
    async writeDto(code, entityName, outputPath) {
        const dtoPath = path.join(outputPath, 'dto');
        await fs.ensureDir(dtoPath);
        const filePath = path.join(dtoPath, `${entityName}Dto.ts`);
        await fs.writeFile(filePath, code);
        return filePath;
    }
}
exports.ServiceGenerator = ServiceGenerator;
exports.default = ServiceGenerator;
//# sourceMappingURL=ServiceGenerator.js.map