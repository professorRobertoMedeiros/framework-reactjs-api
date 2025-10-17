import { TracingService } from './TracingService';

/**
 * LoggingService - Serviço para logging centralizado com rastreamento
 * 
 * Este serviço fornece métodos para logging com inclusão automática do ID de rastreamento
 * da requisição atual em todos os logs, facilitando a correlação de logs.
 */
export class LoggingService {
  /**
   * Gera um log informativo
   * @param message Mensagem a ser logada
   * @param data Dados adicionais para o log
   */
  static info(message: string, data: any = {}): void {
    this.log('INFO', message, data);
  }

  /**
   * Gera um log de aviso
   * @param message Mensagem a ser logada
   * @param data Dados adicionais para o log
   */
  static warn(message: string, data: any = {}): void {
    this.log('WARN', message, data);
  }

  /**
   * Gera um log de erro
   * @param message Mensagem a ser logada
   * @param error Objeto de erro
   * @param data Dados adicionais para o log
   */
  static error(message: string, error?: unknown, data: any = {}): void {
    let errorData = data;
    
    if (error) {
      if (error instanceof Error) {
        errorData = {
          errorMessage: error.message,
          stack: error.stack,
          ...data
        };
      } else {
        // Tentar extrair informações úteis de erros não-Error
        errorData = {
          errorMessage: String(error),
          rawError: error,
          ...data
        };
      }
    }
    
    this.log('ERROR', message, errorData);
  }

  /**
   * Gera um log de depuração
   * @param message Mensagem a ser logada
   * @param data Dados adicionais para o log
   */
  static debug(message: string, data: any = {}): void {
    if (process.env.DEBUG === 'true') {
      this.log('DEBUG', message, data);
    }
  }

  /**
   * Função interna para geração de logs
   */
  private static log(level: string, message: string, data: any = {}): void {
    const requestId = TracingService.getRequestId();
    const timestamp = new Date().toISOString();
    
    // Formato de log estruturado
    const logData = {
      timestamp,
      level,
      requestId,
      message,
      ...data
    };
    
    // No ambiente de produção, pode-se usar um formato JSON
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(logData));
    } else {
      // Formato mais legível para desenvolvimento
      console.log(`[${timestamp}] [${level}] [${requestId}] ${message}`, 
        Object.keys(data).length ? data : '');
    }
  }
}