/**
 * Dom para criação de produto
 */
export interface CreateProductDom {
    name: string;
    description?: string;
    price: number;
    stock: number;
    active?: boolean;
}
/**
 * Dom para atualização de produto
 */
export interface UpdateProductDom {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    active?: boolean;
}
/**
 * Dom para representação de produto
 */
export interface ProductDom {
    id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    active: boolean;
    created_at: Date;
    updated_at?: Date;
}
