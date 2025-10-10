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
    getById(id: number): Promise<UserDom | null>;
    getAll(options?: {
        limit?: number;
        offset?: number;
    }): Promise<UserDom[]>;
    create(data: CreateUserDom): Promise<UserDom>;
    update(id: number, data: UpdateUserDom): Promise<UserDom | null>;
    delete(id: number): Promise<boolean>;
    findByEmail(email: string): Promise<UserDom | null>;
    count(): Promise<number>;
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
