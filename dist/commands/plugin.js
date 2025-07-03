"use strict";
/**
 * Plugin Command - Manage Archbase CLI plugins
 *
 * Examples:
 * archbase plugin list
 * archbase plugin install archbase-cli-plugin-swagger
 * archbase plugin enable my-plugin
 * archbase plugin create my-custom-plugin
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
exports.pluginCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const PluginManager_1 = require("../core/PluginManager");
exports.pluginCommand = new commander_1.Command('plugin')
    .description('Manage Archbase CLI plugins')
    .addCommand(new commander_1.Command('list')
    .description('List available and installed plugins')
    .option('--installed', 'Show only installed plugins')
    .option('--available', 'Show available plugins from registry')
    .option('--format <fmt>', 'Output format (table|json)', 'table')
    .action(async (options) => {
    const spinner = (0, ora_1.default)('Discovering plugins...').start();
    try {
        const pluginManager = new PluginManager_1.PluginManager('0.1.0', process.cwd());
        const discovery = await pluginManager.discoverPlugins();
        spinner.succeed('✅ Plugin discovery completed!');
        if (options.format === 'json') {
            console.log(JSON.stringify(discovery.found, null, 2));
            return;
        }
        console.log(chalk_1.default.cyan('\n📦 Available Plugins:'));
        if (discovery.found.length === 0) {
            console.log(chalk_1.default.yellow('No plugins found.'));
            console.log(chalk_1.default.gray('Install plugins with: archbase plugin install <plugin-name>'));
            return;
        }
        // Group by status
        const installed = discovery.found.filter(p => p.isValid);
        const invalid = discovery.found.filter(p => !p.isValid);
        if (installed.length > 0) {
            console.log(chalk_1.default.green(`\n✅ Installed Plugins (${installed.length}):`));
            installed.forEach(plugin => {
                console.log(`   ${chalk_1.default.cyan(plugin.name)} ${chalk_1.default.gray(`v${plugin.metadata.version}`)}`);
                console.log(`     ${plugin.metadata.description || 'No description'}`);
                console.log(`     ${chalk_1.default.gray(`Path: ${plugin.path}`)}`);
                if (plugin.metadata.author) {
                    console.log(`     ${chalk_1.default.gray(`Author: ${plugin.metadata.author}`)}`);
                }
            });
        }
        if (invalid.length > 0) {
            console.log(chalk_1.default.red(`\n❌ Invalid Plugins (${invalid.length}):`));
            invalid.forEach(plugin => {
                console.log(`   ${chalk_1.default.red(plugin.name)}`);
                console.log(`     ${chalk_1.default.red(plugin.validationErrors.join(', '))}`);
                console.log(`     ${chalk_1.default.gray(`Path: ${plugin.path}`)}`);
            });
        }
        if (discovery.errors.length > 0) {
            console.log(chalk_1.default.yellow(`\n⚠️  Discovery Errors (${discovery.errors.length}):`));
            discovery.errors.forEach(error => {
                console.log(`   ${chalk_1.default.yellow(error.path)}: ${error.error}`);
            });
        }
    }
    catch (error) {
        spinner.fail(chalk_1.default.red(`❌ Plugin discovery failed: ${error.message}`));
        process.exit(1);
    }
}))
    .addCommand(new commander_1.Command('install')
    .description('Install a plugin from npm or local path')
    .argument('<plugin>', 'Plugin name or path')
    .option('--global', 'Install globally')
    .option('--dev', 'Install as dev dependency')
    .option('--local', 'Install in .archbase/plugins directory')
    .action(async (pluginName, options) => {
    const spinner = (0, ora_1.default)(`Installing plugin: ${pluginName}...`).start();
    try {
        let installCommand;
        if (options.local) {
            // Install in local .archbase/plugins directory
            const localPluginsDir = path.join(process.cwd(), '.archbase', 'plugins');
            await fs.ensureDir(localPluginsDir);
            if (fs.existsSync(pluginName)) {
                // Local path
                const targetPath = path.join(localPluginsDir, path.basename(pluginName));
                await fs.copy(pluginName, targetPath);
                spinner.succeed(`✅ Plugin installed locally: ${targetPath}`);
            }
            else {
                spinner.fail('❌ Local installation requires a valid path');
                process.exit(1);
            }
        }
        else {
            // Install via npm
            const { spawn } = require('child_process');
            if (options.global) {
                installCommand = ['npm', 'install', '-g', pluginName];
            }
            else {
                installCommand = ['npm', 'install', options.dev ? '--save-dev' : '--save', pluginName];
            }
            await new Promise((resolve, reject) => {
                const proc = spawn(installCommand[0], installCommand.slice(1), {
                    stdio: 'pipe',
                    cwd: process.cwd()
                });
                let output = '';
                let errorOutput = '';
                proc.stdout.on('data', (data) => {
                    output += data.toString();
                });
                proc.stderr.on('data', (data) => {
                    errorOutput += data.toString();
                });
                proc.on('close', (code) => {
                    if (code === 0) {
                        resolve();
                    }
                    else {
                        reject(new Error(`npm install failed: ${errorOutput}`));
                    }
                });
            });
            spinner.succeed(`✅ Plugin installed: ${pluginName}`);
        }
        // Verify installation
        console.log(chalk_1.default.blue('\n🔍 Verifying installation...'));
        const pluginManager = new PluginManager_1.PluginManager('0.1.0', process.cwd());
        const discovery = await pluginManager.discoverPlugins();
        const installedPlugin = discovery.found.find(p => p.name === pluginName || p.name.endsWith(pluginName));
        if (installedPlugin) {
            console.log(chalk_1.default.green(`✅ Plugin verified: ${installedPlugin.name}@${installedPlugin.metadata.version}`));
            if (!installedPlugin.isValid) {
                console.log(chalk_1.default.yellow('⚠️  Plugin has validation issues:'));
                installedPlugin.validationErrors.forEach(error => {
                    console.log(`   ${chalk_1.default.red(error)}`);
                });
            }
        }
        else {
            console.log(chalk_1.default.yellow('⚠️  Plugin installed but not discoverable'));
        }
    }
    catch (error) {
        spinner.fail(chalk_1.default.red(`❌ Plugin installation failed: ${error.message}`));
        process.exit(1);
    }
}))
    .addCommand(new commander_1.Command('uninstall')
    .description('Uninstall a plugin')
    .argument('<plugin>', 'Plugin name')
    .option('--global', 'Uninstall from global')
    .action(async (pluginName, options) => {
    const spinner = (0, ora_1.default)(`Uninstalling plugin: ${pluginName}...`).start();
    try {
        // First, find the plugin
        const pluginManager = new PluginManager_1.PluginManager('0.1.0', process.cwd());
        const discovery = await pluginManager.discoverPlugins();
        const plugin = discovery.found.find(p => p.name === pluginName || p.name.endsWith(pluginName));
        if (!plugin) {
            spinner.fail(`❌ Plugin not found: ${pluginName}`);
            process.exit(1);
        }
        // Check if it's a local plugin
        if (plugin.path.includes('.archbase/plugins')) {
            await fs.remove(plugin.path);
            spinner.succeed(`✅ Local plugin uninstalled: ${pluginName}`);
        }
        else {
            // Uninstall via npm
            const { spawn } = require('child_process');
            const uninstallCommand = options.global
                ? ['npm', 'uninstall', '-g', plugin.name]
                : ['npm', 'uninstall', plugin.name];
            await new Promise((resolve, reject) => {
                const proc = spawn(uninstallCommand[0], uninstallCommand.slice(1), {
                    stdio: 'pipe',
                    cwd: process.cwd()
                });
                proc.on('close', (code) => {
                    if (code === 0) {
                        resolve();
                    }
                    else {
                        reject(new Error('npm uninstall failed'));
                    }
                });
            });
            spinner.succeed(`✅ Plugin uninstalled: ${pluginName}`);
        }
    }
    catch (error) {
        spinner.fail(chalk_1.default.red(`❌ Plugin uninstall failed: ${error.message}`));
        process.exit(1);
    }
}))
    .addCommand(new commander_1.Command('enable')
    .description('Enable a plugin')
    .argument('<plugin>', 'Plugin name')
    .action(async (pluginName) => {
    try {
        const pluginManager = new PluginManager_1.PluginManager('0.1.0', process.cwd());
        await pluginManager.setPluginEnabled(pluginName, true);
        console.log(chalk_1.default.green(`✅ Plugin enabled: ${pluginName}`));
        console.log(chalk_1.default.gray('Restart CLI to apply changes'));
    }
    catch (error) {
        console.error(chalk_1.default.red(`❌ Failed to enable plugin: ${error.message}`));
        process.exit(1);
    }
}))
    .addCommand(new commander_1.Command('disable')
    .description('Disable a plugin')
    .argument('<plugin>', 'Plugin name')
    .action(async (pluginName) => {
    try {
        const pluginManager = new PluginManager_1.PluginManager('0.1.0', process.cwd());
        await pluginManager.setPluginEnabled(pluginName, false);
        console.log(chalk_1.default.yellow(`⏸️  Plugin disabled: ${pluginName}`));
        console.log(chalk_1.default.gray('Restart CLI to apply changes'));
    }
    catch (error) {
        console.error(chalk_1.default.red(`❌ Failed to disable plugin: ${error.message}`));
        process.exit(1);
    }
}))
    .addCommand(new commander_1.Command('config')
    .description('Configure a plugin')
    .argument('<plugin>', 'Plugin name')
    .option('--set <key=value>', 'Set configuration value')
    .option('--get <key>', 'Get configuration value')
    .option('--list', 'List all configuration')
    .action(async (pluginName, options) => {
    try {
        const pluginManager = new PluginManager_1.PluginManager('0.1.0', process.cwd());
        if (options.set) {
            const [key, value] = options.set.split('=');
            if (!key || value === undefined) {
                console.error(chalk_1.default.red('❌ Invalid format. Use: --set key=value'));
                process.exit(1);
            }
            // Parse value as JSON if possible
            let parsedValue = value;
            try {
                parsedValue = JSON.parse(value);
            }
            catch {
                // Keep as string
            }
            const currentConfig = pluginManager.config[pluginName]?.config || {};
            currentConfig[key] = parsedValue;
            await pluginManager.setPluginConfig(pluginName, currentConfig);
            console.log(chalk_1.default.green(`✅ Configuration updated: ${key} = ${value}`));
        }
        else if (options.get) {
            const config = pluginManager.config[pluginName]?.config || {};
            const value = config[options.get];
            if (value !== undefined) {
                console.log(JSON.stringify(value, null, 2));
            }
            else {
                console.log(chalk_1.default.yellow(`Configuration key not found: ${options.get}`));
            }
        }
        else if (options.list) {
            const config = pluginManager.config[pluginName]?.config || {};
            console.log(JSON.stringify(config, null, 2));
        }
        else {
            console.error(chalk_1.default.red('❌ Specify --set, --get, or --list'));
            process.exit(1);
        }
    }
    catch (error) {
        console.error(chalk_1.default.red(`❌ Plugin configuration failed: ${error.message}`));
        process.exit(1);
    }
}))
    .addCommand(new commander_1.Command('create')
    .description('Create a new plugin template')
    .argument('<name>', 'Plugin name (without archbase-cli-plugin- prefix)')
    .option('--template <type>', 'Plugin template type', 'basic')
    .option('--output <path>', 'Output directory', '.')
    .action(async (name, options) => {
    const spinner = (0, ora_1.default)('Creating plugin template...').start();
    try {
        const pluginName = name.startsWith('archbase-cli-plugin-')
            ? name
            : `archbase-cli-plugin-${name}`;
        const outputPath = path.join(options.output, pluginName);
        if (await fs.pathExists(outputPath)) {
            spinner.fail(`❌ Directory already exists: ${outputPath}`);
            process.exit(1);
        }
        await fs.ensureDir(outputPath);
        // Create plugin template based on type
        switch (options.template) {
            case 'basic':
                await createBasicPluginTemplate(outputPath, pluginName);
                break;
            case 'generator':
                await createGeneratorPluginTemplate(outputPath, pluginName);
                break;
            case 'analyzer':
                await createAnalyzerPluginTemplate(outputPath, pluginName);
                break;
            case 'command':
                await createCommandPluginTemplate(outputPath, pluginName);
                break;
            default:
                throw new Error(`Unknown template type: ${options.template}`);
        }
        spinner.succeed(`✅ Plugin template created: ${outputPath}`);
        console.log(chalk_1.default.cyan('\n📋 Next Steps:'));
        console.log(`   1. cd ${pluginName}`);
        console.log('   2. npm install');
        console.log('   3. npm run build');
        console.log('   4. archbase plugin install .');
        console.log(chalk_1.default.blue('\n📚 Documentation:'));
        console.log('   - Edit src/index.ts to implement your plugin');
        console.log('   - Update package.json metadata');
        console.log('   - Add tests in test/ directory');
    }
    catch (error) {
        spinner.fail(chalk_1.default.red(`❌ Plugin creation failed: ${error.message}`));
        process.exit(1);
    }
}))
    .addCommand(new commander_1.Command('info')
    .description('Show detailed information about a plugin')
    .argument('<plugin>', 'Plugin name')
    .action(async (pluginName) => {
    try {
        const pluginManager = new PluginManager_1.PluginManager('0.1.0', process.cwd());
        const discovery = await pluginManager.discoverPlugins();
        const plugin = discovery.found.find(p => p.name === pluginName || p.name.endsWith(pluginName));
        if (!plugin) {
            console.error(chalk_1.default.red(`❌ Plugin not found: ${pluginName}`));
            process.exit(1);
        }
        console.log(chalk_1.default.cyan(`\n📦 ${plugin.name}`));
        console.log(`Version: ${plugin.metadata.version}`);
        console.log(`Description: ${plugin.metadata.description || 'No description'}`);
        if (plugin.metadata.author) {
            console.log(`Author: ${plugin.metadata.author}`);
        }
        if (plugin.metadata.homepage) {
            console.log(`Homepage: ${plugin.metadata.homepage}`);
        }
        console.log(`Path: ${plugin.path}`);
        console.log(`Valid: ${plugin.isValid ? '✅' : '❌'}`);
        if (!plugin.isValid) {
            console.log(chalk_1.default.red('\n❌ Validation Errors:'));
            plugin.validationErrors.forEach(error => {
                console.log(`   ${error}`);
            });
        }
        if (plugin.metadata.keywords && plugin.metadata.keywords.length > 0) {
            console.log(`\nKeywords: ${plugin.metadata.keywords.join(', ')}`);
        }
        if (plugin.metadata.engines) {
            console.log('\nEngine Requirements:');
            Object.entries(plugin.metadata.engines).forEach(([engine, version]) => {
                console.log(`   ${engine}: ${version}`);
            });
        }
        // Show package.json dependencies
        if (plugin.packageJson.dependencies) {
            console.log('\nDependencies:');
            Object.entries(plugin.packageJson.dependencies).forEach(([dep, version]) => {
                console.log(`   ${dep}: ${version}`);
            });
        }
    }
    catch (error) {
        console.error(chalk_1.default.red(`❌ Failed to get plugin info: ${error.message}`));
        process.exit(1);
    }
}));
// Template creation functions
async function createBasicPluginTemplate(outputPath, pluginName) {
    const packageJson = {
        name: pluginName,
        version: '1.0.0',
        description: 'A basic Archbase CLI plugin',
        main: 'dist/index.js',
        types: 'dist/index.d.ts',
        scripts: {
            build: 'tsc',
            dev: 'tsc --watch',
            test: 'jest'
        },
        keywords: ['archbase', 'cli', 'plugin'],
        author: '',
        license: 'MIT',
        archbaseCliVersion: '^0.1.0',
        devDependencies: {
            '@archbase/cli': '^0.1.0',
            'typescript': '^5.0.0',
            '@types/node': '^20.0.0',
            'jest': '^29.0.0',
            '@types/jest': '^29.0.0'
        }
    };
    const indexTs = `import { Plugin, PluginContext } from '@archbase/cli';

export default function createPlugin(): Plugin {
  return {
    metadata: {
      name: '${pluginName}',
      version: '1.0.0',
      description: 'A basic Archbase CLI plugin'
    },

    async activate(context: PluginContext): Promise<void> {
      context.logger.info('${pluginName} activated!');
      
      // Register your generators, commands, analyzers here
      // Example:
      // context.registerGenerator('my-generator', new MyGenerator());
      // context.registerCommand(new MyCommand());
    },

    async deactivate(): Promise<void> {
      // Cleanup resources if needed
    }
  };
}`;
    const tsConfig = {
        compilerOptions: {
            target: 'ES2020',
            module: 'commonjs',
            outDir: './dist',
            rootDir: './src',
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
            declaration: true
        },
        include: ['src/**/*'],
        exclude: ['node_modules', 'dist', 'test']
    };
    const readme = `# ${pluginName}

A basic Archbase CLI plugin.

## Installation

\`\`\`bash
npm install ${pluginName}
\`\`\`

## Usage

The plugin is automatically loaded when installed.

## Development

\`\`\`bash
npm install
npm run build
\`\`\`

## Testing

\`\`\`bash
npm test
\`\`\`
`;
    await fs.writeJson(path.join(outputPath, 'package.json'), packageJson, { spaces: 2 });
    await fs.writeJson(path.join(outputPath, 'tsconfig.json'), tsConfig, { spaces: 2 });
    await fs.writeFile(path.join(outputPath, 'README.md'), readme);
    await fs.ensureDir(path.join(outputPath, 'src'));
    await fs.writeFile(path.join(outputPath, 'src/index.ts'), indexTs);
    await fs.ensureDir(path.join(outputPath, 'test'));
    await fs.writeFile(path.join(outputPath, 'test/index.test.ts'), `
import createPlugin from '../src/index';

describe('${pluginName}', () => {
  it('should create plugin', () => {
    const plugin = createPlugin();
    expect(plugin).toBeDefined();
    expect(plugin.metadata.name).toBe('${pluginName}');
  });
});
`);
}
async function createGeneratorPluginTemplate(outputPath, pluginName) {
    await createBasicPluginTemplate(outputPath, pluginName);
    // Add generator-specific code
    const generatorTs = `import { Plugin, PluginContext } from '@archbase/cli';
import { MyGenerator } from './generators/MyGenerator';

export default function createPlugin(): Plugin {
  return {
    metadata: {
      name: '${pluginName}',
      version: '1.0.0',
      description: 'A generator plugin for Archbase CLI'
    },

    async activate(context: PluginContext): Promise<void> {
      context.logger.info('${pluginName} activated!');
      
      // Register custom generator
      context.registerGenerator('my-component', new MyGenerator());
    }
  };
}`;
    const myGeneratorTs = `export class MyGenerator {
  async generate(name: string, options: any): Promise<void> {
    console.log(\`Generating \${name} with options:\`, options);
    
    // Your generator logic here
    // - Create files
    // - Process templates
    // - Update configurations
  }
}`;
    await fs.writeFile(path.join(outputPath, 'src/index.ts'), generatorTs);
    await fs.ensureDir(path.join(outputPath, 'src/generators'));
    await fs.writeFile(path.join(outputPath, 'src/generators/MyGenerator.ts'), myGeneratorTs);
}
async function createAnalyzerPluginTemplate(outputPath, pluginName) {
    await createBasicPluginTemplate(outputPath, pluginName);
    // Add analyzer-specific code
    const analyzerTs = `import { Plugin, PluginContext } from '@archbase/cli';
import { MyAnalyzer } from './analyzers/MyAnalyzer';

export default function createPlugin(): Plugin {
  return {
    metadata: {
      name: '${pluginName}',
      version: '1.0.0',
      description: 'An analyzer plugin for Archbase CLI'
    },

    async activate(context: PluginContext): Promise<void> {
      context.logger.info('${pluginName} activated!');
      
      // Register custom analyzer
      context.registerAnalyzer('my-analyzer', new MyAnalyzer());
    }
  };
}`;
    const myAnalyzerTs = `export class MyAnalyzer {
  async analyze(projectPath: string): Promise<any> {
    console.log(\`Analyzing project at: \${projectPath}\`);
    
    // Your analyzer logic here
    // - Parse files
    // - Extract information
    // - Generate reports
    
    return {
      summary: 'Analysis complete',
      findings: []
    };
  }
}`;
    await fs.writeFile(path.join(outputPath, 'src/index.ts'), analyzerTs);
    await fs.ensureDir(path.join(outputPath, 'src/analyzers'));
    await fs.writeFile(path.join(outputPath, 'src/analyzers/MyAnalyzer.ts'), myAnalyzerTs);
}
async function createCommandPluginTemplate(outputPath, pluginName) {
    await createBasicPluginTemplate(outputPath, pluginName);
    // Add command-specific code
    const commandTs = `import { Plugin, PluginContext } from '@archbase/cli';
import { myCommand } from './commands/myCommand';

export default function createPlugin(): Plugin {
  return {
    metadata: {
      name: '${pluginName}',
      version: '1.0.0',
      description: 'A command plugin for Archbase CLI'
    },

    async activate(context: PluginContext): Promise<void> {
      context.logger.info('${pluginName} activated!');
      
      // Register custom command
      context.registerCommand(myCommand);
    }
  };
}`;
    const myCommandTs = `import { Command } from 'commander';

export const myCommand = new Command('my-command')
  .description('Custom command provided by plugin')
  .argument('<input>', 'Input parameter')
  .option('--option <value>', 'Custom option')
  .action(async (input: string, options) => {
    console.log(\`Executing custom command with input: \${input}\`);
    console.log('Options:', options);
    
    // Your command logic here
  });`;
    await fs.writeFile(path.join(outputPath, 'src/index.ts'), commandTs);
    await fs.ensureDir(path.join(outputPath, 'src/commands'));
    await fs.writeFile(path.join(outputPath, 'src/commands/myCommand.ts'), myCommandTs);
}
//# sourceMappingURL=plugin.js.map