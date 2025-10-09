"use strict";
/**
 * Framework ReactJS API - Exportações públicas
 *
 * Este arquivo atua como ponto de entrada central para o framework,
 * exportando todas as classes, interfaces e funções que podem ser
 * usadas por projetos que implementam este framework como dependência.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = exports.ProductRepository = exports.ProductBusiness = exports.UserRepository = exports.UserService = exports.UserBusiness = exports.scaffoldUseCase = exports.syncSchema = exports.runMigration = exports.BaseRepository = exports.Operator = exports.QueryBuilder = exports.initializeORM = exports.CustomORM = exports.AuthService = exports.AuthMiddleware = exports.ProductModel = exports.UserModel = exports.Id5 = exports.Column5 = exports.BusinessIndex = exports.UniqueIndex = exports.Id = exports.Column = exports.Entity = exports.BaseModel = void 0;
// Core
var BaseModel_1 = require("./core/domain/models/BaseModel");
Object.defineProperty(exports, "BaseModel", { enumerable: true, get: function () { return BaseModel_1.BaseModel; } });
// Decoradores para todas as versões de TypeScript
Object.defineProperty(exports, "Entity", { enumerable: true, get: function () { return BaseModel_1.Entity; } });
Object.defineProperty(exports, "Column", { enumerable: true, get: function () { return BaseModel_1.Column; } });
Object.defineProperty(exports, "Id", { enumerable: true, get: function () { return BaseModel_1.Id; } });
Object.defineProperty(exports, "UniqueIndex", { enumerable: true, get: function () { return BaseModel_1.UniqueIndex; } });
Object.defineProperty(exports, "BusinessIndex", { enumerable: true, get: function () { return BaseModel_1.BusinessIndex; } });
// Decoradores alternativos para TypeScript 5.0+
// Note: Mesmo com estes decoradores, use SEMPRE com parênteses: @Id5()
Object.defineProperty(exports, "Column5", { enumerable: true, get: function () { return BaseModel_1.ColumnStage2; } });
Object.defineProperty(exports, "Id5", { enumerable: true, get: function () { return BaseModel_1.IdStage2; } });
var UserModel_1 = require("./core/domain/models/UserModel");
Object.defineProperty(exports, "UserModel", { enumerable: true, get: function () { return UserModel_1.UserModel; } });
var ProductModel_1 = require("./core/domain/models/ProductModel");
Object.defineProperty(exports, "ProductModel", { enumerable: true, get: function () { return ProductModel_1.ProductModel; } });
// Autenticação
var AuthMiddleware_1 = require("./core/auth/AuthMiddleware");
Object.defineProperty(exports, "AuthMiddleware", { enumerable: true, get: function () { return AuthMiddleware_1.AuthMiddleware; } });
var AuthService_1 = require("./core/auth/AuthService");
Object.defineProperty(exports, "AuthService", { enumerable: true, get: function () { return AuthService_1.AuthService; } });
// Infraestrutura
var CustomORM_1 = require("./infra/db/CustomORM");
Object.defineProperty(exports, "CustomORM", { enumerable: true, get: function () { return CustomORM_1.CustomORM; } });
Object.defineProperty(exports, "initializeORM", { enumerable: true, get: function () { return CustomORM_1.initializeORM; } });
var QueryBuilder_1 = require("./infra/db/query/QueryBuilder");
Object.defineProperty(exports, "QueryBuilder", { enumerable: true, get: function () { return QueryBuilder_1.QueryBuilder; } });
Object.defineProperty(exports, "Operator", { enumerable: true, get: function () { return QueryBuilder_1.Operator; } });
// Repository Base
var BaseRepository_1 = require("./infra/repository/BaseRepository");
Object.defineProperty(exports, "BaseRepository", { enumerable: true, get: function () { return BaseRepository_1.BaseRepository; } });
// Utilitários de Migração
const migration_runner_1 = require("./infra/cli/migration-runner");
Object.defineProperty(exports, "runMigration", { enumerable: true, get: function () { return migration_runner_1.runMigration; } });
const schema_sync_1 = require("./infra/cli/schema-sync");
Object.defineProperty(exports, "syncSchema", { enumerable: true, get: function () { return schema_sync_1.syncSchema; } });
const usecase_scaffold_1 = require("./infra/cli/usecase-scaffold");
Object.defineProperty(exports, "scaffoldUseCase", { enumerable: true, get: function () { return usecase_scaffold_1.scaffoldUseCase; } });
// User Use Case
var UserBusiness_1 = require("./use-cases/user/UserBusiness");
Object.defineProperty(exports, "UserBusiness", { enumerable: true, get: function () { return UserBusiness_1.UserBusiness; } });
var UserService_1 = require("./use-cases/user/UserService");
Object.defineProperty(exports, "UserService", { enumerable: true, get: function () { return UserService_1.UserService; } });
var UserRepository_1 = require("./use-cases/user/repository/UserRepository");
Object.defineProperty(exports, "UserRepository", { enumerable: true, get: function () { return UserRepository_1.UserRepository; } });
// Product Use Case
var ProductBusiness_1 = require("./use-cases/product/ProductBusiness");
Object.defineProperty(exports, "ProductBusiness", { enumerable: true, get: function () { return ProductBusiness_1.ProductBusiness; } });
var ProductRepository_1 = require("./use-cases/product/repository/ProductRepository");
Object.defineProperty(exports, "ProductRepository", { enumerable: true, get: function () { return ProductRepository_1.ProductRepository; } });
var ProductService_1 = require("./use-cases/product/ProductService");
Object.defineProperty(exports, "ProductService", { enumerable: true, get: function () { return ProductService_1.ProductService; } });
//# sourceMappingURL=index.js.map