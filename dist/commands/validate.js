"use strict";
/**
 * Validate Command - Validate generated code and project structure
 *
 * Examples:
 * archbase validate file ./src/components/UserForm.tsx
 * archbase validate project ./my-admin-app
 * archbase validate generated --last
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
exports.validateCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const CodeValidator_1 = require("../validators/CodeValidator");
exports.validateCommand = new commander_1.Command('validate')
    .description('Validate generated code and project structure')
    .addCommand(new commander_1.Command('file')
    .description('Validate a specific TypeScript/React file')
    .argument('<file>', 'Path to the file to validate')
    .option('--format <type>', 'Output format (json|text)', 'text')
    .option('--strict', 'Enable strict validation rules')
    .action(async (filePath, options) => {
    if (options.format !== 'json') {
        console.log(chalk_1.default.blue(`🔍 Validating file: ${filePath}`));
    }
    try {
        const validator = new CodeValidator_1.CodeValidator();
        const result = await validator.validateFile(path.resolve(filePath));
        if (options.format === 'json') {
            console.log(JSON.stringify(result, null, 2));
        }
        else {
            displayValidationResult(result, 'file');
        }
        // Exit with error code if validation failed
        if (!result.isValid) {
            process.exit(1);
        }
    }
    catch (error) {
        if (options.format === 'json') {
            console.log(JSON.stringify({ error: error.message }, null, 2));
        }
        else {
            console.error(chalk_1.default.red(`❌ Error validating file: ${error.message}`));
        }
        process.exit(1);
    }
}))
    .addCommand(new commander_1.Command('project')
    .description('Validate entire project structure')
    .argument('<directory>', 'Path to the project directory')
    .option('--format <type>', 'Output format (json|text)', 'text')
    .option('--ignore <patterns>', 'Comma-separated patterns to ignore', 'node_modules,dist,build')
    .action(async (projectPath, options) => {
    if (options.format !== 'json') {
        console.log(chalk_1.default.blue(`🔍 Validating project: ${projectPath}`));
    }
    try {
        const validator = new CodeValidator_1.CodeValidator();
        const result = await validator.validateProject(path.resolve(projectPath));
        if (options.format === 'json') {
            console.log(JSON.stringify(result, null, 2));
        }
        else {
            displayValidationResult(result, 'project');
        }
        // Exit with error code if validation failed
        if (!result.isValid) {
            process.exit(1);
        }
    }
    catch (error) {
        if (options.format === 'json') {
            console.log(JSON.stringify({ error: error.message }, null, 2));
        }
        else {
            console.error(chalk_1.default.red(`❌ Error validating project: ${error.message}`));
        }
        process.exit(1);
    }
}))
    .addCommand(new commander_1.Command('generated')
    .description('Validate recently generated code')
    .option('--last', 'Validate the last generated files')
    .option('--format <type>', 'Output format (json|text)', 'text')
    .action(async (options) => {
    if (options.format !== 'json') {
        console.log(chalk_1.default.blue('🔍 Validating generated code...'));
    }
    try {
        // This would typically read from a cache/history of generated files
        // For now, we'll implement a basic version
        const generatedFiles = await getRecentlyGeneratedFiles();
        if (generatedFiles.length === 0) {
            if (options.format === 'json') {
                console.log(JSON.stringify({ message: 'No recently generated files found' }, null, 2));
            }
            else {
                console.log(chalk_1.default.yellow('📝 No recently generated files found'));
                console.log(chalk_1.default.gray('Generate some code first using archbase generate commands'));
            }
            return;
        }
        const validator = new CodeValidator_1.CodeValidator();
        const results = [];
        for (const file of generatedFiles) {
            const result = await validator.validateFile(file);
            results.push({ file, result });
        }
        if (options.format === 'json') {
            console.log(JSON.stringify(results, null, 2));
        }
        else {
            displayBatchValidationResults(results);
        }
        // Exit with error code if any validation failed
        const hasErrors = results.some(r => !r.result.isValid);
        if (hasErrors) {
            process.exit(1);
        }
    }
    catch (error) {
        if (options.format === 'json') {
            console.log(JSON.stringify({ error: error.message }, null, 2));
        }
        else {
            console.error(chalk_1.default.red(`❌ Error validating generated code: ${error.message}`));
        }
        process.exit(1);
    }
}));
function displayValidationResult(result, type) {
    const icon = result.isValid ? '✅' : '❌';
    const status = result.isValid ? 'VALID' : 'INVALID';
    const color = result.isValid ? chalk_1.default.green : chalk_1.default.red;
    console.log(color(`\n${icon} ${status}`));
    // Display metrics
    console.log(chalk_1.default.yellow('\n📊 Metrics:'));
    console.log(`  Lines of code: ${result.metrics.linesOfCode}`);
    console.log(`  Components: ${result.metrics.componentCount}`);
    console.log(`  Hooks: ${result.metrics.hookCount}`);
    console.log(`  Imports: ${result.metrics.importCount}`);
    console.log(`  Complexity: ${result.metrics.complexity}`);
    console.log(`  TypeScript: ${result.metrics.hasTypeScript ? '✅' : '❌'}`);
    // Display errors
    if (result.errors.length > 0) {
        console.log(chalk_1.default.red('\n🚨 Errors:'));
        result.errors.forEach((error, index) => {
            const location = error.line ? ` (line ${error.line}${error.column ? `:${error.column}` : ''})` : '';
            console.log(`  ${index + 1}. ${error.message}${location}`);
        });
    }
    // Display warnings
    if (result.warnings.length > 0) {
        console.log(chalk_1.default.yellow('\n⚠️  Warnings:'));
        result.warnings.forEach((warning, index) => {
            console.log(`  ${index + 1}. ${warning.message}`);
            if (warning.suggestion) {
                console.log(chalk_1.default.gray(`     💡 ${warning.suggestion}`));
            }
        });
    }
    if (result.isValid && result.errors.length === 0 && result.warnings.length === 0) {
        console.log(chalk_1.default.green('\n🎉 Code is valid and follows best practices!'));
    }
}
function displayBatchValidationResults(results) {
    console.log(chalk_1.default.yellow(`\n📝 Validation Results (${results.length} files):`));
    const validFiles = results.filter(r => r.result.isValid);
    const invalidFiles = results.filter(r => !r.result.isValid);
    console.log(chalk_1.default.green(`✅ Valid: ${validFiles.length}`));
    console.log(chalk_1.default.red(`❌ Invalid: ${invalidFiles.length}`));
    if (invalidFiles.length > 0) {
        console.log(chalk_1.default.red('\n🚨 Files with errors:'));
        invalidFiles.forEach(({ file, result }) => {
            console.log(`  ${chalk_1.default.cyan(path.basename(file))}: ${result.errors.length} error(s)`);
            result.errors.slice(0, 2).forEach(error => {
                console.log(chalk_1.default.gray(`    • ${error.message}`));
            });
        });
    }
    // Summary metrics
    const totalLines = results.reduce((sum, r) => sum + r.result.metrics.linesOfCode, 0);
    const totalComponents = results.reduce((sum, r) => sum + r.result.metrics.componentCount, 0);
    const totalComplexity = results.reduce((sum, r) => sum + r.result.metrics.complexity, 0);
    console.log(chalk_1.default.yellow('\n📊 Summary:'));
    console.log(`  Total lines: ${totalLines}`);
    console.log(`  Total components: ${totalComponents}`);
    console.log(`  Average complexity: ${Math.round(totalComplexity / results.length)}`);
}
async function getRecentlyGeneratedFiles() {
    // This is a simplified implementation
    // In a real scenario, we'd track generated files in a history/cache system
    const possibleDirs = ['./src', './components', './pages', './forms', './views'];
    const files = [];
    for (const dir of possibleDirs) {
        try {
            if (await fs.pathExists(dir)) {
                const dirFiles = await fs.readdir(dir);
                const tsxFiles = dirFiles
                    .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'))
                    .map(f => path.join(dir, f));
                files.push(...tsxFiles);
            }
        }
        catch (error) {
            // Ignore errors for directories that don't exist
        }
    }
    return files.slice(0, 10); // Limit to 10 most recent files
}
//# sourceMappingURL=validate.js.map