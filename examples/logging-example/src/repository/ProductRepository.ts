import { CustomORM } from '@framework/infra/db/CustomORM';
import { LoggingService } from '@framework/core/tracing/LoggingService';

interface Product {
  id?: number;
  name: string;
  price: number;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface CreateProductDTO {
  name: string;
  price: number;
  description?: string;
}

interface UpdateProductDTO {
  name?: string;
  price?: number;
  description?: string;
}

/**
 * ProductRepository - Camada de acesso a dados
 * 
 * Demonstra como as queries SQL automaticamente incluem o UUID da requisição
 */
export class ProductRepository {
  private orm: CustomORM;
  private tableName = 'products';

  constructor() {
    this.orm = CustomORM.getInstance();
  }

  /**
   * Lista todos os produtos
   * 
   * O log SQL gerado incluirá automaticamente o requestId
   */
  async findAll(): Promise<Product[]> {
    LoggingService.debug('Repository: Querying all products');
    
    const result = await this.orm.query(`
      SELECT * FROM ${this.tableName}
      ORDER BY created_at DESC
    `);
    
    LoggingService.debug('Repository: Query completed', { 
      rowCount: result.rows.length 
    });
    
    return result.rows;
  }

  /**
   * Busca produto por ID
   */
  async findById(id: number): Promise<Product | null> {
    LoggingService.debug('Repository: Querying product by ID', { productId: id });
    
    const result = await this.orm.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    
    const product = result.rows[0] || null;
    
    LoggingService.debug('Repository: Query by ID completed', { 
      productId: id,
      found: !!product 
    });
    
    return product;
  }

  /**
   * Busca produto por nome
   */
  async findByName(name: string): Promise<Product | null> {
    LoggingService.debug('Repository: Querying product by name', { name });
    
    const result = await this.orm.query(
      `SELECT * FROM ${this.tableName} WHERE LOWER(name) = LOWER($1)`,
      [name]
    );
    
    const product = result.rows[0] || null;
    
    LoggingService.debug('Repository: Query by name completed', { 
      name,
      found: !!product 
    });
    
    return product;
  }

  /**
   * Cria um novo produto
   * 
   * A query INSERT será logada com o requestId
   */
  async create(data: CreateProductDTO): Promise<Product> {
    LoggingService.debug('Repository: Inserting new product', { 
      name: data.name,
      price: data.price 
    });
    
    const result = await this.orm.query(
      `INSERT INTO ${this.tableName} (name, price, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.name, data.price, data.description || null]
    );
    
    const product = result.rows[0];
    
    LoggingService.debug('Repository: Product inserted', { 
      productId: product.id,
      name: product.name 
    });
    
    return product;
  }

  /**
   * Atualiza um produto
   */
  async update(id: number, data: UpdateProductDTO): Promise<Product | null> {
    LoggingService.debug('Repository: Updating product', { 
      productId: id,
      updates: data 
    });

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }

    if (data.price !== undefined) {
      fields.push(`price = $${paramIndex++}`);
      values.push(data.price);
    }

    if (data.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await this.orm.query(
      `UPDATE ${this.tableName}
       SET ${fields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    const product = result.rows[0] || null;
    
    LoggingService.debug('Repository: Product updated', { 
      productId: id,
      updated: !!product 
    });
    
    return product;
  }

  /**
   * Remove um produto
   */
  async delete(id: number): Promise<boolean> {
    LoggingService.debug('Repository: Deleting product', { productId: id });
    
    const result = await this.orm.query(
      `DELETE FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    
    const deleted = result.rowCount > 0;
    
    LoggingService.debug('Repository: Product deletion attempted', { 
      productId: id,
      deleted 
    });
    
    return deleted;
  }

  /**
   * Busca produtos por faixa de preço
   */
  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    LoggingService.debug('Repository: Querying products by price range', { 
      minPrice,
      maxPrice 
    });
    
    const result = await this.orm.query(
      `SELECT * FROM ${this.tableName}
       WHERE price >= $1 AND price <= $2
       ORDER BY price ASC`,
      [minPrice, maxPrice]
    );
    
    LoggingService.debug('Repository: Price range query completed', { 
      minPrice,
      maxPrice,
      rowCount: result.rows.length 
    });
    
    return result.rows;
  }

  /**
   * Conta total de produtos
   */
  async count(): Promise<number> {
    LoggingService.debug('Repository: Counting products');
    
    const result = await this.orm.query(
      `SELECT COUNT(*) as total FROM ${this.tableName}`
    );
    
    const count = parseInt(result.rows[0].total);
    
    LoggingService.debug('Repository: Product count completed', { count });
    
    return count;
  }
}
