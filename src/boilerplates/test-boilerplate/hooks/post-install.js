#!/usr/bin/env node

/**
 * Post-install hook for test-boilerplate
 * 
 * This script runs after project creation to set up the project.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up test-boilerplate...');

async function setup() {
  try {
    // Access configuration from environment variables
    const projectName = process.env.PROJECT_NAME;
    const projectPath = process.env.PROJECT_PATH;
    const answers = JSON.parse(process.env.ARCHBASE_ANSWERS || '{}');

    console.log(`📁 Project: ${projectName}`);
    console.log(`📍 Path: ${projectPath}`);

    // Example: Install dependencies if requested
    if (answers.installDependencies !== false) {
      console.log('📦 Installing dependencies...');
      execSync('npm install', { cwd: projectPath, stdio: 'inherit' });
    }

    // Example: Initialize Git if requested
    if (answers.useGit !== false) {
      console.log('🔧 Initializing Git repository...');
      execSync('git init', { cwd: projectPath });
      execSync('git add .', { cwd: projectPath });
      execSync('git commit -m "Initial commit from test-boilerplate"', { cwd: projectPath });
    }

    console.log('✅ Setup completed successfully!');
    console.log('');
    console.log('🎯 Next steps:');
    console.log(`  cd ${projectName}`);
    console.log('  npm run dev');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setup();
