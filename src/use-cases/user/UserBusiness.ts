import { BaseBusiness } from '../../core/business/BaseBusiness';
import { UserModel } from '../../core/domain/models/UserModel';
import { UserRepository } from './repository/UserRepository';
import { UserDom } from './domains/UserDom';

/**
 * Business para User
 * Herda de BaseBusiness e delega operações CRUD para o Repository
 * Adicione aqui apenas regras de negócio específicas
 */
export class UserBusiness extends BaseBusiness<UserModel, UserDom> {
  constructor() {
    const repository = new UserRepository();
    super(repository);
  }

  /**
   * Converter modelo para Dom (DTO)
   * @param model Modelo do User
   * @returns Dom do User
   */
  protected toDom(model: UserModel): UserDom {
    return {
      id: model.id,
      first_name: model.first_name,
      last_name: model.last_name,
      email: model.email,
      password_hash: model.password_hash,
      active: model.active,
      created_at: model.created_at,
      updated_at: model.updated_at,
    };
  }

  /**
   * Converter dados de criação para modelo (opcional - sobrescrever se necessário)
   * @param data Dados de entrada
   * @returns Dados formatados para o modelo
   */
  protected fromCreateData(data: any): Omit<UserModel, 'id'> {
    // TODO: Adicione validações e transformações de negócio aqui
    // Exemplo:
    // if (!data.name || data.name.trim().length === 0) {
    //   throw new Error('Nome é obrigatório');
    // }
    
    return data as Omit<UserModel, 'id'>;
  }

  // Os métodos CRUD (findById, findAll, findBy, create, update, delete, count) 
  // são herdados de BaseBusiness e delegam para o Repository
  // Não é necessário reimplementá-los

  // Adicione aqui apenas métodos de negócio específicos:
  
  /**
   * Exemplo de método de negócio específico
   * Descomente e adapte conforme necessário
   */
  /*
  async findByCustomField(value: string): Promise<UserDom | null> {
    const results = await this.findBy({ custom_field: value });
    return results.length > 0 ? results[0] : null;
  }
  */
}