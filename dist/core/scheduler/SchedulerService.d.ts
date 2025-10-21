import { JobExecutionResult } from './JobExecutor';
/**
 * Opções para configurar o SchedulerService
 */
export interface SchedulerOptions {
    enabled?: boolean;
    checkInterval?: number;
    maxConcurrent?: number;
    autoStart?: boolean;
    stuckJobThreshold?: number;
}
/**
 * Serviço responsável por gerenciar e executar jobs agendados
 */
export declare class SchedulerService {
    private repository;
    private executor;
    private options;
    private isRunning;
    private checkTimer?;
    private runningJobs;
    private cronJobs;
    constructor(options?: SchedulerOptions);
    /**
     * Inicia o scheduler
     */
    start(): Promise<void>;
    /**
     * Para o scheduler
     */
    stop(): Promise<void>;
    /**
     * Carrega todos os jobs e configura seus cron schedules
     */
    private loadAndScheduleJobs;
    /**
     * Configura um cron job
     */
    private scheduleCronJob;
    /**
     * Verifica e executa jobs que estão prontos
     */
    private checkAndExecuteJobs;
    /**
     * Executa um job se ele estiver pronto
     */
    private executeJobIfReady;
    /**
     * Executa um job
     */
    private executeJob;
    /**
     * Executa job com retries
     */
    private executeWithRetries;
    /**
     * Atualiza a próxima execução do job baseado no cron schedule
     */
    private updateNextRun;
    /**
     * Calcula a próxima execução baseado no cron schedule
     */
    private calculateNextRun;
    /**
     * Verifica jobs que estão travados
     */
    private checkStuckJobs;
    /**
     * Executa um job manualmente (força execução)
     */
    runJobNow(jobId: number): Promise<JobExecutionResult>;
    /**
     * Recarrega um job específico (atualiza seu schedule)
     */
    reloadJob(jobId: number): Promise<void>;
    /**
     * Recarrega todos os jobs
     */
    reloadAllJobs(): Promise<void>;
    /**
     * Retorna status do scheduler
     */
    getStatus(): {
        running: boolean;
        runningJobs: number[];
        scheduledJobs: number;
        maxConcurrent: number;
    };
    /**
     * Sleep helper
     */
    private sleep;
}
