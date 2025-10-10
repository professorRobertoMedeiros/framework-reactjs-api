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
    return `import { BaseRepository } from 'framework-reactjs-api';
import { ${modelName}Model } from '../../../core/domain/models/${modelName}Model';

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
    
    // Mapear propriedades básicas
    item.id = data.id;
    
    // TODO: Adicione aqui outras propriedades específicas do ${modelName}Model
    // Exemplo:
    // item.name = data.name;
    // item.email = data.email;
    // item.created_at = data.created_at;
    
    // Para mapear todas as propriedades automaticamente (não recomendado para produção):
    Object.assign(item, data);
    
    return item;
  }

  /**
   * Buscar ${modelName.toLowerCase()} por email (exemplo de método customizado)
   * @param email Email para busca
   * @returns ${modelName} encontrado ou null
   */
  async findByEmail(email: string): Promise<${modelName}Model | null> {
    return this.findOneBy({ email });
  }

  /**
   * Buscar ${modelName.toLowerCase()}s ativos (exemplo de método customizado)
   * @param options Opções de consulta
   * @returns Lista de ${modelName.toLowerCase()}s ativos
   */
  async findActive(options?: { limit?: number; offset?: number; orderBy?: string }): Promise<${modelName}Model[]> {
    return this.findBy({ active: true }, options);
  }

  /**
   * Contar ${modelName.toLowerCase()}s por status (exemplo de método customizado)
   * @param status Status para contar
   * @returns Número de registros
   */
  async countByStatus(status: string): Promise<number> {
    return this.count({ status });
  }
}`;
}
// Modelo para criar business
function generateBusinessTemplate(modelName) {
    const properties = analyzeModelFile(modelName);
    // Gerar mapeamento de propriedades para toDom
    const toDomProperties = properties
        .map(p => `      ${p.name}: model.${p.name},`)
        .join('\n');
    return `import { ${modelName}Model } from '../../core/domain/models/${modelName}Model';
import { ${modelName}Repository } from './repository/${modelName}Repository';
import { Create${modelName}Dom, Update${modelName}Dom, ${modelName}Dom } from './domains/${modelName}Dom';

/**
 * Business para ${modelName}
 * Contém as regras de negócio específicas do domínio
 */
export class ${modelName}Business {
  // Injeção de dependência do repository
  public ${modelName.toLowerCase()}Repository: ${modelName}Repository;

  constructor(${modelName.toLowerCase()}Repository?: ${modelName}Repository) {
    this.${modelName.toLowerCase()}Repository = ${modelName.toLowerCase()}Repository || new ${modelName}Repository();
  }

  /**
   * Converter modelo para Dom
   * @param model Modelo do ${modelName}
   * @returns Dom do ${modelName}
   */
  private toDom(model: ${modelName}Model): ${modelName}Dom {
    return {
${toDomProperties || '      id: model.id,\n      // TODO: Mapear outras propriedades do modelo para o Dom aqui'}
    };
  }

  /**
   * Converter Dom de criação para modelo
   * @param dom Dom de criação do ${modelName}
   * @returns Dados para criação do modelo
   */
  private fromCreateDom(dom: Create${modelName}Dom): Omit<${modelName}Model, 'id'> {
    // TODO: Implementar conversão do Dom para modelo
    // Validações e transformações de negócio devem ser feitas aqui
    
    const modelData: any = {
      // Exemplo:
      // name: dom.name,
      // email: dom.email,
      // created_at: new Date(),
    };

    return modelData;
  }

  /**
   * Converter Dom de atualização para dados parciais do modelo
   * @param dom Dom de atualização do ${modelName}
   * @returns Dados parciais para atualização do modelo
   */
  private fromUpdateDom(dom: Update${modelName}Dom): Partial<${modelName}Model> {
    // TODO: Implementar conversão do Dom de atualização para modelo
    // Validações e transformações de negócio devem ser feitas aqui
    
    const modelData: any = {
      // Exemplo:
      // name: dom.name,
      // updated_at: new Date(),
    };

    return modelData;
  }

  /**
   * Obter ${modelName.toLowerCase()} por ID
   * @param id ID do ${modelName.toLowerCase()}
   * @returns Dom do ${modelName} ou null se não encontrado
   */
  async getById(id: number): Promise<${modelName}Dom | null> {
    // Validações de negócio
    if (!id || id <= 0) {
      throw new Error('ID inválido fornecido');
    }

    const result = await this.${modelName.toLowerCase()}Repository.findById(id);
    return result ? this.toDom(result) : null;
  }

  /**
   * Obter todos os ${modelName.toLowerCase()}s
   * @param options Opções de consulta
   * @returns Lista de Doms de ${modelName}
   */
  async getAll(options?: { limit?: number; offset?: number }): Promise<${modelName}Dom[]> {
    const results = await this.${modelName.toLowerCase()}Repository.findAll(options);
    return results.map(result => this.toDom(result));
  }

  /**
   * Criar um novo ${modelName.toLowerCase()}
   * @param data Dados para criação do ${modelName.toLowerCase()}
   * @returns Dom do ${modelName} criado
   */
  async create(data: Create${modelName}Dom): Promise<${modelName}Dom> {
    // Validações de negócio específicas
    await this.validateCreateData(data);
    
    // Converter Dom para modelo
    const modelData = this.fromCreateDom(data);
    
    // Criar no repository
    const created = await this.${modelName.toLowerCase()}Repository.create(modelData);
    
    return this.toDom(created);
  }

  /**
   * Atualizar um ${modelName.toLowerCase()} existente
   * @param id ID do ${modelName.toLowerCase()}
   * @param data Dados para atualização
   * @returns Dom do ${modelName} atualizado ou null se não encontrado
   */
  async update(id: number, data: Update${modelName}Dom): Promise<${modelName}Dom | null> {
    // Validações de negócio
    if (!id || id <= 0) {
      throw new Error('ID inválido fornecido');
    }

    // Verificar se existe
    const existing = await this.${modelName.toLowerCase()}Repository.findById(id);
    if (!existing) {
      return null;
    }
    
    // Validações de negócio específicas para atualização
    await this.validateUpdateData(data);
    
    // Converter Dom para dados de modelo
    const modelData = this.fromUpdateDom(data);
    
    // Atualizar no repository
    const updated = await this.${modelName.toLowerCase()}Repository.update(id, modelData);
    return updated ? this.toDom(updated) : null;
  }

  /**
   * Excluir um ${modelName.toLowerCase()}
   * @param id ID do ${modelName.toLowerCase()}
   * @returns true se excluído com sucesso, false se não encontrado
   */
  async delete(id: number): Promise<boolean> {
    // Validações de negócio
    if (!id || id <= 0) {
      throw new Error('ID inválido fornecido');
    }

    // Verificar se existe antes de excluir
    const existing = await this.${modelName.toLowerCase()}Repository.findById(id);
    if (!existing) {
      return false;
    }

    // Validações de negócio para exclusão
    await this.validateDeleteOperation(existing);

    return await this.${modelName.toLowerCase()}Repository.delete(id);
  }

  /**
   * Validar dados para criação (regras de negócio)
   * @param data Dados para validação
   */
  private async validateCreateData(data: Create${modelName}Dom): Promise<void> {
    // TODO: Implementar validações de negócio específicas para criação
    // Exemplo:
    // if (!data.name || data.name.trim().length === 0) {
    //   throw new Error('Nome é obrigatório');
    // }
    // 
    // if (!data.email || !this.isValidEmail(data.email)) {
    //   throw new Error('Email inválido');
    // }
  }

  /**
   * Validar dados para atualização (regras de negócio)
   * @param data Dados para validação
   */
  private async validateUpdateData(data: Update${modelName}Dom): Promise<void> {
    // TODO: Implementar validações de negócio específicas para atualização
  }

  /**
   * Validar operação de exclusão (regras de negócio)
   * @param model Modelo para validação
   */
  private async validateDeleteOperation(model: ${modelName}Model): Promise<void> {
    // TODO: Implementar validações de negócio para exclusão
    // Exemplo: verificar se não há registros dependentes
  }

  /**
   * Buscar ${modelName.toLowerCase()}s ativos
   * @param options Opções de consulta
   * @returns Lista de ${modelName.toLowerCase()}s ativos
   */
  async findActive(options?: { limit?: number; offset?: number; orderBy?: string }): Promise<${modelName}Dom[]> {
    const results = await this.${modelName.toLowerCase()}Repository.findActive(options);
    return results.map(result => this.toDom(result));
  }

  /**
   * Contar registros (método para compatibilidade com BaseService)
   * @returns Número de registros
   */
  async count(): Promise<number> {
    return await this.${modelName.toLowerCase()}Repository.count();
  }
}`;
}
// Modelo para criar domain
function generateDomainTemplate(modelName) {
    const properties = analyzeModelFile(modelName);
    // Gerar propriedades para CreateDom (excluir id e timestamps automáticos)
    const createProperties = properties
        .filter(p => !p.isId && !p.name.includes('created_at') && !p.name.includes('updated_at'))
        .map(p => `  ${p.name}${p.optional ? '?' : ''}: ${p.type};`)
        .join('\n');
    // Gerar propriedades para UpdateDom (excluir id e created_at, incluir updated_at como opcional)
    const updateProperties = properties
        .filter(p => !p.isId && !p.name.includes('created_at'))
        .map(p => {
        const optional = p.optional || p.name.includes('updated_at');
        return `  ${p.name}${optional ? '?' : ''}: ${p.type};`;
    })
        .join('\n');
    // Gerar propriedades para Dom completo (todas as propriedades)
    const domProperties = properties
        .map(p => `  ${p.name}${p.optional ? '?' : ''}: ${p.type};`)
        .join('\n');
    return `/**
 * Dom para criação de ${modelName.toLowerCase()}
 */
export interface Create${modelName}Dom {
${createProperties || '  // Adicione aqui as propriedades para criar um novo ' + modelName.toLowerCase()}
}

/**
 * Dom para atualização de ${modelName.toLowerCase()}
 */
export interface Update${modelName}Dom {
${updateProperties || '  // Adicione aqui as propriedades para atualizar um ' + modelName.toLowerCase()}
}

/**
 * Dom para representação de ${modelName.toLowerCase()}
 */
export interface ${modelName}Dom {
${domProperties || '  id: number;\n  // Adicione aqui outras propriedades para retorno'}
}`;
}
// Modelo para criar service
function generateServiceTemplate(modelName) {
    return `import { BaseService, ServiceResponse, PaginatedResponse } from 'framework-reactjs-api';
import { ${modelName}Business } from './${modelName}Business';
import { Create${modelName}Dom, Update${modelName}Dom, ${modelName}Dom } from './domains/${modelName}Dom';

/**
 * Serviço para ${modelName}
 * Estende BaseService para operações CRUD padrão
 */
export class ${modelName}Service extends BaseService<${modelName}Dom, Create${modelName}Dom, Update${modelName}Dom> {
  // Instância do business
  private ${modelName.toLowerCase()}Business: ${modelName}Business;

  constructor(${modelName.toLowerCase()}Business?: ${modelName}Business) {
    super();
    this.${modelName.toLowerCase()}Business = ${modelName.toLowerCase()}Business || new ${modelName}Business();
  }

  /**
   * Implementação obrigatória para obter business layer
   * @returns Instância do business
   */
  protected getBusiness(): ${modelName}Business {
    return this.${modelName.toLowerCase()}Business;
  }

  // Os métodos CRUD básicos (getById, getAll, create, update, delete) 
  // são herdados automaticamente da classe BaseService

  /**
   * Método customizado: Buscar ${modelName.toLowerCase()}s ativos
   * @param page Página
   * @param limit Limite por página
   * @returns Lista de ${modelName.toLowerCase()}s ativos
   */
  async getActive(page: number = 1, limit: number = 10): Promise<ServiceResponse<PaginatedResponse<${modelName}Dom>>> {
    try {
      // Validar parâmetros de paginação
      if (page < 1) page = 1;
      if (limit < 1) limit = 10;
      if (limit > 100) limit = 100;

      const offset = (page - 1) * limit;

      // Buscar ${modelName.toLowerCase()}s ativos no business
      const items = await this.${modelName.toLowerCase()}Business.findActive({
        limit,
        offset
      });

      // Para total, poderia implementar um método countActive no business
      const total = items.length; // Simplificado
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: '${modelName}s ativos listados com sucesso',
        data: {
          items,
          total,
          page,
          limit,
          totalPages
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Erro ao listar ${modelName.toLowerCase()}s ativos',
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  /**
   * Método customizado: Contar total de registros
   * @returns Número total de registros
   */
  async count(): Promise<ServiceResponse<number>> {
    try {
      const total = await this.${modelName.toLowerCase()}Business.${modelName.toLowerCase()}Repository.count();
      
      return {
        success: true,
        message: 'Contagem realizada com sucesso',
        data: total
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Erro ao contar registros',
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  // TODO: Adicione aqui outros métodos específicos do domínio ${modelName}
  // Exemplo:
  // async findByStatus(status: string): Promise<ServiceResponse<${modelName}Dom[]>> {
  //   // Implementação específica
  // }
}`;
}
// Modelo para criar arquivo de rotas
function generateRoutesTemplate(modelName) {
    return `import { Router } from 'express';
import { ${modelName}Service } from '../${modelName}Service';
import { AuthMiddleware } from '../../../core/auth/AuthMiddleware';

// Criação do roteador para ${modelName}
const ${modelName.toLowerCase()}Router = Router();
const ${modelName.toLowerCase()}Service = new ${modelName}Service();
const authMiddleware = new AuthMiddleware();

/**
 * @route GET /api/${modelName.toLowerCase()}s
 * @description Buscar todos os registros de ${modelName} com paginação
 * @access Public
 */
${modelName.toLowerCase()}Router.get('/', async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const result = await ${modelName.toLowerCase()}Service.getAll(page, limit);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * @route GET /api/${modelName.toLowerCase()}s/:id
 * @description Buscar um registro específico de ${modelName} por ID
 * @access Public
 */
${modelName.toLowerCase()}Router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Validar se ID é um número válido
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido fornecido',
        error: 'INVALID_ID'
      });
    }
    
    const result = await ${modelName.toLowerCase()}Service.getById(id);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      if (result.error === 'NOT_FOUND') {
        return res.status(404).json(result);
      }
      return res.status(500).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * @route POST /api/${modelName.toLowerCase()}s
 * @description Criar um novo registro de ${modelName}
 * @access Private (requer autenticação)
 */
${modelName.toLowerCase()}Router.post('/', authMiddleware.authenticate(), async (req, res) => {
  try {
    const data = req.body;
    
    // Validação básica - verificar se body não está vazio
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Dados não fornecidos',
        error: 'INVALID_DATA'
      });
    }
    
    const result = await ${modelName.toLowerCase()}Service.create(data);
    
    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/${modelName.toLowerCase()}s/:id
 * @description Atualizar um registro existente de ${modelName}
 * @access Private (requer autenticação)
 */
${modelName.toLowerCase()}Router.put('/:id', authMiddleware.authenticate(), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    
    // Validar se ID é um número válido
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido fornecido',
        error: 'INVALID_ID'
      });
    }
    
    // Validação básica - verificar se body não está vazio
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Dados não fornecidos para atualização',
        error: 'INVALID_DATA'
      });
    }
    
    const result = await ${modelName.toLowerCase()}Service.update(id, data);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      if (result.error === 'NOT_FOUND') {
        return res.status(404).json(result);
      }
      return res.status(400).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/${modelName.toLowerCase()}s/:id
 * @description Excluir um registro de ${modelName}
 * @access Private (requer autenticação)
 */
${modelName.toLowerCase()}Router.delete('/:id', authMiddleware.authenticate(), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Validar se ID é um número válido
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido fornecido',
        error: 'INVALID_ID'
      });
    }
    
    const result = await ${modelName.toLowerCase()}Service.delete(id);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      if (result.error === 'NOT_FOUND') {
        return res.status(404).json(result);
      }
      return res.status(500).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

export default ${modelName.toLowerCase()}Router;

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
 * app.use('/api/${modelName.toLowerCase()}s', ${modelName.toLowerCase()}Router);
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
// Executar o script
main();
//# sourceMappingURL=usecase-scaffold.js.map