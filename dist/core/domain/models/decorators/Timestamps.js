"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TIMESTAMPS_METADATA_KEY = void 0;
exports.Timestamps = Timestamps;
exports.getTimestampsMetadata = getTimestampsMetadata;
require("reflect-metadata");
exports.TIMESTAMPS_METADATA_KEY = Symbol('timestamps');
function Timestamps(options) {
    const defaultOptions = {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    };
    const finalOptions = { ...defaultOptions, ...options };
    return function (target) {
        Reflect.defineMetadata(exports.TIMESTAMPS_METADATA_KEY, finalOptions, target);
    };
}
function getTimestampsMetadata(target) {
    return Reflect.getMetadata(exports.TIMESTAMPS_METADATA_KEY, target);
}
//# sourceMappingURL=Timestamps.js.map