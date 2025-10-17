import { Request, Response, NextFunction } from 'express';
import { TracingService } from './TracingService';
import { LoggingService } from './LoggingService';

/**
 * TracingMiddleware - Middleware para adicionar rastreamento em requisições HTTP
 * 
 * Este middleware adiciona um ID único de rastreamento a cada requisição HTTP,
 * disponibilizando-o via headers e no contexto da requisição para logging.
 */
export class TracingMiddleware {
  /**
   * Adiciona um ID de rastreamento a todas as requisições
   */
  static addRequestId() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Verifica se já existe um ID de rastreamento no header da requisição
      const incomingTraceId = req.header('X-Request-ID');
      
      // Executa a requisição em um contexto de rastreamento
      TracingService.runWithTrace(() => {
        // Se já veio um ID, usa ele como metadado
        if (incomingTraceId) {
          TracingService.setMetadata('incomingTraceId', incomingTraceId);
        }
        
        const requestId = TracingService.getRequestId();
        
        // Adiciona o ID ao objeto de requisição para uso em logs
        (req as any).requestId = requestId;
        
        // Adiciona headers para rastreamento na resposta
        res.setHeader('X-Request-ID', requestId);
        
        // Adiciona metadados úteis
        TracingService.setMetadata('method', req.method);
        TracingService.setMetadata('url', req.url);
        TracingService.setMetadata('userAgent', req.header('user-agent') || 'unknown');
        
        // Log da requisição com o ID
        LoggingService.info(`Received ${req.method} request for ${req.url}`);
        
        // Captura o tempo de resposta
        const startHrTime = process.hrtime();
        
        // Intercepta o método end para logar a resposta
        const originalEnd = res.end;
        res.end = function(this: Response, chunk?: any, encoding?: BufferEncoding | (() => void), callback?: () => void): Response {
          // Calcula o tempo de resposta
          const elapsedHrTime = process.hrtime(startHrTime);
          const elapsedTimeMs = (elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6).toFixed(2);
          
          LoggingService.info(`Request ${req.method} ${req.url} completed with status ${res.statusCode} in ${elapsedTimeMs}ms`);
          
          // Chama o método original end com os argumentos corretos
          return originalEnd.call(this, chunk, encoding as any, callback);
        } as unknown as Response['end'];
        
        // Continua para o próximo middleware
        next();
      }, { path: req.path });
    };
  }

  /**
   * Obtém o ID de rastreamento da requisição atual
   */
  static getRequestId(req: Request): string {
    return (req as any).requestId || TracingService.getRequestId();
  }
}