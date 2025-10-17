# 🔐 Guia Completo de Autenticação JWT

## ✅ O que foi implementado

1. **Rotas de autenticação prontas para uso** - Não precisa implementar JWT do zero
2. **Rotas geradas pelo scaffold são PRIVADAS** - Protegidas automaticamente com JWT
3. **Sistema completo de login/registro/verificação**

## 📋 Como Usar no Seu Projeto

### 1. Importar as rotas de autenticação do framework

```typescript
// src/index.ts ou src/app.ts
import express from 'express';
import { authRoutes } from 'framework-reactjs-api';

const app = express();
app.use(express.json());

// Rota pública de autenticação (login/register)
app.use('/api/auth', authRoutes);

// Suas outras rotas (protegidas)
// ...

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
```

### 2. Rotas Disponíveis

#### 🔓 POST /api/auth/login (Pública)
Autenticar usuário e obter token JWT

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

**Response (sucesso - 200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "name": "Nome Completo",
    "roles": []
  }
}
```

**Response (erro - 401):**
```json
{
  "success": false,
  "message": "Credenciais inválidas",
  "error": "INVALID_CREDENTIALS"
}
```

#### 🔓 POST /api/auth/register (Pública)
Registrar novo usuário

**Body:**
```json
{
  "email": "novousuario@example.com",
  "password": "senha123",
  "first_name": "João",
  "last_name": "Silva"
}
```

**Response (sucesso - 201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "email": "novousuario@example.com",
    "name": "João Silva",
    "roles": []
  }
}
```

#### 🔐 GET /api/auth/me (Privada)
Obter informações do usuário autenticado

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (sucesso - 200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "name": "Nome Completo",
    "roles": []
  }
}
```

### 3. Rotas Geradas pelo Scaffold (PRIVADAS)

Quando você executa:
```bash
npx framework-reactjs-api-scaffold Product
```

As rotas geradas em `src/use-cases/product/routes/ProductRoutes.ts` são **AUTOMATICAMENTE PROTEGIDAS**:

```typescript
import { Router, Request, Response } from 'express';
import { ProductService } from '../ProductService';
import { AuthMiddleware } from 'framework-reactjs-api';

const router = Router();
const service = new ProductService();
const authMiddleware = new AuthMiddleware();

// ✅ PRIVADA - Requer token JWT
router.get('/', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  // ...
});

// ✅ PRIVADA - Requer token JWT
router.post('/', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  // ...
});

// Todas as rotas são protegidas!
```

### 4. Como Acessar Rotas Protegidas

#### No Frontend (JavaScript/React/Angular/Vue):

```javascript
// 1. Fazer login e guardar token
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'usuario@example.com',
    password: 'senha123'
  })
});

const { token } = await loginResponse.json();
localStorage.setItem('token', token);

