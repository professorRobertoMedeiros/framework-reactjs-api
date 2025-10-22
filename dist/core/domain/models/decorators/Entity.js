"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENTITY_METADATA_KEY = void 0;
exports.Entity = Entity;
exports.getEntityMetadata = getEntityMetadata;
require("reflect-metadata");
exports.ENTITY_METADATA_KEY = Symbol('entity');
function Entity(options) {
    return function (target) {
        Reflect.defineMetadata(exports.ENTITY_METADATA_KEY, options, target);
    };
}
function getEntityMetadata(target) {
    return Reflect.getMetadata(exports.ENTITY_METADATA_KEY, target);
}
//# sourceMappingURL=Entity.js.map