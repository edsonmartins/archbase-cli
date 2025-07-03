/**
 * RealtimeScanner - Real-time component analysis and suggestions
 *
 * Watches project files for changes and provides live feedback about:
 * - Component usage patterns
 * - Potential issues
 * - Optimization suggestions
 * - Migration opportunities
 */
import { ComponentUsage, ProjectScanResult } from './ProjectScanner';
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
export declare class RealtimeScanner {
    private scanner;
    private watcher;
    private debounceTimeout;
    private lastScanResult;
    private isScanning;
    constructor();
    start(options: RealtimeScanOptions): Promise<void>;
    private performInitialScan;
    private handleFileChange;
    private analyzeFileChange;
    private handleFileRemoval;
    private handleFileAddOrChange;
    private compareWithPrevious;
    private generateSuggestions;
    private displayFileAnalysis;
    private performAutoFix;
    private updateStatistics;
    private displayScanSummary;
    stop(): void;
    /**
     * Get current scan statistics
     */
    getStats(): ProjectScanResult['statistics'] | null;
    /**
     * Get components in specific file
     */
    getFileComponents(filePath: string): ComponentUsage[];
    /**
     * Export current state for external use
     */
    exportState(): ProjectScanResult | null;
}
//# sourceMappingURL=RealtimeScanner.d.ts.map