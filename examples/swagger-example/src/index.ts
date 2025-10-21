import express from 'express';
import dotenv from 'dotenv';
import { setupFramework, TracingMiddleware } from 'framework-reactjs-api';
import productRoutes from './routes/products';

// Carregar variáveis de ambiente
dotenv.config();

// Criar aplicação Express
const app = express();

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// TracingMiddleware DEVE ser o primeiro (para gerar requestId)
app.use(TracingMiddleware.addRequestId());

// Configurar framework com Swagger habilitado
setupFramework(app, {
  enableAuth: true,
  enableSwagger: true,
  swaggerOptions: {
    title: 'Products API',
    description: 'API de exemplo demonstrando integração com Swagger',
    version: '1.0.0',
    serverUrl: process.env.API_URL || 'http://localhost:3000',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
      url: 'https://example.com'
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Authentication endpoints'
      },
      {
        name: 'Products',
        description: 'Product management endpoints'
      }
    ],
    apis: ['./src/**/*.ts']
  }
});

// Rotas personalizadas
app.use('/api/products', productRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'Products API with Swagger',
    documentation: '/docs',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products'
    }
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📚 Documentação: http://localhost:${PORT}/docs`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`📦 Products: http://localhost:${PORT}/api/products`);
});

// Shutdown graceful
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
