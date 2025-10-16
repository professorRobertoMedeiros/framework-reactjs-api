"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserBusiness = void 0;
const BaseBusiness_1 = require("../../core/business/BaseBusiness");
const UserRepository_1 = require("./repository/UserRepository");
/**
 * Business para User
 * Herda de BaseBusiness e delega operações CRUD para o Repository
 * Adicione aqui apenas regras de negócio específicas
 */
class UserBusiness extends BaseBusiness_1.BaseBusiness {
    constructor() {
        const repository = new UserRepository_1.UserRepository();
        super(repository);
    }
    /**
     * Converter modelo para Dom (DTO)
     * @param model Modelo do User
     * @returns Dom do User
     */
    toDom(model) {
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
    fromCreateData(data) {
        // TODO: Adicione validações e transformações de negócio aqui
        // Exemplo:
        // if (!data.name || data.name.trim().length === 0) {
        //   throw new Error('Nome é obrigatório');
        // }
        return data;
    }
}
exports.UserBusiness = UserBusiness;
//# sourceMappingURL=UserBusiness.js.map