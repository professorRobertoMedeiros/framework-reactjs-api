import { BaseRepository } from '../../../infra/repository/BaseRepository';
import { ClienteModel } from '../../../core/domain/models/ClienteModel';

/**
 * Repositório para Cliente
 * Estende BaseRepository para operações CRUD básicas
 */
export class ClienteRepository extends BaseRepository<ClienteModel> {
  constructor() {
    super(ClienteModel);
  }

  /**
   * Mapear dados do banco para o modelo Cliente
   * @param data Dados brutos do banco de dados
   * @returns Instância do modelo Cliente
   */
  protected mapToModel(data: any): ClienteModel {
    const item = new ClienteModel();
    
    // Mapear propriedades básicas
    item.id = data.id;
    
    // TODO: Adicione aqui outras propriedades específicas do ClienteModel
    // Exemplo:
    // item.name = data.name;
    // item.email = data.email;
    // item.created_at = data.created_at;
    
    // Para mapear todas as propriedades automaticamente (não recomendado para produção):
    Object.assign(item, data);
    
    return item;
  }

  /**
   * Buscar cliente por email (exemplo de método customizado)
   * @param email Email para busca
   * @returns Cliente encontrado ou null
   */
  async findByEmail(email: string): Promise<ClienteModel | null> {
    return this.findOneBy({ email });
  }

  /**
   * Buscar clientes ativos (exemplo de método customizado)
   * @param options Opções de consulta
   * @returns Lista de clientes ativos
   */
  async findActive(options?: { limit?: number; offset?: number; orderBy?: string }): Promise<ClienteModel[]> {
    return this.findBy({ active: true }, options);
  }

  /**
   * Contar clientes por status (exemplo de método customizado)
   * @param status Status para contar
   * @returns Número de registros
   */
  async countByStatus(status: string): Promise<number> {
    return this.count({ status });
  }
}