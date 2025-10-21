import { BaseProducer } from '@framework/infra/messaging';

/**
 * EmailProducer - Producer para envio de emails
 * 
 * Publica mensagens na fila 'email.queue' usando o exchange 'notifications'
 */
export class EmailProducer extends BaseProducer {
  constructor() {
    super('email.queue', {
      exchange: 'notifications',
      exchangeType: 'topic',
      durable: true,
      persistent: true
    });
  }

  /**
   * Envia um email
   */
  async sendEmail(data: {
    to: string;
    subject: string;
    body: string;
    from?: string;
  }): Promise<boolean> {
    return this.publish('email.send', {
      ...data,
      from: data.from || 'noreply@example.com',
      sentAt: new Date().toISOString()
    });
  }

  /**
   * Envia email de boas-vindas
   */
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    return this.publish('email.welcome', {
      to: email,
      name,
      template: 'welcome',
      sentAt: new Date().toISOString()
    });
  }

  /**
   * Envia email de recuperação de senha
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    return this.publish('email.password_reset', {
      to: email,
      token,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hora
      sentAt: new Date().toISOString()
    });
  }
}
