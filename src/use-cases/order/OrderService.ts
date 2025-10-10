import { BaseService, ServiceResponse, PaginatedResponse } from '../../core/services/BaseService';
import { OrderBusiness } from './OrderBusiness';
import { CreateOrderDom, UpdateOrderDom, OrderDom } from './domains/OrderDom';

/**
 * Serviço para Order
 * Estende BaseService para operações CRUD padrão
 */
export class OrderService extends BaseService<OrderDom, CreateOrderDom, UpdateOrderDom> {
  // Instância do business
  private orderBusiness: OrderBusiness;

  constructor(orderBusiness?: OrderBusiness) {
    super();
    this.orderBusiness = orderBusiness || new OrderBusiness();
  }

  /**
   * Implementação obrigatória para obter business layer
   * @returns Instância do business
   */
  protected getBusiness(): OrderBusiness {
    return this.orderBusiness;
  }

  // Os métodos CRUD básicos (getById, getAll, create, update, delete) 
  // são herdados automaticamente da classe BaseService

  /**
   * Método customizado: Buscar orders ativos
   * @param page Página
   * @param limit Limite por página
   * @returns Lista de orders ativos
   */
  async getActive(page: number = 1, limit: number = 10): Promise<ServiceResponse<PaginatedResponse<OrderDom>>> {
    try {
      // Validar parâmetros de paginação
      if (page < 1) page = 1;
      if (limit < 1) limit = 10;
      if (limit > 100) limit = 100;

      const offset = (page - 1) * limit;

      // Buscar orders ativos no business
      const items = await this.orderBusiness.findActive({
        limit,
        offset
      });

      // Para total, poderia implementar um método countActive no business
      const total = items.length; // Simplificado
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Orders ativos listados com sucesso',
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
        message: 'Erro ao listar orders ativos',
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
      const total = await this.orderBusiness.orderRepository.count();
      
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

  // TODO: Adicione aqui outros métodos específicos do domínio Order
  // Exemplo:
  // async findByStatus(status: string): Promise<ServiceResponse<OrderDom[]>> {
  //   // Implementação específica
  // }
}