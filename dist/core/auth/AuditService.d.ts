import { BaseModel } from '../domain/models/BaseModel';
/**
 * Interface que representa um usuário para fins de auditoria
 */
export interface AuditUser {
    id?: number;
    email?: string;
}
/**
 * Serviço para gerenciar auditoria de alterações em modelos
 */
export declare class AuditService {
    private repository;
    private currentUser?;
    constructor(currentUser?: AuditUser);
    /**
     * Define o usuário atual para auditoria
     * @param user Usuário atual
     */
    setCurrentUser(user: AuditUser): void;
    /**
     * Registra a criação de um modelo
     *
     * @param model Modelo criado
     */
    auditCreate(model: BaseModel): Promise<void>;
    /**
     * Registra a atualização de um modelo
     *
     * @param model Modelo atualizado
     * @param oldValues Valores antigos (antes da atualização)
     */
    auditUpdate(model: BaseModel, oldValues: Record<string, any>): Promise<void>;
    /**
     * Registra a exclusão de um modelo
     *
     * @param model Modelo excluído
     */
    auditDelete(model: BaseModel): Promise<void>;
    /**
     * Obtém o nome da tabela a partir do modelo
     * @param model Modelo
     * @returns Nome da tabela ou undefined
     */
    private getTableName;
    /**
     * Obtém o ID do registro a partir do modelo
     * @param model Modelo
     * @returns ID do registro ou undefined
     */
    private getRecordId;
    /**
     * Obtém o histórico de um registro
     *
     * @param tableName Nome da tabela
     * @param recordId ID do registro
     * @returns Histórico de auditoria do registro
     */
    getRecordHistory(tableName: string, recordId: number): Promise<import("../domain/models/AuditLogModel").AuditLogModel[]>;
    /**
     * Obtém o histórico de uma coluna específica de um registro
     *
     * @param tableName Nome da tabela
     * @param recordId ID do registro
     * @param columnName Nome da coluna
     * @returns Histórico de auditoria da coluna
     */
    getColumnHistory(tableName: string, recordId: number, columnName: string): Promise<import("../domain/models/AuditLogModel").AuditLogModel[]>;
}
