import { BaseService } from '../../core/services/BaseService';
import { UserModel } from '../../core/domain/models/UserModel';
import { UserDom } from './domains/UserDom';
/**
 * Service para User
 * Herda de BaseService e delega operações CRUD para o Business
 * Retorna respostas padronizadas: { status, data?, message? }
 */
export declare class UserService extends BaseService<UserModel, UserDom> {
    constructor();
}
