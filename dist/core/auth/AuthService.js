"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
require("dotenv/config");
/**
 * Serviço de autenticação com JWT
 */
class AuthService {
    constructor() {
        // Usar variável de ambiente para o segredo do JWT ou um padrão apenas para desenvolvimento
        this.jwtSecret = process.env.JWT_SECRET || 'sua-chave-secreta-padrao-nao-use-em-producao';
        this.saltRounds = 10; // Número padrão de rounds para bcrypt
    }
    /**
     * Gera um hash para senha usando bcrypt
     * @param plainPassword Senha em texto plano
     * @returns Hash da senha
     */
    async hashPassword(plainPassword) {
        return await bcryptjs_1.default.hash(plainPassword, this.saltRounds);
    }
    /**
     * Verifica se a senha em texto plano corresponde ao hash armazenado
     * @param plainPassword Senha em texto plano
     * @param hashedPassword Hash da senha armazenado
     * @returns Verdadeiro se a senha corresponder ao hash
     */
    async comparePassword(plainPassword, hashedPassword) {
        return await bcryptjs_1.default.compare(plainPassword, hashedPassword);
    }
    /**
     * Gera um token JWT
     * @param payload Dados a serem incluídos no token
     * @param options Opções para geração do token
     * @returns Token JWT gerado
     */
    generateToken(payload, options = {}) {
        // Opções padrão
        const defaultOptions = {
            expiresIn: '24h' // Token expira em 24 horas por padrão
        };
        // Mesclar opções padrão com opções fornecidas
        const tokenOptions = { ...defaultOptions, ...options };
        // Gerar e retornar token
        return jsonwebtoken_1.default.sign(payload, this.jwtSecret, tokenOptions);
    }
    /**
     * Verifica e decodifica um token JWT
     * @param token Token JWT a ser verificado
     * @returns Resultado da verificação com payload se válido
     */
    verifyToken(token) {
        try {
            // Verificar e decodificar o token
            const decoded = jsonwebtoken_1.default.verify(token, this.jwtSecret);
            // Retornar resultado bem-sucedido
            return {
                valid: true,
                payload: decoded
            };
        }
        catch (error) {
            // Retornar erro de verificação
            return {
                valid: false,
                error: error.message || 'Token inválido'
            };
        }
    }
    /**
     * Extrai token do cabeçalho de autorização
     * @param authHeader Cabeçalho Authorization (ex: 'Bearer token123')
     * @returns Token extraído ou null se formato inválido
     */
    extractTokenFromHeader(authHeader) {
        if (!authHeader)
            return null;
        // Verificar formato 'Bearer token'
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return null;
        }
        return parts[1];
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map