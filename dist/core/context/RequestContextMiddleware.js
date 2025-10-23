"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestContextMiddleware = requestContextMiddleware;
exports.captureUserMiddleware = captureUserMiddleware;
exports.requestContextWithUserMiddleware = requestContextWithUserMiddleware;
const RequestContext_1 = require("../context/RequestContext");
const uuid_1 = require("uuid");
/**
 * Middleware para inicializar o contexto da requisição
 * Deve ser registrado ANTES de qualquer outro middleware
 *
 * @example
 * app.use(requestContextMiddleware);
 * app.use(authMiddleware);
 * app.use('/api', routes);
 */
function requestContextMiddleware(req, res, next) {
    // Gerar ID único para a requisição
    const requestId = (0, uuid_1.v4)();
    // Executar toda a cadeia de middlewares e controllers dentro do contexto
    RequestContext_1.RequestContext.run({ requestId }, () => {
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
function captureUserMiddleware(req, res, next) {
    // Se existe usuário autenticado, adicionar ao contexto
    if (req.user) {
        RequestContext_1.RequestContext.setCurrentUser({
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
function requestContextWithUserMiddleware(req, res, next) {
    const requestId = (0, uuid_1.v4)();
    RequestContext_1.RequestContext.run({ requestId }, () => {
        res.setHeader('X-Request-ID', requestId);
        // Capturar usuário se disponível
        if (req.user) {
            RequestContext_1.RequestContext.setCurrentUser({
                id: req.user.id,
                email: req.user.email,
                ...req.user
            });
        }
        next();
    });
}
//# sourceMappingURL=RequestContextMiddleware.js.map