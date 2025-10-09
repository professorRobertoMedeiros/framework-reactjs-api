import { BaseModel } from 'framework-reactjs-api';

export class ProdutoModel extends BaseModel {
  static tableName = 'produtos';
  
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  
  constructor(data?: Partial<ProdutoModel>) {
    super();
    Object.assign(this, data || {});
  }
  
  // Método para serializar para JSON
  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      descricao: this.descricao,
      preco: this.preco,
      estoque: this.estoque
    };
  }
}