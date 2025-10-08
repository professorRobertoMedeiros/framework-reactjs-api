import { CustomORM } from '../db/CustomORM';
import { BaseModel } from '../../core/domain/models/BaseModel';

/**
 * Interface para opções de paginação
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
}

/**
 * Interface para resultado paginado
 * @template T Tipo do modelo associado ao resultado
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Interface para todos os repositórios
 * @template T Tipo do modelo associado ao repositório
 * @template ID Tipo do identificador único (geralmente number)
 */
export interface IRepository<T extends BaseModel, ID = number> {
  findById(id: ID): Promise<T | null>;
  findAll(options?: PaginationOptions): Promise<T[]>;
  findAllPaginated(options?: PaginationOptions): Promise<PaginatedResult<T>>;
  findBy(conditions: Record<string, any>, options?: PaginationOptions): Promise<T[]>;
  findByPaginated(conditions: Record<string, any>, options?: PaginationOptions): Promise<PaginatedResult<T>>;
  findOneBy(conditions: Record<string, any>): Promise<T | null>;
  create(entity: Omit<T, 'id'>): Promise<T>;
  update(id: ID, entity: Partial<T>): Promise<T | null>;
  delete(id: ID): Promise<boolean>;
  count(conditions?: Record<string, any>): Promise<number>;
}

/**
 * Classe base para implementações de repositório
 * @template T Tipo do modelo associado ao repositório
 * @template ID Tipo do identificador único (geralmente number)
 */
export abstract class BaseRepository<T extends BaseModel, ID = number> implements IRepository<T, ID> {
  protected orm: CustomORM;
  protected tableName: string;

  /**
   * Cria uma nova instância do repositório base
   * @param modelClass Classe do modelo para o qual o repositório é usado
   */
  constructor(protected modelClass: new () => T) {
    this.orm = CustomORM.getInstance();
    
    // Obter nome da tabela do modelo
    this.tableName = (this.modelClass as any).getTableName();
    
    if (!this.tableName) {
      throw new Error(`Modelo ${modelClass.name} não possui um nome de tabela válido.`);
    }
  }

  /**
   * Converte um objeto de dados bruto para uma instância do modelo
   * @param data Dados brutos do banco de dados
   * @returns Instância do modelo
   */
  protected mapToModel(data: any): T {
    if (!data) return null as unknown as T;
    
    const model = new this.modelClass();
    const columns = (this.modelClass as any).getColumns() || {};
    
    // Mapear todas as propriedades do data para o modelo
    for (const key of Object.keys(data)) {
      if (key in columns || key === 'id') {
        (model as any)[key] = data[key];
      }
    }
    
    return model;
  }

  /**
   * Converte as opções de paginação para offset/limit
   * @param options Opções de paginação
   * @returns Opções formatadas para o ORM
   */
  protected formatPaginationOptions(options: PaginationOptions = {}): { limit?: number; offset?: number; orderBy?: string } {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;
    
    return {
      limit,
      offset,
      orderBy: options.orderBy
    };
  }

  /**
   * Buscar entidade por ID
   * @param id ID da entidade
   * @returns Entidade encontrada ou null se não existir
   */
  async findById(id: ID): Promise<T | null> {
    const result = await this.orm.findById<any>(this.tableName, id as unknown as number | string);
    return result ? this.mapToModel(result) : null;
  }

  /**
   * Buscar todas as entidades com opções de paginação e ordenação
   * @param options Opções de paginação
   * @returns Lista de entidades
   */
  async findAll(options: PaginationOptions = {}): Promise<T[]> {
    const ormOptions = this.formatPaginationOptions(options);
    const results = await this.orm.findAll<any>(this.tableName, ormOptions);
    return results.map(result => this.mapToModel(result));
  }

  /**
   * Buscar todas as entidades com resultado paginado
   * @param options Opções de paginação
   * @returns Resultado paginado
   */
  async findAllPaginated(options: PaginationOptions = {}): Promise<PaginatedResult<T>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const ormOptions = this.formatPaginationOptions(options);
    
