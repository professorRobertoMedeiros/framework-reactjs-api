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
exports.ProdutoModel = void 0;
const BaseModel_1 = require("./BaseModel");
const AuditableDecorator_1 = require("../decorators/AuditableDecorator");
/**
 * Modelo de exemplo com colunas auditáveis
 */
let ProdutoModel = class ProdutoModel extends BaseModel_1.BaseModel {
    /**
     * Converte o modelo para um objeto simples
     * @returns Objeto com os dados do modelo
     */
    toJSON() {
        return {
            id: this.id,
            nome: this.nome,
            descricao: this.descricao,
            preco: this.preco,
            estoque: this.estoque,
            ativo: this.ativo,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
};
exports.ProdutoModel = ProdutoModel;
__decorate([
    (0, BaseModel_1.Id)(),
    __metadata("design:type", Number)
], ProdutoModel.prototype, "id", void 0);
__decorate([
    (0, BaseModel_1.Column)({ type: 'VARCHAR', nullable: false }),
    (0, AuditableDecorator_1.Auditable)() // Auditar em todas as operações (create, update, delete)
    ,
    __metadata("design:type", String)
], ProdutoModel.prototype, "nome", void 0);
__decorate([
    (0, BaseModel_1.Column)({ type: 'TEXT', nullable: true }),
    (0, AuditableDecorator_1.Auditable)({ onCreate: true, onUpdate: true, onDelete: false }) // Não auditar na deleção
    ,
    __metadata("design:type", String)
], ProdutoModel.prototype, "descricao", void 0);
__decorate([
    (0, BaseModel_1.Column)({ type: 'INT', nullable: false }),
    (0, AuditableDecorator_1.Auditable)({ onCreate: false, onUpdate: true, onDelete: true }) // Não auditar na criação
    ,
    __metadata("design:type", Number)
], ProdutoModel.prototype, "preco", void 0);
__decorate([
    (0, BaseModel_1.Column)({ type: 'INT', nullable: false, default: 0 }),
    (0, AuditableDecorator_1.Auditable)({ onCreate: false, onUpdate: false, onDelete: false }) // Não auditar
    ,
    __metadata("design:type", Number)
], ProdutoModel.prototype, "estoque", void 0);
__decorate([
    (0, BaseModel_1.Column)({ type: 'BOOLEAN', nullable: false, default: true }),
    (0, AuditableDecorator_1.Auditable)() // Auditar em todas as operações
    ,
    __metadata("design:type", Boolean)
], ProdutoModel.prototype, "ativo", void 0);
__decorate([
    (0, BaseModel_1.Column)({ type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], ProdutoModel.prototype, "createdAt", void 0);
__decorate([
    (0, BaseModel_1.Column)({ type: 'TIMESTAMP', nullable: true }),
    __metadata("design:type", Date)
], ProdutoModel.prototype, "updatedAt", void 0);
exports.ProdutoModel = ProdutoModel = __decorate([
    (0, BaseModel_1.Entity)('produtos')
], ProdutoModel);
//# sourceMappingURL=ProdutoModel.js.map