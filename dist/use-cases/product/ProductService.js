"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const BaseService_1 = require("../../core/services/BaseService");
const ProductBusiness_1 = require("./ProductBusiness");
/**
 * Serviço para Product
 * Estende BaseService para operações CRUD padrão
 */
class ProductService extends BaseService_1.BaseService {
    constructor(productBusiness) {
        super();
        this.productBusiness = productBusiness || new ProductBusiness_1.ProductBusiness();
    }
    /**
     * Implementação obrigatória para obter business layer
     * @returns Instância do business
     */
    getBusiness() {
        return this.productBusiness;
    }
    // Os métodos CRUD básicos (getById, getAll, create, update, delete) 
    // são herdados automaticamente da classe BaseService
    /**
     * Método customizado: Buscar products ativos
     * @param page Página
     * @param limit Limite por página
     * @returns Lista de products ativos
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
            // Buscar products ativos no business
            const items = await this.productBusiness.findActive({
                limit,
                offset
            });
            // Para total, poderia implementar um método countActive no business
            const total = items.length; // Simplificado
            const totalPages = Math.ceil(total / limit);
            return {
                success: true,
                message: 'Products ativos listados com sucesso',
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
                message: 'Erro ao listar products ativos',
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
            const total = await this.productBusiness.productRepository.count();
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
exports.ProductService = ProductService;
//# sourceMappingURL=ProductService.js.map