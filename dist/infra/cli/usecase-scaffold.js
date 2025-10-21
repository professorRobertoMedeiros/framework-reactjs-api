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
exports.scaffoldUseCase = scaffoldUseCase;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const routes_template_1 = require("./routes-template");
const utils_1 = require("./utils");
// Função para analisar arquivo do modelo e extrair propriedades
function analyzeModelFile(modelName) {
    const possiblePaths = [
        path.join(process.cwd(), 'src', 'core', 'domain', 'models', modelName + 'Model.ts'),
        path.join(process.cwd(), 'src', 'models', modelName + 'Model.ts'),
        path.join(process.cwd(), 'models', modelName + 'Model.ts')
    ];
    let modelPath = '';
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            modelPath = p;
            break;
        }
    }
    if (!modelPath) {
        console.log("⚠️  Aviso: Modelo " + modelName + "Model.ts não encontrado. Arquivos Dom serão gerados vazios.");
        console.log('Caminhos verificados:');
        possiblePaths.forEach(p => console.log("- " + path.relative(process.cwd(), p)));
        return [];
    }
    const content = fs.readFileSync(modelPath, 'utf-8');
    const properties = [];
    // Encontrar a seção da classe primeiro - mais preciso
    let classContent = '';
    // Primeira tentativa: buscar até comentário que precede toJSON
    const classMatch1 = content.match(/export class \w+Model extends BaseModel \{([\s\S]*?)(?:\n\s*\/\/.*(?:Implementação|toJSON|Método))/);
    // Segunda tentativa: buscar até a declaração do método toJSON
    const classMatch2 = content.match(/export class \w+Model extends BaseModel \{([\s\S]*?)(?:\n\s*toJSON\(\))/);
    // Terceira tentativa: buscar até qualquer método
    const classMatch3 = content.match(/export class \w+Model extends BaseModel \{([\s\S]*?)(?:\n\s*\w+\(\))/);
    if (classMatch1) {
        classContent = classMatch1[1];
    }
    else if (classMatch2) {
        classContent = classMatch2[1];
    }
    else if (classMatch3) {
        classContent = classMatch3[1];
    }
    else {
        console.log("⚠️  Aviso: Não foi possível analisar a estrutura da classe " + modelName + "Model.");
        console.log('Certifique-se de que a classe estende BaseModel e segue o padrão esperado.');
        return [];
    }
    // Remover decoradores @Column({...}) e @Id() completamente
    classContent = classContent.replace(/@\w+\(\{[\s\S]*?\}\)\s*/g, '');
    classContent = classContent.replace(/@\w+\(\)\s*/g, '');
    // Regex para capturar tanto propriedades obrigatórias (!) quanto opcionais (?)
    const propertyRegex = /^\s*(\w+)(\?)?[!]?\s*:\s*([^;]+);/gm;
    let match;
    while ((match = propertyRegex.exec(classContent)) !== null) {
        const name = match[1];
        const optional = !!match[2];
        const type = match[3].trim();
        // Verificar se é ID (nome 'id')
        const isId = name === 'id';
        // Verificar se é timestamp
        const isTimestamp = name.includes('_at') || type === 'Date';
        properties.push({
            name,
            type,
            optional,
            isId,
            isTimestamp
        });
    }
    console.log("✅ Analisado " + modelName + "Model: " + properties.length + " propriedades encontradas");
    return properties;
}
// Função para geração de scaffolding de casos de uso
function scaffoldUseCase(modelName) {
    // Implementação
    createScaffolding(toPascalCase(modelName));
}
// Função para converter nome em kebab-case (para pastas)
function toKebabCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/\s+/g, '-')
        .toLowerCase();
}
// Função para converter nome em PascalCase (para classes)
function toPascalCase(str) {
    return str
        .replace(/^([a-z])/, (match) => match.toUpperCase())
        .replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}
