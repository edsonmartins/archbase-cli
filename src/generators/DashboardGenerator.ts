import * as Handlebars from 'handlebars';
import * as path from 'path';
import * as fs from 'fs-extra';
import { GeneratorError } from '../utils/errors';
import { Logger } from '../utils/logger';

export interface KPIConfig {
  id: string;
  title: string;
  icon: string;
  color: string;
  dataField: string;
  description?: string;
  format?: 'number' | 'currency' | 'percentage';
}

export interface ChartConfig {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'radar';
  dataSource: string;
  xAxis?: string;
  yAxis?: string;
  height?: number;
  responsive?: boolean;
  colors?: string[];
}

export interface TableConfig {
  id: string;
  title: string;
  dataSource: string;
  columns: {
    field: string;
    title: string;
    type?: 'text' | 'number' | 'date' | 'badge';
    sortable?: boolean;
  }[];
  pagination?: boolean;
  searchable?: boolean;
}

export interface FilterConfig {
  id: string;
  type: 'date' | 'select' | 'search' | 'dateRange';
  label: string;
  field: string;
  options?: { value: string; label: string }[];
  defaultValue?: any;
}

export interface DashboardGeneratorOptions {
  name: string;
  title: string;
  description?: string;
  layout: 'grid' | 'sidebar' | 'tabs';
  kpis?: KPIConfig[];
  charts?: ChartConfig[];
  tables?: TableConfig[];
  filters?: FilterConfig[];
  autoRefresh?: number;
  responsive?: boolean;
  withNavigation?: boolean;
  category?: string;
  feature?: string;
  outputPath?: string;
  serviceIntegration?: boolean;
}

export class DashboardGenerator {
  private handlebars: typeof Handlebars;
  private templatesDir: string;
  private logger: Logger;

  constructor() {
    this.handlebars = Handlebars.create();
    this.templatesDir = path.join(__dirname, '..', 'templates');
    this.logger = Logger.getInstance();
    this.registerHelpers();
  }

  private registerHelpers(): void {
    this.handlebars.registerHelper('eq', (a: any, b: any) => a === b);
    this.handlebars.registerHelper('capitalize', (str: string) => {
      return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
    });
    this.handlebars.registerHelper('lowercase', (str: string) => {
      return str ? str.toLowerCase() : '';
    });
    this.handlebars.registerHelper('camelCase', (str: string) => {
      return str ? str.replace(/[\s-_]+(.)?/g, (_, c) => c ? c.toUpperCase() : '') : '';
    });
    this.handlebars.registerHelper('kebabCase', (str: string) => {
      return str ? str.replace(/\s+/g, '-').toLowerCase() : '';
    });
    this.handlebars.registerHelper('hasKPIs', (kpis: KPIConfig[]) => {
      return kpis && kpis.length > 0;
    });
    this.handlebars.registerHelper('hasCharts', (charts: ChartConfig[]) => {
      return charts && charts.length > 0;
    });
    this.handlebars.registerHelper('hasTables', (tables: TableConfig[]) => {
      return tables && tables.length > 0;
    });
    this.handlebars.registerHelper('hasFilters', (filters: FilterConfig[]) => {
      return filters && filters.length > 0;
    });
    this.handlebars.registerHelper('getChartComponent', (type: string) => {
      const chartMap: Record<string, string> = {
        'line': 'LineChart',
        'bar': 'BarChart',
        'pie': 'PieChart',
        'area': 'AreaChart',
        'radar': 'RadarChart'
      };
      return chartMap[type] || 'LineChart';
    });
    this.handlebars.registerHelper('getKPISpan', (kpisLength: number) => {
      if (kpisLength <= 2) return '6';
      if (kpisLength <= 4) return '3';
      return '2';
    });
    this.handlebars.registerHelper('generateRoute', (category: string, feature: string) => {
      return `/admin/${category}/${feature}`;
    });
    this.handlebars.registerHelper('json', (obj: any) => {
      return JSON.stringify(obj, null, 2);
    });
    this.handlebars.registerHelper('lt', () => '{');
    this.handlebars.registerHelper('gt', () => '}');
  }

  async generate(options: DashboardGeneratorOptions): Promise<string> {
    try {
      this.logger.info(`Generating dashboard: ${options.name}`);

      // Validate options
      this.validateOptions(options);

      // Prepare template data
      const templateData = this.prepareTemplateData(options);

      // Generate dashboard component
      const dashboardCode = await this.generateDashboard(templateData);

      // Generate supporting files
      const supportingFiles = await this.generateSupportingFiles(templateData);

      // Write files
      const outputPath = options.outputPath || process.cwd();
      const dashboardPath = await this.writeDashboard(dashboardCode, options.name, outputPath);
      
      const additionalPaths: string[] = [];
      for (const [filename, content] of supportingFiles) {
        const filePath = await this.writeFile(content, filename, outputPath);
        additionalPaths.push(filePath);
      }

      this.logger.success(`Dashboard generated successfully at: ${dashboardPath}`);
      additionalPaths.forEach(filePath => {
        this.logger.file(filePath);
      });

      return dashboardCode;
    } catch (error) {
      this.logger.error(`Error generating dashboard: ${error}`);
      throw new GeneratorError(`Failed to generate dashboard: ${error}`);
    }
  }

  private validateOptions(options: DashboardGeneratorOptions): void {
    if (!options.name) {
      throw new GeneratorError('Dashboard name is required');
    }
    if (!options.title) {
      throw new GeneratorError('Dashboard title is required');
    }
    if (!options.layout) {
      throw new GeneratorError('Dashboard layout is required');
    }
  }

