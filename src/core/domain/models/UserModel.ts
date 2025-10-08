import { BaseModel, Entity, Column, Id, UniqueIndex, BusinessIndex } from './BaseModel';

@Entity('users')
@UniqueIndex('idx_users_email', ['email'])
@BusinessIndex('idx_users_name', ['first_name', 'last_name'], 'INDEX')
export class UserModel extends BaseModel {
  @Id()
  id!: number;

  @Column({
    type: 'VARCHAR',
    nullable: false,
    length: 100
  })
  first_name!: string;

  @Column({
    type: 'VARCHAR',
    nullable: false,
    length: 100
  })
  last_name!: string;

  @Column({
    type: 'VARCHAR',
    nullable: false,
    length: 255
  })
  email!: string;

  @Column({
    type: 'VARCHAR',
    nullable: false,
    length: 255
  })
  password_hash!: string;

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

  // Método de validação de exemplo
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Factory method para criar uma nova instância
  static create(data: {
    first_name: string;
    last_name: string;
    email: string;
    password_hash: string;
  }): UserModel {
    if (!this.validateEmail(data.email)) {
      throw new Error('Email inválido');
    }

    const user = new UserModel();
    user.first_name = data.first_name;
    user.last_name = data.last_name;
    user.email = data.email;
    user.password_hash = data.password_hash;
    user.active = true;
    user.created_at = new Date();
    
    return user;
  }
}