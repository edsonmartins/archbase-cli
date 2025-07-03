/**
 * Template Loader - Utility for loading and caching Handlebars templates
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import Handlebars from 'handlebars';

export class TemplateLoader {
  private cache: Map<string, HandlebarsTemplateDelegate> = new Map();
  private templatesPath: string;

  constructor(templatesPath: string = path.join(__dirname, '../templates')) {
    this.templatesPath = templatesPath;
    this.registerHelpers();
  }

  private registerHelpers() {
    // Equality helper
    Handlebars.registerHelper('eq', function(a: any, b: any) {
      return a === b;
    });

    // Not equal helper
    Handlebars.registerHelper('neq', function(a: any, b: any) {
      return a !== b;
    });

    // Capitalize first letter
    Handlebars.registerHelper('capitalizeFirst', function(str: string) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    });

    // Lowercase first letter
    Handlebars.registerHelper('lowercaseFirst', function(str: string) {
      return str.charAt(0).toLowerCase() + str.slice(1);
    });

    // Default value helper
    Handlebars.registerHelper('default', function(value: any, defaultValue: any) {
      return value || defaultValue;
    });

    // JSON stringify helper
    Handlebars.registerHelper('json', function(context: any) {
      return JSON.stringify(context, null, 2);
    });

    // Unless helper (inverse of if)
    Handlebars.registerHelper('unless', function(this: any, conditional: any, options: any) {
      if (!conditional) {
        return options.fn(this);
      }
      return options.inverse(this);
    });
  }

  async loadTemplate(category: string, templateName: string): Promise<HandlebarsTemplateDelegate> {
    const cacheKey = `${category}/${templateName}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Try to load external template file
      const templatePath = path.join(this.templatesPath, category, `${templateName}.hbs`);
      
      if (await fs.pathExists(templatePath)) {
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        const compiled = Handlebars.compile(templateContent);
        this.cache.set(cacheKey, compiled);
        return compiled;
      }
      
      // Fallback to common templates
      const commonPath = path.join(this.templatesPath, 'common', `${templateName}.hbs`);
      
      if (await fs.pathExists(commonPath)) {
        const templateContent = await fs.readFile(commonPath, 'utf-8');
        const compiled = Handlebars.compile(templateContent);
        this.cache.set(cacheKey, compiled);
        return compiled;
      }
      
      throw new Error(`Template not found: ${category}/${templateName}`);
    } catch (error) {
      throw new Error(`Failed to load template ${category}/${templateName}: ${error.message}`);
    }
  }

  async templateExists(category: string, templateName: string): Promise<boolean> {
    const templatePath = path.join(this.templatesPath, category, `${templateName}.hbs`);
    const commonPath = path.join(this.templatesPath, 'common', `${templateName}.hbs`);
    
    return (await fs.pathExists(templatePath)) || (await fs.pathExists(commonPath));
  }

  clearCache() {
    this.cache.clear();
  }

  // Register a partial template
  async registerPartial(name: string, templatePath: string) {
    try {
      const content = await fs.readFile(templatePath, 'utf-8');
      Handlebars.registerPartial(name, content);
    } catch (error) {
      throw new Error(`Failed to register partial ${name}: ${error.message}`);
    }
  }

  // Load all partials from a directory
  async loadPartials(partialsDir: string = path.join(this.templatesPath, 'partials')) {
    if (await fs.pathExists(partialsDir)) {
      const files = await fs.readdir(partialsDir);
      
      for (const file of files) {
        if (file.endsWith('.hbs')) {
          const name = path.basename(file, '.hbs');
          const filePath = path.join(partialsDir, file);
          await this.registerPartial(name, filePath);
        }
      }
    }
  }
}