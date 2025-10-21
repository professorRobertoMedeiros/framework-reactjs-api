"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
const AuditLogModel_1 = require("../../core/domain/models/AuditLogModel");
/**
 * Repositório para manipular registros de auditoria
 */
class AuditLogRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(AuditLogModel_1.AuditLogModel);
    }
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
    async logAction(tableName, recordId, columnName, actionType, oldValue, newValue, userId, userEmail) {
        // Converter valores complexos para string para armazenamento
        const oldValueStr = oldValue !== undefined ?
            (typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue)) :
            undefined;
        const newValueStr = newValue !== undefined ?
            (typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue)) :
            undefined;
        // Criar uma instância do modelo e depois salvar
        const auditLog = new AuditLogModel_1.AuditLogModel();
        auditLog.tableName = tableName;
        auditLog.recordId = recordId;
        auditLog.columnName = columnName;
        auditLog.actionType = actionType;
        auditLog.oldValue = oldValueStr;
        auditLog.newValue = newValueStr;
        auditLog.userId = userId;
        auditLog.userEmail = userEmail;
        auditLog.createdAt = new Date();
        await this.create(auditLog);
    }
    /**
     * Obter histórico de auditoria para um registro específico
     *
     * @param tableName Nome da tabela
     * @param recordId ID do registro
     * @returns Lista de registros de auditoria
     */
    async getHistoryForRecord(tableName, recordId) {
        return await this.findBy({ tableName, recordId }, { orderBy: 'createdAt ASC' });
    }
    /**
     * Obter histórico de auditoria para uma coluna específica de um registro
     *
     * @param tableName Nome da tabela
     * @param recordId ID do registro
     * @param columnName Nome da coluna
     * @returns Lista de registros de auditoria para a coluna específica
     */
    async getColumnHistory(tableName, recordId, columnName) {
        return await this.findBy({ tableName, recordId, columnName }, { orderBy: 'createdAt ASC' });
    }
}
exports.AuditLogRepository = AuditLogRepository;
//# sourceMappingURL=AuditLogRepository.js.map