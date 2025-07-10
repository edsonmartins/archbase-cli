import * as Handlebars from 'handlebars';
import * as path from 'path';
import * as fs from 'fs-extra';
import { GeneratorError } from '../utils/errors';
import { Logger } from '../utils/logger';
import JavaAnalyzer from '../analyzers/JavaAnalyzer';

export interface ServiceGeneratorOptions {
  serviceName: string;
  entityName: string;
  entityType: string;
  idType?: string;
  endpoint?: string;
  javaController?: string;
  outputPath?: string;
  generateDto?: boolean;
}

export interface ServiceMethod {
  name: string;
  httpMethod: string;
  returnType: string;
  parameters: Array<{
    name: string;
    type: string;
    source: 'path' | 'query' | 'body';
  }>;
  endpoint: string;
}

export class ServiceGenerator {
  private handlebars: typeof Handlebars;
  private templatesDir: string;
  private logger: Logger;
  private javaAnalyzer: JavaAnalyzer;

  constructor() {
    this.handlebars = Handlebars.create();
    this.templatesDir = path.join(__dirname, '..', 'templates');
    this.logger = Logger.getInstance();
    this.javaAnalyzer = new JavaAnalyzer();
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
    this.handlebars.registerHelper('buildMethodParams', (parameters: any[]) => {
      const result = parameters.map(p => `${p.name}: ${p.type}`).join(', ');
      return new this.handlebars.SafeString(result);
    });
    this.handlebars.registerHelper('buildUrlParams', (endpoint: string, parameters: any[]) => {
      let url = endpoint;
      const pathParams = parameters.filter(p => p.source === 'path');
      pathParams.forEach(param => {
        url = url.replace(`{${param.name}}`, `\${${param.name}}`);
      });
      return new this.handlebars.SafeString(url);
    });
    this.handlebars.registerHelper('hasQueryParams', (parameters: any[]) => {
      return parameters.some(p => p.source === 'query');
    });
    this.handlebars.registerHelper('getQueryParams', (parameters: any[]) => {
      return parameters.filter(p => p.source === 'query');
    });
    this.handlebars.registerHelper('shouldTransform', (returnType: string) => {
      return returnType.includes('Dto') && !returnType.includes('[]') && !returnType.includes('List');
    });
    this.handlebars.registerHelper('isArray', (returnType: string) => {
      return returnType.includes('[]') || returnType.includes('List<');
    });
    this.handlebars.registerHelper('getBodyParam', (parameters: any[]) => {
      const bodyParam = parameters.find(p => p.source === 'body');
      const result = bodyParam ? bodyParam.name : '{}';
      return new this.handlebars.SafeString(result);
    });
    this.handlebars.registerHelper('hasBodyParam', (parameters: any[]) => {
      return parameters.some(p => p.source === 'body');
    });
  }

  async generate(options: ServiceGeneratorOptions): Promise<string> {
    try {
      this.logger.info(`Generating service: ${options.serviceName}`);

      // Validate options
      this.validateOptions(options);

      // Prepare data for template
      const templateData = await this.prepareTemplateData(options);

      // Generate service
      const serviceCode = await this.generateService(templateData);

      // Generate DTO if requested
      let dtoCode = '';
      if (options.generateDto) {
        dtoCode = await this.generateDto(templateData);
      }

      // Write files
      const outputPath = options.outputPath || process.cwd();
      const servicePath = await this.writeService(serviceCode, options.serviceName, outputPath);
      
      let dtoPaths: string[] = [];
      if (dtoCode) {
        const dtoPath = await this.writeDto(dtoCode, options.entityName, outputPath);
        dtoPaths.push(dtoPath);
      }

      // Auto-register service in IOC container
      await this.registerServiceInIOC(options, outputPath);

      this.logger.success(`Service generated successfully at: ${servicePath}`);
      if (dtoPaths.length > 0) {
        this.logger.success(`DTOs generated at: ${dtoPaths.join(', ')}`);
      }

      return serviceCode;
    } catch (error) {
      this.logger.error(`Error generating service: ${error}`);
      throw new GeneratorError(`Failed to generate service: ${error}`);
    }
  }

