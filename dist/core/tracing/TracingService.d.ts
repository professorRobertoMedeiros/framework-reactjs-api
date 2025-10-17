/**
 * TracingService - Serviço para gerenciar IDs de rastreamento de requisições
 *
 * Este serviço mantém IDs de rastreamento únicos para cada requisição usando AsyncLocalStorage,
 * permitindo que qualquer código no contexto da requisição tenha acesso ao ID de rastreamento.
 */
export declare class TracingService {
    private static storage;
    /**
     * Inicia um novo contexto de rastreamento com ID único
     * @param callback Função a ser executada dentro deste contexto de rastreamento
     * @param metadata Metadados adicionais para o contexto
     */
    static runWithTrace<T>(callback: () => T, metadata?: Record<string, any>): T;
    /**
     * Obtém o ID de rastreamento do contexto atual
     * @returns O ID de rastreamento ou 'no-trace-id' se não estiver em um contexto de rastreamento
     */
    static getRequestId(): string;
    /**
     * Obtém o tempo de início da requisição atual
     */
    static getStartTime(): Date | null;
    /**
     * Registra um valor de metadados no contexto de rastreamento atual
     */
    static setMetadata(key: string, value: any): void;
    /**
     * Obtém um valor de metadados do contexto de rastreamento atual
     */
    static getMetadata<T>(key: string): T | undefined;
    /**
     * Obtém todos os metadados do contexto de rastreamento atual
     */
    static getAllMetadata(): Record<string, any>;
}
