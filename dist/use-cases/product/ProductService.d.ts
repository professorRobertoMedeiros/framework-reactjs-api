import { IProductBusiness } from './ProductBusiness';
import { CreateProductDom, UpdateProductDom, ProductDom } from './domains/ProductDom';
import { PaginationOptions, PaginatedResult } from '../../infra/repository/BaseRepository';
/**
 * Serviço para gerenciamento de produtos
 */
export declare class ProductService {
    private productBusiness;
    constructor(productBusiness?: IProductBusiness);
    /**
     * Criar um novo produto
     */
    createProduct(productData: CreateProductDom): Promise<ProductDom>;
    /**
     * Buscar produto por ID
     */
    getProductById(id: number): Promise<ProductDom | null>;
    /**
     * Listar produtos com paginação
     * Aproveita os métodos de paginação herdados do BaseRepository
     */
    listProducts(options?: PaginationOptions): Promise<PaginatedResult<ProductDom>>;
    /**
     * Listar produtos ativos com paginação
     */
    listActiveProducts(options?: PaginationOptions): Promise<ProductDom[]>;
    /**
     * Atualizar produto
     */
    updateProduct(id: number, productData: UpdateProductDom): Promise<ProductDom | null>;
    /**
     * Excluir produto (exclusão lógica)
     */
    deleteProduct(id: number): Promise<boolean>;
    /**
     * Buscar produtos com estoque baixo
     */
    getLowStockProducts(threshold?: number): Promise<ProductDom[]>;
}
