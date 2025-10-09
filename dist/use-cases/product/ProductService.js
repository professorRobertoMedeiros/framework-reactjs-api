"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const ProductBusiness_1 = require("./ProductBusiness");
/**
 * Serviço para gerenciamento de produtos
 */
class ProductService {
    constructor(productBusiness) {
        // Injeção de dependência: usar business fornecido ou criar novo
        this.productBusiness = productBusiness || new ProductBusiness_1.ProductBusiness();
    }
    /**
     * Criar um novo produto
     */
    async createProduct(productData) {
        return this.productBusiness.createProduct(productData);
    }
    /**
     * Buscar produto por ID
     */
    async getProductById(id) {
        return this.productBusiness.getProductById(id);
    }
    /**
     * Listar produtos com paginação
     * Aproveita os métodos de paginação herdados do BaseRepository
     */
    async listProducts(options) {
        return this.productBusiness.getAllProductsPaginated(options);
    }
    /**
     * Listar produtos ativos com paginação
     */
    async listActiveProducts(options) {
        // Usar as opções para filtrar por produtos ativos
        const products = await this.productBusiness.getAllProducts(options);
        return products.filter(product => product.active);
    }
    /**
     * Atualizar produto
     */
    async updateProduct(id, productData) {
        return this.productBusiness.updateProduct(id, productData);
    }
    /**
     * Excluir produto (exclusão lógica)
     */
    async deleteProduct(id) {
        // Primeiro, verifica se o produto existe
        const product = await this.productBusiness.getProductById(id);
        if (!product) {
            return false;
        }
        // Ao invés de excluir, desativa o produto (exclusão lógica)
        const result = await this.productBusiness.updateProduct(id, { active: false });
        return result !== null;
    }
    /**
     * Buscar produtos com estoque baixo
     */
    async getLowStockProducts(threshold = 10) {
        return this.productBusiness.findLowStockProducts(threshold);
    }
}
exports.ProductService = ProductService;
//# sourceMappingURL=ProductService.js.map