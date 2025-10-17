# 🔐 Autenticação JWT - Guia Prático

Sistema completo de autenticação JWT integrado ao framework.

## 🚀 Setup Rápido

```typescript
import express from 'express';
import { setupFramework } from 'framework-reactjs-api';

const app = express();
app.use(express.json());

// Configura rotas de autenticação automaticamente
setupFramework(app);

app.listen(3000);
```

**Pronto!** As rotas de autenticação já estão disponíveis.

## 📋 Rotas Disponíveis

### 1. Registrar Usuário
```bash
POST /api/auth/register

# Body
{
  "email": "usuario@example.com",
  "password": "senha123",
  "first_name": "João",
  "last_name": "Silva"
}

# Response (201)
{
  "success": true,
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "first_name": "João",
    "last_name": "Silva",
    "active": true
  }
}
```

### 2. Fazer Login
```bash
POST /api/auth/login

# Body
{
  "email": "usuario@example.com",
  "password": "senha123"
}

# Response (200)
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "first_name": "João",
    "last_name": "Silva"
  }
}
```

### 3. Obter Dados do Usuário
```bash
GET /api/auth/me

# Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Response (200)
{
  "success": true,
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "first_name": "João",
    "last_name": "Silva",
    "active": true
  }
}
```

## 🔒 Proteger Rotas Customizadas

### Exemplo Básico

```typescript
import { Router } from 'express';
import { AuthMiddleware } from 'framework-reactjs-api';

const router = Router();
const authMiddleware = new AuthMiddleware();

// Rota protegida (requer JWT)
router.get('/produtos', 
  authMiddleware.authenticate(),
  async (req, res) => {
    // req.user contém dados do usuário autenticado
    res.json({ user: req.user });
  }
);

// Rota pública (sem autenticação)
router.get('/produtos/publicos', 
  async (req, res) => {
    res.json({ produtos: [] });
  }
);
```

### Use Case Completo

```typescript
// src/use-cases/produto/routes/ProdutoRoutes.ts
import { Router } from 'express';
import { AuthMiddleware } from 'framework-reactjs-api';
import { ProdutoController } from '../ProdutoController';

const router = Router();
const authMiddleware = new AuthMiddleware();
const controller = new ProdutoController();

// Todas as rotas protegidas
router.get('/', authMiddleware.authenticate(), controller.findAll);
router.get('/:id', authMiddleware.authenticate(), controller.findById);
router.post('/', authMiddleware.authenticate(), controller.create);
router.put('/:id', authMiddleware.authenticate(), controller.update);
router.delete('/:id', authMiddleware.authenticate(), controller.delete);

export default router;
```

### Scaffold Gera Rotas Protegidas Automaticamente

```bash
npx framework-reactjs-api-scaffold Produto
```

**As rotas geradas já vêm protegidas com JWT!**

## 🧪 Testar Autenticação

### Com cURL

```bash
# 1. Registrar
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "senha123",
    "first_name": "Test",
    "last_name": "User"
  }'

# 2. Login e salvar token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"senha123"}' \
  | jq -r '.token')

# 3. Acessar rota protegida
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 4. Acessar sua rota protegida
curl http://localhost:3000/api/produtos \
  -H "Authorization: Bearer $TOKEN"
```

### Com JavaScript/Fetch

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'senha123'
  })
});

const { token } = await loginResponse.json();

