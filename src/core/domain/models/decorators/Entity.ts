import 'reflect-metadata';

export const ENTITY_METADATA_KEY = Symbol('entity');

export interface EntityOptions {
  tableName: string;
}

export function Entity(options: EntityOptions) {
  return function (target: Function) {
    Reflect.defineMetadata(ENTITY_METADATA_KEY, options, target);
  };
}

export function getEntityMetadata(target: Function): EntityOptions | undefined {
  return Reflect.getMetadata(ENTITY_METADATA_KEY, target);
}