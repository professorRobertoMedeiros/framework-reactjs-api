import { BaseModel, Entity, Column, Id } from '../../core/domain/models/BaseModel';

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
}