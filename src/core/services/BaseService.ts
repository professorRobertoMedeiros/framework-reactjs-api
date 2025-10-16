import { BaseBusiness } from '../business/BaseBusiness';

/**
 * Interface padrão para resposta de serviços
 */
export interface ServiceResponse<T = any> {
  status: number;
  data?: T;
  message?: string;
}

/**
 * Interface para opções de consulta
 */
export interface QueryOptions {
  conditions?: Record<string, any>;
  includes?: string[];
  limit?: number;
  offset?: number;
  orderBy?: string;
}

/**
 * Interface para dados paginados (compatibilidade)
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Classe base para serviços que delega operações CRUD para Business
 * Não reimplementa métodos, apenas delega
 * 
 * @template T Tipo do modelo
 * @template TDom Tipo do domínio (DTO)
 */
export abstract class BaseService<T, TDom = T> {
  protected business: BaseBusiness<T, TDom>;

  constructor(business: BaseBusiness<T, TDom>) {
    this.business = business;
  }

  /**
   * Buscar todos com filtros - Delega para business
   */
  async findAll(options?: QueryOptions): Promise<ServiceResponse<TDom[]>> {
    try {
      const data = await this.business.findBy(
        options?.conditions || {},
        {
          limit: options?.limit,
          offset: options?.offset,
          orderBy: options?.orderBy,
        }
      );

      return {
        status: 200,
        data,
        message: 'Registros recuperados com sucesso',
      };
    } catch (error) {
      return {
        status: 500,
        message: error instanceof Error ? error.message : 'Erro ao buscar registros',
      };
    }
  }

  /**
   * Buscar por ID - Delega para business
   */
  async findById(id: number): Promise<ServiceResponse<TDom>> {
    try {
      const data = await this.business.findById(id);

      if (!data) {
        return {
          status: 404,
          message: 'Registro não encontrado',
        };
      }

      return {
        status: 200,
        data,
        message: 'Registro recuperado com sucesso',
      };
    } catch (error) {
      return {
        status: 500,
        message: error instanceof Error ? error.message : 'Erro ao buscar registro',
      };
    }
  }

  /**
   * Criar - Delega para business
   */
  async create(data: any): Promise<ServiceResponse<TDom>> {
    try {
      const created = await this.business.create(data);

      return {
        status: 201,
        data: created,
        message: 'Registro criado com sucesso',
      };
    } catch (error) {
      return {
        status: 500,
        message: error instanceof Error ? error.message : 'Erro ao criar registro',
      };
    }
  }

  /**
   * Atualizar - Delega para business
   */
  async update(id: number, data: any): Promise<ServiceResponse<TDom>> {
    try {
      const updated = await this.business.update(id, data);

      if (!updated) {
        return {
          status: 404,
          message: 'Registro não encontrado',
        };
      }

      return {
        status: 200,
        data: updated,
        message: 'Registro atualizado com sucesso',
      };
    } catch (error) {
      return {
        status: 500,
        message: error instanceof Error ? error.message : 'Erro ao atualizar registro',
      };
    }
  }

  /**
   * Deletar - Delega para business
   */
  async delete(id: number): Promise<ServiceResponse<boolean>> {
    try {
      const deleted = await this.business.delete(id);

      if (!deleted) {
        return {
          status: 404,
          message: 'Registro não encontrado',
        };
      }

      return {
        status: 200,
        data: true,
        message: 'Registro deletado com sucesso',
      };
    } catch (error) {
      return {
        status: 500,
        message: error instanceof Error ? error.message : 'Erro ao deletar registro',
      };
    }
  }

  /**
   * Contar - Delega para business
   */
  async count(conditions?: Record<string, any>): Promise<ServiceResponse<number>> {
    try {
      const count = await this.business.count(conditions);

      return {
        status: 200,
        data: count,
        message: 'Contagem realizada com sucesso',
      };
    } catch (error) {
      return {
        status: 500,
        message: error instanceof Error ? error.message : 'Erro ao contar registros',
      };
    }
  }
}
