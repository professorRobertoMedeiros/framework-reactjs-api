import { BaseRepository } from '../../../infra/repository/BaseRepository';
import { OrderModel } from '../../../core/domain/models/OrderModel';

/**
 * Repositório para Order
 * Estende BaseRepository para operações CRUD básicas
 */
export class OrderRepository extends BaseRepository<OrderModel> {
  constructor() {
    super(OrderModel);
  }

  /**
   * Mapear dados do banco para o modelo Order
   * @param data Dados brutos do banco de dados
   * @returns Instância do modelo Order
   */
  protected mapToModel(data: any): OrderModel {
    const item = new OrderModel();
    
    // Mapear propriedades básicas
    item.id = data.id;
    
    // TODO: Adicione aqui outras propriedades específicas do OrderModel
    // Exemplo:
    // item.name = data.name;
    // item.email = data.email;
    // item.created_at = data.created_at;
    
    // Para mapear todas as propriedades automaticamente (não recomendado para produção):
    Object.assign(item, data);
    
    return item;
  }

  /**
   * Buscar order por email (exemplo de método customizado)
   * @param email Email para busca
   * @returns Order encontrado ou null
   */
  async findByEmail(email: string): Promise<OrderModel | null> {
    return this.findOneBy({ email });
  }

  /**
   * Buscar orders ativos (exemplo de método customizado)
   * @param options Opções de consulta
   * @returns Lista de orders ativos
   */
  async findActive(options?: { limit?: number; offset?: number; orderBy?: string }): Promise<OrderModel[]> {
    return this.findBy({ active: true }, options);
  }

  /**
   * Contar orders por status (exemplo de método customizado)
   * @param status Status para contar
   * @returns Número de registros
   */
  async countByStatus(status: string): Promise<number> {
    return this.count({ status });
  }
}