import { BaseBusiness } from '../business/BaseBusiness';
/**
 * Interface padrão para resposta de serviços
 */
export interface ServiceResponse<T = any> {
    status: number;
    data?: T;
    message?: string;
}
/**
 * Interface para opções de consulta
 */
export interface QueryOptions {
    conditions?: Record<string, any>;
    includes?: string[];
    limit?: number;
    offset?: number;
    orderBy?: string;
}
/**
 * Interface para dados paginados (compatibilidade)
 */
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
/**
 * Classe base para serviços que delega operações CRUD para Business
 * Não reimplementa métodos, apenas delega
 *
 * @template T Tipo do modelo
 * @template TDom Tipo do domínio (DTO)
 */
export declare abstract class BaseService<T, TDom = T> {
    protected business: BaseBusiness<T, TDom>;
    constructor(business: BaseBusiness<T, TDom>);
    /**
     * Buscar todos com filtros - Delega para business
     */
    findAll(options?: QueryOptions): Promise<ServiceResponse<TDom[]>>;
    /**
     * Buscar por ID - Delega para business
     */
    findById(id: number): Promise<ServiceResponse<TDom>>;
    /**
     * Criar - Delega para business
     */
    create(data: any): Promise<ServiceResponse<TDom>>;
    /**
     * Atualizar - Delega para business
     */
    update(id: number, data: any): Promise<ServiceResponse<TDom>>;
    /**
     * Deletar - Delega para business
     */
    delete(id: number): Promise<ServiceResponse<boolean>>;
    /**
     * Contar - Delega para business
     */
    count(conditions?: Record<string, any>): Promise<ServiceResponse<number>>;
}
