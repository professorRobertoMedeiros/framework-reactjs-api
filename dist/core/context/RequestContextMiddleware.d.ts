import { Request, Response, NextFunction } from 'express';
/**
 * Middleware para inicializar o contexto da requisição
 * Deve ser registrado ANTES de qualquer outro middleware
 *
 * @example
 * app.use(requestContextMiddleware);
 * app.use(authMiddleware);
 * app.use('/api', routes);
 */
export declare function requestContextMiddleware(req: Request, res: Response, next: NextFunction): void;
/**
 * Middleware para capturar usuário autenticado e colocar no contexto
 * Deve ser registrado APÓS o middleware de autenticação
 *
 * Assume que o middleware de autenticação define req.user
 *
 * @example
 * app.use(requestContextMiddleware);
 * app.use(authMiddleware); // Define req.user
 * app.use(captureUserMiddleware); // Captura req.user para o contexto
 * app.use('/api', routes);
 */
export declare function captureUserMiddleware(req: Request & {
    user?: any;
}, res: Response, next: NextFunction): void;
/**
 * Middleware combinado: inicializa contexto E captura usuário
 * Útil quando o usuário já está disponível em req.user
 *
 * @example
 * app.use(authMiddleware); // Define req.user
 * app.use(requestContextWithUserMiddleware); // Inicializa contexto + captura user
 * app.use('/api', routes);
 */
export declare function requestContextWithUserMiddleware(req: Request & {
    user?: any;
}, res: Response, next: NextFunction): void;
