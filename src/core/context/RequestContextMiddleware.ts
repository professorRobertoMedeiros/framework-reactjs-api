import { Request, Response, NextFunction } from 'express';
import { RequestContext } from '../context/RequestContext';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware para inicializar o contexto da requisição
 * Deve ser registrado ANTES de qualquer outro middleware
 * 
 * @example
 * app.use(requestContextMiddleware);
 * app.use(authMiddleware);
 * app.use('/api', routes);
 */
export function requestContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Gerar ID único para a requisição
  const requestId = uuidv4();

  // Executar toda a cadeia de middlewares e controllers dentro do contexto
  RequestContext.run({ requestId }, () => {
    // Adicionar requestId aos headers de resposta para rastreamento
    res.setHeader('X-Request-ID', requestId);
    
    next();
  });
}

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
export function captureUserMiddleware(
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): void {
  // Se existe usuário autenticado, adicionar ao contexto
  if (req.user) {
    RequestContext.setCurrentUser({
      id: req.user.id,
      email: req.user.email,
      ...req.user
    });
  }

  next();
}

/**
 * Middleware combinado: inicializa contexto E captura usuário
 * Útil quando o usuário já está disponível em req.user
 * 
 * @example
 * app.use(authMiddleware); // Define req.user
 * app.use(requestContextWithUserMiddleware); // Inicializa contexto + captura user
 * app.use('/api', routes);
 */
export function requestContextWithUserMiddleware(
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): void {
  const requestId = uuidv4();

  RequestContext.run({ requestId }, () => {
    res.setHeader('X-Request-ID', requestId);

    // Capturar usuário se disponível
    if (req.user) {
      RequestContext.setCurrentUser({
        id: req.user.id,
        email: req.user.email,
        ...req.user
      });
    }

    next();
  });
}
