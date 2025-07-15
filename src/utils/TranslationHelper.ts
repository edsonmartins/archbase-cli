/**
 * TranslationHelper - Manage translation strings for generated components
 */

import * as fs from 'fs-extra';
import * as path from 'path';

interface TranslationEntry {
  key: string;
  ptBR: string;
  en: string;
  es: string;
}

export class TranslationHelper {
  private projectPath: string;
  private localesPath: string;
  
  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.localesPath = path.join(projectPath, 'src', 'locales');
  }
  
  /**
   * Add navigation translation entries to all locale files
   */
  async addNavigationTranslations(entries: TranslationEntry[]): Promise<void> {
    const locales = ['pt-BR', 'en', 'es'];
    
    for (const locale of locales) {
      await this.addTranslationsToFile(locale, entries);
    }
  }
  
  /**
   * Add translations to a specific locale file
   */
  private async addTranslationsToFile(locale: string, entries: TranslationEntry[]): Promise<void> {
    const filePath = path.join(this.localesPath, locale, 'translation.json');
    
    if (!(await fs.pathExists(filePath))) {
      console.warn(`Translation file not found: ${filePath}`);
      return;
    }
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const translations = JSON.parse(content);
      
      // Add new translations
      for (const entry of entries) {
        const value = this.getTranslationValue(entry, locale);
        if (value && !translations[entry.key]) {
          translations[entry.key] = value;
        }
      }
      
      // Write back to file with proper formatting
      const updatedContent = JSON.stringify(translations, null, 2);
      await fs.writeFile(filePath, updatedContent);
      
      console.log(`  📝 Updated translations in ${locale}/translation.json`);
      
    } catch (error) {
      console.error(`Error updating translations for ${locale}:`, error.message);
    }
  }
  
  /**
   * Get translation value for specific locale
   */
  private getTranslationValue(entry: TranslationEntry, locale: string): string {
    switch (locale) {
      case 'pt-BR':
        return entry.ptBR;
      case 'en':
        return entry.en;
      case 'es':
        return entry.es;
      default:
        return entry.en; // fallback to English
    }
  }
  
  /**
   * Create navigation translation entries
   */
  static createNavigationEntries(projectName: string, items: Array<{
    key: string;
    ptBR: string;
    en: string;
    es: string;
  }>): TranslationEntry[] {
    return items.map(item => ({
      key: `${projectName}:${item.key}`,
      ptBR: item.ptBR,
      en: item.en,
      es: item.es
    }));
  }
  
  /**
   * Check if project has locale files
   */
  async hasLocaleFiles(): Promise<boolean> {
    const ptBRPath = path.join(this.localesPath, 'pt-BR', 'translation.json');
    const enPath = path.join(this.localesPath, 'en', 'translation.json');
    
    return (await fs.pathExists(ptBRPath)) && (await fs.pathExists(enPath));
  }
  
  /**
   * Get existing translations from a locale file
   */
  async getExistingTranslations(locale: string): Promise<Record<string, string>> {
    const filePath = path.join(this.localesPath, locale, 'translation.json');
    
    if (!(await fs.pathExists(filePath))) {
      return {};
    }
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error reading translations for ${locale}:`, error.message);
      return {};
    }
  }
}