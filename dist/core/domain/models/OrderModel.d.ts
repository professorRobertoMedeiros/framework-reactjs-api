import { BaseModel } from './BaseModel';
export declare class OrderModel extends BaseModel {
    id: number;
    customer_id: number;
    total_amount: number;
    status: string;
}
