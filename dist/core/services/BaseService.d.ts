/**
 * Interface padrão para resposta de serviços
 */
export interface ServiceResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}
/**
 * Interface para dados paginados
 */
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
/**
 * Classe base para serviços que implementa operações CRUD padrão
 * @template T Tipo do domínio
 * @template CreateT Tipo para criação
 * @template UpdateT Tipo para atualização
 */
export declare abstract class BaseService<T, CreateT, UpdateT> {
    /**
     * Implementação abstrata para obter business layer
     */
    protected abstract getBusiness(): any;
    /**
     * Buscar por ID
     * @param id ID do registro
     * @returns Resposta padronizada com o registro ou erro
     */
    getById(id: number): Promise<ServiceResponse<T>>;
    /**
     * Buscar todos com paginação
     * @param page Página (padrão: 1)
     * @param limit Limite por página (padrão: 10)
     * @returns Resposta padronizada com lista paginada ou erro
     */
    getAll(page?: number, limit?: number): Promise<ServiceResponse<PaginatedResponse<T>>>;
    /**
     * Criar um novo registro
     * @param data Dados para criação
     * @returns Resposta padronizada com o registro criado ou erro
     */
    create(data: CreateT): Promise<ServiceResponse<T>>;
    /**
     * Atualizar um registro existente
     * @param id ID do registro
     * @param data Dados para atualização
     * @returns Resposta padronizada com o registro atualizado ou erro
     */
    update(id: number, data: UpdateT): Promise<ServiceResponse<T>>;
    /**
     * Excluir um registro
     * @param id ID do registro
     * @returns Resposta padronizada de sucesso ou erro
     */
    delete(id: number): Promise<ServiceResponse>;
}
