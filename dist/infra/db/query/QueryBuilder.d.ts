/**
 * Operadores para consultas
 */
export declare enum Operator {
    EQUALS = "=",
    NOT_EQUALS = "!=",
    GREATER_THAN = ">",
    GREATER_EQUALS = ">=",
    LESS_THAN = "<",
    LESS_EQUALS = "<=",
    LIKE = "LIKE",
    ILIKE = "ILIKE",// Case-insensitive LIKE
    IN = "IN",
    NOT_IN = "NOT IN",
    IS_NULL = "IS NULL",
    IS_NOT_NULL = "IS NOT NULL",
    BETWEEN = "BETWEEN"
}
/**
 * Operadores de junção para consultas
 */
export declare enum JoinType {
    INNER = "INNER JOIN",
    LEFT = "LEFT JOIN",
    RIGHT = "RIGHT JOIN",
    FULL = "FULL JOIN"
}
/**
 * Interface para um predicado (condição)
 */
export interface Predicate {
    field: string;
    operator: Operator;
    value?: any;
    values?: any[];
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
export declare class QueryBuilder {
    private tableName;
    private tableAlias?;
    private selectFields;
    private whereConditions;
    private joinClauses;
    private orderByFields;
    private groupByFields;
    private havingConditions;
    private limitValue?;
    private offsetValue?;
    private parameters;
    private parameterIndex;
    /**
     * Cria uma nova instância de QueryBuilder
     * @param tableName Nome da tabela para consulta
     * @param alias Alias opcional para a tabela
     */
    constructor(tableName: string, alias?: string);
    /**
     * Cria um novo QueryBuilder para a tabela especificada
     * @param tableName Nome da tabela
     * @param alias Alias opcional para a tabela
     * @returns Nova instância de QueryBuilder
     */
    static from(tableName: string, alias?: string): QueryBuilder;
    /**
     * Define os campos a serem selecionados
     * @param fields Nomes dos campos ou expressões SQL
     * @returns this (para encadeamento)
     */
    select(...fields: string[]): QueryBuilder;
    /**
     * Adiciona campos à seleção
     * @param fields Nomes dos campos ou expressões SQL
     * @returns this (para encadeamento)
     */
    addSelect(...fields: string[]): QueryBuilder;
    /**
     * Adiciona um join à consulta
     * @param type Tipo de join (INNER, LEFT, RIGHT, FULL)
     * @param table Nome da tabela para join
     * @param alias Alias opcional para a tabela
     * @param on Condição de join
     * @returns this (para encadeamento)
     */
    join(type: JoinType, table: string, alias: string, on: string): QueryBuilder;
    /**
     * Adiciona um INNER JOIN à consulta
     * @param table Nome da tabela para join
     * @param alias Alias opcional para a tabela
     * @param on Condição de join
     * @returns this (para encadeamento)
     */
    innerJoin(table: string, alias: string, on: string): QueryBuilder;
    /**
     * Adiciona um LEFT JOIN à consulta
     * @param table Nome da tabela para join
     * @param alias Alias opcional para a tabela
     * @param on Condição de join
     * @returns this (para encadeamento)
     */
    leftJoin(table: string, alias: string, on: string): QueryBuilder;
    /**
     * Adiciona uma condição WHERE
     * @param field Nome do campo
     * @param operator Operador de comparação
     * @param value Valor para comparação
     * @returns this (para encadeamento)
     */
    where(field: string, operator: Operator, value?: any): QueryBuilder;
    /**
     * Adiciona uma condição WHERE com operador =
     * @param field Nome do campo
     * @param value Valor para comparação
     * @returns this (para encadeamento)
     */
    whereEquals(field: string, value: any): QueryBuilder;
    /**
     * Adiciona uma condição WHERE com operador LIKE
     * @param field Nome do campo
     * @param pattern Padrão para LIKE (ex: '%texto%')
     * @returns this (para encadeamento)
     */
    whereLike(field: string, pattern: string): QueryBuilder;
    /**
     * Adiciona uma condição WHERE com operador IN
     * @param field Nome do campo
     * @param values Array de valores para IN
     * @returns this (para encadeamento)
     */
    whereIn(field: string, values: any[]): QueryBuilder;
    /**
     * Adiciona uma condição WHERE IS NULL
     * @param field Nome do campo
     * @returns this (para encadeamento)
     */
    whereIsNull(field: string): QueryBuilder;
    /**
     * Adiciona uma condição WHERE IS NOT NULL
     * @param field Nome do campo
     * @returns this (para encadeamento)
     */
    whereIsNotNull(field: string): QueryBuilder;
    /**
     * Adiciona uma condição WHERE BETWEEN
     * @param field Nome do campo
     * @param min Valor mínimo
     * @param max Valor máximo
     * @returns this (para encadeamento)
     */
    whereBetween(field: string, min: any, max: any): QueryBuilder;
    /**
     * Adiciona um campo para GROUP BY
     * @param fields Campos para agrupar
     * @returns this (para encadeamento)
     */
    groupBy(...fields: string[]): QueryBuilder;
    /**
     * Adiciona uma condição HAVING
     * @param field Nome do campo
     * @param operator Operador de comparação
     * @param value Valor para comparação
     * @returns this (para encadeamento)
     */
    having(field: string, operator: Operator, value: any): QueryBuilder;
    /**
     * Adiciona ordenação
     * @param field Campo para ordenação
     * @param direction Direção (ASC ou DESC)
     * @returns this (para encadeamento)
     */
    orderBy(field: string, direction?: 'ASC' | 'DESC'): QueryBuilder;
    /**
     * Define o limite de resultados
     * @param limit Número máximo de resultados
     * @returns this (para encadeamento)
     */
    limit(limit: number): QueryBuilder;
    /**
     * Define o deslocamento (offset) para paginação
     * @param offset Número de registros a pular
     * @returns this (para encadeamento)
     */
    offset(offset: number): QueryBuilder;
    /**
     * Constrói e retorna a consulta SQL com parâmetros
     * @returns Objeto com consulta SQL e array de parâmetros
     */
    build(): {
        sql: string;
        params: any[];
    };
    /**
     * Constrói a cláusula de condições (WHERE ou HAVING)
     * @param conditions Array de predicados
     * @returns String SQL com condições
     */
    private buildConditions;
    /**
     * Constrói uma consulta COUNT
     * @returns Objeto com consulta SQL de contagem e array de parâmetros
     */
    buildCount(): {
        sql: string;
        params: any[];
    };
    /**
     * Constrói uma consulta INSERT
     * @param data Dados para inserção
     * @returns Objeto com consulta SQL de inserção e array de parâmetros
     */
    static buildInsert(tableName: string, data: Record<string, any>, returningFields?: string[]): {
        sql: string;
        params: any[];
    };
    /**
     * Constrói uma consulta UPDATE
     * @param tableName Nome da tabela
     * @param data Dados para atualização
     * @param whereConditions Condições para UPDATE
     * @returns Objeto com consulta SQL de atualização e array de parâmetros
     */
    static buildUpdate(tableName: string, data: Record<string, any>, whereConditions?: Record<string, any>, returningFields?: string[]): {
        sql: string;
        params: any[];
    };
}
