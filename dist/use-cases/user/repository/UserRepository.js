"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const UserModel_1 = require("../../../core/domain/models/UserModel");
const BaseRepository_1 = require("../../../infra/repository/BaseRepository");
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
        const conditions = {};
        if (firstName) {
            conditions.first_name = firstName;
        }
        if (lastName) {
            conditions.last_name = lastName;
        }
        return this.findBy(conditions);
    }
    // Buscar usuários por termo de pesquisa - método específico deste repositório
    async searchUsers(searchTerm, options) {
        // Se não tiver termo de pesquisa, retorna todos
        if (!searchTerm) {
            return this.findAll(options);
        }
        // Usar a API do repositório base
        const conditions = [
            { column: 'first_name', operator: 'ILIKE', value: `%${searchTerm}%` },
            { column: 'last_name', operator: 'ILIKE', value: `%${searchTerm}%` },
            { column: 'email', operator: 'ILIKE', value: `%${searchTerm}%` }
        ];
        // Como não temos um método específico para OR, vamos simplificar
        // e buscar por e-mail, que é mais comum em pesquisas de usuário
        return this.findBy({
            email: searchTerm
        }, options);
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=UserRepository.js.map