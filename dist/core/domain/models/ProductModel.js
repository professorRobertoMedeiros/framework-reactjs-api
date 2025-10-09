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
exports.ProductModel = void 0;
const BaseModel_1 = require("./BaseModel");
let ProductModel = class ProductModel extends BaseModel_1.BaseModel {
    // Implementação requerida por BaseModel
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            price: this.price,
            stock: this.stock,
            active: this.active,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
};
exports.ProductModel = ProductModel;
__decorate([
    (0, BaseModel_1.Id)(),
    __metadata("design:type", Number)
], ProductModel.prototype, "id", void 0);
__decorate([
    (0, BaseModel_1.Column)({
        type: 'VARCHAR',
        nullable: false,
        length: 255
    }),
    __metadata("design:type", String)
], ProductModel.prototype, "name", void 0);
__decorate([
    (0, BaseModel_1.Column)({
        type: 'TEXT',
        nullable: true
    }),
    __metadata("design:type", String)
], ProductModel.prototype, "description", void 0);
__decorate([
    (0, BaseModel_1.Column)({
        type: 'INT',
        nullable: false
    }),
    __metadata("design:type", Number)
], ProductModel.prototype, "price", void 0);
__decorate([
    (0, BaseModel_1.Column)({
        type: 'INT',
        nullable: false,
        default: 0
    }),
    __metadata("design:type", Number)
], ProductModel.prototype, "stock", void 0);
__decorate([
    (0, BaseModel_1.Column)({
        type: 'BOOLEAN',
        nullable: false,
        default: true
    }),
    __metadata("design:type", Boolean)
], ProductModel.prototype, "active", void 0);
__decorate([
    (0, BaseModel_1.Column)({
        type: 'TIMESTAMP',
        nullable: false,
        default: 'CURRENT_TIMESTAMP'
    }),
    __metadata("design:type", Date)
], ProductModel.prototype, "created_at", void 0);
__decorate([
    (0, BaseModel_1.Column)({
        type: 'TIMESTAMP',
        nullable: true
    }),
    __metadata("design:type", Date)
], ProductModel.prototype, "updated_at", void 0);
exports.ProductModel = ProductModel = __decorate([
    (0, BaseModel_1.Entity)('products')
], ProductModel);
//# sourceMappingURL=ProductModel.js.map