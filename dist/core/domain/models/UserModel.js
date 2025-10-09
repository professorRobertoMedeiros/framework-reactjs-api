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
var UserModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const BaseModel_1 = require("./BaseModel");
let UserModel = UserModel_1 = class UserModel extends BaseModel_1.BaseModel {
    // Método de validação de exemplo
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    // Factory method para criar uma nova instância
    static create(data) {
        if (!this.validateEmail(data.email)) {
            throw new Error('Email inválido');
        }
        const user = new UserModel_1();
        user.first_name = data.first_name;
        user.last_name = data.last_name;
        user.email = data.email;
        user.password_hash = data.password_hash;
        user.active = true;
        user.created_at = new Date();
        return user;
    }
};
exports.UserModel = UserModel;
__decorate([
    (0, BaseModel_1.Id)(),
    __metadata("design:type", Number)
], UserModel.prototype, "id", void 0);
__decorate([
    (0, BaseModel_1.Column)({
        type: 'VARCHAR',
        nullable: false,
        length: 100
    }),
    __metadata("design:type", String)
], UserModel.prototype, "first_name", void 0);
__decorate([
    (0, BaseModel_1.Column)({
        type: 'VARCHAR',
        nullable: false,
        length: 100
    }),
    __metadata("design:type", String)
], UserModel.prototype, "last_name", void 0);
__decorate([
    (0, BaseModel_1.Column)({
        type: 'VARCHAR',
        nullable: false,
        length: 255
    }),
    __metadata("design:type", String)
], UserModel.prototype, "email", void 0);
__decorate([
    (0, BaseModel_1.Column)({
        type: 'VARCHAR',
        nullable: false,
        length: 255
    }),
    __metadata("design:type", String)
], UserModel.prototype, "password_hash", void 0);
__decorate([
    (0, BaseModel_1.Column)({
        type: 'BOOLEAN',
        nullable: false,
        default: true
    }),
    __metadata("design:type", Boolean)
], UserModel.prototype, "active", void 0);
__decorate([
    (0, BaseModel_1.Column)({
        type: 'TIMESTAMP',
        nullable: false,
        default: 'CURRENT_TIMESTAMP'
    }),
    __metadata("design:type", Date)
], UserModel.prototype, "created_at", void 0);
__decorate([
    (0, BaseModel_1.Column)({
        type: 'TIMESTAMP',
        nullable: true
    }),
    __metadata("design:type", Date)
], UserModel.prototype, "updated_at", void 0);
exports.UserModel = UserModel = UserModel_1 = __decorate([
    (0, BaseModel_1.Entity)('users'),
    (0, BaseModel_1.UniqueIndex)('idx_users_email', ['email']),
    (0, BaseModel_1.BusinessIndex)('idx_users_name', ['first_name', 'last_name'], 'INDEX')
], UserModel);
//# sourceMappingURL=UserModel.js.map