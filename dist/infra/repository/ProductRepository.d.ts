import { ProductModel } from '../../core/domain/models/ProductModel';
import { BaseRepository, IRepository, PaginationOptions, PaginatedResult } from './BaseRepository';
/**
 * Interface para o repository de produtos
 */
export interface IProductRepository extends IRepository<ProductModel> {
    findByName(name: string): Promise<ProductModel[]>;
    findActiveProducts(options?: PaginationOptions): Promise<ProductModel[]>;
    findActiveProductsPaginated(options?: PaginationOptions): Promise<PaginatedResult<ProductModel>>;
    findLowStock(threshold: number): Promise<ProductModel[]>;
}
/**
 * Implementação do repository de produtos
 * Aproveita todos os métodos CRUD e de paginação herdados do BaseRepository
 */
export declare class ProductRepository extends BaseRepository<ProductModel> implements IProductRepository {
    constructor();
    /**
     * Busca produtos por nome
     */
    findByName(name: string): Promise<ProductModel[]>;
    /**
     * Busca produtos ativos
     */
    findActiveProducts(options?: PaginationOptions): Promise<ProductModel[]>;
    /**
     * Busca produtos ativos com paginação
     */
    findActiveProductsPaginated(options?: PaginationOptions): Promise<PaginatedResult<ProductModel>>;
    /**
     * Busca produtos com estoque abaixo do limite
     */
    findLowStock(threshold: number): Promise<ProductModel[]>;
}
