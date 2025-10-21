import express from 'express';
import 'dotenv/config';
import { TracingMiddleware } from '@framework/core/tracing/TracingMiddleware';
import { HTTPLoggerMiddleware } from '@framework/infra/logger/HTTPLoggerMiddleware';
import { LoggingService } from '@framework/core/tracing/LoggingService';
import { productRoutes } from './routes/products';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares essenciais
app.use(express.json());

// IMPORTANTE: TracingMiddleware DEVE ser o primeiro
// Ele gera o UUID único para cada requisição
app.use(TracingMiddleware.addRequestId());

// HTTPLoggerMiddleware registra entrada e saída de requisições
app.use(HTTPLoggerMiddleware.log());

// Rotas
app.use('/api/products', productRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  LoggingService.info('Health check requested');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🚀 Logging Example Server                                   ║
║                                                                ║
║   Server running on: http://localhost:${PORT}                     ║
║   Environment: ${process.env.NODE_ENV || 'development'}                             ║
║                                                                ║
║   Logging Configuration:                                       ║
║   - LOG_ENABLED: ${process.env.LOG_ENABLED || 'true'}                                ║
║   - LOG_LEVEL: ${process.env.LOG_LEVEL || 'info'}                                  ║
║   - LOG_SQL: ${process.env.LOG_SQL || 'true'}                                    ║
║   - LOG_HTTP: ${process.env.LOG_HTTP || 'true'}                                   ║
║                                                                ║
║   Try these endpoints:                                         ║
║   - GET  /health                                               ║
║   - GET  /api/products                                         ║
║   - POST /api/products                                         ║
║   - GET  /api/products/:id                                     ║
║                                                                ║
║   Cada requisição terá um UUID único que aparecerá em         ║
║   TODOS os logs, incluindo logs SQL!                          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
  
  LoggingService.info('Server started successfully', { 
    port: PORT, 
    env: process.env.NODE_ENV || 'development' 
  });
});

export default app;
