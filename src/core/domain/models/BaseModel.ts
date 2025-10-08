import 'reflect-metadata';

// Símbolos para metadados
export const ENTITY_META_KEY = Symbol('entity');
export const COLUMN_META_KEY = Symbol('column');
export const INDEX_META_KEY = Symbol('index');
export const BUSINESS_INDEX_META_KEY = Symbol('businessIndex');

// Interface para opções de coluna
export interface ColumnOptions {
  type: 'SERIAL' | 'VARCHAR' | 'INT' | 'BOOLEAN' | 'TIMESTAMP' | 'TEXT' | 'JSONB';
  primaryKey?: boolean;
  nullable?: boolean;
  default?: any;
  length?: number;
}

// Interface para índices
export interface IndexOptions {
  name: string;
  columns: string[];
  type?: 'UNIQUE' | 'INDEX' | 'FULLTEXT';
}

// Decorador Entity
export function Entity(tableName: string) {
  return function (constructor: Function) {
    Reflect.defineMetadata(ENTITY_META_KEY, { tableName }, constructor);
  };
}

// Decorador Column (versão original)
export function Column(options: ColumnOptions) {
  return function (target: any, propertyKey: string) {
    const existingColumns = Reflect.getMetadata(COLUMN_META_KEY, target.constructor) || {};
    existingColumns[propertyKey] = options;
    Reflect.defineMetadata(COLUMN_META_KEY, existingColumns, target.constructor);
  };
}

// Decorador Column compatível com TypeScript 5.0+
export function ColumnStage2(options: ColumnOptions) {
  return function(target: any, context: ClassFieldDecoratorContext) {
    const propertyKey = context.name as string;
    const existingColumns = Reflect.getMetadata(COLUMN_META_KEY, target.constructor) || {};
    existingColumns[propertyKey] = options;
    Reflect.defineMetadata(COLUMN_META_KEY, existingColumns, target.constructor);
  };
}

// Decorador Id (alias para Column com primaryKey = true)
export function Id() {
  return function(target: any, propertyKey: string) {
    const options: ColumnOptions = { type: 'SERIAL', primaryKey: true };
    return Column(options)(target, propertyKey);
  };
}

// Nova versão do decorador Id compatível com TypeScript 5.0+
export function IdStage2(target: any, context: ClassFieldDecoratorContext) {
  const options: ColumnOptions = { type: 'SERIAL', primaryKey: true };
  const propertyKey = context.name as string;
  
  // Aplicar o decorador de coluna
  const existingColumns = Reflect.getMetadata(COLUMN_META_KEY, target.constructor) || {};
  existingColumns[propertyKey] = options;
  Reflect.defineMetadata(COLUMN_META_KEY, existingColumns, target.constructor);
}

// Decorador UniqueIndex
export function UniqueIndex(indexName: string, columns: string[]) {
  return function (constructor: Function) {
    const existingIndices = Reflect.getMetadata(INDEX_META_KEY, constructor) || [];
    existingIndices.push({ name: indexName, columns, type: 'UNIQUE' });
    Reflect.defineMetadata(INDEX_META_KEY, existingIndices, constructor);
  };
}

// Decorador BusinessIndex
export function BusinessIndex(indexName: string, columns: string[], type: 'INDEX' | 'FULLTEXT') {
  return function (constructor: Function) {
    const existingBusinessIndices = Reflect.getMetadata(BUSINESS_INDEX_META_KEY, constructor) || [];
    existingBusinessIndices.push({ name: indexName, columns, type });
    Reflect.defineMetadata(BUSINESS_INDEX_META_KEY, existingBusinessIndices, constructor);
  };
}

// Classe base para todos os modelos
export abstract class BaseModel {
  // Método auxiliar para obter o nome da tabela
  static getTableName(): string {
    const metadata = Reflect.getMetadata(ENTITY_META_KEY, this);
    return metadata ? metadata.tableName : '';
  }

  // Método auxiliar para obter todas as colunas
  static getColumns(): Record<string, ColumnOptions> {
    return Reflect.getMetadata(COLUMN_META_KEY, this) || {};
  }

  // Método auxiliar para obter todos os índices
  static getIndices(): IndexOptions[] {
    return Reflect.getMetadata(INDEX_META_KEY, this) || [];
  }

  // Método auxiliar para obter todos os índices de negócio
  static getBusinessIndices(): IndexOptions[] {
    return Reflect.getMetadata(BUSINESS_INDEX_META_KEY, this) || [];
  }

  // Método para transformar a entidade em objeto para persistência
  toJSON(): Record<string, any> {
    const columns = (this.constructor as typeof BaseModel).getColumns();
    const result: Record<string, any> = {};

    for (const key of Object.keys(columns)) {
      if (key in this) {
        result[key] = (this as any)[key];
      }
    }

    return result;
  }
}