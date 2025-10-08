import { UserModel } from '../../core/domain/models/UserModel';
import { BaseRepository, IRepository, PaginationOptions } from './BaseRepository';
import { QueryBuilder, Operator } from '../db/query/QueryBuilder';

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
    return this.findBy({
      first_name: firstName,
      last_name: lastName
    });
  }

  // Buscar usuários por termo de pesquisa usando QueryBuilder
  async searchUsers(searchTerm: string, options?: PaginationOptions): Promise<UserModel[]> {
    // Usar QueryBuilder para construir uma consulta mais complexa
    const ormOptions = this.formatPaginationOptions(options);
    const query = QueryBuilder.from(this.tableName)
      .select('*')
      .where('first_name', Operator.ILIKE, `%${searchTerm}%`)
      .whereIn('active', [true])
      .orderBy('created_at', 'DESC');
      
    if (ormOptions.limit) {
      query.limit(ormOptions.limit);
    }
    
    if (ormOptions.offset) {
      query.offset(ormOptions.offset);
    }
    
    const { sql, params } = query.build();
    
    // Executar a consulta personalizada
    const client = await this.orm.getClient();
    try {
      const result = await client.query(sql, params);
      return result.rows.map((row: any) => this.mapToModel(row));
    } finally {
      client.release();
    }
  }
}