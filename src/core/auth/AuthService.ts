import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

// Tipos de payload para tokens JWT
export interface TokenPayload {
  id: number;
  email: string;
  roles?: string[];
  [key: string]: any; // Permite campos adicionais no payload
}

// Opções para geração de tokens
export interface TokenOptions {
  expiresIn?: string | number; // Tempo de expiração (ex: '1h', '7d', 3600)
  audience?: string | string[]; // Público alvo (aud)
  issuer?: string; // Emissor (iss)
  subject?: string; // Assunto (sub)
  notBefore?: string | number; // Não usar antes de (nbf)
}

// Resultado da verificação de token
export interface TokenVerificationResult {
  valid: boolean;
  payload?: TokenPayload;
  error?: string;
}

/**
 * Serviço de autenticação com JWT
 */
export class AuthService {
  private readonly jwtSecret: string;
  private readonly saltRounds: number;

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
  public async hashPassword(plainPassword: string): Promise<string> {
    return await bcrypt.hash(plainPassword, this.saltRounds);
  }

  /**
   * Verifica se a senha em texto plano corresponde ao hash armazenado
   * @param plainPassword Senha em texto plano
   * @param hashedPassword Hash da senha armazenado
   * @returns Verdadeiro se a senha corresponder ao hash
   */
  public async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Gera um token JWT
   * @param payload Dados a serem incluídos no token
   * @param options Opções para geração do token
   * @returns Token JWT gerado
   */
  public generateToken(payload: TokenPayload, options: TokenOptions = {}): string {
    // Opções padrão - usa JWT_EXPIRES_IN da variável de ambiente ou '24h' como fallback
    const defaultOptions = {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    };

    // Mesclar opções padrão com opções fornecidas
    const tokenOptions = { ...defaultOptions, ...options } as jwt.SignOptions;

    // Gerar e retornar token
    return jwt.sign(payload, this.jwtSecret, tokenOptions);
  }

  /**
   * Verifica e decodifica um token JWT
   * @param token Token JWT a ser verificado
   * @returns Resultado da verificação com payload se válido
   */
  public verifyToken(token: string): TokenVerificationResult {
    try {
      // Verificar e decodificar o token
      const decoded = jwt.verify(token, this.jwtSecret);
      
      // Retornar resultado bem-sucedido
      return {
        valid: true,
        payload: decoded as TokenPayload
      };
    } catch (error: any) {
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
  public extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;
    
    // Verificar formato 'Bearer token'
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }
}