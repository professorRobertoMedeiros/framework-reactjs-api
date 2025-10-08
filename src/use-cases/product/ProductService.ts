import { IProductBusiness, ProductBusiness } from './ProductBusiness';
import { CreateProductDom, UpdateProductDom, ProductDom } from './domains/ProductDom';
import { PaginationOptions, PaginatedResult } from '../../infra/repository/BaseRepository';

/**
 * Serviço para gerenciamento de produtos
 */
export class ProductService {
  private productBusiness: IProductBusiness;
  
  constructor(productBusiness?: IProductBusiness) {
    // Injeção de dependência: usar business fornecido ou criar novo
    this.productBusiness = productBusiness || new ProductBusiness();
  }
  
  /**
   * Criar um novo produto
   */
  async createProduct(productData: CreateProductDom): Promise<ProductDom> {
    return this.productBusiness.createProduct(productData);
  }
  
  /**
   * Buscar produto por ID
   */
  async getProductById(id: number): Promise<ProductDom | null> {
    return this.productBusiness.getProductById(id);
  }
  
  /**
   * Listar produtos com paginação
   * Aproveita os métodos de paginação herdados do BaseRepository
   */
  async listProducts(options?: PaginationOptions): Promise<PaginatedResult<ProductDom>> {
    return this.productBusiness.getAllProductsPaginated(options);
  }
  
  /**
   * Listar produtos ativos com paginação
   */
  async listActiveProducts(options?: PaginationOptions): Promise<ProductDom[]> {
    // Usar as opções para filtrar por produtos ativos
    const products = await this.productBusiness.getAllProducts(options);
    return products.filter(product => product.active);
  }
  
  /**
   * Atualizar produto
   */
  async updateProduct(id: number, productData: UpdateProductDom): Promise<ProductDom | null> {
    return this.productBusiness.updateProduct(id, productData);
  }
  
  /**
   * Excluir produto (exclusão lógica)
   */
  async deleteProduct(id: number): Promise<boolean> {
    // Primeiro, verifica se o produto existe
    const product = await this.productBusiness.getProductById(id);
    
    if (!product) {
      return false;
    }
    
    // Ao invés de excluir, desativa o produto (exclusão lógica)
    const result = await this.productBusiness.updateProduct(id, { active: false });
    return result !== null;
  }
  
  /**
   * Buscar produtos com estoque baixo
   */
  async getLowStockProducts(threshold: number = 10): Promise<ProductDom[]> {
    return this.productBusiness.findLowStockProducts(threshold);
  }
}