/**
 * LoggingService - Serviço para logging centralizado com rastreamento
 *
 * Este serviço fornece métodos para logging com inclusão automática do ID de rastreamento
 * da requisição atual em todos os logs, facilitando a correlação de logs.
 */
export declare class LoggingService {
    /**
     * Gera um log informativo
     * @param message Mensagem a ser logada
     * @param data Dados adicionais para o log
     */
    static info(message: string, data?: any): void;
    /**
     * Gera um log de aviso
     * @param message Mensagem a ser logada
     * @param data Dados adicionais para o log
     */
    static warn(message: string, data?: any): void;
    /**
     * Gera um log de erro
     * @param message Mensagem a ser logada
     * @param error Objeto de erro
     * @param data Dados adicionais para o log
     */
    static error(message: string, error?: Error, data?: any): void;
    /**
     * Gera um log de depuração
     * @param message Mensagem a ser logada
     * @param data Dados adicionais para o log
     */
    static debug(message: string, data?: any): void;
    /**
     * Função interna para geração de logs
     */
    private static log;
}
