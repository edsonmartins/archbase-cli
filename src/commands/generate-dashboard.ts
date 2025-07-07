import { Command } from 'commander';
import * as inquirer from 'inquirer';
import * as chalk from 'chalk';
import { DashboardGenerator, DashboardGeneratorOptions, KPIConfig, ChartConfig, TableConfig, FilterConfig } from '../generators/DashboardGenerator';
import { Logger } from '../utils/logger';

export function createGenerateDashboardCommand(): Command {
  const logger = Logger.getInstance();

  return new Command('dashboard')
    .description('Gera um dashboard seguindo padrões do Archbase')
    .argument('<name>', 'Nome do dashboard (ex: VendasDashboard)')
    .option('-t, --title <title>', 'Título do dashboard')
    .option('-d, --description <description>', 'Descrição do dashboard')
    .option('-l, --layout <layout>', 'Layout do dashboard (grid|tabs|sidebar)', 'grid')
    .option('--kpis <kpis>', 'KPIs em JSON ou lista separada por vírgula')
    .option('--charts <charts>', 'Gráficos em JSON ou lista separada por vírgula')
    .option('--tables <tables>', 'Tabelas em JSON ou lista separada por vírgula')
    .option('--filters <filters>', 'Filtros em JSON ou lista separada por vírgula')
    .option('--auto-refresh <seconds>', 'Auto-refresh em segundos', '300')
    .option('--category <category>', 'Categoria para navegação', 'dashboard')
    .option('--feature <feature>', 'Feature para navegação')
    .option('-o, --output <path>', 'Diretório de saída')
    .option('--no-navigation', 'Não incluir integração de navegação')
    .option('--no-service', 'Não incluir integração de service')
    .option('--wizard', 'Usar wizard interativo')
    .action(async (name, options) => {
      try {
        logger.info(`Gerando dashboard: ${name}`);

        let config: DashboardGeneratorOptions = {
          name,
          title: options.title || name.replace(/Dashboard$/, ''),
          description: options.description,
          layout: options.layout,
          category: options.category,
          feature: options.feature || name.toLowerCase().replace(/dashboard$/, ''),
          autoRefresh: parseInt(options.autoRefresh) * 1000,
          withNavigation: options.navigation !== false,
          serviceIntegration: options.service !== false,
          outputPath: options.output,
          responsive: true
        };

        // Se wizard ativado ou configuração complexa necessária
        if (options.wizard || (!options.kpis && !options.charts && !options.tables)) {
          config = await runWizard(config);
        } else {
          // Parse options from command line
          if (options.kpis) {
            config.kpis = parseKPIs(options.kpis);
          }
          if (options.charts) {
            config.charts = parseCharts(options.charts);
          }
          if (options.tables) {
            config.tables = parseTables(options.tables);
          }
          if (options.filters) {
            config.filters = parseFilters(options.filters);
          }
        }

        const generator = new DashboardGenerator();
        await generator.generate(config);

        logger.success(chalk.green(`\n✅ Dashboard gerado com sucesso!`));
        logger.info(chalk.blue(`Layout: ${config.layout}`));
        
        if (config.kpis?.length) {
          logger.info(chalk.blue(`KPIs: ${config.kpis.length} configurados`));
        }
        if (config.charts?.length) {
          logger.info(chalk.blue(`Gráficos: ${config.charts.length} configurados`));
        }
        if (config.tables?.length) {
          logger.info(chalk.blue(`Tabelas: ${config.tables.length} configuradas`));
        }

      } catch (error) {
        logger.error(`Erro ao gerar dashboard: ${error}`);
        process.exit(1);
      }
    });
}

