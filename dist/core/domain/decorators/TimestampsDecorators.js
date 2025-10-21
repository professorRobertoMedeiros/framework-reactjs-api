"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TIMESTAMPS_META_KEY = exports.SOFT_DELETE_META_KEY = void 0;
exports.Timestamps = Timestamps;
exports.SoftDelete = SoftDelete;
exports.hasTimestamps = hasTimestamps;
exports.hasSoftDelete = hasSoftDelete;
exports.getCreatedAtField = getCreatedAtField;
exports.getUpdatedAtField = getUpdatedAtField;
exports.getDeletedAtField = getDeletedAtField;
require("reflect-metadata");
// Símbolos para metadados de timestamps e soft delete
exports.SOFT_DELETE_META_KEY = Symbol('softDelete');
exports.TIMESTAMPS_META_KEY = Symbol('timestamps');
/**
 * Decorator para habilitar timestamps automáticos (created_at e updated_at)
 *
 * Aplica-se na classe da entidade.
 *
 * @param options Opções de configuração (opcional)
 *
 * @example
 * ```typescript
 * @Entity('users')
 * @Timestamps()
 * export class UserModel extends BaseModel {
 *   // ...
 * }
 * ```
 *
 * @example Com nomes customizados
 * ```typescript
 * @Timestamps({ createdAt: 'criado_em', updatedAt: 'atualizado_em' })
 * export class UserModel extends BaseModel {
 *   // ...
 * }
 * ```
 */
function Timestamps(options) {
    return function (constructor) {
        const config = {
            createdAt: options?.createdAt || 'created_at',
            updatedAt: options?.updatedAt || 'updated_at'
        };
        Reflect.defineMetadata(exports.TIMESTAMPS_META_KEY, config, constructor);
    };
}
/**
 * Decorator para habilitar soft delete (deleted_at)
 *
 * Aplica-se na classe da entidade.
 * Quando habilitado, os registros não serão deletados fisicamente,
 * apenas marcados com a data de exclusão.
 *
 * @param options Opções de configuração (opcional)
 *
 * @example
 * ```typescript
 * @Entity('users')
 * @SoftDelete()
 * export class UserModel extends BaseModel {
 *   // ...
 * }
 * ```
 *
 * @example Com nome customizado
 * ```typescript
 * @SoftDelete({ deletedAt: 'excluido_em' })
 * export class UserModel extends BaseModel {
 *   // ...
 * }
 * ```
 */
function SoftDelete(options) {
    return function (constructor) {
        const config = {
            deletedAt: options?.deletedAt || 'deleted_at'
        };
        Reflect.defineMetadata(exports.SOFT_DELETE_META_KEY, config, constructor);
    };
}
/**
 * Verifica se a entidade tem timestamps habilitados
 *
 * @param target Classe da entidade
 * @returns Configuração de timestamps ou undefined
 */
function hasTimestamps(target) {
    return Reflect.getMetadata(exports.TIMESTAMPS_META_KEY, target);
}
/**
 * Verifica se a entidade tem soft delete habilitado
 *
 * @param target Classe da entidade
 * @returns Configuração de soft delete ou undefined
 */
function hasSoftDelete(target) {
    return Reflect.getMetadata(exports.SOFT_DELETE_META_KEY, target);
}
/**
 * Obtém o nome do campo de created_at
 *
 * @param target Classe da entidade
 * @returns Nome do campo ou 'created_at' como padrão
 */
function getCreatedAtField(target) {
    const config = hasTimestamps(target);
    return config?.createdAt || 'created_at';
}
/**
 * Obtém o nome do campo de updated_at
 *
 * @param target Classe da entidade
 * @returns Nome do campo ou 'updated_at' como padrão
 */
function getUpdatedAtField(target) {
    const config = hasTimestamps(target);
    return config?.updatedAt || 'updated_at';
}
/**
 * Obtém o nome do campo de deleted_at
 *
 * @param target Classe da entidade
 * @returns Nome do campo ou 'deleted_at' como padrão
 */
function getDeletedAtField(target) {
    const config = hasSoftDelete(target);
    return config?.deletedAt || 'deleted_at';
}
//# sourceMappingURL=TimestampsDecorators.js.map