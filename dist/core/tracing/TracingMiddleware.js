"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TracingMiddleware = void 0;
const TracingService_1 = require("./TracingService");
const LoggingService_1 = require("./LoggingService");
/**
 * TracingMiddleware - Middleware para adicionar rastreamento em requisições HTTP
 *
 * Este middleware adiciona um ID único de rastreamento a cada requisição HTTP,
 * disponibilizando-o via headers e no contexto da requisição para logging.
 */
class TracingMiddleware {
    /**
     * Adiciona um ID de rastreamento a todas as requisições
     */
    static addRequestId() {
        return (req, res, next) => {
            // Verifica se já existe um ID de rastreamento no header da requisição
            const incomingTraceId = req.header('X-Request-ID');
            // Executa a requisição em um contexto de rastreamento
            TracingService_1.TracingService.runWithTrace(() => {
                // Se já veio um ID, usa ele como metadado
                if (incomingTraceId) {
                    TracingService_1.TracingService.setMetadata('incomingTraceId', incomingTraceId);
                }
                const requestId = TracingService_1.TracingService.getRequestId();
                // Adiciona o ID ao objeto de requisição para uso em logs
                req.requestId = requestId;
                // Adiciona headers para rastreamento na resposta
                res.setHeader('X-Request-ID', requestId);
                // Adiciona metadados úteis
                TracingService_1.TracingService.setMetadata('method', req.method);
                TracingService_1.TracingService.setMetadata('url', req.url);
                TracingService_1.TracingService.setMetadata('userAgent', req.header('user-agent') || 'unknown');
                // Log da requisição com o ID
                LoggingService_1.LoggingService.info(`Received ${req.method} request for ${req.url}`);
                // Captura o tempo de resposta
                const startHrTime = process.hrtime();
                // Intercepta o método end para logar a resposta
                const originalEnd = res.end;
                res.end = function (chunk, encoding, callback) {
                    // Calcula o tempo de resposta
                    const elapsedHrTime = process.hrtime(startHrTime);
                    const elapsedTimeMs = (elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6).toFixed(2);
                    LoggingService_1.LoggingService.info(`Request ${req.method} ${req.url} completed with status ${res.statusCode} in ${elapsedTimeMs}ms`);
                    // Chama o método original end com os argumentos corretos
                    return originalEnd.call(this, chunk, encoding, callback);
                };
                // Continua para o próximo middleware
                next();
            }, { path: req.path });
        };
    }
    /**
     * Obtém o ID de rastreamento da requisição atual
     */
    static getRequestId(req) {
        return req.requestId || TracingService_1.TracingService.getRequestId();
    }
}
exports.TracingMiddleware = TracingMiddleware;
//# sourceMappingURL=TracingMiddleware.js.map