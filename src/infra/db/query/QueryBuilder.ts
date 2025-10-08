/**
 * Operadores para consultas
 */
export enum Operator {
  EQUALS = '=',
  NOT_EQUALS = '!=',
  GREATER_THAN = '>',
  GREATER_EQUALS = '>=',
  LESS_THAN = '<',
  LESS_EQUALS = '<=',
  LIKE = 'LIKE',
  ILIKE = 'ILIKE', // Case-insensitive LIKE
  IN = 'IN',
  NOT_IN = 'NOT IN',
  IS_NULL = 'IS NULL',
  IS_NOT_NULL = 'IS NOT NULL',
  BETWEEN = 'BETWEEN'
}

/**
 * Operadores de junção para consultas
 */
export enum JoinType {
  INNER = 'INNER JOIN',
  LEFT = 'LEFT JOIN',
  RIGHT = 'RIGHT JOIN',
  FULL = 'FULL JOIN'
}

/**
 * Interface para um predicado (condição)
 */
export interface Predicate {
  field: string;
  operator: Operator;
  value?: any;
  values?: any[]; // Para operadores IN, NOT_IN, BETWEEN
}

/**
 * Interface para uma ordenação
 */
export interface Order {
  field: string;
  direction: 'ASC' | 'DESC';
}

/**
 * Interface para uma junção (JOIN)
 */
export interface Join {
  type: JoinType;
  table: string;
  alias?: string;
  on: string;
}

/**
 * QueryBuilder para construir consultas SQL de forma fluente
 */
export class QueryBuilder {
  private tableName: string;
  private tableAlias?: string;
  private selectFields: string[] = [];
  private whereConditions: Predicate[] = [];
  private joinClauses: Join[] = [];
  private orderByFields: Order[] = [];
  private groupByFields: string[] = [];
  private havingConditions: Predicate[] = [];
  private limitValue?: number;
  private offsetValue?: number;
  private parameters: any[] = [];
  private parameterIndex = 0;
  
  /**
   * Cria uma nova instância de QueryBuilder
   * @param tableName Nome da tabela para consulta
   * @param alias Alias opcional para a tabela
   */
  constructor(tableName: string, alias?: string) {
    this.tableName = tableName;
    this.tableAlias = alias;
  }
  
  /**
   * Cria um novo QueryBuilder para a tabela especificada
   * @param tableName Nome da tabela
   * @param alias Alias opcional para a tabela
   * @returns Nova instância de QueryBuilder
   */
  public static from(tableName: string, alias?: string): QueryBuilder {
    return new QueryBuilder(tableName, alias);
  }
  
  /**
   * Define os campos a serem selecionados
   * @param fields Nomes dos campos ou expressões SQL
   * @returns this (para encadeamento)
   */
  public select(...fields: string[]): QueryBuilder {
    if (fields.length === 0) {
      this.selectFields = ['*'];
    } else {
      this.selectFields = fields;
    }
    return this;
  }
  
  /**
   * Adiciona campos à seleção
   * @param fields Nomes dos campos ou expressões SQL
   * @returns this (para encadeamento)
   */
  public addSelect(...fields: string[]): QueryBuilder {
    this.selectFields.push(...fields);
    return this;
  }
  
  /**
   * Adiciona um join à consulta
   * @param type Tipo de join (INNER, LEFT, RIGHT, FULL)
   * @param table Nome da tabela para join
   * @param alias Alias opcional para a tabela
   * @param on Condição de join
   * @returns this (para encadeamento)
   */
  public join(type: JoinType, table: string, alias: string, on: string): QueryBuilder {
    this.joinClauses.push({ type, table, alias, on });
    return this;
  }
  
  /**
   * Adiciona um INNER JOIN à consulta
   * @param table Nome da tabela para join
   * @param alias Alias opcional para a tabela
   * @param on Condição de join
   * @returns this (para encadeamento)
   */
  public innerJoin(table: string, alias: string, on: string): QueryBuilder {
    return this.join(JoinType.INNER, table, alias, on);
  }
  
  /**
   * Adiciona um LEFT JOIN à consulta
   * @param table Nome da tabela para join
   * @param alias Alias opcional para a tabela
   * @param on Condição de join
   * @returns this (para encadeamento)
   */
  public leftJoin(table: string, alias: string, on: string): QueryBuilder {
    return this.join(JoinType.LEFT, table, alias, on);
  }
  
  /**
   * Adiciona uma condição WHERE
   * @param field Nome do campo
   * @param operator Operador de comparação
   * @param value Valor para comparação
   * @returns this (para encadeamento)
   */
  public where(field: string, operator: Operator, value?: any): QueryBuilder {
    this.whereConditions.push({ field, operator, value });
    return this;
  }
  
  /**
   * Adiciona uma condição WHERE com operador =
   * @param field Nome do campo
   * @param value Valor para comparação
   * @returns this (para encadeamento)
   */
  public whereEquals(field: string, value: any): QueryBuilder {
    return this.where(field, Operator.EQUALS, value);
  }
  
