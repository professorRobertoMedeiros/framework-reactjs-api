"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomORM = void 0;
exports.initializeORM = initializeORM;
const pg_1 = require("pg");
const Logger_1 = require("../logger/Logger");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
require("dotenv/config");
// Classe CustomORM para gerenciar conexão e operações com banco de dados
class CustomORM {
    constructor() {
        this.models = [];
        this.currentUser = null;
        this.pool = new pg_1.Pool({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            database: process.env.DB_NAME || 'postgres',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
        // Log de conexão
        this.pool.on('connect', () => {
            console.log('Conexão estabelecida com o banco de dados');
        });
        this.pool.on('error', (err) => {
            console.error('Erro na conexão com o banco de dados:', err);
        });
    }
    // Padrão Singleton para gerenciar uma única instância
    static getInstance() {
        if (!CustomORM.instance) {
            CustomORM.instance = new CustomORM();
        }
        return CustomORM.instance;
    }
    // Registrar modelos para sincronização
    registerModel(model) {
        this.models.push(model);
    }
    // Definir usuário atual para logs
    setCurrentUser(user) {
        this.currentUser = user;
    }
    // Obter usuário atual
    getCurrentUser() {
        return this.currentUser;
    }
    // Obter cliente de conexão
    async getClient() {
        return await this.pool.connect();
    }
    // Executar consulta SQL com logging
    async query(text, params = []) {
        const client = await this.getClient();
        const startTime = Date.now();
        try {
            const result = await client.query(text, params);
            const duration = Date.now() - startTime;
            // Log da query SQL
            Logger_1.logger.logSQL(text, params, duration, this.currentUser);
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            Logger_1.logger.logSQL(text, params, duration, this.currentUser);
            Logger_1.logger.error('Erro ao executar query', error, this.currentUser);
            throw error;
        }
        finally {
            client.release();
        }
    }
    // Criar tabela de migrações se não existir
    async createMigrationsTable() {
        await this.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    }
    // Verificar se uma migração já foi executada
    async isMigrationExecuted(migrationName) {
        const result = await this.query('SELECT COUNT(*) as count FROM schema_migrations WHERE name = $1', [migrationName]);
        return parseInt(result.rows[0].count) > 0;
    }
    // Registrar migração como executada
    async registerMigration(migrationName) {
        await this.query('INSERT INTO schema_migrations (name) VALUES ($1)', [migrationName]);
    }
    // Gerar SQL para criação de tabela baseado em um modelo
    generateCreateTableSQL(model) {
        const tableName = model.getTableName();
        const columns = model.getColumns();
        if (!tableName || Object.keys(columns).length === 0) {
            throw new Error(`Modelo ${model.name} não possui tabela ou colunas definidas`);
        }
        let sql = `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
        // Adiciona todas as colunas
        const columnDefinitions = Object.entries(columns).map(([columnName, options]) => {
            let def = `${columnName} ${options.type}`;
            // Adiciona comprimento para VARCHAR
            if (options.type === 'VARCHAR' && options.length) {
                def = `${columnName} ${options.type}(${options.length})`;
            }
            if (options.primaryKey) {
                def += ' PRIMARY KEY';
            }
            if (options.nullable === false) {
                def += ' NOT NULL';
            }
            if (options.default !== undefined) {
                def += ` DEFAULT ${options.default}`;
            }
            return def;
        });
        sql += columnDefinitions.join(',\n');
        sql += '\n);';
        return sql;
    }
    // Gerar SQL para criação de índices baseado em um modelo
    generateCreateIndexesSQL(model) {
        const tableName = model.getTableName();
        const indices = model.getIndices();
        const businessIndices = model.getBusinessIndices();
        const allIndices = [
            ...indices.map(idx => ({ ...idx, isUnique: true })),
            ...businessIndices.map(idx => ({ ...idx, isUnique: false }))
        ];
        return allIndices.map(idx => {
            const uniqueStr = idx.isUnique ? 'UNIQUE ' : '';
            const columns = idx.columns.join(', ');
            return `CREATE ${uniqueStr}INDEX IF NOT EXISTS ${idx.name} ON ${tableName} (${columns});`;
        });
    }
    // Sincronizar esquema baseado nos modelos registrados
    async syncSchema() {
        try {
            console.log('Iniciando sincronização do esquema...');
            for (const model of this.models) {
                console.log(`Sincronizando modelo: ${model.name}`);
                // Criar tabela
                const createTableSQL = this.generateCreateTableSQL(model);
                await this.query(createTableSQL);
                console.log(`Tabela ${model.getTableName()} sincronizada`);
                // Criar índices
                const createIndexesSQL = this.generateCreateIndexesSQL(model);
                for (const indexSQL of createIndexesSQL) {
                    await this.query(indexSQL);
                }
                if (createIndexesSQL.length > 0) {
                    console.log(`Índices para ${model.getTableName()} sincronizados`);
                }
            }
            console.log('Sincronização de esquema concluída com sucesso!');
        }
        catch (error) {
            console.error('Erro ao sincronizar esquema:', error);
            throw error;
        }
    }
    // Executar migrações SQL
    async runMigrations(migrationsDir) {
        try {
            console.log('Iniciando execução de migrações...');
            // Criar tabela de migrações se não existir
            await this.createMigrationsTable();
            // Obter todos os arquivos de migração
            const files = fs.readdirSync(migrationsDir)
                .filter(file => file.endsWith('.sql'))
                .sort(); // Ordenar cronologicamente
            if (files.length === 0) {
                console.log('Nenhuma migração encontrada');
                return;
            }
            for (const file of files) {
                // Verificar se a migração já foi executada
                if (await this.isMigrationExecuted(file)) {
                    console.log(`Migração ${file} já executada, pulando...`);
                    continue;
                }
                console.log(`Executando migração: ${file}`);
                // Ler e executar o arquivo SQL
                const filePath = path.join(migrationsDir, file);
                const sql = fs.readFileSync(filePath, 'utf8');
                const client = await this.getClient();
                try {
                    // Iniciar transação
                    await client.query('BEGIN');
                    // Executar SQL
                    await client.query(sql);
                    // Registrar migração como executada
                    await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
                    // Commit da transação
                    await client.query('COMMIT');
                    console.log(`Migração ${file} executada com sucesso!`);
                }
                catch (error) {
                    // Rollback em caso de erro
                    await client.query('ROLLBACK');
                    console.error(`Erro ao executar migração ${file}:`, error);
                    throw error;
                }
                finally {
                    client.release();
                }
            }
            console.log('Todas as migrações foram executadas com sucesso!');
        }
        catch (error) {
            console.error('Erro ao executar migrações:', error);
            throw error;
        }
    }
    // Métodos genéricos CRUD para uso em Repositories
    // Criar registro
    async create(tableName, data) {
        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = values.map((_, i) => `$${i + 1}`);
        const query = `
      INSERT INTO ${tableName} (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;
        const result = await this.query(query, values);
        return result.rows[0];
    }
    // Encontrar registro por ID
    async findById(tableName, id) {
        const query = `SELECT * FROM ${tableName} WHERE id = $1`;
        const result = await this.query(query, [id]);
        return result.rows[0] || null;
    }
    // Encontrar registros por condição
    async findBy(tableName, conditions, options = {}) {
        const columns = Object.keys(conditions);
        const values = Object.values(conditions);
        if (columns.length === 0) {
            return this.findAll(tableName, options);
        }
        let query = `SELECT * FROM ${tableName} WHERE `;
        const whereConditions = columns.map((column, index) => `${column} = $${index + 1}`);
        query += whereConditions.join(' AND ');
        // Adicionar ordenação
        if (options.orderBy) {
            query += ` ORDER BY ${options.orderBy}`;
        }
        // Adicionar paginação
        if (options.limit) {
            query += ` LIMIT ${options.limit}`;
        }
        if (options.offset) {
            query += ` OFFSET ${options.offset}`;
        }
        const result = await this.query(query, values);
        return result.rows;
    }
    // Encontrar todos os registros
    async findAll(tableName, options = {}) {
        let query = `SELECT * FROM ${tableName}`;
        // Adicionar ordenação
        if (options.orderBy) {
            query += ` ORDER BY ${options.orderBy}`;
        }
        // Adicionar paginação
        if (options.limit) {
            query += ` LIMIT ${options.limit}`;
        }
        if (options.offset) {
            query += ` OFFSET ${options.offset}`;
        }
        const result = await this.query(query);
        return result.rows;
    }
    // Atualizar registro
    async update(tableName, id, data) {
        const columns = Object.keys(data);
        const values = Object.values(data);
        if (columns.length === 0) {
            return this.findById(tableName, id);
        }
        const setClauses = columns.map((column, index) => `${column} = $${index + 1}`);
        const query = `
      UPDATE ${tableName}
      SET ${setClauses.join(', ')}
      WHERE id = $${columns.length + 1}
      RETURNING *
    `;
        const result = await this.query(query, [...values, id]);
        return result.rows[0] || null;
    }
    // Excluir registro
    async delete(tableName, id) {
        const query = `DELETE FROM ${tableName} WHERE id = $1`;
        const result = await this.query(query, [id]);
        return result.rowCount > 0;
    }
    // Contar registros
    async count(tableName, conditions = {}) {
        const columns = Object.keys(conditions);
        const values = Object.values(conditions);
        let query = `SELECT COUNT(*) as total FROM ${tableName}`;
        if (columns.length > 0) {
            const whereConditions = columns.map((column, index) => `${column} = $${index + 1}`);
            query += ` WHERE ${whereConditions.join(' AND ')}`;
        }
        const result = await this.query(query, values);
        return parseInt(result.rows[0].total);
    }
}
exports.CustomORM = CustomORM;
// Função para inicializar o ORM
function initializeORM() {
    return CustomORM.getInstance();
}
//# sourceMappingURL=CustomORM.js.map