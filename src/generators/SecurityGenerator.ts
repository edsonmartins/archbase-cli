/**
 * SecurityGenerator - Generates security-related views and components
 * 
 * Based on patterns from powerview-admin project:
 * - Login views (desktop/mobile)
 * - Security management views
 * - Authentication components
 * - User management interfaces
 * - API token management
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as Handlebars from 'handlebars';

export interface SecurityConfig {
  type: 'login' | 'security-management' | 'user-management' | 'api-tokens' | 'authenticator';
  name: string;
  output?: string;
  typescript?: boolean;
  features?: string[];
  withMobile?: boolean;
  withBranding?: boolean;
  withPasswordRemember?: boolean;
  authenticatorClass?: string;
  userClass?: string;
  apiTokenClass?: string;
  brandName?: string;
  logoPath?: string;
  baseURL?: string;
}

export class SecurityGenerator {
  private templateDir: string;

  constructor() {
    this.templateDir = path.join(__dirname, '../templates/security');
    this.registerHandlebarsHelpers();
  }

  async generate(config: SecurityConfig): Promise<{ success: boolean; files: string[]; errors?: string[] }> {
    console.log(`🔒 Generating security component: ${config.name}`);

    const files: string[] = [];
    const errors: string[] = [];

    try {
      switch (config.type) {
        case 'login':
          files.push(...await this.generateLoginViews(config));
          break;
        case 'security-management':
          files.push(...await this.generateSecurityManagement(config));
          break;
        case 'user-management':
          files.push(...await this.generateUserManagement(config));
          break;
        case 'api-tokens':
          files.push(...await this.generateApiTokens(config));
          break;
        case 'authenticator':
          files.push(...await this.generateAuthenticator(config));
          break;
        default:
          throw new Error(`Unknown security type: ${config.type}`);
      }

      console.log(`✅ Generated ${config.type} for ${config.name}`);
      return { success: true, files };
    } catch (error) {
      errors.push(error.message);
      return { success: false, files, errors };
    }
  }

  private async generateLoginViews(config: SecurityConfig): Promise<string[]> {
    const context = this.buildLoginContext(config);
    const files: string[] = [];
    
    // Generate desktop login view
    files.push(await this.generateFromTemplate('LoginView.tsx.hbs', `${config.name}View.tsx`, context, config.output));
    
    // Generate mobile login view if requested
    if (config.withMobile) {
      files.push(await this.generateFromTemplate('LoginMobileView.tsx.hbs', `${config.name}MobileView.tsx`, context, config.output));
    }
    
    // Generate CSS module
    files.push(await this.generateFromTemplate('Login.module.css.hbs', `${config.name}.module.css`, context, config.output));
    
    return files;
  }

  private async generateSecurityManagement(config: SecurityConfig): Promise<string[]> {
    const context = this.buildSecurityContext(config);
    const files: string[] = [];
    
    // Main security view
    files.push(await this.generateFromTemplate('SecurityView.tsx.hbs', `${config.name}View.tsx`, context, config.output));
    
    // Navigation item
    files.push(await this.generateFromTemplate('SecurityNavigation.tsx.hbs', `${config.name}Navigation.tsx`, context, config.output));
    
    // Route constants
    files.push(await this.generateFromTemplate('SecurityRoutes.tsx.hbs', `${config.name}Routes.tsx`, context, config.output));
    
    return files;
  }

  private async generateUserManagement(config: SecurityConfig): Promise<string[]> {
    const context = this.buildUserManagementContext(config);
    const files: string[] = [];
    
    // User management view
    files.push(await this.generateFromTemplate('UserManagementView.tsx.hbs', `${config.name}View.tsx`, context, config.output));
    
    return files;
  }

  private async generateApiTokens(config: SecurityConfig): Promise<string[]> {
    const context = this.buildApiTokenContext(config);
    const files: string[] = [];
    
    // API Token management view
    files.push(await this.generateFromTemplate('ApiTokenManagementView.tsx.hbs', `${config.name}View.tsx`, context, config.output));
    
    return files;
  }

  private async generateAuthenticator(config: SecurityConfig): Promise<string[]> {
    const context = this.buildAuthenticatorContext(config);
    const files: string[] = [];
    
    // Authenticator class
    files.push(await this.generateFromTemplate('Authenticator.ts.hbs', `${config.authenticatorClass || config.name + 'Authenticator'}.ts`, context, config.output));
    
    // IOC container setup
    files.push(await this.generateFromTemplate('SecurityContainer.tsx.hbs', `${config.name}Container.tsx`, context, config.output));
    
    return files;
  }

  private buildLoginContext(config: SecurityConfig): any {
    return {
      componentName: config.name,
      withMobile: config.withMobile,
      withBranding: config.withBranding,
      withPasswordRemember: config.withPasswordRemember,
      brandName: config.brandName || 'Your App',
      logoPath: config.logoPath || '/assets/logo.png',
      features: config.features || [],
      hasFeature: (feature: string) => config.features?.includes(feature) || false
    };
  }

  private buildSecurityContext(config: SecurityConfig): any {
    return {
      componentName: config.name,
      features: config.features || ['users', 'groups', 'permissions'],
      routeName: `${config.name.toUpperCase()}_ROUTE`,
      categoryName: `${config.name.toUpperCase()}_CATEGORY`,
      hasFeature: (feature: string) => config.features?.includes(feature) || false
    };
  }

  private buildUserManagementContext(config: SecurityConfig): any {
    return {
      componentName: config.name,
      userClass: config.userClass || 'User',
      features: config.features || ['custom-permissions', 'user-activation', 'user-roles'],
      hasFeature: (feature: string) => config.features?.includes(feature) || false
    };
  }

  private buildApiTokenContext(config: SecurityConfig): any {
    return {
      componentName: config.name,
      apiTokenClass: config.apiTokenClass || 'ApiToken',
      features: config.features || ['custom-permissions', 'token-regeneration'],
      hasFeature: (feature: string) => config.features?.includes(feature) || false
    };
  }

  private buildAuthenticatorContext(config: SecurityConfig): any {
    return {
      componentName: config.name,
      authenticatorClass: config.authenticatorClass || `${config.name}Authenticator`,
      userClass: config.userClass || `${config.name}User`,
      apiTokenClass: config.apiTokenClass || `${config.name}ApiToken`,
      brandName: config.brandName || 'YourApp',
      baseURL: config.baseURL || 'http://localhost:8080',
      features: config.features || ['jwt', 'refresh-token', 'password-reset'],
      hasFeature: (feature: string) => config.features?.includes(feature) || false
    };
  }

  private async generateFromTemplate(
    templateName: string,
    outputFileName: string,
    context: any,
    outputDir?: string
  ): Promise<string> {
    const templatePath = path.join(this.templateDir, templateName);
    const template = await fs.readFile(templatePath, 'utf-8');
    const compiled = Handlebars.compile(template);
    const content = compiled(context);

    const finalOutputDir = outputDir || './src/security';
    const outputPath = path.join(finalOutputDir, outputFileName);
    
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, content);
    
    return outputPath;
  }

  private registerHandlebarsHelpers(): void {
    Handlebars.registerHelper('eq', (a, b) => a === b);
    Handlebars.registerHelper('capitalizeFirst', (str) => 
      str.charAt(0).toUpperCase() + str.slice(1)
    );
    Handlebars.registerHelper('toLowerCase', (str) => str.toLowerCase());
    Handlebars.registerHelper('toUpperCase', (str) => str.toUpperCase());
    Handlebars.registerHelper('concat', (...args) => {
      args.pop(); // Remove options object
      return args.join('');
    });
    Handlebars.registerHelper('hasFeature', function(this: any, feature: string) {
      return this.features && this.features.includes(feature);
    });
  }
}