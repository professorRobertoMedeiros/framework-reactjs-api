import { ClienteRepository } from './repository/ClienteRepository';
import { CreateClienteDom, UpdateClienteDom, ClienteDom } from './domains/ClienteDom';
/**
 * Business para Cliente
 * Contém as regras de negócio específicas do domínio
 */
export declare class ClienteBusiness {
    clienteRepository: ClienteRepository;
    constructor(clienteRepository?: ClienteRepository);
    /**
     * Converter modelo para Dom
     * @param model Modelo do Cliente
     * @returns Dom do Cliente
     */
    private toDom;
    /**
     * Converter Dom de criação para modelo
     * @param dom Dom de criação do Cliente
     * @returns Dados para criação do modelo
     */
    private fromCreateDom;
    /**
     * Converter Dom de atualização para dados parciais do modelo
     * @param dom Dom de atualização do Cliente
     * @returns Dados parciais para atualização do modelo
     */
    private fromUpdateDom;
    /**
     * Obter cliente por ID
     * @param id ID do cliente
     * @returns Dom do Cliente ou null se não encontrado
     */
    getById(id: number): Promise<ClienteDom | null>;
    /**
     * Obter todos os clientes
     * @param options Opções de consulta
     * @returns Lista de Doms de Cliente
     */
    getAll(options?: {
        limit?: number;
        offset?: number;
    }): Promise<ClienteDom[]>;
    /**
     * Criar um novo cliente
     * @param data Dados para criação do cliente
     * @returns Dom do Cliente criado
     */
    create(data: CreateClienteDom): Promise<ClienteDom>;
    /**
     * Atualizar um cliente existente
     * @param id ID do cliente
     * @param data Dados para atualização
     * @returns Dom do Cliente atualizado ou null se não encontrado
     */
    update(id: number, data: UpdateClienteDom): Promise<ClienteDom | null>;
    /**
     * Excluir um cliente
     * @param id ID do cliente
     * @returns true se excluído com sucesso, false se não encontrado
     */
    delete(id: number): Promise<boolean>;
    /**
     * Validar dados para criação (regras de negócio)
     * @param data Dados para validação
     */
    private validateCreateData;
    /**
     * Validar dados para atualização (regras de negócio)
     * @param data Dados para validação
     */
    private validateUpdateData;
    /**
     * Validar operação de exclusão (regras de negócio)
     * @param model Modelo para validação
     */
    private validateDeleteOperation;
    /**
     * Buscar clientes ativos
     * @param options Opções de consulta
     * @returns Lista de clientes ativos
     */
    findActive(options?: {
        limit?: number;
        offset?: number;
        orderBy?: string;
    }): Promise<ClienteDom[]>;
    /**
     * Contar registros (método para compatibilidade com BaseService)
     * @returns Número de registros
     */
    count(): Promise<number>;
}
