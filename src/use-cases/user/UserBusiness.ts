import { UserModel } from '../../core/domain/models/UserModel';
import { IUserRepository, UserRepository } from './repository/UserRepository';
import { CreateUserDom, UpdateUserDom, UserDom } from './domains/UserDom';

// Interface para o business de usuários
export interface IUserBusiness {
  getUserById(id: number): Promise<UserDom | null>;
  getAllUsers(options?: { limit?: number; offset?: number }): Promise<UserDom[]>;
  createUser(data: CreateUserDom): Promise<UserDom>;
  updateUser(id: number, data: UpdateUserDom): Promise<UserDom | null>;
  deleteUser(id: number): Promise<boolean>;
  activateUser(id: number): Promise<UserDom | null>;
  deactivateUser(id: number): Promise<UserDom | null>;
}

// Implementação do business de usuários
export class UserBusiness implements IUserBusiness {
  public userRepository: IUserRepository;

  constructor(userRepository?: IUserRepository) {
    this.userRepository = userRepository || new UserRepository();
  }

  // Converter modelo para Dom (removendo dados sensíveis como password_hash)
  private toDom(user: UserModel): UserDom {
    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      active: user.active,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }

  // Hash de senha (exemplo simples - em produção usar bcrypt ou similar)
  private hashPassword(password: string): string {
    // Este é apenas um exemplo e NÃO deve ser usado em produção
    // Em produção, use bcrypt ou argon2
    return `hashed_${password}_${Date.now()}`;
  }

  // Métodos compatíveis com BaseService
  async getById(id: number): Promise<UserDom | null> {
    return this.getUserById(id);
  }

  async getAll(options?: { limit?: number; offset?: number }): Promise<UserDom[]> {
    return this.getAllUsers(options);
  }

  async create(data: CreateUserDom): Promise<UserDom> {
    return this.createUser(data);
  }

  async update(id: number, data: UpdateUserDom): Promise<UserDom | null> {
    return this.updateUser(id, data);
  }

  async delete(id: number): Promise<boolean> {
    return this.deleteUser(id);
  }

  async findByEmail(email: string): Promise<UserDom | null> {
    const user = await this.userRepository.findByEmail(email);
    return user ? this.toDom(user) : null;
  }

  async count(): Promise<number> {
    return await this.userRepository.count();
  }

  // Obter usuário por ID
  async getUserById(id: number): Promise<UserDom | null> {
    const user = await this.userRepository.findById(id);
    return user ? this.toDom(user) : null;
  }

  // Obter todos os usuários
  async getAllUsers(options?: { limit?: number; offset?: number }): Promise<UserDom[]> {
    const users = await this.userRepository.findAll(options);
    return users.map(user => this.toDom(user));
  }

  // Criar um novo usuário
  async createUser(data: CreateUserDom): Promise<UserDom> {
    // Validar email
    if (!UserModel.validateEmail(data.email)) {
      throw new Error('Email inválido');
    }

    // Verificar se o email já está em uso
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email já está em uso');
    }

    // Hash da senha
    const password_hash = this.hashPassword(data.password);

    // Criar modelo de usuário
    const user = UserModel.create({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password_hash: password_hash
    });

    // Persistir no repositório
    const createdUser = await this.userRepository.create(user);
    return this.toDom(createdUser);
  }

  // Atualizar um usuário existente
  async updateUser(id: number, data: UpdateUserDom): Promise<UserDom | null> {
    // Verificar se o usuário existe
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      return null;
    }

    // Verificar se o email está sendo atualizado e se já está em uso
    if (data.email && data.email !== existingUser.email) {
      // Validar novo email
      if (!UserModel.validateEmail(data.email)) {
        throw new Error('Email inválido');
      }

      // Verificar se o novo email já está em uso
      const userWithEmail = await this.userRepository.findByEmail(data.email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new Error('Email já está em uso por outro usuário');
      }
    }

    // Preparar dados para atualização
    const updateData: Partial<UserModel> = {
      ...data as any,
      // Hash da senha se fornecida
      ...(data.password && { password_hash: this.hashPassword(data.password) })
    };

    // Remover campo password (não é uma coluna no banco)
    if ('password' in updateData) {
      delete (updateData as any).password;
    }

    // Atualizar no repositório
    const updatedUser = await this.userRepository.update(id, updateData);
    return updatedUser ? this.toDom(updatedUser) : null;
  }

  // Excluir um usuário
  async deleteUser(id: number): Promise<boolean> {
    // Verificar se o usuário existe
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      return false;
    }

    // Excluir do repositório
    return await this.userRepository.delete(id);
  }

  // Ativar um usuário
  async activateUser(id: number): Promise<UserDom | null> {
    return await this.updateUser(id, { active: true });
  }

  // Desativar um usuário
  async deactivateUser(id: number): Promise<UserDom | null> {
    return await this.updateUser(id, { active: false });
  }
}