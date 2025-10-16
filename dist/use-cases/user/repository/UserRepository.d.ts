import { BaseRepository } from '../../../infra/repository/BaseRepository';
import { UserModel } from '../../../core/domain/models/UserModel';
/**
 * Repositório para User
 * Estende BaseRepository para operações CRUD básicas
 */
export declare class UserRepository extends BaseRepository<UserModel> {
    constructor();
    /**
     * Mapear dados do banco para o modelo User
     * @param data Dados brutos do banco de dados
     * @returns Instância do modelo User
     */
    protected mapToModel(data: any): UserModel;
    /**
     * Buscar por condições customizadas
     * @param conditions Condições de busca
     * @param options Opções adicionais
     */
    findByConditions(conditions: Record<string, any>, options?: {
        limit?: number;
        offset?: number;
        includes?: string[];
        orderBy?: string;
    }): Promise<UserModel[]>;
}