// 2. Usar token para acessar rotas protegidas
const productsResponse = await fetch('http://localhost:3000/api/products', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

const products = await productsResponse.json();
```

#### Com Axios:

```javascript
import axios from 'axios';

// Configurar interceptor para adicionar token automaticamente
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Usar normalmente
const response = await axios.get('http://localhost:3000/api/products');
```

#### Com cURL (Testes):

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@example.com","password":"senha123"}'

# Copiar o token da resposta

# Acessar rota protegida
curl http://localhost:3000/api/products \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 5. Estrutura Completa do App

```typescript
// src/app.ts
import express from 'express';
import { authRoutes } from 'framework-reactjs-api';
import productRouter from './use-cases/product/routes/ProductRoutes';
import clienteRouter from './use-cases/cliente/routes/ClienteRoutes';

const app = express();
app.use(express.json());

// ========== ROTAS PÚBLICAS ==========
app.use('/api/auth', authRoutes);  // Login, Register, etc

// ========== ROTAS PRIVADAS (Requerem JWT) ==========
app.use('/api/products', productRouter);
app.use('/api/clientes', clienteRouter);

app.listen(3000, () => {
  console.log('🚀 Servidor rodando na porta 3000');
  console.log('📝 Login: POST http://localhost:3000/api/auth/login');
  console.log('🔐 Products: GET http://localhost:3000/api/products (protegido)');
});

export default app;
```

### 6. Configuração do JWT_SECRET

**⚠️ IMPORTANTE**: Configure a variável de ambiente `JWT_SECRET` para segurança

```env
# .env
JWT_SECRET=sua-chave-secreta-super-segura-aqui-use-algo-complexo
DB_HOST=localhost
DB_PORT=5432
DB_NAME=seu_banco
DB_USER=postgres
DB_PASSWORD=postgres
```

**Gerar chave segura:**
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OpenSSL
openssl rand -hex 64
```

### 7. Acessar Dados do Usuário nas Rotas

Após autenticação, o objeto `req.user` contém os dados do usuário:

```typescript
router.get('/', authMiddleware.authenticate(), async (req: Request, res: Response) => {
  // Dados do usuário autenticado disponíveis em req.user
  console.log(req.user);
  // { id: 1, email: "user@example.com", name: "...", roles: [] }
  
  const userId = req.user.id;
  const userEmail = req.user.email;
  
  // Use para filtrar dados por usuário
  const myProducts = await service.findAll({
    conditions: { userId: req.user.id }
  });
  
  return res.json(myProducts);
});
```

### 8. Proteger Rotas por Papel (Role)

```typescript
import { AuthMiddleware } from 'framework-reactjs-api';

const authMiddleware = new AuthMiddleware();

// Apenas administradores
router.delete('/:id', 
  authMiddleware.authenticate(),
  authMiddleware.hasRole(['admin']),
  async (req, res) => {
    // Só usuários com role 'admin' chegam aqui
  }
);

// Admin ou moderador
router.put('/:id',
  authMiddleware.authenticate(),
  authMiddleware.hasRole(['admin', 'moderator']),
  async (req, res) => {
    // ...
  }
);
```

## 🧪 Testando o Fluxo Completo

### 1. Registrar novo usuário
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123",
    "first_name": "João",
    "last_name": "Silva"
  }'
```

### 2. Fazer login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123"
  }'
```

### 3. Usar token para acessar rota protegida
```bash
curl http://localhost:3000/api/products \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 📊 Respostas de Erro

| Status | Erro | Descrição |
|--------|------|-----------|
| 400 | MISSING_CREDENTIALS | Email ou senha não fornecidos |
| 400 | MISSING_FIELDS | Campos obrigatórios ausentes |
| 401 | INVALID_CREDENTIALS | Email ou senha incorretos |
| 401 | MISSING_TOKEN | Token JWT não fornecido |
| 401 | UNAUTHORIZED | Token inválido ou expirado |
| 403 | FORBIDDEN | Usuário sem permissão (role) |
| 404 | USER_NOT_FOUND | Usuário não encontrado |
| 409 | EMAIL_ALREADY_EXISTS | Email já cadastrado |
| 500 | INTERNAL_SERVER_ERROR | Erro interno do servidor |

## ✅ Checklist de Implementação

- [ ] Importar `authRoutes` do framework
- [ ] Registrar rotas: `app.use('/api/auth', authRoutes)`
- [ ] Configurar `JWT_SECRET` no `.env`
- [ ] Gerar usecases com `npx framework-reactjs-api-scaffold`
- [ ] Rotas são automaticamente protegidas com JWT
- [ ] Testar login: `POST /api/auth/login`
- [ ] Copiar token da resposta
- [ ] Testar rota protegida com: `Authorization: Bearer {token}`

---

**Data**: 17 de outubro de 2025  
**Status**: ✅ **IMPLEMENTADO E TESTADO**  
**Novidades**:
- ✅ Rotas de autenticação prontas (`authRoutes`)
- ✅ Scaffold gera rotas PRIVADAS automaticamente
- ✅ Middleware de autenticação aplicado em todas as rotas geradas
- ✅ Sistema completo de login/registro/verificação
