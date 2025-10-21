"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProdutoRepository = void 0;
const BaseRepository_1 = require("../../infra/repository/BaseRepository");
const ProdutoModel_1 = require("../domain/models/ProdutoModel");
/**
 * Repositório para produtos com auditoria habilitada
 */
class ProdutoRepository extends BaseRepository_1.BaseRepository {
    /**
     * Cria uma nova instância do repositório de produtos com auditoria habilitada
     * @param currentUser Usuário atual para registro de auditoria (opcional)
     */
    constructor(currentUser) {
        // Habilitar auditoria ao criar o repositório
        super(ProdutoModel_1.ProdutoModel, true, currentUser);
    }
    /**
     * Buscar produtos ativos
     * @returns Lista de produtos ativos
     */
    async findAtivos() {
        return this.findBy({ ativo: true });
    }
    /**
     * Atualizar o preço de um produto
     * @param id ID do produto
     * @param preco Novo preço
     * @returns Produto atualizado ou null se não encontrado
     */
    async atualizarPreco(id, preco) {
        return this.update(id, { preco });
    }
}
exports.ProdutoRepository = ProdutoRepository;
//# sourceMappingURL=ProdutoRepository.js.map