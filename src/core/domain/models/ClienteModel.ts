import { BaseModel, Entity, Column, Id } from './BaseModel';

@Entity('clientes')
export class ClienteModel extends BaseModel {
  @Id()
  id!: number;

  @Column({
    type: 'VARCHAR',
    nullable: false,
    length: 100
  })
  nome!: string;

  @Column({
    type: 'VARCHAR',
    nullable: false,
    length: 150
  })
  email!: string;

  @Column({
    type: 'VARCHAR',
    nullable: true,
    length: 20
  })
  telefone?: string;

  @Column({
    type: 'BOOLEAN',
    nullable: false,
    default: true
  })
  ativo!: boolean;

  @Column({
    type: 'TIMESTAMP',
    nullable: false,
    default: 'CURRENT_TIMESTAMP'
  })
  created_at!: Date;

  @Column({
    type: 'TIMESTAMP',
    nullable: true
  })
  updated_at?: Date;

  // Implementação requerida por BaseModel
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      nome: this.nome,
      email: this.email,
      telefone: this.telefone,
      ativo: this.ativo,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}