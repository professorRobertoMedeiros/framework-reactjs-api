import express from 'express';
import 'dotenv/config';
import { TracingMiddleware } from '@framework/core/tracing/TracingMiddleware';
import { HTTPLoggerMiddleware } from '@framework/infra/logger/HTTPLoggerMiddleware';
import { LoggingService } from '@framework/core/tracing/LoggingService';
import { MessagingService } from '@framework/infra/messaging';

// Importar consumers
import { EmailConsumer } from './consumers/EmailConsumer';
import { NotificationConsumer } from './consumers/NotificationConsumer';

// Importar routes
import { messagingRoutes } from './routes/messaging';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(TracingMiddleware.addRequestId());
app.use(HTTPLoggerMiddleware.log());

// Rotas
app.use('/api/messaging', messagingRoutes);

// Health check
app.get('/health', (req, res) => {
  const messagingService = MessagingService.getInstance();
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    messaging: {
      connected: messagingService.isConnected(),
      consumers: messagingService.getConsumers().map(c => ({
        name: c.constructor.name,
        active: c.isActive()
      }))
    }
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  LoggingService.error('Unhandled error', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Inicializar mensageria e iniciar servidor
async function bootstrap() {
  try {
    // Conectar ao RabbitMQ
    const messagingService = MessagingService.getInstance();
    await messagingService.connect();

    // Registrar consumers
    const emailConsumer = new EmailConsumer();
    const notificationConsumer = new NotificationConsumer();

    messagingService.registerConsumers([
      emailConsumer,
      notificationConsumer
    ]);

    // Iniciar consumers
    await messagingService.startConsumers();

    // Iniciar servidor HTTP
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🐰 RabbitMQ Example Server                                  ║
║                                                                ║
║   Server running on: http://localhost:${PORT}                     ║
║   Environment: ${process.env.NODE_ENV || 'development'}                             ║
║                                                                ║
║   RabbitMQ: ${messagingService.isConnected() ? '✅ Connected' : '❌ Disconnected'}                                  ║
║   Consumers: ${messagingService.getConsumers().length} active                                    ║
║                                                                ║
║   Try these endpoints:                                         ║
║   - GET  /health                                               ║
║   - POST /api/messaging/email/send                             ║
║   - POST /api/messaging/email/welcome                          ║
║   - POST /api/messaging/email/password-reset                   ║
║   - POST /api/messaging/notification/push                      ║
║   - POST /api/messaging/notification/sms                       ║
║                                                                ║
║   Mensagens publicadas serão processadas automaticamente       ║
║   pelos consumers! Veja os logs para acompanhar.              ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
      `);

      LoggingService.info('Server started successfully', {
        port: PORT,
        env: process.env.NODE_ENV || 'development',
        messaging: {
          connected: messagingService.isConnected(),
          consumers: messagingService.getConsumers().length
        }
      });
    });

  } catch (error) {
    LoggingService.error('Failed to bootstrap application', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  LoggingService.info('SIGTERM received, shutting down gracefully');
  const messagingService = MessagingService.getInstance();
  await messagingService.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  LoggingService.info('SIGINT received, shutting down gracefully');
  const messagingService = MessagingService.getInstance();
  await messagingService.close();
  process.exit(0);
});

// Iniciar aplicação
bootstrap();

export default app;
