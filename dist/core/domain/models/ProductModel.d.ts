import { BaseModel } from './BaseModel';
export declare class ProductModel extends BaseModel {
    id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    active: boolean;
    created_at: Date;
    updated_at?: Date;
    toJSON(): Record<string, any>;
}
