import { BaseService, ServiceResponse, PaginatedResponse } from '../../core/services/BaseService';
import { ProductBusiness } from './ProductBusiness';
import { CreateProductDom, UpdateProductDom, ProductDom } from './domains/ProductDom';
/**
 * Serviço para Product
 * Estende BaseService para operações CRUD padrão
 */
export declare class ProductService extends BaseService<ProductDom, CreateProductDom, UpdateProductDom> {
    private productBusiness;
    constructor(productBusiness?: ProductBusiness);
    /**
     * Implementação obrigatória para obter business layer
     * @returns Instância do business
     */
    protected getBusiness(): ProductBusiness;
    /**
     * Método customizado: Buscar products ativos
     * @param page Página
     * @param limit Limite por página
     * @returns Lista de products ativos
     */
    getActive(page?: number, limit?: number): Promise<ServiceResponse<PaginatedResponse<ProductDom>>>;
    /**
     * Método customizado: Contar total de registros
     * @returns Número total de registros
     */
    count(): Promise<ServiceResponse<number>>;
}
