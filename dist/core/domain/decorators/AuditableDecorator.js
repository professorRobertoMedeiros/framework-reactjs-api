"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditableMetadata = void 0;
exports.Auditable = Auditable;
/**
 * Armazena as definições de auditoria para as propriedades do modelo
 */
class AuditableMetadata {
    /**
     * Define uma propriedade como auditável
     *
     * @param target Classe alvo (modelo)
     * @param propertyKey Nome da propriedade
     * @param options Opções de auditoria
     */
    static defineAuditable(target, propertyKey, options) {
        const className = target.constructor.name;
        // Configurar opções padrão
        const auditOptions = {
            onCreate: options.onCreate !== undefined ? options.onCreate : true,
            onUpdate: options.onUpdate !== undefined ? options.onUpdate : true,
            onDelete: options.onDelete !== undefined ? options.onDelete : true
        };
        // Obter ou criar mapa para a classe
        if (!this.auditableProps.has(className)) {
            this.auditableProps.set(className, new Map());
        }
        // Adicionar propriedade ao mapa da classe
        const classMeta = this.auditableProps.get(className);
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
    static isAuditableFor(target, propertyKey, operation) {
        const className = target.constructor.name;
        const classMeta = this.auditableProps.get(className);
        if (!classMeta || !classMeta.has(propertyKey)) {
            return false;
        }
        const options = classMeta.get(propertyKey);
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
    static getAuditableProps(target, operation) {
        const className = target.constructor.name;
        const classMeta = this.auditableProps.get(className);
        if (!classMeta) {
            return [];
        }
        const result = [];
        for (const [prop, options] of classMeta.entries()) {
            let isAuditable = false;
            switch (operation) {
                case 'create':
                    isAuditable = options.onCreate === true;
                    break;
                case 'update':
                    isAuditable = options.onUpdate === true;
                    break;
                case 'delete':
                    isAuditable = options.onDelete === true;
                    break;
            }
            if (isAuditable) {
                result.push(prop);
            }
        }
        return result;
    }
}
exports.AuditableMetadata = AuditableMetadata;
AuditableMetadata.auditableProps = new Map();
/**
 * Decorator para marcar uma propriedade como auditável
 *
 * @param options Opções de auditoria
 */
function Auditable(options = {}) {
    return (target, propertyKey) => {
        AuditableMetadata.defineAuditable(target, propertyKey.toString(), options);
    };
}
//# sourceMappingURL=AuditableDecorator.js.map