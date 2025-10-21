import { CustomORM } from '../db/CustomORM';
import { BaseModel } from '../../core/domain/models/BaseModel';

/**
 * Interface para opções de paginação
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
  orderBy?: string;
}

/**
 * Interface para opções de consulta avançada
 */
export interface QueryOptions extends PaginationOptions {
  conditions?: Record<string, any>;
  includes?: string[];
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
  findById(id: ID, includes?: string[]): Promise<T | null>;
  findAll(options?: QueryOptions): Promise<T[]>;
  findAllPaginated(options?: QueryOptions): Promise<PaginatedResult<T>>;
  findBy(conditions: Record<string, any>, options?: PaginationOptions): Promise<T[]>;
  findByPaginated(conditions: Record<string, any>, options?: PaginationOptions): Promise<PaginatedResult<T>>;
  findOneBy(conditions: Record<string, any>, includes?: string[]): Promise<T | null>;
  create(entity: Omit<T, 'id'>): Promise<T>;
  update(id: ID, entity: Partial<T>): Promise<T | null>;
  updateBy(conditions: Record<string, any>, entity: Partial<T>): Promise<number>;
  delete(id: ID): Promise<boolean>;
  deleteBy(conditions: Record<string, any>): Promise<number>;
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
    const page = options.page;
    const limit = options.limit;
    const offset = options.offset !== undefined ? options.offset : (page ? (page - 1) * (limit || 10) : undefined);
    
    return {
      limit,
      offset,
      orderBy: options.orderBy
    };
  }

  /**
   * Formata as opções de consulta avançada
   * @param options Opções de consulta
   * @returns Opções formatadas
   */
  protected formatQueryOptions(options: QueryOptions = {}): { 
    conditions?: Record<string, any>;
    limit?: number; 
    offset?: number; 
    orderBy?: string;
    includes?: string[];
  } {
    const paginationOptions = this.formatPaginationOptions(options);
    
    return {
      conditions: options.conditions,
      includes: options.includes,
      ...paginationOptions
    };
  }

  /**
   * Buscar entidade por ID
   * @param id ID da entidade
   * @param includes Lista de relacionamentos a incluir
   * @returns Entidade encontrada ou null se não existir
   */
  async findById(id: ID, includes?: string[]): Promise<T | null> {
    const result = await this.orm.findById<any>(this.tableName, id as unknown as number | string);
    // TODO: Implementar includes quando o ORM suportar relacionamentos
    return result ? this.mapToModel(result) : null;
  }

  /**
   * Buscar todas as entidades com opções de consulta avançada
   * @param options Opções de consulta (conditions, paginação, ordenação, includes)
   * @returns Lista de entidades
   */
  async findAll(options: QueryOptions = {}): Promise<T[]> {
    const { conditions, ...paginationOptions } = this.formatQueryOptions(options);
    
    // Se houver condições, usar findBy, senão usar findAll do ORM
    if (conditions && Object.keys(conditions).length > 0) {
      const results = await this.orm.findBy<any>(this.tableName, conditions, paginationOptions);
      return results.map(result => this.mapToModel(result));
    }
    
    const results = await this.orm.findAll<any>(this.tableName, paginationOptions);
    // TODO: Implementar includes quando o ORM suportar relacionamentos
    return results.map(result => this.mapToModel(result));
  }

  /**
   * Buscar todas as entidades com resultado paginado
   * @param options Opções de consulta (conditions, paginação, ordenação, includes)
   * @returns Resultado paginado
   */
  async findAllPaginated(options: QueryOptions = {}): Promise<PaginatedResult<T>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const { conditions, ...paginationOptions } = this.formatQueryOptions(options);
    
    let results: any[];
    let total: number;
    
    // Se houver condições, usar findBy, senão usar findAll do ORM
    if (conditions && Object.keys(conditions).length > 0) {
      [results, total] = await Promise.all([
        this.orm.findBy<any>(this.tableName, conditions, paginationOptions),
        this.count(conditions)
      ]);
    } else {
      [results, total] = await Promise.all([
        this.orm.findAll<any>(this.tableName, paginationOptions),
        this.count()
      ]);
    }
    
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
   * @param includes Lista de relacionamentos a incluir
   * @returns Entidade ou null se não encontrada
   */
  async findOneBy(conditions: Record<string, any>, includes?: string[]): Promise<T | null> {
    const results = await this.findBy(conditions, { limit: 1 });
    // TODO: Implementar includes quando o ORM suportar relacionamentos
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
   * Atualizar entidades que correspondem às condições
   * @param conditions Condições para filtrar as entidades a serem atualizadas
   * @param entity Dados parciais para atualização
   * @returns Número de entidades atualizadas
   */
  async updateBy(conditions: Record<string, any>, entity: Partial<T>): Promise<number> {
    // Adicionar timestamp de atualização se for um modelo com esse campo
    const entityData = { ...entity as any };
    
    if ('updated_at' in entityData && !entityData.updated_at) {
      entityData.updated_at = new Date();
    }

    // Construir a query UPDATE dinamicamente
    const keys = Object.keys(entityData);
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = keys.map(key => entityData[key]);

    // Construir a cláusula WHERE
    const conditionKeys = Object.keys(conditions);
    const whereClause = conditionKeys
      .map((key, index) => `${key} = $${keys.length + index + 1}`)
      .join(' AND ');
    const conditionValues = conditionKeys.map(key => conditions[key]);

    // Executar a query
    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}
      ${whereClause ? `WHERE ${whereClause}` : ''}
      RETURNING *
    `;

    const result = await this.orm.query(query, [...values, ...conditionValues]);
    return result.rowCount || 0;
  }

  /**
   * Excluir entidades que correspondem às condições
   * @param conditions Condições para filtrar as entidades a serem excluídas
   * @returns Número de entidades excluídas
   */
  async deleteBy(conditions: Record<string, any>): Promise<number> {
    // Construir a cláusula WHERE
    const conditionKeys = Object.keys(conditions);
    
    if (conditionKeys.length === 0) {
      throw new Error('deleteBy requer ao menos uma condição para evitar exclusão acidental de todos os registros');
    }

    const whereClause = conditionKeys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(' AND ');
    const values = conditionKeys.map(key => conditions[key]);

    // Executar a query
    const query = `
      DELETE FROM ${this.tableName}
      WHERE ${whereClause}
    `;

    const result = await this.orm.query(query, values);
    return result.rowCount || 0;
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