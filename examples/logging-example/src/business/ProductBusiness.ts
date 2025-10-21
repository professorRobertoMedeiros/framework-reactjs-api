import { LoggingService } from '@framework/core/tracing/LoggingService';
import { ProductRepository } from '../repository/ProductRepository';

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
 * ProductBusiness - Lógica de negócio para produtos
 * 
 * Demonstra como os logs com UUID funcionam na camada de negócio
 */
export class ProductBusiness {
  private repository: ProductRepository;

  constructor() {
    this.repository = new ProductRepository();
  }

  /**
   * Lista todos os produtos
   */
  async listAll(): Promise<Product[]> {
    LoggingService.info('Business: Starting product listing');
    
    try {
      const products = await this.repository.findAll();
      
      LoggingService.info('Business: Product listing completed', { 
        count: products.length 
      });
      
      return products;
    } catch (error) {
      LoggingService.error('Business: Error listing products', error);
      throw error;
    }
  }

  /**
   * Busca produto por ID
   */
  async findById(id: number): Promise<Product | null> {
    LoggingService.info('Business: Searching for product', { productId: id });
    
    if (!id || id <= 0) {
      LoggingService.warn('Business: Invalid product ID', { productId: id });
      throw new Error('Invalid product ID');
    }

    try {
      const product = await this.repository.findById(id);
      
      if (product) {
        LoggingService.info('Business: Product found', { 
          productId: id,
          productName: product.name 
        });
      } else {
        LoggingService.warn('Business: Product not found', { productId: id });
      }
      
      return product;
    } catch (error) {
      LoggingService.error('Business: Error finding product', error, { 
        productId: id 
      });
      throw error;
    }
  }

  /**
   * Cria um novo produto
   */
  async create(data: CreateProductDTO): Promise<Product> {
    LoggingService.info('Business: Starting product creation', { 
      productName: data.name,
      price: data.price 
    });

    // Validações de negócio
    if (!data.name || data.name.trim().length === 0) {
      LoggingService.warn('Business: Invalid product name', { name: data.name });
      throw new Error('Product name is required');
    }

    if (data.price <= 0) {
      LoggingService.warn('Business: Invalid product price', { price: data.price });
      throw new Error('Product price must be positive');
    }

    try {
      // Verifica se já existe produto com mesmo nome
      const existingProduct = await this.repository.findByName(data.name);
      
      if (existingProduct) {
        LoggingService.warn('Business: Product with same name already exists', { 
          name: data.name,
          existingId: existingProduct.id 
        });
        throw new Error('Product with this name already exists');
      }

      const product = await this.repository.create(data);
      
      LoggingService.info('Business: Product created successfully', { 
        productId: product.id,
        productName: product.name,
        price: product.price 
      });
      
      return product;
    } catch (error) {
      LoggingService.error('Business: Error creating product', error, { 
        productData: data 
      });
      throw error;
    }
  }

  /**
   * Atualiza um produto
   */
  async update(id: number, data: UpdateProductDTO): Promise<Product | null> {
    LoggingService.info('Business: Starting product update', { 
      productId: id,
      updates: data 
    });

    // Validações
    if (data.price !== undefined && data.price <= 0) {
      LoggingService.warn('Business: Invalid product price for update', { 
        price: data.price 
      });
      throw new Error('Product price must be positive');
    }

    try {
      // Verifica se o produto existe
      const existingProduct = await this.repository.findById(id);
      
      if (!existingProduct) {
        LoggingService.warn('Business: Product not found for update', { 
          productId: id 
        });
        return null;
      }

      const updatedProduct = await this.repository.update(id, data);
      
      LoggingService.info('Business: Product updated successfully', { 
        productId: id,
        changes: data 
      });
      
      return updatedProduct;
    } catch (error) {
      LoggingService.error('Business: Error updating product', error, { 
        productId: id,
        updates: data 
      });
      throw error;
    }
  }

  /**
   * Remove um produto
   */
  async delete(id: number): Promise<boolean> {
    LoggingService.info('Business: Starting product deletion', { 
      productId: id 
    });

    try {
      // Verifica se o produto existe
      const existingProduct = await this.repository.findById(id);
      
      if (!existingProduct) {
        LoggingService.warn('Business: Product not found for deletion', { 
          productId: id 
        });
        return false;
      }

      const deleted = await this.repository.delete(id);
      
      if (deleted) {
        LoggingService.info('Business: Product deleted successfully', { 
          productId: id,
          productName: existingProduct.name 
        });
      }
      
      return deleted;
    } catch (error) {
      LoggingService.error('Business: Error deleting product', error, { 
        productId: id 
      });
      throw error;
    }
  }

  /**
   * Busca produtos por faixa de preço
   */
  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    LoggingService.info('Business: Searching products by price range', { 
      minPrice,
      maxPrice 
    });

    if (minPrice < 0 || maxPrice < 0 || minPrice > maxPrice) {
      LoggingService.warn('Business: Invalid price range', { 
        minPrice,
        maxPrice 
      });
      throw new Error('Invalid price range');
    }

    try {
      const products = await this.repository.findByPriceRange(minPrice, maxPrice);
      
      LoggingService.info('Business: Products found in price range', { 
        minPrice,
        maxPrice,
        count: products.length 
      });
      
      return products;
    } catch (error) {
      LoggingService.error('Business: Error finding products by price range', error, { 
        minPrice,
        maxPrice 
      });
      throw error;
    }
  }
}
