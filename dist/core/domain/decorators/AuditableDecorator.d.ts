/**
 * Interface para as opções do decorator Auditable
 */
export interface AuditableOptions {
    onCreate?: boolean;
    onUpdate?: boolean;
    onDelete?: boolean;
}
/**
 * Armazena as definições de auditoria para as propriedades do modelo
 */
export declare class AuditableMetadata {
    private static readonly auditableProps;
    /**
     * Define uma propriedade como auditável
     *
     * @param target Classe alvo (modelo)
     * @param propertyKey Nome da propriedade
     * @param options Opções de auditoria
     */
    static defineAuditable(target: Object, propertyKey: string, options: AuditableOptions): void;
    /**
     * Verifica se uma propriedade está configurada para auditoria em uma operação específica
     *
     * @param target Objeto alvo (instância do modelo)
     * @param propertyKey Nome da propriedade
     * @param operation Operação (create, update, delete)
     * @returns true se a propriedade deve ser auditada para a operação
     */
    static isAuditableFor(target: Object, propertyKey: string, operation: 'create' | 'update' | 'delete'): boolean;
    /**
     * Obtém todas as propriedades auditáveis para uma classe em uma operação específica
     *
     * @param target Objeto alvo (instância do modelo)
     * @param operation Operação (create, update, delete)
     * @returns Array com os nomes das propriedades auditáveis
     */
    static getAuditableProps(target: Object, operation: 'create' | 'update' | 'delete'): string[];
}
/**
 * Decorator para marcar uma propriedade como auditável
 *
 * @param options Opções de auditoria
 */
export declare function Auditable(options?: AuditableOptions): PropertyDecorator;
