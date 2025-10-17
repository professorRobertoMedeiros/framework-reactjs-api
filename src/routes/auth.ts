import { Router, Request, Response } from 'express';
import { AuthService } from '../core/auth/AuthService';
import { UserRepository } from '../use-cases/user/repository/UserRepository';
import { UserModel } from '../core/domain/models/UserModel';

const router = Router();
const authService = new AuthService();
const userRepository = new UserRepository();

/**
 * POST /auth/login
 * Rota pública para autenticação de usuários
 * 
 * Body:
 * {
 *   "email": "usuario@example.com",
 *   "password": "senha123"
 * }
 * 
 * Response (sucesso):
 * {
 *   "success": true,
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "user": {
 *     "id": 1,
 *     "email": "usuario@example.com",
 *     "name": "Nome do Usuário"
 *   }
 * }
 * 
 * Response (erro):
 * {
 *   "success": false,
 *   "message": "Credenciais inválidas",
 *   "error": "INVALID_CREDENTIALS"
 * }
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validar entrada
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios',
        error: 'MISSING_CREDENTIALS'
      });
    }

    // Buscar usuário por email
    const user = await userRepository.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Verificar senha
    const isPasswordValid = await authService.comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Gerar token JWT
    const token = authService.generateToken({
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      roles: [] // TODO: Implementar sistema de roles
    });

    // Retornar token e informações do usuário
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        roles: []
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * POST /auth/register
 * Rota pública para registro de novos usuários
 * 
 * Body:
 * {
 *   "email": "novousuario@example.com",
 *   "password": "senha123",
 *   "first_name": "Nome",
 *   "last_name": "Sobrenome"
 * }
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    // Validar entrada
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: 'Email, senha, nome e sobrenome são obrigatórios',
        error: 'MISSING_FIELDS'
      });
    }

    // Verificar se usuário já existe
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email já cadastrado',
        error: 'EMAIL_ALREADY_EXISTS'
      });
    }

    // Hash da senha
    const hashedPassword = await authService.hashPassword(password);

    // Criar novo usuário
    const userData = new UserModel();
    userData.email = email;
    userData.password_hash = hashedPassword;
    userData.first_name = first_name;
    userData.last_name = last_name;
    userData.active = true;
    userData.created_at = new Date();
    
    const newUser = await userRepository.create(userData);

    // Gerar token JWT
    const token = authService.generateToken({
      id: newUser.id!,
      email: newUser.email,
      name: `${newUser.first_name} ${newUser.last_name}`,
      roles: []
    });

    // Retornar token e informações do usuário
    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: `${newUser.first_name} ${newUser.last_name}`,
        roles: []
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * GET /auth/me
 * Rota protegida para obter informações do usuário autenticado
 * 
 * Headers:
 * Authorization: Bearer {token}
 * 
 * Response:
 * {
 *   "success": true,
 *   "user": {
 *     "id": 1,
 *     "email": "usuario@example.com",
 *     "name": "Nome do Usuário",
 *     "roles": ["user"]
 *   }
 * }
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    // Extrair token do header
    const token = authService.extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido',
        error: 'MISSING_TOKEN'
      });
    }

    // Verificar token
    const verification = authService.verifyToken(token);

    if (!verification.valid || !verification.payload) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado',
        error: verification.error
      });
    }

    // Buscar usuário atualizado do banco
    const user = await userRepository.findById(verification.payload.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
        error: 'USER_NOT_FOUND'
      });
    }

    // Retornar informações do usuário
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        roles: []
      }
    });

  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

export default router;
