import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: any;
            token?: string;
        }
    }
}
/**
 * Middleware de autenticação para Express
 */
export declare class AuthMiddleware {
    private authService;
    constructor();
    /**
     * Middleware para proteger rotas que requerem autenticação
     * @returns Express middleware function
     */
    authenticate(): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
    /**
     * Middleware para verificar se usuário tem uma das funções necessárias
     * @param roles Array de funções permitidas
     * @returns Express middleware function
     */
    hasRole(roles: string[]): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
}
