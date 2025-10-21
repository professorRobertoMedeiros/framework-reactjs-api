import { BaseRepository } from '../../infra/repository/BaseRepository';
import { ProdutoModel } from '../domain/models/ProdutoModel';
import { AuditUser } from '../auth/AuditService';
/**
 * Repositório para produtos com auditoria habilitada
 */
export declare class ProdutoRepository extends BaseRepository<ProdutoModel> {
    /**
     * Cria uma nova instância do repositório de produtos com auditoria habilitada
     * @param currentUser Usuário atual para registro de auditoria (opcional)
     */
    constructor(currentUser?: AuditUser);
    /**
     * Buscar produtos ativos
     * @returns Lista de produtos ativos
     */
    findAtivos(): Promise<ProdutoModel[]>;
    /**
     * Atualizar o preço de um produto
     * @param id ID do produto
     * @param preco Novo preço
     * @returns Produto atualizado ou null se não encontrado
     */
    atualizarPreco(id: number, preco: number): Promise<ProdutoModel | null>;
}
