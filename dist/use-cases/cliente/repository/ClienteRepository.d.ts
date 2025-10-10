import { BaseRepository } from '../../../infra/repository/BaseRepository';
import { ClienteModel } from '../../../core/domain/models/ClienteModel';
/**
 * Repositório para Cliente
 * Estende BaseRepository para operações CRUD básicas
 */
export declare class ClienteRepository extends BaseRepository<ClienteModel> {
    constructor();
    /**
     * Mapear dados do banco para o modelo Cliente
     * @param data Dados brutos do banco de dados
     * @returns Instância do modelo Cliente
     */
    protected mapToModel(data: any): ClienteModel;
    /**
     * Buscar cliente por email (exemplo de método customizado)
     * @param email Email para busca
     * @returns Cliente encontrado ou null
     */
    findByEmail(email: string): Promise<ClienteModel | null>;
    /**
     * Buscar clientes ativos (exemplo de método customizado)
     * @param options Opções de consulta
     * @returns Lista de clientes ativos
     */
    findActive(options?: {
        limit?: number;
        offset?: number;
        orderBy?: string;
    }): Promise<ClienteModel[]>;
    /**
     * Contar clientes por status (exemplo de método customizado)
     * @param status Status para contar
     * @returns Número de registros
     */
    countByStatus(status: string): Promise<number>;
}
