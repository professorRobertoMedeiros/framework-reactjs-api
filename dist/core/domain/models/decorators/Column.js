"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COLUMN_METADATA_KEY = void 0;
exports.Column = Column;
exports.getColumnMetadata = getColumnMetadata;
require("reflect-metadata");
exports.COLUMN_METADATA_KEY = Symbol('column');
function Column(options) {
    const defaultOptions = {
        nullable: false,
        primary: false
    };
    const finalOptions = { ...defaultOptions, ...options };
    return function (target, propertyKey) {
        // Get existing columns or initialize new array
        const existingColumns = Reflect.getMetadata(exports.COLUMN_METADATA_KEY, target.constructor) || [];
        // Add current column
        existingColumns.push({
            property: propertyKey,
            options: finalOptions
        });
        // Update metadata
        Reflect.defineMetadata(exports.COLUMN_METADATA_KEY, existingColumns, target.constructor);
    };
}
function getColumnMetadata(target) {
    return Reflect.getMetadata(exports.COLUMN_METADATA_KEY, target) || [];
}
//# sourceMappingURL=Column.js.map