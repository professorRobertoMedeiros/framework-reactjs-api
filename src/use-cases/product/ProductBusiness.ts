import { ProductModel } from '../../core/domain/models/ProductModel';
import { IProductRepository, ProductRepository } from './repository/ProductRepository';
import { CreateProductDom, UpdateProductDom, ProductDom } from './domains/ProductDom';
import { PaginatedResult, PaginationOptions } from '../../infra/repository/BaseRepository';

// Interface para o business de produtos
export interface IProductBusiness {
  getProductById(id: number): Promise<ProductDom | null>;
  getAllProducts(options?: PaginationOptions): Promise<ProductDom[]>;
  getAllProductsPaginated(options?: PaginationOptions): Promise<PaginatedResult<ProductDom>>;
  createProduct(data: CreateProductDom): Promise<ProductDom>;
  updateProduct(id: number, data: UpdateProductDom): Promise<ProductDom | null>;
  deleteProduct(id: number): Promise<boolean>;
  findLowStockProducts(threshold?: number): Promise<ProductDom[]>;
}

// Implementação do business de produtos
export class ProductBusiness implements IProductBusiness {
  private productRepository: IProductRepository;

  constructor(productRepository?: IProductRepository) {
    this.productRepository = productRepository || new ProductRepository();
  }

  // Converter modelo para Dom
  private toDom(product: ProductModel): ProductDom {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      active: product.active,
      created_at: product.created_at,
      updated_at: product.updated_at
    };
  }

  // Obter produto por ID
  async getProductById(id: number): Promise<ProductDom | null> {
    const product = await this.productRepository.findById(id);
    return product ? this.toDom(product) : null;
  }

  // Obter todos os produtos
  async getAllProducts(options?: PaginationOptions): Promise<ProductDom[]> {
    const products = await this.productRepository.findAll(options);
    return products.map(product => this.toDom(product));
  }

  // Obter todos os produtos com paginação
  async getAllProductsPaginated(options?: PaginationOptions): Promise<PaginatedResult<ProductDom>> {
    const result = await this.productRepository.findAllPaginated(options);
    
    return {
      data: result.data.map(product => this.toDom(product)),
      pagination: result.pagination
    };
  }

  // Criar um novo produto
  async createProduct(data: CreateProductDom): Promise<ProductDom> {
    // Validações
    if (data.price < 0) {
      throw new Error('O preço não pode ser negativo');
    }
    
    if (data.stock < 0) {
      throw new Error('O estoque não pode ser negativo');
    }

    // Criar produto
    const product = new ProductModel();
    product.name = data.name;
    product.description = data.description;
    product.price = data.price;
    product.stock = data.stock;
    product.active = data.active !== undefined ? data.active : true;
    product.created_at = new Date();

    // Persistir no repositório
    const createdProduct = await this.productRepository.create(product);
    return this.toDom(createdProduct);
  }

  // Atualizar um produto existente
  async updateProduct(id: number, data: UpdateProductDom): Promise<ProductDom | null> {
    // Verificar se o produto existe
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      return null;
    }

    // Validações
    if (data.price !== undefined && data.price < 0) {
      throw new Error('O preço não pode ser negativo');
    }
    
    if (data.stock !== undefined && data.stock < 0) {
      throw new Error('O estoque não pode ser negativo');
    }

    // Preparar dados para atualização
    const updateData: Partial<ProductModel> = {
      ...data,
      updated_at: new Date()
    };

    // Atualizar no repositório
    const updatedProduct = await this.productRepository.update(id, updateData);
    return updatedProduct ? this.toDom(updatedProduct) : null;
  }

  // Excluir um produto
  async deleteProduct(id: number): Promise<boolean> {
    // Verificar se o produto existe
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      return false;
    }

    // Excluir do repositório (ou desativar, dependendo da regra de negócio)
    return await this.productRepository.delete(id);
  }

  // Encontrar produtos com estoque baixo
  async findLowStockProducts(threshold: number = 10): Promise<ProductDom[]> {
    const products = await this.productRepository.findLowStock(threshold);
    return products.map(product => this.toDom(product));
  }
}