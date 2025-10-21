import { BaseModel, Entity, Column, Id, Timestamps, SoftDelete } from 'framework-reactjs-api';

/**
 * Exemplo de modelo com Timestamps e SoftDelete
 * 
 * Este modelo terá automaticamente:
 * - created_at: Preenchido automaticamente no create()
 * - updated_at: Preenchido automaticamente no create() e update()
 * - deleted_at: Preenchido automaticamente no delete() (soft delete)
 */
@Entity('products')
@Timestamps()  // ✅ Habilita created_at e updated_at
@SoftDelete()  // ✅ Habilita deleted_at (soft delete)
export class ProductModel extends BaseModel {
  @Id()
  id!: number;

  @Column({
    type: 'VARCHAR',
    nullable: false,
    length: 255
  })
  name!: string;

  @Column({
    type: 'TEXT',
    nullable: true
  })
  description?: string;

  @Column({
    type: 'INT',
    nullable: false
  })
  price!: number;

  @Column({
    type: 'INT',
    nullable: false,
    default: 0
  })
  stock!: number;

  @Column({
    type: 'BOOLEAN',
    nullable: false,
    default: true
  })
  active!: boolean;

  // ✨ Estes campos são adicionados automaticamente pelos decorators
  // Não é necessário declará-los aqui, mas podemos fazer para documentação
  
  created_at?: Date;   // Preenchido automaticamente no create()
  updated_at?: Date;   // Preenchido automaticamente no create() e update()
  deleted_at?: Date;   // Preenchido automaticamente no delete() (soft delete)
}
