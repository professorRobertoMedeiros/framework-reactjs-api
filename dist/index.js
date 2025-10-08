"use strict";
/**
 * Framework ReactJS API - Exportações públicas
 * 
 * Este arquivo atua como ponto de entrada central para o framework,
 * exportando todas as classes, interfaces e funções que podem ser
 * usadas por projetos que implementam este framework como dependência.
 */
Object.defineProperty(exports, "__esModule", { value: true });

// Core
var BaseModel_1 = require("../src/core/domain/models/BaseModel");
Object.defineProperty(exports, "BaseModel", { enumerable: true, get: function () { return BaseModel_1.BaseModel; } });
var UserModel_1 = require("../src/core/domain/models/UserModel");
Object.defineProperty(exports, "UserModel", { enumerable: true, get: function () { return UserModel_1.UserModel; } });

// Autenticação
var AuthMiddleware_1 = require("../src/core/auth/AuthMiddleware");
Object.defineProperty(exports, "AuthMiddleware", { enumerable: true, get: function () { return AuthMiddleware_1.AuthMiddleware; } });
var AuthService_1 = require("../src/core/auth/AuthService");
Object.defineProperty(exports, "AuthService", { enumerable: true, get: function () { return AuthService_1.AuthService; } });

// Infraestrutura
var CustomORM_1 = require("../src/infra/db/CustomORM");
Object.defineProperty(exports, "CustomORM", { enumerable: true, get: function () { return CustomORM_1.CustomORM; } });
var QueryBuilder_1 = require("../src/infra/db/query/QueryBuilder");
Object.defineProperty(exports, "QueryBuilder", { enumerable: true, get: function () { return QueryBuilder_1.QueryBuilder; } });
Object.defineProperty(exports, "Operator", { enumerable: true, get: function () { return QueryBuilder_1.Operator; } });

// Repository Base
var BaseRepository_1 = require("../src/infra/repository/BaseRepository");
Object.defineProperty(exports, "BaseRepository", { enumerable: true, get: function () { return BaseRepository_1.BaseRepository; } });
Object.defineProperty(exports, "IRepository", { enumerable: true, get: function () { return BaseRepository_1.IRepository; } });

// Utilitários de Migração
var migration_runner_1 = require("../src/infra/cli/migration-runner");
Object.defineProperty(exports, "runMigration", { enumerable: true, get: function () { return migration_runner_1.runMigration; } });
var schema_sync_1 = require("../src/infra/cli/schema-sync");
Object.defineProperty(exports, "syncSchema", { enumerable: true, get: function () { return schema_sync_1.syncSchema; } });
var usecase_scaffold_1 = require("../src/infra/cli/usecase-scaffold");
Object.defineProperty(exports, "scaffoldUseCase", { enumerable: true, get: function () { return usecase_scaffold_1.scaffoldUseCase; } });

// User Use Case
var UserBusiness_1 = require("../src/use-cases/user/UserBusiness");
Object.defineProperty(exports, "UserBusiness", { enumerable: true, get: function () { return UserBusiness_1.UserBusiness; } });
var UserService_1 = require("../src/use-cases/user/UserService");
Object.defineProperty(exports, "UserService", { enumerable: true, get: function () { return UserService_1.UserService; } });
var UserRepository_1 = require("../src/use-cases/user/repository/UserRepository");
Object.defineProperty(exports, "UserRepository", { enumerable: true, get: function () { return UserRepository_1.UserRepository; } });

// Product Use Case
var ProductBusiness_1 = require("../src/use-cases/product/ProductBusiness");
Object.defineProperty(exports, "ProductBusiness", { enumerable: true, get: function () { return ProductBusiness_1.ProductBusiness; } });
var ProductRepository_1 = require("../src/use-cases/product/repository/ProductRepository");
Object.defineProperty(exports, "ProductRepository", { enumerable: true, get: function () { return ProductRepository_1.ProductRepository; } });