  private validateOptions(options: ServiceGeneratorOptions): void {
    if (!options.serviceName) {
      throw new GeneratorError('Service name is required');
    }
    if (!options.entityName) {
      throw new GeneratorError('Entity name is required');
    }
    if (!options.entityType) {
      throw new GeneratorError('Entity type is required');
    }
  }

  private async prepareTemplateData(options: ServiceGeneratorOptions): Promise<any> {
    // Extract project name from output path or use current directory name
    const outputPath = options.outputPath || process.cwd();
    const projectName = path.basename(outputPath);
    
    const data: any = {
      serviceName: options.serviceName,
      entityName: options.entityName,
      entityType: options.entityType,
      idType: options.idType || 'string',
      endpoint: options.endpoint || `/api/v1/${options.entityName.toLowerCase()}s`,
      hasCustomMethods: false,
      customMethods: [],
      imports: this.getDefaultImports(options.entityType, projectName)
    };

    // If Java controller provided, analyze it
    if (options.javaController) {
      const javaCode = await this.readJavaController(options.javaController);
      const analysis = await this.javaAnalyzer.analyzeController(javaCode);
      
      if (analysis.methods && analysis.methods.length > 0) {
        data.hasCustomMethods = true;
        data.customMethods = this.transformJavaMethods(analysis.methods, data.endpoint);
        data.imports = this.updateImports(data.imports, data.customMethods);
      }
    }

    return data;
  }

  private async readJavaController(controllerPath: string): Promise<string> {
    try {
      if (await fs.pathExists(controllerPath)) {
        return await fs.readFile(controllerPath, 'utf-8');
      } else {
        // If path doesn't exist, assume it's the code itself
        return controllerPath;
      }
    } catch (error) {
      throw new GeneratorError(`Failed to read Java controller: ${error}`);
    }
  }

  private transformJavaMethods(javaMethods: any[], baseEndpoint: string): ServiceMethod[] {
    return javaMethods.map(method => {
      const httpMethod = this.extractHttpMethod(method);
      const endpoint = this.extractEndpoint(method, baseEndpoint);
      const parameters = this.extractParameters(method);
      let returnType = this.mapJavaTypeToTypeScript(method.returnType);
      
      // Remove ResponseEntity wrapper if present
      if (returnType.includes('ResponseEntity<')) {
        returnType = returnType.replace(/ResponseEntity<(.+)>/, '$1');
      }

      return {
        name: method.name,
        httpMethod,
        returnType,
        parameters,
        endpoint
      };
    });
  }

  private extractHttpMethod(method: any): string {
    const annotations = method.annotations || [];
    for (const annotation of annotations) {
      const name = annotation.name.toLowerCase();
      if (name.includes('getmapping')) return 'get';
      if (name.includes('postmapping')) return 'post';
      if (name.includes('putmapping')) return 'put';
      if (name.includes('deletemapping')) return 'delete';
      if (name.includes('patchmapping')) return 'patch';
    }
    return 'get'; // default
  }

