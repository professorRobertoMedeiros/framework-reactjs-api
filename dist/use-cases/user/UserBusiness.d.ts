import { IUserRepository } from './repository/UserRepository';
import { CreateUserDom, UpdateUserDom, UserDom } from './domains/UserDom';
export interface IUserBusiness {
    getUserById(id: number): Promise<UserDom | null>;
    getAllUsers(options?: {
        limit?: number;
        offset?: number;
    }): Promise<UserDom[]>;
    createUser(data: CreateUserDom): Promise<UserDom>;
    updateUser(id: number, data: UpdateUserDom): Promise<UserDom | null>;
    deleteUser(id: number): Promise<boolean>;
    activateUser(id: number): Promise<UserDom | null>;
    deactivateUser(id: number): Promise<UserDom | null>;
}
export declare class UserBusiness implements IUserBusiness {
    userRepository: IUserRepository;
    constructor(userRepository?: IUserRepository);
    private toDom;
    private hashPassword;
    getUserById(id: number): Promise<UserDom | null>;
    getAllUsers(options?: {
        limit?: number;
        offset?: number;
    }): Promise<UserDom[]>;
    createUser(data: CreateUserDom): Promise<UserDom>;
    updateUser(id: number, data: UpdateUserDom): Promise<UserDom | null>;
    deleteUser(id: number): Promise<boolean>;
    activateUser(id: number): Promise<UserDom | null>;
    deactivateUser(id: number): Promise<UserDom | null>;
}
