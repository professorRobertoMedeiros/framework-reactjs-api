import 'reflect-metadata';

export const COLUMN_METADATA_KEY = Symbol('column');

export interface ColumnOptions {
    name?: string;
    type?: string;
    primary?: boolean;
    nullable?: boolean;
}

export function Column(options?: ColumnOptions) {
    const defaultOptions: ColumnOptions = {
        nullable: false,
        primary: false
    };

    const finalOptions = { ...defaultOptions, ...options };

    return function (target: any, propertyKey: string) {
        // Get existing columns or initialize new array
        const existingColumns: { property: string, options: ColumnOptions }[] = 
            Reflect.getMetadata(COLUMN_METADATA_KEY, target.constructor) || [];
        
        // Add current column
        existingColumns.push({
            property: propertyKey,
            options: finalOptions
        });
        
        // Update metadata
        Reflect.defineMetadata(COLUMN_METADATA_KEY, existingColumns, target.constructor);
    };
}

export function getColumnMetadata(target: Function): { property: string, options: ColumnOptions }[] {
    return Reflect.getMetadata(COLUMN_METADATA_KEY, target) || [];
}