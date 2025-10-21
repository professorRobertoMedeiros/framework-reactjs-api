import { BaseProducer } from '@framework/infra/messaging';

/**
 * NotificationProducer - Producer para notificações push
 */
export class NotificationProducer extends BaseProducer {
  constructor() {
    super('notification.queue', {
      exchange: 'notifications',
      exchangeType: 'topic',
      durable: true,
      persistent: true
    });
  }

  /**
   * Envia notificação push
   */
  async sendPushNotification(data: {
    userId: number;
    title: string;
    message: string;
    data?: any;
  }): Promise<boolean> {
    return this.publish('notification.push', {
      ...data,
      sentAt: new Date().toISOString()
    });
  }

  /**
   * Envia notificação SMS
   */
  async sendSMS(phone: string, message: string): Promise<boolean> {
    return this.publish('notification.sms', {
      phone,
      message,
      sentAt: new Date().toISOString()
    });
  }
}
