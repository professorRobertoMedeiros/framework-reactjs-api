import * as amqp from 'amqplib';
import { LoggingService } from '../../core/tracing/LoggingService';

/**
 * RabbitMQConnection - Gerencia conexão com RabbitMQ
 * 
 * Singleton que mantém uma conexão persistente com o RabbitMQ
 * e fornece canais para producers e consumers.
 */
export class RabbitMQConnection {
  private static instance: RabbitMQConnection;
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number;
  private reconnectDelay: number;

  private constructor() {
    this.maxReconnectAttempts = parseInt(process.env.RABBITMQ_MAX_RECONNECT_ATTEMPTS || '10', 10);
    this.reconnectDelay = parseInt(process.env.RABBITMQ_RECONNECT_DELAY || '5000', 10);
  }

  public static getInstance(): RabbitMQConnection {
    if (!RabbitMQConnection.instance) {
      RabbitMQConnection.instance = new RabbitMQConnection();
    }
    return RabbitMQConnection.instance;
  }

  /**
   * Conecta ao RabbitMQ
   */
  public async connect(): Promise<void> {
    if (this.connection && this.channel) {
      LoggingService.debug('RabbitMQ already connected');
      return;
    }

    if (this.isConnecting) {
      LoggingService.debug('RabbitMQ connection in progress, waiting...');
      await this.waitForConnection();
      return;
    }

    this.isConnecting = true;

    try {
      const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
      
      LoggingService.info('Connecting to RabbitMQ', { url: url.replace(/\/\/.*@/, '//***@') });
      
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      // Configurar prefetch para consumers
      const prefetch = parseInt(process.env.RABBITMQ_PREFETCH || '1', 10);
      await this.channel.prefetch(prefetch);

      LoggingService.info('RabbitMQ connected successfully', { prefetch });

      // Resetar contador de tentativas
      this.reconnectAttempts = 0;

      // Event handlers
      this.connection.on('error', (err: Error) => {
        LoggingService.error('RabbitMQ connection error', err);
      });

      this.connection.on('close', () => {
        LoggingService.warn('RabbitMQ connection closed');
        this.connection = null;
        this.channel = null;
        this.handleReconnect();
      });

      this.channel.on('error', (err: Error) => {
        LoggingService.error('RabbitMQ channel error', err);
      });

      this.channel.on('close', () => {
        LoggingService.warn('RabbitMQ channel closed');
        this.channel = null;
      });

    } catch (error) {
      LoggingService.error('Failed to connect to RabbitMQ', error);
      this.connection = null;
      this.channel = null;
      await this.handleReconnect();
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Aguarda a conexão ser estabelecida
   */
  private async waitForConnection(timeout: number = 30000): Promise<void> {
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
  private async handleReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      LoggingService.error('Max reconnect attempts reached, giving up');
      return;
    }

    this.reconnectAttempts++;
    
    LoggingService.info('Attempting to reconnect to RabbitMQ', {
      attempt: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
      delay: this.reconnectDelay
    });

    await new Promise(resolve => setTimeout(resolve, this.reconnectDelay));

    try {
      await this.connect();
    } catch (error) {
      LoggingService.error('Reconnection attempt failed', error);
    }
  }

  /**
   * Obtém o canal do RabbitMQ
   */
  public async getChannel(): Promise<amqp.Channel> {
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
  public isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }

  /**
   * Fecha a conexão com RabbitMQ
   */
  public async close(): Promise<void> {
    try {
      if (this.channel) {
        LoggingService.info('Closing RabbitMQ channel');
        await this.channel.close();
        this.channel = null;
      }

      if (this.connection) {
        LoggingService.info('Closing RabbitMQ connection');
        await this.connection.close();
        this.connection = null;
      }
    } catch (error) {
      LoggingService.error('Error closing RabbitMQ connection', error);
    }
  }
}