  private extractEndpoint(method: any, baseEndpoint: string): string {
    const annotations = method.annotations || [];
    for (const annotation of annotations) {
      if (annotation.value) {
        const value = annotation.value.replace(/['"]/g, '');
        if (value.startsWith('/')) {
          return `${baseEndpoint}${value}`;
        } else {
          return `${baseEndpoint}/${value}`;
        }
      }
    }
    return baseEndpoint;
  }

  private extractParameters(method: any): any[] {
    const params: any[] = [];
    
    if (method.parameters) {
      method.parameters.forEach((param: any) => {
        const source = this.getParameterSource(param);
        params.push({
          name: param.name,
          type: this.mapJavaTypeToTypeScript(param.type),
          source
        });
      });
    }

    return params;
  }

  private getParameterSource(param: any): 'path' | 'query' | 'body' {
    const annotations = param.annotations || [];
    for (const annotation of annotations) {
      const name = annotation.name.toLowerCase();
      if (name.includes('pathvariable')) return 'path';
      if (name.includes('requestparam')) return 'query';
      if (name.includes('requestbody')) return 'body';
    }
    return 'query'; // default
  }

  private mapJavaTypeToTypeScript(javaType: string): string {
    const typeMap: { [key: string]: string } = {
      'String': 'string',
      'Integer': 'number',
      'int': 'number',
      'Long': 'number',
      'long': 'number',
      'Double': 'number',
      'double': 'number',
      'Float': 'number',
      'float': 'number',
      'Boolean': 'boolean',
      'boolean': 'boolean',
      'Date': 'Date',
      'LocalDate': 'Date',
      'LocalDateTime': 'Date',
      'List': 'Array',
      'Set': 'Array',
      'Map': 'Record',
      'void': 'void',
      'Void': 'void'
    };

    // Handle generic types
    const genericMatch = javaType.match(/^(\w+)<(.+)>$/);
    if (genericMatch) {
      const baseType = genericMatch[1];
      const innerType = genericMatch[2];
      const mappedBase = typeMap[baseType] || baseType;
      const mappedInner = this.mapJavaTypeToTypeScript(innerType);
      
      if (mappedBase === 'Array') {
        return `${mappedInner}[]`;
      }
      if (mappedBase === 'Record') {
        return `Record<string, ${mappedInner}>`;
      }
      return `${mappedBase}<${mappedInner}>`;
    }

    // Handle arrays
    if (javaType.endsWith('[]')) {
      const elementType = javaType.slice(0, -2);
      return `${this.mapJavaTypeToTypeScript(elementType)}[]`;
    }

    // Direct mapping or keep original
    return typeMap[javaType] || javaType;
  }

  private getDefaultImports(entityType?: string, projectName?: string): string[] {
    const imports = [
      "import { injectable, inject } from 'inversify';",
      "import { ArchbaseRemoteApiService, ArchbaseRemoteApiClient, ARCHBASE_IOC_API_TYPE } from 'archbase-react';"
    ];
    
    if (entityType) {
      imports.push(`import { ${entityType} } from '../domain/${entityType}';`);
    }

    // Add project-specific IOC types import
    if (projectName) {
      const pascalCaseProjectName = projectName.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join('');
      imports.push(`import { API_TYPE } from '../ioc/${pascalCaseProjectName}IOCTypes';`);
    }
    
    return imports;
  }

  private updateImports(imports: string[], methods: ServiceMethod[]): string[] {
    const additionalImports = new Set<string>();

    // Check if we need additional imports based on return types
    methods.forEach(method => {
      // Extract DTO types from return types (handle arrays and generics)
      const dtoMatch = method.returnType.match(/(\w+Dto)/);
      if (dtoMatch && dtoMatch[1] !== 'ClienteDto') { // Don't re-import the main DTO
        additionalImports.add(`import { ${dtoMatch[1]} } from '../domain/${dtoMatch[1]}';`);
      }
    });

    return [...imports, ...Array.from(additionalImports)];
  }

  private async generateService(data: any): Promise<string> {
    const templatePath = path.join(this.templatesDir, 'service.hbs');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const template = this.handlebars.compile(templateContent);
    return template(data);
  }

  private async generateDto(data: any): Promise<string> {
    const templatePath = path.join(this.templatesDir, 'dto.hbs');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const template = this.handlebars.compile(templateContent);
    return template(data);
  }

  private async writeService(code: string, serviceName: string, outputPath: string): Promise<string> {
    const servicePath = path.join(outputPath, 'services');
    await fs.ensureDir(servicePath);
    
    const filePath = path.join(servicePath, `${serviceName}.ts`);
    await fs.writeFile(filePath, code);
    
    return filePath;
  }

  private async writeDto(code: string, entityName: string, outputPath: string): Promise<string> {
    const dtoPath = path.join(outputPath, 'dto');
    await fs.ensureDir(dtoPath);
    
    const filePath = path.join(dtoPath, `${entityName}Dto.ts`);
    await fs.writeFile(filePath, code);
    
    return filePath;
  }

  /**
   * Automatically register the generated service in the IOC container
   */
  private async registerServiceInIOC(options: ServiceGeneratorOptions, outputPath: string): Promise<void> {
    try {
      await this.updateIOCTypes(options, outputPath);
      await this.updateIOCContainer(options, outputPath);
      this.logger.info(`Auto-registered ${options.serviceName} in IOC container`);
    } catch (error) {
      this.logger.warn(`Could not auto-register service in IOC: ${error.message}`);
      this.logger.info(`Please manually add the service registration to your IOC container`);
    }
  }

  /**
   * Update IOC Types file to include the new service type
   */
  private async updateIOCTypes(options: ServiceGeneratorOptions, outputPath: string): Promise<void> {
    const iocTypesPattern = path.join(outputPath, 'src/ioc/*IOCTypes.ts');
    const glob = await import('glob');
    const iocTypesFiles = glob.glob.sync(iocTypesPattern);
    
    if (iocTypesFiles.length === 0) {
      throw new Error('IOC Types file not found');
    }

    const iocTypesPath = iocTypesFiles[0];
    let content = await fs.readFile(iocTypesPath, 'utf-8');
    
    // Check if service type already exists
    const serviceKey = options.entityName;
    if (content.includes(`${serviceKey}:`)) {
      this.logger.info(`Service type ${serviceKey} already exists in IOC types`);
      return;
    }

    // Add the new service type
    const newTypeEntry = `  ${serviceKey}: "${serviceKey}",`;
    
    // Find the closing brace of API_TYPE and insert before it
    const apiTypeEndPattern = /(\n};)/;
    if (apiTypeEndPattern.test(content)) {
      content = content.replace(apiTypeEndPattern, `\n${newTypeEntry}$1`);
      await fs.writeFile(iocTypesPath, content);
      this.logger.info(`Added ${serviceKey} type to IOC types`);
    } else {
      throw new Error('Could not find API_TYPE object structure in IOC types file');
    }
  }

  /**
   * Update IOC Container file to include the new service registration
   */
  private async updateIOCContainer(options: ServiceGeneratorOptions, outputPath: string): Promise<void> {
    const iocContainerPattern = path.join(outputPath, 'src/ioc/*ContainerIOC.ts');
    const glob = await import('glob');
    const iocContainerFiles = glob.glob.sync(iocContainerPattern);
    
    if (iocContainerFiles.length === 0) {
      throw new Error('IOC Container file not found');
    }

    const iocContainerPath = iocContainerFiles[0];
    let content = await fs.readFile(iocContainerPath, 'utf-8');
    
    // Check if service is already registered
    if (content.includes(`API_TYPE.${options.entityName}`)) {
      this.logger.info(`Service ${options.serviceName} already registered in IOC container`);
      return;
    }

    // Add import for the service
    const serviceImport = `import { ${options.serviceName} } from "../services/${options.serviceName}";`;
    const importInsertPoint = content.lastIndexOf('import');
    const importLineEnd = content.indexOf('\n', importInsertPoint);
    content = content.slice(0, importLineEnd + 1) + serviceImport + '\n' + content.slice(importLineEnd + 1);

    // Add service binding
    const serviceBinding = `container\n  .bind<${options.serviceName}>(API_TYPE.${options.entityName})\n  .to(${options.serviceName});`;
    
    // Find the last container binding and add after it
    const lastBindingPattern = /container\s*\n\s*\.bind[^;]+;/g;
    let lastMatch;
    let match;
    while ((match = lastBindingPattern.exec(content)) !== null) {
      lastMatch = match;
    }
    
    if (lastMatch) {
      const insertPoint = lastMatch.index + lastMatch[0].length;
      content = content.slice(0, insertPoint) + '\n' + serviceBinding + content.slice(insertPoint);
      await fs.writeFile(iocContainerPath, content);
      this.logger.info(`Added ${options.serviceName} registration to IOC container`);
    } else {
      throw new Error('Could not find container bindings in IOC container file');
    }
  }
}

export default ServiceGenerator;