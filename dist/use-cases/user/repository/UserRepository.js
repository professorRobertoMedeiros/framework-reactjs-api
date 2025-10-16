"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const BaseRepository_1 = require("../../../infra/repository/BaseRepository");
const UserModel_1 = require("../../../core/domain/models/UserModel");
/**
 * Repositório para User
 * Estende BaseRepository para operações CRUD básicas
 */
class UserRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(UserModel_1.UserModel);
    }
    /**
     * Mapear dados do banco para o modelo User
     * @param data Dados brutos do banco de dados
     * @returns Instância do modelo User
     */
    mapToModel(data) {
        const item = new UserModel_1.UserModel();
        Object.assign(item, data);
        return item;
    }
    /**
     * Buscar por condições customizadas
     * @param conditions Condições de busca
     * @param options Opções adicionais
     */
    async findByConditions(conditions, options) {
        return this.findBy(conditions, options);
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=UserRepository.js.map