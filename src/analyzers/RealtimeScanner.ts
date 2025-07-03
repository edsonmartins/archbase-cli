/**
 * RealtimeScanner - Real-time component analysis and suggestions
 * 
 * Watches project files for changes and provides live feedback about:
 * - Component usage patterns
 * - Potential issues
 * - Optimization suggestions
 * - Migration opportunities
 */

import * as fs from 'fs-extra';
import * as path from 'path';
const chokidar = require('chokidar');
import chalk from 'chalk';
import { ProjectScanner, ComponentUsage, ProjectScanResult } from './ProjectScanner';

export interface RealtimeScanOptions {
  projectPath: string;
  watchPatterns?: string[];
  ignorePatterns?: string[];
  debounceMs?: number;
  enableNotifications?: boolean;
  autoFix?: boolean;
  verboseLogging?: boolean;
}

export interface FileChangeEvent {
  type: 'add' | 'change' | 'unlink';
  path: string;
  timestamp: Date;
}

export interface RealtimeAnalysis {
  file: string;
  components: ComponentUsage[];
  newIssues: number;
  fixedIssues: number;
  suggestions: string[];
  patterns: string[];
}

export class RealtimeScanner {
  private scanner: ProjectScanner;
  private watcher: any = null;
  private debounceTimeout: NodeJS.Timeout | null = null;
  private lastScanResult: ProjectScanResult | null = null;
  private isScanning = false;
  
  constructor() {
    this.scanner = new ProjectScanner();
  }

  async start(options: RealtimeScanOptions): Promise<void> {
    const {
      projectPath,
      watchPatterns = ['**/*.{ts,tsx,js,jsx}'],
      ignorePatterns = ['node_modules/**', 'dist/**', 'build/**', '.git/**'],
      debounceMs = 1000,
      verboseLogging = false
    } = options;

    console.log(chalk.blue('🔍 Starting real-time component scanner...'));
    console.log(chalk.gray(`   Project: ${projectPath}`));
    console.log(chalk.gray(`   Watching: ${watchPatterns.join(', ')}`));

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
      .on('add', (filePath: string) => this.handleFileChange('add', filePath, options))
      .on('change', (filePath: string) => this.handleFileChange('change', filePath, options))
      .on('unlink', (filePath: string) => this.handleFileChange('unlink', filePath, options))
      .on('error', (error: Error) => {
        console.error(chalk.red(`❌ Watcher error: ${error.message}`));
      });

    console.log(chalk.green('✅ Real-time scanner started!'));
    console.log(chalk.gray('   Press Ctrl+C to stop'));

    // Keep the process running
    process.on('SIGINT', () => {
      this.stop();
      process.exit(0);
    });
  }

  private async performInitialScan(projectPath: string): Promise<void> {
    console.log(chalk.blue('📊 Performing initial project scan...'));
    
    try {
      this.lastScanResult = await this.scanner.scanProject({
        projectPath,
        generateReport: false
      });

      this.displayScanSummary(this.lastScanResult);
    } catch (error) {
      console.error(chalk.red(`❌ Initial scan failed: ${error.message}`));
    }
  }

  private async handleFileChange(
    type: 'add' | 'change' | 'unlink',
    filePath: string,
    options: RealtimeScanOptions
  ): Promise<void> {
    if (this.isScanning) return;

    // Debounce rapid changes
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(async () => {
      await this.analyzeFileChange(type, filePath, options);
    }, options.debounceMs || 1000);
  }

  private async analyzeFileChange(
    type: 'add' | 'change' | 'unlink',
    filePath: string,
    options: RealtimeScanOptions
  ): Promise<void> {
    this.isScanning = true;

    try {
      const fullPath = path.join(options.projectPath, filePath);
      const event: FileChangeEvent = {
        type,
        path: filePath,
        timestamp: new Date()
      };

      if (options.verboseLogging) {
        console.log(chalk.gray(`\n📝 File ${type}: ${filePath}`));
      }

      if (type === 'unlink') {
        await this.handleFileRemoval(filePath, options);
      } else {
        await this.handleFileAddOrChange(fullPath, filePath, event, options);
      }

    } catch (error) {
      console.error(chalk.red(`❌ Error analyzing ${filePath}: ${error.message}`));
    } finally {
      this.isScanning = false;
    }
  }

  private async handleFileRemoval(filePath: string, options: RealtimeScanOptions): Promise<void> {
    if (!this.lastScanResult) return;

    // Remove components from this file from last scan result
    const removedComponents = this.lastScanResult.components.filter(c => 
      c.file === filePath
    );

    if (removedComponents.length > 0) {
      console.log(chalk.yellow(`\n📝 File removed: ${filePath}`));
      console.log(chalk.gray(`   Removed ${removedComponents.length} component(s)`));
      
      // Update scan result
      this.lastScanResult.components = this.lastScanResult.components.filter(c => 
        c.file !== filePath
      );
      
      this.updateStatistics();
    }
  }

