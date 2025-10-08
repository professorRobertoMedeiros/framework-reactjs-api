/**
 * Framework ReactJS API - Exportações públicas
 * 
 * Este arquivo atua como ponto de entrada central para o framework,
 * exportando todas as classes, interfaces e funções que podem ser
 * usadas por projetos que implementam este framework como dependência.
 */

// Core
export { BaseModel } from '../src/core/domain/models/BaseModel';
export { UserModel } from '../src/core/domain/models/UserModel';

// Autenticação
export { AuthMiddleware } from '../src/core/auth/AuthMiddleware';
export { AuthService } from '../src/core/auth/AuthService';

// Infraestrutura
export { CustomORM } from '../src/infra/db/CustomORM';
export { QueryBuilder, Operator } from '../src/infra/db/query/QueryBuilder';

// Repository Base
export { 
  BaseRepository, 
  IRepository, 
  PaginationOptions, 
  PaginatedResult 
} from '../src/infra/repository/BaseRepository';

// Utilitários de Migração
export { runMigration } from '../src/infra/cli/migration-runner';
export { syncSchema } from '../src/infra/cli/schema-sync';
export { scaffoldUseCase } from '../src/infra/cli/usecase-scaffold';

// User Use Case
export { IUserBusiness, UserBusiness } from '../src/use-cases/user/UserBusiness';
export { IUserService, UserService, UserServiceResponse } from '../src/use-cases/user/UserService';
export { IUserRepository, UserRepository } from '../src/use-cases/user/repository/UserRepository';
export { CreateUserDom, UpdateUserDom, UserDom } from '../src/use-cases/user/domains/UserDom';

// Product Use Case
export { IProductBusiness, ProductBusiness } from '../src/use-cases/product/ProductBusiness';
export { IProductRepository, ProductRepository } from '../src/use-cases/product/repository/ProductRepository';
export { CreateProductDom, UpdateProductDom, ProductDom } from '../src/use-cases/product/domains/ProductDom';
