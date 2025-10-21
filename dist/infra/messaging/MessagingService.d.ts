import { BaseConsumer } from './BaseConsumer';
/**
 * MessagingService - Gerencia producers e consumers
 *
 * Facilita o registro e inicialização de consumers,
 * e o gerenciamento do ciclo de vida do RabbitMQ.
 */
export declare class MessagingService {
    private static instance;
    private consumers;
    private connection;
    private constructor();
    static getInstance(): MessagingService;
    /**
     * Conecta ao RabbitMQ
     */
    connect(): Promise<void>;
    /**
     * Registra um consumer
     *
     * @example
     * ```typescript
     * const emailConsumer = new EmailConsumer();
     * messagingService.registerConsumer(emailConsumer);
     * ```
     */
    registerConsumer(consumer: BaseConsumer): void;
    /**
     * Registra múltiplos consumers
     */
    registerConsumers(consumers: BaseConsumer[]): void;
    /**
     * Inicia todos os consumers registrados
     */
    startConsumers(): Promise<void>;
    /**
     * Para todos os consumers
     */
    stopConsumers(): Promise<void>;
    /**
     * Verifica se está conectado
     */
    isConnected(): boolean;
    /**
     * Fecha a conexão com RabbitMQ e para todos os consumers
     */
    close(): Promise<void>;
    /**
     * Obtém lista de consumers registrados
     */
    getConsumers(): BaseConsumer[];
}
