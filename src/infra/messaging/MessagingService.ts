import { RabbitMQConnection } from './RabbitMQConnection';
import { BaseConsumer } from './BaseConsumer';
import { LoggingService } from '../../core/tracing/LoggingService';

/**
 * MessagingService - Gerencia producers e consumers
 * 
 * Facilita o registro e inicialização de consumers,
 * e o gerenciamento do ciclo de vida do RabbitMQ.
 */
export class MessagingService {
  private static instance: MessagingService;
  private consumers: BaseConsumer[] = [];
  private connection: RabbitMQConnection;

  private constructor() {
    this.connection = RabbitMQConnection.getInstance();
  }

  public static getInstance(): MessagingService {
    if (!MessagingService.instance) {
      MessagingService.instance = new MessagingService();
    }
    return MessagingService.instance;
  }

  /**
   * Conecta ao RabbitMQ
   */
  public async connect(): Promise<void> {
    try {
      await this.connection.connect();
      LoggingService.info('MessagingService connected to RabbitMQ');
    } catch (error) {
      LoggingService.error('Failed to connect MessagingService', error);
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
  public registerConsumer(consumer: BaseConsumer): void {
    this.consumers.push(consumer);
    LoggingService.debug('Consumer registered', {
      consumer: consumer.constructor.name
    });
  }

  /**
   * Registra múltiplos consumers
   */
  public registerConsumers(consumers: BaseConsumer[]): void {
    consumers.forEach(consumer => this.registerConsumer(consumer));
  }

  /**
   * Inicia todos os consumers registrados
   */
  public async startConsumers(): Promise<void> {
    if (this.consumers.length === 0) {
      LoggingService.warn('No consumers registered');
      return;
    }

    LoggingService.info('Starting consumers', {
      count: this.consumers.length
    });

    const startPromises = this.consumers.map(async (consumer) => {
      try {
        await consumer.start();
      } catch (error) {
        LoggingService.error('Failed to start consumer', error, {
          consumer: consumer.constructor.name
        });
      }
    });

    await Promise.all(startPromises);

    const activeCount = this.consumers.filter(c => c.isActive()).length;
    
    LoggingService.info('Consumers started', {
      total: this.consumers.length,
      active: activeCount
    });
  }

  /**
   * Para todos os consumers
   */
  public async stopConsumers(): Promise<void> {
    LoggingService.info('Stopping consumers', {
      count: this.consumers.length
    });

    const stopPromises = this.consumers.map(async (consumer) => {
      try {
        await consumer.stop();
      } catch (error) {
        LoggingService.error('Failed to stop consumer', error, {
          consumer: consumer.constructor.name
        });
      }
    });

    await Promise.all(stopPromises);

    LoggingService.info('All consumers stopped');
  }

  /**
   * Verifica se está conectado
   */
  public isConnected(): boolean {
    return this.connection.isConnected();
  }

  /**
   * Fecha a conexão com RabbitMQ e para todos os consumers
   */
  public async close(): Promise<void> {
    await this.stopConsumers();
    await this.connection.close();
    LoggingService.info('MessagingService closed');
  }

  /**
   * Obtém lista de consumers registrados
   */
  public getConsumers(): BaseConsumer[] {
    return [...this.consumers];
  }
}
