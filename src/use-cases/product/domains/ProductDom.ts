/**
 * Dom para criação de product
 */
export interface CreateProductDom {
  name: string;
  description?: string;
  price: number;
  stock: number;
  active: boolean;
}

/**
 * Dom para atualização de product
 */
export interface UpdateProductDom {
  name: string;
  description?: string;
  price: number;
  stock: number;
  active: boolean;
  updated_at?: Date;
}

/**
 * Dom para representação de product
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