async function runWizard(initialConfig: DashboardGeneratorOptions): Promise<DashboardGeneratorOptions> {
  console.log(chalk.blue('\n🏗️  Dashboard Generator Wizard\n'));

  // Basic Information
  const basicInfo = await (inquirer as any).prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Título do dashboard:',
      default: initialConfig.title,
      validate: (input: string) => input.length > 0 || 'Título é obrigatório'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Descrição do dashboard:',
      default: initialConfig.description
    },
    {
      type: 'list',
      name: 'layout',
      message: 'Layout do dashboard:',
      choices: [
        { name: 'Grid - Layout em grade (recomendado)', value: 'grid' },
        { name: 'Tabs - Layout com abas', value: 'tabs' },
        { name: 'Sidebar - Layout com sidebar', value: 'sidebar' }
      ],
      default: initialConfig.layout
    }
  ]);

  // KPIs Configuration
  const kpisConfig = await (inquirer as any).prompt([
    {
      type: 'confirm',
      name: 'hasKPIs',
      message: 'Incluir KPIs (métricas principais)?',
      default: true
    },
    {
      type: 'input',
      name: 'kpiCount',
      message: 'Quantos KPIs deseja incluir?',
      default: '3',
      when: (answers: any) => answers.hasKPIs,
      validate: (input: string) => {
        const num = parseInt(input);
        return num > 0 && num <= 6 || 'Digite um número entre 1 e 6';
      }
    }
  ]);

  let kpis: KPIConfig[] = [];
  if (kpisConfig.hasKPIs) {
    const kpiCount = parseInt(kpisConfig.kpiCount);
    for (let i = 0; i < kpiCount; i++) {
      const kpi = await (inquirer as any).prompt([
        {
          type: 'input',
          name: 'title',
          message: `Título do KPI ${i + 1}:`,
          default: `Métrica ${i + 1}`
        },
        {
          type: 'input',
          name: 'id',
          message: `ID do KPI ${i + 1}:`,
          default: (answers: any) => answers.title.toLowerCase().replace(/\s+/g, '')
        },
        {
          type: 'list',
          name: 'format',
          message: `Formato do KPI ${i + 1}:`,
          choices: [
            { name: 'Número', value: 'number' },
            { name: 'Moeda (R$)', value: 'currency' },
            { name: 'Porcentagem (%)', value: 'percentage' }
          ],
          default: 'number'
        },
        {
          type: 'list',
          name: 'color',
          message: `Cor do KPI ${i + 1}:`,
          choices: ['blue', 'green', 'yellow', 'red', 'purple'],
          default: 'blue'
        }
      ]);

      kpis.push({
        id: kpi.id,
        title: kpi.title,
        icon: 'IconDashboard',
        color: kpi.color,
        dataField: kpi.id,
        format: kpi.format
      });
    }
  }

  // Charts Configuration
  const chartsConfig = await (inquirer as any).prompt([
    {
      type: 'confirm',
      name: 'hasCharts',
      message: 'Incluir gráficos?',
      default: true
    },
    {
      type: 'input',
      name: 'chartCount',
      message: 'Quantos gráficos deseja incluir?',
      default: '2',
      when: (answers: any) => answers.hasCharts,
      validate: (input: string) => {
        const num = parseInt(input);
        return num > 0 && num <= 4 || 'Digite um número entre 1 e 4';
      }
    }
  ]);

  let charts: ChartConfig[] = [];
  if (chartsConfig.hasCharts) {
    const chartCount = parseInt(chartsConfig.chartCount);
    for (let i = 0; i < chartCount; i++) {
      const chart = await (inquirer as any).prompt([
        {
          type: 'input',
          name: 'title',
          message: `Título do gráfico ${i + 1}:`,
          default: `Gráfico ${i + 1}`
        },
        {
          type: 'input',
          name: 'id',
          message: `ID do gráfico ${i + 1}:`,
          default: (answers: any) => answers.title.toLowerCase().replace(/\s+/g, '')
        },
        {
          type: 'list',
          name: 'type',
          message: `Tipo do gráfico ${i + 1}:`,
          choices: [
            { name: 'Linha - Para tendências ao longo do tempo', value: 'line' },
            { name: 'Barra - Para comparações', value: 'bar' },
            { name: 'Pizza - Para distribuições', value: 'pie' },
            { name: 'Área - Para volumes ao longo do tempo', value: 'area' }
          ],
          default: 'line'
        }
      ]);

      charts.push({
        id: chart.id,
        title: chart.title,
        type: chart.type,
        dataSource: `${chart.id}Data`,
        xAxis: 'name',
        yAxis: 'value',
        height: 300,
        responsive: true
      });
    }
  }

  // Tables Configuration
  const tablesConfig = await (inquirer as any).prompt([
    {
      type: 'confirm',
      name: 'hasTables',
      message: 'Incluir tabelas de dados?',
      default: false
    },
    {
      type: 'input',
      name: 'tableCount',
      message: 'Quantas tabelas deseja incluir?',
      default: '1',
      when: (answers: any) => answers.hasTables,
      validate: (input: string) => {
        const num = parseInt(input);
        return num > 0 && num <= 3 || 'Digite um número entre 1 e 3';
      }
    }
  ]);

  let tables: TableConfig[] = [];
  if (tablesConfig.hasTables) {
    const tableCount = parseInt(tablesConfig.tableCount);
    for (let i = 0; i < tableCount; i++) {
      const table = await (inquirer as any).prompt([
        {
          type: 'input',
          name: 'title',
          message: `Título da tabela ${i + 1}:`,
          default: `Dados ${i + 1}`
        },
        {
          type: 'input',
          name: 'id',
          message: `ID da tabela ${i + 1}:`,
          default: (answers: any) => answers.title.toLowerCase().replace(/\s+/g, '')
        },
        {
          type: 'input',
          name: 'columns',
          message: `Colunas da tabela ${i + 1} (formato: field:title:type):`,
          default: 'id:ID:number,name:Nome:text,status:Status:text',
          validate: (input: string) => input.length > 0 || 'Defina pelo menos uma coluna'
        }
      ]);

      const columns = table.columns.split(',').map((col: string) => {
        const [field, title, type] = col.split(':');
        return {
          field: field.trim(),
          title: title?.trim() || field.trim(),
          type: (type?.trim() || 'text') as 'text' | 'number' | 'date' | 'badge',
          sortable: true
        };
      });

      tables.push({
        id: table.id,
        title: table.title,
        dataSource: `${table.id}Data`,
        columns,
        pagination: true,
        searchable: true
      });
    }
  }

  // Advanced Options
  const advancedConfig = await (inquirer as any).prompt([
    {
      type: 'confirm',
      name: 'autoRefresh',
      message: 'Ativar auto-refresh dos dados?',
      default: true
    },
    {
      type: 'input',
      name: 'refreshInterval',
      message: 'Intervalo de refresh (em segundos):',
      default: '300',
      when: (answers: any) => answers.autoRefresh,
      validate: (input: string) => {
        const num = parseInt(input);
        return num >= 30 || 'Mínimo de 30 segundos';
      }
    },
    {
      type: 'input',
      name: 'category',
      message: 'Categoria para navegação:',
      default: initialConfig.category
    },
    {
      type: 'input',
      name: 'output',
      message: 'Diretório de saída:',
      default: initialConfig.outputPath || process.cwd()
    }
  ]);

  return {
    ...initialConfig,
    title: basicInfo.title,
    description: basicInfo.description,
    layout: basicInfo.layout,
    kpis: kpis.length > 0 ? kpis : undefined,
    charts: charts.length > 0 ? charts : undefined,
    tables: tables.length > 0 ? tables : undefined,
    autoRefresh: advancedConfig.autoRefresh ? parseInt(advancedConfig.refreshInterval) * 1000 : undefined,
    category: advancedConfig.category,
    outputPath: advancedConfig.output
  };
}

