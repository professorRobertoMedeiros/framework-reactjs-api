import 'reflect-metadata';
export declare const ENTITY_METADATA_KEY: unique symbol;
export interface EntityOptions {
    tableName: string;
}
export declare function Entity(options: EntityOptions): (target: Function) => void;
export declare function getEntityMetadata(target: Function): EntityOptions | undefined;
