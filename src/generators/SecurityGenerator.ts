/**
 * SecurityGenerator - Generate security-related views and components
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import Handlebars from 'handlebars';
import { Logger } from '../utils/logger';
import { TranslationHelper } from '../utils/TranslationHelper';

interface SecurityGeneratorOptions {
  name: string;
  type: 'security-view' | 'api-token-view' | 'login' | 'security-management' | 'user-management' | 'api-tokens' | 'authenticator';
  output?: string;
  outputPath?: string;
  typescript?: boolean;
  features?: string[];
  withMobile?: boolean;
  withBranding?: boolean;
  withPasswordRemember?: boolean;
  brandName?: string;
  logoPath?: string;
  userClass?: string;
  apiTokenClass?: string;
  authenticatorClass?: string;
  baseURL?: string;
  projectName?: string;
  projectPath?: string;
}

export class SecurityGenerator {
  private readonly handlebars = Handlebars.create();
  private templatesPath: string;

  /** Maps a security component type to its actual template file. */
  private static readonly TEMPLATE_BY_TYPE: Record<string, string> = {
    'security-view': 'security-view.hbs',
    'api-token-view': 'api-token-view.hbs',
    'login': 'LoginView.tsx.hbs',
    'security-management': 'SecurityView.tsx.hbs',
    'user-management': 'UserManagementView.tsx.hbs',
    'api-tokens': 'ApiTokenManagementView.tsx.hbs',
    'authenticator': 'Authenticator.ts.hbs',
  };

  constructor() {
    this.templatesPath = path.join(__dirname, '../templates/security');
    this.registerHelpers();
  }

  private registerHelpers(): void {
    this.handlebars.registerHelper('toUpperCase', (str: string) => String(str ?? '').toUpperCase());
    this.handlebars.registerHelper('toLowerCase', (str: string) => String(str ?? '').toLowerCase());
    this.handlebars.registerHelper('eq', (a: any, b: any) => a === b);
    // Template-literal escape helpers used by some templates ({{lt}}...{{gt}}).
    this.handlebars.registerHelper('lt', () => '{');
    this.handlebars.registerHelper('gt', () => '}');
    // Resolves feature flags from the `features` array passed in the render context.
    this.handlebars.registerHelper('hasFeature', function (this: any, feature: string) {
      const features = (this && this.features) || [];
      return Array.isArray(features) && features.includes(feature);
    });
  }

  async generate(options: SecurityGeneratorOptions): Promise<{ success: boolean; files?: string[]; errors?: string[] }> {
    try {
      const { name, type, outputPath, output } = options;
      const finalOutputPath = outputPath || output || './src/security';
      
      // Ensure output directory exists
      await fs.ensureDir(finalOutputPath);
      
      // Select template based on type
      const templateFile = SecurityGenerator.TEMPLATE_BY_TYPE[type] || `${type}.hbs`;
      const templatePath = path.join(this.templatesPath, templateFile);

      if (!await fs.pathExists(templatePath)) {
        const known = Object.keys(SecurityGenerator.TEMPLATE_BY_TYPE).join(', ');
        throw new Error(`Template not found for type '${type}' (expected ${templateFile}). Known types: ${known}`);
      }
      
      // Read template
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      const template = this.handlebars.compile(templateContent);
      
      // Generate component name (PascalCase)
      const componentName = this.toPascalCase(name);
      
      // Render template
      const renderedContent = template({
        componentName,
        ...options
      });
      
      // Write file (authenticator is plain TS, views are TSX)
      const ext = type === 'authenticator' ? '.ts' : '.tsx';
      const outputFile = path.join(finalOutputPath, `${componentName}${ext}`);
      await fs.writeFile(outputFile, renderedContent);
      
      Logger.getInstance().info(`✅ Generated ${type}: ${outputFile}`);
      
      // Add translations if project path and name are provided
      if (options.projectPath && options.projectName) {
        await this.addSecurityTranslations(options);
      }
      
      return {
        success: true,
        files: [outputFile]
      };
    } catch (error) {
      Logger.getInstance().error(`❌ Error generating security component: ${error.message}`);
      return {
        success: false,
        errors: [error.message]
      };
    }
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
      .replace(/^(.)/, (c) => c.toUpperCase());
  }
  
  /**
   * Add security-related translations to locale files
   */
  private async addSecurityTranslations(options: SecurityGeneratorOptions): Promise<void> {
    try {
      const translationHelper = new TranslationHelper(options.projectPath!);
      
      // Check if project has locale files
      if (!(await translationHelper.hasLocaleFiles())) {
        Logger.getInstance().info('📝 No locale files found, skipping translation updates');
        return;
      }
      
      // Get translations based on security type
      const translations = this.getSecurityTranslations(options.type);
      
      if (translations.length === 0) {
        return;
      }
      
      // Create translation entries
      const entries = TranslationHelper.createNavigationEntries(options.projectName!, translations);
      
      // Add translations to all locale files
      await translationHelper.addNavigationTranslations(entries);
      
      Logger.getInstance().info('📝 Security translations added to locale files');
      
    } catch (error) {
      Logger.getInstance().error(`Error adding security translations: ${error.message}`);
    }
  }
  
  /**
   * Get translations for different security types
   */
  private getSecurityTranslations(type: string): Array<{ key: string; ptBR: string; en: string; es: string }> {
    const translations: Record<string, Array<{ key: string; ptBR: string; en: string; es: string }>> = {
      'security-management': [
        { key: 'Gerenciar Usuários', ptBR: 'Gerenciar Usuários', en: 'Manage Users', es: 'Administrar Usuarios' },
        { key: 'Segurança', ptBR: 'Segurança', en: 'Security', es: 'Seguridad' }
      ],
      'api-token-management': [
        { key: 'Tokens de API', ptBR: 'Tokens de API', en: 'API Tokens', es: 'Tokens de API' },
        { key: 'Segurança', ptBR: 'Segurança', en: 'Security', es: 'Seguridad' }
      ],
      'user-management': [
        { key: 'Usuários', ptBR: 'Usuários', en: 'Users', es: 'Usuarios' },
        { key: 'Segurança', ptBR: 'Segurança', en: 'Security', es: 'Seguridad' }
      ],
      'api-tokens': [
        { key: 'Tokens de API', ptBR: 'Tokens de API', en: 'API Tokens', es: 'Tokens de API' },
        { key: 'Segurança', ptBR: 'Segurança', en: 'Security', es: 'Seguridad' }
      ]
    };
    
    return translations[type] || [];
  }
}