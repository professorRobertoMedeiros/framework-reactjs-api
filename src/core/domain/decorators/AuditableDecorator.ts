/**
 * Interface para as opções do decorator Auditable
 */
export interface AuditableOptions {
  onCreate?: boolean; // Auditar na criação (padrão: true)
  onUpdate?: boolean; // Auditar na atualização (padrão: true)
  onDelete?: boolean; // Auditar na exclusão (padrão: true)
}

/**
 * Armazena as definições de auditoria para as propriedades do modelo
 */
export class AuditableMetadata {
  private static readonly auditableProps = new Map<string, Map<string, AuditableOptions>>();

  /**
   * Define uma propriedade como auditável
   * 
   * @param target Classe alvo (modelo)
   * @param propertyKey Nome da propriedade
   * @param options Opções de auditoria
   */
  public static defineAuditable(
    target: Object,
    propertyKey: string,
    options: AuditableOptions
  ): void {
    const className = target.constructor.name;

    // Configurar opções padrão
    const auditOptions: AuditableOptions = {
      onCreate: options.onCreate !== undefined ? options.onCreate : true,
      onUpdate: options.onUpdate !== undefined ? options.onUpdate : true,
      onDelete: options.onDelete !== undefined ? options.onDelete : true
    };

    // Obter ou criar mapa para a classe
    if (!this.auditableProps.has(className)) {
      this.auditableProps.set(className, new Map<string, AuditableOptions>());
    }

    // Adicionar propriedade ao mapa da classe
    const classMeta = this.auditableProps.get(className)!;
    classMeta.set(propertyKey, auditOptions);
  }

  /**
   * Verifica se uma propriedade está configurada para auditoria em uma operação específica
   * 
   * @param target Objeto alvo (instância do modelo)
   * @param propertyKey Nome da propriedade
   * @param operation Operação (create, update, delete)
   * @returns true se a propriedade deve ser auditada para a operação
   */
  public static isAuditableFor(
    target: Object,
    propertyKey: string,
    operation: 'create' | 'update' | 'delete'
  ): boolean {
    const className = target.constructor.name;
    const classMeta = this.auditableProps.get(className);

    if (!classMeta || !classMeta.has(propertyKey)) {
      return false;
    }

    const options = classMeta.get(propertyKey)!;

    switch (operation) {
      case 'create': return options.onCreate === true;
      case 'update': return options.onUpdate === true;
      case 'delete': return options.onDelete === true;
      default: return false;
    }
  }

  /**
   * Obtém todas as propriedades auditáveis para uma classe em uma operação específica
   * 
   * @param target Objeto alvo (instância do modelo)
   * @param operation Operação (create, update, delete)
   * @returns Array com os nomes das propriedades auditáveis
   */
  public static getAuditableProps(
    target: Object,
    operation: 'create' | 'update' | 'delete'
  ): string[] {
    const className = target.constructor.name;
    const classMeta = this.auditableProps.get(className);

    if (!classMeta) {
      return [];
    }

    const result: string[] = [];

    for (const [prop, options] of classMeta.entries()) {
      let isAuditable = false;

      switch (operation) {
        case 'create': isAuditable = options.onCreate === true; break;
        case 'update': isAuditable = options.onUpdate === true; break;
        case 'delete': isAuditable = options.onDelete === true; break;
      }

      if (isAuditable) {
        result.push(prop);
      }
    }

    return result;
  }
}

/**
 * Decorator para marcar uma propriedade como auditável
 * 
 * @param options Opções de auditoria
 */
export function Auditable(options: AuditableOptions = {}): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    AuditableMetadata.defineAuditable(
      target,
      propertyKey.toString(),
      options
    );
  };
}