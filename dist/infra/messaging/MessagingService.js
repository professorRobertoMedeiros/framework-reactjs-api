"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingService = void 0;
const RabbitMQConnection_1 = require("./RabbitMQConnection");
const LoggingService_1 = require("../../core/tracing/LoggingService");
/**
 * MessagingService - Gerencia producers e consumers
 *
 * Facilita o registro e inicialização de consumers,
 * e o gerenciamento do ciclo de vida do RabbitMQ.
 */
class MessagingService {
    constructor() {
        this.consumers = [];
        this.connection = RabbitMQConnection_1.RabbitMQConnection.getInstance();
    }
    static getInstance() {
        if (!MessagingService.instance) {
            MessagingService.instance = new MessagingService();
        }
        return MessagingService.instance;
    }
    /**
     * Conecta ao RabbitMQ
     */
    async connect() {
        try {
            await this.connection.connect();
            LoggingService_1.LoggingService.info('MessagingService connected to RabbitMQ');
        }
        catch (error) {
            LoggingService_1.LoggingService.error('Failed to connect MessagingService', error);
            throw error;
        }
    }
    /**
     * Registra um consumer
     *
     * @example
     * ```typescript
     * const emailConsumer = new EmailConsumer();
     * messagingService.registerConsumer(emailConsumer);
     * ```
     */
    registerConsumer(consumer) {
        this.consumers.push(consumer);
        LoggingService_1.LoggingService.debug('Consumer registered', {
            consumer: consumer.constructor.name
        });
    }
    /**
     * Registra múltiplos consumers
     */
    registerConsumers(consumers) {
        consumers.forEach(consumer => this.registerConsumer(consumer));
    }
    /**
     * Inicia todos os consumers registrados
     */
    async startConsumers() {
        if (this.consumers.length === 0) {
            LoggingService_1.LoggingService.warn('No consumers registered');
            return;
        }
        LoggingService_1.LoggingService.info('Starting consumers', {
            count: this.consumers.length
        });
        const startPromises = this.consumers.map(async (consumer) => {
            try {
                await consumer.start();
            }
            catch (error) {
                LoggingService_1.LoggingService.error('Failed to start consumer', error, {
                    consumer: consumer.constructor.name
                });
            }
        });
        await Promise.all(startPromises);
        const activeCount = this.consumers.filter(c => c.isActive()).length;
        LoggingService_1.LoggingService.info('Consumers started', {
            total: this.consumers.length,
            active: activeCount
        });
    }
    /**
     * Para todos os consumers
     */
    async stopConsumers() {
        LoggingService_1.LoggingService.info('Stopping consumers', {
            count: this.consumers.length
        });
        const stopPromises = this.consumers.map(async (consumer) => {
            try {
                await consumer.stop();
            }
            catch (error) {
                LoggingService_1.LoggingService.error('Failed to stop consumer', error, {
                    consumer: consumer.constructor.name
                });
            }
        });
        await Promise.all(stopPromises);
        LoggingService_1.LoggingService.info('All consumers stopped');
    }
    /**
     * Verifica se está conectado
     */
    isConnected() {
        return this.connection.isConnected();
    }
    /**
     * Fecha a conexão com RabbitMQ e para todos os consumers
     */
    async close() {
        await this.stopConsumers();
        await this.connection.close();
        LoggingService_1.LoggingService.info('MessagingService closed');
    }
    /**
     * Obtém lista de consumers registrados
     */
    getConsumers() {
        return [...this.consumers];
    }
}
exports.MessagingService = MessagingService;
//# sourceMappingURL=MessagingService.js.map