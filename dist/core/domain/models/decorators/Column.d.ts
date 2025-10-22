import 'reflect-metadata';
export declare const COLUMN_METADATA_KEY: unique symbol;
export interface ColumnOptions {
    name?: string;
    type?: string;
    primary?: boolean;
    nullable?: boolean;
}
export declare function Column(options?: ColumnOptions): (target: any, propertyKey: string) => void;
export declare function getColumnMetadata(target: Function): {
    property: string;
    options: ColumnOptions;
}[];
