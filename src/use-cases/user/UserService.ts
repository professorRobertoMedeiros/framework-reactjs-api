import { BaseService } from '../../core/services/BaseService';
import { UserModel } from '../../core/domain/models/UserModel';
import { UserBusiness } from './UserBusiness';
import { UserDom } from './domains/UserDom';

/**
 * Service para User
 * Herda de BaseService e delega operações CRUD para o Business
 * Retorna respostas padronizadas: { status, data?, message? }
 */
export class UserService extends BaseService<UserModel, UserDom> {
  constructor() {
    const business = new UserBusiness();
    super(business);
  }

  // Os métodos CRUD (findAll, findById, findBy, create, update, delete, count) 
  // são herdados de BaseService e delegam para o Business
  // Não é necessário reimplementá-los

  // Adicione aqui apenas métodos de serviço específicos:

  /**
   * Exemplo de método de serviço específico
   * Descomente e adapte conforme necessário
   */
  /*
  async findByCustomField(value: string) {
    try {
      const business = this.business as UserBusiness;
      const result = await business.findByCustomField(value);
      
      if (!result) {
        return {
          status: 404,
          message: 'Registro não encontrado'
        };
      }

      return {
        status: 200,
        data: result
      };
    } catch (error: any) {
      return {
        status: 500,
        message: error.message || 'Erro ao buscar registro'
      };
    }
  }
  */
}