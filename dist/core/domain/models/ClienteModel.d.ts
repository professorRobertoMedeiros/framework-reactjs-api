import { BaseModel } from './BaseModel';
export declare class ClienteModel extends BaseModel {
    id: number;
    nome: string;
    email: string;
    telefone?: string;
    ativo: boolean;
    created_at: Date;
    updated_at?: Date;
    toJSON(): Record<string, any>;
}
