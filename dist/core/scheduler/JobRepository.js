"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobRepository = void 0;
const BaseRepository_1 = require("../../infra/repository/BaseRepository");
const JobModel_1 = require("../domain/models/JobModel");
/**
 * Repositório para gerenciar jobs agendados
 */
class JobRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(JobModel_1.JobModel);
    }
    /**
     * Busca jobs habilitados que estão prontos para executar
     */
    async findReadyToRun() {
        const now = new Date().toISOString();
        const query = `
      SELECT * FROM ${this.tableName}
      WHERE enabled = true
        AND (next_run_at IS NULL OR next_run_at <= $1)
        AND (last_run_status IS NULL OR last_run_status != $2)
      ORDER BY next_run_at ASC NULLS FIRST
    `;
        const result = await this.orm.query(query, [now, JobModel_1.JobStatus.RUNNING]);
        return result.rows.map((row) => this.mapToModel(row));
    }
    /**
     * Busca jobs por nome do service
     */
    async findByService(serviceName) {
        return this.findBy({ service_name: serviceName });
    }
    /**
     * Busca jobs habilitados
     */
    async findEnabled() {
        return this.findBy({ enabled: true });
    }
    /**
     * Busca jobs por status da última execução
     */
    async findByLastStatus(status) {
        return this.findBy({ last_run_status: status });
    }
    /**
     * Atualiza o status de execução de um job
     */
    async updateExecutionStatus(jobId, status, error, duration) {
        const updates = {
            last_run_at: new Date(),
            last_run_status: status,
            run_count: this.orm.query(`run_count + 1`),
            updated_at: new Date()
        };
        if (status === JobModel_1.JobStatus.SUCCESS) {
            updates.success_count = this.orm.query(`success_count + 1`);
            updates.last_run_error = null;
        }
        else if (status === JobModel_1.JobStatus.ERROR) {
            updates.error_count = this.orm.query(`error_count + 1`);
            updates.last_run_error = error || 'Unknown error';
        }
        if (duration !== undefined) {
            updates.last_run_duration = duration;
        }
        await this.update(jobId, updates);
    }
    /**
     * Atualiza a próxima execução de um job
     */
    async updateNextRun(jobId, nextRunAt) {
        await this.update(jobId, {
            next_run_at: nextRunAt,
            updated_at: new Date()
        });
    }
    /**
     * Marca um job como em execução
     */
    async markAsRunning(jobId) {
        const query = `
      UPDATE ${this.tableName}
      SET last_run_status = $1,
          last_run_at = $2,
          updated_at = $2
      WHERE id = $3
    `;
        await this.orm.query(query, [JobModel_1.JobStatus.RUNNING, new Date(), jobId]);
    }
    /**
     * Marca um job como concluído
     */
    async markAsCompleted(jobId, success, duration, error) {
        const status = success ? JobModel_1.JobStatus.SUCCESS : JobModel_1.JobStatus.ERROR;
        const query = `
      UPDATE ${this.tableName}
      SET last_run_status = $1,
          last_run_at = $2,
          last_run_duration = $3,
          last_run_error = $4,
          run_count = run_count + 1,
          success_count = success_count + $5,
          error_count = error_count + $6,
          updated_at = $2
      WHERE id = $7
    `;
        await this.orm.query(query, [
            status,
            new Date(),
            duration,
            error || null,
            success ? 1 : 0,
            success ? 0 : 1,
            jobId
        ]);
    }
    /**
     * Habilita ou desabilita um job
     */
    async setEnabled(jobId, enabled) {
        await this.update(jobId, {
            enabled,
            updated_at: new Date()
        });
    }
    /**
     * Reseta as estatísticas de um job
     */
    async resetStatistics(jobId) {
        await this.update(jobId, {
            run_count: 0,
            success_count: 0,
            error_count: 0,
            last_run_at: undefined,
            last_run_status: undefined,
            last_run_error: undefined,
            last_run_duration: undefined,
            updated_at: new Date()
        });
    }
    /**
     * Busca jobs que estão travados (running há muito tempo)
     */
    async findStuckJobs(minutesStuck = 30) {
        const stuckTime = new Date(Date.now() - minutesStuck * 60 * 1000).toISOString();
        const query = `
      SELECT * FROM ${this.tableName}
      WHERE last_run_status = $1
        AND last_run_at < $2
    `;
        const result = await this.orm.query(query, [JobModel_1.JobStatus.RUNNING, stuckTime]);
        return result.rows.map((row) => this.mapToModel(row));
    }
}
exports.JobRepository = JobRepository;
//# sourceMappingURL=JobRepository.js.map