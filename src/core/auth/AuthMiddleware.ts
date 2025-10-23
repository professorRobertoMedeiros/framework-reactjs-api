import { Request, Response, NextFunction } from 'express';
import { AuthService, TokenVerificationResult } from './AuthService';
import { RequestContext } from '../context/RequestContext';

// Extensão da interface Request para incluir o usuário autenticado
declare global {
  namespace Express {
    interface Request {
      user?: any; // Informações do usuário autenticado
      token?: string; // Token usado na requisição
    }
  }
}

/**
 * Middleware de autenticação para Express
 */
export class AuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Middleware para proteger rotas que requerem autenticação
   * @returns Express middleware function
   */
  public authenticate() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Obter token do cabeçalho
      const token = this.authService.extractTokenFromHeader(req.headers.authorization);

      // Se token não for encontrado
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Token de autenticação não fornecido',
          error: 'UNAUTHORIZED'
        });
      }

      // Verificar token
      const verification: TokenVerificationResult = this.authService.verifyToken(token);

      // Se token for inválido
      if (!verification.valid) {
        return res.status(401).json({
          success: false,
          message: 'Token de autenticação inválido ou expirado',
          error: verification.error
        });
      }

      // Token é válido, adicionar informações do usuário ao request
      req.user = verification.payload;
      req.token = token;

      // Popular o contexto da requisição com o usuário autenticado
      if (verification.payload) {
        RequestContext.setCurrentUser(verification.payload as any);
      }

      // Continuar para o próximo middleware/controlador
      next();
    };
  }

  /**
   * Middleware para verificar se usuário tem uma das funções necessárias
   * @param roles Array de funções permitidas
   * @returns Express middleware function
   */
  public hasRole(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      // Este middleware deve ser usado após o middleware authenticate
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Não autenticado',
          error: 'UNAUTHORIZED'
        });
      }

      // Verificar se o usuário tem pelo menos uma das funções necessárias
      const userRoles = req.user.roles || [];
      const hasRequiredRole = roles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        return res.status(403).json({
          success: false,
          message: 'Permissão negada',
          error: 'FORBIDDEN'
        });
      }

      // Usuário tem permissão, continuar para o próximo middleware/controlador
      next();
    };
  }
}