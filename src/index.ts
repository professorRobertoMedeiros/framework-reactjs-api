/**
 * Framework ReactJS API - Exportações públicas
 * 
 * Este arquivo atua como ponto de entrada central para o framework,
 * exportando todas as classes, interfaces e funções que podem ser
 * usadas por projetos que implementam este framework como dependência.
 */

// Core
export { 
  BaseModel, 
  // Decoradores para todas as versões de TypeScript
  Entity, Column, Id, UniqueIndex, BusinessIndex,
  // Decoradores alternativos para TypeScript 5.0+
  // Note: Mesmo com estes decoradores, use SEMPRE com parênteses: @Id5()
  ColumnStage2 as Column5, IdStage2 as Id5
} from './core/domain/models/BaseModel';

// Decoradores de Timestamps e Soft Delete
export { 
  Timestamps, 
  TimestampsOptions, 
  TIMESTAMPS_METADATA_KEY 
} from './core/domain/models/decorators/Timestamps';

export { 
  SoftDelete, 
  SoftDeleteOptions, 
  SOFT_DELETE_METADATA_KEY 
} from './core/domain/models/decorators/SoftDelete';

// Funções auxiliares para Timestamps e SoftDelete
export {
  hasTimestamps,
  hasSoftDelete,
  getCreatedAtField,
  getUpdatedAtField,
  getDeletedAtField
} from './core/domain/models/decorators/TimestampHelpers';
export { UserModel } from './core/domain/models/UserModel';

// Sistema de Auditoria
export { Auditable, AuditableOptions, AuditableMetadata } from './core/domain/decorators/AuditableDecorator';
export { AuditLogModel, AuditActionType } from './core/domain/models/AuditLogModel';

// Services
export { 
  BaseService, 
  ServiceResponse, 
  PaginatedResponse,
  QueryOptions
} from './core/services/BaseService';

// Business
export { BaseBusiness } from './core/business/BaseBusiness';

// Autenticação
export { AuthMiddleware } from './core/auth/AuthMiddleware';
export { AuthService } from './core/auth/AuthService';
export { AuditService, AuditUser } from './core/auth/AuditService';

// Sistema de Rastreamento
export { TracingService } from './core/tracing/TracingService';
export { TracingMiddleware } from './core/tracing/TracingMiddleware';
export { LoggingService } from './core/tracing/LoggingService';

// Sistema de Agendamento (Scheduler)
export { 
  SchedulerService, 
  SchedulerOptions,
  JobExecutor,
  JobExecutionResult,
  JobRepository,
  JobModel,
  JobStatus
} from './core/scheduler';

// Rotas prontas para uso
export { default as authRoutes } from './routes/auth';

// Setup automático do framework
export { 
  setupFramework, 
  createFrameworkRouter,
  getSchedulerInstance,
  shutdownScheduler,
  FrameworkOptions 
} from './core/setup/FrameworkSetup';

// Infraestrutura
export { CustomORM, initializeORM } from './infra/db/CustomORM';
export { QueryBuilder, Operator } from './infra/db/query/QueryBuilder';

// Logger
export { Logger, logger, LogLevel, LogType, LogEntry } from './infra/logger/Logger';
export { HTTPLoggerMiddleware } from './infra/logger/HTTPLoggerMiddleware';

// Swagger
export { 
  generateSwaggerSpec,
  swaggerUIOptions,
  authSwaggerDocs,
  SwaggerConfigOptions
} from './infra/swagger';

// Messaging (RabbitMQ)
export { 
  RabbitMQConnection,
  BaseProducer,
  BaseConsumer,
  MessagingService,
  ProducerOptions,
  ConsumerOptions
} from './infra/messaging';

// Repository Base
export { 
  BaseRepository, 
  IRepository, 
  PaginationOptions,
  QueryOptions as RepositoryQueryOptions,
  PaginatedResult 
} from './infra/repository/BaseRepository';
export { AuditLogRepository } from './infra/repository/AuditLogRepository';

// Utilitários de Migração
import { runMigration } from './infra/cli/migration-runner';
import { syncSchema } from './infra/cli/schema-sync';
import { scaffoldUseCase } from './infra/cli/usecase-scaffold';

export { runMigration, syncSchema, scaffoldUseCase };

// User Use Case (Exemplo gerado pelo scaffold)
export { UserBusiness } from './use-cases/user/UserBusiness';
export { UserService } from './use-cases/user/UserService';
export { UserRepository } from './use-cases/user/repository/UserRepository';
export { UserDom } from './use-cases/user/domains/UserDom';