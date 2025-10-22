"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOFT_DELETE_METADATA_KEY = void 0;
exports.SoftDelete = SoftDelete;
exports.getSoftDeleteMetadata = getSoftDeleteMetadata;
require("reflect-metadata");
exports.SOFT_DELETE_METADATA_KEY = Symbol('soft-delete');
function SoftDelete(options) {
    const defaultOptions = {
        deletedAt: 'deleted_at'
    };
    const finalOptions = { ...defaultOptions, ...options };
    return function (target) {
        Reflect.defineMetadata(exports.SOFT_DELETE_METADATA_KEY, finalOptions, target);
    };
}
function getSoftDeleteMetadata(target) {
    return Reflect.getMetadata(exports.SOFT_DELETE_METADATA_KEY, target);
}
//# sourceMappingURL=SoftDelete.js.map