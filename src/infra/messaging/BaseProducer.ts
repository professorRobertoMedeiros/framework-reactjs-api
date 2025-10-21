import { Channel } from 'amqplib';
import { RabbitMQConnection } from './RabbitMQConnection';
import { LoggingService } from '../../core/tracing/LoggingService';
import { TracingService } from '../../core/tracing/TracingService';

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
export abstract class BaseProducer {
  protected queueName: string;
  protected options: ProducerOptions;
  protected channel: Channel | null = null;

  constructor(queueName: string, options: ProducerOptions = {}) {
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
  protected async initialize(): Promise<void> {
    if (this.channel) {
      return;
    }

    try {
      const connection = RabbitMQConnection.getInstance();
      this.channel = await connection.getChannel();

      // Se usar exchange, cria e faz binding
      if (this.options.exchange) {
        await this.channel.assertExchange(
          this.options.exchange,
          this.options.exchangeType || 'topic',
          { durable: this.options.durable }
        );

        LoggingService.debug('Exchange created/verified', {
          exchange: this.options.exchange,
          type: this.options.exchangeType
        });
      }

      // Cria a fila
      await this.channel.assertQueue(this.queueName, {
        durable: this.options.durable
      });

      LoggingService.debug('Queue created/verified', {
        queue: this.queueName,
        durable: this.options.durable
      });

    } catch (error) {
      LoggingService.error('Failed to initialize producer', error, {
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
  protected async publish(
    routingKey: string,
    message: any,
    options: any = {}
  ): Promise<boolean> {
    await this.initialize();

    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    try {
      const requestId = TracingService.getRequestId();
      
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
        published = this.channel.publish(
          this.options.exchange,
          routingKey,
          messageBuffer,
          messageOptions
        );
      } else {
        // Publica direto na fila
        published = this.channel.sendToQueue(
          routingKey,
          messageBuffer,
          messageOptions
        );
      }

      if (published) {
        LoggingService.info('Message published', {
          queue: this.queueName,
          routingKey,
          exchange: this.options.exchange,
          messageSize: messageBuffer.length
        });
      } else {
        LoggingService.warn('Message not confirmed', {
          queue: this.queueName,
          routingKey
        });
      }

      return published;

    } catch (error) {
      LoggingService.error('Failed to publish message', error, {
        queue: this.queueName,
        routingKey
      });
      throw error;
    }
  }

  /**
   * Fecha o producer
   */
  public async close(): Promise<void> {
    // O canal é compartilhado, não fechamos aqui
    this.channel = null;
  }
}
