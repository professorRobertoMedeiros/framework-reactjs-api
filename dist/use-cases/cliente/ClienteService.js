"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClienteService = void 0;
const BaseService_1 = require("../../core/services/BaseService");
const ClienteBusiness_1 = require("./ClienteBusiness");
/**
 * Serviço para Cliente
 * Estende BaseService para operações CRUD padrão
 */
class ClienteService extends BaseService_1.BaseService {
    constructor(clienteBusiness) {
        super();
        this.clienteBusiness = clienteBusiness || new ClienteBusiness_1.ClienteBusiness();
    }
    /**
     * Implementação obrigatória para obter business layer
     * @returns Instância do business
     */
    getBusiness() {
        return this.clienteBusiness;
    }
    // Os métodos CRUD básicos (getById, getAll, create, update, delete) 
    // são herdados automaticamente da classe BaseService
    /**
     * Método customizado: Buscar clientes ativos
     * @param page Página
     * @param limit Limite por página
     * @returns Lista de clientes ativos
     */
    async getActive(page = 1, limit = 10) {
        try {
            // Validar parâmetros de paginação
            if (page < 1)
                page = 1;
            if (limit < 1)
                limit = 10;
            if (limit > 100)
                limit = 100;
            const offset = (page - 1) * limit;
            // Buscar clientes ativos no business
            const items = await this.clienteBusiness.findActive({
                limit,
                offset
            });
            // Para total, poderia implementar um método countActive no business
            const total = items.length; // Simplificado
            const totalPages = Math.ceil(total / limit);
            return {
                success: true,
                message: 'Clientes ativos listados com sucesso',
                data: {
                    items,
                    total,
                    page,
                    limit,
                    totalPages
                }
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Erro ao listar clientes ativos',
                error: error.message || 'Erro desconhecido'
            };
        }
    }
    /**
     * Método customizado: Contar total de registros
     * @returns Número total de registros
     */
    async count() {
        try {
            const total = await this.clienteBusiness.clienteRepository.count();
            return {
                success: true,
                message: 'Contagem realizada com sucesso',
                data: total
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Erro ao contar registros',
                error: error.message || 'Erro desconhecido'
            };
        }
    }
}
exports.ClienteService = ClienteService;
//# sourceMappingURL=ClienteService.js.map