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
exports.AuditLogModel = exports.AuditActionType = void 0;
const BaseModel_1 = require("./BaseModel");
/**
 * Tipos de ação para auditoria
 */
var AuditActionType;
(function (AuditActionType) {
    AuditActionType["CREATE"] = "CREATE";
    AuditActionType["UPDATE"] = "UPDATE";
    AuditActionType["DELETE"] = "DELETE";
})(AuditActionType || (exports.AuditActionType = AuditActionType = {}));
/**
 * Modelo para armazenar os registros de auditoria
 */
let AuditLogModel = class AuditLogModel extends BaseModel_1.BaseModel {
    /**
     * Converte o modelo para um objeto simples
     * @returns Objeto com os dados do modelo
     */
    toJSON() {
        return {
            id: this.id,
            tableName: this.tableName,
            recordId: this.recordId,
            columnName: this.columnName,
            actionType: this.actionType,
            oldValue: this.oldValue,
            newValue: this.newValue,
            userId: this.userId,
            userEmail: this.userEmail,
            createdAt: this.createdAt
        };
    }
};
exports.AuditLogModel = AuditLogModel;
__decorate([
    (0, BaseModel_1.Id)(),
    __metadata("design:type", Number)
], AuditLogModel.prototype, "id", void 0);
__decorate([
    (0, BaseModel_1.Column)({ type: 'VARCHAR', nullable: false }),
    __metadata("design:type", String)
], AuditLogModel.prototype, "tableName", void 0);
__decorate([
    (0, BaseModel_1.Column)({ type: 'INT', nullable: false }),
    __metadata("design:type", Number)
], AuditLogModel.prototype, "recordId", void 0);
__decorate([
    (0, BaseModel_1.Column)({ type: 'VARCHAR', nullable: false }),
    __metadata("design:type", String)
], AuditLogModel.prototype, "columnName", void 0);
__decorate([
    (0, BaseModel_1.Column)({ type: 'VARCHAR', nullable: false }),
    __metadata("design:type", String)
], AuditLogModel.prototype, "actionType", void 0);
__decorate([
    (0, BaseModel_1.Column)({ type: 'TEXT', nullable: true }),
    __metadata("design:type", String)
], AuditLogModel.prototype, "oldValue", void 0);
__decorate([
    (0, BaseModel_1.Column)({ type: 'TEXT', nullable: true }),
    __metadata("design:type", String)
], AuditLogModel.prototype, "newValue", void 0);
__decorate([
    (0, BaseModel_1.Column)({ type: 'INT', nullable: true }),
    __metadata("design:type", Number)
], AuditLogModel.prototype, "userId", void 0);
__decorate([
    (0, BaseModel_1.Column)({ type: 'VARCHAR', nullable: true }),
    __metadata("design:type", String)
], AuditLogModel.prototype, "userEmail", void 0);
__decorate([
    (0, BaseModel_1.Column)({ type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], AuditLogModel.prototype, "createdAt", void 0);
exports.AuditLogModel = AuditLogModel = __decorate([
    (0, BaseModel_1.Entity)('audit_logs')
], AuditLogModel);
//# sourceMappingURL=AuditLogModel.js.map