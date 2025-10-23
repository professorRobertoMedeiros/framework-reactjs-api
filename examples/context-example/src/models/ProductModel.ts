import { BaseModel, Entity, Column, Id, Timestamps, Auditable } from 'framework-reactjs-api';

/**
 * Modelo de Produto com auditoria completa
 */
@Entity('products')
@Timestamps()
export class ProductModel extends BaseModel {
  @Id()
  id!: number;

  @Column()
  @Auditable()
  name!: string;

  @Column()
  @Auditable()
  price!: number;

  @Column()
  @Auditable()
  description?: string;

  createdAt?: Date;
  updatedAt?: Date;
}
