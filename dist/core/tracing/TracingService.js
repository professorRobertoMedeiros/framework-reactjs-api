"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TracingService = void 0;
const uuid_1 = require("uuid");
const async_hooks_1 = require("async_hooks");
/**
 * TracingService - Serviço para gerenciar IDs de rastreamento de requisições
 *
 * Este serviço mantém IDs de rastreamento únicos para cada requisição usando AsyncLocalStorage,
 * permitindo que qualquer código no contexto da requisição tenha acesso ao ID de rastreamento.
 */
class TracingService {
    /**
     * Inicia um novo contexto de rastreamento com ID único
     * @param callback Função a ser executada dentro deste contexto de rastreamento
     * @param metadata Metadados adicionais para o contexto
     */
    static runWithTrace(callback, metadata = {}) {
        const requestId = (0, uuid_1.v4)();
        const startTime = new Date();
        return this.storage.run({ requestId, startTime, metadata }, callback);
    }
    /**
     * Obtém o ID de rastreamento do contexto atual
     * @returns O ID de rastreamento ou 'no-trace-id' se não estiver em um contexto de rastreamento
     */
    static getRequestId() {
        const context = this.storage.getStore();
        return context?.requestId || 'no-trace-id';
    }
    /**
     * Obtém o tempo de início da requisição atual
     */
    static getStartTime() {
        const context = this.storage.getStore();
        return context?.startTime || null;
    }
    /**
     * Registra um valor de metadados no contexto de rastreamento atual
     */
    static setMetadata(key, value) {
        const context = this.storage.getStore();
        if (context) {
            context.metadata[key] = value;
        }
    }
    /**
     * Obtém um valor de metadados do contexto de rastreamento atual
     */
    static getMetadata(key) {
        const context = this.storage.getStore();
        return context?.metadata[key];
    }
    /**
     * Obtém todos os metadados do contexto de rastreamento atual
     */
    static getAllMetadata() {
        const context = this.storage.getStore();
        return context?.metadata || {};
    }
}
exports.TracingService = TracingService;
TracingService.storage = new async_hooks_1.AsyncLocalStorage();
//# sourceMappingURL=TracingService.js.map