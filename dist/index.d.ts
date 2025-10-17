/**
 * Framework ReactJS API - Exportações públicas
 *
 * Este arquivo atua como ponto de entrada central para o framework,
 * exportando todas as classes, interfaces e funções que podem ser
 * usadas por projetos que implementam este framework como dependência.
 */
export { BaseModel, Entity, Column, Id, UniqueIndex, BusinessIndex, ColumnStage2 as Column5, IdStage2 as Id5 } from './core/domain/models/BaseModel';
export { UserModel } from './core/domain/models/UserModel';
export { BaseService, ServiceResponse, PaginatedResponse, QueryOptions } from './core/services/BaseService';
export { BaseBusiness } from './core/business/BaseBusiness';
export { AuthMiddleware } from './core/auth/AuthMiddleware';
export { AuthService } from './core/auth/AuthService';
export { default as authRoutes } from './routes/auth';
export { setupFramework, createFrameworkRouter, FrameworkOptions } from './core/setup/FrameworkSetup';
export { CustomORM, initializeORM } from './infra/db/CustomORM';
export { QueryBuilder, Operator } from './infra/db/query/QueryBuilder';
export { BaseRepository, IRepository, PaginationOptions, PaginatedResult } from './infra/repository/BaseRepository';
import { runMigration } from './infra/cli/migration-runner';
import { syncSchema } from './infra/cli/schema-sync';
import { scaffoldUseCase } from './infra/cli/usecase-scaffold';
export { runMigration, syncSchema, scaffoldUseCase };
export { UserBusiness } from './use-cases/user/UserBusiness';
export { UserService } from './use-cases/user/UserService';
export { UserRepository } from './use-cases/user/repository/UserRepository';
export { UserDom } from './use-cases/user/domains/UserDom';
