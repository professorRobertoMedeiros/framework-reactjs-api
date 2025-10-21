import { BaseConsumer } from '@framework/infra/messaging';
import { LoggingService } from '@framework/core/tracing/LoggingService';
import { ConsumeMessage } from 'amqplib';

/**
 * EmailConsumer - Consumer para processar envio de emails
 * 
 * Consome mensagens da fila 'email.queue' e processa envios de email
 */
export class EmailConsumer extends BaseConsumer {
  constructor() {
    super('email.queue', {
      exchange: 'notifications',
      exchangeType: 'topic',
      routingKey: 'email.*',
      durable: true,
      autoAck: false,
      prefetch: 2
    });
  }

  /**
   * Processa mensagem de email
   */
  protected async handleMessage(message: any, originalMessage?: ConsumeMessage): Promise<void> {
    const routingKey = originalMessage?.fields.routingKey || 'unknown';

    LoggingService.info('Processing email message', {
      routingKey,
      messageType: message._metadata?.producer
    });

    // Simula diferentes tipos de email baseado na routing key
    switch (routingKey) {
      case 'email.send':
        await this.sendGenericEmail(message);
        break;

      case 'email.welcome':
        await this.sendWelcomeEmail(message);
        break;

      case 'email.password_reset':
        await this.sendPasswordResetEmail(message);
        break;

      default:
        LoggingService.warn('Unknown email routing key', { routingKey });
    }
  }

  /**
   * Envia email genérico
   */
  private async sendGenericEmail(data: any): Promise<void> {
    LoggingService.info('Sending generic email', {
      to: data.to,
      subject: data.subject
    });

    // Simula envio de email (delay de 1-3 segundos)
    const delay = Math.random() * 2000 + 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    LoggingService.info('Generic email sent successfully', {
      to: data.to,
      subject: data.subject,
      processingTime: `${delay.toFixed(0)}ms`
    });
  }

  /**
   * Envia email de boas-vindas
   */
  private async sendWelcomeEmail(data: any): Promise<void> {
    LoggingService.info('Sending welcome email', {
      to: data.to,
      name: data.name
    });

    // Simula envio
    const delay = Math.random() * 2000 + 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    LoggingService.info('Welcome email sent successfully', {
      to: data.to,
      name: data.name,
      template: data.template
    });
  }

  /**
   * Envia email de recuperação de senha
   */
  private async sendPasswordResetEmail(data: any): Promise<void> {
    LoggingService.info('Sending password reset email', {
      to: data.to,
      expiresAt: data.expiresAt
    });

    // Simula envio
    const delay = Math.random() * 2000 + 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    LoggingService.info('Password reset email sent successfully', {
      to: data.to,
      tokenLength: data.token?.length || 0
    });
  }
}
