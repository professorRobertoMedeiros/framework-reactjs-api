"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserBusiness = void 0;
const UserModel_1 = require("../../core/domain/models/UserModel");
const UserRepository_1 = require("./repository/UserRepository");
// Implementação do business de usuários
class UserBusiness {
    constructor(userRepository) {
        this.userRepository = userRepository || new UserRepository_1.UserRepository();
    }
    // Converter modelo para Dom (removendo dados sensíveis como password_hash)
    toDom(user) {
        return {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            active: user.active,
            created_at: user.created_at,
            updated_at: user.updated_at
        };
    }
    // Hash de senha (exemplo simples - em produção usar bcrypt ou similar)
    hashPassword(password) {
        // Este é apenas um exemplo e NÃO deve ser usado em produção
        // Em produção, use bcrypt ou argon2
        return `hashed_${password}_${Date.now()}`;
    }
    // Obter usuário por ID
    async getUserById(id) {
        const user = await this.userRepository.findById(id);
        return user ? this.toDom(user) : null;
    }
    // Obter todos os usuários
    async getAllUsers(options) {
        const users = await this.userRepository.findAll(options);
        return users.map(user => this.toDom(user));
    }
    // Criar um novo usuário
    async createUser(data) {
        // Validar email
        if (!UserModel_1.UserModel.validateEmail(data.email)) {
            throw new Error('Email inválido');
        }
        // Verificar se o email já está em uso
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error('Email já está em uso');
        }
        // Hash da senha
        const password_hash = this.hashPassword(data.password);
        // Criar modelo de usuário
        const user = UserModel_1.UserModel.create({
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            password_hash: password_hash
        });
        // Persistir no repositório
        const createdUser = await this.userRepository.create(user);
        return this.toDom(createdUser);
    }
    // Atualizar um usuário existente
    async updateUser(id, data) {
        // Verificar se o usuário existe
        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            return null;
        }
        // Verificar se o email está sendo atualizado e se já está em uso
        if (data.email && data.email !== existingUser.email) {
            // Validar novo email
            if (!UserModel_1.UserModel.validateEmail(data.email)) {
                throw new Error('Email inválido');
            }
            // Verificar se o novo email já está em uso
            const userWithEmail = await this.userRepository.findByEmail(data.email);
            if (userWithEmail && userWithEmail.id !== id) {
                throw new Error('Email já está em uso por outro usuário');
            }
        }
        // Preparar dados para atualização
        const updateData = {
            ...data,
            // Hash da senha se fornecida
            ...(data.password && { password_hash: this.hashPassword(data.password) })
        };
        // Remover campo password (não é uma coluna no banco)
        if ('password' in updateData) {
            delete updateData.password;
        }
        // Atualizar no repositório
        const updatedUser = await this.userRepository.update(id, updateData);
        return updatedUser ? this.toDom(updatedUser) : null;
    }
    // Excluir um usuário
    async deleteUser(id) {
        // Verificar se o usuário existe
        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            return false;
        }
        // Excluir do repositório
        return await this.userRepository.delete(id);
    }
    // Ativar um usuário
    async activateUser(id) {
        return await this.updateUser(id, { active: true });
    }
    // Desativar um usuário
    async deactivateUser(id) {
        return await this.updateUser(id, { active: false });
    }
}
exports.UserBusiness = UserBusiness;
//# sourceMappingURL=UserBusiness.js.map