  /**
   * Adiciona uma condição WHERE com operador LIKE
   * @param field Nome do campo
   * @param pattern Padrão para LIKE (ex: '%texto%')
   * @returns this (para encadeamento)
   */
  public whereLike(field: string, pattern: string): QueryBuilder {
    return this.where(field, Operator.LIKE, pattern);
  }
  
  /**
   * Adiciona uma condição WHERE com operador IN
   * @param field Nome do campo
   * @param values Array de valores para IN
   * @returns this (para encadeamento)
   */
  public whereIn(field: string, values: any[]): QueryBuilder {
    this.whereConditions.push({ field, operator: Operator.IN, values });
    return this;
  }
  
  /**
   * Adiciona uma condição WHERE IS NULL
   * @param field Nome do campo
   * @returns this (para encadeamento)
   */
  public whereIsNull(field: string): QueryBuilder {
    return this.where(field, Operator.IS_NULL);
  }
  
  /**
   * Adiciona uma condição WHERE IS NOT NULL
   * @param field Nome do campo
   * @returns this (para encadeamento)
   */
  public whereIsNotNull(field: string): QueryBuilder {
    return this.where(field, Operator.IS_NOT_NULL);
  }
  
  /**
   * Adiciona uma condição WHERE BETWEEN
   * @param field Nome do campo
   * @param min Valor mínimo
   * @param max Valor máximo
   * @returns this (para encadeamento)
   */
  public whereBetween(field: string, min: any, max: any): QueryBuilder {
    this.whereConditions.push({ field, operator: Operator.BETWEEN, values: [min, max] });
    return this;
  }
  
  /**
   * Adiciona um campo para GROUP BY
   * @param fields Campos para agrupar
   * @returns this (para encadeamento)
   */
  public groupBy(...fields: string[]): QueryBuilder {
    this.groupByFields.push(...fields);
    return this;
  }
  
  /**
   * Adiciona uma condição HAVING
   * @param field Nome do campo
   * @param operator Operador de comparação
   * @param value Valor para comparação
   * @returns this (para encadeamento)
   */
  public having(field: string, operator: Operator, value: any): QueryBuilder {
    this.havingConditions.push({ field, operator, value });
    return this;
  }
  
