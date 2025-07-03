/**
 * RemoteBoilerplateManager - Handles remote boilerplates from Git and npm
 *
 * This class manages downloading, caching, and processing remote boilerplates
 * from Git repositories and npm packages.
 */
export interface RemoteBoilerplateOptions {
    source: 'git' | 'npm';
    url: string;
    branch?: string;
    subfolder?: string;
    packageName?: string;
    version?: string;
    cache?: boolean;
}
export interface BoilerplateMetadata {
    name: string;
    version: string;
    description: string;
    author?: string;
    license?: string;
    archbaseVersion?: string;
    lastUpdated: Date;
    source: {
        type: 'git' | 'npm';
        url: string;
        branch?: string;
        subfolder?: string;
    };
}
export declare class RemoteBoilerplateManager {
    private cacheDir;
    constructor();
    private ensureCacheDir;
    /**
     * Download and extract a remote boilerplate
     */
    downloadBoilerplate(options: RemoteBoilerplateOptions): Promise<string>;
    /**
     * Download boilerplate from Git repository
     */
    private downloadFromGit;
    /**
     * Download boilerplate from npm package
     */
    private downloadFromNpm;
    /**
     * Validate Git URL format
     */
    private isValidGitUrl;
    /**
     * Validate boilerplate structure
     */
    private validateBoilerplateStructure;
    /**
     * Extract metadata from boilerplate
     */
    private extractMetadata;
    /**
     * Save metadata to cache
     */
    private saveMetadata;
    /**
     * Create cache key for boilerplate
     */
    private createCacheKey;
    /**
     * List cached boilerplates
     */
    listCached(): Promise<BoilerplateMetadata[]>;
    /**
     * Clear cache
     */
    clearCache(): Promise<void>;
    /**
     * Remove specific cached boilerplate
     */
    removeCached(cacheKey: string): Promise<void>;
    /**
     * Get cache size in bytes
     */
    getCacheSize(): Promise<number>;
    /**
     * Format cache size for display
     */
    formatCacheSize(bytes: number): string;
}
//# sourceMappingURL=RemoteBoilerplateManager.d.ts.map