// 2. Usar token em requisições
const produtosResponse = await fetch('http://localhost:3000/api/produtos', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const produtos = await produtosResponse.json();
```

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# .env
JWT_SECRET=sua_chave_secreta_super_segura
JWT_EXPIRES_IN=24h

DB_HOST=localhost
DB_PORT=5432
DB_NAME=seu_banco
DB_USER=postgres
DB_PASSWORD=sua_senha
```

### Customizar Setup

```typescript
import { setupFramework } from 'framework-reactjs-api';

setupFramework(app, {
  apiPrefix: '/api/v1',        // default: '/api'
  authPath: '/authentication', // default: '/auth'
  enableAuth: true,            // default: true
  databaseConfig: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  }
});

// Rotas ficarão em: /api/v1/authentication/login
```

### Desabilitar Autenticação (API Pública)

```typescript
setupFramework(app, {
  enableAuth: false  // Não cria rotas de auth
});
```

## 🔑 Como Funciona

### 1. Registro de Usuário
- Senha é hasheada com bcrypt (10 salt rounds)
- Usuário salvo na tabela `users`
- Email é único (constraint no banco)

### 2. Login
- Verifica email e senha
- Gera JWT token (válido por 24h)
- Retorna token + dados do usuário

### 3. Autenticação de Requisições
- Middleware valida token no header `Authorization`
- Extrai dados do usuário do token
- Injeta `req.user` com dados do usuário
- Se token inválido/expirado: retorna 401 Unauthorized

## 🗄️ Modelo UserModel

```typescript
@Entity('users')
export class UserModel extends BaseModel {
  @Id()
  id!: number;

  @Column({ type: 'VARCHAR', length: 100 })
  first_name!: string;

  @Column({ type: 'VARCHAR', length: 100 })
  last_name!: string;

  @Column({ type: 'VARCHAR', length: 255 })
  email!: string;  // UNIQUE

  @Column({ type: 'VARCHAR', length: 255 })
  password_hash!: string;

  @Column({ type: 'BOOLEAN', default: true })
  active!: boolean;

  @Column({ type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ type: 'TIMESTAMP', nullable: true })
  updated_at?: Date;
}
```

**Tabela criada automaticamente** ao executar `npx framework-reactjs-api-sync`

## 📦 Classes Disponíveis

### AuthService
```typescript
import { AuthService } from 'framework-reactjs-api';

const authService = new AuthService();

// Hashear senha
const hash = await authService.hashPassword('senha123');

// Comparar senha
const isValid = await authService.comparePasswords('senha123', hash);

// Gerar token
const token = authService.generateToken({ 
  userId: 1, 
  email: 'user@example.com' 
});

// Validar token
const payload = authService.verifyToken(token);
```

### AuthMiddleware
```typescript
import { AuthMiddleware } from 'framework-reactjs-api';

const authMiddleware = new AuthMiddleware();

// Usar em rotas
router.get('/protegido', authMiddleware.authenticate(), handler);
```

### UserRepository
```typescript
import { UserRepository } from 'framework-reactjs-api';

const userRepo = new UserRepository();

// Buscar por email
const user = await userRepo.findByEmail('user@example.com');

// Buscar por ID
const user = await userRepo.findById(1);

// Criar usuário
const newUser = await userRepo.create({
  email: 'new@example.com',
  password_hash: hashedPassword,
  first_name: 'João',
  last_name: 'Silva'
});
```

## 🎯 Fluxo Completo

```
1. Cliente → POST /api/auth/register
           ↓
2. Framework → Hash da senha com bcrypt
           ↓
3. Framework → Salva na tabela users
           ↓
4. Framework → Retorna sucesso
           ↓
5. Cliente → POST /api/auth/login
           ↓
6. Framework → Verifica email/senha
           ↓
7. Framework → Gera JWT token
           ↓
8. Framework → Retorna token + user
           ↓
9. Cliente → GET /api/produtos
            Header: Authorization: Bearer <token>
           ↓
10. AuthMiddleware → Valida token
           ↓
11. AuthMiddleware → Extrai user do token
           ↓
12. AuthMiddleware → Injeta req.user
           ↓
13. Controller → Processa requisição
           ↓
14. Framework → Retorna resposta
```

## 🐛 Troubleshooting

### ❌ Erro: "relation 'users' does not exist"

**Solução:**
```bash
npm run build
npx framework-reactjs-api-sync
```

### ❌ Erro: "jwt must be provided"

Token não foi enviado no header. Verifique:
```javascript
headers: {
  'Authorization': 'Bearer SEU_TOKEN_AQUI'
}
```

### ❌ Erro: "jwt malformed"

Token inválido ou mal formatado. Faça login novamente.

### ❌ Erro: "jwt expired"

Token expirou (24h). Faça login novamente.

### ❌ Erro: "Invalid credentials"

Email ou senha incorretos.

### ❌ Erro: "User not found"

Usuário não existe ou foi deletado.

## 🔒 Boas Práticas

### 1. Usar HTTPS em Produção
```typescript
// Nunca transmita tokens via HTTP não-criptografado
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (!req.secure) {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
  });
}
```

### 2. Armazenar Token Seguramente (Frontend)
```javascript
// ✅ BOM: HttpOnly cookie (mais seguro)
// Configurar no backend para enviar cookie
res.cookie('token', token, { 
  httpOnly: true, 
  secure: true, 
  sameSite: 'strict' 
});

// ⚠️ OK: localStorage (menos seguro, mas funcional)
localStorage.setItem('token', token);

// ❌ EVITAR: variável global
window.token = token;  // Vulnerável a XSS
```

### 3. Validar Dados de Entrada
```typescript
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  
  // Validar email
  if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return res.status(400).json({ error: 'Email inválido' });
  }
  
  // Validar senha (mínimo 6 caracteres)
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Senha muito curta' });
  }
  
  // Prosseguir com registro...
});
```

### 4. Usar Variáveis de Ambiente
```typescript
// ❌ NUNCA faça isso
const JWT_SECRET = 'minha-chave-123';

// ✅ Sempre use .env
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não definido!');
}
```

## 📚 Exemplos Adicionais

### Refresh Token (Avançado)

```typescript
// Implementação customizada de refresh token
router.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    const payload = authService.verifyToken(refreshToken);
    const newToken = authService.generateToken({
      userId: payload.userId,
      email: payload.email
    });
    
    res.json({ success: true, token: newToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});
```

### Logout (Frontend)

```javascript
// Simplesmente remover o token
localStorage.removeItem('token');
// ou
document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
```

---

**Versão:** 1.0.0  
**Última atualização:** Janeiro 2025
