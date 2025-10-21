import { Express, Router } from 'express';
import { SchedulerService, SchedulerOptions } from '../scheduler/SchedulerService';
/**
 * Opções de configuração do framework
 */
export interface FrameworkOptions {
    /**
     * Prefixo base para as rotas da API (padrão: '/api')
     */
    apiPrefix?: string;
    /**
     * Habilitar rotas de autenticação (padrão: true)
     */
    enableAuth?: boolean;
    /**
     * Caminho customizado para rotas de autenticação (padrão: '/auth')
     */
    authPath?: string;
    /**
     * Habilitar logging HTTP (padrão: true se LOG_HTTP=true no .env)
     */
    enableHTTPLogging?: boolean;
    /**
     * Habilitar scheduler e suas rotas (padrão: false)
     */
    enableScheduler?: boolean;
    /**
     * Caminho customizado para rotas do scheduler (padrão: '/scheduler')
     */
    schedulerPath?: string;
    /**
     * Opções de configuração do scheduler
     */
    schedulerOptions?: SchedulerOptions;
    /**
     * Configurações adicionais do banco de dados
     */
    databaseConfig?: {
        host?: string;
        port?: number;
        database?: string;
        user?: string;
        password?: string;
    };
}
/**
 * Inicializa o framework e configura rotas automáticas
 *
 * @param app Instância do Express
 * @param options Opções de configuração
 *
 * @example
 * ```typescript
 * import express from 'express';
 * import { setupFramework } from 'framework-reactjs-api';
 *
 * const app = express();
 * app.use(express.json());
 *
 * // Configura automaticamente as rotas de autenticação
 * setupFramework(app);
 *
 * // Suas rotas personalizadas
 * app.use('/api/products', productRouter);
 *
 * app.listen(3000);
 * ```
 */
export declare function setupFramework(app: Express, options?: FrameworkOptions): void;
/**
 * Cria um router com rotas pré-configuradas do framework
 *
 * @param options Opções de configuração
 * @returns Router configurado
 *
 * @example
 * ```typescript
 * import express from 'express';
 * import { createFrameworkRouter } from 'framework-reactjs-api';
 *
 * const app = express();
 * app.use(express.json());
 *
 * // Criar router com rotas do framework
 * const frameworkRouter = createFrameworkRouter();
 * app.use('/api', frameworkRouter);
 *
 * // Suas rotas personalizadas
 * app.use('/api/products', productRouter);
 *
 * app.listen(3000);
 * ```
 */
export declare function createFrameworkRouter(options?: Omit<FrameworkOptions, 'apiPrefix'>): Router;
/**
 * Retorna a instância do scheduler (se estiver habilitado)
 *
 * @returns Instância do SchedulerService ou null
 *
 * @example
 * ```typescript
 * import { getSchedulerInstance } from 'framework-reactjs-api';
 *
 * const scheduler = getSchedulerInstance();
 * if (scheduler) {
 *   await scheduler.runJobNow(jobId);
 * }
 * ```
 */
export declare function getSchedulerInstance(): SchedulerService | null;
/**
 * Para o scheduler de forma graceful
 * Deve ser chamado no shutdown da aplicação
 *
 * @example
 * ```typescript
 * import { shutdownScheduler } from 'framework-reactjs-api';
 *
 * process.on('SIGINT', async () => {
 *   console.log('Parando scheduler...');
 *   await shutdownScheduler();
 *   process.exit(0);
 * });
 * ```
 */
export declare function shutdownScheduler(): Promise<void>;
