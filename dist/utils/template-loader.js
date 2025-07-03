"use strict";
/**
 * Template Loader - Utility for loading and caching Handlebars templates
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
exports.TemplateLoader = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
class TemplateLoader {
    constructor(templatesPath = path.join(__dirname, '../templates')) {
        this.cache = new Map();
        this.templatesPath = templatesPath;
        this.registerHelpers();
    }
    registerHelpers() {
        // Equality helper
        handlebars_1.default.registerHelper('eq', function (a, b) {
            return a === b;
        });
        // Not equal helper
        handlebars_1.default.registerHelper('neq', function (a, b) {
            return a !== b;
        });
        // Capitalize first letter
        handlebars_1.default.registerHelper('capitalizeFirst', function (str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        });
        // Lowercase first letter
        handlebars_1.default.registerHelper('lowercaseFirst', function (str) {
            return str.charAt(0).toLowerCase() + str.slice(1);
        });
        // Default value helper
        handlebars_1.default.registerHelper('default', function (value, defaultValue) {
            return value || defaultValue;
        });
        // JSON stringify helper
        handlebars_1.default.registerHelper('json', function (context) {
            return JSON.stringify(context, null, 2);
        });
        // Unless helper (inverse of if)
        handlebars_1.default.registerHelper('unless', function (conditional, options) {
            if (!conditional) {
                return options.fn(this);
            }
            return options.inverse(this);
        });
    }
    async loadTemplate(category, templateName) {
        const cacheKey = `${category}/${templateName}`;
        // Check cache first
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        try {
            // Try to load external template file
            const templatePath = path.join(this.templatesPath, category, `${templateName}.hbs`);
            if (await fs.pathExists(templatePath)) {
                const templateContent = await fs.readFile(templatePath, 'utf-8');
                const compiled = handlebars_1.default.compile(templateContent);
                this.cache.set(cacheKey, compiled);
                return compiled;
            }
            // Fallback to common templates
            const commonPath = path.join(this.templatesPath, 'common', `${templateName}.hbs`);
            if (await fs.pathExists(commonPath)) {
                const templateContent = await fs.readFile(commonPath, 'utf-8');
                const compiled = handlebars_1.default.compile(templateContent);
                this.cache.set(cacheKey, compiled);
                return compiled;
            }
            throw new Error(`Template not found: ${category}/${templateName}`);
        }
        catch (error) {
            throw new Error(`Failed to load template ${category}/${templateName}: ${error.message}`);
        }
    }
    async templateExists(category, templateName) {
        const templatePath = path.join(this.templatesPath, category, `${templateName}.hbs`);
        const commonPath = path.join(this.templatesPath, 'common', `${templateName}.hbs`);
        return (await fs.pathExists(templatePath)) || (await fs.pathExists(commonPath));
    }
    clearCache() {
        this.cache.clear();
    }
    // Register a partial template
    async registerPartial(name, templatePath) {
        try {
            const content = await fs.readFile(templatePath, 'utf-8');
            handlebars_1.default.registerPartial(name, content);
        }
        catch (error) {
            throw new Error(`Failed to register partial ${name}: ${error.message}`);
        }
    }
    // Load all partials from a directory
    async loadPartials(partialsDir = path.join(this.templatesPath, 'partials')) {
        if (await fs.pathExists(partialsDir)) {
            const files = await fs.readdir(partialsDir);
            for (const file of files) {
                if (file.endsWith('.hbs')) {
                    const name = path.basename(file, '.hbs');
                    const filePath = path.join(partialsDir, file);
                    await this.registerPartial(name, filePath);
                }
            }
        }
    }
}
exports.TemplateLoader = TemplateLoader;
//# sourceMappingURL=template-loader.js.map