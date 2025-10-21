import { BaseRepository } from '../../infra/repository/BaseRepository';
import { ProdutoModel } from '../domain/models/ProdutoModel';
import { AuditUser } from '../auth/AuditService';

/**
 * Repositório para produtos com auditoria habilitada
 */
export class ProdutoRepository extends BaseRepository<ProdutoModel> {
  /**
   * Cria uma nova instância do repositório de produtos com auditoria habilitada
   * @param currentUser Usuário atual para registro de auditoria (opcional)
   */
  constructor(currentUser?: AuditUser) {
    // Habilitar auditoria ao criar o repositório
    super(ProdutoModel, true, currentUser);
  }

  /**
   * Buscar produtos ativos
   * @returns Lista de produtos ativos
   */
  async findAtivos(): Promise<ProdutoModel[]> {
    return this.findBy({ ativo: true });
  }
  
  /**
   * Atualizar o preço de um produto
   * @param id ID do produto
   * @param preco Novo preço
   * @returns Produto atualizado ou null se não encontrado
   */
  async atualizarPreco(id: number, preco: number): Promise<ProdutoModel | null> {
    return this.update(id, { preco });
  }
}