import { AuditLogRepository } from '../../infra/repository/AuditLogRepository';
import { AuditActionType } from '../domain/models/AuditLogModel';
import { AuditableMetadata } from '../domain/decorators/AuditableDecorator';
import { BaseModel } from '../domain/models/BaseModel';
import { getEntityMetadata } from '../domain/models/decorators/Entity';

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
export class AuditService {
  private repository: AuditLogRepository;
  private currentUser?: AuditUser;

  constructor(currentUser?: AuditUser) {
    this.repository = new AuditLogRepository();
    this.currentUser = currentUser;
  }

  /**
   * Define o usuário atual para auditoria
   * @param user Usuário atual
   */
  public setCurrentUser(user: AuditUser): void {
    this.currentUser = user;
  }

  /**
   * Registra a criação de um modelo
   * 
   * @param model Modelo criado
   */
  public async auditCreate(model: BaseModel): Promise<void> {
    const tableName = this.getTableName(model);
    const recordId = this.getRecordId(model);
    
    if (!tableName || recordId === undefined) {
      return;
    }

    // Obter propriedades auditáveis para criação
    const auditableProps = AuditableMetadata.getAuditableProps(model, 'create');
    
    // Se não houver propriedades auditáveis, não fazer nada
    if (auditableProps.length === 0) {
      return;
    }

    // Registrar cada propriedade auditável
    for (const prop of auditableProps) {
      if (prop in model) {
        const value = (model as any)[prop];
        
        await this.repository.logAction(
          tableName,
          recordId,
          prop,
          AuditActionType.CREATE,
          null,
          value,
          this.currentUser?.id,
          this.currentUser?.email
        );
      }
    }
  }

  /**
   * Registra a atualização de um modelo
   * 
   * @param model Modelo atualizado
   * @param oldValues Valores antigos (antes da atualização)
   */
  public async auditUpdate(model: BaseModel, oldValues: Record<string, any>): Promise<void> {
    const tableName = this.getTableName(model);
    const recordId = this.getRecordId(model);
    
    if (!tableName || recordId === undefined) {
      return;
    }

    // Obter propriedades auditáveis para atualização
    const auditableProps = AuditableMetadata.getAuditableProps(model, 'update');
    
    // Se não houver propriedades auditáveis, não fazer nada
    if (auditableProps.length === 0) {
      return;
    }

    // Registrar cada propriedade alterada que é auditável
    for (const prop of auditableProps) {
      // Verificar se a propriedade foi alterada
      if (prop in oldValues && prop in model) {
        const oldValue = oldValues[prop];
        const newValue = (model as any)[prop];
        
        // Somente registrar se o valor realmente mudou
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          await this.repository.logAction(
            tableName,
            recordId,
            prop,
            AuditActionType.UPDATE,
            oldValue,
            newValue,
            this.currentUser?.id,
            this.currentUser?.email
          );
        }
      }
    }
  }

  /**
   * Registra a exclusão de um modelo
   * 
   * @param model Modelo excluído
   */
  public async auditDelete(model: BaseModel): Promise<void> {
    const tableName = this.getTableName(model);
    const recordId = this.getRecordId(model);
    
    if (!tableName || recordId === undefined) {
      return;
    }

    // Obter propriedades auditáveis para exclusão
    const auditableProps = AuditableMetadata.getAuditableProps(model, 'delete');
    
    // Se não houver propriedades auditáveis, não fazer nada
    if (auditableProps.length === 0) {
      return;
    }

    // Registrar cada propriedade auditável
    for (const prop of auditableProps) {
      if (prop in model) {
        const value = (model as any)[prop];
        
        await this.repository.logAction(
          tableName,
          recordId,
          prop,
          AuditActionType.DELETE,
          value,
          null,
          this.currentUser?.id,
          this.currentUser?.email
        );
      }
    }
  }

  /**
   * Obtém o nome da tabela a partir do modelo
   * @param model Modelo
   * @returns Nome da tabela ou undefined
   */
  private getTableName(model: BaseModel): string | undefined {
    // Obter nome da tabela a partir dos metadados da entidade
    const entityMetadata = getEntityMetadata(model.constructor as Function);
    return entityMetadata?.tableName;
  }

  /**
   * Obtém o ID do registro a partir do modelo
   * @param model Modelo
   * @returns ID do registro ou undefined
   */
  private getRecordId(model: BaseModel): number | undefined {
    // Assumindo que todos os modelos têm uma propriedade 'id'
    return (model as any).id;
  }

  /**
   * Obtém o histórico de um registro
   * 
   * @param tableName Nome da tabela
   * @param recordId ID do registro
   * @returns Histórico de auditoria do registro
   */
  public async getRecordHistory(tableName: string, recordId: number) {
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
  public async getColumnHistory(tableName: string, recordId: number, columnName: string) {
    return await this.repository.getColumnHistory(tableName, recordId, columnName);
  }
}