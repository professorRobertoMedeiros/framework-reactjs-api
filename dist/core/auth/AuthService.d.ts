import 'dotenv/config';
export interface TokenPayload {
    id: number;
    email: string;
    roles?: string[];
    [key: string]: any;
}
export interface TokenOptions {
    expiresIn?: string | number;
    audience?: string | string[];
    issuer?: string;
    subject?: string;
    notBefore?: string | number;
}
export interface TokenVerificationResult {
    valid: boolean;
    payload?: TokenPayload;
    error?: string;
}
/**
 * Serviço de autenticação com JWT
 */
export declare class AuthService {
    private readonly jwtSecret;
    private readonly saltRounds;
    constructor();
    /**
     * Gera um hash para senha usando bcrypt
     * @param plainPassword Senha em texto plano
     * @returns Hash da senha
     */
    hashPassword(plainPassword: string): Promise<string>;
    /**
     * Verifica se a senha em texto plano corresponde ao hash armazenado
     * @param plainPassword Senha em texto plano
     * @param hashedPassword Hash da senha armazenado
     * @returns Verdadeiro se a senha corresponder ao hash
     */
    comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
    /**
     * Gera um token JWT
     * @param payload Dados a serem incluídos no token
     * @param options Opções para geração do token
     * @returns Token JWT gerado
     */
    generateToken(payload: TokenPayload, options?: TokenOptions): string;
    /**
     * Verifica e decodifica um token JWT
     * @param token Token JWT a ser verificado
     * @returns Resultado da verificação com payload se válido
     */
    verifyToken(token: string): TokenVerificationResult;
    /**
     * Extrai token do cabeçalho de autorização
     * @param authHeader Cabeçalho Authorization (ex: 'Bearer token123')
     * @returns Token extraído ou null se formato inválido
     */
    extractTokenFromHeader(authHeader?: string): string | null;
}
