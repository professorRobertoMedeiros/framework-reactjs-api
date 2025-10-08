import { BaseModel, Entity, Column, Id } from './BaseModel';

@Entity('products')
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
      name: this.name,
      description: this.description,
      price: this.price,
      stock: this.stock,
      active: this.active,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}