"use strict";
/**
 * ViewGenerator - Generate list/grid view components based on powerview-admin patterns
 *
 * Generates CRUD list views using ArchbaseDataGrid with proper navigation,
 * filtering, permissions, and actions following the exact patterns from powerview-admin.
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
exports.ViewGenerator = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
class ViewGenerator {
    constructor(templatesPath = path.join(__dirname, '../../src/templates')) {
        this.templatesPath = templatesPath;
        this.registerHandlebarsHelpers();
    }
    registerHandlebarsHelpers() {
        // Register equality helper
        handlebars_1.default.registerHelper('eq', (a, b) => {
            return a === b;
        });
        // Register conditional helpers
        handlebars_1.default.registerHelper('if_eq', (a, b, options) => {
            if (a === b) {
                return options.fn(options.data?.root || {});
            }
            return options.inverse(options.data?.root || {});
        });
        // Register array includes helper
        handlebars_1.default.registerHelper('includes', (array, item) => {
            return array && array.includes(item);
        });
        // Register capitalize first helper
        handlebars_1.default.registerHelper('capitalizeFirst', (str) => {
            return str.charAt(0).toUpperCase() + str.slice(1);
        });
        // Register lowercase helper
        handlebars_1.default.registerHelper('toLowerCase', (str) => {
            return str.toLowerCase();
        });
        // Register helpers for template literals
        handlebars_1.default.registerHelper('lt', () => '{');
        handlebars_1.default.registerHelper('gt', () => '}');
    }
    async generate(name, config) {
        try {
            let fields;
            // Extract fields from DTO if provided
            if (config.dto) {
                fields = await this.extractFieldsFromDto(config.dto);
            }
            else if (config.fields) {
                fields = this.parseFields(config.fields);
            }
            else {
                // Default fields if neither DTO nor fields provided
                fields = [
                    { name: 'name', type: 'text', label: 'Name', width: 200, sortable: true, filterable: true },
                    { name: 'status', type: 'enum', label: 'Status', width: 120, sortable: true, filterable: true }
                ];
            }
            const context = this.buildTemplateContext(name, fields, config);
            const files = [];
            // Generate main view component file
            const viewFile = await this.generateView(name, context, config);
            files.push(viewFile);
            // Generate test file if requested
            if (config.test) {
                const testFile = await this.generateTest(name, context, config);
                files.push(testFile);
            }
            // Generate Storybook story if requested
            if (config.story) {
                const storyFile = await this.generateStory(name, context, config);
                files.push(storyFile);
            }
            return { files, success: true };
        }
        catch (error) {
            return {
                files: [],
                success: false,
                errors: [error.message]
            };
        }
    }
    parseFields(fieldsString) {
        if (!fieldsString) {
            return [
                { name: 'code', type: 'text', label: 'Código', required: true, filterable: true, sortable: true, size: 140 },
                { name: 'nome', type: 'text', label: 'Nome', required: true, filterable: true, sortable: true },
                { name: 'status', type: 'enum', label: 'Status', required: true, filterable: true, sortable: true, size: 120 }
            ];
        }
        return fieldsString.split(',').map(field => {
            const [name, type = 'text'] = field.trim().split(':');
            return {
                name: name.trim(),
                type: type.trim(),
                label: this.capitalizeFirst(name.trim()),
                required: true,
                filterable: this.isFilterableType(type.trim()),
                sortable: this.isSortableType(type.trim()),
                size: this.getDefaultSize(type.trim())
            };
        });
    }
    async extractFieldsFromDto(dtoPath) {
        try {
            // Read DTO file
            const dtoContent = await fs.readFile(dtoPath, 'utf-8');
            const fields = [];
            // Extract field definitions from DTO class
            const fieldRegex = /(?:@\w+[^}]*\n\s*)*(\w+):\s*([^;]+);/g;
            let match;
            while ((match = fieldRegex.exec(dtoContent)) !== null) {
                const fieldName = match[1];
                const fieldType = match[2].trim();
                // Skip audit and system fields for view (keep only relevant display fields)
                if (['id', 'code', 'version', 'createEntityDate', 'updateEntityDate',
                    'createdByUser', 'lastModifiedByUser'].includes(fieldName)) {
                    continue;
                }
                // Skip the new record flag
                if (fieldName.startsWith('isNovo')) {
                    continue;
                }
                // Convert TypeScript type to grid column type
                const columnType = this.convertTypeScriptToColumnType(fieldType);
                // Determine column width based on type
                const width = this.getColumnWidth(fieldType, fieldName);
                fields.push({
                    name: fieldName,
                    type: columnType,
                    label: this.capitalizeFirst(fieldName),
                    width,
                    sortable: true,
                    filterable: true
                });
            }
            return fields;
        }
        catch (error) {
            throw new Error(`Failed to extract fields from DTO: ${error.message}`);
        }
    }
    convertTypeScriptToColumnType(tsType) {
        // Clean up the type string
        const cleanType = tsType.replace(/\s+/g, '').toLowerCase();
        // Type mapping for DataGrid columns
        const typeMap = {
            'string': 'text',
            'number': 'number',
            'boolean': 'boolean',
            'date': 'date',
            'string[]': 'text',
            'number[]': 'number'
        };
        // Check for enum types (uppercase names)
        if (tsType.match(/^[A-Z]/)) {
            return 'enum';
        }
        // Check for date fields
        if (cleanType.includes('date') || cleanType.includes('time')) {
            return 'date';
        }
        return typeMap[cleanType] || 'text';
    }
    getColumnWidth(fieldType, fieldName) {
        // Default widths based on field type and name patterns
        if (fieldName.toLowerCase().includes('status'))
            return 120;
        if (fieldName.toLowerCase().includes('code'))
            return 100;
        if (fieldName.toLowerCase().includes('nome') || fieldName.toLowerCase().includes('name'))
            return 200;
        if (fieldName.toLowerCase().includes('email'))
            return 180;
        if (fieldName.toLowerCase().includes('descric'))
            return 300;
        if (fieldType === 'boolean')
            return 80;
        if (fieldType === 'number')
            return 100;
        if (fieldType.includes('Date'))
            return 150;
        return 150; // Default width
    }
    buildTemplateContext(name, fields, config) {
        return {
            componentName: name,
            entityName: name.replace(/View$/, ''),
            fields,
            typescript: config.typescript,
            // Permission features
            withPermissions: config.withPermissions !== false, // Default true
            // Grid features
            withFilters: config.withFilters !== false, // Default true
            withPagination: config.withPagination !== false, // Default true
            withSorting: config.withSorting !== false, // Default true
            pageSize: config.pageSize || 25,
            // Navigation patterns
            category: config.category || 'configuracao',
            feature: config.feature || this.generateFeatureName(name),
            adminRoute: this.generateAdminRoute(config.category, config.feature, name),
            featureConstant: (config.feature || this.generateFeatureName(name)).toUpperCase(),
            // Pre-generated navigation expressions
            addNavigateExpression: `\`\${${(config.feature || this.generateFeatureName(name)).toUpperCase()}_ROUTE}/\${t('Novo')}->\${Date.now()}\``,
            editNavigateExpression: `\`\${${(config.feature || this.generateFeatureName(name)).toUpperCase()}_ROUTE}/\${record.id}\``,
            viewNavigateExpression: `\`\${${(config.feature || this.generateFeatureName(name)).toUpperCase()}_ROUTE}/\${row.id}\``,
            // Column definitions
            textColumns: fields.filter(f => f.type === 'text'),
            enumColumns: fields.filter(f => f.type === 'enum'),
            dateColumns: fields.filter(f => f.type === 'date' || f.type === 'datetime'),
            imageColumns: fields.filter(f => f.type === 'image'),
            uuidColumns: fields.filter(f => f.type === 'uuid'),
            // Grid configuration
            hasFilterableColumns: fields.some(f => f.filterable),
            hasSortableColumns: fields.some(f => f.sortable),
            hasImageColumns: fields.some(f => f.type === 'image'),
            hasEnumColumns: fields.some(f => f.type === 'enum'),
            hasDateColumns: fields.some(f => f.type === 'date' || f.type === 'datetime')
        };
    }
    async generateView(name, context, config) {
        const templateName = 'views/crud-list.hbs';
        const template = await this.loadTemplate(templateName);
        const compiled = handlebars_1.default.compile(template);
        const content = compiled(context);
        const ext = config.typescript ? '.tsx' : '.jsx';
        const fileName = `${name}${ext}`;
        const filePath = path.resolve(config.output, fileName);
        await fs.ensureDir(config.output);
        await fs.writeFile(filePath, content);
        console.log(`  📄 ${filePath}`);
        return filePath;
    }
    async generateTest(name, context, config) {
        const template = await this.loadTemplate('views/test.hbs');
        const compiled = handlebars_1.default.compile(template);
        const content = compiled(context);
        const ext = config.typescript ? '.test.tsx' : '.test.jsx';
        const fileName = `${name}${ext}`;
        const filePath = path.join(config.output, '__tests__', fileName);
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, content);
        return filePath;
    }
    async generateStory(name, context, config) {
        const template = await this.loadTemplate('views/story.hbs');
        const compiled = handlebars_1.default.compile(template);
        const content = compiled(context);
        const fileName = `${name}.stories.tsx`;
        const filePath = path.join(config.output, '__stories__', fileName);
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, content);
        return filePath;
    }
    async loadTemplate(templateName) {
        const templatePath = path.join(this.templatesPath, templateName);
        if (await fs.pathExists(templatePath)) {
            return fs.readFile(templatePath, 'utf-8');
        }
        // Return default template if specific template not found
        return this.getDefaultTemplate(templateName);
    }
    getDefaultTemplate(templateName) {
        if (templateName.includes('crud-list')) {
            return this.getCrudListTemplate();
        }
        if (templateName.includes('test')) {
            return this.getViewTestTemplate();
        }
        if (templateName.includes('story')) {
            return this.getViewStoryTemplate();
        }
        return this.getCrudListTemplate();
    }
    getCrudListTemplate() {
        return `// Default CRUD list template - should be replaced with actual template file`;
    }
    getViewTestTemplate() {
        return `// Default view test template`;
    }
    getViewStoryTemplate() {
        return `// Default view story template`;
    }
    isFilterableType(type) {
        const filterableTypes = ['text', 'email', 'enum', 'date', 'datetime', 'number'];
        return filterableTypes.includes(type);
    }
    isSortableType(type) {
        const nonSortableTypes = ['image'];
        return !nonSortableTypes.includes(type);
    }
    getDefaultSize(type) {
        const sizeMap = {
            'uuid': 400,
            'date': 140,
            'datetime': 140,
            'image': 140,
            'enum': 120
        };
        return sizeMap[type];
    }
    generateFeatureName(componentName) {
        // Convert "ClienteView" -> "cliente"
        // Convert "UserManagementView" -> "user-management"
        return componentName
            .replace(/View$/, '') // Remove "View" suffix
            .replace(/([A-Z])/g, (match, letter, index) => index === 0 ? letter.toLowerCase() : `-${letter.toLowerCase()}`);
    }
    generateAdminRoute(category, feature, componentName) {
        const cat = category || 'configuracao';
        const feat = feature || this.generateFeatureName(componentName || '');
        return `/admin/${cat}/${feat}`;
    }
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
exports.ViewGenerator = ViewGenerator;
//# sourceMappingURL=ViewGenerator.js.map