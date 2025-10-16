import { BaseBusiness } from '../../core/business/BaseBusiness';
import { UserModel } from '../../core/domain/models/UserModel';
import { UserDom } from './domains/UserDom';
/**
 * Business para User
 * Herda de BaseBusiness e delega operações CRUD para o Repository
 * Adicione aqui apenas regras de negócio específicas
 */
export declare class UserBusiness extends BaseBusiness<UserModel, UserDom> {
    constructor();
    /**
     * Converter modelo para Dom (DTO)
     * @param model Modelo do User
     * @returns Dom do User
     */
    protected toDom(model: UserModel): UserDom;
    /**
     * Converter dados de criação para modelo (opcional - sobrescrever se necessário)
     * @param data Dados de entrada
     * @returns Dados formatados para o modelo
     */
    protected fromCreateData(data: any): Omit<UserModel, 'id'>;
}
