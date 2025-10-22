import 'reflect-metadata';
import { EntityOptions as EntityOpts } from './decorators/Entity';
export declare const ENTITY_META_KEY: symbol;
export declare const COLUMN_META_KEY: unique symbol;
export declare const INDEX_META_KEY: unique symbol;
export declare const BUSINESS_INDEX_META_KEY: unique symbol;
export type EntityOptions = EntityOpts;
import { Timestamps, TIMESTAMPS_METADATA_KEY, TimestampsOptions } from './decorators/Timestamps';
import { SoftDelete, SOFT_DELETE_METADATA_KEY, SoftDeleteOptions } from './decorators/SoftDelete';
export { Timestamps, TimestampsOptions, SoftDelete, SoftDeleteOptions, TIMESTAMPS_METADATA_KEY, SOFT_DELETE_METADATA_KEY };
export interface ColumnOptions {
    type: 'SERIAL' | 'VARCHAR' | 'INT' | 'BOOLEAN' | 'TIMESTAMP' | 'TEXT' | 'JSONB';
    primaryKey?: boolean;
    nullable?: boolean;
    default?: any;
    length?: number;
}
export interface IndexOptions {
    name: string;
    columns: string[];
    type?: 'UNIQUE' | 'INDEX' | 'FULLTEXT';
}
export declare function Entity(tableNameOrOptions: string | EntityOptions): (constructor: Function) => void;
export declare function Column(options: ColumnOptions): (target: any, propertyKey: string) => void;
export declare function ColumnStage2(optionsOrTarget: ColumnOptions | any, contextOrPropertyKey?: ClassFieldDecoratorContext | any): (target: any, context: ClassFieldDecoratorContext) => void;
export declare function Id(): (target: any, propertyKey: string) => void;
export declare function IdStage2(targetOrOptions?: any, contextOrPropertyKey?: any): ((target: any, context: ClassFieldDecoratorContext) => void) | undefined;
export declare function UniqueIndex(indexName: string, columns: string[]): (constructor: Function) => void;
export declare function BusinessIndex(indexName: string, columns: string[], type: 'INDEX' | 'FULLTEXT'): (constructor: Function) => void;
export declare abstract class BaseModel {
    static getTableName(): string;
    static getColumns(): Record<string, ColumnOptions>;
    static getIndices(): IndexOptions[];
    static getBusinessIndices(): IndexOptions[];
    toJSON(): Record<string, any>;
}