// Modelo para criar repositório
function generateRepositoryTemplate(modelName) {
    const insideFramework = (0, utils_1.isInsideFramework)();
    // Ajustar imports baseado no contexto
    const baseRepositoryImport = insideFramework
        ? "import { BaseRepository } from '../../../infra/repository/BaseRepository';"
        : "import { BaseRepository } from 'framework-reactjs-api';";
    const modelImport = insideFramework
        ? "import { " + modelName + "Model } from '../../../core/domain/models/" + modelName + "Model';"
        : "import { " + modelName + "Model } from '@/models/" + modelName + "Model';";
    return baseRepositoryImport + "\n" +
        modelImport + "\n\n" +
        "/**\n" +
        " * Repositório para " + modelName + "\n" +
        " * Estende BaseRepository para operações CRUD básicas\n" +
        " */\n" +
        "export class " + modelName + "Repository extends BaseRepository<" + modelName + "Model> {\n" +
        "  constructor() {\n" +
        "    super(" + modelName + "Model);\n" +
        "  }\n\n" +
        "  /**\n" +
        "   * Mapear dados do banco para o modelo " + modelName + "\n" +
        "   * @param data Dados brutos do banco de dados\n" +
        "   * @returns Instância do modelo " + modelName + "\n" +
        "   */\n" +
        "  protected mapToModel(data: any): " + modelName + "Model {\n" +
        "    const item = new " + modelName + "Model();\n" +
        "    Object.assign(item, data);\n" +
        "    return item;\n" +
        "  }\n\n" +
        "  /**\n" +
        "   * Buscar por condições customizadas\n" +
        "   * @param conditions Condições de busca\n" +
        "   * @param options Opções adicionais\n" +
        "   */\n" +
        "  async findByConditions(\n" +
        "    conditions: Record<string, any>,\n" +
        "    options?: { limit?: number; offset?: number; includes?: string[]; orderBy?: string }\n" +
        "  ): Promise<" + modelName + "Model[]> {\n" +
        "    return this.findBy(conditions, options);\n" +
        "  }\n" +
        "}";
}
// Modelo para criar business
function generateBusinessTemplate(modelName) {
    const properties = analyzeModelFile(modelName);
    const insideFramework = (0, utils_1.isInsideFramework)();
    // Gerar mapeamento de propriedades para toDom
    const toDomProperties = properties
        .map(p => "      " + p.name + ": model." + p.name + ",")
        .join('\n');
    // Ajustar imports baseado no contexto
    const baseBusinessImport = insideFramework
        ? "import { BaseBusiness } from '../../core/business/BaseBusiness';"
        : "import { BaseBusiness } from 'framework-reactjs-api';";
    const modelImport = insideFramework
        ? "import { " + modelName + "Model } from '../../core/domain/models/" + modelName + "Model';"
        : "import { " + modelName + "Model } from '@/models/" + modelName + "Model';";
    return baseBusinessImport + "\n" +
        modelImport + "\n" +
        "import { " + modelName + "Repository } from './repository/" + modelName + "Repository';\n" +
        "import { " + modelName + "Dom } from './domains/" + modelName + "Dom';\n\n" +
        "/**\n" +
        " * Business para " + modelName + "\n" +
        " * Herda de BaseBusiness e delega operações CRUD para o Repository\n" +
        " * Adicione aqui apenas regras de negócio específicas\n" +
        " */\n" +
        "export class " + modelName + "Business extends BaseBusiness<" + modelName + "Model, " + modelName + "Dom> {\n" +
        "  constructor() {\n" +
        "    const repository = new " + modelName + "Repository();\n" +
        "    super(repository);\n" +
        "  }\n\n" +
        "  /**\n" +
        "   * Converter modelo para Dom (DTO) - OPCIONAL\n" +
        "   * Por padrão, o BaseBusiness retorna o próprio modelo sem transformação.\n" +
        "   * Descomente e implemente apenas se precisar transformar os dados.\n" +
        "   * \n" +
        "   * @param model Modelo do " + modelName + "\n" +
        "   * @returns Dom do " + modelName + "\n" +
        "   */\n" +
        "  /*\n" +
        "  protected toDom(model: " + modelName + "Model): " + modelName + "Dom {\n" +
        "    return {\n" +
        (toDomProperties || "      id: model.id,\n      // TODO: Mapear outras propriedades do modelo para o Dom aqui") + "\n" +
        "    };\n" +
        "  }\n" +
        "  */\n\n" +
        "  /**\n" +
        "   * Converter dados de criação para modelo - OPCIONAL\n" +
        "   * Sobrescreva apenas se precisar de validações ou transformações específicas.\n" +
        "   * \n" +
        "   * @param data Dados de entrada\n" +
        "   * @returns Dados formatados para o modelo\n" +
        "   */\n" +
        "  /*\n" +
        "  protected fromCreateData(data: any): Omit<" + modelName + "Model, 'id'> {\n" +
        "    // Exemplo de validação:\n" +
        "    // if (!data.name || data.name.trim().length === 0) {\n" +
        "    //   throw new Error('Nome é obrigatório');\n" +
        "    // }\n" +
        "    \n" +
        "    return data as Omit<" + modelName + "Model, 'id'>;\n" +
        "  }\n" +
        "  */\n\n" +
        "  // Os métodos CRUD (findById, findAll, findBy, create, update, delete, count) \n" +
        "  // são herdados de BaseBusiness e delegam para o Repository\n" +
        "  // Não é necessário reimplementá-los\n\n" +
        "  // Adicione aqui apenas métodos de negócio específicos:\n" +
        "  \n" +
        "  /**\n" +
        "   * Exemplo de método de negócio específico\n" +
        "   * Descomente e adapte conforme necessário\n" +
        "   */\n" +
        "  /*\n" +
        "  async findByCustomField(value: string): Promise<" + modelName + "Dom | null> {\n" +
        "    const results = await this.findBy({ custom_field: value });\n" +
        "    return results.length > 0 ? results[0] : null;\n" +
        "  }\n" +
        "  */\n" +
        "}";
}
// Modelo para criar domain
function generateDomainTemplate(modelName) {
    const properties = analyzeModelFile(modelName);
    // Gerar propriedades para Dom completo (todas as propriedades)
    const domProperties = properties
        .map(p => "  " + p.name + (p.optional ? "?" : "") + ": " + p.type + ";")
        .join('\n');
    return "/**\n" +
        " * Dom (DTO) para " + modelName + "\n" +
        " * Interface de transferência de dados\n" +
        " */\n" +
        "export interface " + modelName + "Dom {\n" +
        (domProperties || "  id: number;\n  // TODO: Adicione aqui as propriedades do Dom") + "\n" +
        "}";
}
// Modelo para criar service
function generateServiceTemplate(modelName) {
    const insideFramework = (0, utils_1.isInsideFramework)();
    // Ajustar imports baseado no contexto
    const baseServiceImport = insideFramework
        ? "import { BaseService } from '../../core/services/BaseService';"
        : "import { BaseService } from 'framework-reactjs-api';";
    const modelImport = insideFramework
        ? "import { " + modelName + "Model } from '../../core/domain/models/" + modelName + "Model';"
        : "import { " + modelName + "Model } from '@/models/" + modelName + "Model';";
    return baseServiceImport + "\n" +
        modelImport + "\n" +
        "import { " + modelName + "Business } from './" + modelName + "Business';\n" +
        "import { " + modelName + "Dom } from './domains/" + modelName + "Dom';\n\n" +
        "/**\n" +
        " * Service para " + modelName + "\n" +
        " * Herda de BaseService e delega operações CRUD para o Business\n" +
        " * Retorna respostas padronizadas: { status, data?, message? }\n" +
        " */\n" +
        "export class " + modelName + "Service extends BaseService<" + modelName + "Model, " + modelName + "Dom> {\n" +
        "  constructor() {\n" +
        "    const business = new " + modelName + "Business();\n" +
        "    super(business);\n" +
        "  }\n\n" +
        "  // Os métodos CRUD (findAll, findById, findBy, create, update, delete, count) \n" +
        "  // são herdados de BaseService e delegam para o Business\n" +
        "  // Não é necessário reimplementá-los\n\n" +
        "  // Adicione aqui apenas métodos de serviço específicos:\n\n" +
        "  /**\n" +
        "   * Exemplo de método de serviço específico\n" +
        "   * Descomente e adapte conforme necessário\n" +
        "   */\n" +
        "  /*\n" +
        "  async findByCustomField(value: string) {\n" +
        "    try {\n" +
        "      const business = this.business as " + modelName + "Business;\n" +
        "      const result = await business.findByCustomField(value);\n" +
        "      \n" +
        "      if (!result) {\n" +
        "        return {\n" +
        "          status: 404,\n" +
        "          message: 'Registro não encontrado'\n" +
        "        };\n" +
        "      }\n\n" +
        "      return {\n" +
        "        status: 200,\n" +
        "        data: result\n" +
        "      };\n" +
        "    } catch (error: any) {\n" +
        "      return {\n" +
        "        status: 500,\n" +
        "        message: error.message || 'Erro ao buscar registro'\n" +
        "      };\n" +
        "    }\n" +
        "  }\n" +
        "  */\n" +
        "}";
}
// Função principal para criar scaffolding
function createScaffolding(modelName) {
    try {
        // Possíveis locais onde o modelo pode estar
        const possibleModelPaths = [
            path.join(process.cwd(), 'src', 'core', 'domain', 'models', modelName + 'Model.ts'),
            path.join(process.cwd(), 'src', 'models', modelName + 'Model.ts'),
            path.join(process.cwd(), 'models', modelName + 'Model.ts'),
            path.join(process.cwd(), 'src', 'core', 'domain', 'models', modelName + 'Model.js'),
            path.join(process.cwd(), 'src', 'models', modelName + 'Model.js'),
            path.join(process.cwd(), 'models', modelName + 'Model.js')
        ];
        // Verifica se o modelo existe em algum dos possíveis caminhos
        const modelPath = possibleModelPaths.find(p => fs.existsSync(p));
        if (!modelPath) {
            console.error("Erro: O modelo " + modelName + "Model.ts não foi encontrado em nenhum diretório conhecido.");
            console.error("Caminhos verificados:\n- src/core/domain/models/\n- src/models/\n- models/");
            return;
        }
        // Caminhos para criar arquivos
        const kebabCaseName = toKebabCase(modelName);
        // Criar estrutura de diretórios
        const srcDir = path.join(process.cwd(), 'src');
        // Verificar se existe diretório src
        const hasSrcDir = fs.existsSync(srcDir);
        // Definir caminhos baseados na estrutura existente
        const baseDir = hasSrcDir ? srcDir : process.cwd();
        // Verificar se existe pasta use-cases ou usecases
        const useCasesDir = fs.existsSync(path.join(baseDir, 'use-cases'))
            ? path.join(baseDir, 'use-cases')
            : path.join(baseDir, 'usecases');
        // Criar diretórios se não existirem
        if (!fs.existsSync(useCasesDir)) {
            fs.mkdirSync(useCasesDir, { recursive: true });
        }
        // Definir caminhos para os arquivos
        const useCaseDirPath = path.join(useCasesDir, kebabCaseName);
        const repositoryDirPath = path.join(useCaseDirPath, 'repository');
        const domainsDirPath = path.join(useCaseDirPath, 'domains');
        const routesDirPath = path.join(useCaseDirPath, 'routes');
        const repositoryPath = path.join(repositoryDirPath, modelName + 'Repository.ts');
        const businessPath = path.join(useCaseDirPath, modelName + 'Business.ts');
        const servicePath = path.join(useCaseDirPath, modelName + 'Service.ts');
        const domainPath = path.join(domainsDirPath, modelName + 'Dom.ts');
        const routesPath = path.join(routesDirPath, modelName + 'Routes.ts');
        // Verificar idempotência (não sobrescrever se já existir)
        const filesToCreate = [
            { path: repositoryPath, content: generateRepositoryTemplate(modelName), name: modelName + 'Repository.ts' },
            { path: businessPath, content: generateBusinessTemplate(modelName), name: modelName + 'Business.ts' },
            { path: servicePath, content: generateServiceTemplate(modelName), name: modelName + 'Service.ts' },
            { path: domainPath, content: generateDomainTemplate(modelName), name: modelName + 'Dom.ts' },
            { path: routesPath, content: (0, routes_template_1.generateRoutesTemplate)(modelName), name: modelName + 'Routes.ts' }
        ];
        // Criar diretórios necessários
        if (!fs.existsSync(useCaseDirPath)) {
            fs.mkdirSync(useCaseDirPath, { recursive: true });
            console.log("Diretório criado: " + path.relative(process.cwd(), useCaseDirPath));
        }
        // Criar diretório de repositório
        if (!fs.existsSync(repositoryDirPath)) {
            fs.mkdirSync(repositoryDirPath, { recursive: true });
            console.log("Diretório criado: " + path.relative(process.cwd(), repositoryDirPath));
        }
        // Criar diretório de domínios
        if (!fs.existsSync(domainsDirPath)) {
            fs.mkdirSync(domainsDirPath, { recursive: true });
            console.log("Diretório criado: " + path.relative(process.cwd(), domainsDirPath));
        }
        // Criar diretório de rotas
        if (!fs.existsSync(routesDirPath)) {
            fs.mkdirSync(routesDirPath, { recursive: true });
            console.log("Diretório criado: " + path.relative(process.cwd(), routesDirPath));
        }
        // Criar cada arquivo se não existir
        for (const file of filesToCreate) {
            if (fs.existsSync(file.path)) {
                console.log("Arquivo " + file.name + " já existe. Pulando...");
            }
            else {
                fs.writeFileSync(file.path, file.content);
                console.log("Arquivo criado: " + file.name);
            }
        }
        console.log("Scaffolding para " + modelName + " concluído com sucesso!");
    }
    catch (error) {
        console.error("Erro ao criar scaffolding: ", error);
    }
}
// Obter o nome do modelo a partir dos argumentos
function getModelNameFromArgs() {
    const args = process.argv.slice(2);
    return args[0]; // O primeiro argumento deve ser o nome do modelo
}
// Função principal
function main() {
    console.log('=== Framework TypeScript DDD - Scaffolding de Use Cases ===');
    const modelName = getModelNameFromArgs();
    if (!modelName) {
        console.error('Erro: Nome do modelo não fornecido.');
        console.log('Uso: npm run usecases:dev <NomeDoModelo>');
        console.log('Exemplo: npm run usecases:dev User');
        process.exit(1);
    }
    // Converter para PascalCase para garantir formatação correta
    const pascalCaseModelName = toPascalCase(modelName);
    createScaffolding(pascalCaseModelName);
}
// Executar o script apenas se for chamado diretamente (não quando importado)
if (require.main === module) {
    main();
}
//# sourceMappingURL=usecase-scaffold.js.map