  private prepareTemplateData(options: DashboardGeneratorOptions): any {
    const data: any = {
      name: options.name,
      title: options.title,
      description: options.description || `Dashboard ${options.title}`,
      layout: options.layout,
      kpis: options.kpis || [],
      charts: options.charts || [],
      tables: options.tables || [],
      filters: options.filters || [],
      autoRefresh: options.autoRefresh || 300000, // 5 minutes default
      responsive: options.responsive !== false,
      withNavigation: options.withNavigation !== false,
      category: options.category || 'dashboard',
      feature: options.feature || options.name.toLowerCase(),
      serviceIntegration: options.serviceIntegration !== false,
      imports: this.getImports(options),
      interfaces: this.getInterfaces(options),
      hasData: this.hasDataComponents(options)
    };

    return data;
  }

  private getImports(options: DashboardGeneratorOptions): string[] {
    const imports = [
      "import React, { useState, useEffect } from 'react';",
      "import { Card, Grid, Text, Group, Stack, Badge, RingProgress, ScrollArea, Loader } from '@mantine/core';",
      "import { IconDashboard } from '@tabler/icons-react';"
    ];

    // Add chart imports based on chart types
    if (options.charts && options.charts.length > 0) {
      const chartTypes = new Set(options.charts.map(chart => this.getChartImport(chart.type)));
      const rechartImports = Array.from(chartTypes).join(', ');
      imports.push(`import { ${rechartImports}, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';`);
    }

    // Add table imports if needed
    if (options.tables && options.tables.length > 0) {
      imports.push("import { ArchbaseDataGrid, ArchbaseDataGridColumn } from 'archbase-react';");
    }

    // Add filter imports if needed
    if (options.filters && options.filters.length > 0) {
      imports.push("import { DateInput, Select, TextInput } from '@mantine/core';");
    }

    // Add navigation imports if needed
    if (options.withNavigation) {
      imports.push("import { useArchbaseNavigationListener } from 'archbase-react';");
    }

    // Add service imports if needed
    if (options.serviceIntegration) {
      imports.push("import { useArchbaseRemoteServiceApi, API_TYPE } from 'archbase-react';");
    }

    return imports;
  }

  private getChartImport(type: string): string {
    const chartMap: Record<string, string> = {
      'line': 'LineChart, Line',
      'bar': 'BarChart, Bar',
      'pie': 'PieChart, Pie, Cell',
      'area': 'AreaChart, Area',
      'radar': 'RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar'
    };
    return chartMap[type] || 'LineChart, Line';
  }

  private getInterfaces(options: DashboardGeneratorOptions): string[] {
    const interfaces = [
      `interface ${options.name}State {`,
      `  loading: boolean;`,
      `  error?: string;`
    ];

    if (options.kpis && options.kpis.length > 0) {
      interfaces.push(`  kpis: Record<string, number>;`);
    }

    if (options.charts && options.charts.length > 0) {
      interfaces.push(`  chartData: Record<string, any[]>;`);
    }

    if (options.tables && options.tables.length > 0) {
      interfaces.push(`  tableData: Record<string, any[]>;`);
    }

    interfaces.push(`}`);

    return interfaces;
  }

  private hasDataComponents(options: DashboardGeneratorOptions): boolean {
    return !!(options.kpis?.length || options.charts?.length || options.tables?.length);
  }

  private async generateDashboard(data: any): Promise<string> {
    const templatePath = path.join(this.templatesDir, 'dashboard', `${data.layout}.hbs`);
    
    // Use default template if specific layout template doesn't exist
    const fallbackPath = path.join(this.templatesDir, 'dashboard', 'dashboard.hbs');
    const finalTemplatePath = await fs.pathExists(templatePath) ? templatePath : fallbackPath;
    
    const templateContent = await fs.readFile(finalTemplatePath, 'utf-8');
    const template = this.handlebars.compile(templateContent);
    return template(data);
  }

  private async generateSupportingFiles(data: any): Promise<Map<string, string>> {
    const files = new Map<string, string>();

    // Generate types file
    if (data.hasData) {
      const typesContent = await this.generateTypes(data);
      files.set(`${data.name}Types.ts`, typesContent);
    }

    // Generate hooks file for data fetching
    if (data.serviceIntegration) {
      const hooksContent = await this.generateHooks(data);
      files.set(`use${data.name}Data.ts`, hooksContent);
    }

    // Generate CSS module
    const stylesContent = await this.generateStyles(data);
    files.set(`${data.name}.module.css`, stylesContent);

    return files;
  }

  private async generateTypes(data: any): Promise<string> {
    const templatePath = path.join(this.templatesDir, 'dashboard', 'types.hbs');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const template = this.handlebars.compile(templateContent);
    return template(data);
  }

  private async generateHooks(data: any): Promise<string> {
    const templatePath = path.join(this.templatesDir, 'dashboard', 'hooks.hbs');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const template = this.handlebars.compile(templateContent);
    return template(data);
  }

  private async generateStyles(data: any): Promise<string> {
    const templatePath = path.join(this.templatesDir, 'dashboard', 'styles.hbs');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const template = this.handlebars.compile(templateContent);
    return template(data);
  }

  private async writeDashboard(code: string, name: string, outputPath: string): Promise<string> {
    const dashboardPath = path.join(outputPath, 'dashboards');
    await fs.ensureDir(dashboardPath);
    
    const filePath = path.join(dashboardPath, `${name}.tsx`);
    await fs.writeFile(filePath, code);
    
    return filePath;
  }

  private async writeFile(content: string, filename: string, outputPath: string): Promise<string> {
    const dashboardPath = path.join(outputPath, 'dashboards');
    await fs.ensureDir(dashboardPath);
    
    const filePath = path.join(dashboardPath, filename);
    await fs.writeFile(filePath, content);
    
    return filePath;
  }
}

export default DashboardGenerator;