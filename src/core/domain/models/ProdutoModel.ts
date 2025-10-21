import { BaseModel, Entity, Column, Id } from './BaseModel';
import { Auditable } from '../decorators/AuditableDecorator';

/**
 * Modelo de exemplo com colunas auditáveis
 */
@Entity('produtos')
export class ProdutoModel extends BaseModel {
  @Id()
  id!: number;
  
  @Column({ type: 'VARCHAR', nullable: false })
  @Auditable() // Auditar em todas as operações (create, update, delete)
  nome!: string;
  
  @Column({ type: 'TEXT', nullable: true })
  @Auditable({ onCreate: true, onUpdate: true, onDelete: false }) // Não auditar na deleção
  descricao?: string;
  
  @Column({ type: 'INT', nullable: false })
  @Auditable({ onCreate: false, onUpdate: true, onDelete: true }) // Não auditar na criação
  preco!: number;
  
  @Column({ type: 'INT', nullable: false, default: 0 })
  @Auditable({ onCreate: false, onUpdate: false, onDelete: false }) // Não auditar
  estoque!: number;
  
  @Column({ type: 'BOOLEAN', nullable: false, default: true })
  @Auditable() // Auditar em todas as operações
  ativo!: boolean;
  
  @Column({ type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
  
  @Column({ type: 'TIMESTAMP', nullable: true })
  updatedAt?: Date;

  /**
   * Converte o modelo para um objeto simples
   * @returns Objeto com os dados do modelo
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      nome: this.nome,
      descricao: this.descricao,
      preco: this.preco,
      estoque: this.estoque,
      ativo: this.ativo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}