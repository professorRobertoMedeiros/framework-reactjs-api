import { BaseService, ServiceResponse, PaginatedResponse } from '../../core/services/BaseService';
import { ClienteBusiness } from './ClienteBusiness';
import { CreateClienteDom, UpdateClienteDom, ClienteDom } from './domains/ClienteDom';

/**
 * Serviço para Cliente
 * Estende BaseService para operações CRUD padrão
 */
export class ClienteService extends BaseService<ClienteDom, CreateClienteDom, UpdateClienteDom> {
  // Instância do business
  private clienteBusiness: ClienteBusiness;

  constructor(clienteBusiness?: ClienteBusiness) {
    super();
    this.clienteBusiness = clienteBusiness || new ClienteBusiness();
  }

  /**
   * Implementação obrigatória para obter business layer
   * @returns Instância do business
   */
  protected getBusiness(): ClienteBusiness {
    return this.clienteBusiness;
  }

  // Os métodos CRUD básicos (getById, getAll, create, update, delete) 
  // são herdados automaticamente da classe BaseService

  /**
   * Método customizado: Buscar clientes ativos
   * @param page Página
   * @param limit Limite por página
   * @returns Lista de clientes ativos
   */
  async getActive(page: number = 1, limit: number = 10): Promise<ServiceResponse<PaginatedResponse<ClienteDom>>> {
    try {
      // Validar parâmetros de paginação
      if (page < 1) page = 1;
      if (limit < 1) limit = 10;
      if (limit > 100) limit = 100;

      const offset = (page - 1) * limit;

      // Buscar clientes ativos no business
      const items = await this.clienteBusiness.findActive({
        limit,
        offset
      });

      // Para total, poderia implementar um método countActive no business
      const total = items.length; // Simplificado
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Clientes ativos listados com sucesso',
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
        message: 'Erro ao listar clientes ativos',
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
      const total = await this.clienteBusiness.clienteRepository.count();
      
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

  // TODO: Adicione aqui outros métodos específicos do domínio Cliente
  // Exemplo:
  // async findByStatus(status: string): Promise<ServiceResponse<ClienteDom[]>> {
  //   // Implementação específica
  // }
}