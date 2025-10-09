"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = void 0;
const ProductModel_1 = require("../../core/domain/models/ProductModel");
const BaseRepository_1 = require("./BaseRepository");
/**
 * Implementação do repository de produtos
 * Aproveita todos os métodos CRUD e de paginação herdados do BaseRepository
 */
class ProductRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(ProductModel_1.ProductModel);
    }
    /**
     * Busca produtos por nome
     */
    async findByName(name) {
        return this.findBy({ name });
    }
    /**
     * Busca produtos ativos
     */
    async findActiveProducts(options) {
        return this.findBy({ active: true }, options);
    }
    /**
     * Busca produtos ativos com paginação
     */
    async findActiveProductsPaginated(options) {
        return this.findByPaginated({ active: true }, options);
    }
    /**
     * Busca produtos com estoque abaixo do limite
     */
    async findLowStock(threshold) {
        const client = await this.orm.getClient();
        try {
            const result = await client.query(`SELECT * FROM ${this.tableName} WHERE stock < $1 AND active = true`, [threshold]);
            return result.rows.map(row => this.mapToModel(row));
        }
        finally {
            client.release();
        }
    }
}
exports.ProductRepository = ProductRepository;
//# sourceMappingURL=ProductRepository.js.map