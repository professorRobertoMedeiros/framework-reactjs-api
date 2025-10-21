import 'reflect-metadata';

// Símbolos para metadados de timestamps e soft delete
export const SOFT_DELETE_META_KEY = Symbol('softDelete');
export const TIMESTAMPS_META_KEY = Symbol('timestamps');

/**
 * Interface para opções de timestamps
 */
export interface TimestampsOptions {
  createdAt?: string;  // Nome do campo (padrão: 'created_at')
  updatedAt?: string;  // Nome do campo (padrão: 'updated_at')
}

/**
 * Interface para opções de soft delete
 */
export interface SoftDeleteOptions {
  deletedAt?: string;  // Nome do campo (padrão: 'deleted_at')
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
export function Timestamps(options?: TimestampsOptions) {
  return function (constructor: Function) {
    const config: TimestampsOptions = {
      createdAt: options?.createdAt || 'created_at',
      updatedAt: options?.updatedAt || 'updated_at'
    };
    
    Reflect.defineMetadata(TIMESTAMPS_META_KEY, config, constructor);
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
export function SoftDelete(options?: SoftDeleteOptions) {
  return function (constructor: Function) {
    const config: SoftDeleteOptions = {
      deletedAt: options?.deletedAt || 'deleted_at'
    };
    
    Reflect.defineMetadata(SOFT_DELETE_META_KEY, config, constructor);
  };
}

/**
 * Verifica se a entidade tem timestamps habilitados
 * 
 * @param target Classe da entidade
 * @returns Configuração de timestamps ou undefined
 */
export function hasTimestamps(target: Function): TimestampsOptions | undefined {
  return Reflect.getMetadata(TIMESTAMPS_META_KEY, target);
}

/**
 * Verifica se a entidade tem soft delete habilitado
 * 
 * @param target Classe da entidade
 * @returns Configuração de soft delete ou undefined
 */
export function hasSoftDelete(target: Function): SoftDeleteOptions | undefined {
  return Reflect.getMetadata(SOFT_DELETE_META_KEY, target);
}

/**
 * Obtém o nome do campo de created_at
 * 
 * @param target Classe da entidade
 * @returns Nome do campo ou 'created_at' como padrão
 */
export function getCreatedAtField(target: Function): string {
  const config = hasTimestamps(target);
  return config?.createdAt || 'created_at';
}

/**
 * Obtém o nome do campo de updated_at
 * 
 * @param target Classe da entidade
 * @returns Nome do campo ou 'updated_at' como padrão
 */
export function getUpdatedAtField(target: Function): string {
  const config = hasTimestamps(target);
  return config?.updatedAt || 'updated_at';
}

/**
 * Obtém o nome do campo de deleted_at
 * 
 * @param target Classe da entidade
 * @returns Nome do campo ou 'deleted_at' como padrão
 */
export function getDeletedAtField(target: Function): string {
  const config = hasSoftDelete(target);
  return config?.deletedAt || 'deleted_at';
}
