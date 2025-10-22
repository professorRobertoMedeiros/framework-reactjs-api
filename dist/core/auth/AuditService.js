"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const AuditLogRepository_1 = require("../../infra/repository/AuditLogRepository");
const AuditLogModel_1 = require("../domain/models/AuditLogModel");
const AuditableDecorator_1 = require("../domain/decorators/AuditableDecorator");
const Entity_1 = require("../domain/models/decorators/Entity");
/**
 * Serviço para gerenciar auditoria de alterações em modelos
 */
class AuditService {
    constructor(currentUser) {
        this.repository = new AuditLogRepository_1.AuditLogRepository();
        this.currentUser = currentUser;
    }
    /**
     * Define o usuário atual para auditoria
     * @param user Usuário atual
     */
    setCurrentUser(user) {
        this.currentUser = user;
    }
    /**
     * Registra a criação de um modelo
     *
     * @param model Modelo criado
     */
    async auditCreate(model) {
        const tableName = this.getTableName(model);
        const recordId = this.getRecordId(model);
        if (!tableName || recordId === undefined) {
            return;
        }
        // Obter propriedades auditáveis para criação
        const auditableProps = AuditableDecorator_1.AuditableMetadata.getAuditableProps(model, 'create');
        // Se não houver propriedades auditáveis, não fazer nada
        if (auditableProps.length === 0) {
            return;
        }
        // Registrar cada propriedade auditável
        for (const prop of auditableProps) {
            if (prop in model) {
                const value = model[prop];
                await this.repository.logAction(tableName, recordId, prop, AuditLogModel_1.AuditActionType.CREATE, null, value, this.currentUser?.id, this.currentUser?.email);
            }
        }
    }
    /**
     * Registra a atualização de um modelo
     *
     * @param model Modelo atualizado
     * @param oldValues Valores antigos (antes da atualização)
     */
    async auditUpdate(model, oldValues) {
        const tableName = this.getTableName(model);
        const recordId = this.getRecordId(model);
        if (!tableName || recordId === undefined) {
            return;
        }
        // Obter propriedades auditáveis para atualização
        const auditableProps = AuditableDecorator_1.AuditableMetadata.getAuditableProps(model, 'update');
        // Se não houver propriedades auditáveis, não fazer nada
        if (auditableProps.length === 0) {
            return;
        }
        // Registrar cada propriedade alterada que é auditável
        for (const prop of auditableProps) {
            // Verificar se a propriedade foi alterada
            if (prop in oldValues && prop in model) {
                const oldValue = oldValues[prop];
                const newValue = model[prop];
                // Somente registrar se o valor realmente mudou
                if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                    await this.repository.logAction(tableName, recordId, prop, AuditLogModel_1.AuditActionType.UPDATE, oldValue, newValue, this.currentUser?.id, this.currentUser?.email);
                }
            }
        }
    }
    /**
     * Registra a exclusão de um modelo
     *
     * @param model Modelo excluído
     */
    async auditDelete(model) {
        const tableName = this.getTableName(model);
        const recordId = this.getRecordId(model);
        if (!tableName || recordId === undefined) {
            return;
        }
        // Obter propriedades auditáveis para exclusão
        const auditableProps = AuditableDecorator_1.AuditableMetadata.getAuditableProps(model, 'delete');
        // Se não houver propriedades auditáveis, não fazer nada
        if (auditableProps.length === 0) {
            return;
        }
        // Registrar cada propriedade auditável
        for (const prop of auditableProps) {
            if (prop in model) {
                const value = model[prop];
                await this.repository.logAction(tableName, recordId, prop, AuditLogModel_1.AuditActionType.DELETE, value, null, this.currentUser?.id, this.currentUser?.email);
            }
        }
    }
    /**
     * Obtém o nome da tabela a partir do modelo
     * @param model Modelo
     * @returns Nome da tabela ou undefined
     */
    getTableName(model) {
        // Obter nome da tabela a partir dos metadados da entidade
        const entityMetadata = (0, Entity_1.getEntityMetadata)(model.constructor);
        return entityMetadata?.tableName;
    }
    /**
     * Obtém o ID do registro a partir do modelo
     * @param model Modelo
     * @returns ID do registro ou undefined
     */
    getRecordId(model) {
        // Assumindo que todos os modelos têm uma propriedade 'id'
        return model.id;
    }
    /**
     * Obtém o histórico de um registro
     *
     * @param tableName Nome da tabela
     * @param recordId ID do registro
     * @returns Histórico de auditoria do registro
     */
    async getRecordHistory(tableName, recordId) {
        return await this.repository.getHistoryForRecord(tableName, recordId);
    }
    /**
     * Obtém o histórico de uma coluna específica de um registro
     *
     * @param tableName Nome da tabela
     * @param recordId ID do registro
     * @param columnName Nome da coluna
     * @returns Histórico de auditoria da coluna
     */
    async getColumnHistory(tableName, recordId, columnName) {
        return await this.repository.getColumnHistory(tableName, recordId, columnName);
    }
}
exports.AuditService = AuditService;
//# sourceMappingURL=AuditService.js.map