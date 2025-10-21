import { JobModel } from '../domain/models/JobModel';
/**
 * Resultado da execução de um job
 */
export interface JobExecutionResult {
    success: boolean;
    duration: number;
    error?: string;
    result?: any;
}
/**
 * Executor responsável por carregar e executar jobs dinamicamente
 */
export declare class JobExecutor {
    private serviceCache;
    /**
     * Executa um job
     */
    executeJob(job: JobModel): Promise<JobExecutionResult>;
    /**
     * Carrega o service dinamicamente
     */
    private loadService;
    /**
     * Resolve o caminho do service
     */
    private resolveServicePath;
    /**
     * Descobre o caminho do service automaticamente
     */
    private discoverServicePath;
    /**
     * Busca um arquivo recursivamente
     */
    private findFile;
    /**
     * Executa uma função com timeout
     */
    private executeWithTimeout;
    /**
     * Limpa o cache de services
     */
    clearCache(): void;
    /**
     * Remove um service específico do cache
     */
    removeCachedService(serviceName: string, servicePath?: string): void;
}
