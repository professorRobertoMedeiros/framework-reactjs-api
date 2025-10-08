import { UserModel } from '../../../core/domain/models/UserModel';
import { BaseRepository, IRepository, PaginationOptions } from '../../../infra/repository/BaseRepository';
import { QueryBuilder, Operator } from '../../../infra/db/query/QueryBuilder';

// Interface para o repository de usuários
export interface IUserRepository extends IRepository<UserModel> {
  findByEmail(email: string): Promise<UserModel | null>;
  findActiveUsers(options?: PaginationOptions): Promise<UserModel[]>;
  findByName(firstName: string, lastName: string): Promise<UserModel[]>;
  searchUsers(searchTerm: string, options?: PaginationOptions): Promise<UserModel[]>;
}

// Implementação do repository de usuários
export class UserRepository extends BaseRepository<UserModel> implements IUserRepository {

  constructor() {
    super(UserModel);
  }

  // Buscar usuário por email - método específico deste repositório
  async findByEmail(email: string): Promise<UserModel | null> {
    return this.findOneBy({ email });
  }

  // Buscar usuários ativos - método específico deste repositório
  async findActiveUsers(options?: PaginationOptions): Promise<UserModel[]> {
    return this.findBy({ active: true }, {
      ...options,
      orderBy: 'created_at DESC'
    });
  }

  // Buscar usuários por nome - método específico deste repositório
  async findByName(firstName: string, lastName: string): Promise<UserModel[]> {
    const conditions: Record<string, any> = {};
    
    if (firstName) {
      conditions.first_name = firstName;
    }
    
    if (lastName) {
      conditions.last_name = lastName;
    }
    
    return this.findBy(conditions);
  }

  // Buscar usuários por termo de pesquisa - método específico deste repositório
  async searchUsers(searchTerm: string, options?: PaginationOptions): Promise<UserModel[]> {
    // Se não tiver termo de pesquisa, retorna todos
    if (!searchTerm) {
      return this.findAll(options);
    }

    // Criar consulta com OR para vários campos
    const query = new QueryBuilder()
      .where('first_name', Operator.LIKE, `%${searchTerm}%`)
      .or('last_name', Operator.LIKE, `%${searchTerm}%`)
      .or('email', Operator.LIKE, `%${searchTerm}%`)
      .build();

    return this.findByQuery(query, options);
  }
}