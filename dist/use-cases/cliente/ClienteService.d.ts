import { BaseService, ServiceResponse, PaginatedResponse } from '../../core/services/BaseService';
import { ClienteBusiness } from './ClienteBusiness';
import { CreateClienteDom, UpdateClienteDom, ClienteDom } from './domains/ClienteDom';
/**
 * Serviço para Cliente
 * Estende BaseService para operações CRUD padrão
 */
export declare class ClienteService extends BaseService<ClienteDom, CreateClienteDom, UpdateClienteDom> {
    private clienteBusiness;
    constructor(clienteBusiness?: ClienteBusiness);
    /**
     * Implementação obrigatória para obter business layer
     * @returns Instância do business
     */
    protected getBusiness(): ClienteBusiness;
    /**
     * Método customizado: Buscar clientes ativos
     * @param page Página
     * @param limit Limite por página
     * @returns Lista de clientes ativos
     */
    getActive(page?: number, limit?: number): Promise<ServiceResponse<PaginatedResponse<ClienteDom>>>;
    /**
     * Método customizado: Contar total de registros
     * @returns Número total de registros
     */
    count(): Promise<ServiceResponse<number>>;
}
