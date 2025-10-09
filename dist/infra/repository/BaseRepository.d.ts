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
export declare abstract class BaseRepository<T extends BaseModel, ID = number> implements IRepository<T, ID> {
    protected modelClass: new () => T;
    protected orm: CustomORM;
    protected tableName: string;
    /**
     * Cria uma nova instância do repositório base
     * @param modelClass Classe do modelo para o qual o repositório é usado
     */
    constructor(modelClass: new () => T);
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
     * Buscar entidade por ID
     * @param id ID da entidade
     * @returns Entidade encontrada ou null se não existir
     */
    findById(id: ID): Promise<T | null>;
    /**
     * Buscar todas as entidades com opções de paginação e ordenação
     * @param options Opções de paginação
     * @returns Lista de entidades
     */
    findAll(options?: PaginationOptions): Promise<T[]>;
    /**
     * Buscar todas as entidades com resultado paginado
     * @param options Opções de paginação
     * @returns Resultado paginado
     */
    findAllPaginated(options?: PaginationOptions): Promise<PaginatedResult<T>>;
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
     * @returns Entidade ou null se não encontrada
     */
    findOneBy(conditions: Record<string, any>): Promise<T | null>;
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
     */
    delete(id: ID): Promise<boolean>;
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
     * Executa uma operação em transação
     * @param operation Função que recebe a transação e executa operações
     * @returns Resultado da função de operação
     */
    executeInTransaction<R>(operation: () => Promise<R>): Promise<R>;
}