  /**
   * Adiciona ordenação
   * @param field Campo para ordenação
   * @param direction Direção (ASC ou DESC)
   * @returns this (para encadeamento)
   */
  public orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): QueryBuilder {
    this.orderByFields.push({ field, direction });
    return this;
  }
  
  /**
   * Define o limite de resultados
   * @param limit Número máximo de resultados
   * @returns this (para encadeamento)
   */
  public limit(limit: number): QueryBuilder {
    this.limitValue = limit;
    return this;
  }
  
  /**
   * Define o deslocamento (offset) para paginação
   * @param offset Número de registros a pular
   * @returns this (para encadeamento)
   */
  public offset(offset: number): QueryBuilder {
    this.offsetValue = offset;
    return this;
  }
  
  /**
   * Constrói e retorna a consulta SQL com parâmetros
   * @returns Objeto com consulta SQL e array de parâmetros
   */
  public build(): { sql: string; params: any[] } {
    // Reset dos parâmetros e contador
    this.parameters = [];
    this.parameterIndex = 0;
    
    // Construção da consulta
    let sql = 'SELECT ';
    
    // Campos para seleção
    if (this.selectFields.length === 0) {
      sql += '*';
    } else {
      sql += this.selectFields.join(', ');
    }
    
    // Tabela principal
    sql += ' FROM ' + this.tableName;
    if (this.tableAlias) {
      sql += ` AS ${this.tableAlias}`;
    }
    
    // JOINs
    if (this.joinClauses.length > 0) {
      for (const join of this.joinClauses) {
        sql += ` ${join.type} ${join.table}`;
        if (join.alias) {
          sql += ` AS ${join.alias}`;
        }
        sql += ` ON ${join.on}`;
      }
    }
    
    // Condições WHERE
    if (this.whereConditions.length > 0) {
      sql += ' WHERE ' + this.buildConditions(this.whereConditions);
    }
    
    // GROUP BY
    if (this.groupByFields.length > 0) {
      sql += ' GROUP BY ' + this.groupByFields.join(', ');
    }
    
    // HAVING
    if (this.havingConditions.length > 0) {
      sql += ' HAVING ' + this.buildConditions(this.havingConditions);
    }
    
    // ORDER BY
    if (this.orderByFields.length > 0) {
      const orderClauses = this.orderByFields.map(order => `${order.field} ${order.direction}`);
      sql += ' ORDER BY ' + orderClauses.join(', ');
    }
    
    // LIMIT e OFFSET
    if (this.limitValue !== undefined) {
      sql += ` LIMIT ${this.limitValue}`;
    }
    
    if (this.offsetValue !== undefined) {
      sql += ` OFFSET ${this.offsetValue}`;
    }
    
    return { sql, params: this.parameters };
  }
  
  /**
   * Constrói a cláusula de condições (WHERE ou HAVING)
   * @param conditions Array de predicados
   * @returns String SQL com condições
   */
  private buildConditions(conditions: Predicate[]): string {
    return conditions.map((condition, index) => {
      let clause = '';
      
      // Adicionar AND para condições após a primeira
      if (index > 0) {
        clause += ' AND ';
      }
      
      switch (condition.operator) {
        case Operator.IS_NULL:
        case Operator.IS_NOT_NULL:
          // Operadores que não precisam de valor
          clause += `${condition.field} ${condition.operator}`;
          break;
          
        case Operator.IN:
        case Operator.NOT_IN:
          // Operadores que usam array de valores
          if (!condition.values || condition.values.length === 0) {
            // IN com lista vazia - sempre falso
            if (condition.operator === Operator.IN) {
              clause += '1=0';
            } else {
              clause += '1=1';
            }
          } else {
            const placeholders = condition.values.map(() => {
              this.parameterIndex++;
              return `$${this.parameterIndex}`;
            });
            clause += `${condition.field} ${condition.operator} (${placeholders.join(', ')})`;
            this.parameters.push(...condition.values);
          }
          break;
          
        case Operator.BETWEEN:
          // Operador BETWEEN com dois valores
          if (!condition.values || condition.values.length !== 2) {
            throw new Error('BETWEEN operator requires exactly two values');
          }
          
          this.parameterIndex++;
          const placeholder1 = `$${this.parameterIndex}`;
          this.parameters.push(condition.values[0]);
          
          this.parameterIndex++;
          const placeholder2 = `$${this.parameterIndex}`;
          this.parameters.push(condition.values[1]);
          
          clause += `${condition.field} ${condition.operator} ${placeholder1} AND ${placeholder2}`;
          break;
          
        default:
          // Operadores padrão com um valor
          this.parameterIndex++;
          const placeholder = `$${this.parameterIndex}`;
          clause += `${condition.field} ${condition.operator} ${placeholder}`;
          this.parameters.push(condition.value);
      }
      
      return clause;
    }).join('');
  }
  
  /**
   * Constrói uma consulta COUNT
   * @returns Objeto com consulta SQL de contagem e array de parâmetros
   */
  public buildCount(): { sql: string; params: any[] } {
    const copyBuilder = new QueryBuilder(this.tableName, this.tableAlias);
    copyBuilder.selectFields = ['COUNT(*) as total'];
    copyBuilder.whereConditions = [...this.whereConditions];
    copyBuilder.joinClauses = [...this.joinClauses];
    
    // Para COUNT não precisamos de ORDER BY, LIMIT ou OFFSET
    return copyBuilder.build();
  }
  
  /**
   * Constrói uma consulta INSERT
   * @param data Dados para inserção
   * @returns Objeto com consulta SQL de inserção e array de parâmetros
   */
  public static buildInsert(tableName: string, data: Record<string, any>, returningFields: string[] = ['*']): { sql: string; params: any[] } {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map((_, index) => `$${index + 1}`);
    
    let sql = `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
    
    // Adicionar RETURNING se especificado
    if (returningFields.length > 0) {
      sql += ` RETURNING ${returningFields.join(', ')}`;
    }
    
    return { sql, params: values };
  }
  
  /**
   * Constrói uma consulta UPDATE
   * @param tableName Nome da tabela
   * @param data Dados para atualização
   * @param whereConditions Condições para UPDATE
   * @returns Objeto com consulta SQL de atualização e array de parâmetros
   */
  public static buildUpdate(
    tableName: string,
    data: Record<string, any>,
    whereConditions: Record<string, any> = {},
    returningFields: string[] = ['*']
  ): { sql: string; params: any[] } {
    const fields = Object.keys(data);
    const values = Object.values(data);
    
    // Verificar se há dados para atualizar
    if (fields.length === 0) {
      throw new Error('No data provided for update');
    }
    
    // Construir SET clauses
    const setClauses = fields.map((field, index) => `${field} = $${index + 1}`);
    
    // Iniciar SQL
    let sql = `UPDATE ${tableName} SET ${setClauses.join(', ')}`;
    
    // Adicionar WHERE se houver condições
    const whereFields = Object.keys(whereConditions);
    if (whereFields.length > 0) {
      const whereClauses = whereFields.map((field, index) => 
        `${field} = $${index + fields.length + 1}`
      );
      sql += ` WHERE ${whereClauses.join(' AND ')}`;
      values.push(...Object.values(whereConditions));
    }
    
    // Adicionar RETURNING se especificado
    if (returningFields.length > 0) {
      sql += ` RETURNING ${returningFields.join(', ')}`;
    }
    
    return { sql, params: values };
  }
}