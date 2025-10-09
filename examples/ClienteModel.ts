// Exemplo de uso dos decoradores compatíveis com TypeScript 5.0+
import { BaseModel, Entity, Column5 as Column, Id5 as Id } from 'framework-reactjs-api';

@Entity('clientes')
export class ClienteModel extends BaseModel {
  @Id()  // Note os parênteses aqui - importante!
  id: number = 0;
  
  @Column({
    type: 'VARCHAR',
    length: 100,
    nullable: false
  })
  nome: string = '';
  
  @Column({
    type: 'VARCHAR',
    length: 150,
    nullable: false,
    unique: true
  })
  email: string = '';
  
  @Column({
    type: 'VARCHAR',
    length: 20
  })
  telefone: string = '';
  
  @Column({
    type: 'TIMESTAMP',
    default: 'CURRENT_TIMESTAMP'
  })
  dataCadastro: Date = new Date();
  
  static getTableName(): string {
    return 'clientes';
  }
  
  static getConstraints() {
    return {
      id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
      nome: { type: 'VARCHAR', length: 100, notNull: true },
      email: { type: 'VARCHAR', length: 150, unique: true },
      telefone: { type: 'VARCHAR', length: 20 },
      dataCadastro: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
    };
  }
  
  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      email: this.email,
      telefone: this.telefone,
      dataCadastro: this.dataCadastro
    };
  }
}