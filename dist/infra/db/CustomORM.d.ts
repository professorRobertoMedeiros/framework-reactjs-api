import { PoolClient } from 'pg';
import { BaseModel } from '../../core/domain/models/BaseModel';
import 'dotenv/config';
export declare class CustomORM {
    private static instance;
    private pool;
    private models;
    private currentUser;
    private constructor();
    static getInstance(): CustomORM;
    registerModel(model: typeof BaseModel): void;
    setCurrentUser(user: {
        id: number;
        email: string;
    } | null): void;
    getCurrentUser(): {
        id: number;
        email: string;
    } | null;
    getClient(): Promise<PoolClient>;
    query(text: string, params?: any[]): Promise<any>;
    private createMigrationsTable;
    private isMigrationExecuted;
    private registerMigration;
    private generateCreateTableSQL;
    private generateCreateIndexesSQL;
    syncSchema(): Promise<void>;
    runMigrations(migrationsDir: string): Promise<void>;
    create<T extends BaseModel>(tableName: string, data: Record<string, any>): Promise<any>;
    findById<T>(tableName: string, id: number | string): Promise<T | null>;
    findBy<T>(tableName: string, conditions: Record<string, any>, options?: {
        limit?: number;
        offset?: number;
        orderBy?: string;
    }): Promise<T[]>;
    findAll<T>(tableName: string, options?: {
        limit?: number;
        offset?: number;
        orderBy?: string;
    }): Promise<T[]>;
    update<T>(tableName: string, id: number | string, data: Record<string, any>): Promise<T | null>;
    delete(tableName: string, id: number | string): Promise<boolean>;
    count(tableName: string, conditions?: Record<string, any>): Promise<number>;
}
export declare function initializeORM(): CustomORM;
