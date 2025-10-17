"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPLoggerMiddleware = void 0;
const Logger_1 = require("./Logger");
/**
 * Middleware para logging de requisições HTTP
 * Captura método, URL, status, duração e usuário autenticado (se houver)
 *
 * Nota: A interface Request já é estendida em AuthMiddleware.ts
 */
class HTTPLoggerMiddleware {
    static log() {
        return (req, res, next) => {
            const startTime = Date.now();
            // Capturar informações da requisição
            const method = req.method;
            const url = req.originalUrl || req.url;
            const ip = req.ip || req.socket.remoteAddress || 'unknown';
            const userAgent = req.headers['user-agent'];
            // Interceptar o método res.json para capturar quando a resposta é enviada
            const originalJson = res.json.bind(res);
            res.json = function (body) {
                const duration = Date.now() - startTime;
                const statusCode = res.statusCode;
                // Extrair usuário se estiver autenticado
                const user = req.user ? {
                    id: req.user.userId,
                    email: req.user.email
                } : null;
                // Log da requisição
                Logger_1.logger.logHTTP(method, url, statusCode, duration, ip, userAgent, user);
                return originalJson(body);
            };
            // Interceptar res.send também
            const originalSend = res.send.bind(res);
            res.send = function (body) {
                const duration = Date.now() - startTime;
                const statusCode = res.statusCode;
                const user = req.user ? {
                    id: req.user.userId,
                    email: req.user.email
                } : null;
                Logger_1.logger.logHTTP(method, url, statusCode, duration, ip, userAgent, user);
                return originalSend(body);
            };
            next();
        };
    }
}
exports.HTTPLoggerMiddleware = HTTPLoggerMiddleware;
//# sourceMappingURL=HTTPLoggerMiddleware.js.map