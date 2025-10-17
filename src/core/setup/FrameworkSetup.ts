import { Express, Router } from 'express';
import authRoutes from '../../routes/auth';

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
};

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

  // Configurar rotas de autenticação automaticamente
  if (config.enableAuth) {
    const authRoutePath = `${config.apiPrefix}${config.authPath}`;
    app.use(authRoutePath, authRoutes);
    console.log(`✅ Rotas de autenticação configuradas em: ${authRoutePath}`);
    console.log(`   - POST ${authRoutePath}/login`);
    console.log(`   - POST ${authRoutePath}/register`);
    console.log(`   - GET ${authRoutePath}/me`);
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

  return router;
}
