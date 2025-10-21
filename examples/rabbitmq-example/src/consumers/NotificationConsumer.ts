import { BaseConsumer } from '@framework/infra/messaging';
import { LoggingService } from '@framework/core/tracing/LoggingService';
import { ConsumeMessage } from 'amqplib';

/**
 * NotificationConsumer - Consumer para processar notificações
 */
export class NotificationConsumer extends BaseConsumer {
  constructor() {
    super('notification.queue', {
      exchange: 'notifications',
      exchangeType: 'topic',
      routingKey: 'notification.*',
      durable: true,
      autoAck: false,
      prefetch: 3
    });
  }

  /**
   * Processa mensagem de notificação
   */
  protected async handleMessage(message: any, originalMessage?: ConsumeMessage): Promise<void> {
    const routingKey = originalMessage?.fields.routingKey || 'unknown';

    LoggingService.info('Processing notification message', {
      routingKey,
      messageType: message._metadata?.producer
    });

    switch (routingKey) {
      case 'notification.push':
        await this.sendPushNotification(message);
        break;

      case 'notification.sms':
        await this.sendSMS(message);
        break;

      default:
        LoggingService.warn('Unknown notification routing key', { routingKey });
    }
  }

  /**
   * Envia notificação push
   */
  private async sendPushNotification(data: any): Promise<void> {
    LoggingService.info('Sending push notification', {
      userId: data.userId,
      title: data.title
    });

    // Simula envio de push
    const delay = Math.random() * 1500 + 500;
    await new Promise(resolve => setTimeout(resolve, delay));

    LoggingService.info('Push notification sent successfully', {
      userId: data.userId,
      title: data.title,
      processingTime: `${delay.toFixed(0)}ms`
    });
  }

  /**
   * Envia SMS
   */
  private async sendSMS(data: any): Promise<void> {
    LoggingService.info('Sending SMS', {
      phone: data.phone,
      messageLength: data.message?.length || 0
    });

    // Simula envio de SMS
    const delay = Math.random() * 1500 + 500;
    await new Promise(resolve => setTimeout(resolve, delay));

    LoggingService.info('SMS sent successfully', {
      phone: data.phone,
      processingTime: `${delay.toFixed(0)}ms`
    });
  }
}
