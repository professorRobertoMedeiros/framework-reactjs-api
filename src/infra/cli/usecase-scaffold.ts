import * as fs from 'fs';
import * as path from 'path';

// Função para geração de scaffolding de casos de uso
export function scaffoldUseCase(modelName: string): void {
  // Implementação
  createScaffolding(toPascalCase(modelName));
}

// Função para converter nome em kebab-case (para pastas)
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

// Função para converter nome em PascalCase (para classes)
function toPascalCase(str: string): string {
  return str
    .replace(/^([a-z])/, (match) => match.toUpperCase())
    .replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

// Modelo para criar repositório
function generateRepositoryTemplate(modelName: string): string {
  return `import { CustomORM } from 'framework-reactjs-api';
import { ${modelName}Model } from '../models/${modelName}Model';

// Interface para o repository de ${modelName.toLowerCase()}s
export interface I${modelName}Repository {
  findById(id: number): Promise<${modelName}Model | null>;
  findAll(options?: { limit?: number; offset?: number }): Promise<${modelName}Model[]>;
  create(data: Omit<${modelName}Model, 'id'>): Promise<${modelName}Model>;
  update(id: number, data: Partial<${modelName}Model>): Promise<${modelName}Model | null>;
  delete(id: number): Promise<boolean>;
  count(): Promise<number>;
}

// Implementação do repository de ${modelName.toLowerCase()}s
export class ${modelName}Repository implements I${modelName}Repository {
  private orm: CustomORM;
  private tableName: string;

  constructor() {
    this.orm = CustomORM.getInstance();
    this.tableName = ${modelName}Model.getTableName();
  }

  // Mapear dados do banco para o modelo
  private mapToModel(data: any): ${modelName}Model {
    const item = new ${modelName}Model();
    
    // Mapear propriedades do resultado para o modelo
    // Este é um exemplo básico, ajustar conforme as propriedades do seu modelo
    Object.assign(item, data);
    
    return item;
  }

  // Buscar por ID
  async findById(id: number): Promise<${modelName}Model | null> {
    const result = await this.orm.findById<any>(this.tableName, id);
    return result ? this.mapToModel(result) : null;
  }

  // Buscar todos
  async findAll(options?: { limit?: number; offset?: number }): Promise<${modelName}Model[]> {
    const results = await this.orm.findAll<any>(this.tableName, {
      ...options,
      orderBy: 'id ASC'
    });
    return results.map(result => this.mapToModel(result));
  }

  // Criar um novo registro
  async create(data: Omit<${modelName}Model, 'id'>): Promise<${modelName}Model> {
    const result = await this.orm.create<${modelName}Model>(this.tableName, data);
    return this.mapToModel(result);
  }

  // Atualizar um registro existente
  async update(id: number, data: Partial<${modelName}Model>): Promise<${modelName}Model | null> {
    const result = await this.orm.update<${modelName}Model>(this.tableName, id, data);
    return result ? this.mapToModel(result) : null;
  }

  // Excluir um registro
  async delete(id: number): Promise<boolean> {
    return await this.orm.delete(this.tableName, id);
  }

  // Contar registros
  async count(): Promise<number> {
    return await this.orm.count(this.tableName);
  }
}`;
}

// Modelo para criar business
function generateBusinessTemplate(modelName: string): string {
  return `import { ${modelName}Model } from '../models/${modelName}Model';
import { I${modelName}Repository, ${modelName}Repository } from './repository/${modelName}Repository';

// Interface para o business de ${modelName.toLowerCase()}s
export interface I${modelName}Business {
  getById(id: number): Promise<${modelName}Dom | null>;
  getAll(options?: { limit?: number; offset?: number }): Promise<${modelName}Dom[]>;
  create(data: Create${modelName}Dom): Promise<${modelName}Dom>;
  update(id: number, data: Update${modelName}Dom): Promise<${modelName}Dom | null>;
  delete(id: number): Promise<boolean>;
}

// Implementação do business de ${modelName.toLowerCase()}s
export class ${modelName}Business implements I${modelName}Business {
  // Injeção de dependência do repository
  public ${modelName.toLowerCase()}Repository: I${modelName}Repository;

  constructor(${modelName.toLowerCase()}Repository?: I${modelName}Repository) {
    this.${modelName.toLowerCase()}Repository = ${modelName.toLowerCase()}Repository || new ${modelName}Repository();
  }

  // Importar os domínios
  // Importar domínios
  private domains = require('./domains/${modelName}Dom');

  // Converter modelo para Dom
  private toDom(model: ${modelName}Model): ${modelName}Dom {
    return {
      id: model.id,
      // Mapear outras propriedades do modelo para o Dom aqui
    };
  }

  // Obter por ID
  async getById(id: number): Promise<${modelName}Dom | null> {
    const result = await this.${modelName.toLowerCase()}Repository.findById(id);
    return result ? this.toDom(result) : null;
  }

  // Obter todos
  async getAll(options?: { limit?: number; offset?: number }): Promise<${modelName}Dom[]> {
    const results = await this.${modelName.toLowerCase()}Repository.findAll(options);
    return results.map(result => this.toDom(result));
  }

  // Criar um novo registro
  async create(data: Create${modelName}Dom): Promise<${modelName}Dom> {
    // Implementar lógica de validação e criação do modelo aqui
    
    // Exemplo básico
    const model = new ${modelName}Model();
    // Preencher modelo com dados
    // Object.assign(model, data);
    
    const created = await this.${modelName.toLowerCase()}Repository.create(model);
    return this.toDom(created);
  }

  // Atualizar um registro existente
  async update(id: number, data: Update${modelName}Dom): Promise<${modelName}Dom | null> {
    // Verificar se existe
    const existing = await this.${modelName.toLowerCase()}Repository.findById(id);
    if (!existing) {
      return null;
    }
    
    // Implementar lógica de validação e atualização aqui
    
    // Exemplo básico
    const updated = await this.${modelName.toLowerCase()}Repository.update(id, data);
    return updated ? this.toDom(updated) : null;
  }

  // Excluir um registro
  async delete(id: number): Promise<boolean> {
    return await this.${modelName.toLowerCase()}Repository.delete(id);
  }
}`;
}

// Modelo para criar domain
function generateDomainTemplate(modelName: string): string {
  return `/**
 * Dom para criação de ${modelName.toLowerCase()}
 */
export interface Create${modelName}Dom {
  // Adicione aqui as propriedades para criar um novo ${modelName.toLowerCase()}
}

/**
 * Dom para atualização de ${modelName.toLowerCase()}
 */
export interface Update${modelName}Dom {
  // Adicione aqui as propriedades para atualizar um ${modelName.toLowerCase()}
}

/**
 * Dom para representação de ${modelName.toLowerCase()}
 */
export interface ${modelName}Dom {
  id: number;
  // Adicione aqui outras propriedades para retorno
}`;
}

// Modelo para criar service
function generateServiceTemplate(modelName: string): string {
  return `import { I${modelName}Business, ${modelName}Business } from './${modelName}Business';
import { Create${modelName}Dom, Update${modelName}Dom, ${modelName}Dom } from './domains/${modelName}Dom';

// Response interface para transferência de dados na camada de serviço
export interface ${modelName}ServiceResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Interface para o serviço de ${modelName.toLowerCase()}s
export interface I${modelName}Service {
  getById(id: number): Promise<${modelName}ServiceResponse<${modelName}Dom>>;
  getAll(page?: number, limit?: number): Promise<${modelName}ServiceResponse<{
    items: ${modelName}Dom[],
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }>>;
  create(data: Create${modelName}Dom): Promise<${modelName}ServiceResponse<${modelName}Dom>>;
  update(id: number, data: Update${modelName}Dom): Promise<${modelName}ServiceResponse<${modelName}Dom>>;
  delete(id: number): Promise<${modelName}ServiceResponse>;
}

// Implementação do serviço de ${modelName.toLowerCase()}s
export class ${modelName}Service implements I${modelName}Service {
  // Injeção de dependência do business
  private ${modelName.toLowerCase()}Business: I${modelName}Business;

  constructor(${modelName.toLowerCase()}Business?: I${modelName}Business) {
    this.${modelName.toLowerCase()}Business = ${modelName.toLowerCase()}Business || new ${modelName}Business();
  }

  // Obter por ID
  async getById(id: number): Promise<${modelName}ServiceResponse<${modelName}Dom>> {
    try {
      const result = await this.${modelName.toLowerCase()}Business.getById(id);
      
      if (!result) {
        return {
          success: false,
          message: \`${modelName} com ID \${id} não encontrado\`,
          error: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        message: '${modelName} encontrado com sucesso',
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Erro ao buscar ${modelName.toLowerCase()}',
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  // Obter todos com paginação
  async getAll(
    page: number = 1, 
    limit: number = 10
  ): Promise<${modelName}ServiceResponse<{
    items: ${modelName}Dom[],
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }>> {
    try {
      // Validar parâmetros de paginação
      if (page < 1) page = 1;
      if (limit < 1) limit = 10;
      if (limit > 100) limit = 100;

      const offset = (page - 1) * limit;

      // Buscar dados no business
      const items = await this.${modelName.toLowerCase()}Business.getAll({
        limit,
        offset
      });

      // Contar total de registros
      const total = await this.${modelName.toLowerCase()}Business.${modelName.toLowerCase()}Repository.count();
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: '${modelName}s listados com sucesso',
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
        message: 'Erro ao listar ${modelName.toLowerCase()}s',
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  // Criar um novo registro
  async create(data: Create${modelName}Dom): Promise<${modelName}ServiceResponse<${modelName}Dom>> {
    try {
      // Implementar validações de dados de entrada aqui
      
      // Criar no business
      const created = await this.${modelName.toLowerCase()}Business.create(data);

      return {
        success: true,
        message: '${modelName} criado com sucesso',
        data: created
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Erro ao criar ${modelName.toLowerCase()}',
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  // Atualizar um registro existente
  async update(id: number, data: Update${modelName}Dom): Promise<${modelName}ServiceResponse<${modelName}Dom>> {
    try {
      // Implementar validações de dados de entrada aqui
      
      // Atualizar no business
      const updated = await this.${modelName.toLowerCase()}Business.update(id, data);

      if (!updated) {
        return {
          success: false,
          message: \`${modelName} com ID \${id} não encontrado\`,
          error: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        message: '${modelName} atualizado com sucesso',
        data: updated
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Erro ao atualizar ${modelName.toLowerCase()}',
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  // Excluir um registro
  async delete(id: number): Promise<${modelName}ServiceResponse> {
    try {
      const deleted = await this.${modelName.toLowerCase()}Business.delete(id);

      if (!deleted) {
        return {
          success: false,
          message: \`${modelName} com ID \${id} não encontrado\`,
          error: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        message: '${modelName} excluído com sucesso'
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Erro ao excluir ${modelName.toLowerCase()}',
        error: error.message || 'Erro desconhecido'
      };
    }
  }
}`;
}

// Modelo para criar arquivo de rotas
function generateRoutesTemplate(modelName: string): string {
  return `import express from 'express';
import { ${modelName}Service } from './${modelName}Service';
import { AuthMiddleware } from 'framework-reactjs-api';

// Criação do roteador para ${modelName}
const ${modelName.toLowerCase()}Router = express.Router();
const ${modelName.toLowerCase()}Service = new ${modelName}Service();

// Middleware de autenticação para rotas protegidas
const authMiddleware = AuthMiddleware.verifyToken;

// Rota para buscar todos os registros (GET /api/${modelName.toLowerCase()}s)
${modelName.toLowerCase()}Router.get('/', async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

  const result = await ${modelName.toLowerCase()}Service.getAll(page, limit);
  
  if (result.success) {
    return res.status(200).json(result);
  } else {
    return res.status(500).json(result);
  }
});

// Rota para buscar um registro específico (GET /api/${modelName.toLowerCase()}s/:id)
${modelName.toLowerCase()}Router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const result = await ${modelName.toLowerCase()}Service.getById(id);
  
  if (result.success) {
    return res.status(200).json(result);
  } else {
    if (result.error === 'NOT_FOUND') {
      return res.status(404).json(result);
    }
    return res.status(500).json(result);
  }
});

// Rota para criar um novo registro (POST /api/${modelName.toLowerCase()}s) - Protegida
${modelName.toLowerCase()}Router.post('/', authMiddleware, async (req, res) => {
  const data = req.body;
  const result = await ${modelName.toLowerCase()}Service.create(data);
  
  if (result.success) {
    return res.status(201).json(result);
  } else {
    return res.status(400).json(result);
  }
});

// Rota para atualizar um registro (PUT /api/${modelName.toLowerCase()}s/:id) - Protegida
${modelName.toLowerCase()}Router.put('/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body;
  const result = await ${modelName.toLowerCase()}Service.update(id, data);
  
  if (result.success) {
    return res.status(200).json(result);
  } else {
    if (result.error === 'NOT_FOUND') {
      return res.status(404).json(result);
    }
    return res.status(400).json(result);
  }
});

// Rota para excluir um registro (DELETE /api/${modelName.toLowerCase()}s/:id) - Protegida
${modelName.toLowerCase()}Router.delete('/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  const result = await ${modelName.toLowerCase()}Service.delete(id);
  
  if (result.success) {
    return res.status(200).json(result);
  } else {
    if (result.error === 'NOT_FOUND') {
      return res.status(404).json(result);
    }
    return res.status(500).json(result);
  }
});

export default ${modelName.toLowerCase()}Router;`;
}

// Função principal para criar scaffolding
function createScaffolding(modelName: string) {
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
      } else {
        fs.writeFileSync(file.path, file.content);
        console.log(`\x1b[32mArquivo criado: ${file.name}\x1b[0m`);
      }
    }

    console.log(`\x1b[32mScaffolding para ${modelName} concluído com sucesso!\x1b[0m`);
  } catch (error) {
    console.error(`\x1b[31mErro ao criar scaffolding: ${error}\x1b[0m`);
  }
}

// Obter o nome do modelo a partir dos argumentos
function getModelNameFromArgs(): string | undefined {
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