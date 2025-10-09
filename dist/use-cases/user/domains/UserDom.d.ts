/**
 * Dom para criação de usuário
 */
export interface CreateUserDom {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}
/**
 * Dom para atualização de usuário
 */
export interface UpdateUserDom {
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
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
