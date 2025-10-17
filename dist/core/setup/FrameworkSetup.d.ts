import { Express, Router } from 'express';
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
