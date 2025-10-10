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
exports.ClienteModel = void 0;
const BaseModel_1 = require("./BaseModel");
let ClienteModel = class ClienteModel extends BaseModel_1.BaseModel {
    // Implementação requerida por BaseModel
    toJSON() {
        return {
            id: this.id,
            nome: this.nome,
            email: this.email,
            telefone: this.telefone,
            ativo: this.ativo,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
};
exports.ClienteModel = ClienteModel;
__decorate([
    (0, BaseModel_1.Id)(),
    __metadata("design:type", Number)
], ClienteModel.prototype, "id", void 0);
__decorate([
    (0, BaseModel_1.Column)({
        type: 'VARCHAR',
        nullable: false,
        length: 100
    }),
    __metadata("design:type", String)
], ClienteModel.prototype, "nome", void 0);
__decorate([
    (0, BaseModel_1.Column)({
        type: 'VARCHAR',
        nullable: false,
        length: 150
    }),
    __metadata("design:type", String)
], ClienteModel.prototype, "email", void 0);
__decorate([
    (0, BaseModel_1.Column)({
        type: 'VARCHAR',
        nullable: true,
        length: 20
    }),
    __metadata("design:type", String)
], ClienteModel.prototype, "telefone", void 0);
__decorate([
    (0, BaseModel_1.Column)({
        type: 'BOOLEAN',
        nullable: false,
        default: true
    }),
    __metadata("design:type", Boolean)
], ClienteModel.prototype, "ativo", void 0);
__decorate([
    (0, BaseModel_1.Column)({
        type: 'TIMESTAMP',
        nullable: false,
        default: 'CURRENT_TIMESTAMP'
    }),
    __metadata("design:type", Date)
], ClienteModel.prototype, "created_at", void 0);
__decorate([
    (0, BaseModel_1.Column)({
        type: 'TIMESTAMP',
        nullable: true
    }),
    __metadata("design:type", Date)
], ClienteModel.prototype, "updated_at", void 0);
exports.ClienteModel = ClienteModel = __decorate([
    (0, BaseModel_1.Entity)('clientes')
], ClienteModel);
//# sourceMappingURL=ClienteModel.js.map