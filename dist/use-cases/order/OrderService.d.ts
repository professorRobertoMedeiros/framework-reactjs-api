import { BaseService, ServiceResponse, PaginatedResponse } from '../../core/services/BaseService';
import { OrderBusiness } from './OrderBusiness';
import { CreateOrderDom, UpdateOrderDom, OrderDom } from './domains/OrderDom';
/**
 * Serviço para Order
 * Estende BaseService para operações CRUD padrão
 */
export declare class OrderService extends BaseService<OrderDom, CreateOrderDom, UpdateOrderDom> {
    private orderBusiness;
    constructor(orderBusiness?: OrderBusiness);
    /**
     * Implementação obrigatória para obter business layer
     * @returns Instância do business
     */
    protected getBusiness(): OrderBusiness;
    /**
     * Método customizado: Buscar orders ativos
     * @param page Página
     * @param limit Limite por página
     * @returns Lista de orders ativos
     */
    getActive(page?: number, limit?: number): Promise<ServiceResponse<PaginatedResponse<OrderDom>>>;
    /**
     * Método customizado: Contar total de registros
     * @returns Número total de registros
     */
    count(): Promise<ServiceResponse<number>>;
}
