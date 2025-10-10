import { BaseService, ServiceResponse, PaginatedResponse } from '../../core/services/BaseService';
import { UserBusiness } from './UserBusiness';
import { UserDom } from './domains/UserDom';

export interface CreateUserDom {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserDom {
  name?: string;
  email?: string;
  password?: string;
}

export class UserService extends BaseService<UserDom, CreateUserDom, UpdateUserDom> {
  private userBusiness: UserBusiness;

  constructor() {
    super();
    this.userBusiness = new UserBusiness();
  }

  protected getBusiness(): UserBusiness {
    return this.userBusiness;
  }

  // Métodos específicos do usuário
  async findByEmail(email: string): Promise<ServiceResponse<UserDom | null>> {
    try {
      const user = await this.userBusiness.findByEmail(email);
      
      return {
        success: true,
        message: user ? 'Usuário encontrado' : 'Usuário não encontrado',
        data: user
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao buscar usuário por email',
        error: (error as Error).message
      };
    }
  }
}
