import { OrderRepository } from './repository/OrderRepository';
import { CreateOrderDom, UpdateOrderDom, OrderDom } from './domains/OrderDom';
/**
 * Business para Order
 * Contém as regras de negócio específicas do domínio
 */
export declare class OrderBusiness {
    orderRepository: OrderRepository;
    constructor(orderRepository?: OrderRepository);
    /**
     * Converter modelo para Dom
     * @param model Modelo do Order
     * @returns Dom do Order
     */
    private toDom;
    /**
     * Converter Dom de criação para modelo
     * @param dom Dom de criação do Order
     * @returns Dados para criação do modelo
     */
    private fromCreateDom;
    /**
     * Converter Dom de atualização para dados parciais do modelo
     * @param dom Dom de atualização do Order
     * @returns Dados parciais para atualização do modelo
     */
    private fromUpdateDom;
    /**
     * Obter order por ID
     * @param id ID do order
     * @returns Dom do Order ou null se não encontrado
     */
    getById(id: number): Promise<OrderDom | null>;
    /**
     * Obter todos os orders
     * @param options Opções de consulta
     * @returns Lista de Doms de Order
     */
    getAll(options?: {
        limit?: number;
        offset?: number;
    }): Promise<OrderDom[]>;
    /**
     * Criar um novo order
     * @param data Dados para criação do order
     * @returns Dom do Order criado
     */
    create(data: CreateOrderDom): Promise<OrderDom>;
    /**
     * Atualizar um order existente
     * @param id ID do order
     * @param data Dados para atualização
     * @returns Dom do Order atualizado ou null se não encontrado
     */
    update(id: number, data: UpdateOrderDom): Promise<OrderDom | null>;
    /**
     * Excluir um order
     * @param id ID do order
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
     * Buscar orders ativos
     * @param options Opções de consulta
     * @returns Lista de orders ativos
     */
    findActive(options?: {
        limit?: number;
        offset?: number;
        orderBy?: string;
    }): Promise<OrderDom[]>;
    /**
     * Contar registros (método para compatibilidade com BaseService)
     * @returns Número de registros
     */
    count(): Promise<number>;
}
