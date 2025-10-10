"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
/**
 * Classe base para serviços que implementa operações CRUD padrão
 * @template T Tipo do domínio
 * @template CreateT Tipo para criação
 * @template UpdateT Tipo para atualização
 */
class BaseService {
    /**
     * Buscar por ID
     * @param id ID do registro
     * @returns Resposta padronizada com o registro ou erro
     */
    async getById(id) {
        try {
            if (!id || id <= 0) {
                return {
                    success: false,
                    message: 'ID inválido fornecido',
                    error: 'INVALID_ID'
                };
            }
            const business = this.getBusiness();
            const result = await business.getById(id);
            if (!result) {
                return {
                    success: false,
                    message: `Registro com ID ${id} não encontrado`,
                    error: 'NOT_FOUND'
                };
            }
            return {
                success: true,
                message: 'Registro encontrado com sucesso',
                data: result
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Erro ao buscar registro',
                error: error.message || 'Erro desconhecido'
            };
        }
    }
    /**
     * Buscar todos com paginação
     * @param page Página (padrão: 1)
     * @param limit Limite por página (padrão: 10)
     * @returns Resposta padronizada com lista paginada ou erro
     */
    async getAll(page = 1, limit = 10) {
        try {
            // Validar parâmetros de paginação
            if (page < 1)
                page = 1;
            if (limit < 1)
                limit = 10;
            if (limit > 100)
                limit = 100;
            const offset = (page - 1) * limit;
            const business = this.getBusiness();
            // Buscar dados no business
            const items = await business.getAll({
                limit,
                offset
            });
            // Contar total de registros
            const total = await business.count ? await business.count() : items.length;
            const totalPages = Math.ceil(total / limit);
            return {
                success: true,
                message: 'Registros listados com sucesso',
                data: {
                    items,
                    total,
                    page,
                    limit,
                    totalPages
                }
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Erro ao listar registros',
                error: error.message || 'Erro desconhecido'
            };
        }
    }
    /**
     * Criar um novo registro
     * @param data Dados para criação
     * @returns Resposta padronizada com o registro criado ou erro
     */
    async create(data) {
        try {
            // Validação básica
            if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
                return {
                    success: false,
                    message: 'Dados não fornecidos',
                    error: 'INVALID_DATA'
                };
            }
            const business = this.getBusiness();
            const created = await business.create(data);
            return {
                success: true,
                message: 'Registro criado com sucesso',
                data: created
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Erro ao criar registro',
                error: error.message || 'Erro desconhecido'
            };
        }
    }
    /**
     * Atualizar um registro existente
     * @param id ID do registro
     * @param data Dados para atualização
     * @returns Resposta padronizada com o registro atualizado ou erro
     */
    async update(id, data) {
        try {
            // Validações básicas
            if (!id || id <= 0) {
                return {
                    success: false,
                    message: 'ID inválido fornecido',
                    error: 'INVALID_ID'
                };
            }
            if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
                return {
                    success: false,
                    message: 'Dados não fornecidos para atualização',
                    error: 'INVALID_DATA'
                };
            }
            const business = this.getBusiness();
            const updated = await business.update(id, data);
            if (!updated) {
                return {
                    success: false,
                    message: `Registro com ID ${id} não encontrado`,
                    error: 'NOT_FOUND'
                };
            }
            return {
                success: true,
                message: 'Registro atualizado com sucesso',
                data: updated
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Erro ao atualizar registro',
                error: error.message || 'Erro desconhecido'
            };
        }
    }
    /**
     * Excluir um registro
     * @param id ID do registro
     * @returns Resposta padronizada de sucesso ou erro
     */
    async delete(id) {
        try {
            if (!id || id <= 0) {
                return {
                    success: false,
                    message: 'ID inválido fornecido',
                    error: 'INVALID_ID'
                };
            }
            const business = this.getBusiness();
            const deleted = await business.delete(id);
            if (!deleted) {
                return {
                    success: false,
                    message: `Registro com ID ${id} não encontrado`,
                    error: 'NOT_FOUND'
                };
            }
            return {
                success: true,
                message: 'Registro excluído com sucesso'
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Erro ao excluir registro',
                error: error.message || 'Erro desconhecido'
            };
        }
    }
}
exports.BaseService = BaseService;
//# sourceMappingURL=BaseService.js.map