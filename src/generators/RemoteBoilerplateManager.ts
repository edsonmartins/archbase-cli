/**
 * RemoteBoilerplateManager - Handles remote boilerplates from Git and npm
 * 
 * This class manages downloading, caching, and processing remote boilerplates
 * from Git repositories and npm packages.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';

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

export class RemoteBoilerplateManager {
  private cacheDir: string;
  
  constructor() {
    this.cacheDir = path.join(os.homedir(), '.archbase', 'boilerplates-cache');
    this.ensureCacheDir();
  }
  
  private ensureCacheDir(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }
  
  /**
   * Download and extract a remote boilerplate
   */
  async downloadBoilerplate(options: RemoteBoilerplateOptions): Promise<string> {
    const spinner = ora('Downloading remote boilerplate...').start();
    
    try {
      if (options.source === 'git') {
        return await this.downloadFromGit(options, spinner);
      } else {
        return await this.downloadFromNpm(options, spinner);
      }
    } catch (error) {
      spinner.fail('Failed to download boilerplate');
      throw error;
    } finally {
      spinner.stop();
    }
  }
  
  /**
   * Download boilerplate from Git repository
   */
  private async downloadFromGit(options: RemoteBoilerplateOptions, spinner: ora.Ora): Promise<string> {
    const { url, branch = 'main', subfolder } = options;
    
    // Create cache key
    const cacheKey = this.createCacheKey('git', url, branch, subfolder);
    const cachePath = path.join(this.cacheDir, cacheKey);
    
    // Check if already cached
    if (options.cache !== false && fs.existsSync(cachePath)) {
      spinner.text = 'Using cached boilerplate...';
      return cachePath;
    }
    
    // Validate Git URL
    if (!this.isValidGitUrl(url)) {
      throw new Error(`Invalid Git URL: ${url}`);
    }
    
    spinner.text = `Cloning from ${url}...`;
    
    // Create temporary directory
    const tempDir = path.join(os.tmpdir(), `archbase-git-${Date.now()}`);
    
    try {
      // Clone repository
      const cloneOptions = [
        '--depth=1', // Shallow clone
        '--single-branch',
        `--branch=${branch}`,
        url,
        tempDir
      ];
      
      execSync(`git clone ${cloneOptions.join(' ')}`, {
        stdio: 'pipe',
        timeout: 60000 // 1 minute timeout
      });
      
      // Determine source path
      let sourcePath = tempDir;
      if (subfolder) {
        sourcePath = path.join(tempDir, subfolder);
        if (!fs.existsSync(sourcePath)) {
          throw new Error(`Subfolder "${subfolder}" not found in repository`);
        }
      }
      
      // Validate boilerplate structure
      await this.validateBoilerplateStructure(sourcePath);
      
      // Copy to cache if caching is enabled
      if (options.cache !== false) {
        spinner.text = 'Caching boilerplate...';
        await fs.copy(sourcePath, cachePath);
        
        // Save metadata
        const metadata = await this.extractMetadata(sourcePath, {
          type: 'git',
          url,
          branch,
          subfolder
        });
        await this.saveMetadata(cachePath, metadata);
        
        return cachePath;
      }
      
      return sourcePath;
      
    } catch (error) {
      // Cleanup temp directory
      if (fs.existsSync(tempDir)) {
        fs.removeSync(tempDir);
      }
      throw error;
    }
  }
  
  /**
   * Download boilerplate from npm package
   */
  private async downloadFromNpm(options: RemoteBoilerplateOptions, spinner: ora.Ora): Promise<string> {
    const { packageName, version = 'latest', subfolder } = options;
    
    if (!packageName) {
      throw new Error('Package name is required for npm source');
    }
    
    // Create cache key
    const cacheKey = this.createCacheKey('npm', packageName, version, subfolder);
    const cachePath = path.join(this.cacheDir, cacheKey);
    
    // Check if already cached
    if (options.cache !== false && fs.existsSync(cachePath)) {
      spinner.text = 'Using cached boilerplate...';
      return cachePath;
    }
    
    spinner.text = `Downloading ${packageName}@${version}...`;
    
    // Create temporary directory
    const tempDir = path.join(os.tmpdir(), `archbase-npm-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    
    try {
      // Download package using npm pack
      const packageSpec = version === 'latest' ? packageName : `${packageName}@${version}`;
      
      execSync(`npm pack ${packageSpec}`, {
        cwd: tempDir,
        stdio: 'pipe',
        timeout: 60000
      });
      
      // Find the downloaded tarball
      const files = fs.readdirSync(tempDir);
      const tarball = files.find(file => file.endsWith('.tgz'));
      
      if (!tarball) {
        throw new Error('Failed to download npm package');
      }
      
      // Extract tarball
      const extractDir = path.join(tempDir, 'extracted');
      execSync(`tar -xzf "${tarball}" -C "${tempDir}"`, { stdio: 'pipe' });
      
      // npm pack creates a "package" directory
      let sourcePath = path.join(tempDir, 'package');
      
      if (subfolder) {
        sourcePath = path.join(sourcePath, subfolder);
        if (!fs.existsSync(sourcePath)) {
          throw new Error(`Subfolder "${subfolder}" not found in package`);
        }
      }
      
      // Validate boilerplate structure
      await this.validateBoilerplateStructure(sourcePath);
      
      // Copy to cache if caching is enabled
      if (options.cache !== false) {
        spinner.text = 'Caching boilerplate...';
        await fs.copy(sourcePath, cachePath);
        
        // Save metadata
        const metadata = await this.extractMetadata(sourcePath, {
          type: 'npm',
          url: packageName,
          subfolder
        });
        await this.saveMetadata(cachePath, metadata);
        
        return cachePath;
      }
      
      return sourcePath;
      
    } catch (error) {
      // Cleanup temp directory
      if (fs.existsSync(tempDir)) {
        fs.removeSync(tempDir);
      }
      throw error;
    }
  }
  
  /**
   * Validate Git URL format
   */
  private isValidGitUrl(url: string): boolean {
    const gitUrlPatterns = [
      /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\.git$/,
      /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+$/,
      /^git@github\.com:[\w\-\.]+\/[\w\-\.]+\.git$/,
      /^https:\/\/gitlab\.com\/[\w\-\.\/]+\.git$/,
      /^https:\/\/gitlab\.com\/[\w\-\.\/]+$/,
      /^https:\/\/bitbucket\.org\/[\w\-\.]+\/[\w\-\.]+\.git$/,
      /^https:\/\/[\w\-\.]+\.git$/
    ];
    
    return gitUrlPatterns.some(pattern => pattern.test(url));
  }
  
  /**
   * Validate boilerplate structure
   */
  private async validateBoilerplateStructure(boilerplatePath: string): Promise<void> {
    // Check for required files/directories
    const requiredPaths = [
      'package.json', // At minimum, should have package.json
    ];
    
    const optionalPaths = [
      'archbase.config.json',
      'template/',
      'hooks/',
      '.archbase/',
      'README.md'
    ];
    
    // Check required files
    for (const reqPath of requiredPaths) {
      const fullPath = path.join(boilerplatePath, reqPath);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Invalid boilerplate: missing required ${reqPath}`);
      }
    }
    
    // Validate package.json structure
    try {
      const packageJsonPath = path.join(boilerplatePath, 'package.json');
      const packageJson = await fs.readJson(packageJsonPath);
      
      if (!packageJson.name) {
        throw new Error('Invalid boilerplate: package.json must have a name field');
      }
      
      // Check if it's marked as an Archbase boilerplate
      const isArchbaseBoilerplate = 
        packageJson.keywords?.includes('archbase-boilerplate') ||
        packageJson.archbase ||
        fs.existsSync(path.join(boilerplatePath, 'archbase.config.json'));
      
      if (!isArchbaseBoilerplate) {
        console.warn(chalk.yellow('⚠️  This package is not marked as an Archbase boilerplate. Proceeding anyway...'));
      }
      
    } catch (error) {
      throw new Error(`Invalid package.json: ${error.message}`);
    }
  }
  
  /**
   * Extract metadata from boilerplate
   */
  private async extractMetadata(boilerplatePath: string, source: any): Promise<BoilerplateMetadata> {
    try {
      // Try to read archbase.config.json first
      const archbaseConfigPath = path.join(boilerplatePath, 'archbase.config.json');
      if (fs.existsSync(archbaseConfigPath)) {
        const config = await fs.readJson(archbaseConfigPath);
        return {
          name: config.name,
          version: config.version || '1.0.0',
          description: config.description || '',
          author: config.author,
          license: config.license,
          archbaseVersion: config.archbaseVersion,
          lastUpdated: new Date(),
          source
        };
      }
      
      // Fallback to package.json
      const packageJsonPath = path.join(boilerplatePath, 'package.json');
      const packageJson = await fs.readJson(packageJsonPath);
      
      return {
        name: packageJson.name,
        version: packageJson.version || '1.0.0',
        description: packageJson.description || '',
        author: packageJson.author,
        license: packageJson.license,
        archbaseVersion: packageJson.archbase?.version,
        lastUpdated: new Date(),
        source
      };
      
    } catch (error) {
      // Return minimal metadata if extraction fails
      return {
        name: 'unknown',
        version: '1.0.0',
        description: 'Remote boilerplate',
        lastUpdated: new Date(),
        source
      };
    }
  }
  
  /**
   * Save metadata to cache
   */
  private async saveMetadata(cachePath: string, metadata: BoilerplateMetadata): Promise<void> {
    const metadataPath = path.join(cachePath, '.archbase-metadata.json');
    await fs.writeJson(metadataPath, metadata, { spaces: 2 });
  }
  
  /**
   * Create cache key for boilerplate
   */
  private createCacheKey(type: string, url: string, version?: string, subfolder?: string): string {
    const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9\-_]/g, '-');
    
    let key = `${type}-${sanitize(url)}`;
    
    if (version) {
      key += `-${sanitize(version)}`;
    }
    
    if (subfolder) {
      key += `-${sanitize(subfolder)}`;
    }
    
    // Limit key length
    if (key.length > 100) {
      const hash = require('crypto').createHash('md5').update(key).digest('hex').substring(0, 8);
      key = key.substring(0, 90) + '-' + hash;
    }
    
    return key;
  }
  
  /**
   * List cached boilerplates
   */
  async listCached(): Promise<BoilerplateMetadata[]> {
    const cached: BoilerplateMetadata[] = [];
    
    if (!fs.existsSync(this.cacheDir)) {
      return cached;
    }
    
    const entries = fs.readdirSync(this.cacheDir);
    
    for (const entry of entries) {
      const entryPath = path.join(this.cacheDir, entry);
      const metadataPath = path.join(entryPath, '.archbase-metadata.json');
      
      if (fs.existsSync(metadataPath)) {
        try {
          const metadata = await fs.readJson(metadataPath);
          cached.push(metadata);
        } catch (error) {
          // Skip invalid metadata
          continue;
        }
      }
    }
    
    return cached.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
  }
  
  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    if (fs.existsSync(this.cacheDir)) {
      fs.removeSync(this.cacheDir);
      this.ensureCacheDir();
    }
  }
  
  /**
   * Remove specific cached boilerplate
   */
  async removeCached(cacheKey: string): Promise<void> {
    const cachePath = path.join(this.cacheDir, cacheKey);
    if (fs.existsSync(cachePath)) {
      fs.removeSync(cachePath);
    }
  }
  
  /**
   * Get cache size in bytes
   */
  async getCacheSize(): Promise<number> {
    if (!fs.existsSync(this.cacheDir)) {
      return 0;
    }
    
    let totalSize = 0;
    
    const calculateSize = (dirPath: string): void => {
      const entries = fs.readdirSync(dirPath);
      
      for (const entry of entries) {
        const entryPath = path.join(dirPath, entry);
        const stats = fs.statSync(entryPath);
        
        if (stats.isDirectory()) {
          calculateSize(entryPath);
        } else {
          totalSize += stats.size;
        }
      }
    };
    
    calculateSize(this.cacheDir);
    return totalSize;
  }
  
  /**
   * Format cache size for display
   */
  formatCacheSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}