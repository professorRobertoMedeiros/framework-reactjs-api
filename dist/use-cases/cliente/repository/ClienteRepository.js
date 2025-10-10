"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClienteRepository = void 0;
const BaseRepository_1 = require("../../../infra/repository/BaseRepository");
const ClienteModel_1 = require("../../../core/domain/models/ClienteModel");
/**
 * Repositório para Cliente
 * Estende BaseRepository para operações CRUD básicas
 */
class ClienteRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(ClienteModel_1.ClienteModel);
    }
    /**
     * Mapear dados do banco para o modelo Cliente
     * @param data Dados brutos do banco de dados
     * @returns Instância do modelo Cliente
     */
    mapToModel(data) {
        const item = new ClienteModel_1.ClienteModel();
        // Mapear propriedades básicas
        item.id = data.id;
        // TODO: Adicione aqui outras propriedades específicas do ClienteModel
        // Exemplo:
        // item.name = data.name;
        // item.email = data.email;
        // item.created_at = data.created_at;
        // Para mapear todas as propriedades automaticamente (não recomendado para produção):
        Object.assign(item, data);
        return item;
    }
    /**
     * Buscar cliente por email (exemplo de método customizado)
     * @param email Email para busca
     * @returns Cliente encontrado ou null
     */
    async findByEmail(email) {
        return this.findOneBy({ email });
    }
    /**
     * Buscar clientes ativos (exemplo de método customizado)
     * @param options Opções de consulta
     * @returns Lista de clientes ativos
     */
    async findActive(options) {
        return this.findBy({ active: true }, options);
    }
    /**
     * Contar clientes por status (exemplo de método customizado)
     * @param status Status para contar
     * @returns Número de registros
     */
    async countByStatus(status) {
        return this.count({ status });
    }
}
exports.ClienteRepository = ClienteRepository;
//# sourceMappingURL=ClienteRepository.js.map