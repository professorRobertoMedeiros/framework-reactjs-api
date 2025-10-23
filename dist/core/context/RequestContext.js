"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestContext = void 0;
const async_hooks_1 = require("async_hooks");
/**
 * RequestContext - Gerenciador de contexto de requisição usando AsyncLocalStorage
 * Similar ao SecurityContext do Spring Security
 *
 * Permite armazenar e recuperar dados da requisição atual em qualquer camada da aplicação
 * sem precisar passar explicitamente os dados através dos parâmetros das funções.
 *
 * @example
 * // No middleware de autenticação
 * RequestContext.set({ user: { id: 1, email: 'user@test.com' } });
 *
 * // Em qualquer lugar da aplicação
 * const user = RequestContext.getCurrentUser();
 * console.log(user.email); // user@test.com
 */
class RequestContext {
    /**
     * Executa uma função dentro de um contexto isolado
     * @param context Dados do contexto
     * @param callback Função a ser executada
     */
    static run(context, callback) {
        return this.storage.run(context, callback);
    }
    /**
     * Define o contexto atual (sobrescreve valores existentes)
     * @param context Dados do contexto
     */
    static set(context) {
        const current = this.storage.getStore() || {};
        Object.assign(current, context);
    }
    /**
     * Obtém todo o contexto atual
     */
    static get() {
        return this.storage.getStore();
    }
    /**
     * Obtém o usuário autenticado do contexto atual
     * @returns Usuário autenticado ou undefined
     */
    static getCurrentUser() {
        return this.storage.getStore()?.user;
    }
    /**
     * Define o usuário autenticado no contexto atual
     * @param user Dados do usuário
     */
    static setCurrentUser(user) {
        this.set({ user });
    }
    /**
     * Obtém o ID da requisição atual
     */
    static getRequestId() {
        return this.storage.getStore()?.requestId;
    }
    /**
     * Define o ID da requisição atual
     */
    static setRequestId(requestId) {
        this.set({ requestId });
    }
    /**
     * Limpa o contexto atual
     */
    static clear() {
        const store = this.storage.getStore();
        if (store) {
            Object.keys(store).forEach(key => delete store[key]);
        }
    }
    /**
     * Verifica se existe um usuário autenticado no contexto
     */
    static hasUser() {
        return !!this.getCurrentUser();
    }
    /**
     * Obtém um valor customizado do contexto
     */
    static getValue(key) {
        return this.storage.getStore()?.[key];
    }
    /**
     * Define um valor customizado no contexto
     */
    static setValue(key, value) {
        this.set({ [key]: value });
    }
}
exports.RequestContext = RequestContext;
RequestContext.storage = new async_hooks_1.AsyncLocalStorage();
//# sourceMappingURL=RequestContext.js.map