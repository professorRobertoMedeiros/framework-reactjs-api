/**
 * Dom (DTO) para User
 * Interface de transferência de dados
 */
export interface UserDom {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  active: boolean;
  created_at: Date;
  updated_at?: Date;
}