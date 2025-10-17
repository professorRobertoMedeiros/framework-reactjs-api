import express from 'express';
import { TracingMiddleware } from './src/core/tracing/TracingMiddleware';
import { LoggingService } from './src/core/tracing/LoggingService';

// Criar aplicação Express
const app = express();

// Aplicar middleware de rastreamento a todas as requisições
app.use(TracingMiddleware.addRequestId());

// Rota de exemplo
app.get('/', (req, res) => {
  LoggingService.info('Processando requisição na rota raiz');
  
  // Simulação de operação assíncrona
  setTimeout(() => {
    LoggingService.info('Operação assíncrona concluída');
    res.json({ message: 'API funcionando!', requestId: TracingMiddleware.getRequestId(req) });
  }, 100);
});

// Rota para teste de erro
app.get('/error', (req, res) => {
  try {
    LoggingService.info('Processando requisição na rota de erro');
    throw new Error('Erro de teste!');
  } catch (error) {
    LoggingService.error('Ocorreu um erro na requisição', error as Error);
    res.status(500).json({ 
      error: 'Erro interno', 
      requestId: TracingMiddleware.getRequestId(req)
    });
  }
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('Teste o sistema de rastreamento com:');
  console.log(`  curl http://localhost:${PORT}`);
  console.log(`  curl http://localhost:${PORT}/error`);
});