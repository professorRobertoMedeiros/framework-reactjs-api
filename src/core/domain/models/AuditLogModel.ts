import { BaseModel, Entity, Column, Id } from './BaseModel';

/**
 * Tipos de ação para auditoria
 */
export enum AuditActionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

/**
 * Modelo para armazenar os registros de auditoria
 */
@Entity('audit_logs')
export class AuditLogModel extends BaseModel {
  @Id()
  id!: number;

  @Column({ type: 'VARCHAR', nullable: false })
  tableName!: string;

  @Column({ type: 'INT', nullable: false })
  recordId!: number;

  @Column({ type: 'VARCHAR', nullable: false })
  columnName!: string;

  @Column({ type: 'VARCHAR', nullable: false })
  actionType!: AuditActionType;

  @Column({ type: 'TEXT', nullable: true })
  oldValue?: string;

  @Column({ type: 'TEXT', nullable: true })
  newValue?: string;

  @Column({ type: 'INT', nullable: true })
  userId?: number;

  @Column({ type: 'VARCHAR', nullable: true })
  userEmail?: string;

  @Column({ type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  /**
   * Converte o modelo para um objeto simples
   * @returns Objeto com os dados do modelo
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      tableName: this.tableName,
      recordId: this.recordId,
      columnName: this.columnName,
      actionType: this.actionType,
      oldValue: this.oldValue,
      newValue: this.newValue,
      userId: this.userId,
      userEmail: this.userEmail,
      createdAt: this.createdAt
    };
  }
}