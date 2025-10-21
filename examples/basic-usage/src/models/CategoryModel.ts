import { BaseModel, Entity, Column, Id, Timestamps } from 'framework-reactjs-api';

/**
 * Exemplo de modelo apenas com Timestamps (sem SoftDelete)
 * 
 * Este modelo terá automaticamente:
 * - created_at: Preenchido automaticamente no create()
 * - updated_at: Preenchido automaticamente no create() e update()
 * 
 * NÃO terá:
 * - deleted_at: Delete será físico (permanente)
 */
@Entity('categories')
@Timestamps()  // ✅ Habilita created_at e updated_at
// ❌ SEM @SoftDelete() - delete será físico
export class CategoryModel extends BaseModel {
  @Id()
  id!: number;

  @Column({
    type: 'VARCHAR',
    nullable: false,
    length: 100
  })
  name!: string;

  @Column({
    type: 'TEXT',
    nullable: true
  })
  description?: string;

  @Column({
    type: 'BOOLEAN',
    nullable: false,
    default: true
  })
  active!: boolean;

  // ✨ Timestamps automáticos
  created_at?: Date;
  updated_at?: Date;
  // ❌ SEM deleted_at - deletes são físicos
}
