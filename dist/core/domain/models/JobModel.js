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
exports.JobModel = exports.JobStatus = void 0;
const BaseModel_1 = require("./BaseModel");
const BaseModel_2 = require("./BaseModel");
/**
 * Status de execução de um job
 */
var JobStatus;
(function (JobStatus) {
    JobStatus["SUCCESS"] = "success";
    JobStatus["ERROR"] = "error";
    JobStatus["TIMEOUT"] = "timeout";
    JobStatus["RUNNING"] = "running";
    JobStatus["PENDING"] = "pending";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
/**
 * Modelo para jobs agendados
 * Representa um job que será executado periodicamente
 */
let JobModel = class JobModel extends BaseModel_1.BaseModel {
    /**
     * Verifica se o job está pronto para executar
     */
    isReadyToRun() {
        if (!this.enabled)
            return false;
        if (!this.next_run_at)
            return true; // Primeira execução
        if (this.last_run_status === JobStatus.RUNNING)
            return false;
        return new Date() >= new Date(this.next_run_at);
    }
    /**
     * Verifica se o job está atualmente em execução
     */
    isRunning() {
        return this.last_run_status === JobStatus.RUNNING;
    }
    /**
     * Calcula a taxa de sucesso do job
     */
    getSuccessRate() {
        if (this.run_count === 0)
            return 0;
        return (this.success_count / this.run_count) * 100;
    }
    /**
     * Retorna uma descrição legível do schedule
     */
    getScheduleDescription() {
        const parts = this.schedule.split(' ');
        if (parts.length !== 5)
            return this.schedule;
        const [minute, hour, day, month, weekday] = parts;
        // Casos comuns
        if (this.schedule === '* * * * *')
            return 'A cada minuto';
        if (this.schedule === '*/5 * * * *')
            return 'A cada 5 minutos';
        if (this.schedule === '0 * * * *')
            return 'A cada hora';
        if (this.schedule === '0 */2 * * *')
            return 'A cada 2 horas';
        if (this.schedule === '0 0 * * *')
            return 'Diariamente à meia-noite';
        if (this.schedule === '0 12 * * *')
            return 'Diariamente ao meio-dia';
        if (this.schedule === '0 0 * * 0')
            return 'Semanalmente aos domingos';
        if (this.schedule === '0 0 1 * *')
            return 'Mensalmente no dia 1';
        return this.schedule;
    }
};
exports.JobModel = JobModel;
__decorate([
    (0, BaseModel_2.Id)(),
    __metadata("design:type", Number)
], JobModel.prototype, "id", void 0);
__decorate([
    (0, BaseModel_2.Column)({ type: 'VARCHAR', length: 255, nullable: false }),
    __metadata("design:type", String)
], JobModel.prototype, "name", void 0);
__decorate([
    (0, BaseModel_2.Column)({ type: 'TEXT', nullable: true }),
    __metadata("design:type", String)
], JobModel.prototype, "description", void 0);
__decorate([
    (0, BaseModel_2.Column)({ type: 'VARCHAR', length: 255, nullable: false }),
    __metadata("design:type", String)
], JobModel.prototype, "service_name", void 0);
__decorate([
    (0, BaseModel_2.Column)({ type: 'VARCHAR', length: 255, nullable: false }),
    __metadata("design:type", String)
], JobModel.prototype, "service_method", void 0);
__decorate([
    (0, BaseModel_2.Column)({ type: 'VARCHAR', length: 500, nullable: true }),
    __metadata("design:type", String)
], JobModel.prototype, "service_path", void 0);
__decorate([
    (0, BaseModel_2.Column)({ type: 'JSONB', nullable: false }),
    __metadata("design:type", Object)
], JobModel.prototype, "params", void 0);
__decorate([
    (0, BaseModel_2.Column)({ type: 'VARCHAR', length: 100, nullable: false }),
    __metadata("design:type", String)
], JobModel.prototype, "schedule", void 0);
__decorate([
    (0, BaseModel_2.Column)({ type: 'BOOLEAN', nullable: false }),
    __metadata("design:type", Boolean)
], JobModel.prototype, "enabled", void 0);
__decorate([
    (0, BaseModel_2.Column)({ type: 'INT', nullable: false }),
    __metadata("design:type", Number)
], JobModel.prototype, "max_retries", void 0);
__decorate([
    (0, BaseModel_2.Column)({ type: 'INT', nullable: false }),
    __metadata("design:type", Number)
], JobModel.prototype, "retry_delay", void 0);
__decorate([
    (0, BaseModel_2.Column)({ type: 'INT', nullable: false }),
    __metadata("design:type", Number)
], JobModel.prototype, "timeout", void 0);
__decorate([
    (0, BaseModel_2.Column)({ type: 'TIMESTAMP', nullable: true }),
    __metadata("design:type", Date)
], JobModel.prototype, "last_run_at", void 0);
__decorate([
    (0, BaseModel_2.Column)({ type: 'VARCHAR', length: 50, nullable: true }),
    __metadata("design:type", String)
], JobModel.prototype, "last_run_status", void 0);
__decorate([
    (0, BaseModel_2.Column)({ type: 'TEXT', nullable: true }),
    __metadata("design:type", String)
], JobModel.prototype, "last_run_error", void 0);
__decorate([
    (0, BaseModel_2.Column)({ type: 'INT', nullable: true }),
    __metadata("design:type", Number)
], JobModel.prototype, "last_run_duration", void 0);
__decorate([
    (0, BaseModel_2.Column)({ type: 'TIMESTAMP', nullable: true }),
    __metadata("design:type", Date)
], JobModel.prototype, "next_run_at", void 0);
__decorate([
    (0, BaseModel_2.Column)({ type: 'INT', nullable: false }),
    __metadata("design:type", Number)
], JobModel.prototype, "run_count", void 0);
__decorate([
    (0, BaseModel_2.Column)({ type: 'INT', nullable: false }),
    __metadata("design:type", Number)
], JobModel.prototype, "success_count", void 0);
__decorate([
    (0, BaseModel_2.Column)({ type: 'INT', nullable: false }),
    __metadata("design:type", Number)
], JobModel.prototype, "error_count", void 0);
__decorate([
    (0, BaseModel_2.Column)({ type: 'TIMESTAMP', nullable: false }),
    __metadata("design:type", Date)
], JobModel.prototype, "created_at", void 0);
__decorate([
    (0, BaseModel_2.Column)({ type: 'TIMESTAMP', nullable: false }),
    __metadata("design:type", Date)
], JobModel.prototype, "updated_at", void 0);
__decorate([
    (0, BaseModel_2.Column)({ type: 'INT', nullable: true }),
    __metadata("design:type", Number)
], JobModel.prototype, "created_by", void 0);
__decorate([
    (0, BaseModel_2.Column)({ type: 'INT', nullable: true }),
    __metadata("design:type", Number)
], JobModel.prototype, "updated_by", void 0);
exports.JobModel = JobModel = __decorate([
    (0, BaseModel_2.Entity)('scheduled_jobs')
], JobModel);
//# sourceMappingURL=JobModel.js.map