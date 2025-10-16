"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseBusiness = void 0;
/**
 * Classe base para Business Layer
 * Delega operações CRUD para o Repository sem reimplementá-las
 *
 * @template T - Tipo do modelo de domínio
 * @template TDom - Tipo do objeto de domínio (DTO)
 */
class BaseBusiness {
    constructor(repository) {
        this.repository = repository;
    }
    /**
     * Converter dados de entrada para modelo
     * Deve ser implementado pelas classes filhas se necessário
     */
    fromCreateData(data) {
        return data;
    }
    /**
     * Buscar por ID - Delega para repository
     */
    async findById(id) {
        const result = await this.repository.findById(id);
        return result ? this.toDom(result) : null;
    }
    /**
     * Buscar todos - Delega para repository
     */
    async findAll(options) {
        const conditions = {};
        const results = await this.repository.findBy(conditions, options);
        return results.map(result => this.toDom(result));
    }
    /**
     * Buscar por condições - Delega para repository
     */
    async findBy(conditions, options) {
        const results = await this.repository.findBy(conditions, options);
        return results.map(result => this.toDom(result));
    }
    /**
     * Criar - Delega para repository
     */
    async create(data) {
        const modelData = this.fromCreateData(data);
        const created = await this.repository.create(modelData);
        return this.toDom(created);
    }
    /**
     * Atualizar - Delega para repository
     */
    async update(id, data) {
        const updated = await this.repository.update(id, data);
        return updated ? this.toDom(updated) : null;
    }
    /**
     * Deletar - Delega para repository
     */
    async delete(id) {
        return await this.repository.delete(id);
    }
    /**
     * Contar - Delega para repository
     */
    async count(conditions) {
        return await this.repository.count(conditions || {});
    }
}
exports.BaseBusiness = BaseBusiness;
//# sourceMappingURL=BaseBusiness.js.map