    const [results, total] = await Promise.all([
      this.orm.findAll<any>(this.tableName, ormOptions),
      this.count()
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: results.map(result => this.mapToModel(result)),
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
  }

  /**
   * Buscar entidades por condições
   * @param conditions Condições de filtro (pares chave/valor)
   * @param options Opções de paginação
   * @returns Lista de entidades que correspondem às condições
   */
  async findBy(
    conditions: Record<string, any>,
    options: PaginationOptions = {}
  ): Promise<T[]> {
    const ormOptions = this.formatPaginationOptions(options);
    const results = await this.orm.findBy<any>(this.tableName, conditions, ormOptions);
    return results.map(result => this.mapToModel(result));
  }
  
  /**
   * Buscar entidades por condições com resultado paginado
   * @param conditions Condições de filtro (pares chave/valor)
   * @param options Opções de paginação
   * @returns Resultado paginado
   */
  async findByPaginated(
    conditions: Record<string, any>,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<T>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const ormOptions = this.formatPaginationOptions(options);
    
    const [results, total] = await Promise.all([
      this.orm.findBy<any>(this.tableName, conditions, ormOptions),
      this.count(conditions)
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: results.map(result => this.mapToModel(result)),
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
  }

  /**
   * Buscar uma única entidade por condições
   * @param conditions Condições de filtro (pares chave/valor)
   * @returns Entidade ou null se não encontrada
   */
  async findOneBy(conditions: Record<string, any>): Promise<T | null> {
    const results = await this.findBy(conditions, { limit: 1 });
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Criar uma nova entidade
   * @param entity Dados da entidade (sem ID)
   * @returns Entidade criada com ID gerado
   */
  async create(entity: Omit<T, 'id'>): Promise<T> {
    // Adicionar timestamps se for um modelo com esses campos
    const entityData = { ...entity as any };
    
    if ('created_at' in entityData && !entityData.created_at) {
      entityData.created_at = new Date();
    }
    
    const result = await this.orm.create<T>(this.tableName, entityData);
    return this.mapToModel(result);
  }

  /**
   * Criar múltiplas entidades em uma única operação
   * @param entities Lista de dados de entidades (sem IDs)
   * @returns Lista de entidades criadas com IDs gerados
   */
  async createMany(entities: Array<Omit<T, 'id'>>): Promise<T[]> {
    const results: T[] = [];
    
    // Implementação simples: criar cada entidade individualmente
    // Para implementação mais eficiente, adicionar método bulkInsert no CustomORM
    for (const entity of entities) {
      const result = await this.create(entity);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Atualizar uma entidade existente
   * @param id ID da entidade
   * @param entity Dados parciais para atualização
   * @returns Entidade atualizada ou null se não encontrada
   */
  async update(id: ID, entity: Partial<T>): Promise<T | null> {
    // Adicionar timestamp de atualização se for um modelo com esse campo
    const entityData = { ...entity as any };
    
    if ('updated_at' in entityData && !entityData.updated_at) {
      entityData.updated_at = new Date();
    }
    
    const result = await this.orm.update<T>(this.tableName, id as unknown as number | string, entityData);
    return result ? this.mapToModel(result) : null;
  }

  /**
   * Excluir uma entidade
   * @param id ID da entidade a excluir
   * @returns true se a entidade foi excluída, false se não encontrada
   */
  async delete(id: ID): Promise<boolean> {
    return await this.orm.delete(this.tableName, id as unknown as number | string);
  }

  /**
   * Contar entidades com condições opcionais
   * @param conditions Condições de filtro (pares chave/valor)
   * @returns Número de entidades
   */
  async count(conditions: Record<string, any> = {}): Promise<number> {
    return await this.orm.count(this.tableName, conditions);
  }

  /**
   * Verificar se existe alguma entidade com as condições especificadas
   * @param conditions Condições de filtro (pares chave/valor)
   * @returns true se existe pelo menos uma entidade, false caso contrário
   */
  async exists(conditions: Record<string, any>): Promise<boolean> {
    const count = await this.count(conditions);
    return count > 0;
  }

  /**
   * Executa uma operação em transação
   * @param operation Função que recebe a transação e executa operações
   * @returns Resultado da função de operação
   */
  async executeInTransaction<R>(operation: () => Promise<R>): Promise<R> {
    const client = await this.orm.getClient();
    
    try {
      await client.query('BEGIN');
      const result = await operation();
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}