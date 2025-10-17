import { Request, Response, NextFunction } from 'express';
/**
 * TracingMiddleware - Middleware para adicionar rastreamento em requisições HTTP
 *
 * Este middleware adiciona um ID único de rastreamento a cada requisição HTTP,
 * disponibilizando-o via headers e no contexto da requisição para logging.
 */
export declare class TracingMiddleware {
    /**
     * Adiciona um ID de rastreamento a todas as requisições
     */
    static addRequestId(): (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Obtém o ID de rastreamento da requisição atual
     */
    static getRequestId(req: Request): string;
}
