"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const AuthService_1 = require("./AuthService");
const RequestContext_1 = require("../context/RequestContext");
/**
 * Middleware de autenticação para Express
 */
class AuthMiddleware {
    constructor() {
        this.authService = new AuthService_1.AuthService();
    }
    /**
     * Middleware para proteger rotas que requerem autenticação
     * @returns Express middleware function
     */
    authenticate() {
        return (req, res, next) => {
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
            const verification = this.authService.verifyToken(token);
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
                RequestContext_1.RequestContext.setCurrentUser(verification.payload);
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
    hasRole(roles) {
        return (req, res, next) => {
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
exports.AuthMiddleware = AuthMiddleware;
//# sourceMappingURL=AuthMiddleware.js.map