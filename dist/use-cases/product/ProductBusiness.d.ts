import { IProductRepository } from './repository/ProductRepository';
import { CreateProductDom, UpdateProductDom, ProductDom } from './domains/ProductDom';
import { PaginatedResult, PaginationOptions } from '../../infra/repository/BaseRepository';
export interface IProductBusiness {
    getProductById(id: number): Promise<ProductDom | null>;
    getAllProducts(options?: PaginationOptions): Promise<ProductDom[]>;
    getAllProductsPaginated(options?: PaginationOptions): Promise<PaginatedResult<ProductDom>>;
    createProduct(data: CreateProductDom): Promise<ProductDom>;
    updateProduct(id: number, data: UpdateProductDom): Promise<ProductDom | null>;
    deleteProduct(id: number): Promise<boolean>;
    findLowStockProducts(threshold?: number): Promise<ProductDom[]>;
}
export declare class ProductBusiness implements IProductBusiness {
    private productRepository;
    constructor(productRepository?: IProductRepository);
    private toDom;
    getProductById(id: number): Promise<ProductDom | null>;
    getAllProducts(options?: PaginationOptions): Promise<ProductDom[]>;
    getAllProductsPaginated(options?: PaginationOptions): Promise<PaginatedResult<ProductDom>>;
    createProduct(data: CreateProductDom): Promise<ProductDom>;
    updateProduct(id: number, data: UpdateProductDom): Promise<ProductDom | null>;
    deleteProduct(id: number): Promise<boolean>;
    findLowStockProducts(threshold?: number): Promise<ProductDom[]>;
}
