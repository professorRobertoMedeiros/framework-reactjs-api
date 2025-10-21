import { BaseModel } from './BaseModel';
/**
 * Modelo de exemplo com colunas auditáveis
 */
export declare class ProdutoModel extends BaseModel {
    id: number;
    nome: string;
    descricao?: string;
    preco: number;
    estoque: number;
    ativo: boolean;
    createdAt: Date;
    updatedAt?: Date;
    /**
     * Converte o modelo para um objeto simples
     * @returns Objeto com os dados do modelo
     */
    toJSON(): Record<string, any>;
}
