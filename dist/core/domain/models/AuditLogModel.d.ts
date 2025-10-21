import { BaseModel } from './BaseModel';
/**
 * Tipos de ação para auditoria
 */
export declare enum AuditActionType {
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    DELETE = "DELETE"
}
/**
 * Modelo para armazenar os registros de auditoria
 */
export declare class AuditLogModel extends BaseModel {
    id: number;
    tableName: string;
    recordId: number;
    columnName: string;
    actionType: AuditActionType;
    oldValue?: string;
    newValue?: string;
    userId?: number;
    userEmail?: string;
    createdAt: Date;
    /**
     * Converte o modelo para um objeto simples
     * @returns Objeto com os dados do modelo
     */
    toJSON(): Record<string, any>;
}
