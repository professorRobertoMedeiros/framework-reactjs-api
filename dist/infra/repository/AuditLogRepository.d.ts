import { BaseRepository } from './BaseRepository';
import { AuditLogModel, AuditActionType } from '../../core/domain/models/AuditLogModel';
/**
 * Repositório para manipular registros de auditoria
 */
export declare class AuditLogRepository extends BaseRepository<AuditLogModel> {
    constructor();
    /**
     * Registra uma ação de auditoria
     *
     * @param tableName Nome da tabela
     * @param recordId ID do registro
     * @param columnName Nome da coluna
     * @param actionType Tipo da ação (CREATE, UPDATE, DELETE)
     * @param oldValue Valor anterior (para UPDATE e DELETE)
     * @param newValue Novo valor (para CREATE e UPDATE)
     * @param userId ID do usuário que realizou a ação
     * @param userEmail Email do usuário que realizou a ação
     */
    logAction(tableName: string, recordId: number, columnName: string, actionType: AuditActionType, oldValue?: any, newValue?: any, userId?: number, userEmail?: string): Promise<void>;
    /**
     * Obter histórico de auditoria para um registro específico
     *
     * @param tableName Nome da tabela
     * @param recordId ID do registro
     * @returns Lista de registros de auditoria
     */
    getHistoryForRecord(tableName: string, recordId: number): Promise<AuditLogModel[]>;
    /**
     * Obter histórico de auditoria para uma coluna específica de um registro
     *
     * @param tableName Nome da tabela
     * @param recordId ID do registro
     * @param columnName Nome da coluna
     * @returns Lista de registros de auditoria para a coluna específica
     */
    getColumnHistory(tableName: string, recordId: number, columnName: string): Promise<AuditLogModel[]>;
}
