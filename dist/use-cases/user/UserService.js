"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const BaseService_1 = require("../../core/services/BaseService");
const UserBusiness_1 = require("./UserBusiness");
class UserService extends BaseService_1.BaseService {
    constructor() {
        super();
        this.userBusiness = new UserBusiness_1.UserBusiness();
    }
    getBusiness() {
        return this.userBusiness;
    }
    // Métodos específicos do usuário
    async findByEmail(email) {
        try {
            const user = await this.userBusiness.findByEmail(email);
            return {
                success: true,
                message: user ? 'Usuário encontrado' : 'Usuário não encontrado',
                data: user
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Erro ao buscar usuário por email',
                error: error.message
            };
        }
    }
}
exports.UserService = UserService;
//# sourceMappingURL=UserService.js.map