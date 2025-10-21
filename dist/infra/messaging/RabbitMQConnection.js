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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQConnection = void 0;
const amqp = __importStar(require("amqplib"));
const LoggingService_1 = require("../../core/tracing/LoggingService");
/**
 * RabbitMQConnection - Gerencia conexão com RabbitMQ
 *
 * Singleton que mantém uma conexão persistente com o RabbitMQ
 * e fornece canais para producers e consumers.
 */
class RabbitMQConnection {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = parseInt(process.env.RABBITMQ_MAX_RECONNECT_ATTEMPTS || '10', 10);
        this.reconnectDelay = parseInt(process.env.RABBITMQ_RECONNECT_DELAY || '5000', 10);
    }
    static getInstance() {
        if (!RabbitMQConnection.instance) {
            RabbitMQConnection.instance = new RabbitMQConnection();
        }
        return RabbitMQConnection.instance;
    }
    /**
     * Conecta ao RabbitMQ
     */
    async connect() {
        if (this.connection && this.channel) {
            LoggingService_1.LoggingService.debug('RabbitMQ already connected');
            return;
        }
        if (this.isConnecting) {
            LoggingService_1.LoggingService.debug('RabbitMQ connection in progress, waiting...');
            await this.waitForConnection();
            return;
        }
        this.isConnecting = true;
        try {
            const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
            LoggingService_1.LoggingService.info('Connecting to RabbitMQ', { url: url.replace(/\/\/.*@/, '//***@') });
            this.connection = await amqp.connect(url);
            this.channel = await this.connection.createChannel();
            // Configurar prefetch para consumers
            const prefetch = parseInt(process.env.RABBITMQ_PREFETCH || '1', 10);
            await this.channel.prefetch(prefetch);
            LoggingService_1.LoggingService.info('RabbitMQ connected successfully', { prefetch });
            // Resetar contador de tentativas
            this.reconnectAttempts = 0;
            // Event handlers
            this.connection.on('error', (err) => {
                LoggingService_1.LoggingService.error('RabbitMQ connection error', err);
            });
            this.connection.on('close', () => {
                LoggingService_1.LoggingService.warn('RabbitMQ connection closed');
                this.connection = null;
                this.channel = null;
                this.handleReconnect();
            });
            this.channel.on('error', (err) => {
                LoggingService_1.LoggingService.error('RabbitMQ channel error', err);
            });
            this.channel.on('close', () => {
                LoggingService_1.LoggingService.warn('RabbitMQ channel closed');
                this.channel = null;
            });
        }
        catch (error) {
            LoggingService_1.LoggingService.error('Failed to connect to RabbitMQ', error);
            this.connection = null;
            this.channel = null;
            await this.handleReconnect();
            throw error;
        }
        finally {
            this.isConnecting = false;
        }
    }
    /**
     * Aguarda a conexão ser estabelecida
     */
    async waitForConnection(timeout = 30000) {
        const startTime = Date.now();
        while (this.isConnecting) {
            if (Date.now() - startTime > timeout) {
                throw new Error('Timeout waiting for RabbitMQ connection');
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (!this.connection || !this.channel) {
            throw new Error('RabbitMQ connection failed');
        }
    }
    /**
     * Tenta reconectar ao RabbitMQ
     */
    async handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            LoggingService_1.LoggingService.error('Max reconnect attempts reached, giving up');
            return;
        }
        this.reconnectAttempts++;
        LoggingService_1.LoggingService.info('Attempting to reconnect to RabbitMQ', {
            attempt: this.reconnectAttempts,
            maxAttempts: this.maxReconnectAttempts,
            delay: this.reconnectDelay
        });
        await new Promise(resolve => setTimeout(resolve, this.reconnectDelay));
        try {
            await this.connect();
        }
        catch (error) {
            LoggingService_1.LoggingService.error('Reconnection attempt failed', error);
        }
    }
    /**
     * Obtém o canal do RabbitMQ
     */
    async getChannel() {
        if (!this.channel) {
            await this.connect();
        }
        if (!this.channel) {
            throw new Error('Failed to get RabbitMQ channel');
        }
        return this.channel;
    }
    /**
     * Verifica se está conectado
     */
    isConnected() {
        return this.connection !== null && this.channel !== null;
    }
    /**
     * Fecha a conexão com RabbitMQ
     */
    async close() {
        try {
            if (this.channel) {
                LoggingService_1.LoggingService.info('Closing RabbitMQ channel');
                await this.channel.close();
                this.channel = null;
            }
            if (this.connection) {
                LoggingService_1.LoggingService.info('Closing RabbitMQ connection');
                await this.connection.close();
                this.connection = null;
            }
        }
        catch (error) {
            LoggingService_1.LoggingService.error('Error closing RabbitMQ connection', error);
        }
    }
}
exports.RabbitMQConnection = RabbitMQConnection;
//# sourceMappingURL=RabbitMQConnection.js.map