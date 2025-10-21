import { Express, Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import authRoutes from '../../routes/auth';
import schedulerRoutes, { registerSchedulerInstance } from '../../routes/scheduler';
import { HTTPLoggerMiddleware } from '../../infra/logger/HTTPLoggerMiddleware';
import { SchedulerService, SchedulerOptions } from '../scheduler/SchedulerService';
import { 
  generateSwaggerSpec, 
  swaggerUIOptions, 
  SwaggerConfigOptions 
} from '../../infra/swagger/SwaggerConfig';

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
   * Habilitar Swagger UI (padrão: true em desenvolvimento)
   */
  enableSwagger?: boolean;
  
  /**
   * Caminho para documentação Swagger (padrão: '/docs')
   */
  swaggerPath?: string;
  
  /**
   * Opções de configuração do Swagger
   */
  swaggerOptions?: SwaggerConfigOptions;
  
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
 * Configuração padrão do framework
 */
const defaultOptions: FrameworkOptions = {
  apiPrefix: '/api',
  enableAuth: true,
  authPath: '/auth',
  enableHTTPLogging: process.env.LOG_HTTP === 'true',
  enableScheduler: process.env.SCHEDULER_ENABLED === 'true',
  schedulerPath: '/scheduler',
  enableSwagger: process.env.NODE_ENV !== 'production',
  swaggerPath: '/docs',
  schedulerOptions: {
    enabled: process.env.SCHEDULER_ENABLED === 'true',
    autoStart: process.env.SCHEDULER_AUTO_START !== 'false', // true por padrão
    maxConcurrent: parseInt(process.env.SCHEDULER_MAX_CONCURRENT || '5', 10),
    checkInterval: parseInt(process.env.SCHEDULER_CHECK_INTERVAL || '60000', 10),
    stuckJobThreshold: parseInt(process.env.SCHEDULER_STUCK_THRESHOLD || '30', 10)
  }
};

// Armazenar instância do scheduler para shutdown graceful
let schedulerServiceInstance: SchedulerService | null = null;

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
export function setupFramework(app: Express, options: FrameworkOptions = {}): void {
  // Mesclar opções com padrões
  const config = { ...defaultOptions, ...options };

  console.log('🚀 Inicializando Framework ReactJS API...');

  // Configurar middleware de logging HTTP (deve vir antes das rotas)
  if (config.enableHTTPLogging) {
    app.use(HTTPLoggerMiddleware.log());
    console.log('✅ Logging HTTP habilitado');
  }

  // Configurar Swagger UI
  if (config.enableSwagger) {
    const swaggerSpec = generateSwaggerSpec(config.swaggerOptions);
    app.use(config.swaggerPath!, swaggerUi.serve);
    app.get(config.swaggerPath!, swaggerUi.setup(swaggerSpec, swaggerUIOptions));
    console.log(`📚 Documentação Swagger disponível em: ${config.swaggerPath}`);
    console.log(`   Acesse: http://localhost:${process.env.PORT || 3000}${config.swaggerPath}`);
  }

  // Configurar rotas de autenticação automaticamente
  if (config.enableAuth) {
    const authRoutePath = `${config.apiPrefix}${config.authPath}`;
    app.use(authRoutePath, authRoutes);
    console.log(`✅ Rotas de autenticação configuradas em: ${authRoutePath}`);
    console.log(`   - POST ${authRoutePath}/login`);
    console.log(`   - POST ${authRoutePath}/register`);
    console.log(`   - GET ${authRoutePath}/me`);
  }

  // Configurar scheduler e suas rotas
  if (config.enableScheduler) {
    // Criar instância do scheduler
    schedulerServiceInstance = new SchedulerService(config.schedulerOptions);
    
    // Registrar instância para as rotas
    registerSchedulerInstance(schedulerServiceInstance);
    
    // Iniciar scheduler automaticamente se configurado
    if (config.schedulerOptions?.autoStart !== false) {
      schedulerServiceInstance.start()
        .then(() => {
          console.log('🚀 Scheduler iniciado automaticamente');
        })
        .catch((error) => {
          console.error('❌ Erro ao iniciar scheduler automaticamente:', error);
        });
    } else {
      console.log('⏸️  Scheduler criado mas não iniciado (autoStart=false)');
      console.log('   Para iniciar: POST /api/scheduler/start');
    }
    
    // Configurar rotas do scheduler
    const schedulerRoutePath = `${config.apiPrefix}${config.schedulerPath}`;
    app.use(schedulerRoutePath, schedulerRoutes);
    
    console.log(`✅ Scheduler habilitado e rotas configuradas em: ${schedulerRoutePath}`);
    console.log(`   - GET ${schedulerRoutePath}/status`);
    console.log(`   - POST ${schedulerRoutePath}/reload`);
    console.log(`   - POST ${schedulerRoutePath}/start`);
    console.log(`   - POST ${schedulerRoutePath}/stop`);
    console.log(`   - GET ${schedulerRoutePath}/jobs`);
    console.log(`   - POST ${schedulerRoutePath}/jobs`);
    console.log(`   - GET ${schedulerRoutePath}/jobs/:id`);
    console.log(`   - PUT ${schedulerRoutePath}/jobs/:id`);
    console.log(`   - DELETE ${schedulerRoutePath}/jobs/:id`);
    console.log(`   - POST ${schedulerRoutePath}/jobs/:id/run`);
    console.log(`   - POST ${schedulerRoutePath}/jobs/:id/enable`);
    console.log(`   - POST ${schedulerRoutePath}/jobs/:id/disable`);
    console.log(`   - POST ${schedulerRoutePath}/reload/:id`);
  }

  // Configurar variáveis de ambiente do banco de dados se fornecidas
  if (config.databaseConfig) {
    if (config.databaseConfig.host) process.env.DB_HOST = config.databaseConfig.host;
    if (config.databaseConfig.port) process.env.DB_PORT = config.databaseConfig.port.toString();
    if (config.databaseConfig.database) process.env.DB_NAME = config.databaseConfig.database;
    if (config.databaseConfig.user) process.env.DB_USER = config.databaseConfig.user;
    if (config.databaseConfig.password) process.env.DB_PASSWORD = config.databaseConfig.password;
  }

  console.log('✅ Framework inicializado com sucesso!');
}

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
export function createFrameworkRouter(options: Omit<FrameworkOptions, 'apiPrefix'> = {}): Router {
  const config = { ...defaultOptions, ...options };
  const router = Router();

  // Adicionar rotas de autenticação
  if (config.enableAuth) {
    router.use(config.authPath!, authRoutes);
    console.log(`✅ Router do framework criado com rotas de autenticação em: ${config.authPath}`);
  }

  // Adicionar rotas do scheduler
  if (config.enableScheduler) {
    if (!schedulerServiceInstance) {
      schedulerServiceInstance = new SchedulerService(config.schedulerOptions);
      registerSchedulerInstance(schedulerServiceInstance);
    }
    
    router.use(config.schedulerPath!, schedulerRoutes);
    console.log(`✅ Router do framework criado com rotas do scheduler em: ${config.schedulerPath}`);
  }

  return router;
}

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
export function getSchedulerInstance(): SchedulerService | null {
  return schedulerServiceInstance;
}

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
export async function shutdownScheduler(): Promise<void> {
  if (schedulerServiceInstance) {
    await schedulerServiceInstance.stop();
    schedulerServiceInstance = null;
  }
}
