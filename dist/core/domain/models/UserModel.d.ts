import { BaseModel } from './BaseModel';
export declare class UserModel extends BaseModel {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    password_hash: string;
    active: boolean;
    created_at: Date;
    updated_at?: Date;
    static validateEmail(email: string): boolean;
    static create(data: {
        first_name: string;
        last_name: string;
        email: string;
        password_hash: string;
    }): UserModel;
}
