import { ProductRepository } from './repository/ProductRepository';
import { CreateProductDom, UpdateProductDom, ProductDom } from './domains/ProductDom';
/**
 * Business para Product
 * Contém as regras de negócio específicas do domínio
 */
export declare class ProductBusiness {
    productRepository: ProductRepository;
    constructor(productRepository?: ProductRepository);
    /**
     * Converter modelo para Dom
     * @param model Modelo do Product
     * @returns Dom do Product
     */
    private toDom;
    /**
     * Converter Dom de criação para modelo
     * @param dom Dom de criação do Product
     * @returns Dados para criação do modelo
     */
    private fromCreateDom;
    /**
     * Converter Dom de atualização para dados parciais do modelo
     * @param dom Dom de atualização do Product
     * @returns Dados parciais para atualização do modelo
     */
    private fromUpdateDom;
    /**
     * Obter product por ID
     * @param id ID do product
     * @returns Dom do Product ou null se não encontrado
     */
    getById(id: number): Promise<ProductDom | null>;
    /**
     * Obter todos os products
     * @param options Opções de consulta
     * @returns Lista de Doms de Product
     */
    getAll(options?: {
        limit?: number;
        offset?: number;
    }): Promise<ProductDom[]>;
    /**
     * Criar um novo product
     * @param data Dados para criação do product
     * @returns Dom do Product criado
     */
    create(data: CreateProductDom): Promise<ProductDom>;
    /**
     * Atualizar um product existente
     * @param id ID do product
     * @param data Dados para atualização
     * @returns Dom do Product atualizado ou null se não encontrado
     */
    update(id: number, data: UpdateProductDom): Promise<ProductDom | null>;
    /**
     * Excluir um product
     * @param id ID do product
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
     * Buscar products ativos
     * @param options Opções de consulta
     * @returns Lista de products ativos
     */
    findActive(options?: {
        limit?: number;
        offset?: number;
        orderBy?: string;
    }): Promise<ProductDom[]>;
    /**
     * Contar registros (método para compatibilidade com BaseService)
     * @returns Número de registros
     */
    count(): Promise<number>;
}
