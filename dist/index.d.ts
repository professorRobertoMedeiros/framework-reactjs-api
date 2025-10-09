/**
 * Framework ReactJS API - Exportações públicas
 *
 * Este arquivo atua como ponto de entrada central para o framework,
 * exportando todas as classes, interfaces e funções que podem ser
 * usadas por projetos que implementam este framework como dependência.
 */
export { BaseModel, Entity, Column, Id, UniqueIndex, BusinessIndex, ColumnStage2 as Column5, IdStage2 as Id5 } from './core/domain/models/BaseModel';
export { UserModel } from './core/domain/models/UserModel';
export { ProductModel } from './core/domain/models/ProductModel';
export { AuthMiddleware } from './core/auth/AuthMiddleware';
export { AuthService } from './core/auth/AuthService';
export { CustomORM, initializeORM } from './infra/db/CustomORM';
export { QueryBuilder, Operator } from './infra/db/query/QueryBuilder';
export { BaseRepository, IRepository, PaginationOptions, PaginatedResult } from './infra/repository/BaseRepository';
import { runMigration } from './infra/cli/migration-runner';
import { syncSchema } from './infra/cli/schema-sync';
import { scaffoldUseCase } from './infra/cli/usecase-scaffold';
export { runMigration, syncSchema, scaffoldUseCase };
export { IUserBusiness, UserBusiness } from './use-cases/user/UserBusiness';
export { IUserService, UserService, UserServiceResponse } from './use-cases/user/UserService';
export { IUserRepository, UserRepository } from './use-cases/user/repository/UserRepository';
export { CreateUserDom, UpdateUserDom, UserDom } from './use-cases/user/domains/UserDom';
export { IProductBusiness, ProductBusiness } from './use-cases/product/ProductBusiness';
export { IProductRepository, ProductRepository } from './use-cases/product/repository/ProductRepository';
export { ProductService } from './use-cases/product/ProductService';
export { CreateProductDom, UpdateProductDom, ProductDom } from './use-cases/product/domains/ProductDom';
