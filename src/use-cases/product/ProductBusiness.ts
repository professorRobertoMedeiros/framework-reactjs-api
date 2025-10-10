import { ProductModel } from '../../core/domain/models/ProductModel';
import { ProductRepository } from './repository/ProductRepository';
import { CreateProductDom, UpdateProductDom, ProductDom } from './domains/ProductDom';

/**
 * Business para Product
 * Contém as regras de negócio específicas do domínio
 */
export class ProductBusiness {
  // Injeção de dependência do repository
  public productRepository: ProductRepository;

  constructor(productRepository?: ProductRepository) {
    this.productRepository = productRepository || new ProductRepository();
  }

  /**
   * Converter modelo para Dom
   * @param model Modelo do Product
   * @returns Dom do Product
   */
  private toDom(model: ProductModel): ProductDom {
    return {
      id: model.id,
      // TODO: Mapear outras propriedades do modelo para o Dom aqui
      // Exemplo:
      // name: model.name,
      // email: model.email,
      // created_at: model.created_at,
    };
  }

  /**
   * Converter Dom de criação para modelo
   * @param dom Dom de criação do Product
   * @returns Dados para criação do modelo
   */
  private fromCreateDom(dom: CreateProductDom): Omit<ProductModel, 'id'> {
    // TODO: Implementar conversão do Dom para modelo
    // Validações e transformações de negócio devem ser feitas aqui
    
    const modelData: any = {
      // Exemplo:
      // name: dom.name,
      // email: dom.email,
      // created_at: new Date(),
    };

    return modelData;
  }

  /**
   * Converter Dom de atualização para dados parciais do modelo
   * @param dom Dom de atualização do Product
   * @returns Dados parciais para atualização do modelo
   */
  private fromUpdateDom(dom: UpdateProductDom): Partial<ProductModel> {
    // TODO: Implementar conversão do Dom de atualização para modelo
    // Validações e transformações de negócio devem ser feitas aqui
    
    const modelData: any = {
      // Exemplo:
      // name: dom.name,
      // updated_at: new Date(),
    };

    return modelData;
  }

  /**
   * Obter product por ID
   * @param id ID do product
   * @returns Dom do Product ou null se não encontrado
   */
  async getById(id: number): Promise<ProductDom | null> {
    // Validações de negócio
    if (!id || id <= 0) {
      throw new Error('ID inválido fornecido');
    }

    const result = await this.productRepository.findById(id);
    return result ? this.toDom(result) : null;
  }

  /**
   * Obter todos os products
   * @param options Opções de consulta
   * @returns Lista de Doms de Product
   */
  async getAll(options?: { limit?: number; offset?: number }): Promise<ProductDom[]> {
    const results = await this.productRepository.findAll(options);
    return results.map(result => this.toDom(result));
  }

  /**
   * Criar um novo product
   * @param data Dados para criação do product
   * @returns Dom do Product criado
   */
  async create(data: CreateProductDom): Promise<ProductDom> {
    // Validações de negócio específicas
    await this.validateCreateData(data);
    
    // Converter Dom para modelo
    const modelData = this.fromCreateDom(data);
    
    // Criar no repository
    const created = await this.productRepository.create(modelData);
    
    return this.toDom(created);
  }

  /**
   * Atualizar um product existente
   * @param id ID do product
   * @param data Dados para atualização
   * @returns Dom do Product atualizado ou null se não encontrado
   */
  async update(id: number, data: UpdateProductDom): Promise<ProductDom | null> {
    // Validações de negócio
    if (!id || id <= 0) {
      throw new Error('ID inválido fornecido');
    }

    // Verificar se existe
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      return null;
    }
    
    // Validações de negócio específicas para atualização
    await this.validateUpdateData(data);
    
    // Converter Dom para dados de modelo
    const modelData = this.fromUpdateDom(data);
    
    // Atualizar no repository
    const updated = await this.productRepository.update(id, modelData);
    return updated ? this.toDom(updated) : null;
  }

  /**
   * Excluir um product
   * @param id ID do product
   * @returns true se excluído com sucesso, false se não encontrado
   */
  async delete(id: number): Promise<boolean> {
    // Validações de negócio
    if (!id || id <= 0) {
      throw new Error('ID inválido fornecido');
    }

    // Verificar se existe antes de excluir
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      return false;
    }

    // Validações de negócio para exclusão
    await this.validateDeleteOperation(existing);

    return await this.productRepository.delete(id);
  }

  /**
   * Validar dados para criação (regras de negócio)
   * @param data Dados para validação
   */
  private async validateCreateData(data: CreateProductDom): Promise<void> {
    // TODO: Implementar validações de negócio específicas para criação
    // Exemplo:
    // if (!data.name || data.name.trim().length === 0) {
    //   throw new Error('Nome é obrigatório');
    // }
    // 
    // if (!data.email || !this.isValidEmail(data.email)) {
    //   throw new Error('Email inválido');
    // }
  }

  /**
   * Validar dados para atualização (regras de negócio)
   * @param data Dados para validação
   */
  private async validateUpdateData(data: UpdateProductDom): Promise<void> {
    // TODO: Implementar validações de negócio específicas para atualização
  }

  /**
   * Validar operação de exclusão (regras de negócio)
   * @param model Modelo para validação
   */
  private async validateDeleteOperation(model: ProductModel): Promise<void> {
    // TODO: Implementar validações de negócio para exclusão
    // Exemplo: verificar se não há registros dependentes
  }

  /**
   * Buscar products ativos
   * @param options Opções de consulta
   * @returns Lista de products ativos
   */
  async findActive(options?: { limit?: number; offset?: number; orderBy?: string }): Promise<ProductDom[]> {
    const results = await this.productRepository.findActive(options);
    return results.map(result => this.toDom(result));
  }

  /**
   * Contar registros (método para compatibilidade com BaseService)
   * @returns Número de registros
   */
  async count(): Promise<number> {
    return await this.productRepository.count();
  }
}