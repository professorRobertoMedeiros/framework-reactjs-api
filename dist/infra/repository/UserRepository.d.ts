import { UserModel } from '../../core/domain/models/UserModel';
import { BaseRepository, IRepository, PaginationOptions } from './BaseRepository';
export interface IUserRepository extends IRepository<UserModel> {
    findByEmail(email: string): Promise<UserModel | null>;
    findActiveUsers(options?: PaginationOptions): Promise<UserModel[]>;
    findByName(firstName: string, lastName: string): Promise<UserModel[]>;
    searchUsers(searchTerm: string, options?: PaginationOptions): Promise<UserModel[]>;
}
export declare class UserRepository extends BaseRepository<UserModel> implements IUserRepository {
    constructor();
    findByEmail(email: string): Promise<UserModel | null>;
    findActiveUsers(options?: PaginationOptions): Promise<UserModel[]>;
    findByName(firstName: string, lastName: string): Promise<UserModel[]>;
    searchUsers(searchTerm: string, options?: PaginationOptions): Promise<UserModel[]>;
}
