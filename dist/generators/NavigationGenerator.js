"use strict";
/**
 * NavigationGenerator - Generate navigation items for powerview-admin pattern
 *
 * Generates navigation configuration files that follow the exact patterns
 * from powerview-admin, including grouped menus, routes, and i18n integration.
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
exports.NavigationGenerator = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
class NavigationGenerator {
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
        // Register capitalize first helper
        handlebars_1.default.registerHelper('capitalizeFirst', (str) => {
            return str.charAt(0).toUpperCase() + str.slice(1);
        });
        // Register lowercase helper
        handlebars_1.default.registerHelper('toLowerCase', (str) => {
            return str.toLowerCase();
        });
        // Register uppercase helper
        handlebars_1.default.registerHelper('toUpperCase', (str) => {
            return str.toUpperCase();
        });
        // Register kebab case helper
        handlebars_1.default.registerHelper('toKebabCase', (str) => {
            return str.replace(/([A-Z])/g, (match, letter, index) => index === 0 ? letter.toLowerCase() : `-${letter.toLowerCase()}`);
        });
    }
    async generate(config) {
        try {
            const context = this.buildTemplateContext(config);
            const files = [];
            // Generate navigation item
            const navFile = await this.generateNavigationItem(config.name, context, config);
            files.push(navFile);
            // Generate route constants
            const routeFile = await this.generateRouteConstants(config.name, context, config);
            files.push(routeFile);
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
    buildTemplateContext(config) {
        const featureName = config.feature || this.generateFeatureName(config.name);
        const categoryName = config.category;
        return {
            // Basic info
            name: config.name,
            label: config.label,
            icon: config.icon,
            color: config.color,
            showInSidebar: config.showInSidebar,
            // Navigation patterns
            category: categoryName,
            feature: featureName,
            categoryConstant: categoryName.toUpperCase() + '_CATEGORY',
            featureConstant: featureName.toUpperCase(),
            // Routes
            adminRoute: `/admin/${categoryName}/${featureName}`,
            formRoute: `/admin/${categoryName}/${featureName}/:${featureName}Id`,
            // Components
            viewComponent: `${this.capitalizeFirst(featureName)}View`,
            formComponent: `${this.capitalizeFirst(featureName)}Form`,
            // Features
            withForm: config.withForm,
            withView: config.withView,
            group: config.group,
            // i18n keys
            labelKey: `mentors:${this.capitalizeFirst(featureName)}`,
            categoryLabelKey: `mentors:${this.capitalizeFirst(categoryName)}`,
            // Variable names
            viewVarName: `${featureName}View`,
            formVarName: `${featureName}Form`,
            groupVarName: `${categoryName}GroupMenu`
        };
    }
    async generateNavigationItem(name, context, config) {
        const templateName = 'navigation/navigation-item.hbs';
        const template = await this.loadTemplate(templateName);
        const compiled = handlebars_1.default.compile(template);
        const content = compiled(context);
        const ext = config.typescript ? '.tsx' : '.jsx';
        const fileName = `${name}Navigation${ext}`;
        const filePath = path.resolve(config.output, fileName);
        await fs.ensureDir(config.output);
        await fs.writeFile(filePath, content);
        console.log(`  📄 ${filePath}`);
        return filePath;
    }
    async generateRouteConstants(name, context, config) {
        const templateName = 'navigation/route-constants.hbs';
        const template = await this.loadTemplate(templateName);
        const compiled = handlebars_1.default.compile(template);
        const content = compiled(context);
        const fileName = `${name}Routes.ts`;
        const filePath = path.resolve(config.output, fileName);
        await fs.ensureDir(config.output);
        await fs.writeFile(filePath, content);
        console.log(`  📄 ${filePath}`);
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
        if (templateName.includes('navigation-item')) {
            return this.getNavigationItemTemplate();
        }
        if (templateName.includes('route-constants')) {
            return this.getRouteConstantsTemplate();
        }
        return this.getNavigationItemTemplate();
    }
    getNavigationItemTemplate() {
        return `// Navigation item template - generated by NavigationGenerator`;
    }
    getRouteConstantsTemplate() {
        return `// Route constants template - generated by NavigationGenerator`;
    }
    generateFeatureName(componentName) {
        // Convert "PlataformaNavigation" -> "plataforma"
        return componentName
            .replace(/Navigation$/, '') // Remove "Navigation" suffix
            .replace(/([A-Z])/g, (match, letter, index) => index === 0 ? letter.toLowerCase() : `-${letter.toLowerCase()}`);
    }
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
exports.NavigationGenerator = NavigationGenerator;
//# sourceMappingURL=NavigationGenerator.js.map