"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const CustomORM_1 = require("../db/CustomORM");
const TimestampHelpers_1 = require("../../core/domain/models/decorators/TimestampHelpers");
const AuditService_1 = require("../../core/auth/AuditService");
/**
 * Classe base para implementações de repositório
 * @template T Tipo do modelo associado ao repositório
 * @template ID Tipo do identificador único (geralmente number)
 */
class BaseRepository {
    /**
     * Cria uma nova instância do repositório base
     * @param modelClass Classe do modelo para o qual o repositório é usado
     * @param enableAudit Habilitar auditoria automática para este repositório
     * @param currentUser Usuário atual para registro de auditoria
     */
    constructor(modelClass, enableAudit = false, currentUser) {
        this.modelClass = modelClass;
        this.enableAudit = false;
        this.orm = CustomORM_1.CustomORM.getInstance();
        // Obter nome da tabela do modelo
        this.tableName = this.modelClass.getTableName();
        if (!this.tableName) {
            throw new Error(`Modelo ${modelClass.name} não possui um nome de tabela válido.`);
        }
        // Configurar auditoria se habilitada
        this.enableAudit = enableAudit;
        if (enableAudit) {
            this.auditService = new AuditService_1.AuditService(currentUser);
        }
    }
    /**
     * Define o usuário atual para auditoria
     * @param user Usuário atual
     */
    setAuditUser(user) {
        if (this.auditService) {
            this.auditService.setCurrentUser(user);
        }
    }
    /**
     * Verifica se a entidade tem timestamps habilitados
     */
    hasTimestamps() {
        return (0, TimestampHelpers_1.hasTimestamps)(this.modelClass);
    }
    /**
     * Verifica se a entidade tem soft delete habilitado
     */
    hasSoftDelete() {
        return (0, TimestampHelpers_1.hasSoftDelete)(this.modelClass);
    }
    /**
     * Adiciona timestamps aos dados
     * @param data Dados da entidade
     * @param isUpdate Se é uma atualização (inclui updated_at)
     */
    addTimestamps(data, isUpdate = false) {
        if (!this.hasTimestamps()) {
            return data;
        }
        const result = { ...data };
        const createdAtField = (0, TimestampHelpers_1.getCreatedAtField)(this.modelClass);
        const updatedAtField = (0, TimestampHelpers_1.getUpdatedAtField)(this.modelClass);
        if (!isUpdate && !result[createdAtField]) {
            result[createdAtField] = new Date();
        }
        if (!result[updatedAtField]) {
            result[updatedAtField] = new Date();
        }
        return result;
    }
    /**
     * Adiciona condição de soft delete às consultas (excluir registros deletados)
     * @param conditions Condições existentes
     */
    addSoftDeleteCondition(conditions = {}) {
        if (!this.hasSoftDelete()) {
            return conditions;
        }
        const deletedAtField = (0, TimestampHelpers_1.getDeletedAtField)(this.modelClass);
        return {
            ...conditions,
            [deletedAtField]: null // Apenas registros não deletados
        };
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
        const page = options.page;
        const limit = options.limit;
        const offset = options.offset !== undefined ? options.offset : (page ? (page - 1) * (limit || 10) : undefined);
        return {
            limit,
            offset,
            orderBy: options.orderBy
        };
    }
    /**
     * Formata as opções de consulta avançada
     * @param options Opções de consulta
     * @returns Opções formatadas
     */
    formatQueryOptions(options = {}) {
        const paginationOptions = this.formatPaginationOptions(options);
        return {
            conditions: options.conditions,
            includes: options.includes,
            ...paginationOptions
        };
    }
    /**
     * Buscar entidade por ID
     * @param id ID da entidade
     * @param includes Lista de relacionamentos a incluir
     * @returns Entidade encontrada ou null se não existir
     */
    async findById(id, includes) {
        // Se tem soft delete, usar findOneBy para aplicar a condição
        if (this.hasSoftDelete()) {
            return await this.findOneBy({ id }, includes);
        }
        const result = await this.orm.findById(this.tableName, id);
        // TODO: Implementar includes quando o ORM suportar relacionamentos
        return result ? this.mapToModel(result) : null;
    }
    /**
     * Buscar todas as entidades com opções de consulta avançada
     * @param options Opções de consulta (conditions, paginação, ordenação, includes)
     * @returns Lista de entidades
     */
    async findAll(options = {}) {
        // Adicionar condição de soft delete
        const conditions = this.addSoftDeleteCondition(options.conditions);
        const queryOptions = { ...options, conditions };
        const { conditions: finalConditions, ...paginationOptions } = this.formatQueryOptions(queryOptions);
        // Se houver condições, usar findBy, senão usar findAll do ORM
        if (finalConditions && Object.keys(finalConditions).length > 0) {
            const results = await this.orm.findBy(this.tableName, finalConditions, paginationOptions);
            return results.map(result => this.mapToModel(result));
        }
        const results = await this.orm.findAll(this.tableName, paginationOptions);
        // TODO: Implementar includes quando o ORM suportar relacionamentos
        return results.map(result => this.mapToModel(result));
    }
    /**
     * Buscar todas as entidades com resultado paginado
     * @param options Opções de consulta (conditions, paginação, ordenação, includes)
     * @returns Resultado paginado
     */
    async findAllPaginated(options = {}) {
        const page = options.page || 1;
        const limit = options.limit || 10;
        // Adicionar condição de soft delete
        const conditions = this.addSoftDeleteCondition(options.conditions);
        const queryOptions = { ...options, conditions };
        const { conditions: finalConditions, ...paginationOptions } = this.formatQueryOptions(queryOptions);
        let results;
        let total;
        // Se houver condições, usar findBy, senão usar findAll do ORM
        if (finalConditions && Object.keys(finalConditions).length > 0) {
            [results, total] = await Promise.all([
                this.orm.findBy(this.tableName, finalConditions, paginationOptions),
                this.count(finalConditions)
            ]);
        }
        else {
            [results, total] = await Promise.all([
                this.orm.findAll(this.tableName, paginationOptions),
                this.count()
            ]);
        }
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
        // Adicionar condição de soft delete
        const finalConditions = this.addSoftDeleteCondition(conditions);
        const ormOptions = this.formatPaginationOptions(options);
        const results = await this.orm.findBy(this.tableName, finalConditions, ormOptions);
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
        // Adicionar condição de soft delete
        const finalConditions = this.addSoftDeleteCondition(conditions);
        const ormOptions = this.formatPaginationOptions(options);
        const [results, total] = await Promise.all([
            this.orm.findBy(this.tableName, finalConditions, ormOptions),
            this.count(finalConditions)
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
     * @param includes Lista de relacionamentos a incluir
     * @returns Entidade ou null se não encontrada
     */
    async findOneBy(conditions, includes) {
        const results = await this.findBy(conditions, { limit: 1 });
        // TODO: Implementar includes quando o ORM suportar relacionamentos
        return results.length > 0 ? results[0] : null;
    }
    /**
     * Criar uma nova entidade
     * @param entity Dados da entidade (sem ID)
     * @returns Entidade criada com ID gerado
     */
    async create(entity) {
        // Adicionar timestamps automaticamente
        const entityData = this.addTimestamps({ ...entity }, false);
        const result = await this.orm.create(this.tableName, entityData);
        const createdModel = this.mapToModel(result);
        // Registrar auditoria se habilitada
        if (this.enableAudit && this.auditService) {
            await this.auditService.auditCreate(createdModel);
        }
        return createdModel;
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
        // Obter entidade atual antes da atualização (para auditoria)
        let oldValues = {};
        if (this.enableAudit && this.auditService) {
            const existingEntity = await this.findById(id);
            if (existingEntity) {
                // Extrair os valores antigos das propriedades que serão alteradas
                for (const key of Object.keys(entity)) {
                    oldValues[key] = existingEntity[key];
                }
            }
        }
        // Adicionar timestamp de atualização automaticamente
        const entityData = this.addTimestamps({ ...entity }, true);
        const result = await this.orm.update(this.tableName, id, entityData);
        if (result && this.enableAudit && this.auditService) {
            const updatedModel = this.mapToModel(result);
            // Registrar auditoria da atualização
            await this.auditService.auditUpdate(updatedModel, oldValues);
        }
        return result ? this.mapToModel(result) : null;
    }
    /**
     * Excluir uma entidade
     * @param id ID da entidade a excluir
     * @returns true se a entidade foi excluída, false se não encontrada
     *
     * @remarks
     * Se a entidade tiver soft delete habilitado, apenas marca como deletada.
     * Caso contrário, deleta fisicamente do banco de dados.
     */
    async delete(id) {
        // Obter entidade antes da exclusão para auditoria
        let entityToDelete = null;
        if (this.enableAudit && this.auditService) {
            entityToDelete = await this.findById(id);
            // Se não encontrou, não precisa auditar
            if (!entityToDelete) {
                return false;
            }
        }
        let result = false;
        // Se tem soft delete, fazer update ao invés de delete
        if (this.hasSoftDelete()) {
            const deletedAtField = (0, TimestampHelpers_1.getDeletedAtField)(this.modelClass);
            const updatedAtField = (0, TimestampHelpers_1.getUpdatedAtField)(this.modelClass);
            const updateData = {
                [deletedAtField]: new Date()
            };
            // Adicionar updated_at se tiver timestamps
            if (this.hasTimestamps()) {
                updateData[updatedAtField] = new Date();
            }
            const updatedEntity = await this.update(id, updateData);
            result = updatedEntity !== null;
        }
        else {
            // Delete físico
            result = await this.orm.delete(this.tableName, id);
        }
        // Registrar auditoria da exclusão
        if (result && this.enableAudit && this.auditService && entityToDelete) {
            await this.auditService.auditDelete(entityToDelete);
        }
        return result;
    }
    /**
     * Forçar exclusão física de uma entidade (ignora soft delete)
     * @param id ID da entidade a excluir
     * @returns true se a entidade foi excluída, false se não encontrada
     */
    async forceDelete(id) {
        return await this.orm.delete(this.tableName, id);
    }
    /**
     * Atualizar entidades que correspondem às condições
     * @param conditions Condições para filtrar as entidades a serem atualizadas
     * @param entity Dados parciais para atualização
     * @returns Número de entidades atualizadas
     */
    async updateBy(conditions, entity) {
        // Adicionar timestamp de atualização automaticamente
        const entityData = this.addTimestamps({ ...entity }, true);
        // Adicionar condição de soft delete
        const finalConditions = this.addSoftDeleteCondition(conditions);
        // Construir a query UPDATE dinamicamente
        const keys = Object.keys(entityData);
        const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
        const values = keys.map(key => entityData[key]);
        // Construir a cláusula WHERE
        const conditionKeys = Object.keys(finalConditions);
        const whereClause = conditionKeys
            .map((key, index) => `${key} = $${keys.length + index + 1}`)
            .join(' AND ');
        const conditionValues = conditionKeys.map(key => finalConditions[key]);
        // Executar a query
        const query = `
      UPDATE ${this.tableName}
      SET ${setClause}
      ${whereClause ? `WHERE ${whereClause}` : ''}
      RETURNING *
    `;
        const result = await this.orm.query(query, [...values, ...conditionValues]);
        return result.rowCount || 0;
    }
    /**
     * Excluir entidades que correspondem às condições
     * @param conditions Condições para filtrar as entidades a serem excluídas
     * @returns Número de entidades excluídas
     *
     * @remarks
     * Se a entidade tiver soft delete habilitado, apenas marca como deletada.
     * Caso contrário, deleta fisicamente do banco de dados.
     */
    async deleteBy(conditions) {
        // Construir a cláusula WHERE
        const conditionKeys = Object.keys(conditions);
        if (conditionKeys.length === 0) {
            throw new Error('deleteBy requer ao menos uma condição para evitar exclusão acidental de todos os registros');
        }
        // Se tem soft delete, fazer update ao invés de delete
        if (this.hasSoftDelete()) {
            const deletedAtField = (0, TimestampHelpers_1.getDeletedAtField)(this.modelClass);
            const updateData = {
                [deletedAtField]: new Date()
            };
            // Adicionar updated_at se tiver timestamps
            if (this.hasTimestamps()) {
                const updatedAtField = (0, TimestampHelpers_1.getUpdatedAtField)(this.modelClass);
                updateData[updatedAtField] = new Date();
            }
            return await this.updateBy(conditions, updateData);
        }
        // Delete físico
        const whereClause = conditionKeys
            .map((key, index) => `${key} = $${index + 1}`)
            .join(' AND ');
        const values = conditionKeys.map(key => conditions[key]);
        // Executar a query
        const query = `
      DELETE FROM ${this.tableName}
      WHERE ${whereClause}
    `;
        const result = await this.orm.query(query, values);
        return result.rowCount || 0;
    }
    /**
     * Forçar exclusão física de entidades (ignora soft delete)
     * @param conditions Condições para filtrar as entidades a serem excluídas
     * @returns Número de entidades excluídas
     */
    async forceDeleteBy(conditions) {
        const conditionKeys = Object.keys(conditions);
        if (conditionKeys.length === 0) {
            throw new Error('forceDeleteBy requer ao menos uma condição para evitar exclusão acidental de todos os registros');
        }
        const whereClause = conditionKeys
            .map((key, index) => `${key} = $${index + 1}`)
            .join(' AND ');
        const values = conditionKeys.map(key => conditions[key]);
        const query = `
      DELETE FROM ${this.tableName}
      WHERE ${whereClause}
    `;
        const result = await this.orm.query(query, values);
        return result.rowCount || 0;
    }
    /**
     * Contar entidades com condições opcionais
     * @param conditions Condições de filtro (pares chave/valor)
     * @returns Número de entidades
     */
    async count(conditions = {}) {
        // Adicionar condição de soft delete
        const finalConditions = this.addSoftDeleteCondition(conditions);
        return await this.orm.count(this.tableName, finalConditions);
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
     * Restaurar uma entidade deletada (soft delete)
     * @param id ID da entidade a restaurar
     * @returns true se restaurada, false se não encontrada
     *
     * @remarks
     * Funciona apenas se a entidade tiver soft delete habilitado.
     * Coloca deleted_at como null.
     */
    async restore(id) {
        if (!this.hasSoftDelete()) {
            throw new Error('Esta entidade não possui soft delete habilitado');
        }
        const deletedAtField = (0, TimestampHelpers_1.getDeletedAtField)(this.modelClass);
        const updatedAtField = (0, TimestampHelpers_1.getUpdatedAtField)(this.modelClass);
        const updateData = {
            [deletedAtField]: null
        };
        // Adicionar updated_at se tiver timestamps
        if (this.hasTimestamps()) {
            updateData[updatedAtField] = new Date();
        }
        // Construir query para atualizar mesmo registros deletados
        const keys = Object.keys(updateData);
        const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
        const values = keys.map(key => updateData[key]);
        const query = `
      UPDATE ${this.tableName}
      SET ${setClause}
      WHERE id = $${keys.length + 1}
      AND ${deletedAtField} IS NOT NULL
      RETURNING *
    `;
        const result = await this.orm.query(query, [...values, id]);
        return (result.rowCount || 0) > 0;
    }
    /**
     * Buscar apenas registros deletados (soft delete)
     * @param options Opções de consulta
     * @returns Lista de entidades deletadas
     */
    async findDeleted(options = {}) {
        if (!this.hasSoftDelete()) {
            throw new Error('Esta entidade não possui soft delete habilitado');
        }
        const deletedAtField = (0, TimestampHelpers_1.getDeletedAtField)(this.modelClass);
        const conditions = {
            ...options.conditions,
            [`${deletedAtField} IS NOT`]: null // deleted_at IS NOT NULL
        };
        // Usar ORM diretamente sem adicionar condição de soft delete
        const { conditions: _, ...paginationOptions } = this.formatQueryOptions({ ...options, conditions });
        // Query manual para buscar deletados
        const query = `
      SELECT * FROM ${this.tableName}
      WHERE ${deletedAtField} IS NOT NULL
      ${options.limit ? `LIMIT ${options.limit}` : ''}
      ${options.offset ? `OFFSET ${options.offset}` : ''}
    `;
        const result = await this.orm.query(query, []);
        return result.rows.map((row) => this.mapToModel(row));
    }
    /**
     * Buscar todos os registros incluindo deletados (soft delete)
     * @param options Opções de consulta
     * @returns Lista de todas as entidades (incluindo deletadas)
     */
    async findAllWithDeleted(options = {}) {
        // Não adicionar condição de soft delete
        const { conditions, ...paginationOptions } = this.formatQueryOptions(options);
        if (conditions && Object.keys(conditions).length > 0) {
            const results = await this.orm.findBy(this.tableName, conditions, paginationOptions);
            return results.map(result => this.mapToModel(result));
        }
        const results = await this.orm.findAll(this.tableName, paginationOptions);
        return results.map(result => this.mapToModel(result));
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