"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const UserModel_1 = require("../../core/domain/models/UserModel");
const BaseRepository_1 = require("./BaseRepository");
const QueryBuilder_1 = require("../db/query/QueryBuilder");
// Implementação do repository de usuários
class UserRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(UserModel_1.UserModel);
    }
    // Buscar usuário por email - método específico deste repositório
    async findByEmail(email) {
        return this.findOneBy({ email });
    }
    // Buscar usuários ativos - método específico deste repositório
    async findActiveUsers(options) {
        return this.findBy({ active: true }, {
            ...options,
            orderBy: 'created_at DESC'
        });
    }
    // Buscar usuários por nome - método específico deste repositório
    async findByName(firstName, lastName) {
        return this.findBy({
            first_name: firstName,
            last_name: lastName
        });
    }
    // Buscar usuários por termo de pesquisa usando QueryBuilder
    async searchUsers(searchTerm, options) {
        // Usar QueryBuilder para construir uma consulta mais complexa
        const ormOptions = this.formatPaginationOptions(options);
        const query = QueryBuilder_1.QueryBuilder.from(this.tableName)
            .select('*')
            .where('first_name', QueryBuilder_1.Operator.ILIKE, `%${searchTerm}%`)
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
            return result.rows.map((row) => this.mapToModel(row));
        }
        finally {
            client.release();
        }
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=UserRepository.js.map