function parseKPIs(kpisString: string): KPIConfig[] {
  try {
    // Try to parse as JSON first
    return JSON.parse(kpisString);
  } catch {
    // Parse as comma-separated list
    return kpisString.split(',').map((kpi, index) => {
      const [title, color] = kpi.split(':');
      return {
        id: title.toLowerCase().replace(/\s+/g, ''),
        title: title.trim(),
        icon: 'IconDashboard',
        color: color?.trim() || 'blue',
        dataField: title.toLowerCase().replace(/\s+/g, ''),
        format: 'number' as const
      };
    });
  }
}

function parseCharts(chartsString: string): ChartConfig[] {
  try {
    return JSON.parse(chartsString);
  } catch {
    return chartsString.split(',').map((chart, index) => {
      const [title, type] = chart.split(':');
      return {
        id: title.toLowerCase().replace(/\s+/g, ''),
        title: title.trim(),
        type: (type?.trim() || 'line') as any,
        dataSource: `${title.toLowerCase().replace(/\s+/g, '')}Data`,
        xAxis: 'name',
        yAxis: 'value',
        height: 300,
        responsive: true
      };
    });
  }
}

function parseTables(tablesString: string): TableConfig[] {
  try {
    return JSON.parse(tablesString);
  } catch {
    return tablesString.split(';').map((table, index) => {
      const [title, columnsStr] = table.split(':');
      const columns = (columnsStr || 'id:ID:number,name:Nome:text').split(',').map(col => {
        const [field, title, type] = col.split('|');
        return {
          field: field.trim(),
          title: title?.trim() || field.trim(),
          type: (type?.trim() || 'text') as 'text' | 'number' | 'date' | 'badge',
          sortable: true
        };
      });

      return {
        id: title.toLowerCase().replace(/\s+/g, ''),
        title: title.trim(),
        dataSource: `${title.toLowerCase().replace(/\s+/g, '')}Data`,
        columns,
        pagination: true,
        searchable: true
      };
    });
  }
}

function parseFilters(filtersString: string): FilterConfig[] {
  try {
    return JSON.parse(filtersString);
  } catch {
    return filtersString.split(',').map((filter, index) => {
      const [label, type, field] = filter.split(':');
      return {
        id: field?.toLowerCase().replace(/\s+/g, '') || `filter${index}`,
        type: (type?.trim() || 'search') as any,
        label: label.trim(),
        field: field?.trim() || label.toLowerCase().replace(/\s+/g, '')
      };
    });
  }
}