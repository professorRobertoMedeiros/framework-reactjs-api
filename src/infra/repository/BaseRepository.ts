import { CustomORM } from '../db/CustomORM';
import { 
  BaseModel, 
  hasTimestamps, 
  hasSoftDelete,
  getCreatedAtField,
  getUpdatedAtField,
  getDeletedAtField
} from '../../core/domain/models/BaseModel';
import { AuditService, AuditUser } from '../../core/auth/AuditService';
import { AuditableMetadata } from '../../core/domain/decorators/AuditableDecorator';

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
  protected auditService?: AuditService;
  protected enableAudit: boolean = false;

  /**
   * Cria uma nova instância do repositório base
   * @param modelClass Classe do modelo para o qual o repositório é usado
   * @param enableAudit Habilitar auditoria automática para este repositório
   * @param currentUser Usuário atual para registro de auditoria
   */
  constructor(
    protected modelClass: new () => T,
    enableAudit: boolean = false,
    currentUser?: AuditUser
  ) {
    this.orm = CustomORM.getInstance();
    
    // Obter nome da tabela do modelo
    this.tableName = (this.modelClass as any).getTableName();
    
    if (!this.tableName) {
      throw new Error(`Modelo ${modelClass.name} não possui um nome de tabela válido.`);
    }
    
    // Configurar auditoria se habilitada
    this.enableAudit = enableAudit;
    if (enableAudit) {
      this.auditService = new AuditService(currentUser);
    }
  }
  
  /**
   * Define o usuário atual para auditoria
   * @param user Usuário atual
   */
  public setAuditUser(user: AuditUser): void {
    if (this.auditService) {
      this.auditService.setCurrentUser(user);
    }
  }

  /**
   * Verifica se a entidade tem timestamps habilitados
   */
  protected hasTimestamps(): boolean {
    return hasTimestamps(this.modelClass) !== undefined;
  }

  /**
   * Verifica se a entidade tem soft delete habilitado
   */
  protected hasSoftDelete(): boolean {
    return hasSoftDelete(this.modelClass) !== undefined;
  }

  /**
   * Adiciona timestamps aos dados
   * @param data Dados da entidade
   * @param isUpdate Se é uma atualização (inclui updated_at)
   */
  protected addTimestamps(data: any, isUpdate: boolean = false): any {
    if (!this.hasTimestamps()) {
      return data;
    }

    const result = { ...data };
    const createdAtField = getCreatedAtField(this.modelClass);
    const updatedAtField = getUpdatedAtField(this.modelClass);

    if (!isUpdate && !result[createdAtField]) {
      result[createdAtField] = new Date();
    }

    if (!result[updatedAtField]) {
      result[updatedAtField] = new Date();
    }

    return result;
  }

  /**
   * Adiciona condição de soft delete às consultas (excluir registros deletados)
   * @param conditions Condições existentes
   */
  protected addSoftDeleteCondition(conditions: Record<string, any> = {}): Record<string, any> {
    if (!this.hasSoftDelete()) {
      return conditions;
    }

    const deletedAtField = getDeletedAtField(this.modelClass);
    
    return {
      ...conditions,
      [deletedAtField]: null  // Apenas registros não deletados
    };
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
    // Se tem soft delete, usar findOneBy para aplicar a condição
    if (this.hasSoftDelete()) {
      return await this.findOneBy({ id } as any, includes);
    }
    
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
    // Adicionar condição de soft delete
    const conditions = this.addSoftDeleteCondition(options.conditions);
    const queryOptions = { ...options, conditions };
    
    const { conditions: finalConditions, ...paginationOptions } = this.formatQueryOptions(queryOptions);
    
    // Se houver condições, usar findBy, senão usar findAll do ORM
    if (finalConditions && Object.keys(finalConditions).length > 0) {
      const results = await this.orm.findBy<any>(this.tableName, finalConditions, paginationOptions);
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
    
    // Adicionar condição de soft delete
    const conditions = this.addSoftDeleteCondition(options.conditions);
    const queryOptions = { ...options, conditions };
    
    const { conditions: finalConditions, ...paginationOptions } = this.formatQueryOptions(queryOptions);
    
    let results: any[];
    let total: number;
    
    // Se houver condições, usar findBy, senão usar findAll do ORM
    if (finalConditions && Object.keys(finalConditions).length > 0) {
      [results, total] = await Promise.all([
        this.orm.findBy<any>(this.tableName, finalConditions, paginationOptions),
        this.count(finalConditions)
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
    // Adicionar condição de soft delete
    const finalConditions = this.addSoftDeleteCondition(conditions);
    const ormOptions = this.formatPaginationOptions(options);
    
    const results = await this.orm.findBy<any>(this.tableName, finalConditions, ormOptions);
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
    
    // Adicionar condição de soft delete
    const finalConditions = this.addSoftDeleteCondition(conditions);
    const ormOptions = this.formatPaginationOptions(options);
    
    const [results, total] = await Promise.all([
      this.orm.findBy<any>(this.tableName, finalConditions, ormOptions),
      this.count(finalConditions)
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
    // Adicionar timestamps automaticamente
    const entityData = this.addTimestamps({ ...entity as any }, false);
    
    const result = await this.orm.create<T>(this.tableName, entityData);
    const createdModel = this.mapToModel(result);
    
    // Registrar auditoria se habilitada
    if (this.enableAudit && this.auditService) {
      await this.auditService.auditCreate(createdModel);
    }
    
    return createdModel;
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
    // Obter entidade atual antes da atualização (para auditoria)
    let oldValues: Record<string, any> = {};
    
    if (this.enableAudit && this.auditService) {
      const existingEntity = await this.findById(id);
      if (existingEntity) {
        // Extrair os valores antigos das propriedades que serão alteradas
        for (const key of Object.keys(entity)) {
          oldValues[key] = (existingEntity as any)[key];
        }
      }
    }
    
    // Adicionar timestamp de atualização automaticamente
    const entityData = this.addTimestamps({ ...entity as any }, true);
    
    const result = await this.orm.update<T>(this.tableName, id as unknown as number | string, entityData);
    
    if (result && this.enableAudit && this.auditService) {
      const updatedModel = this.mapToModel(result);
      // Registrar auditoria da atualização
      await this.auditService.auditUpdate(updatedModel, oldValues);
    }
    
    return result ? this.mapToModel(result) : null;
  }

  /**
   * Excluir uma entidade
   * @param id ID da entidade a excluir
   * @returns true se a entidade foi excluída, false se não encontrada
   * 
   * @remarks
   * Se a entidade tiver soft delete habilitado, apenas marca como deletada.
   * Caso contrário, deleta fisicamente do banco de dados.
   */
  async delete(id: ID): Promise<boolean> {
    // Obter entidade antes da exclusão para auditoria
    let entityToDelete: T | null = null;
    if (this.enableAudit && this.auditService) {
      entityToDelete = await this.findById(id);
      
      // Se não encontrou, não precisa auditar
      if (!entityToDelete) {
        return false;
      }
    }
    
    let result = false;
    
    // Se tem soft delete, fazer update ao invés de delete
    if (this.hasSoftDelete()) {
      const deletedAtField = getDeletedAtField(this.modelClass);
      const updatedAtField = getUpdatedAtField(this.modelClass);
      
      const updateData: any = {
        [deletedAtField]: new Date()
      };
      
      // Adicionar updated_at se tiver timestamps
      if (this.hasTimestamps()) {
        updateData[updatedAtField] = new Date();
      }
      
      const updatedEntity = await this.update(id, updateData);
      result = updatedEntity !== null;
    } else {
      // Delete físico
      result = await this.orm.delete(this.tableName, id as unknown as number | string);
    }
    
    // Registrar auditoria da exclusão
    if (result && this.enableAudit && this.auditService && entityToDelete) {
      await this.auditService.auditDelete(entityToDelete);
    }
    
    return result;
  }

  /**
   * Forçar exclusão física de uma entidade (ignora soft delete)
   * @param id ID da entidade a excluir
   * @returns true se a entidade foi excluída, false se não encontrada
   */
  async forceDelete(id: ID): Promise<boolean> {
    return await this.orm.delete(this.tableName, id as unknown as number | string);
  }

  /**
   * Atualizar entidades que correspondem às condições
   * @param conditions Condições para filtrar as entidades a serem atualizadas
   * @param entity Dados parciais para atualização
   * @returns Número de entidades atualizadas
   */
  async updateBy(conditions: Record<string, any>, entity: Partial<T>): Promise<number> {
    // Adicionar timestamp de atualização automaticamente
    const entityData = this.addTimestamps({ ...entity as any }, true);
    
    // Adicionar condição de soft delete
    const finalConditions = this.addSoftDeleteCondition(conditions);

    // Construir a query UPDATE dinamicamente
    const keys = Object.keys(entityData);
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = keys.map(key => entityData[key]);

    // Construir a cláusula WHERE
    const conditionKeys = Object.keys(finalConditions);
    const whereClause = conditionKeys
      .map((key, index) => `${key} = $${keys.length + index + 1}`)
      .join(' AND ');
    const conditionValues = conditionKeys.map(key => finalConditions[key]);

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
   * 
   * @remarks
   * Se a entidade tiver soft delete habilitado, apenas marca como deletada.
   * Caso contrário, deleta fisicamente do banco de dados.
   */
  async deleteBy(conditions: Record<string, any>): Promise<number> {
    // Construir a cláusula WHERE
    const conditionKeys = Object.keys(conditions);
    
    if (conditionKeys.length === 0) {
      throw new Error('deleteBy requer ao menos uma condição para evitar exclusão acidental de todos os registros');
    }

    // Se tem soft delete, fazer update ao invés de delete
    if (this.hasSoftDelete()) {
      const deletedAtField = getDeletedAtField(this.modelClass);
      const updateData: any = {
        [deletedAtField]: new Date()
      };
      
      // Adicionar updated_at se tiver timestamps
      if (this.hasTimestamps()) {
        const updatedAtField = getUpdatedAtField(this.modelClass);
        updateData[updatedAtField] = new Date();
      }
      
      return await this.updateBy(conditions, updateData);
    }

    // Delete físico
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
   * Forçar exclusão física de entidades (ignora soft delete)
   * @param conditions Condições para filtrar as entidades a serem excluídas
   * @returns Número de entidades excluídas
   */
  async forceDeleteBy(conditions: Record<string, any>): Promise<number> {
    const conditionKeys = Object.keys(conditions);
    
    if (conditionKeys.length === 0) {
      throw new Error('forceDeleteBy requer ao menos uma condição para evitar exclusão acidental de todos os registros');
    }

    const whereClause = conditionKeys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(' AND ');
    const values = conditionKeys.map(key => conditions[key]);

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
    // Adicionar condição de soft delete
    const finalConditions = this.addSoftDeleteCondition(conditions);
    return await this.orm.count(this.tableName, finalConditions);
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
   * Restaurar uma entidade deletada (soft delete)
   * @param id ID da entidade a restaurar
   * @returns true se restaurada, false se não encontrada
   * 
   * @remarks
   * Funciona apenas se a entidade tiver soft delete habilitado.
   * Coloca deleted_at como null.
   */
  async restore(id: ID): Promise<boolean> {
    if (!this.hasSoftDelete()) {
      throw new Error('Esta entidade não possui soft delete habilitado');
    }

    const deletedAtField = getDeletedAtField(this.modelClass);
    const updatedAtField = getUpdatedAtField(this.modelClass);
    
    const updateData: any = {
      [deletedAtField]: null
    };
    
    // Adicionar updated_at se tiver timestamps
    if (this.hasTimestamps()) {
      updateData[updatedAtField] = new Date();
    }

    // Construir query para atualizar mesmo registros deletados
    const keys = Object.keys(updateData);
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = keys.map(key => updateData[key]);

    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}
      WHERE id = $${keys.length + 1}
      AND ${deletedAtField} IS NOT NULL
      RETURNING *
    `;

    const result = await this.orm.query(query, [...values, id]);
    return (result.rowCount || 0) > 0;
  }

  /**
   * Buscar apenas registros deletados (soft delete)
   * @param options Opções de consulta
   * @returns Lista de entidades deletadas
   */
  async findDeleted(options: QueryOptions = {}): Promise<T[]> {
    if (!this.hasSoftDelete()) {
      throw new Error('Esta entidade não possui soft delete habilitado');
    }

    const deletedAtField = getDeletedAtField(this.modelClass);
    const conditions = {
      ...options.conditions,
      [`${deletedAtField} IS NOT`]: null  // deleted_at IS NOT NULL
    };

    // Usar ORM diretamente sem adicionar condição de soft delete
    const { conditions: _, ...paginationOptions } = this.formatQueryOptions({ ...options, conditions });
    
    // Query manual para buscar deletados
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE ${deletedAtField} IS NOT NULL
      ${options.limit ? `LIMIT ${options.limit}` : ''}
      ${options.offset ? `OFFSET ${options.offset}` : ''}
    `;

    const result = await this.orm.query(query, []);
    return result.rows.map((row: any) => this.mapToModel(row));
  }

  /**
   * Buscar todos os registros incluindo deletados (soft delete)
   * @param options Opções de consulta
   * @returns Lista de todas as entidades (incluindo deletadas)
   */
  async findAllWithDeleted(options: QueryOptions = {}): Promise<T[]> {
    // Não adicionar condição de soft delete
    const { conditions, ...paginationOptions } = this.formatQueryOptions(options);
    
    if (conditions && Object.keys(conditions).length > 0) {
      const results = await this.orm.findBy<any>(this.tableName, conditions, paginationOptions);
      return results.map(result => this.mapToModel(result));
    }
    
    const results = await this.orm.findAll<any>(this.tableName, paginationOptions);
    return results.map(result => this.mapToModel(result));
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