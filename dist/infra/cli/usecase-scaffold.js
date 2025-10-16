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
// Detectar se estamos dentro do framework ou em um projeto externo
function isInsideFramework() {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        return packageJson.name === 'framework-reactjs-api';
    }
    return false;
}
// Função para analisar arquivo do modelo e extrair propriedades
function analyzeModelFile(modelName) {
    const possiblePaths = [
        path.join(process.cwd(), 'src', 'core', 'domain', 'models', `${modelName}Model.ts`),
        path.join(process.cwd(), 'src', 'models', `${modelName}Model.ts`),
        path.join(process.cwd(), 'models', `${modelName}Model.ts`)
    ];
    let modelPath = '';
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            modelPath = p;
            break;
        }
    }
    if (!modelPath) {
        console.log(`⚠️  Aviso: Modelo ${modelName}Model.ts não encontrado. Arquivos Dom serão gerados vazios.`);
        console.log('Caminhos verificados:');
        possiblePaths.forEach(p => console.log(`- ${path.relative(process.cwd(), p)}`));
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
        console.log(`⚠️  Aviso: Não foi possível analisar a estrutura da classe ${modelName}Model.`);
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
    console.log(`✅ Analisado ${modelName}Model: ${properties.length} propriedades encontradas`);
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
    const insideFramework = isInsideFramework();
    // Ajustar imports baseado no contexto
    const baseRepositoryImport = insideFramework
        ? `import { BaseRepository } from '../../../infra/repository/BaseRepository';`
        : `import { BaseRepository } from 'framework-reactjs-api';`;
    const modelImport = insideFramework
        ? `import { ${modelName}Model } from '../../../core/domain/models/${modelName}Model';`
        : `import { ${modelName}Model } from '@/models/${modelName}Model';`;
    return `${baseRepositoryImport}
${modelImport}

/**
 * Repositório para ${modelName}
 * Estende BaseRepository para operações CRUD básicas
 */
export class ${modelName}Repository extends BaseRepository<${modelName}Model> {
  constructor() {
    super(${modelName}Model);
  }

  /**
   * Mapear dados do banco para o modelo ${modelName}
   * @param data Dados brutos do banco de dados
   * @returns Instância do modelo ${modelName}
   */
  protected mapToModel(data: any): ${modelName}Model {
    const item = new ${modelName}Model();
    Object.assign(item, data);
    return item;
  }

  /**
   * Buscar por condições customizadas
   * @param conditions Condições de busca
   * @param options Opções adicionais
   */
  async findByConditions(
    conditions: Record<string, any>,
    options?: { limit?: number; offset?: number; includes?: string[]; orderBy?: string }
  ): Promise<${modelName}Model[]> {
    return this.findBy(conditions, options);
  }
}`;
}
// Modelo para criar business
function generateBusinessTemplate(modelName) {
    const properties = analyzeModelFile(modelName);
    const insideFramework = isInsideFramework();
    // Gerar mapeamento de propriedades para toDom
    const toDomProperties = properties
        .map(p => `      ${p.name}: model.${p.name},`)
        .join('\n');
    // Ajustar imports baseado no contexto
    const baseBusinessImport = insideFramework
        ? `import { BaseBusiness } from '../../core/business/BaseBusiness';`
        : `import { BaseBusiness } from 'framework-reactjs-api';`;
    const modelImport = insideFramework
        ? `import { ${modelName}Model } from '../../core/domain/models/${modelName}Model';`
        : `import { ${modelName}Model } from '@/models/${modelName}Model';`;
    return `${baseBusinessImport}
${modelImport}
import { ${modelName}Repository } from './repository/${modelName}Repository';
import { ${modelName}Dom } from './domains/${modelName}Dom';

/**
 * Business para ${modelName}
 * Herda de BaseBusiness e delega operações CRUD para o Repository
 * Adicione aqui apenas regras de negócio específicas
 */
export class ${modelName}Business extends BaseBusiness<${modelName}Model, ${modelName}Dom> {
  constructor() {
    const repository = new ${modelName}Repository();
    super(repository);
  }

  /**
   * Converter modelo para Dom (DTO)
   * @param model Modelo do ${modelName}
   * @returns Dom do ${modelName}
   */
  protected toDom(model: ${modelName}Model): ${modelName}Dom {
    return {
${toDomProperties || '      id: model.id,\n      // TODO: Mapear outras propriedades do modelo para o Dom aqui'}
    };
  }

  /**
   * Converter dados de criação para modelo (opcional - sobrescrever se necessário)
   * @param data Dados de entrada
   * @returns Dados formatados para o modelo
   */
  protected fromCreateData(data: any): Omit<${modelName}Model, 'id'> {
    // TODO: Adicione validações e transformações de negócio aqui
    // Exemplo:
    // if (!data.name || data.name.trim().length === 0) {
    //   throw new Error('Nome é obrigatório');
    // }
    
    return data as Omit<${modelName}Model, 'id'>;
  }

  // Os métodos CRUD (findById, findAll, findBy, create, update, delete, count) 
  // são herdados de BaseBusiness e delegam para o Repository
  // Não é necessário reimplementá-los

  // Adicione aqui apenas métodos de negócio específicos:
  
  /**
   * Exemplo de método de negócio específico
   * Descomente e adapte conforme necessário
   */
  /*
  async findByCustomField(value: string): Promise<${modelName}Dom | null> {
    const results = await this.findBy({ custom_field: value });
    return results.length > 0 ? results[0] : null;
  }
  */
}`;
}
// Modelo para criar domain
function generateDomainTemplate(modelName) {
    const properties = analyzeModelFile(modelName);
    // Gerar propriedades para Dom completo (todas as propriedades)
    const domProperties = properties
        .map(p => `  ${p.name}${p.optional ? '?' : ''}: ${p.type};`)
        .join('\n');
    return `/**
 * Dom (DTO) para ${modelName}
 * Interface de transferência de dados
 */
export interface ${modelName}Dom {
${domProperties || '  id: number;\n  // TODO: Adicione aqui as propriedades do Dom'}
}`;
}
// Modelo para criar service
function generateServiceTemplate(modelName) {
    const insideFramework = isInsideFramework();
    // Ajustar imports baseado no contexto
    const baseServiceImport = insideFramework
        ? `import { BaseService } from '../../core/services/BaseService';`
        : `import { BaseService } from 'framework-reactjs-api';`;
    const modelImport = insideFramework
        ? `import { ${modelName}Model } from '../../core/domain/models/${modelName}Model';`
        : `import { ${modelName}Model } from '@/models/${modelName}Model';`;
    return `${baseServiceImport}
${modelImport}
import { ${modelName}Business } from './${modelName}Business';
import { ${modelName}Dom } from './domains/${modelName}Dom';

/**
 * Service para ${modelName}
 * Herda de BaseService e delega operações CRUD para o Business
 * Retorna respostas padronizadas: { status, data?, message? }
 */
export class ${modelName}Service extends BaseService<${modelName}Model, ${modelName}Dom> {
  constructor() {
    const business = new ${modelName}Business();
    super(business);
  }

  // Os métodos CRUD (findAll, findById, findBy, create, update, delete, count) 
  // são herdados de BaseService e delegam para o Business
  // Não é necessário reimplementá-los

  // Adicione aqui apenas métodos de serviço específicos:

  /**
   * Exemplo de método de serviço específico
   * Descomente e adapte conforme necessário
   */
  /*
  async findByCustomField(value: string) {
    try {
      const business = this.business as ${modelName}Business;
      const result = await business.findByCustomField(value);
      
      if (!result) {
        return {
          status: 404,
          message: 'Registro não encontrado'
        };
      }

      return {
        status: 200,
        data: result
      };
    } catch (error: any) {
      return {
        status: 500,
        message: error.message || 'Erro ao buscar registro'
      };
    }
  }
  */
}`;
}
// Modelo para criar arquivo de rotas
function generateRoutesTemplate(modelName) {
    return `import { Router, Request, Response } from 'express';
import { ${modelName}Service } from '../${modelName}Service';

const router = Router();
const service = new ${modelName}Service();

/**
 * GET /${modelName.toLowerCase()}
 * Listar todos os registros
 */
router.get('/', async (req: Request, res: Response) => {
  const { limit, offset, orderBy, ...conditions } = req.query;
  
  const result = await service.findAll({
    conditions: Object.keys(conditions).length > 0 ? conditions as Record<string, any> : undefined,
    limit: limit ? Number(limit) : undefined,
    offset: offset ? Number(offset) : undefined,
    orderBy: orderBy as string,
    includes: req.query.includes ? String(req.query.includes).split(',') : undefined,
  });

  return res.status(result.status).json(result);
});

/**
 * GET /${modelName.toLowerCase()}/:id
 * Buscar registro por ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  
  const result = await service.findById(id);
  
  return res.status(result.status).json(result);
});

/**
 * POST /${modelName.toLowerCase()}
 * Criar novo registro
 */
router.post('/', async (req: Request, res: Response) => {
  const result = await service.create(req.body);
  
  return res.status(result.status).json(result);
});

/**
 * PUT /${modelName.toLowerCase()}/:id
 * Atualizar registro existente
 */
router.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  
  const result = await service.update(id, req.body);
  
  return res.status(result.status).json(result);
});

/**
 * DELETE /${modelName.toLowerCase()}/:id
 * Deletar registro
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  
  const result = await service.delete(id);
  
  return res.status(result.status).json(result);
});

/**
 * GET /${modelName.toLowerCase()}/count
 * Contar registros
 */
router.get('/count', async (req: Request, res: Response) => {
  const result = await service.count(req.query as Record<string, any>);
  
  return res.status(result.status).json(result);
});

export default router;

/**
 * Exemplo de uso em um app Express:
 * 
 * import express from 'express';
 * import ${modelName.toLowerCase()}Router from './use-cases/${modelName.toLowerCase()}/routes/${modelName}Routes';
 * 
 * const app = express();
 * app.use(express.json());
 * 
 * // Registrar as rotas
 * app.use('/api/${modelName.toLowerCase()}', ${modelName.toLowerCase()}Router);
 * 
 * app.listen(3000, () => {
 *   console.log('Servidor rodando na porta 3000');
 * });
 */`;
}
// Função principal para criar scaffolding
function createScaffolding(modelName) {
    try {
        // Possíveis locais onde o modelo pode estar
        const possibleModelPaths = [
            path.join(process.cwd(), 'src', 'core', 'domain', 'models', `${modelName}Model.ts`),
            path.join(process.cwd(), 'src', 'models', `${modelName}Model.ts`),
            path.join(process.cwd(), 'models', `${modelName}Model.ts`),
            path.join(process.cwd(), 'src', 'core', 'domain', 'models', `${modelName}Model.js`),
            path.join(process.cwd(), 'src', 'models', `${modelName}Model.js`),
            path.join(process.cwd(), 'models', `${modelName}Model.js`)
        ];
        // Verifica se o modelo existe em algum dos possíveis caminhos
        const modelPath = possibleModelPaths.find(path => fs.existsSync(path));
        if (!modelPath) {
            console.error(`\x1b[31mErro: O modelo ${modelName}Model.ts não foi encontrado em nenhum diretório conhecido.\x1b[0m`);
            console.error(`\x1b[33mCaminhos verificados:\n- src/core/domain/models/\n- src/models/\n- models/\x1b[0m`);
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
        const repositoryPath = path.join(repositoryDirPath, `${modelName}Repository.ts`);
        const businessPath = path.join(useCaseDirPath, `${modelName}Business.ts`);
        const servicePath = path.join(useCaseDirPath, `${modelName}Service.ts`);
        const domainPath = path.join(domainsDirPath, `${modelName}Dom.ts`);
        const routesPath = path.join(routesDirPath, `${modelName}Routes.ts`);
        // Verificar idempotência (não sobrescrever se já existir)
        const filesToCreate = [
            { path: repositoryPath, content: generateRepositoryTemplate(modelName), name: `${modelName}Repository.ts` },
            { path: businessPath, content: generateBusinessTemplate(modelName), name: `${modelName}Business.ts` },
            { path: servicePath, content: generateServiceTemplate(modelName), name: `${modelName}Service.ts` },
            { path: domainPath, content: generateDomainTemplate(modelName), name: `${modelName}Dom.ts` },
            { path: routesPath, content: generateRoutesTemplate(modelName), name: `${modelName}Routes.ts` }
        ];
        // Criar diretórios necessários
        if (!fs.existsSync(useCaseDirPath)) {
            fs.mkdirSync(useCaseDirPath, { recursive: true });
            console.log(`\x1b[32mDiretório criado: ${path.relative(process.cwd(), useCaseDirPath)}\x1b[0m`);
        }
        // Criar diretório de repositório
        if (!fs.existsSync(repositoryDirPath)) {
            fs.mkdirSync(repositoryDirPath, { recursive: true });
            console.log(`\x1b[32mDiretório criado: ${path.relative(process.cwd(), repositoryDirPath)}\x1b[0m`);
        }
        // Criar diretório de domínios
        if (!fs.existsSync(domainsDirPath)) {
            fs.mkdirSync(domainsDirPath, { recursive: true });
            console.log(`\x1b[32mDiretório criado: ${path.relative(process.cwd(), domainsDirPath)}\x1b[0m`);
        }
        // Criar diretório de rotas
        if (!fs.existsSync(routesDirPath)) {
            fs.mkdirSync(routesDirPath, { recursive: true });
            console.log(`\x1b[32mDiretório criado: ${path.relative(process.cwd(), routesDirPath)}\x1b[0m`);
        }
        // Criar cada arquivo se não existir
        for (const file of filesToCreate) {
            if (fs.existsSync(file.path)) {
                console.log(`\x1b[33mArquivo ${file.name} já existe. Pulando...\x1b[0m`);
            }
            else {
                fs.writeFileSync(file.path, file.content);
                console.log(`\x1b[32mArquivo criado: ${file.name}\x1b[0m`);
            }
        }
        console.log(`\x1b[32mScaffolding para ${modelName} concluído com sucesso!\x1b[0m`);
    }
    catch (error) {
        console.error(`\x1b[31mErro ao criar scaffolding: ${error}\x1b[0m`);
    }
}
// Obter o nome do modelo a partir dos argumentos
function getModelNameFromArgs() {
    const args = process.argv.slice(2);
    return args[0]; // O primeiro argumento deve ser o nome do modelo
}
// Função principal
function main() {
    console.log('\x1b[34m=== Framework TypeScript DDD - Scaffolding de Use Cases ===\x1b[0m');
    const modelName = getModelNameFromArgs();
    if (!modelName) {
        console.error('\x1b[31mErro: Nome do modelo não fornecido.\x1b[0m');
        console.log('\x1b[33mUso: npm run usecases:dev <NomeDoModelo>\x1b[0m');
        console.log('\x1b[33mExemplo: npm run usecases:dev User\x1b[0m');
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