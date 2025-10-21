import { Request, Response, NextFunction } from 'express';
/**
 * Middleware para logging de requisições HTTP com rastreamento por UUID
 * Captura método, URL, status, duração, requestId e usuário autenticado (se houver)
 *
 * IMPORTANTE: Este middleware deve ser usado APÓS o TracingMiddleware
 * para garantir que o requestId esteja disponível no contexto
 *
 * Nota: A interface Request já é estendida em AuthMiddleware.ts
 */
export declare class HTTPLoggerMiddleware {
    static log(): (req: Request, res: Response, next: NextFunction) => void;
}
