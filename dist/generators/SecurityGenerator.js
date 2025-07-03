"use strict";
/**
 * SecurityGenerator - Generates security-related views and components
 *
 * Based on patterns from powerview-admin project:
 * - Login views (desktop/mobile)
 * - Security management views
 * - Authentication components
 * - User management interfaces
 * - API token management
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
exports.SecurityGenerator = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const Handlebars = __importStar(require("handlebars"));
class SecurityGenerator {
    constructor() {
        this.templateDir = path.join(__dirname, '../templates/security');
        this.registerHandlebarsHelpers();
    }
    async generate(config) {
        console.log(`🔒 Generating security component: ${config.name}`);
        const files = [];
        const errors = [];
        try {
            switch (config.type) {
                case 'login':
                    files.push(...await this.generateLoginViews(config));
                    break;
                case 'security-management':
                    files.push(...await this.generateSecurityManagement(config));
                    break;
                case 'user-management':
                    files.push(...await this.generateUserManagement(config));
                    break;
                case 'api-tokens':
                    files.push(...await this.generateApiTokens(config));
                    break;
                case 'authenticator':
                    files.push(...await this.generateAuthenticator(config));
                    break;
                default:
                    throw new Error(`Unknown security type: ${config.type}`);
            }
            console.log(`✅ Generated ${config.type} for ${config.name}`);
            return { success: true, files };
        }
        catch (error) {
            errors.push(error.message);
            return { success: false, files, errors };
        }
    }
    async generateLoginViews(config) {
        const context = this.buildLoginContext(config);
        const files = [];
        // Generate desktop login view
        files.push(await this.generateFromTemplate('LoginView.tsx.hbs', `${config.name}View.tsx`, context, config.output));
        // Generate mobile login view if requested
        if (config.withMobile) {
            files.push(await this.generateFromTemplate('LoginMobileView.tsx.hbs', `${config.name}MobileView.tsx`, context, config.output));
        }
        // Generate CSS module
        files.push(await this.generateFromTemplate('Login.module.css.hbs', `${config.name}.module.css`, context, config.output));
        return files;
    }
    async generateSecurityManagement(config) {
        const context = this.buildSecurityContext(config);
        const files = [];
        // Main security view
        files.push(await this.generateFromTemplate('SecurityView.tsx.hbs', `${config.name}View.tsx`, context, config.output));
        // Navigation item
        files.push(await this.generateFromTemplate('SecurityNavigation.tsx.hbs', `${config.name}Navigation.tsx`, context, config.output));
        // Route constants
        files.push(await this.generateFromTemplate('SecurityRoutes.tsx.hbs', `${config.name}Routes.tsx`, context, config.output));
        return files;
    }
    async generateUserManagement(config) {
        const context = this.buildUserManagementContext(config);
        const files = [];
        // User management view
        files.push(await this.generateFromTemplate('UserManagementView.tsx.hbs', `${config.name}View.tsx`, context, config.output));
        return files;
    }
    async generateApiTokens(config) {
        const context = this.buildApiTokenContext(config);
        const files = [];
        // API Token management view
        files.push(await this.generateFromTemplate('ApiTokenManagementView.tsx.hbs', `${config.name}View.tsx`, context, config.output));
        return files;
    }
    async generateAuthenticator(config) {
        const context = this.buildAuthenticatorContext(config);
        const files = [];
        // Authenticator class
        files.push(await this.generateFromTemplate('Authenticator.ts.hbs', `${config.authenticatorClass || config.name + 'Authenticator'}.ts`, context, config.output));
        // IOC container setup
        files.push(await this.generateFromTemplate('SecurityContainer.tsx.hbs', `${config.name}Container.tsx`, context, config.output));
        return files;
    }
    buildLoginContext(config) {
        return {
            componentName: config.name,
            withMobile: config.withMobile,
            withBranding: config.withBranding,
            withPasswordRemember: config.withPasswordRemember,
            brandName: config.brandName || 'Your App',
            logoPath: config.logoPath || '/assets/logo.png',
            features: config.features || [],
            hasFeature: (feature) => config.features?.includes(feature) || false
        };
    }
    buildSecurityContext(config) {
        return {
            componentName: config.name,
            features: config.features || ['users', 'groups', 'permissions'],
            routeName: `${config.name.toUpperCase()}_ROUTE`,
            categoryName: `${config.name.toUpperCase()}_CATEGORY`,
            hasFeature: (feature) => config.features?.includes(feature) || false
        };
    }
    buildUserManagementContext(config) {
        return {
            componentName: config.name,
            entityName: 'User',
            features: config.features || ['create', 'edit', 'delete', 'list', 'permissions'],
            serviceName: `${config.name}Service`,
            hasFeature: (feature) => config.features?.includes(feature) || false
        };
    }
    buildApiTokenContext(config) {
        return {
            componentName: config.name,
            entityName: 'ApiToken',
            features: config.features || ['create', 'edit', 'delete', 'list', 'regenerate'],
            serviceName: `${config.name}Service`,
            hasFeature: (feature) => config.features?.includes(feature) || false
        };
    }
    buildAuthenticatorContext(config) {
        return {
            componentName: config.name,
            authenticatorClass: config.authenticatorClass || `${config.name}Authenticator`,
            userClass: config.userClass || `${config.name}User`,
            apiTokenClass: config.apiTokenClass || `${config.name}ApiToken`,
            brandName: config.brandName || 'YourApp',
            baseURL: config.baseURL || 'http://localhost:8080',
            features: config.features || ['jwt', 'refresh-token', 'password-reset'],
            hasFeature: (feature) => config.features?.includes(feature) || false
        };
    }
    async generateFromTemplate(templateName, outputFileName, context, outputDir) {
        const templatePath = path.join(this.templateDir, templateName);
        const template = await fs.readFile(templatePath, 'utf-8');
        const compiled = Handlebars.compile(template);
        const content = compiled(context);
        const finalOutputDir = outputDir || './src/security';
        const outputPath = path.join(finalOutputDir, outputFileName);
        await fs.ensureDir(path.dirname(outputPath));
        await fs.writeFile(outputPath, content);
        return outputPath;
    }
    registerHandlebarsHelpers() {
        Handlebars.registerHelper('eq', (a, b) => a === b);
        Handlebars.registerHelper('capitalizeFirst', (str) => str.charAt(0).toUpperCase() + str.slice(1));
        Handlebars.registerHelper('toLowerCase', (str) => str.toLowerCase());
        Handlebars.registerHelper('toUpperCase', (str) => str.toUpperCase());
        Handlebars.registerHelper('concat', (...args) => {
            args.pop(); // Remove options object
            return args.join('');
        });
        Handlebars.registerHelper('hasFeature', function (feature) {
            return this.features && this.features.includes(feature);
        });
    }
}
exports.SecurityGenerator = SecurityGenerator;
//# sourceMappingURL=SecurityGenerator.js.map