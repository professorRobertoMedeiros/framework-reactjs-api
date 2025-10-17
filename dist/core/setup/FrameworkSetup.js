"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupFramework = setupFramework;
exports.createFrameworkRouter = createFrameworkRouter;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../routes/auth"));
const HTTPLoggerMiddleware_1 = require("../../infra/logger/HTTPLoggerMiddleware");
/**
 * Configuração padrão do framework
 */
const defaultOptions = {
    apiPrefix: '/api',
    enableAuth: true,
    authPath: '/auth',
    enableHTTPLogging: process.env.LOG_HTTP === 'true',
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
function setupFramework(app, options = {}) {
    // Mesclar opções com padrões
    const config = { ...defaultOptions, ...options };
    console.log('🚀 Inicializando Framework ReactJS API...');
    // Configurar middleware de logging HTTP (deve vir antes das rotas)
    if (config.enableHTTPLogging) {
        app.use(HTTPLoggerMiddleware_1.HTTPLoggerMiddleware.log());
        console.log('✅ Logging HTTP habilitado');
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
    return router;
}
//# sourceMappingURL=FrameworkSetup.js.map