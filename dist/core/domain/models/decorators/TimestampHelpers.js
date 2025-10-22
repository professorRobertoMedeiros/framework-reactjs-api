"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasTimestamps = hasTimestamps;
exports.hasSoftDelete = hasSoftDelete;
exports.getCreatedAtField = getCreatedAtField;
exports.getUpdatedAtField = getUpdatedAtField;
exports.getDeletedAtField = getDeletedAtField;
const Timestamps_1 = require("./Timestamps");
const SoftDelete_1 = require("./SoftDelete");
// Função para verificar se uma classe tem o decorador Timestamps
function hasTimestamps(target) {
    return Reflect.getMetadata(Timestamps_1.TIMESTAMPS_METADATA_KEY, target) !== undefined;
}
// Função para verificar se uma classe tem o decorador SoftDelete
function hasSoftDelete(target) {
    return Reflect.getMetadata(SoftDelete_1.SOFT_DELETE_METADATA_KEY, target) !== undefined;
}
// Função para obter o nome do campo created_at
function getCreatedAtField(target) {
    const metadata = Reflect.getMetadata(Timestamps_1.TIMESTAMPS_METADATA_KEY, target);
    return metadata?.createdAt || 'created_at';
}
// Função para obter o nome do campo updated_at
function getUpdatedAtField(target) {
    const metadata = Reflect.getMetadata(Timestamps_1.TIMESTAMPS_METADATA_KEY, target);
    return metadata?.updatedAt || 'updated_at';
}
// Função para obter o nome do campo deleted_at
function getDeletedAtField(target) {
    const metadata = Reflect.getMetadata(SoftDelete_1.SOFT_DELETE_METADATA_KEY, target);
    return metadata?.deletedAt || 'deleted_at';
}
//# sourceMappingURL=TimestampHelpers.js.map