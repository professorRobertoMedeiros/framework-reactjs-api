import { IUserBusiness } from './UserBusiness';
import { CreateUserDom, UpdateUserDom, UserDom } from './domains/UserDom';
export interface UserServiceResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}
export interface IUserService {
    getUserById(id: number): Promise<UserServiceResponse<UserDom>>;
    getAllUsers(page?: number, limit?: number): Promise<UserServiceResponse<{
        users: UserDom[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>>;
    createUser(data: CreateUserDom): Promise<UserServiceResponse<UserDom>>;
    updateUser(id: number, data: UpdateUserDom): Promise<UserServiceResponse<UserDom>>;
    deleteUser(id: number): Promise<UserServiceResponse>;
    activateUser(id: number): Promise<UserServiceResponse<UserDom>>;
    deactivateUser(id: number): Promise<UserServiceResponse<UserDom>>;
}
export declare class UserService implements IUserService {
    private userBusiness;
    constructor(userBusiness?: IUserBusiness);
    getUserById(id: number): Promise<UserServiceResponse<UserDom>>;
    getAllUsers(page?: number, limit?: number): Promise<UserServiceResponse<{
        users: UserDom[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>>;
    createUser(data: CreateUserDom): Promise<UserServiceResponse<UserDom>>;
    updateUser(id: number, data: UpdateUserDom): Promise<UserServiceResponse<UserDom>>;
    deleteUser(id: number): Promise<UserServiceResponse>;
    activateUser(id: number): Promise<UserServiceResponse<UserDom>>;
    deactivateUser(id: number): Promise<UserServiceResponse<UserDom>>;
}
