import { BaseRepository } from '../../infra/repository/BaseRepository';
/**
 * Classe base para Business Layer
 * Delega operações CRUD para o Repository sem reimplementá-las
 *
 * @template T - Tipo do modelo de domínio
 * @template TDom - Tipo do objeto de domínio (DTO)
 */
export declare abstract class BaseBusiness<T = any, TDom = T> {
    protected repository: BaseRepository<any>;
    constructor(repository: BaseRepository<any>);
    /**
     * Converter modelo para Dom (DTO)
     * Por padrão, retorna o próprio modelo sem transformação
     * Sobrescreva este método se precisar transformar os dados
     *
     * @param model Modelo do banco de dados
     * @returns Dom (DTO) ou o próprio modelo se não houver transformação
     */
    protected toDom(model: T): TDom;
    /**
     * Converter dados de entrada para modelo
     * Deve ser implementado pelas classes filhas se necessário
     */
    protected fromCreateData(data: any): Omit<T, 'id'>;
    /**
     * Buscar por ID - Delega para repository
     */
    findById(id: number): Promise<TDom | null>;
    /**
     * Buscar todos - Delega para repository
     */
    findAll(options?: {
        limit?: number;
        offset?: number;
    }): Promise<TDom[]>;
    /**
     * Buscar por condições - Delega para repository
     */
    findBy(conditions: Record<string, any>, options?: {
        limit?: number;
        offset?: number;
        orderBy?: string;
    }): Promise<TDom[]>;
    /**
     * Criar - Delega para repository
     */
    create(data: any): Promise<TDom>;
    /**
     * Atualizar - Delega para repository
     */
    update(id: number, data: any): Promise<TDom | null>;
    /**
     * Deletar - Delega para repository
     */
    delete(id: number): Promise<boolean>;
    /**
     * Contar - Delega para repository
     */
    count(conditions?: Record<string, any>): Promise<number>;
}
