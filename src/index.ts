/**
 * Framework ReactJS API - Exportações públicas
 * 
 * Este arquivo atua como ponto de entrada central para o framework,
 * exportando todas as classes, interfaces e funções que podem ser
 * usadas por projetos que implementam este framework como dependência.
 */

// Core
export { BaseModel } from './core/domain/models/BaseModel';
export { UserModel } from './core/domain/models/UserModel';

// Autenticação
export { AuthMiddleware } from './core/auth/AuthMiddleware';
export { AuthService } from './core/auth/AuthService';

// Infraestrutura
export { CustomORM } from './infra/db/CustomORM';
export { QueryBuilder, Operator } from './infra/db/query/QueryBuilder';

// Repository Base
export { 
  BaseRepository, 
  IRepository, 
  PaginationOptions, 
  PaginatedResult 
} from './infra/repository/BaseRepository';

// Utilitários de Migração
export { runMigration } from './infra/cli/migration-runner';
export { syncSchema } from './infra/cli/schema-sync';
export { scaffoldUseCase } from './infra/cli/usecase-scaffold';

// User Use Case
export { IUserBusiness, UserBusiness } from './use-cases/user/UserBusiness';
export { IUserService, UserService, UserServiceResponse } from './use-cases/user/UserService';
export { IUserRepository, UserRepository } from './use-cases/user/repository/UserRepository';
export { CreateUserDom, UpdateUserDom, UserDom } from './use-cases/user/domains/UserDom';

// Product Use Case
export { IProductBusiness, ProductBusiness } from './use-cases/product/ProductBusiness';
export { IProductRepository, ProductRepository } from './use-cases/product/repository/ProductRepository';
export { CreateProductDom, UpdateProductDom, ProductDom } from './use-cases/product/domains/ProductDom';