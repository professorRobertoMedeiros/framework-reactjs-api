import { Channel, ConsumeMessage } from 'amqplib';
export interface ConsumerOptions {
    exchange?: string;
    exchangeType?: 'direct' | 'topic' | 'fanout' | 'headers';
    routingKey?: string;
    durable?: boolean;
    autoAck?: boolean;
    prefetch?: number;
}
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
export declare abstract class BaseConsumer {
    protected queueName: string;
    protected options: ConsumerOptions;
    protected channel: Channel | null;
    protected consumerTag: string | null;
    private isConsuming;
    constructor(queueName: string, options?: ConsumerOptions);
    /**
     * Método abstrato que deve ser implementado pelas classes filhas
     *
     * @param message - Mensagem recebida (já parseada do JSON)
     * @param originalMessage - Mensagem original do RabbitMQ (para casos avançados)
     */
    protected abstract handleMessage(message: any, originalMessage?: ConsumeMessage): Promise<void>;
    /**
     * Inicializa o consumer (cria fila, exchange e binding)
     */
    protected initialize(): Promise<void>;
    /**
     * Inicia o consumo de mensagens
     */
    start(): Promise<void>;
    /**
     * Processa uma mensagem individual
     */
    private processMessage;
    /**
     * Para o consumo de mensagens
     */
    stop(): Promise<void>;
    /**
     * Verifica se está consumindo
     */
    isActive(): boolean;
}
