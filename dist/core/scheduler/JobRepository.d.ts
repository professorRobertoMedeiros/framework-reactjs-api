import { BaseRepository } from '../../infra/repository/BaseRepository';
import { JobModel, JobStatus } from '../domain/models/JobModel';
/**
 * Repositório para gerenciar jobs agendados
 */
export declare class JobRepository extends BaseRepository<JobModel> {
    constructor();
    /**
     * Busca jobs habilitados que estão prontos para executar
     */
    findReadyToRun(): Promise<JobModel[]>;
    /**
     * Busca jobs por nome do service
     */
    findByService(serviceName: string): Promise<JobModel[]>;
    /**
     * Busca jobs habilitados
     */
    findEnabled(): Promise<JobModel[]>;
    /**
     * Busca jobs por status da última execução
     */
    findByLastStatus(status: JobStatus): Promise<JobModel[]>;
    /**
     * Atualiza o status de execução de um job
     */
    updateExecutionStatus(jobId: number, status: JobStatus, error?: string, duration?: number): Promise<void>;
    /**
     * Atualiza a próxima execução de um job
     */
    updateNextRun(jobId: number, nextRunAt: Date): Promise<void>;
    /**
     * Marca um job como em execução
     */
    markAsRunning(jobId: number): Promise<void>;
    /**
     * Marca um job como concluído
     */
    markAsCompleted(jobId: number, success: boolean, duration: number, error?: string): Promise<void>;
    /**
     * Habilita ou desabilita um job
     */
    setEnabled(jobId: number, enabled: boolean): Promise<void>;
    /**
     * Reseta as estatísticas de um job
     */
    resetStatistics(jobId: number): Promise<void>;
    /**
     * Busca jobs que estão travados (running há muito tempo)
     */
    findStuckJobs(minutesStuck?: number): Promise<JobModel[]>;
}
