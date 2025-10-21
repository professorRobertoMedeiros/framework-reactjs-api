import { JobModel, JobStatus } from '../domain/models/JobModel';
import { logger } from '../../infra/logger/Logger';
import path from 'path';
import fs from 'fs';

/**
 * Resultado da execução de um job
 */
export interface JobExecutionResult {
  success: boolean;
  duration: number;
  error?: string;
  result?: any;
}

/**
 * Executor responsável por carregar e executar jobs dinamicamente
 */
export class JobExecutor {
  private serviceCache: Map<string, any> = new Map();

  /**
   * Executa um job
   */
  async executeJob(job: JobModel): Promise<JobExecutionResult> {
    const startTime = Date.now();

    try {
      logger.info(`Executando job: ${job.name}`, {
        job: {
          id: job.id,
          name: job.name,
          service: job.service_name,
          method: job.service_method
        }
      });

      // Carregar o service
      const service = await this.loadService(job);

      // Verificar se o método existe
      if (typeof service[job.service_method] !== 'function') {
        throw new Error(
          `Método '${job.service_method}' não encontrado no service '${job.service_name}'`
        );
      }

      // Executar o método com timeout
      const result = await this.executeWithTimeout(
        () => service[job.service_method](job.params),
        job.timeout * 1000
      );

      const duration = Date.now() - startTime;

      logger.info(`Job executado com sucesso: ${job.name}`, {
        job: {
          id: job.id,
          name: job.name,
          duration
        },
        result
      });

      return {
        success: true,
        duration,
        result
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      logger.error(`Erro ao executar job: ${job.name}`, error as Error);

      return {
        success: false,
        duration,
        error: errorMessage
      };
    }
  }

  /**
   * Carrega o service dinamicamente
   */
  private async loadService(job: JobModel): Promise<any> {
    const cacheKey = `${job.service_name}:${job.service_path || ''}`;

    // Retornar do cache se já foi carregado
    if (this.serviceCache.has(cacheKey)) {
      const ServiceClass = this.serviceCache.get(cacheKey);
      return new ServiceClass();
    }

    try {
      let servicePath: string;

      if (job.service_path) {
        // Caminho explícito fornecido
        servicePath = this.resolveServicePath(job.service_path);
      } else {
        // Tentar descobrir o caminho automaticamente
        servicePath = await this.discoverServicePath(job.service_name);
      }

      // Importar o service
      const serviceModule = require(servicePath);
      const ServiceClass = serviceModule.default || serviceModule[job.service_name];

      if (!ServiceClass) {
        throw new Error(
          `Classe '${job.service_name}' não encontrada em '${servicePath}'`
        );
      }

      // Adicionar ao cache
      this.serviceCache.set(cacheKey, ServiceClass);

      // Retornar instância
      return new ServiceClass();

    } catch (error) {
      throw new Error(
        `Erro ao carregar service '${job.service_name}': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Resolve o caminho do service
   */
  private resolveServicePath(servicePath: string): string {
    // Caminho relativo ao projeto
    const projectRoot = process.cwd();
    
    // Tentar dist primeiro (produção)
    let fullPath = path.join(projectRoot, 'dist', servicePath);
    if (!fullPath.endsWith('.js')) {
      fullPath += '.js';
    }

    if (fs.existsSync(fullPath)) {
      return fullPath;
    }

    // Tentar src (desenvolvimento)
    fullPath = path.join(projectRoot, 'src', servicePath);
    if (!fullPath.endsWith('.ts')) {
      fullPath += '.ts';
    }

    if (fs.existsSync(fullPath)) {
      return fullPath;
    }

    throw new Error(`Service não encontrado em: ${servicePath}`);
  }

  /**
   * Descobre o caminho do service automaticamente
   */
  private async discoverServicePath(serviceName: string): Promise<string> {
    const projectRoot = process.cwd();
    const possiblePaths = [
      // Use cases
      path.join(projectRoot, 'dist', 'use-cases', '**', `${serviceName}.js`),
      path.join(projectRoot, 'src', 'use-cases', '**', `${serviceName}.ts`),
      
      // Services
      path.join(projectRoot, 'dist', 'services', `${serviceName}.js`),
      path.join(projectRoot, 'src', 'services', `${serviceName}.ts`),
      
      // Core services
      path.join(projectRoot, 'dist', 'core', 'services', `${serviceName}.js`),
      path.join(projectRoot, 'src', 'core', 'services', `${serviceName}.ts`),
    ];

    // Buscar em todos os caminhos possíveis
    for (const searchPath of possiblePaths) {
      const found = this.findFile(searchPath);
      if (found) {
        return found;
      }
    }

    throw new Error(
      `Service '${serviceName}' não encontrado. ` +
      `Forneça o 'service_path' no cadastro do job.`
    );
  }

  /**
   * Busca um arquivo recursivamente
   */
  private findFile(pattern: string): string | null {
    const glob = require('glob');
    const files = glob.sync(pattern);
    return files.length > 0 ? files[0] : null;
  }

  /**
   * Executa uma função com timeout
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout de ${timeoutMs}ms excedido`));
      }, timeoutMs);

      fn()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Limpa o cache de services
   */
  clearCache(): void {
    this.serviceCache.clear();
  }

  /**
   * Remove um service específico do cache
   */
  removeCachedService(serviceName: string, servicePath?: string): void {
    const cacheKey = `${serviceName}:${servicePath || ''}`;
    this.serviceCache.delete(cacheKey);
  }
}
