import 'reflect-metadata';
export declare const SOFT_DELETE_META_KEY: unique symbol;
export declare const TIMESTAMPS_META_KEY: unique symbol;
/**
 * Interface para opções de timestamps
 */
export interface TimestampsOptions {
    createdAt?: string;
    updatedAt?: string;
}
/**
 * Interface para opções de soft delete
 */
export interface SoftDeleteOptions {
    deletedAt?: string;
}
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
export declare function Timestamps(options?: TimestampsOptions): (constructor: Function) => void;
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
export declare function SoftDelete(options?: SoftDeleteOptions): (constructor: Function) => void;
/**
 * Verifica se a entidade tem timestamps habilitados
 *
 * @param target Classe da entidade
 * @returns Configuração de timestamps ou undefined
 */
export declare function hasTimestamps(target: Function): TimestampsOptions | undefined;
/**
 * Verifica se a entidade tem soft delete habilitado
 *
 * @param target Classe da entidade
 * @returns Configuração de soft delete ou undefined
 */
export declare function hasSoftDelete(target: Function): SoftDeleteOptions | undefined;
/**
 * Obtém o nome do campo de created_at
 *
 * @param target Classe da entidade
 * @returns Nome do campo ou 'created_at' como padrão
 */
export declare function getCreatedAtField(target: Function): string;
/**
 * Obtém o nome do campo de updated_at
 *
 * @param target Classe da entidade
 * @returns Nome do campo ou 'updated_at' como padrão
 */
export declare function getUpdatedAtField(target: Function): string;
/**
 * Obtém o nome do campo de deleted_at
 *
 * @param target Classe da entidade
 * @returns Nome do campo ou 'deleted_at' como padrão
 */
export declare function getDeletedAtField(target: Function): string;
