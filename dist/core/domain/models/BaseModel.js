"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModel = exports.TIMESTAMPS_META_KEY = exports.SOFT_DELETE_META_KEY = exports.getDeletedAtField = exports.getUpdatedAtField = exports.getCreatedAtField = exports.hasSoftDelete = exports.hasTimestamps = exports.SoftDelete = exports.Timestamps = exports.BUSINESS_INDEX_META_KEY = exports.INDEX_META_KEY = exports.COLUMN_META_KEY = exports.ENTITY_META_KEY = void 0;
exports.Entity = Entity;
exports.Column = Column;
exports.ColumnStage2 = ColumnStage2;
exports.Id = Id;
exports.IdStage2 = IdStage2;
exports.UniqueIndex = UniqueIndex;
exports.BusinessIndex = BusinessIndex;
require("reflect-metadata");
// Símbolos para metadados
exports.ENTITY_META_KEY = Symbol('entity');
exports.COLUMN_META_KEY = Symbol('column');
exports.INDEX_META_KEY = Symbol('index');
exports.BUSINESS_INDEX_META_KEY = Symbol('businessIndex');
// Exportar decorators de timestamps e soft delete
var TimestampsDecorators_1 = require("../decorators/TimestampsDecorators");
Object.defineProperty(exports, "Timestamps", { enumerable: true, get: function () { return TimestampsDecorators_1.Timestamps; } });
Object.defineProperty(exports, "SoftDelete", { enumerable: true, get: function () { return TimestampsDecorators_1.SoftDelete; } });
Object.defineProperty(exports, "hasTimestamps", { enumerable: true, get: function () { return TimestampsDecorators_1.hasTimestamps; } });
Object.defineProperty(exports, "hasSoftDelete", { enumerable: true, get: function () { return TimestampsDecorators_1.hasSoftDelete; } });
Object.defineProperty(exports, "getCreatedAtField", { enumerable: true, get: function () { return TimestampsDecorators_1.getCreatedAtField; } });
Object.defineProperty(exports, "getUpdatedAtField", { enumerable: true, get: function () { return TimestampsDecorators_1.getUpdatedAtField; } });
Object.defineProperty(exports, "getDeletedAtField", { enumerable: true, get: function () { return TimestampsDecorators_1.getDeletedAtField; } });
Object.defineProperty(exports, "SOFT_DELETE_META_KEY", { enumerable: true, get: function () { return TimestampsDecorators_1.SOFT_DELETE_META_KEY; } });
Object.defineProperty(exports, "TIMESTAMPS_META_KEY", { enumerable: true, get: function () { return TimestampsDecorators_1.TIMESTAMPS_META_KEY; } });
// Decorador Entity
function Entity(tableName) {
    return function (constructor) {
        Reflect.defineMetadata(exports.ENTITY_META_KEY, { tableName }, constructor);
    };
}
// Decorador Column (versão original)
function Column(options) {
    return function (target, propertyKey) {
        const existingColumns = Reflect.getMetadata(exports.COLUMN_META_KEY, target.constructor) || {};
        existingColumns[propertyKey] = options;
        Reflect.defineMetadata(exports.COLUMN_META_KEY, existingColumns, target.constructor);
    };
}
// Decorador Column compatível com TypeScript 5.0+
function ColumnStage2(optionsOrTarget, contextOrPropertyKey) {
    // Se for chamado como factory de decorador (@Column({...}))
    if (typeof optionsOrTarget === 'object' && !contextOrPropertyKey) {
        const options = optionsOrTarget;
        return function (target, context) {
            const propertyKey = context.name;
            const existingColumns = Reflect.getMetadata(exports.COLUMN_META_KEY, target.constructor) || {};
            existingColumns[propertyKey] = options;
            Reflect.defineMetadata(exports.COLUMN_META_KEY, existingColumns, target.constructor);
        };
    }
    // Nunca deve chegar aqui pois Column sempre precisa de opções
    throw new Error('Column decorator requires options');
}
// Decorador Id (alias para Column com primaryKey = true)
function Id() {
    return function (target, propertyKey) {
        const options = { type: 'SERIAL', primaryKey: true };
        return Column(options)(target, propertyKey);
    };
}
// Decoradores para TypeScript 5.0+
// Estas versões funcionam tanto com @Decorator quanto com @Decorator()
// Nova versão do decorador Id compatível com TypeScript 5.0+
function IdStage2(targetOrOptions, contextOrPropertyKey) {
    // Se for chamado como factory de decorador (@Id())
    if (typeof contextOrPropertyKey === 'undefined') {
        return (target, context) => {
            const options = { type: 'SERIAL', primaryKey: true };
            const propertyKey = context.name;
            const existingColumns = Reflect.getMetadata(exports.COLUMN_META_KEY, target.constructor) || {};
            existingColumns[propertyKey] = options;
            Reflect.defineMetadata(exports.COLUMN_META_KEY, existingColumns, target.constructor);
        };
    }
    // Se for chamado diretamente como decorador (@Id)
    const target = targetOrOptions;
    const context = contextOrPropertyKey;
    const options = { type: 'SERIAL', primaryKey: true };
    const propertyKey = context.name;
    const existingColumns = Reflect.getMetadata(exports.COLUMN_META_KEY, target.constructor) || {};
    existingColumns[propertyKey] = options;
    Reflect.defineMetadata(exports.COLUMN_META_KEY, existingColumns, target.constructor);
}
// Decorador UniqueIndex
function UniqueIndex(indexName, columns) {
    return function (constructor) {
        const existingIndices = Reflect.getMetadata(exports.INDEX_META_KEY, constructor) || [];
        existingIndices.push({ name: indexName, columns, type: 'UNIQUE' });
        Reflect.defineMetadata(exports.INDEX_META_KEY, existingIndices, constructor);
    };
}
// Decorador BusinessIndex
function BusinessIndex(indexName, columns, type) {
    return function (constructor) {
        const existingBusinessIndices = Reflect.getMetadata(exports.BUSINESS_INDEX_META_KEY, constructor) || [];
        existingBusinessIndices.push({ name: indexName, columns, type });
        Reflect.defineMetadata(exports.BUSINESS_INDEX_META_KEY, existingBusinessIndices, constructor);
    };
}
// Classe base para todos os modelos
class BaseModel {
    // Método auxiliar para obter o nome da tabela
    static getTableName() {
        const metadata = Reflect.getMetadata(exports.ENTITY_META_KEY, this);
        return metadata ? metadata.tableName : '';
    }
    // Método auxiliar para obter todas as colunas
    static getColumns() {
        return Reflect.getMetadata(exports.COLUMN_META_KEY, this) || {};
    }
    // Método auxiliar para obter todos os índices
    static getIndices() {
        return Reflect.getMetadata(exports.INDEX_META_KEY, this) || [];
    }
    // Método auxiliar para obter todos os índices de negócio
    static getBusinessIndices() {
        return Reflect.getMetadata(exports.BUSINESS_INDEX_META_KEY, this) || [];
    }
    // Método para transformar a entidade em objeto para persistência
    toJSON() {
        const columns = this.constructor.getColumns();
        const result = {};
        for (const key of Object.keys(columns)) {
            if (key in this) {
                result[key] = this[key];
            }
        }
        return result;
    }
}
exports.BaseModel = BaseModel;
//# sourceMappingURL=BaseModel.js.map