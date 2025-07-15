/**
 * NavigationGenerator - Generate navigation items for powerview-admin pattern
 * 
 * Generates navigation configuration files that follow the exact patterns
 * from powerview-admin, including grouped menus, routes, and i18n integration.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import Handlebars from 'handlebars';
import { TranslationHelper } from '../utils/TranslationHelper';

interface NavigationConfig {
  name: string;
  output: string;
  typescript: boolean;
  category: string;
  feature: string;
  label: string;
  icon: string;
  color: string;
  showInSidebar: boolean;
  withForm: boolean;
  withView: boolean;
  group?: string;
  projectName?: string;
  projectPath?: string;
}

interface GenerationResult {
  files: string[];
  success: boolean;
  errors?: string[];
}

export class NavigationGenerator {
  private templatesPath: string;
  
  constructor(templatesPath: string = path.join(__dirname, '../../src/templates')) {
    this.templatesPath = templatesPath;
    this.registerHandlebarsHelpers();
  }
  
  private registerHandlebarsHelpers() {
    // Register equality helper
    Handlebars.registerHelper('eq', (a: any, b: any) => {
      return a === b;
    });
    
    // Register conditional helpers
    Handlebars.registerHelper('if_eq', (a: any, b: any, options: any) => {
      if (a === b) {
        return options.fn(options.data?.root || {});
      }
      return options.inverse(options.data?.root || {});
    });
    
    // Register capitalize first helper
    Handlebars.registerHelper('capitalizeFirst', (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    });
    
    // Register lowercase helper
    Handlebars.registerHelper('toLowerCase', (str: string) => {
      return str.toLowerCase();
    });
    
    // Register uppercase helper
    Handlebars.registerHelper('toUpperCase', (str: string) => {
      return str.toUpperCase();
    });
    
    // Register kebab case helper
    Handlebars.registerHelper('toKebabCase', (str: string) => {
      return str.replace(/([A-Z])/g, (match, letter, index) => 
        index === 0 ? letter.toLowerCase() : `-${letter.toLowerCase()}`
      );
    });
  }
  
  async generate(config: NavigationConfig): Promise<GenerationResult> {
    try {
      const context = this.buildTemplateContext(config);
      const files: string[] = [];
      
      // Generate navigation item
      const navFile = await this.generateNavigationItem(config.name, context, config);
      files.push(navFile);
      
      // Generate route constants
      const routeFile = await this.generateRouteConstants(config.name, context, config);
      files.push(routeFile);
      
      // Add translations if project path is provided
      if (config.projectPath && config.projectName) {
        await this.addNavigationTranslations(config, context);
      }
      
      return { files, success: true };
      
    } catch (error) {
      return { 
        files: [], 
        success: false, 
        errors: [error.message] 
      };
    }
  }
  
  private buildTemplateContext(config: NavigationConfig) {
    const featureName = config.feature || this.generateFeatureName(config.name);
    const categoryName = config.category;
    
    return {
      // Basic info
      name: config.name,
      label: config.label,
      icon: config.icon,
      color: config.color,
      showInSidebar: config.showInSidebar,
      
      // Navigation patterns
      category: categoryName,
      feature: featureName,
      categoryConstant: categoryName.toUpperCase() + '_CATEGORY',
      featureConstant: featureName.toUpperCase(),
      
      // Routes
      adminRoute: `/admin/${categoryName}/${featureName}`,
      formRoute: `/admin/${categoryName}/${featureName}/:${featureName}Id`,
      
      // Components
      viewComponent: `${this.capitalizeFirst(featureName)}View`,
      formComponent: `${this.capitalizeFirst(featureName)}Form`,
      
      // Features
      withForm: config.withForm,
      withView: config.withView,
      group: config.group,
      
      // i18n keys
      labelKey: `mentors:${this.capitalizeFirst(featureName)}`,
      categoryLabelKey: `mentors:${this.capitalizeFirst(categoryName)}`,
      
      // Variable names
      viewVarName: `${featureName}View`,
      formVarName: `${featureName}Form`,
      groupVarName: `${categoryName}GroupMenu`
    };
  }
  
  private async generateNavigationItem(name: string, context: any, config: NavigationConfig): Promise<string> {
    const templateName = 'navigation/navigation-item.hbs';
    const template = await this.loadTemplate(templateName);
    const compiled = Handlebars.compile(template);
    const content = compiled(context);
    
    const ext = config.typescript ? '.tsx' : '.jsx';
    const fileName = `${name}Navigation${ext}`;
    const filePath = path.resolve(config.output, fileName);
    
    await fs.ensureDir(config.output);
    await fs.writeFile(filePath, content);
    
    console.log(`  📄 ${filePath}`);
    return filePath;
  }
  
  private async generateRouteConstants(name: string, context: any, config: NavigationConfig): Promise<string> {
    const templateName = 'navigation/route-constants.hbs';
    const template = await this.loadTemplate(templateName);
    const compiled = Handlebars.compile(template);
    const content = compiled(context);
    
    const fileName = `${name}Routes.ts`;
    const filePath = path.resolve(config.output, fileName);
    
    await fs.ensureDir(config.output);
    await fs.writeFile(filePath, content);
    
    console.log(`  📄 ${filePath}`);
    return filePath;
  }
  
  private async loadTemplate(templateName: string): Promise<string> {
    const templatePath = path.join(this.templatesPath, templateName);
    
    if (await fs.pathExists(templatePath)) {
      return fs.readFile(templatePath, 'utf-8');
    }
    
    // Return default template if specific template not found
    return this.getDefaultTemplate(templateName);
  }
  
  private getDefaultTemplate(templateName: string): string {
    if (templateName.includes('navigation-item')) {
      return this.getNavigationItemTemplate();
    }
    
    if (templateName.includes('route-constants')) {
      return this.getRouteConstantsTemplate();
    }
    
    return this.getNavigationItemTemplate();
  }
  
  private getNavigationItemTemplate(): string {
    return `// Navigation item template - generated by NavigationGenerator`;
  }
  
  private getRouteConstantsTemplate(): string {
    return `// Route constants template - generated by NavigationGenerator`;
  }
  
  private generateFeatureName(componentName: string): string {
    // Convert "PlataformaNavigation" -> "plataforma"
    return componentName
      .replace(/Navigation$/, '') // Remove "Navigation" suffix
      .replace(/([A-Z])/g, (match, letter, index) => 
        index === 0 ? letter.toLowerCase() : `-${letter.toLowerCase()}`
      );
  }
  
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  /**
   * Add navigation translations to locale files
   */
  private async addNavigationTranslations(config: NavigationConfig, context: any): Promise<void> {
    try {
      const translationHelper = new TranslationHelper(config.projectPath!);
      
      // Check if project has locale files
      if (!(await translationHelper.hasLocaleFiles())) {
        console.log('  📝 No locale files found, skipping translation updates');
        return;
      }
      
      // Create translation entries
      const entries = TranslationHelper.createNavigationEntries(config.projectName!, [
        {
          key: config.label,
          ptBR: this.getPortugueseTranslation(config.label),
          en: this.getEnglishTranslation(config.label),
          es: this.getSpanishTranslation(config.label)
        },
        {
          key: config.category,
          ptBR: this.getPortugueseTranslation(config.category),
          en: this.getEnglishTranslation(config.category),
          es: this.getSpanishTranslation(config.category)
        }
      ]);
      
      // Add translations to all locale files
      await translationHelper.addNavigationTranslations(entries);
      
    } catch (error) {
      console.error('Error adding navigation translations:', error.message);
    }
  }
  
  /**
   * Get Portuguese translation for a key
   */
  private getPortugueseTranslation(key: string): string {
    const translations: Record<string, string> = {
      'Dashboard': 'Dashboard',
      'Gerenciar Usuários': 'Gerenciar Usuários',
      'Tokens de API': 'Tokens de API',
      'Segurança': 'Segurança',
      'Configurações': 'Configurações',
      'Usuários': 'Usuários',
      'Perfis': 'Perfis',
      'Grupos': 'Grupos',
      'Recursos': 'Recursos',
      'Auditoria': 'Auditoria',
      'Relatórios': 'Relatórios'
    };
    
    return translations[key] || key;
  }
  
  /**
   * Get English translation for a key
   */
  private getEnglishTranslation(key: string): string {
    const translations: Record<string, string> = {
      'Dashboard': 'Dashboard',
      'Gerenciar Usuários': 'Manage Users',
      'Tokens de API': 'API Tokens',
      'Segurança': 'Security',
      'Configurações': 'Settings',
      'Usuários': 'Users',
      'Perfis': 'Profiles',
      'Grupos': 'Groups',
      'Recursos': 'Resources',
      'Auditoria': 'Audit',
      'Relatórios': 'Reports'
    };
    
    return translations[key] || key;
  }
  
  /**
   * Get Spanish translation for a key
   */
  private getSpanishTranslation(key: string): string {
    const translations: Record<string, string> = {
      'Dashboard': 'Panel de control',
      'Gerenciar Usuários': 'Administrar Usuarios',
      'Tokens de API': 'Tokens de API',
      'Segurança': 'Seguridad',
      'Configurações': 'Configuraciones',
      'Usuários': 'Usuarios',
      'Perfis': 'Perfiles',
      'Grupos': 'Grupos',
      'Recursos': 'Recursos',
      'Auditoria': 'Auditoría',
      'Relatórios': 'Reportes'
    };
    
    return translations[key] || key;
  }
}