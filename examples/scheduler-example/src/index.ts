import express from 'express';
import dotenv from 'dotenv';
import { setupFramework, shutdownScheduler } from 'framework-reactjs-api';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Middleware para JSON
app.use(express.json());

/**
 * Configurar framework com scheduler habilitado
 * 
 * O scheduler será iniciado automaticamente se SCHEDULER_AUTO_START=true no .env
 */
setupFramework(app, {
  enableScheduler: true,  // Habilita scheduler e suas rotas
  
  // Opções do scheduler (podem ser sobrescritas pelas variáveis de ambiente)
  schedulerOptions: {
    autoStart: true,        // Será sobrescrito por SCHEDULER_AUTO_START do .env
    maxConcurrent: 3,       // Será sobrescrito por SCHEDULER_MAX_CONCURRENT do .env
  }
});

// Rota de teste
app.get('/', (req, res) => {
  res.json({
    message: 'Scheduler Example API',
    endpoints: {
      health: 'GET /',
      scheduler: {
        status: 'GET /api/scheduler/status',
        reload: 'POST /api/scheduler/reload',
        jobs: 'GET /api/scheduler/jobs',
        createJob: 'POST /api/scheduler/jobs',
        runJob: 'POST /api/scheduler/jobs/:id/run'
      },
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      }
    }
  });
});

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📅 Scheduler: ${process.env.SCHEDULER_ENABLED === 'true' ? 'HABILITADO' : 'DESABILITADO'}`);
  console.log(`🔄 Auto-start: ${process.env.SCHEDULER_AUTO_START !== 'false' ? 'SIM' : 'NÃO'}`);
  console.log(`\n📖 Documentação da API: http://localhost:${PORT}\n`);
});

/**
 * Shutdown graceful
 * Para o scheduler antes de encerrar o servidor
 */
process.on('SIGINT', async () => {
  console.log('\n⏹️  Encerrando servidor...');
  
  // Parar scheduler
  await shutdownScheduler();
  
  // Fechar servidor
  server.close(() => {
    console.log('✅ Servidor encerrado com sucesso');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('\n⏹️  Encerrando servidor...');
  await shutdownScheduler();
  server.close(() => {
    console.log('✅ Servidor encerrado com sucesso');
    process.exit(0);
  });
});
