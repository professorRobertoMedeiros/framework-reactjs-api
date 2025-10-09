"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const UserBusiness_1 = require("./UserBusiness");
// Implementação do serviço de usuários
class UserService {
    constructor(userBusiness) {
        this.userBusiness = userBusiness || new UserBusiness_1.UserBusiness();
    }
    // Obter usuário por ID
    async getUserById(id) {
        try {
            const user = await this.userBusiness.getUserById(id);
            if (!user) {
                return {
                    success: false,
                    message: `Usuário com ID ${id} não encontrado`,
                    error: 'USER_NOT_FOUND'
                };
            }
            return {
                success: true,
                message: 'Usuário encontrado com sucesso',
                data: user
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Erro ao buscar usuário',
                error: error.message || 'Erro desconhecido'
            };
        }
    }
    // Obter todos os usuários com paginação
    async getAllUsers(page = 1, limit = 10) {
        try {
            // Validar parâmetros de paginação
            if (page < 1)
                page = 1;
            if (limit < 1)
                limit = 10;
            if (limit > 100)
                limit = 100;
            const offset = (page - 1) * limit;
            // Buscar usuários no business
            const users = await this.userBusiness.getAllUsers({
                limit,
                offset
            });
            // Usar repository dentro do business para contar total
            // Implementado nesta camada apenas para demonstração
            const userRepository = new UserBusiness_1.UserBusiness().userRepository;
            const total = await userRepository.count();
            const totalPages = Math.ceil(total / limit);
            return {
                success: true,
                message: 'Usuários listados com sucesso',
                data: {
                    users,
                    total,
                    page,
                    limit,
                    totalPages
                }
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Erro ao listar usuários',
                error: error.message || 'Erro desconhecido'
            };
        }
    }
    // Criar um novo usuário
    async createUser(data) {
        try {
            // Validar dados de entrada
            if (!data.first_name || !data.last_name || !data.email || !data.password) {
                return {
                    success: false,
                    message: 'Todos os campos são obrigatórios',
                    error: 'MISSING_REQUIRED_FIELDS'
                };
            }
            // Regras de validação adicionais
            if (data.password.length < 6) {
                return {
                    success: false,
                    message: 'A senha deve ter pelo menos 6 caracteres',
                    error: 'PASSWORD_TOO_SHORT'
                };
            }
            // Chamar o business para criar o usuário
            const user = await this.userBusiness.createUser(data);
            return {
                success: true,
                message: 'Usuário criado com sucesso',
                data: user
            };
        }
        catch (error) {
            // Tratamento de erros específicos
            if (error.message.includes('Email já está em uso')) {
                return {
                    success: false,
                    message: 'Este email já está cadastrado',
                    error: 'EMAIL_ALREADY_EXISTS'
                };
            }
            if (error.message.includes('Email inválido')) {
                return {
                    success: false,
                    message: 'O formato do email é inválido',
                    error: 'INVALID_EMAIL'
                };
            }
            return {
                success: false,
                message: 'Erro ao criar usuário',
                error: error.message || 'Erro desconhecido'
            };
        }
    }
    // Atualizar um usuário existente
    async updateUser(id, data) {
        try {
            // Validar se há campos para atualizar
            if (Object.keys(data).length === 0) {
                return {
                    success: false,
                    message: 'Nenhum dado fornecido para atualização',
                    error: 'NO_UPDATE_DATA'
                };
            }
            // Regras de validação adicionais
            if (data.password && data.password.length < 6) {
                return {
                    success: false,
                    message: 'A senha deve ter pelo menos 6 caracteres',
                    error: 'PASSWORD_TOO_SHORT'
                };
            }
            // Chamar o business para atualizar o usuário
            const user = await this.userBusiness.updateUser(id, data);
            if (!user) {
                return {
                    success: false,
                    message: `Usuário com ID ${id} não encontrado`,
                    error: 'USER_NOT_FOUND'
                };
            }
            return {
                success: true,
                message: 'Usuário atualizado com sucesso',
                data: user
            };
        }
        catch (error) {
            // Tratamento de erros específicos
            if (error.message.includes('Email já está em uso')) {
                return {
                    success: false,
                    message: 'Este email já está cadastrado por outro usuário',
                    error: 'EMAIL_ALREADY_EXISTS'
                };
            }
            if (error.message.includes('Email inválido')) {
                return {
                    success: false,
                    message: 'O formato do email é inválido',
                    error: 'INVALID_EMAIL'
                };
            }
            return {
                success: false,
                message: 'Erro ao atualizar usuário',
                error: error.message || 'Erro desconhecido'
            };
        }
    }
    // Excluir um usuário
    async deleteUser(id) {
        try {
            const deleted = await this.userBusiness.deleteUser(id);
            if (!deleted) {
                return {
                    success: false,
                    message: `Usuário com ID ${id} não encontrado`,
                    error: 'USER_NOT_FOUND'
                };
            }
            return {
                success: true,
                message: 'Usuário excluído com sucesso'
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Erro ao excluir usuário',
                error: error.message || 'Erro desconhecido'
            };
        }
    }
    // Ativar um usuário
    async activateUser(id) {
        try {
            const user = await this.userBusiness.activateUser(id);
            if (!user) {
                return {
                    success: false,
                    message: `Usuário com ID ${id} não encontrado`,
                    error: 'USER_NOT_FOUND'
                };
            }
            return {
                success: true,
                message: 'Usuário ativado com sucesso',
                data: user
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Erro ao ativar usuário',
                error: error.message || 'Erro desconhecido'
            };
        }
    }
    // Desativar um usuário
    async deactivateUser(id) {
        try {
            const user = await this.userBusiness.deactivateUser(id);
            if (!user) {
                return {
                    success: false,
                    message: `Usuário com ID ${id} não encontrado`,
                    error: 'USER_NOT_FOUND'
                };
            }
            return {
                success: true,
                message: 'Usuário desativado com sucesso',
                data: user
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Erro ao desativar usuário',
                error: error.message || 'Erro desconhecido'
            };
        }
    }
}
exports.UserService = UserService;
//# sourceMappingURL=UserService.js.map