import { BaseModel } from './BaseModel';
/**
 * Status de execução de um job
 */
export declare enum JobStatus {
    SUCCESS = "success",
    ERROR = "error",
    TIMEOUT = "timeout",
    RUNNING = "running",
    PENDING = "pending"
}
/**
 * Modelo para jobs agendados
 * Representa um job que será executado periodicamente
 */
export declare class JobModel extends BaseModel {
    id: number;
    name: string;
    description?: string;
    service_name: string;
    service_method: string;
    service_path?: string;
    params: Record<string, any>;
    schedule: string;
    enabled: boolean;
    max_retries: number;
    retry_delay: number;
    timeout: number;
    last_run_at?: Date;
    last_run_status?: JobStatus;
    last_run_error?: string;
    last_run_duration?: number;
    next_run_at?: Date;
    run_count: number;
    success_count: number;
    error_count: number;
    created_at: Date;
    updated_at: Date;
    created_by?: number;
    updated_by?: number;
    /**
     * Verifica se o job está pronto para executar
     */
    isReadyToRun(): boolean;
    /**
     * Verifica se o job está atualmente em execução
     */
    isRunning(): boolean;
    /**
     * Calcula a taxa de sucesso do job
     */
    getSuccessRate(): number;
    /**
     * Retorna uma descrição legível do schedule
     */
    getScheduleDescription(): string;
}
