import { IUserBusiness, UserBusiness } from './UserBusiness';
import { CreateUserDom, UpdateUserDom, UserDom } from './domains/UserDom';

// Response interface para transferência de dados na camada de serviço
export interface UserServiceResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Interface para o serviço de usuários
export interface IUserService {
  getUserById(id: number): Promise<UserServiceResponse<UserDom>>;
  getAllUsers(page?: number, limit?: number): Promise<UserServiceResponse<{
    users: UserDom[],
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }>>;
  createUser(data: CreateUserDom): Promise<UserServiceResponse<UserDom>>;
  updateUser(id: number, data: UpdateUserDom): Promise<UserServiceResponse<UserDom>>;
  deleteUser(id: number): Promise<UserServiceResponse>;
  activateUser(id: number): Promise<UserServiceResponse<UserDom>>;
  deactivateUser(id: number): Promise<UserServiceResponse<UserDom>>;
}

// Implementação do serviço de usuários
export class UserService implements IUserService {
  private userBusiness: IUserBusiness;

  constructor(userBusiness?: IUserBusiness) {
    this.userBusiness = userBusiness || new UserBusiness();
  }

  // Obter usuário por ID
  async getUserById(id: number): Promise<UserServiceResponse<UserDom>> {
    try {
      const user = await this.userBusiness.getUserById(id);
      
      if (!user) {
        return {
          success: false,
          message: `Usuário com ID ${id} não encontrado`,
          error: 'USER_NOT_FOUND'
        };
      }

      return {
        success: true,
        message: 'Usuário encontrado com sucesso',
        data: user
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Erro ao buscar usuário',
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  // Obter todos os usuários com paginação
  async getAllUsers(
    page: number = 1, 
    limit: number = 10
  ): Promise<UserServiceResponse<{
    users: UserDom[],
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }>> {
    try {
      // Validar parâmetros de paginação
      if (page < 1) page = 1;
      if (limit < 1) limit = 10;
      if (limit > 100) limit = 100;

      const offset = (page - 1) * limit;

      // Buscar usuários no business
      const users = await this.userBusiness.getAllUsers({
        limit,
        offset
      });

      // Usar repository dentro do business para contar total
      // Implementado nesta camada apenas para demonstração
      const userRepository = new UserBusiness().userRepository;
      const total = await userRepository.count();

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Usuários listados com sucesso',
        data: {
          users,
          total,
          page,
          limit,
          totalPages
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Erro ao listar usuários',
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  // Criar um novo usuário
  async createUser(data: CreateUserDom): Promise<UserServiceResponse<UserDom>> {
    try {
      // Validar dados de entrada
      if (!data.first_name || !data.last_name || !data.email || !data.password) {
        return {
          success: false,
          message: 'Todos os campos são obrigatórios',
          error: 'MISSING_REQUIRED_FIELDS'
        };
      }

      // Regras de validação adicionais
      if (data.password.length < 6) {
        return {
          success: false,
          message: 'A senha deve ter pelo menos 6 caracteres',
          error: 'PASSWORD_TOO_SHORT'
        };
      }

      // Chamar o business para criar o usuário
      const user = await this.userBusiness.createUser(data);

      return {
        success: true,
        message: 'Usuário criado com sucesso',
        data: user
      };
    } catch (error: any) {
      // Tratamento de erros específicos
      if (error.message.includes('Email já está em uso')) {
        return {
          success: false,
          message: 'Este email já está cadastrado',
          error: 'EMAIL_ALREADY_EXISTS'
        };
      }

      if (error.message.includes('Email inválido')) {
        return {
          success: false,
          message: 'O formato do email é inválido',
          error: 'INVALID_EMAIL'
        };
      }

      return {
        success: false,
        message: 'Erro ao criar usuário',
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  // Atualizar um usuário existente
  async updateUser(id: number, data: UpdateUserDom): Promise<UserServiceResponse<UserDom>> {
    try {
      // Validar se há campos para atualizar
      if (Object.keys(data).length === 0) {
        return {
          success: false,
          message: 'Nenhum dado fornecido para atualização',
          error: 'NO_UPDATE_DATA'
        };
      }

      // Regras de validação adicionais
      if (data.password && data.password.length < 6) {
        return {
          success: false,
          message: 'A senha deve ter pelo menos 6 caracteres',
          error: 'PASSWORD_TOO_SHORT'
        };
      }

      // Chamar o business para atualizar o usuário
      const user = await this.userBusiness.updateUser(id, data);

      if (!user) {
        return {
          success: false,
          message: `Usuário com ID ${id} não encontrado`,
          error: 'USER_NOT_FOUND'
        };
      }

      return {
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: user
      };
    } catch (error: any) {
      // Tratamento de erros específicos
      if (error.message.includes('Email já está em uso')) {
        return {
          success: false,
          message: 'Este email já está cadastrado por outro usuário',
          error: 'EMAIL_ALREADY_EXISTS'
        };
      }

      if (error.message.includes('Email inválido')) {
        return {
          success: false,
          message: 'O formato do email é inválido',
          error: 'INVALID_EMAIL'
        };
      }

      return {
        success: false,
        message: 'Erro ao atualizar usuário',
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  // Excluir um usuário
  async deleteUser(id: number): Promise<UserServiceResponse> {
    try {
      const deleted = await this.userBusiness.deleteUser(id);

      if (!deleted) {
        return {
          success: false,
          message: `Usuário com ID ${id} não encontrado`,
          error: 'USER_NOT_FOUND'
        };
      }

      return {
        success: true,
        message: 'Usuário excluído com sucesso'
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Erro ao excluir usuário',
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  // Ativar um usuário
  async activateUser(id: number): Promise<UserServiceResponse<UserDom>> {
    try {
      const user = await this.userBusiness.activateUser(id);

      if (!user) {
        return {
          success: false,
          message: `Usuário com ID ${id} não encontrado`,
          error: 'USER_NOT_FOUND'
        };
      }

      return {
        success: true,
        message: 'Usuário ativado com sucesso',
        data: user
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Erro ao ativar usuário',
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  // Desativar um usuário
  async deactivateUser(id: number): Promise<UserServiceResponse<UserDom>> {
    try {
      const user = await this.userBusiness.deactivateUser(id);

      if (!user) {
        return {
          success: false,
          message: `Usuário com ID ${id} não encontrado`,
          error: 'USER_NOT_FOUND'
        };
      }

      return {
        success: true,
        message: 'Usuário desativado com sucesso',
        data: user
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Erro ao desativar usuário',
        error: error.message || 'Erro desconhecido'
      };
    }
  }
}