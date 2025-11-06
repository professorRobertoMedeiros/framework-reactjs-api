interface ModelProperty {
    name: string;
    type: string;
    optional: boolean;
    isId: boolean;
    isTimestamp: boolean;
}
/**
 * Função auxiliar para gerar o template de rotas
 * @param modelName Nome do modelo
 * @param properties Propriedades do modelo (opcional)
 * @returns Template de arquivo de rotas
 */
export declare function generateRoutesTemplate(modelName: string, properties?: ModelProperty[]): string;
export {};
