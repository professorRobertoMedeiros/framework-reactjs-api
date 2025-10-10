"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const BaseService_1 = require("../../core/services/BaseService");
const OrderBusiness_1 = require("./OrderBusiness");
/**
 * Serviço para Order
 * Estende BaseService para operações CRUD padrão
 */
class OrderService extends BaseService_1.BaseService {
    constructor(orderBusiness) {
        super();
        this.orderBusiness = orderBusiness || new OrderBusiness_1.OrderBusiness();
    }
    /**
     * Implementação obrigatória para obter business layer
     * @returns Instância do business
     */
    getBusiness() {
        return this.orderBusiness;
    }
    // Os métodos CRUD básicos (getById, getAll, create, update, delete) 
    // são herdados automaticamente da classe BaseService
    /**
     * Método customizado: Buscar orders ativos
     * @param page Página
     * @param limit Limite por página
     * @returns Lista de orders ativos
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
            // Buscar orders ativos no business
            const items = await this.orderBusiness.findActive({
                limit,
                offset
            });
            // Para total, poderia implementar um método countActive no business
            const total = items.length; // Simplificado
            const totalPages = Math.ceil(total / limit);
            return {
                success: true,
                message: 'Orders ativos listados com sucesso',
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
                message: 'Erro ao listar orders ativos',
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
            const total = await this.orderBusiness.orderRepository.count();
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
exports.OrderService = OrderService;
//# sourceMappingURL=OrderService.js.map