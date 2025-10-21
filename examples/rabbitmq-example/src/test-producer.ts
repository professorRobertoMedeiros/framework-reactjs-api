import 'dotenv/config';
import { RabbitMQConnection } from '@framework/infra/messaging';
import { LoggingService } from '@framework/core/tracing/LoggingService';
import { EmailProducer } from './producers/EmailProducer';
import { NotificationProducer } from './producers/NotificationProducer';

/**
 * Script para testar producers sem iniciar o servidor
 */
async function testProducers() {
  try {
    console.log('🚀 Testing RabbitMQ Producers\n');

    // Conectar ao RabbitMQ
    const connection = RabbitMQConnection.getInstance();
    await connection.connect();

    console.log('✅ Connected to RabbitMQ\n');

    // Instanciar producers
    const emailProducer = new EmailProducer();
    const notificationProducer = new NotificationProducer();

    // Teste 1: Email genérico
    console.log('📧 Test 1: Sending generic email...');
    await emailProducer.sendEmail({
      to: 'test@example.com',
      subject: 'Test Subject',
      body: 'This is a test email'
    });
    console.log('✅ Email queued\n');
    await sleep(1000);

    // Teste 2: Email de boas-vindas
    console.log('👋 Test 2: Sending welcome email...');
    await emailProducer.sendWelcomeEmail('newuser@example.com', 'John Doe');
    console.log('✅ Welcome email queued\n');
    await sleep(1000);

    // Teste 3: Email de reset de senha
    console.log('🔑 Test 3: Sending password reset email...');
    await emailProducer.sendPasswordResetEmail('user@example.com', 'token123456');
    console.log('✅ Password reset email queued\n');
    await sleep(1000);

    // Teste 4: Push notification
    console.log('🔔 Test 4: Sending push notification...');
    await notificationProducer.sendPushNotification({
      userId: 42,
      title: 'New Message',
      message: 'You have a new message!',
      data: { messageId: 123 }
    });
    console.log('✅ Push notification queued\n');
    await sleep(1000);

    // Teste 5: SMS
    console.log('📱 Test 5: Sending SMS...');
    await notificationProducer.sendSMS('+5511999999999', 'Your code is: 123456');
    console.log('✅ SMS queued\n');

    console.log('🎉 All messages published successfully!');
    console.log('\n💡 Start the consumer server to process these messages:');
    console.log('   npm run dev\n');

    // Fechar conexão
    await connection.close();
    process.exit(0);

  } catch (error) {
    LoggingService.error('Error testing producers', error);
    process.exit(1);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Executar testes
testProducers();
