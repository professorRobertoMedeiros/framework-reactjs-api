"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderBusiness = void 0;
const OrderRepository_1 = require("./repository/OrderRepository");
/**
 * Business para Order
 * Contém as regras de negócio específicas do domínio
 */
class OrderBusiness {
    constructor(orderRepository) {
        this.orderRepository = orderRepository || new OrderRepository_1.OrderRepository();
    }
    /**
     * Converter modelo para Dom
     * @param model Modelo do Order
     * @returns Dom do Order
     */
    toDom(model) {
        return {
            id: model.id,
            // TODO: Mapear outras propriedades do modelo para o Dom aqui
            // Exemplo:
            // name: model.name,
            // email: model.email,
            // created_at: model.created_at,
        };
    }
    /**
     * Converter Dom de criação para modelo
     * @param dom Dom de criação do Order
     * @returns Dados para criação do modelo
     */
    fromCreateDom(dom) {
        // TODO: Implementar conversão do Dom para modelo
        // Validações e transformações de negócio devem ser feitas aqui
        const modelData = {
        // Exemplo:
        // name: dom.name,
        // email: dom.email,
        // created_at: new Date(),
        };
        return modelData;
    }
    /**
     * Converter Dom de atualização para dados parciais do modelo
     * @param dom Dom de atualização do Order
     * @returns Dados parciais para atualização do modelo
     */
    fromUpdateDom(dom) {
        // TODO: Implementar conversão do Dom de atualização para modelo
        // Validações e transformações de negócio devem ser feitas aqui
        const modelData = {
        // Exemplo:
        // name: dom.name,
        // updated_at: new Date(),
        };
        return modelData;
    }
    /**
     * Obter order por ID
     * @param id ID do order
     * @returns Dom do Order ou null se não encontrado
     */
    async getById(id) {
        // Validações de negócio
        if (!id || id <= 0) {
            throw new Error('ID inválido fornecido');
        }
        const result = await this.orderRepository.findById(id);
        return result ? this.toDom(result) : null;
    }
    /**
     * Obter todos os orders
     * @param options Opções de consulta
     * @returns Lista de Doms de Order
     */
    async getAll(options) {
        const results = await this.orderRepository.findAll(options);
        return results.map(result => this.toDom(result));
    }
    /**
     * Criar um novo order
     * @param data Dados para criação do order
     * @returns Dom do Order criado
     */
    async create(data) {
        // Validações de negócio específicas
        await this.validateCreateData(data);
        // Converter Dom para modelo
        const modelData = this.fromCreateDom(data);
        // Criar no repository
        const created = await this.orderRepository.create(modelData);
        return this.toDom(created);
    }
    /**
     * Atualizar um order existente
     * @param id ID do order
     * @param data Dados para atualização
     * @returns Dom do Order atualizado ou null se não encontrado
     */
    async update(id, data) {
        // Validações de negócio
        if (!id || id <= 0) {
            throw new Error('ID inválido fornecido');
        }
        // Verificar se existe
        const existing = await this.orderRepository.findById(id);
        if (!existing) {
            return null;
        }
        // Validações de negócio específicas para atualização
        await this.validateUpdateData(data);
        // Converter Dom para dados de modelo
        const modelData = this.fromUpdateDom(data);
        // Atualizar no repository
        const updated = await this.orderRepository.update(id, modelData);
        return updated ? this.toDom(updated) : null;
    }
    /**
     * Excluir um order
     * @param id ID do order
     * @returns true se excluído com sucesso, false se não encontrado
     */
    async delete(id) {
        // Validações de negócio
        if (!id || id <= 0) {
            throw new Error('ID inválido fornecido');
        }
        // Verificar se existe antes de excluir
        const existing = await this.orderRepository.findById(id);
        if (!existing) {
            return false;
        }
        // Validações de negócio para exclusão
        await this.validateDeleteOperation(existing);
        return await this.orderRepository.delete(id);
    }
    /**
     * Validar dados para criação (regras de negócio)
     * @param data Dados para validação
     */
    async validateCreateData(data) {
        // TODO: Implementar validações de negócio específicas para criação
        // Exemplo:
        // if (!data.name || data.name.trim().length === 0) {
        //   throw new Error('Nome é obrigatório');
        // }
        // 
        // if (!data.email || !this.isValidEmail(data.email)) {
        //   throw new Error('Email inválido');
        // }
    }
    /**
     * Validar dados para atualização (regras de negócio)
     * @param data Dados para validação
     */
    async validateUpdateData(data) {
        // TODO: Implementar validações de negócio específicas para atualização
    }
    /**
     * Validar operação de exclusão (regras de negócio)
     * @param model Modelo para validação
     */
    async validateDeleteOperation(model) {
        // TODO: Implementar validações de negócio para exclusão
        // Exemplo: verificar se não há registros dependentes
    }
    /**
     * Buscar orders ativos
     * @param options Opções de consulta
     * @returns Lista de orders ativos
     */
    async findActive(options) {
        const results = await this.orderRepository.findActive(options);
        return results.map(result => this.toDom(result));
    }
    /**
     * Contar registros (método para compatibilidade com BaseService)
     * @returns Número de registros
     */
    async count() {
        return await this.orderRepository.count();
    }
}
exports.OrderBusiness = OrderBusiness;
//# sourceMappingURL=OrderBusiness.js.map