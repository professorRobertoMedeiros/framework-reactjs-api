"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const BaseService_1 = require("../../core/services/BaseService");
const UserBusiness_1 = require("./UserBusiness");
/**
 * Service para User
 * Herda de BaseService e delega operações CRUD para o Business
 * Retorna respostas padronizadas: { status, data?, message? }
 */
class UserService extends BaseService_1.BaseService {
    constructor() {
        const business = new UserBusiness_1.UserBusiness();
        super(business);
    }
}
exports.UserService = UserService;
//# sourceMappingURL=UserService.js.map