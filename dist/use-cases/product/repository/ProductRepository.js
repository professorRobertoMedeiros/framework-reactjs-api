"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = void 0;
const BaseRepository_1 = require("../../../infra/repository/BaseRepository");
const ProductModel_1 = require("../../../core/domain/models/ProductModel");
/**
 * Repositório para Product
 * Estende BaseRepository para operações CRUD básicas
 */
class ProductRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(ProductModel_1.ProductModel);
    }
    /**
     * Mapear dados do banco para o modelo Product
     * @param data Dados brutos do banco de dados
     * @returns Instância do modelo Product
     */
    mapToModel(data) {
        const item = new ProductModel_1.ProductModel();
        // Mapear propriedades básicas
        item.id = data.id;
        // TODO: Adicione aqui outras propriedades específicas do ProductModel
        // Exemplo:
        // item.name = data.name;
        // item.email = data.email;
        // item.created_at = data.created_at;
        // Para mapear todas as propriedades automaticamente (não recomendado para produção):
        Object.assign(item, data);
        return item;
    }
    /**
     * Buscar product por email (exemplo de método customizado)
     * @param email Email para busca
     * @returns Product encontrado ou null
     */
    async findByEmail(email) {
        return this.findOneBy({ email });
    }
    /**
     * Buscar products ativos (exemplo de método customizado)
     * @param options Opções de consulta
     * @returns Lista de products ativos
     */
    async findActive(options) {
        return this.findBy({ active: true }, options);
    }
    /**
     * Contar products por status (exemplo de método customizado)
     * @param status Status para contar
     * @returns Número de registros
     */
    async countByStatus(status) {
        return this.count({ status });
    }
}
exports.ProductRepository = ProductRepository;
//# sourceMappingURL=ProductRepository.js.map