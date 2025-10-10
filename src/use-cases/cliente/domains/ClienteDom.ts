/**
 * Dom para criação de cliente
 */
export interface CreateClienteDom {
  nome: string;
  email: string;
  telefone?: string;
  ativo: boolean;
}

/**
 * Dom para atualização de cliente
 */
export interface UpdateClienteDom {
  nome: string;
  email: string;
  telefone?: string;
  ativo: boolean;
  updated_at?: Date;
}

/**
 * Dom para representação de cliente
 */
export interface ClienteDom {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  ativo: boolean;
  created_at: Date;
  updated_at?: Date;
}