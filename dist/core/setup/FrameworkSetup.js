"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupFramework = setupFramework;
exports.createFrameworkRouter = createFrameworkRouter;
exports.getSchedulerInstance = getSchedulerInstance;
exports.shutdownScheduler = shutdownScheduler;
const express_1 = require("express");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const auth_1 = __importDefault(require("../../routes/auth"));
const scheduler_1 = __importStar(require("../../routes/scheduler"));
const HTTPLoggerMiddleware_1 = require("../../infra/logger/HTTPLoggerMiddleware");
const SchedulerService_1 = require("../scheduler/SchedulerService");
const SwaggerConfig_1 = require("../../infra/swagger/SwaggerConfig");
/**
 * Configuração padrão do framework
 */
const defaultOptions = {
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
let schedulerServiceInstance = null;
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
function setupFramework(app, options = {}) {
    // Mesclar opções com padrões
    const config = { ...defaultOptions, ...options };
    console.log('🚀 Inicializando Framework ReactJS API...');
    // Configurar middleware de logging HTTP (deve vir antes das rotas)
    if (config.enableHTTPLogging) {
        app.use(HTTPLoggerMiddleware_1.HTTPLoggerMiddleware.log());
        console.log('✅ Logging HTTP habilitado');
    }
    // Configurar Swagger UI
    if (config.enableSwagger) {
        const swaggerSpec = (0, SwaggerConfig_1.generateSwaggerSpec)(config.swaggerOptions);
        app.use(config.swaggerPath, swagger_ui_express_1.default.serve);
        app.get(config.swaggerPath, swagger_ui_express_1.default.setup(swaggerSpec, SwaggerConfig_1.swaggerUIOptions));
        console.log(`📚 Documentação Swagger disponível em: ${config.swaggerPath}`);
        console.log(`   Acesse: http://localhost:${process.env.PORT || 3000}${config.swaggerPath}`);
    }
    // Configurar rotas de autenticação automaticamente
    if (config.enableAuth) {
        const authRoutePath = `${config.apiPrefix}${config.authPath}`;
        app.use(authRoutePath, auth_1.default);
        console.log(`✅ Rotas de autenticação configuradas em: ${authRoutePath}`);
        console.log(`   - POST ${authRoutePath}/login`);
        console.log(`   - POST ${authRoutePath}/register`);
        console.log(`   - GET ${authRoutePath}/me`);
    }
    // Configurar scheduler e suas rotas
    if (config.enableScheduler) {
        // Criar instância do scheduler
        schedulerServiceInstance = new SchedulerService_1.SchedulerService(config.schedulerOptions);
        // Registrar instância para as rotas
        (0, scheduler_1.registerSchedulerInstance)(schedulerServiceInstance);
        // Iniciar scheduler automaticamente se configurado
        if (config.schedulerOptions?.autoStart !== false) {
            schedulerServiceInstance.start()
                .then(() => {
                console.log('🚀 Scheduler iniciado automaticamente');
            })
                .catch((error) => {
                console.error('❌ Erro ao iniciar scheduler automaticamente:', error);
            });
        }
        else {
            console.log('⏸️  Scheduler criado mas não iniciado (autoStart=false)');
            console.log('   Para iniciar: POST /api/scheduler/start');
        }
        // Configurar rotas do scheduler
        const schedulerRoutePath = `${config.apiPrefix}${config.schedulerPath}`;
        app.use(schedulerRoutePath, scheduler_1.default);
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
        if (config.databaseConfig.host)
            process.env.DB_HOST = config.databaseConfig.host;
        if (config.databaseConfig.port)
            process.env.DB_PORT = config.databaseConfig.port.toString();
        if (config.databaseConfig.database)
            process.env.DB_NAME = config.databaseConfig.database;
        if (config.databaseConfig.user)
            process.env.DB_USER = config.databaseConfig.user;
        if (config.databaseConfig.password)
            process.env.DB_PASSWORD = config.databaseConfig.password;
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
function createFrameworkRouter(options = {}) {
    const config = { ...defaultOptions, ...options };
    const router = (0, express_1.Router)();
    // Adicionar rotas de autenticação
    if (config.enableAuth) {
        router.use(config.authPath, auth_1.default);
        console.log(`✅ Router do framework criado com rotas de autenticação em: ${config.authPath}`);
    }
    // Adicionar rotas do scheduler
    if (config.enableScheduler) {
        if (!schedulerServiceInstance) {
            schedulerServiceInstance = new SchedulerService_1.SchedulerService(config.schedulerOptions);
            (0, scheduler_1.registerSchedulerInstance)(schedulerServiceInstance);
        }
        router.use(config.schedulerPath, scheduler_1.default);
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
function getSchedulerInstance() {
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
async function shutdownScheduler() {
    if (schedulerServiceInstance) {
        await schedulerServiceInstance.stop();
        schedulerServiceInstance = null;
    }
}
//# sourceMappingURL=FrameworkSetup.js.map