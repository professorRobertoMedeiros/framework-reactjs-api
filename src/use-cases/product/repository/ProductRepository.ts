import { BaseRepository } from '../../../infra/repository/BaseRepository';
import { ProductModel } from '../../../core/domain/models/ProductModel';

/**
 * Repositório para Product
 * Estende BaseRepository para operações CRUD básicas
 */
export class ProductRepository extends BaseRepository<ProductModel> {
  constructor() {
    super(ProductModel);
  }

  /**
   * Mapear dados do banco para o modelo Product
   * @param data Dados brutos do banco de dados
   * @returns Instância do modelo Product
   */
  protected mapToModel(data: any): ProductModel {
    const item = new ProductModel();
    
    // Mapear propriedades básicas
    item.id = data.id;
    
    // TODO: Adicione aqui outras propriedades específicas do ProductModel
    // Exemplo:
    // item.name = data.name;
    // item.email = data.email;
    // item.created_at = data.created_at;
    
    // Para mapear todas as propriedades automaticamente (não recomendado para produção):
    Object.assign(item, data);
    
    return item;
  }

  /**
   * Buscar product por email (exemplo de método customizado)
   * @param email Email para busca
   * @returns Product encontrado ou null
   */
  async findByEmail(email: string): Promise<ProductModel | null> {
    return this.findOneBy({ email });
  }

  /**
   * Buscar products ativos (exemplo de método customizado)
   * @param options Opções de consulta
   * @returns Lista de products ativos
   */
  async findActive(options?: { limit?: number; offset?: number; orderBy?: string }): Promise<ProductModel[]> {
    return this.findBy({ active: true }, options);
  }

  /**
   * Contar products por status (exemplo de método customizado)
   * @param status Status para contar
   * @returns Número de registros
   */
  async countByStatus(status: string): Promise<number> {
    return this.count({ status });
  }
}