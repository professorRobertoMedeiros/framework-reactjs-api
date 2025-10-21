"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
// Teste para verificar os metadados dos decoradores Timestamps e SoftDelete
require("reflect-metadata");
const BaseModel_1 = require("../core/domain/models/BaseModel");
const TimestampsDecorators_1 = require("../core/domain/decorators/TimestampsDecorators");
// Modelo de teste
let TestModel = class TestModel extends BaseModel_1.BaseModel {
};
__decorate([
    (0, BaseModel_1.Id)(),
    __metadata("design:type", Number)
], TestModel.prototype, "id", void 0);
__decorate([
    (0, BaseModel_1.Column)({ type: 'VARCHAR', nullable: false }),
    __metadata("design:type", String)
], TestModel.prototype, "name", void 0);
TestModel = __decorate([
    (0, BaseModel_1.Entity)('test_table'),
    (0, TimestampsDecorators_1.Timestamps)(),
    (0, TimestampsDecorators_1.SoftDelete)()
], TestModel);
// Verificar metadados
console.log('=== Teste de Metadados para Timestamps e SoftDelete ===');
console.log('TIMESTAMPS_META_KEY:', String(TimestampsDecorators_1.TIMESTAMPS_META_KEY));
console.log('SOFT_DELETE_META_KEY:', String(TimestampsDecorators_1.SOFT_DELETE_META_KEY));
// Verificar se os metadados estão sendo definidos corretamente
const timestampsMetadata = Reflect.getMetadata(TimestampsDecorators_1.TIMESTAMPS_META_KEY, TestModel);
const softDeleteMetadata = Reflect.getMetadata(TimestampsDecorators_1.SOFT_DELETE_META_KEY, TestModel);
console.log('Metadados de Timestamps:', timestampsMetadata);
console.log('Metadados de SoftDelete:', softDeleteMetadata);
// Verificar todas as chaves de metadados disponíveis
console.log('Todas as chaves de metadados:', Reflect.getMetadataKeys(TestModel).map(String));
//# sourceMappingURL=timestamps-metadata-test.js.map