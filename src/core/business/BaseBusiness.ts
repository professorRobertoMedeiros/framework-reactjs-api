import { BaseRepository } from '../../infra/repository/BaseRepository';

/**
 * Classe base para Business Layer
 * Delega operações CRUD para o Repository sem reimplementá-las
 * 
 * @template T - Tipo do modelo de domínio
 * @template TDom - Tipo do objeto de domínio (DTO)
 */
export abstract class BaseBusiness<T = any, TDom = T> {
  protected repository: BaseRepository<any>;

  constructor(repository: BaseRepository<any>) {
    this.repository = repository;
  }

  /**
   * Converter modelo para Dom (DTO)
   * Por padrão, retorna o próprio modelo sem transformação
   * Sobrescreva este método se precisar transformar os dados
   * 
   * @param model Modelo do banco de dados
   * @returns Dom (DTO) ou o próprio modelo se não houver transformação
   */
  protected toDom(model: T): TDom {
    return model as unknown as TDom;
  }

  /**
   * Converter dados de entrada para modelo
   * Deve ser implementado pelas classes filhas se necessário
   */
  protected fromCreateData(data: any): Omit<T, 'id'> {
    return data as Omit<T, 'id'>;
  }

  /**
   * Buscar por ID - Delega para repository
   */
  async findById(id: number): Promise<TDom | null> {
    const result = await this.repository.findById(id);
    return result ? this.toDom(result) : null;
  }

  /**
   * Buscar todos - Delega para repository
   */
  async findAll(options?: { limit?: number; offset?: number }): Promise<TDom[]> {
    const conditions = {};
    const results = await this.repository.findBy(conditions, options);
    return results.map(result => this.toDom(result));
  }

  /**
   * Buscar por condições - Delega para repository
   */
  async findBy(
    conditions: Record<string, any>,
    options?: { limit?: number; offset?: number; orderBy?: string }
  ): Promise<TDom[]> {
    const results = await this.repository.findBy(conditions, options);
    return results.map(result => this.toDom(result));
  }

  /**
   * Criar - Delega para repository
   */
  async create(data: any): Promise<TDom> {
    const modelData = this.fromCreateData(data);
    const created = await this.repository.create(modelData);
    return this.toDom(created);
  }

  /**
   * Atualizar - Delega para repository
   */
  async update(id: number, data: any): Promise<TDom | null> {
    const updated = await this.repository.update(id, data);
    return updated ? this.toDom(updated) : null;
  }

  /**
   * Deletar - Delega para repository
   */
  async delete(id: number): Promise<boolean> {
    return await this.repository.delete(id);
  }

  /**
   * Contar - Delega para repository
   */
  async count(conditions?: Record<string, any>): Promise<number> {
    return await this.repository.count(conditions || {});
  }
}
