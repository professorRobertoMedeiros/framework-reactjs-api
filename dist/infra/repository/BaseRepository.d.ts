import { CustomORM } from '../db/CustomORM';
import { BaseModel } from '../../core/domain/models/BaseModel';
import { AuditService, AuditUser } from '../../core/auth/AuditService';
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
export declare abstract class BaseRepository<T extends BaseModel, ID = number> implements IRepository<T, ID> {
    protected modelClass: new () => T;
    protected orm: CustomORM;
    protected tableName: string;
    protected auditService?: AuditService;
    protected enableAudit: boolean;
    /**
     * Cria uma nova instância do repositório base
     * @param modelClass Classe do modelo para o qual o repositório é usado
     * @param enableAudit Habilitar auditoria automática para este repositório
     * @param currentUser Usuário atual para registro de auditoria
     */
    constructor(modelClass: new () => T, enableAudit?: boolean, currentUser?: AuditUser);
    /**
     * Define o usuário atual para auditoria
     * @param user Usuário atual
     */
    setAuditUser(user: AuditUser): void;
    /**
     * Verifica se a entidade tem timestamps habilitados
     */
    protected hasTimestamps(): boolean;
    /**
     * Verifica se a entidade tem soft delete habilitado
     */
    protected hasSoftDelete(): boolean;
    /**
     * Adiciona timestamps aos dados
     * @param data Dados da entidade
     * @param isUpdate Se é uma atualização (inclui updated_at)
     */
    protected addTimestamps(data: any, isUpdate?: boolean): any;
    /**
     * Adiciona condição de soft delete às consultas (excluir registros deletados)
     * @param conditions Condições existentes
     */
    protected addSoftDeleteCondition(conditions?: Record<string, any>): Record<string, any>;
    /**
     * Converte um objeto de dados bruto para uma instância do modelo
     * @param data Dados brutos do banco de dados
     * @returns Instância do modelo
     */
    protected mapToModel(data: any): T;
    /**
     * Converte as opções de paginação para offset/limit
     * @param options Opções de paginação
     * @returns Opções formatadas para o ORM
     */
    protected formatPaginationOptions(options?: PaginationOptions): {
        limit?: number;
        offset?: number;
        orderBy?: string;
    };
    /**
     * Formata as opções de consulta avançada
     * @param options Opções de consulta
     * @returns Opções formatadas
     */
    protected formatQueryOptions(options?: QueryOptions): {
        conditions?: Record<string, any>;
        limit?: number;
        offset?: number;
        orderBy?: string;
        includes?: string[];
    };
    /**
     * Buscar entidade por ID
     * @param id ID da entidade
     * @param includes Lista de relacionamentos a incluir
     * @returns Entidade encontrada ou null se não existir
     */
    findById(id: ID, includes?: string[]): Promise<T | null>;
    /**
     * Buscar todas as entidades com opções de consulta avançada
     * @param options Opções de consulta (conditions, paginação, ordenação, includes)
     * @returns Lista de entidades
     */
    findAll(options?: QueryOptions): Promise<T[]>;
    /**
     * Buscar todas as entidades com resultado paginado
     * @param options Opções de consulta (conditions, paginação, ordenação, includes)
     * @returns Resultado paginado
     */
    findAllPaginated(options?: QueryOptions): Promise<PaginatedResult<T>>;
    /**
     * Buscar entidades por condições
     * @param conditions Condições de filtro (pares chave/valor)
     * @param options Opções de paginação
     * @returns Lista de entidades que correspondem às condições
     */
    findBy(conditions: Record<string, any>, options?: PaginationOptions): Promise<T[]>;
    /**
     * Buscar entidades por condições com resultado paginado
     * @param conditions Condições de filtro (pares chave/valor)
     * @param options Opções de paginação
     * @returns Resultado paginado
     */
    findByPaginated(conditions: Record<string, any>, options?: PaginationOptions): Promise<PaginatedResult<T>>;
    /**
     * Buscar uma única entidade por condições
     * @param conditions Condições de filtro (pares chave/valor)
     * @param includes Lista de relacionamentos a incluir
     * @returns Entidade ou null se não encontrada
     */
    findOneBy(conditions: Record<string, any>, includes?: string[]): Promise<T | null>;
    /**
     * Criar uma nova entidade
     * @param entity Dados da entidade (sem ID)
     * @returns Entidade criada com ID gerado
     */
    create(entity: Omit<T, 'id'>): Promise<T>;
    /**
     * Criar múltiplas entidades em uma única operação
     * @param entities Lista de dados de entidades (sem IDs)
     * @returns Lista de entidades criadas com IDs gerados
     */
    createMany(entities: Array<Omit<T, 'id'>>): Promise<T[]>;
    /**
     * Atualizar uma entidade existente
     * @param id ID da entidade
     * @param entity Dados parciais para atualização
     * @returns Entidade atualizada ou null se não encontrada
     */
    update(id: ID, entity: Partial<T>): Promise<T | null>;
    /**
     * Excluir uma entidade
     * @param id ID da entidade a excluir
     * @returns true se a entidade foi excluída, false se não encontrada
     *
     * @remarks
     * Se a entidade tiver soft delete habilitado, apenas marca como deletada.
     * Caso contrário, deleta fisicamente do banco de dados.
     */
    delete(id: ID): Promise<boolean>;
    /**
     * Forçar exclusão física de uma entidade (ignora soft delete)
     * @param id ID da entidade a excluir
     * @returns true se a entidade foi excluída, false se não encontrada
     */
    forceDelete(id: ID): Promise<boolean>;
    /**
     * Atualizar entidades que correspondem às condições
     * @param conditions Condições para filtrar as entidades a serem atualizadas
     * @param entity Dados parciais para atualização
     * @returns Número de entidades atualizadas
     */
    updateBy(conditions: Record<string, any>, entity: Partial<T>): Promise<number>;
    /**
     * Excluir entidades que correspondem às condições
     * @param conditions Condições para filtrar as entidades a serem excluídas
     * @returns Número de entidades excluídas
     *
     * @remarks
     * Se a entidade tiver soft delete habilitado, apenas marca como deletada.
     * Caso contrário, deleta fisicamente do banco de dados.
     */
    deleteBy(conditions: Record<string, any>): Promise<number>;
    /**
     * Forçar exclusão física de entidades (ignora soft delete)
     * @param conditions Condições para filtrar as entidades a serem excluídas
     * @returns Número de entidades excluídas
     */
    forceDeleteBy(conditions: Record<string, any>): Promise<number>;
    /**
     * Contar entidades com condições opcionais
     * @param conditions Condições de filtro (pares chave/valor)
     * @returns Número de entidades
     */
    count(conditions?: Record<string, any>): Promise<number>;
    /**
     * Verificar se existe alguma entidade com as condições especificadas
     * @param conditions Condições de filtro (pares chave/valor)
     * @returns true se existe pelo menos uma entidade, false caso contrário
     */
    exists(conditions: Record<string, any>): Promise<boolean>;
    /**
     * Restaurar uma entidade deletada (soft delete)
     * @param id ID da entidade a restaurar
     * @returns true se restaurada, false se não encontrada
     *
     * @remarks
     * Funciona apenas se a entidade tiver soft delete habilitado.
     * Coloca deleted_at como null.
     */
    restore(id: ID): Promise<boolean>;
    /**
     * Buscar apenas registros deletados (soft delete)
     * @param options Opções de consulta
     * @returns Lista de entidades deletadas
     */
    findDeleted(options?: QueryOptions): Promise<T[]>;
    /**
     * Buscar todos os registros incluindo deletados (soft delete)
     * @param options Opções de consulta
     * @returns Lista de todas as entidades (incluindo deletadas)
     */
    findAllWithDeleted(options?: QueryOptions): Promise<T[]>;
    /**
     * Executa uma operação em transação
     * @param operation Função que recebe a transação e executa operações
     * @returns Resultado da função de operação
     */
    executeInTransaction<R>(operation: () => Promise<R>): Promise<R>;
}
