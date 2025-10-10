import { BaseService, ServiceResponse } from '../../core/services/BaseService';
import { UserBusiness } from './UserBusiness';
import { UserDom } from './domains/UserDom';
export interface CreateUserDom {
    name: string;
    email: string;
    password: string;
}
export interface UpdateUserDom {
    name?: string;
    email?: string;
    password?: string;
}
export declare class UserService extends BaseService<UserDom, CreateUserDom, UpdateUserDom> {
    private userBusiness;
    constructor();
    protected getBusiness(): UserBusiness;
    findByEmail(email: string): Promise<ServiceResponse<UserDom | null>>;
}
