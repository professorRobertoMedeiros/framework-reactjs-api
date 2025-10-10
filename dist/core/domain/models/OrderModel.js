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
exports.OrderModel = void 0;
const BaseModel_1 = require("./BaseModel");
let OrderModel = class OrderModel extends BaseModel_1.BaseModel {
};
exports.OrderModel = OrderModel;
__decorate([
    (0, BaseModel_1.Id)(),
    __metadata("design:type", Number)
], OrderModel.prototype, "id", void 0);
__decorate([
    (0, BaseModel_1.Column)({
        type: 'INT',
        nullable: false
    }),
    __metadata("design:type", Number)
], OrderModel.prototype, "customer_id", void 0);
__decorate([
    (0, BaseModel_1.Column)({
        type: 'INT',
        nullable: false
    }),
    __metadata("design:type", Number)
], OrderModel.prototype, "total_amount", void 0);
__decorate([
    (0, BaseModel_1.Column)({
        type: 'VARCHAR',
        nullable: false,
        length: 50
    }),
    __metadata("design:type", String)
], OrderModel.prototype, "status", void 0);
exports.OrderModel = OrderModel = __decorate([
    (0, BaseModel_1.Entity)('orders')
], OrderModel);
//# sourceMappingURL=OrderModel.js.map