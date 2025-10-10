import { BaseRepository } from '../../../infra/repository/BaseRepository';
import { OrderModel } from '../../../core/domain/models/OrderModel';
/**
 * Repositório para Order
 * Estende BaseRepository para operações CRUD básicas
 */
export declare class OrderRepository extends BaseRepository<OrderModel> {
    constructor();
    /**
     * Mapear dados do banco para o modelo Order
     * @param data Dados brutos do banco de dados
     * @returns Instância do modelo Order
     */
    protected mapToModel(data: any): OrderModel;
    /**
     * Buscar order por email (exemplo de método customizado)
     * @param email Email para busca
     * @returns Order encontrado ou null
     */
    findByEmail(email: string): Promise<OrderModel | null>;
    /**
     * Buscar orders ativos (exemplo de método customizado)
     * @param options Opções de consulta
     * @returns Lista de orders ativos
     */
    findActive(options?: {
        limit?: number;
        offset?: number;
        orderBy?: string;
    }): Promise<OrderModel[]>;
    /**
     * Contar orders por status (exemplo de método customizado)
     * @param status Status para contar
     * @returns Número de registros
     */
    countByStatus(status: string): Promise<number>;
}
