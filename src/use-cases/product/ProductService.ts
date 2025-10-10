import { BaseService, ServiceResponse, PaginatedResponse } from '../../core/services/BaseService';
import { ProductBusiness } from './ProductBusiness';
import { CreateProductDom, UpdateProductDom, ProductDom } from './domains/ProductDom';

/**
 * Serviço para Product
 * Estende BaseService para operações CRUD padrão
 */
export class ProductService extends BaseService<ProductDom, CreateProductDom, UpdateProductDom> {
  // Instância do business
  private productBusiness: ProductBusiness;

  constructor(productBusiness?: ProductBusiness) {
    super();
    this.productBusiness = productBusiness || new ProductBusiness();
  }

  /**
   * Implementação obrigatória para obter business layer
   * @returns Instância do business
   */
  protected getBusiness(): ProductBusiness {
    return this.productBusiness;
  }

  // Os métodos CRUD básicos (getById, getAll, create, update, delete) 
  // são herdados automaticamente da classe BaseService

  /**
   * Método customizado: Buscar products ativos
   * @param page Página
   * @param limit Limite por página
   * @returns Lista de products ativos
   */
  async getActive(page: number = 1, limit: number = 10): Promise<ServiceResponse<PaginatedResponse<ProductDom>>> {
    try {
      // Validar parâmetros de paginação
      if (page < 1) page = 1;
      if (limit < 1) limit = 10;
      if (limit > 100) limit = 100;

      const offset = (page - 1) * limit;

      // Buscar products ativos no business
      const items = await this.productBusiness.findActive({
        limit,
        offset
      });

      // Para total, poderia implementar um método countActive no business
      const total = items.length; // Simplificado
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Products ativos listados com sucesso',
        data: {
          items,
          total,
          page,
          limit,
          totalPages
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Erro ao listar products ativos',
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  /**
   * Método customizado: Contar total de registros
   * @returns Número total de registros
   */
  async count(): Promise<ServiceResponse<number>> {
    try {
      const total = await this.productBusiness.productRepository.count();
      
      return {
        success: true,
        message: 'Contagem realizada com sucesso',
        data: total
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Erro ao contar registros',
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  // TODO: Adicione aqui outros métodos específicos do domínio Product
  // Exemplo:
  // async findByStatus(status: string): Promise<ServiceResponse<ProductDom[]>> {
  //   // Implementação específica
  // }
}