  private async handleFileAddOrChange(
    fullPath: string,
    filePath: string,
    event: FileChangeEvent,
    options: RealtimeScanOptions
  ): Promise<void> {
    try {
      // Analyze the specific file
      const fileComponents = await (this.scanner as any).analyzeFile(fullPath, options.projectPath);
      
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
        this.lastScanResult.components = this.lastScanResult.components.filter(c => 
          c.file !== filePath
        );
        
        // Add new components
        this.lastScanResult.components.push(...fileComponents);
        
        this.updateStatistics();
      }

      // Auto-fix if enabled
      if (options.autoFix && analysis.newIssues > 0) {
        await this.performAutoFix(fileComponents, options);
      }

    } catch (error) {
      if (options.verboseLogging) {
        console.error(chalk.red(`   Error analyzing file: ${error.message}`));
      }
    }
  }

  private async compareWithPrevious(
    filePath: string,
    newComponents: ComponentUsage[]
  ): Promise<RealtimeAnalysis> {
    const previousComponents = this.lastScanResult?.components.filter(c => 
      c.file === filePath
    ) || [];

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

  private generateSuggestions(components: ComponentUsage[]): string[] {
    const suggestions: string[] = [];

    // V1 to V2 migration suggestions
    const v1Components = components.filter(c => c.dataSourceVersion === 'v1');
    if (v1Components.length > 0) {
      suggestions.push(`Consider migrating ${v1Components.length} component(s) to DataSource V2`);
    }

    // Missing required props
    const componentsWithErrors = components.filter(c => 
      c.issues.some(i => i.type === 'error')
    );
    if (componentsWithErrors.length > 0) {
      suggestions.push('Fix missing required props for better reliability');
    }

    // Pattern suggestions
    const formsWithoutValidation = components.filter(c => 
      c.name === 'ArchbaseFormTemplate' && 
      !c.patterns.includes('validation-with-feedback')
    );
    if (formsWithoutValidation.length > 0) {
      suggestions.push('Add validation feedback to forms');
    }

    // Performance suggestions
    const componentCounts = new Map<string, number>();
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

  private displayFileAnalysis(
    filePath: string,
    analysis: RealtimeAnalysis,
    event: FileChangeEvent,
    options: RealtimeScanOptions
  ): void {
    const timestamp = event.timestamp.toLocaleTimeString();
    
    console.log(chalk.blue(`\n📝 [${timestamp}] ${filePath}`));
    console.log(chalk.gray(`   Components: ${analysis.components.length}`));

    if (analysis.newIssues > 0) {
      console.log(chalk.red(`   New issues: ${analysis.newIssues}`));
    }

    if (analysis.fixedIssues > 0) {
      console.log(chalk.green(`   Fixed issues: ${analysis.fixedIssues}`));
    }

    if (analysis.patterns.length > 0) {
      console.log(chalk.cyan(`   Patterns: ${analysis.patterns.join(', ')}`));
    }

    // Show critical issues immediately
    const criticalIssues = analysis.components.flatMap(c => 
      c.issues.filter(i => i.type === 'error')
    );

    if (criticalIssues.length > 0) {
      console.log(chalk.red(`   Critical issues:`));
      criticalIssues.slice(0, 3).forEach(issue => {
        console.log(chalk.red(`     ❌ ${issue.message}`));
      });
    }

    // Show suggestions
    if (analysis.suggestions.length > 0 && options.verboseLogging) {
      console.log(chalk.yellow(`   Suggestions:`));
      analysis.suggestions.slice(0, 2).forEach(suggestion => {
        console.log(chalk.yellow(`     💡 ${suggestion}`));
      });
    }
  }

  private async performAutoFix(
    components: ComponentUsage[],
    options: RealtimeScanOptions
  ): Promise<void> {
    // Create a mini scan result for auto-fix
    const miniResult: ProjectScanResult = {
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
      console.log(chalk.green(`     🔧 Auto-fixed ${fixResult.fixed} issue(s)`));
    }
  }

  private updateStatistics(): void {
    if (!this.lastScanResult) return;

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

  private displayScanSummary(result: ProjectScanResult): void {
    console.log(chalk.cyan('\n📊 Initial Scan Summary:'));
    console.log(`   Files: ${result.statistics.filesScanned}`);
    console.log(`   Components: ${result.statistics.archbaseComponents}`);
    console.log(`   V2 Components: ${chalk.green(result.statistics.v2Components)}`);
    console.log(`   V1 Components: ${chalk.yellow(result.statistics.v1Components)}`);
    console.log(`   Issues: ${result.statistics.issuesFound}`);

    if (result.patterns.detected.length > 0) {
      console.log(`   Patterns: ${result.patterns.detected.join(', ')}`);
    }
  }

  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      console.log(chalk.blue('\n👋 Real-time scanner stopped.'));
    }

    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
  }

  /**
   * Get current scan statistics
   */
  getStats(): ProjectScanResult['statistics'] | null {
    return this.lastScanResult?.statistics || null;
  }

  /**
   * Get components in specific file
   */
  getFileComponents(filePath: string): ComponentUsage[] {
    if (!this.lastScanResult) return [];
    return this.lastScanResult.components.filter(c => c.file === filePath);
  }

  /**
   * Export current state for external use
   */
  exportState(): ProjectScanResult | null {
    return this.lastScanResult;
  }
}