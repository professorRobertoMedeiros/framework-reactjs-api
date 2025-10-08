/**
 * Dom para criação de usuário
 */
export interface CreateUserDom {
  first_name: string;
  last_name: string;
  email: string;
  password: string; // Senha em texto claro para ser processada
}

/**
 * Dom para atualização de usuário
 */
export interface UpdateUserDom {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string; // Senha em texto claro para ser processada
  active?: boolean;
}

/**
 * Dom para representação de usuário
 */
export interface UserDom {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  active: boolean;
  created_at: Date;
  updated_at?: Date;
}