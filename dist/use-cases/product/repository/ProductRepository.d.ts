import { BaseRepository } from '../../../infra/repository/BaseRepository';
import { ProductModel } from '../../../core/domain/models/ProductModel';
/**
 * Repositório para Product
 * Estende BaseRepository para operações CRUD básicas
 */
export declare class ProductRepository extends BaseRepository<ProductModel> {
    constructor();
    /**
     * Mapear dados do banco para o modelo Product
     * @param data Dados brutos do banco de dados
     * @returns Instância do modelo Product
     */
    protected mapToModel(data: any): ProductModel;
    /**
     * Buscar product por email (exemplo de método customizado)
     * @param email Email para busca
     * @returns Product encontrado ou null
     */
    findByEmail(email: string): Promise<ProductModel | null>;
    /**
     * Buscar products ativos (exemplo de método customizado)
     * @param options Opções de consulta
     * @returns Lista de products ativos
     */
    findActive(options?: {
        limit?: number;
        offset?: number;
        orderBy?: string;
    }): Promise<ProductModel[]>;
    /**
     * Contar products por status (exemplo de método customizado)
     * @param status Status para contar
     * @returns Número de registros
     */
    countByStatus(status: string): Promise<number>;
}
