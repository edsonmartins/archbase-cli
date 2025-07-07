#!/usr/bin/env node

/**
 * Copy Assets Script
 * 
 * Copies non-TypeScript files (boilerplates, templates, configs) to dist/
 * This ensures that built CLI has access to all necessary assets
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

async function copyAssets() {
  console.log(chalk.blue('📦 Copying assets to dist/...'));
  
  try {
    // Define source and destination paths
    const srcDir = path.join(__dirname, '../src');
    const distDir = path.join(__dirname, '../dist');
    
    // Ensure dist directory exists
    await fs.ensureDir(distDir);
    
    // Copy boilerplates (configs, templates, hooks)
    const boilerplatesSource = path.join(srcDir, 'boilerplates');
    const boilerplatesTarget = path.join(distDir, 'boilerplates');
    
    if (await fs.pathExists(boilerplatesSource)) {
      await fs.copy(boilerplatesSource, boilerplatesTarget);
      console.log(chalk.green('  ✅ Boilerplates copied'));
    }
    
    // Copy templates directory (handlebars templates)
    const templatesSource = path.join(srcDir, 'templates');
    const templatesTarget = path.join(distDir, 'templates');
    
    if (await fs.pathExists(templatesSource)) {
      await fs.copy(templatesSource, templatesTarget);
      console.log(chalk.green('  ✅ Templates copied'));
    }
    
    // Copy any JSON configuration files
    const copyJsonFiles = async (sourceDir, targetDir) => {
      if (await fs.pathExists(sourceDir)) {
        const files = await fs.readdir(sourceDir, { withFileTypes: true });
        
        for (const file of files) {
          const sourcePath = path.join(sourceDir, file.name);
          const targetPath = path.join(targetDir, file.name);
          
          if (file.isDirectory()) {
            await copyJsonFiles(sourcePath, targetPath);
          } else if (file.name.endsWith('.json') || file.name.endsWith('.hbs')) {
            await fs.ensureDir(path.dirname(targetPath));
            await fs.copy(sourcePath, targetPath);
          }
        }
      }
    };
    
    // Copy additional config files from root src
    await copyJsonFiles(srcDir, distDir);
    
    console.log(chalk.green('✅ All assets copied successfully!'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error copying assets:'), error.message);
    process.exit(1);
  }
}

// Run the copy operation
copyAssets();