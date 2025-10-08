import { Pool, PoolClient } from 'pg';
import { BaseModel, ENTITY_META_KEY, COLUMN_META_KEY, INDEX_META_KEY, BUSINESS_INDEX_META_KEY, ColumnOptions, IndexOptions } from '../../core/domain/models/BaseModel';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

// Classe CustomORM para gerenciar conexão e operações com banco de dados
export class CustomORM {
  private static instance: CustomORM;
  private pool: Pool;
  private models: (typeof BaseModel)[] = [];

  private constructor() {
    this.pool = new Pool({
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
  public static getInstance(): CustomORM {
    if (!CustomORM.instance) {
      CustomORM.instance = new CustomORM();
    }
    return CustomORM.instance;
  }

  // Registrar modelos para sincronização
  public registerModel(model: typeof BaseModel): void {
    this.models.push(model);
  }

  // Obter cliente de conexão
  public async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  // Executar consulta SQL
  public async query(text: string, params: any[] = []): Promise<any> {
    const client = await this.getClient();
    try {
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      console.error('Erro ao executar query:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Criar tabela de migrações se não existir
  private async createMigrationsTable(): Promise<void> {
    await this.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  // Verificar se uma migração já foi executada
  private async isMigrationExecuted(migrationName: string): Promise<boolean> {
    const result = await this.query(
      'SELECT COUNT(*) as count FROM schema_migrations WHERE name = $1',
      [migrationName]
    );
    return parseInt(result.rows[0].count) > 0;
  }

  // Registrar migração como executada
  private async registerMigration(migrationName: string): Promise<void> {
    await this.query(
      'INSERT INTO schema_migrations (name) VALUES ($1)',
      [migrationName]
    );
  }

  // Gerar SQL para criação de tabela baseado em um modelo
  private generateCreateTableSQL(model: typeof BaseModel): string {
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
  private generateCreateIndexesSQL(model: typeof BaseModel): string[] {
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
  public async syncSchema(): Promise<void> {
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
    } catch (error) {
      console.error('Erro ao sincronizar esquema:', error);
      throw error;
    }
  }

  // Executar migrações SQL
  public async runMigrations(migrationsDir: string): Promise<void> {
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
          await client.query(
            'INSERT INTO schema_migrations (name) VALUES ($1)',
            [file]
          );
          
          // Commit da transação
          await client.query('COMMIT');
          
          console.log(`Migração ${file} executada com sucesso!`);
        } catch (error) {
          // Rollback em caso de erro
          await client.query('ROLLBACK');
          console.error(`Erro ao executar migração ${file}:`, error);
          throw error;
        } finally {
          client.release();
        }
      }
      
      console.log('Todas as migrações foram executadas com sucesso!');
    } catch (error) {
      console.error('Erro ao executar migrações:', error);
      throw error;
    }
  }
  
  // Métodos genéricos CRUD para uso em Repositories
  
  // Criar registro
  public async create<T extends BaseModel>(
    tableName: string,
    data: Record<string, any>
  ): Promise<any> {
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
  public async findById<T>(
    tableName: string,
    id: number | string
  ): Promise<T | null> {
    const query = `SELECT * FROM ${tableName} WHERE id = $1`;
    const result = await this.query(query, [id]);
    return result.rows[0] || null;
  }
  
  // Encontrar registros por condição
  public async findBy<T>(
    tableName: string,
    conditions: Record<string, any>,
    options: { limit?: number; offset?: number; orderBy?: string } = {}
  ): Promise<T[]> {
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
  public async findAll<T>(
    tableName: string,
    options: { limit?: number; offset?: number; orderBy?: string } = {}
  ): Promise<T[]> {
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
  public async update<T>(
    tableName: string,
    id: number | string,
    data: Record<string, any>
  ): Promise<T | null> {
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
  public async delete(tableName: string, id: number | string): Promise<boolean> {
    const query = `DELETE FROM ${tableName} WHERE id = $1`;
    const result = await this.query(query, [id]);
    return result.rowCount > 0;
  }
  
  // Contar registros
  public async count(
    tableName: string,
    conditions: Record<string, any> = {}
  ): Promise<number> {
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

// Função para inicializar o ORM
export function initializeORM(): CustomORM {
  return CustomORM.getInstance();
}