"use strict";
/**
 * RealtimeScanner - Real-time component analysis and suggestions
 *
 * Watches project files for changes and provides live feedback about:
 * - Component usage patterns
 * - Potential issues
 * - Optimization suggestions
 * - Migration opportunities
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
exports.RealtimeScanner = void 0;
const path = __importStar(require("path"));
const chokidar = require('chokidar');
const chalk_1 = __importDefault(require("chalk"));
const ProjectScanner_1 = require("./ProjectScanner");
class RealtimeScanner {
    constructor() {
        this.watcher = null;
        this.debounceTimeout = null;
        this.lastScanResult = null;
        this.isScanning = false;
        this.scanner = new ProjectScanner_1.ProjectScanner();
    }
    async start(options) {
        const { projectPath, watchPatterns = ['**/*.{ts,tsx,js,jsx}'], ignorePatterns = ['node_modules/**', 'dist/**', 'build/**', '.git/**'], debounceMs = 1000, verboseLogging = false } = options;
        console.log(chalk_1.default.blue('🔍 Starting real-time component scanner...'));
        console.log(chalk_1.default.gray(`   Project: ${projectPath}`));
        console.log(chalk_1.default.gray(`   Watching: ${watchPatterns.join(', ')}`));
        // Initial scan
        await this.performInitialScan(projectPath);
        // Set up file watcher
        this.watcher = chokidar.watch(watchPatterns, {
            cwd: projectPath,
            ignored: ignorePatterns,
            persistent: true,
            ignoreInitial: true
        });
        this.watcher
            .on('add', (filePath) => this.handleFileChange('add', filePath, options))
            .on('change', (filePath) => this.handleFileChange('change', filePath, options))
            .on('unlink', (filePath) => this.handleFileChange('unlink', filePath, options))
            .on('error', (error) => {
            console.error(chalk_1.default.red(`❌ Watcher error: ${error.message}`));
        });
        console.log(chalk_1.default.green('✅ Real-time scanner started!'));
        console.log(chalk_1.default.gray('   Press Ctrl+C to stop'));
        // Keep the process running
        process.on('SIGINT', () => {
            this.stop();
            process.exit(0);
        });
    }
    async performInitialScan(projectPath) {
        console.log(chalk_1.default.blue('📊 Performing initial project scan...'));
        try {
            this.lastScanResult = await this.scanner.scanProject({
                projectPath,
                generateReport: false
            });
            this.displayScanSummary(this.lastScanResult);
        }
        catch (error) {
            console.error(chalk_1.default.red(`❌ Initial scan failed: ${error.message}`));
        }
    }
    async handleFileChange(type, filePath, options) {
        if (this.isScanning)
            return;
        // Debounce rapid changes
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        this.debounceTimeout = setTimeout(async () => {
            await this.analyzeFileChange(type, filePath, options);
        }, options.debounceMs || 1000);
    }
    async analyzeFileChange(type, filePath, options) {
        this.isScanning = true;
        try {
            const fullPath = path.join(options.projectPath, filePath);
            const event = {
                type,
                path: filePath,
                timestamp: new Date()
            };
            if (options.verboseLogging) {
                console.log(chalk_1.default.gray(`\n📝 File ${type}: ${filePath}`));
            }
            if (type === 'unlink') {
                await this.handleFileRemoval(filePath, options);
            }
            else {
                await this.handleFileAddOrChange(fullPath, filePath, event, options);
            }
        }
        catch (error) {
            console.error(chalk_1.default.red(`❌ Error analyzing ${filePath}: ${error.message}`));
        }
        finally {
            this.isScanning = false;
        }
    }
    async handleFileRemoval(filePath, options) {
        if (!this.lastScanResult)
            return;
        // Remove components from this file from last scan result
        const removedComponents = this.lastScanResult.components.filter(c => c.file === filePath);
        if (removedComponents.length > 0) {
            console.log(chalk_1.default.yellow(`\n📝 File removed: ${filePath}`));
            console.log(chalk_1.default.gray(`   Removed ${removedComponents.length} component(s)`));
            // Update scan result
            this.lastScanResult.components = this.lastScanResult.components.filter(c => c.file !== filePath);
            this.updateStatistics();
        }
    }
    async handleFileAddOrChange(fullPath, filePath, event, options) {
        try {
            // Analyze the specific file
            const fileComponents = await this.scanner.analyzeFile(fullPath, options.projectPath);
            if (fileComponents.length === 0) {
                return; // No Archbase components in this file
            }
            // Compare with previous scan if available
            const analysis = await this.compareWithPrevious(filePath, fileComponents);
            // Display results
            this.displayFileAnalysis(filePath, analysis, event, options);
            // Update last scan result
            if (this.lastScanResult) {
                // Remove old components from this file
                this.lastScanResult.components = this.lastScanResult.components.filter(c => c.file !== filePath);
                // Add new components
                this.lastScanResult.components.push(...fileComponents);
                this.updateStatistics();
            }
            // Auto-fix if enabled
            if (options.autoFix && analysis.newIssues > 0) {
                await this.performAutoFix(fileComponents, options);
            }
        }
        catch (error) {
            if (options.verboseLogging) {
                console.error(chalk_1.default.red(`   Error analyzing file: ${error.message}`));
            }
        }
    }
    async compareWithPrevious(filePath, newComponents) {
        const previousComponents = this.lastScanResult?.components.filter(c => c.file === filePath) || [];
        const previousIssueCount = previousComponents.reduce((sum, c) => sum + c.issues.length, 0);
        const newIssueCount = newComponents.reduce((sum, c) => sum + c.issues.length, 0);
        const newIssues = Math.max(0, newIssueCount - previousIssueCount);
        const fixedIssues = Math.max(0, previousIssueCount - newIssueCount);
        // Generate suggestions based on analysis
        const suggestions = this.generateSuggestions(newComponents);
        // Detect patterns
        const patterns = [...new Set(newComponents.flatMap(c => c.patterns))];
        return {
            file: filePath,
            components: newComponents,
            newIssues,
            fixedIssues,
            suggestions,
            patterns
        };
    }
    generateSuggestions(components) {
        const suggestions = [];
        // V1 to V2 migration suggestions
        const v1Components = components.filter(c => c.dataSourceVersion === 'v1');
        if (v1Components.length > 0) {
            suggestions.push(`Consider migrating ${v1Components.length} component(s) to DataSource V2`);
        }
        // Missing required props
        const componentsWithErrors = components.filter(c => c.issues.some(i => i.type === 'error'));
        if (componentsWithErrors.length > 0) {
            suggestions.push('Fix missing required props for better reliability');
        }
        // Pattern suggestions
        const formsWithoutValidation = components.filter(c => c.name === 'ArchbaseFormTemplate' &&
            !c.patterns.includes('validation-with-feedback'));
        if (formsWithoutValidation.length > 0) {
            suggestions.push('Add validation feedback to forms');
        }
        // Performance suggestions
        const componentCounts = new Map();
        components.forEach(c => {
            componentCounts.set(c.name, (componentCounts.get(c.name) || 0) + 1);
        });
        componentCounts.forEach((count, name) => {
            if (count > 5) {
                suggestions.push(`Consider extracting ${name} into a reusable component`);
            }
        });
        return suggestions;
    }
    displayFileAnalysis(filePath, analysis, event, options) {
        const timestamp = event.timestamp.toLocaleTimeString();
        console.log(chalk_1.default.blue(`\n📝 [${timestamp}] ${filePath}`));
        console.log(chalk_1.default.gray(`   Components: ${analysis.components.length}`));
        if (analysis.newIssues > 0) {
            console.log(chalk_1.default.red(`   New issues: ${analysis.newIssues}`));
        }
        if (analysis.fixedIssues > 0) {
            console.log(chalk_1.default.green(`   Fixed issues: ${analysis.fixedIssues}`));
        }
        if (analysis.patterns.length > 0) {
            console.log(chalk_1.default.cyan(`   Patterns: ${analysis.patterns.join(', ')}`));
        }
        // Show critical issues immediately
        const criticalIssues = analysis.components.flatMap(c => c.issues.filter(i => i.type === 'error'));
        if (criticalIssues.length > 0) {
            console.log(chalk_1.default.red(`   Critical issues:`));
            criticalIssues.slice(0, 3).forEach(issue => {
                console.log(chalk_1.default.red(`     ❌ ${issue.message}`));
            });
        }
        // Show suggestions
        if (analysis.suggestions.length > 0 && options.verboseLogging) {
            console.log(chalk_1.default.yellow(`   Suggestions:`));
            analysis.suggestions.slice(0, 2).forEach(suggestion => {
                console.log(chalk_1.default.yellow(`     💡 ${suggestion}`));
            });
        }
    }
    async performAutoFix(components, options) {
        // Create a mini scan result for auto-fix
        const miniResult = {
            components,
            statistics: {
                totalComponents: components.length,
                archbaseComponents: components.length,
                v1Components: components.filter(c => c.dataSourceVersion === 'v1').length,
                v2Components: components.filter(c => c.dataSourceVersion === 'v2').length,
                filesScanned: 1,
                issuesFound: components.reduce((sum, c) => sum + c.issues.length, 0)
            },
            patterns: { detected: [], missing: [], recommended: [] },
            migration: { v1ToV2Candidates: [], estimatedEffort: 'Low', recommendations: [] },
            dependencies: { missingDependencies: [], outdatedDependencies: [] }
        };
        const fixResult = await this.scanner.autoFix(miniResult, { dryRun: false });
        if (fixResult.fixed > 0) {
            console.log(chalk_1.default.green(`     🔧 Auto-fixed ${fixResult.fixed} issue(s)`));
        }
    }
    updateStatistics() {
        if (!this.lastScanResult)
            return;
        const components = this.lastScanResult.components;
        this.lastScanResult.statistics = {
            totalComponents: components.length,
            archbaseComponents: components.length,
            v1Components: components.filter(c => c.dataSourceVersion === 'v1').length,
            v2Components: components.filter(c => c.dataSourceVersion === 'v2').length,
            filesScanned: [...new Set(components.map(c => c.file))].length,
            issuesFound: components.reduce((sum, c) => sum + c.issues.length, 0)
        };
    }
    displayScanSummary(result) {
        console.log(chalk_1.default.cyan('\n📊 Initial Scan Summary:'));
        console.log(`   Files: ${result.statistics.filesScanned}`);
        console.log(`   Components: ${result.statistics.archbaseComponents}`);
        console.log(`   V2 Components: ${chalk_1.default.green(result.statistics.v2Components)}`);
        console.log(`   V1 Components: ${chalk_1.default.yellow(result.statistics.v1Components)}`);
        console.log(`   Issues: ${result.statistics.issuesFound}`);
        if (result.patterns.detected.length > 0) {
            console.log(`   Patterns: ${result.patterns.detected.join(', ')}`);
        }
    }
    stop() {
        if (this.watcher) {
            this.watcher.close();
            console.log(chalk_1.default.blue('\n👋 Real-time scanner stopped.'));
        }
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
    }
    /**
     * Get current scan statistics
     */
    getStats() {
        return this.lastScanResult?.statistics || null;
    }
    /**
     * Get components in specific file
     */
    getFileComponents(filePath) {
        if (!this.lastScanResult)
            return [];
        return this.lastScanResult.components.filter(c => c.file === filePath);
    }
    /**
     * Export current state for external use
     */
    exportState() {
        return this.lastScanResult;
    }
}
exports.RealtimeScanner = RealtimeScanner;
//# sourceMappingURL=RealtimeScanner.js.map