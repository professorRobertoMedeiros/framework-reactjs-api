import { BaseModel, Entity, Column, Id } from './BaseModel';

@Entity('orders')
export class OrderModel extends BaseModel {
  @Id()
  id!: number;

  @Column({
    type: 'INT',
    nullable: false
  })
  customer_id!: number;

  @Column({
    type: 'INT',
    nullable: false
  })
  total_amount!: number;

  @Column({
    type: 'VARCHAR',
    nullable: false,
    length: 50
  })
  status!: string;
}