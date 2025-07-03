"use strict";
/**
 * Generate Command - Code generation based on templates
 *
 * Examples:
 * archbase generate form UserRegistration --fields=name,email,password --validation=yup
 * archbase generate view UserManagement --template=crud --entity=User
 * archbase generate page Dashboard --layout=sidebar --components=chart,table
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
exports.generateCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const fs = __importStar(require("fs-extra"));
const FormGenerator_1 = require("../generators/FormGenerator");
const ViewGenerator_1 = require("../generators/ViewGenerator");
const PageGenerator_1 = require("../generators/PageGenerator");
const ComponentGenerator_1 = require("../generators/ComponentGenerator");
const NavigationGenerator_1 = require("../generators/NavigationGenerator");
const DomainGenerator_1 = require("../generators/DomainGenerator");
const SecurityGenerator_1 = require("../generators/SecurityGenerator");
exports.generateCommand = new commander_1.Command('generate')
    .description('Generate code based on Archbase templates')
    .addCommand(new commander_1.Command('form')
    .description('Generate a form component')
    .argument('<name>', 'Form component name')
    .option('--fields <fields>', 'Comma-separated field list (name:type)')
    .option('--validation <lib>', 'Validation library (yup|zod)', 'yup')
    .option('--template <template>', 'Form template (basic|wizard|validation)', 'basic')
    .option('--output <dir>', 'Output directory', './src/forms')
    .option('--typescript', 'Generate TypeScript (default)', true)
    .option('--test', 'Include test files')
    .option('--story', 'Include Storybook story')
    .option('--interactive', 'Interactive mode with prompts')
    .option('--datasource-version <version>', 'DataSource version (v1|v2)', 'v2')
    .option('--with-array-fields', 'Include array field management methods')
    .option('--layout <layout>', 'Form layout (vertical|horizontal|grid)', 'vertical')
    .option('--category <category>', 'Admin navigation category', 'configuracao')
    .option('--feature <feature>', 'Feature name for routing (auto-generated if not provided)')
    .option('--dto <file>', 'Path to DTO file for field extraction')
    .action(async (name, options) => {
    console.log(chalk_1.default.blue(`🏗️  Generating form: ${name}`));
    try {
        let config = options;
        if (options.interactive) {
            config = await promptFormConfig(name, options);
        }
        const generator = new FormGenerator_1.FormGenerator();
        const result = await generator.generate(name, config);
        console.log(chalk_1.default.green(`✅ Form generated successfully!`));
        result.files.forEach((file) => {
            console.log(chalk_1.default.gray(`  📄 ${file}`));
        });
    }
    catch (error) {
        console.error(chalk_1.default.red(`❌ Error generating form: ${error.message}`));
        process.exit(1);
    }
}))
    .addCommand(new commander_1.Command('page')
    .description('Generate a page component')
    .argument('<name>', 'Page component name')
    .option('--layout <layout>', 'Page layout (sidebar|header|blank|dashboard)', 'sidebar')
    .option('--components <components>', 'Components to include (name:type,name:type)')
    .option('--title <title>', 'Page title')
    .option('--output <dir>', 'Output directory', './src/pages')
    .option('--typescript', 'Generate TypeScript code', true)
    .option('--test', 'Generate test file')
    .option('--story', 'Generate Storybook story')
    .option('--with-auth', 'Include authentication wrapper')
    .option('--with-navigation', 'Include navigation components')
    .option('--with-footer', 'Include footer')
    .action(async (name, options) => {
    console.log(chalk_1.default.blue(`🏗️  Generating page: ${name}`));
    try {
        const generator = new PageGenerator_1.PageGenerator();
        const result = await generator.generate(name, {
            ...options,
            withAuth: options.withAuth || false,
            withNavigation: options.withNavigation || false,
            withFooter: options.withFooter || false
        });
        if (result.success) {
            console.log(chalk_1.default.green(`✅ Page generated successfully!`));
            result.files.forEach((file) => {
                console.log(chalk_1.default.gray(`  📄 ${file}`));
            });
        }
        else {
            console.error(chalk_1.default.red(`❌ Error generating page:`));
            result.errors?.forEach(error => {
                console.error(chalk_1.default.red(`  ${error}`));
            });
            process.exit(1);
        }
    }
    catch (error) {
        console.error(chalk_1.default.red(`❌ Error generating page: ${error.message}`));
        process.exit(1);
    }
}))
    .addCommand(new commander_1.Command('component')
    .description('Generate a custom component')
    .argument('<name>', 'Component name')
    .option('--type <type>', 'Component type (display|input|layout|functional)', 'functional')
    .option('--props <props>', 'Component props (name:type=default,name:type)')
    .option('--hooks <hooks>', 'React hooks to include (name:type,name:type)')
    .option('--output <dir>', 'Output directory', './src/components')
    .option('--typescript', 'Generate TypeScript code', true)
    .option('--test', 'Generate test file')
    .option('--story', 'Generate Storybook story')
    .option('--with-state', 'Include useState hook')
    .option('--with-effects', 'Include useEffect hook')
    .option('--with-memo', 'Include useMemo and useCallback hooks')
    .action(async (name, options) => {
    console.log(chalk_1.default.blue(`🏗️  Generating component: ${name}`));
    try {
        const generator = new ComponentGenerator_1.ComponentGenerator();
        const result = await generator.generate(name, {
            ...options,
            withState: options.withState || false,
            withEffects: options.withEffects || false,
            withMemo: options.withMemo || false
        });
        if (result.success) {
            console.log(chalk_1.default.green(`✅ Component generated successfully!`));
            result.files.forEach((file) => {
                console.log(chalk_1.default.gray(`  📄 ${file}`));
            });
        }
        else {
            console.error(chalk_1.default.red(`❌ Error generating component:`));
            result.errors?.forEach(error => {
                console.error(chalk_1.default.red(`  ${error}`));
            });
            process.exit(1);
        }
    }
    catch (error) {
        console.error(chalk_1.default.red(`❌ Error generating component: ${error.message}`));
        process.exit(1);
    }
}))
    .addCommand(new commander_1.Command('view')
    .description('Generate a CRUD list view component')
    .argument('<name>', 'View component name')
    .option('--fields <fields>', 'Comma-separated field list (name:type)')
    .option('--output <dir>', 'Output directory', './src/views')
    .option('--typescript', 'Generate TypeScript (default)', true)
    .option('--test', 'Include test files')
    .option('--story', 'Include Storybook story')
    .option('--category <category>', 'Admin navigation category', 'configuracao')
    .option('--feature <feature>', 'Feature name for routing (auto-generated if not provided)')
    .option('--with-permissions', 'Include permission-based UI (default)', true)
    .option('--with-filters', 'Include filtering capabilities (default)', true)
    .option('--with-pagination', 'Include pagination (default)', true)
    .option('--with-sorting', 'Include sorting capabilities (default)', true)
    .option('--page-size <size>', 'Default page size', '25')
    .option('--dto <file>', 'Path to DTO file for field extraction')
    .action(async (name, options) => {
    console.log(chalk_1.default.blue(`🏗️  Generating view: ${name}`));
    try {
        const generator = new ViewGenerator_1.ViewGenerator();
        const result = await generator.generate(name, {
            ...options,
            withPermissions: options.withPermissions !== false,
            withFilters: options.withFilters !== false,
            withPagination: options.withPagination !== false,
            withSorting: options.withSorting !== false,
            pageSize: parseInt(options.pageSize) || 25
        });
        if (result.success) {
            console.log(chalk_1.default.green(`✅ View generated successfully!`));
            result.files.forEach((file) => {
                console.log(chalk_1.default.gray(`  📄 ${file}`));
            });
        }
        else {
            console.error(chalk_1.default.red(`❌ Error generating view:`));
            result.errors?.forEach(error => {
                console.error(chalk_1.default.red(`  ${error}`));
            });
            process.exit(1);
        }
    }
    catch (error) {
        console.error(chalk_1.default.red(`❌ Error generating view: ${error.message}`));
        process.exit(1);
    }
}))
    .addCommand(new commander_1.Command('navigation')
    .description('Generate navigation items for admin routing')
    .argument('<name>', 'Navigation component name')
    .option('--output <dir>', 'Output directory', './src/navigation')
    .option('--typescript', 'Generate TypeScript (default)', true)
    .option('--category <category>', 'Admin navigation category', 'configuracao')
    .option('--feature <feature>', 'Feature name for routing (auto-generated if not provided)')
    .option('--label <label>', 'Navigation label (auto-generated if not provided)')
    .option('--icon <icon>', 'Tabler icon name', 'IconSettings')
    .option('--color <color>', 'Navigation item color', 'blue')
    .option('--show-in-sidebar', 'Show in sidebar (default)', true)
    .option('--with-form', 'Include form navigation item')
    .option('--with-view', 'Include view navigation item (default)', true)
    .option('--group <group>', 'Group this item under a menu group')
    .action(async (name, options) => {
    console.log(chalk_1.default.blue(`🏗️  Generating navigation: ${name}`));
    try {
        const generator = new NavigationGenerator_1.NavigationGenerator();
        const feature = options.feature || name.replace(/Navigation$/, '').toLowerCase();
        const label = options.label || feature.charAt(0).toUpperCase() + feature.slice(1);
        const result = await generator.generate({
            name,
            output: options.output,
            typescript: options.typescript !== false,
            category: options.category,
            feature,
            label,
            icon: options.icon,
            color: options.color,
            showInSidebar: options.showInSidebar !== false,
            withForm: options.withForm || false,
            withView: options.withView !== false,
            group: options.group
        });
        if (result.success) {
            console.log(chalk_1.default.green(`✅ Navigation generated successfully!`));
            result.files.forEach((file) => {
                console.log(chalk_1.default.gray(`  📄 ${file}`));
            });
        }
        else {
            console.error(chalk_1.default.red(`❌ Error generating navigation:`));
            result.errors?.forEach(error => {
                console.error(chalk_1.default.red(`  ${error}`));
            });
            process.exit(1);
        }
    }
    catch (error) {
        console.error(chalk_1.default.red(`❌ Error generating navigation: ${error.message}`));
        process.exit(1);
    }
}))
    .addCommand(new commander_1.Command('domain')
    .description('Generate DTOs and enums from Java classes or field specifications')
    .argument('<name>', 'DTO name (e.g., UserDto, Cliente)')
    .option('--fields <fields>', 'Comma-separated field list (name:type,email:String)')
    .option('--output <dir>', 'Output directory', './src/domain')
    .option('--typescript', 'Generate TypeScript (default)', true)
    .option('--with-audit-fields', 'Include audit fields (id, dates, users)', true)
    .option('--with-validation', 'Include validation decorators', true)
    .option('--with-constructor', 'Include constructor with data transformation', true)
    .option('--with-factory', 'Include static factory method', true)
    .option('--java-input <file>', 'Java class file to parse')
    .option('--java-text <text>', 'Java class as text input or file path')
    .option('--enums <enums>', 'Semicolon-separated enum definitions (Status:ACTIVE,INACTIVE;Type:A,B,C)')
    .action(async (name, options) => {
    console.log(chalk_1.default.blue(`🏗️  Generating domain: ${name}`));
    try {
        const generator = new DomainGenerator_1.DomainGenerator();
        // Parse fields if provided
        let fields = [];
        if (options.fields) {
            fields = options.fields.split(',').map((field) => {
                const [fieldName, fieldType] = field.split(':');
                return {
                    name: fieldName.trim(),
                    type: fieldType ? fieldType.trim() : 'String',
                    required: false
                };
            });
        }
        // Parse enums if provided
        let enums = [];
        if (options.enums) {
            // Split by semicolon for multiple enums, not comma
            const enumDefs = options.enums.split(';');
            enums = enumDefs.map((enumDef) => {
                const [enumName, enumValues] = enumDef.split(':');
                return {
                    name: enumName.trim(),
                    values: enumValues ? enumValues.split(',').map((v) => v.trim()) : []
                };
            });
        }
        // Read Java file if provided
        let javaInput;
        if (options.javaInput) {
            try {
                javaInput = await fs.readFile(options.javaInput, 'utf-8');
            }
            catch (error) {
                console.error(chalk_1.default.red(`❌ Error reading Java file: ${error.message}`));
                process.exit(1);
            }
        }
        else if (options.javaText) {
            // Check if javaText is a file path or actual Java code
            if (await fs.pathExists(options.javaText)) {
                try {
                    console.log(chalk_1.default.gray(`📄 Reading Java file: ${options.javaText}`));
                    javaInput = await fs.readFile(options.javaText, 'utf-8');
                }
                catch (error) {
                    console.error(chalk_1.default.red(`❌ Error reading Java file: ${error.message}`));
                    process.exit(1);
                }
            }
            else {
                // Treat as direct Java code
                javaInput = options.javaText;
            }
        }
        const result = await generator.generate({
            name,
            output: options.output,
            typescript: options.typescript !== false,
            fields,
            enums: enums.length > 0 ? enums : undefined,
            withAuditFields: options.withAuditFields !== false,
            withValidation: options.withValidation !== false,
            withConstructor: options.withConstructor !== false,
            withFactory: options.withFactory !== false,
            javaInput
        });
        if (result.success) {
            console.log(chalk_1.default.green(`✅ Domain generated successfully!`));
            result.files.forEach((file) => {
                console.log(chalk_1.default.gray(`  📄 ${file}`));
            });
        }
        else {
            console.error(chalk_1.default.red(`❌ Error generating domain:`));
            result.errors?.forEach(error => {
                console.error(chalk_1.default.red(`  ${error}`));
            });
            process.exit(1);
        }
    }
    catch (error) {
        console.error(chalk_1.default.red(`❌ Error generating domain: ${error.message}`));
        process.exit(1);
    }
}))
    .addCommand(new commander_1.Command('security')
    .description('Generate security components (login, user management, API tokens)')
    .argument('<name>', 'Security component name')
    .option('--type <type>', 'Security type (login|security-management|user-management|api-tokens|authenticator)', 'login')
    .option('--output <dir>', 'Output directory', './src/security')
    .option('--typescript', 'Generate TypeScript (default)', true)
    .option('--features <features>', 'Comma-separated feature list')
    .option('--with-mobile', 'Include mobile version for login')
    .option('--with-branding', 'Include branding section')
    .option('--with-password-remember', 'Include password remember functionality')
    .option('--brand-name <name>', 'Brand name for branding', 'Sistema')
    .option('--logo-path <path>', 'Path to logo image', '/assets/logo.png')
    .option('--user-class <class>', 'User class name', 'User')
    .option('--api-token-class <class>', 'API Token class name', 'ApiToken')
    .option('--authenticator-class <class>', 'Authenticator class name', 'CustomAuthenticator')
    .option('--base-url <url>', 'Base URL for API calls', 'http://localhost:8080')
    .action(async (name, options) => {
    console.log(chalk_1.default.blue(`🏗️  Generating security: ${name}`));
    try {
        const generator = new SecurityGenerator_1.SecurityGenerator();
        // Parse features if provided
        let features = [];
        if (options.features) {
            features = options.features.split(',').map((f) => f.trim());
        }
        // Set default features based on type
        if (features.length === 0) {
            switch (options.type) {
                case 'login':
                    features = ['password-remember', 'forgot-password'];
                    break;
                case 'security-management':
                    features = ['custom-permissions', 'audit-log'];
                    break;
                case 'user-management':
                    features = ['custom-permissions', 'user-activation', 'user-roles'];
                    break;
                case 'api-tokens':
                    features = ['custom-permissions', 'token-regeneration'];
                    break;
                case 'authenticator':
                    features = ['password-reset', 'logout', 'change-password'];
                    break;
            }
        }
        const result = await generator.generate({
            name,
            type: options.type,
            output: options.output,
            typescript: options.typescript !== false,
            features,
            withMobile: options.withMobile || false,
            withBranding: options.withBranding !== false,
            withPasswordRemember: options.withPasswordRemember !== false,
            brandName: options.brandName,
            logoPath: options.logoPath,
            userClass: options.userClass,
            apiTokenClass: options.apiTokenClass,
            authenticatorClass: options.authenticatorClass,
            baseURL: options.baseUrl
        });
        if (result.success) {
            console.log(chalk_1.default.green(`✅ Security component generated successfully!`));
            result.files.forEach((file) => {
                console.log(chalk_1.default.gray(`  📄 ${file}`));
            });
            // Show usage instructions
            console.log(chalk_1.default.cyan('\n📋 Usage instructions:'));
            switch (options.type) {
                case 'login':
                    console.log(chalk_1.default.gray('  Import and use the login component in your app:'));
                    console.log(chalk_1.default.gray(`  import { ${name}View } from './security/${name}View';`));
                    if (options.withMobile) {
                        console.log(chalk_1.default.gray(`  import { ${name}MobileView } from './security/${name}MobileView';`));
                    }
                    break;
                case 'authenticator':
                    console.log(chalk_1.default.gray('  Configure the authenticator in your IoC container:'));
                    console.log(chalk_1.default.gray(`  import { ${options.authenticatorClass} } from './security/${options.authenticatorClass}';`));
                    break;
                case 'security-management':
                    console.log(chalk_1.default.gray('  Add security routes to your application:'));
                    console.log(chalk_1.default.gray(`  import { ${name}Routes } from './security/${name}Routes';`));
                    break;
            }
        }
        else {
            console.error(chalk_1.default.red(`❌ Error generating security component:`));
            result.errors?.forEach(error => {
                console.error(chalk_1.default.red(`  ${error}`));
            });
            process.exit(1);
        }
    }
    catch (error) {
        console.error(chalk_1.default.red(`❌ Error generating security component: ${error.message}`));
        process.exit(1);
    }
}));
async function promptFormConfig(name, initialOptions) {
    const questions = [
        {
            type: 'input',
            name: 'fields',
            message: 'Enter form fields (format: name:type,email:email,password:password):',
            default: initialOptions.fields || 'name:text,email:email'
        },
        {
            type: 'list',
            name: 'validation',
            message: 'Choose validation library:',
            choices: ['yup', 'zod', 'none'],
            default: initialOptions.validation || 'yup'
        },
        {
            type: 'list',
            name: 'template',
            message: 'Choose form template:',
            choices: ['basic', 'wizard', 'validation'],
            default: initialOptions.template || 'basic'
        },
        {
            type: 'confirm',
            name: 'test',
            message: 'Include test files?',
            default: initialOptions.test || false
        },
        {
            type: 'confirm',
            name: 'story',
            message: 'Include Storybook story?',
            default: initialOptions.story || false
        }
    ];
    const answers = await inquirer_1.default.prompt(questions);
    return { ...initialOptions, ...answers };
}
//# sourceMappingURL=generate.js.map