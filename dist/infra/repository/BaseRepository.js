"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const CustomORM_1 = require("../db/CustomORM");
/**
 * Classe base para implementações de repositório
 * @template T Tipo do modelo associado ao repositório
 * @template ID Tipo do identificador único (geralmente number)
 */
class BaseRepository {
    /**
     * Cria uma nova instância do repositório base
     * @param modelClass Classe do modelo para o qual o repositório é usado
     */
    constructor(modelClass) {
        this.modelClass = modelClass;
        this.orm = CustomORM_1.CustomORM.getInstance();
        // Obter nome da tabela do modelo
        this.tableName = this.modelClass.getTableName();
        if (!this.tableName) {
            throw new Error(`Modelo ${modelClass.name} não possui um nome de tabela válido.`);
        }
    }
    /**
     * Converte um objeto de dados bruto para uma instância do modelo
     * @param data Dados brutos do banco de dados
     * @returns Instância do modelo
     */
    mapToModel(data) {
        if (!data)
            return null;
        const model = new this.modelClass();
        const columns = this.modelClass.getColumns() || {};
        // Mapear todas as propriedades do data para o modelo
        for (const key of Object.keys(data)) {
            if (key in columns || key === 'id') {
                model[key] = data[key];
            }
        }
        return model;
    }
    /**
     * Converte as opções de paginação para offset/limit
     * @param options Opções de paginação
     * @returns Opções formatadas para o ORM
     */
    formatPaginationOptions(options = {}) {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const offset = (page - 1) * limit;
        return {
            limit,
            offset,
            orderBy: options.orderBy
        };
    }
    /**
     * Buscar entidade por ID
     * @param id ID da entidade
     * @returns Entidade encontrada ou null se não existir
     */
    async findById(id) {
        const result = await this.orm.findById(this.tableName, id);
        return result ? this.mapToModel(result) : null;
    }
    /**
     * Buscar todas as entidades com opções de paginação e ordenação
     * @param options Opções de paginação
     * @returns Lista de entidades
     */
    async findAll(options = {}) {
        const ormOptions = this.formatPaginationOptions(options);
        const results = await this.orm.findAll(this.tableName, ormOptions);
        return results.map(result => this.mapToModel(result));
    }
    /**
     * Buscar todas as entidades com resultado paginado
     * @param options Opções de paginação
     * @returns Resultado paginado
     */
    async findAllPaginated(options = {}) {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const ormOptions = this.formatPaginationOptions(options);
        const [results, total] = await Promise.all([
            this.orm.findAll(this.tableName, ormOptions),
            this.count()
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            data: results.map(result => this.mapToModel(result)),
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        };
    }
    /**
     * Buscar entidades por condições
     * @param conditions Condições de filtro (pares chave/valor)
     * @param options Opções de paginação
     * @returns Lista de entidades que correspondem às condições
     */
    async findBy(conditions, options = {}) {
        const ormOptions = this.formatPaginationOptions(options);
        const results = await this.orm.findBy(this.tableName, conditions, ormOptions);
        return results.map(result => this.mapToModel(result));
    }
    /**
     * Buscar entidades por condições com resultado paginado
     * @param conditions Condições de filtro (pares chave/valor)
     * @param options Opções de paginação
     * @returns Resultado paginado
     */
    async findByPaginated(conditions, options = {}) {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const ormOptions = this.formatPaginationOptions(options);
        const [results, total] = await Promise.all([
            this.orm.findBy(this.tableName, conditions, ormOptions),
            this.count(conditions)
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            data: results.map(result => this.mapToModel(result)),
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        };
    }
    /**
     * Buscar uma única entidade por condições
     * @param conditions Condições de filtro (pares chave/valor)
     * @returns Entidade ou null se não encontrada
     */
    async findOneBy(conditions) {
        const results = await this.findBy(conditions, { limit: 1 });
        return results.length > 0 ? results[0] : null;
    }
    /**
     * Criar uma nova entidade
     * @param entity Dados da entidade (sem ID)
     * @returns Entidade criada com ID gerado
     */
    async create(entity) {
        // Adicionar timestamps se for um modelo com esses campos
        const entityData = { ...entity };
        if ('created_at' in entityData && !entityData.created_at) {
            entityData.created_at = new Date();
        }
        const result = await this.orm.create(this.tableName, entityData);
        return this.mapToModel(result);
    }
    /**
     * Criar múltiplas entidades em uma única operação
     * @param entities Lista de dados de entidades (sem IDs)
     * @returns Lista de entidades criadas com IDs gerados
     */
    async createMany(entities) {
        const results = [];
        // Implementação simples: criar cada entidade individualmente
        // Para implementação mais eficiente, adicionar método bulkInsert no CustomORM
        for (const entity of entities) {
            const result = await this.create(entity);
            results.push(result);
        }
        return results;
    }
    /**
     * Atualizar uma entidade existente
     * @param id ID da entidade
     * @param entity Dados parciais para atualização
     * @returns Entidade atualizada ou null se não encontrada
     */
    async update(id, entity) {
        // Adicionar timestamp de atualização se for um modelo com esse campo
        const entityData = { ...entity };
        if ('updated_at' in entityData && !entityData.updated_at) {
            entityData.updated_at = new Date();
        }
        const result = await this.orm.update(this.tableName, id, entityData);
        return result ? this.mapToModel(result) : null;
    }
    /**
     * Excluir uma entidade
     * @param id ID da entidade a excluir
     * @returns true se a entidade foi excluída, false se não encontrada
     */
    async delete(id) {
        return await this.orm.delete(this.tableName, id);
    }
    /**
     * Contar entidades com condições opcionais
     * @param conditions Condições de filtro (pares chave/valor)
     * @returns Número de entidades
     */
    async count(conditions = {}) {
        return await this.orm.count(this.tableName, conditions);
    }
    /**
     * Verificar se existe alguma entidade com as condições especificadas
     * @param conditions Condições de filtro (pares chave/valor)
     * @returns true se existe pelo menos uma entidade, false caso contrário
     */
    async exists(conditions) {
        const count = await this.count(conditions);
        return count > 0;
    }
    /**
     * Executa uma operação em transação
     * @param operation Função que recebe a transação e executa operações
     * @returns Resultado da função de operação
     */
    async executeInTransaction(operation) {
        const client = await this.orm.getClient();
        try {
            await client.query('BEGIN');
            const result = await operation();
            await client.query('COMMIT');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=BaseRepository.js.map