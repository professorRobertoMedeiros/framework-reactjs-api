/**
 * Interface que representa o usuário autenticado no contexto
 */
export interface AuthenticatedUser {
    id?: number;
    email?: string;
    [key: string]: any;
}
/**
 * Interface do contexto da requisição
 */
export interface RequestContextData {
    user?: AuthenticatedUser;
    requestId?: string;
    [key: string]: any;
}
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
export declare class RequestContext {
    private static storage;
    /**
     * Executa uma função dentro de um contexto isolado
     * @param context Dados do contexto
     * @param callback Função a ser executada
     */
    static run<T>(context: RequestContextData, callback: () => T): T;
    /**
     * Define o contexto atual (sobrescreve valores existentes)
     * @param context Dados do contexto
     */
    static set(context: Partial<RequestContextData>): void;
    /**
     * Obtém todo o contexto atual
     */
    static get(): RequestContextData | undefined;
    /**
     * Obtém o usuário autenticado do contexto atual
     * @returns Usuário autenticado ou undefined
     */
    static getCurrentUser(): AuthenticatedUser | undefined;
    /**
     * Define o usuário autenticado no contexto atual
     * @param user Dados do usuário
     */
    static setCurrentUser(user: AuthenticatedUser): void;
    /**
     * Obtém o ID da requisição atual
     */
    static getRequestId(): string | undefined;
    /**
     * Define o ID da requisição atual
     */
    static setRequestId(requestId: string): void;
    /**
     * Limpa o contexto atual
     */
    static clear(): void;
    /**
     * Verifica se existe um usuário autenticado no contexto
     */
    static hasUser(): boolean;
    /**
     * Obtém um valor customizado do contexto
     */
    static getValue<T = any>(key: string): T | undefined;
    /**
     * Define um valor customizado no contexto
     */
    static setValue(key: string, value: any): void;
}
