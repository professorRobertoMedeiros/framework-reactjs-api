import { ProductModel } from '../../../core/domain/models/ProductModel';
import { BaseRepository, IRepository, PaginationOptions, PaginatedResult } from '../../../infra/repository/BaseRepository';

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
export class ProductRepository extends BaseRepository<ProductModel> implements IProductRepository {
  
  constructor() {
    super(ProductModel);
  }
  
  /**
   * Busca produtos por nome
   */
  async findByName(name: string): Promise<ProductModel[]> {
    return this.findBy({ name });
  }
  
  /**
   * Busca produtos ativos
   */
  async findActiveProducts(options?: PaginationOptions): Promise<ProductModel[]> {
    return this.findBy({ active: true }, options);
  }
  
  /**
   * Busca produtos ativos com paginação
   */
  async findActiveProductsPaginated(options?: PaginationOptions): Promise<PaginatedResult<ProductModel>> {
    return this.findByPaginated({ active: true }, options);
  }
  
  /**
   * Busca produtos com estoque abaixo do limite
   */
  async findLowStock(threshold: number): Promise<ProductModel[]> {
    const client = await this.orm.getClient();
    try {
      const result = await client.query(
        `SELECT * FROM ${this.tableName} WHERE stock < $1 AND active = true`,
        [threshold]
      );
      return result.rows.map(row => this.mapToModel(row));
    } finally {
      client.release();
    }
  }
}