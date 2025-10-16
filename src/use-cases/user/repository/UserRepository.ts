import { BaseRepository } from '../../../infra/repository/BaseRepository';
import { UserModel } from '../../../core/domain/models/UserModel';

/**
 * Repositório para User
 * Estende BaseRepository para operações CRUD básicas
 */
export class UserRepository extends BaseRepository<UserModel> {
  constructor() {
    super(UserModel);
  }

  /**
   * Mapear dados do banco para o modelo User
   * @param data Dados brutos do banco de dados
   * @returns Instância do modelo User
   */
  protected mapToModel(data: any): UserModel {
    const item = new UserModel();
    Object.assign(item, data);
    return item;
  }

  /**
   * Buscar por condições customizadas
   * @param conditions Condições de busca
   * @param options Opções adicionais
   */
  async findByConditions(
    conditions: Record<string, any>,
    options?: { limit?: number; offset?: number; includes?: string[]; orderBy?: string }
  ): Promise<UserModel[]> {
    return this.findBy(conditions, options);
  }
}