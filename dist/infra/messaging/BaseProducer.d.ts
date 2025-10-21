import { Channel } from 'amqplib';
export interface ProducerOptions {
    exchange?: string;
    exchangeType?: 'direct' | 'topic' | 'fanout' | 'headers';
    durable?: boolean;
    persistent?: boolean;
}
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
export declare abstract class BaseProducer {
    protected queueName: string;
    protected options: ProducerOptions;
    protected channel: Channel | null;
    constructor(queueName: string, options?: ProducerOptions);
    /**
     * Inicializa o producer (cria exchange e binding se necessário)
     */
    protected initialize(): Promise<void>;
    /**
     * Publica uma mensagem na fila
     *
     * @param routingKey - Routing key (ou nome da fila se não usar exchange)
     * @param message - Mensagem a ser publicada (será convertida para JSON)
     * @param options - Opções adicionais de publicação
     */
    protected publish(routingKey: string, message: any, options?: any): Promise<boolean>;
    /**
     * Fecha o producer
     */
    close(): Promise<void>;
}
