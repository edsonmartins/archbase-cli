"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGenerateServiceCommand = createGenerateServiceCommand;
const commander_1 = require("commander");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const ServiceGenerator_1 = require("../generators/ServiceGenerator");
const logger_1 = require("../utils/logger");
const chalk = __importStar(require("chalk"));
const inquirer = __importStar(require("inquirer"));
function createGenerateServiceCommand() {
    const logger = logger_1.Logger.getInstance();
    return new commander_1.Command('service')
        .description('Gera um service remoto seguindo o padrão Archbase')
        .argument('<name>', 'Nome do service (ex: ClienteRemoteService)')
        .option('-e, --entity <entity>', 'Nome da entidade (ex: Cliente)')
        .option('-t, --type <type>', 'Tipo da entidade/DTO (ex: ClienteDto)')
        .option('-i, --id-type <idType>', 'Tipo do ID (padrão: string)', 'string')
        .option('-p, --endpoint <endpoint>', 'Endpoint da API (ex: /clientes)')
        .option('-j, --java <path>', 'Caminho ou código do controller Java para análise')
        .option('-d, --dto', 'Gerar DTO básico também', false)
        .option('-o, --output <path>', 'Diretório de saída')
        .option('--wizard', 'Usar wizard interativo')
        .action(async (name, options) => {
        try {
            logger.info(`Gerando service: ${name}`);
            let config = {
                serviceName: name,
                ...options
            };
            // Se wizard ativado ou faltam opções obrigatórias
            if (options.wizard || !options.entity || !options.type) {
                config = await runWizard(config);
            }
            // Validações
            if (!config.entity) {
                config.entity = name.replace('RemoteService', '').replace('Service', '');
            }
            if (!config.type) {
                config.type = `${config.entity}Dto`;
            }
            if (!config.endpoint) {
                config.endpoint = `/${config.entity.toLowerCase()}s`;
            }
            // Se foi fornecido um path Java, verificar se é arquivo ou código
            if (config.java) {
                const javaPath = path.resolve(config.java);
                if (await fs.pathExists(javaPath)) {
                    config.javaController = javaPath;
                }
                else {
                    // Assume que é código Java inline
                    config.javaController = config.java;
                }
            }
            const generator = new ServiceGenerator_1.ServiceGenerator();
            const generatorOptions = {
                serviceName: config.serviceName,
                entityName: config.entity,
                entityType: config.type,
                idType: config.idType,
                endpoint: config.endpoint,
                javaController: config.javaController,
                outputPath: config.output,
                generateDto: config.dto
            };
            await generator.generate(generatorOptions);
            logger.success(chalk.green(`\n✅ Service gerado com sucesso!`));
            if (config.javaController) {
                logger.info(chalk.blue('Métodos customizados foram adicionados baseados no controller Java.'));
            }
            else {
                logger.info(chalk.yellow('Apenas a estrutura básica foi gerada. Forneça um controller Java para gerar métodos customizados.'));
            }
        }
        catch (error) {
            logger.error(`Erro ao gerar service: ${error}`);
            process.exit(1);
        }
    });
}
async function runWizard(initialConfig) {
    const questions = [];
    if (!initialConfig.entity) {
        questions.push({
            type: 'input',
            name: 'entity',
            message: 'Nome da entidade:',
            default: initialConfig.serviceName.replace('RemoteService', '').replace('Service', ''),
            validate: (input) => input.length > 0 || 'Nome da entidade é obrigatório'
        });
    }
    if (!initialConfig.type) {
        questions.push({
            type: 'input',
            name: 'type',
            message: 'Tipo da entidade/DTO:',
            default: (answers) => `${answers.entity || initialConfig.entity}Dto`
        });
    }
    questions.push({
        type: 'input',
        name: 'idType',
        message: 'Tipo do ID:',
        default: initialConfig.idType || 'string'
    });
    questions.push({
        type: 'input',
        name: 'endpoint',
        message: 'Endpoint da API:',
        default: (answers) => `/${(answers.entity || initialConfig.entity).toLowerCase()}s`
    });
    questions.push({
        type: 'confirm',
        name: 'hasJavaController',
        message: 'Você tem um controller Java para analisar?',
        default: false
    });
    questions.push({
        type: 'input',
        name: 'java',
        message: 'Caminho do controller Java ou cole o código:',
        when: (answers) => answers.hasJavaController,
        validate: (input) => input.length > 0 || 'Forneça o caminho ou código Java'
    });
    questions.push({
        type: 'confirm',
        name: 'dto',
        message: 'Gerar DTO básico também?',
        default: initialConfig.dto || false
    });
    questions.push({
        type: 'input',
        name: 'output',
        message: 'Diretório de saída:',
        default: initialConfig.output || process.cwd()
    });
    const answers = await inquirer.prompt(questions);
    return { ...initialConfig, ...answers };
}
//# sourceMappingURL=generate-service.js.map