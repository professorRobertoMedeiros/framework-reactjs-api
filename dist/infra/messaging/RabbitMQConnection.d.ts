import * as amqp from 'amqplib';
/**
 * RabbitMQConnection - Gerencia conexão com RabbitMQ
 *
 * Singleton que mantém uma conexão persistente com o RabbitMQ
 * e fornece canais para producers e consumers.
 */
export declare class RabbitMQConnection {
    private static instance;
    private connection;
    private channel;
    private isConnecting;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private reconnectDelay;
    private constructor();
    static getInstance(): RabbitMQConnection;
    /**
     * Conecta ao RabbitMQ
     */
    connect(): Promise<void>;
    /**
     * Aguarda a conexão ser estabelecida
     */
    private waitForConnection;
    /**
     * Tenta reconectar ao RabbitMQ
     */
    private handleReconnect;
    /**
     * Obtém o canal do RabbitMQ
     */
    getChannel(): Promise<amqp.Channel>;
    /**
     * Verifica se está conectado
     */
    isConnected(): boolean;
    /**
     * Fecha a conexão com RabbitMQ
     */
    close(): Promise<void>;
}
