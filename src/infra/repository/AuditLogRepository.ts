import { BaseRepository } from './BaseRepository';
import { AuditLogModel, AuditActionType } from '../../core/domain/models/AuditLogModel';

/**
 * Repositório para manipular registros de auditoria
 */
export class AuditLogRepository extends BaseRepository<AuditLogModel> {
  constructor() {
    super(AuditLogModel);
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
  public async logAction(
    tableName: string,
    recordId: number,
    columnName: string,
    actionType: AuditActionType,
    oldValue?: any,
    newValue?: any,
    userId?: number,
    userEmail?: string
  ): Promise<void> {
    // Converter valores complexos para string para armazenamento
    const oldValueStr = oldValue !== undefined ? 
      (typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue)) : 
      undefined;
    
    const newValueStr = newValue !== undefined ? 
      (typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue)) : 
      undefined;

    // Criar uma instância do modelo e depois salvar
    const auditLog = new AuditLogModel();
    auditLog.tableName = tableName;
    auditLog.recordId = recordId;
    auditLog.columnName = columnName;
    auditLog.actionType = actionType;
    auditLog.oldValue = oldValueStr;
    auditLog.newValue = newValueStr;
    auditLog.userId = userId;
    auditLog.userEmail = userEmail;
    auditLog.createdAt = new Date();
    
    await this.create(auditLog as Omit<AuditLogModel, 'id'>);
  }

  /**
   * Obter histórico de auditoria para um registro específico
   * 
   * @param tableName Nome da tabela
   * @param recordId ID do registro
   * @returns Lista de registros de auditoria
   */
  public async getHistoryForRecord(tableName: string, recordId: number): Promise<AuditLogModel[]> {
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
  public async getColumnHistory(tableName: string, recordId: number, columnName: string): Promise<AuditLogModel[]> {
    return await this.findBy({ tableName, recordId, columnName }, { orderBy: 'createdAt ASC' });
  }
}