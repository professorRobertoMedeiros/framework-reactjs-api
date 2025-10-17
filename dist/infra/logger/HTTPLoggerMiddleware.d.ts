import { Request, Response, NextFunction } from 'express';
/**
 * Middleware para logging de requisições HTTP
 * Captura método, URL, status, duração e usuário autenticado (se houver)
 *
 * Nota: A interface Request já é estendida em AuthMiddleware.ts
 */
export declare class HTTPLoggerMiddleware {
    static log(): (req: Request, res: Response, next: NextFunction) => void;
}
