import { v4 as uuidv4 } from 'uuid';
import { AsyncLocalStorage } from 'async_hooks';

interface TraceContext {
  requestId: string;
  startTime: Date;
  metadata: Record<string, any>;
}

/**
 * TracingService - Serviço para gerenciar IDs de rastreamento de requisições
 * 
 * Este serviço mantém IDs de rastreamento únicos para cada requisição usando AsyncLocalStorage,
 * permitindo que qualquer código no contexto da requisição tenha acesso ao ID de rastreamento.
 */
export class TracingService {
  private static storage = new AsyncLocalStorage<TraceContext>();

  /**
   * Inicia um novo contexto de rastreamento com ID único
   * @param callback Função a ser executada dentro deste contexto de rastreamento
   * @param metadata Metadados adicionais para o contexto
   */
  static runWithTrace<T>(callback: () => T, metadata: Record<string, any> = {}): T {
    const requestId = uuidv4();
    const startTime = new Date();
    return this.storage.run({ requestId, startTime, metadata }, callback);
  }

  /**
   * Obtém o ID de rastreamento do contexto atual
   * @returns O ID de rastreamento ou 'no-trace-id' se não estiver em um contexto de rastreamento
   */
  static getRequestId(): string {
    const context = this.storage.getStore();
    return context?.requestId || 'no-trace-id';
  }

  /**
   * Obtém o tempo de início da requisição atual
   */
  static getStartTime(): Date | null {
    const context = this.storage.getStore();
    return context?.startTime || null;
  }

  /**
   * Registra um valor de metadados no contexto de rastreamento atual
   */
  static setMetadata(key: string, value: any): void {
    const context = this.storage.getStore();
    if (context) {
      context.metadata[key] = value;
    }
  }

  /**
   * Obtém um valor de metadados do contexto de rastreamento atual
   */
  static getMetadata<T>(key: string): T | undefined {
    const context = this.storage.getStore();
    return context?.metadata[key] as T;
  }

  /**
   * Obtém todos os metadados do contexto de rastreamento atual
   */
  static getAllMetadata(): Record<string, any> {
    const context = this.storage.getStore();
    return context?.metadata || {};
  }
}