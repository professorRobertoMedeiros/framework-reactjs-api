"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseProducer = void 0;
const RabbitMQConnection_1 = require("./RabbitMQConnection");
const LoggingService_1 = require("../../core/tracing/LoggingService");
const TracingService_1 = require("../../core/tracing/TracingService");
/**
 * BaseProducer - Classe base para producers de mensagens
 *
 * Estenda esta classe para criar seus próprios producers:
 *
 * @example
 * ```typescript
 * export class EmailProducer extends BaseProducer {
 *   constructor() {
 *     super('notifications', {
 *       exchange: 'notifications.exchange',
 *       exchangeType: 'topic',
 *       durable: true,
 *       persistent: true
 *     });
 *   }
 *
 *   async sendEmail(to: string, subject: string, body: string) {
 *     return this.publish('email.send', {
 *       to,
 *       subject,
 *       body,
 *       sentAt: new Date()
 *     });
 *   }
 * }
 * ```
 */
class BaseProducer {
    constructor(queueName, options = {}) {
        this.channel = null;
        this.queueName = queueName;
        this.options = {
            durable: true,
            persistent: true,
            ...options
        };
    }
    /**
     * Inicializa o producer (cria exchange e binding se necessário)
     */
    async initialize() {
        if (this.channel) {
            return;
        }
        try {
            const connection = RabbitMQConnection_1.RabbitMQConnection.getInstance();
            this.channel = await connection.getChannel();
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
        }
        catch (error) {
            LoggingService_1.LoggingService.error('Failed to initialize producer', error, {
                queue: this.queueName
            });
            throw error;
        }
    }
    /**
     * Publica uma mensagem na fila
     *
     * @param routingKey - Routing key (ou nome da fila se não usar exchange)
     * @param message - Mensagem a ser publicada (será convertida para JSON)
     * @param options - Opções adicionais de publicação
     */
    async publish(routingKey, message, options = {}) {
        await this.initialize();
        if (!this.channel) {
            throw new Error('Channel not initialized');
        }
        try {
            const requestId = TracingService_1.TracingService.getRequestId();
            // Adiciona requestId aos headers da mensagem
            const messageOptions = {
                persistent: this.options.persistent,
                contentType: 'application/json',
                headers: {
                    'x-request-id': requestId,
                    ...options.headers
                },
                ...options
            };
            // Adiciona metadados à mensagem
            const enrichedMessage = {
                ...message,
                _metadata: {
                    requestId,
                    producedAt: new Date().toISOString(),
                    producer: this.constructor.name
                }
            };
            const messageBuffer = Buffer.from(JSON.stringify(enrichedMessage));
            let published = false;
            if (this.options.exchange) {
                // Publica no exchange
                published = this.channel.publish(this.options.exchange, routingKey, messageBuffer, messageOptions);
            }
            else {
                // Publica direto na fila
                published = this.channel.sendToQueue(routingKey, messageBuffer, messageOptions);
            }
            if (published) {
                LoggingService_1.LoggingService.info('Message published', {
                    queue: this.queueName,
                    routingKey,
                    exchange: this.options.exchange,
                    messageSize: messageBuffer.length
                });
            }
            else {
                LoggingService_1.LoggingService.warn('Message not confirmed', {
                    queue: this.queueName,
                    routingKey
                });
            }
            return published;
        }
        catch (error) {
            LoggingService_1.LoggingService.error('Failed to publish message', error, {
                queue: this.queueName,
                routingKey
            });
            throw error;
        }
    }
    /**
     * Fecha o producer
     */
    async close() {
        // O canal é compartilhado, não fechamos aqui
        this.channel = null;
    }
}
exports.BaseProducer = BaseProducer;
//# sourceMappingURL=BaseProducer.js.map