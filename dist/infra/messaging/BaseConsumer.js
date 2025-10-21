"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseConsumer = void 0;
const RabbitMQConnection_1 = require("./RabbitMQConnection");
const LoggingService_1 = require("../../core/tracing/LoggingService");
const TracingService_1 = require("../../core/tracing/TracingService");
/**
 * BaseConsumer - Classe base para consumers de mensagens
 *
 * Estenda esta classe e implemente o método `handleMessage`:
 *
 * @example
 * ```typescript
 * export class EmailConsumer extends BaseConsumer {
 *   constructor() {
 *     super('email.queue', {
 *       exchange: 'notifications.exchange',
 *       exchangeType: 'topic',
 *       routingKey: 'email.*',
 *       durable: true,
 *       autoAck: false
 *     });
 *   }
 *
 *   protected async handleMessage(message: any): Promise<void> {
 *     const { to, subject, body } = message;
 *
 *     // Enviar email
 *     await emailService.send(to, subject, body);
 *
 *     LoggingService.info('Email sent successfully', { to, subject });
 *   }
 * }
 * ```
 */
class BaseConsumer {
    constructor(queueName, options = {}) {
        this.channel = null;
        this.consumerTag = null;
        this.isConsuming = false;
        this.queueName = queueName;
        this.options = {
            durable: true,
            autoAck: false,
            prefetch: 1,
            ...options
        };
    }
    /**
     * Inicializa o consumer (cria fila, exchange e binding)
     */
    async initialize() {
        if (this.channel) {
            return;
        }
        try {
            const connection = RabbitMQConnection_1.RabbitMQConnection.getInstance();
            this.channel = await connection.getChannel();
            // Configurar prefetch
            if (this.options.prefetch) {
                await this.channel.prefetch(this.options.prefetch);
            }
            // Se usar exchange, cria e faz binding
            if (this.options.exchange) {
                await this.channel.assertExchange(this.options.exchange, this.options.exchangeType || 'topic', { durable: this.options.durable });
                LoggingService_1.LoggingService.debug('Exchange created/verified', {
                    exchange: this.options.exchange,
                    type: this.options.exchangeType
                });
            }
            // Cria a fila
            await this.channel.assertQueue(this.queueName, {
                durable: this.options.durable
            });
            LoggingService_1.LoggingService.debug('Queue created/verified', {
                queue: this.queueName,
                durable: this.options.durable
            });
            // Faz binding se usar exchange
            if (this.options.exchange && this.options.routingKey) {
                await this.channel.bindQueue(this.queueName, this.options.exchange, this.options.routingKey);
                LoggingService_1.LoggingService.debug('Queue bound to exchange', {
                    queue: this.queueName,
                    exchange: this.options.exchange,
                    routingKey: this.options.routingKey
                });
            }
        }
        catch (error) {
            LoggingService_1.LoggingService.error('Failed to initialize consumer', error, {
                queue: this.queueName
            });
            throw error;
        }
    }
    /**
     * Inicia o consumo de mensagens
     */
    async start() {
        if (this.isConsuming) {
            LoggingService_1.LoggingService.warn('Consumer already consuming', { queue: this.queueName });
            return;
        }
        await this.initialize();
        if (!this.channel) {
            throw new Error('Channel not initialized');
        }
        try {
            const result = await this.channel.consume(this.queueName, async (msg) => {
                if (!msg)
                    return;
                await this.processMessage(msg);
            }, {
                noAck: this.options.autoAck
            });
            this.consumerTag = result.consumerTag;
            this.isConsuming = true;
            LoggingService_1.LoggingService.info('Consumer started', {
                queue: this.queueName,
                consumerTag: this.consumerTag,
                autoAck: this.options.autoAck
            });
        }
        catch (error) {
            LoggingService_1.LoggingService.error('Failed to start consumer', error, {
                queue: this.queueName
            });
            throw error;
        }
    }
    /**
     * Processa uma mensagem individual
     */
    async processMessage(msg) {
        const startTime = Date.now();
        let parsedMessage;
        let requestId = 'unknown';
        try {
            // Extrai requestId do header
            requestId = msg.properties.headers?.['x-request-id'] || 'no-trace-id';
            // Parse da mensagem
            const content = msg.content.toString();
            parsedMessage = JSON.parse(content);
            // Processa dentro de um contexto de tracing
            await TracingService_1.TracingService.runWithTrace(async () => {
                LoggingService_1.LoggingService.info('Processing message', {
                    queue: this.queueName,
                    messageSize: msg.content.length,
                    routingKey: msg.fields.routingKey
                });
                // Chama o handler da classe filha
                await this.handleMessage(parsedMessage, msg);
                const duration = Date.now() - startTime;
                LoggingService_1.LoggingService.info('Message processed successfully', {
                    queue: this.queueName,
                    duration: `${duration}ms`
                });
                // ACK manual se não for autoAck
                if (!this.options.autoAck && this.channel) {
                    this.channel.ack(msg);
                    LoggingService_1.LoggingService.debug('Message acknowledged', { queue: this.queueName });
                }
            }, {
                consumer: this.constructor.name,
                queue: this.queueName,
                originalRequestId: requestId
            });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            LoggingService_1.LoggingService.error('Error processing message', error, {
                queue: this.queueName,
                duration: `${duration}ms`,
                message: parsedMessage
            });
            // NACK e requeue em caso de erro (se não for autoAck)
            if (!this.options.autoAck && this.channel) {
                this.channel.nack(msg, false, true);
                LoggingService_1.LoggingService.warn('Message rejected and requeued', {
                    queue: this.queueName
                });
            }
        }
    }
    /**
     * Para o consumo de mensagens
     */
    async stop() {
        if (!this.isConsuming) {
            return;
        }
        try {
            if (this.channel && this.consumerTag) {
                await this.channel.cancel(this.consumerTag);
                this.consumerTag = null;
                this.isConsuming = false;
                LoggingService_1.LoggingService.info('Consumer stopped', {
                    queue: this.queueName
                });
            }
        }
        catch (error) {
            LoggingService_1.LoggingService.error('Error stopping consumer', error, {
                queue: this.queueName
            });
        }
    }
    /**
     * Verifica se está consumindo
     */
    isActive() {
        return this.isConsuming;
    }
}
exports.BaseConsumer = BaseConsumer;
//# sourceMappingURL=BaseConsumer.js.map