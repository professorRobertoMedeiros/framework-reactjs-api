"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRepository = void 0;
const BaseRepository_1 = require("../../../infra/repository/BaseRepository");
const OrderModel_1 = require("../../../core/domain/models/OrderModel");
/**
 * Repositório para Order
 * Estende BaseRepository para operações CRUD básicas
 */
class OrderRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(OrderModel_1.OrderModel);
    }
    /**
     * Mapear dados do banco para o modelo Order
     * @param data Dados brutos do banco de dados
     * @returns Instância do modelo Order
     */
    mapToModel(data) {
        const item = new OrderModel_1.OrderModel();
        // Mapear propriedades básicas
        item.id = data.id;
        // TODO: Adicione aqui outras propriedades específicas do OrderModel
        // Exemplo:
        // item.name = data.name;
        // item.email = data.email;
        // item.created_at = data.created_at;
        // Para mapear todas as propriedades automaticamente (não recomendado para produção):
        Object.assign(item, data);
        return item;
    }
    /**
     * Buscar order por email (exemplo de método customizado)
     * @param email Email para busca
     * @returns Order encontrado ou null
     */
    async findByEmail(email) {
        return this.findOneBy({ email });
    }
    /**
     * Buscar orders ativos (exemplo de método customizado)
     * @param options Opções de consulta
     * @returns Lista de orders ativos
     */
    async findActive(options) {
        return this.findBy({ active: true }, options);
    }
    /**
     * Contar orders por status (exemplo de método customizado)
     * @param status Status para contar
     * @returns Número de registros
     */
    async countByStatus(status) {
        return this.count({ status });
    }
}
exports.OrderRepository = OrderRepository;
//# sourceMappingURL=OrderRepository.js.map