# 📚 Framework ReactJS API - Guia Rápido

Framework completo para APIs RESTful com TypeScript, DDD, Clean Architecture e JWT.

## 🚀 Instalação

```bash
npm install framework-reactjs-api
```

## ⚙️ Configuração Inicial

### 1. TypeScript (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "esModuleInterop": true,
    "strict": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"]
    }
  }
}
```

### 2. Servidor Express (src/app.ts)

```typescript
import express from 'express';
import { setupFramework } from 'framework-reactjs-api';

const app = express();
app.use(express.json());

// ✨ Configura autenticação automaticamente
setupFramework(app);

// Suas rotas personalizadas
app.use('/api/products', productRouter);

export default app;
```

### 3. Variáveis de Ambiente (.env)

```env
# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=seu_banco
DB_USER=postgres
DB_PASSWORD=sua_senha

# JWT
JWT_SECRET=sua_chave_secreta_aqui

# Servidor
PORT=3000

# Logs (opcional)
LOG_ENABLED=true
LOG_LEVEL=info
LOG_SQL=true
LOG_HTTP=true
```

### 4. Sistema de Logs 📊

O framework inclui logging automático de SQL e HTTP com usuário autenticado:

```typescript
import { setupFramework } from 'framework-reactjs-api';

// Logs HTTP habilitados automaticamente se LOG_HTTP=true
setupFramework(app, {
  enableHTTPLogging: true
});
```

**Logs gerados automaticamente:**
- ✅ Queries SQL (SELECT, INSERT, UPDATE, DELETE)
- ✅ Requisições HTTP (método, URL, status, duração)
- ✅ Usuário autenticado (quando disponível)
- ✅ Formato JSON estruturado

**Arquivos de log:**
```
logs/
├── sql-2025-01-17.log    # Queries SQL
├── http-2025-01-17.log   # Requisições HTTP
└── error-2025-01-17.log  # Erros
```

📚 **Documentação completa:** Ver [SISTEMA-LOGS.md](./SISTEMA-LOGS.md)

## 🏗️ Criar Use Case Completo

```bash
# Gera: Model, Repository, Service, Business, Routes (protegidas com JWT)
npx framework-reactjs-api-scaffold Produto
```

**Estrutura gerada:**
```
src/use-cases/produto/
├── domains/
│   └── ProdutoDom.ts
├── repository/
│   └── ProdutoRepository.ts
├── ProdutoBusiness.ts
├── ProdutoService.ts
└── routes/
    └── ProdutoRoutes.ts  (🔒 Rotas privadas com JWT)
```

## 💾 Modelos com Decorators

```typescript
// src/models/ProdutoModel.ts
import { BaseModel, Entity, Column, Id } from 'framework-reactjs-api';

@Entity('produtos')
export class ProdutoModel extends BaseModel {
  @Id()
  id!: number;

  @Column({ type: 'VARCHAR', nullable: false, length: 255 })
  nome!: string;

  @Column({ type: 'DECIMAL', nullable: false, precision: 10, scale: 2 })
  preco!: number;

  @Column({ type: 'INTEGER', nullable: false, default: 0 })
  estoque!: number;

  @Column({ type: 'BOOLEAN', nullable: false, default: true })
  ativo!: boolean;
}
```

## 🔄 Sincronizar Banco de Dados

```bash
# Compila TypeScript
npm run build

# Sincroniza modelos com banco (cria/atualiza tabelas)
npx framework-reactjs-api-sync
```

**Sincroniza automaticamente:**
- ✅ Modelos do framework (users, products)
- ✅ Seus modelos personalizados

## 🔐 Autenticação JWT

### Rotas Disponíveis (Automáticas)

```bash
# Registrar usuário
POST /api/auth/register
{
  "email": "usuario@example.com",
  "password": "senha123",
  "first_name": "João",
  "last_name": "Silva"
}

# Login
POST /api/auth/login
{
  "email": "usuario@example.com",
  "password": "senha123"
}
# Retorna: { success: true, token: "JWT_TOKEN", user: {...} }

# Dados do usuário (requer token)
GET /api/auth/me
Authorization: Bearer JWT_TOKEN
```

### Proteger Rotas Customizadas

```typescript
import { Router } from 'express';
import { AuthMiddleware } from 'framework-reactjs-api';

const router = Router();
const authMiddleware = new AuthMiddleware();

// Rota protegida
router.get('/produtos', 
  authMiddleware.authenticate(), 
  produtoController.findAll
);

// Rota pública
router.get('/produtos/publicos', 
  produtoController.findPublic
);
```

## 📦 Repository Pattern

```typescript
import { BaseRepository } from 'framework-reactjs-api';
import { ProdutoModel } from '@/models/ProdutoModel';

export class ProdutoRepository extends BaseRepository<ProdutoModel> {
  constructor() {
    super(ProdutoModel);
  }

  // Métodos herdados automaticamente:
  // - findAll(options)
  // - findById(id)
  // - findBy(conditions, options)
  // - create(data)
  // - update(id, data)
  // - delete(id)
  // - count(conditions)

  // Método customizado
  async findAtivos(): Promise<ProdutoModel[]> {
    return this.findBy({ ativo: true });
  }

  async findByPrecoRange(min: number, max: number): Promise<ProdutoModel[]> {
    const query = `
      SELECT * FROM produtos 
      WHERE preco BETWEEN $1 AND $2 
      AND ativo = true
    `;
    return this.customQuery(query, [min, max]);
  }
}
```

## 🎯 Service Layer

```typescript
import { BaseService } from 'framework-reactjs-api';
import { ProdutoRepository } from './repository/ProdutoRepository';

export class ProdutoService extends BaseService<ProdutoModel> {
  constructor(private produtoRepo: ProdutoRepository) {
    super(produtoRepo);
  }

  async buscarPorCategoria(categoria: string) {
    return this.executeWithResponse(async () => {
      return await this.produtoRepo.findBy({ categoria });
    });
  }

  async aplicarDesconto(id: number, percentual: number) {
    return this.executeWithResponse(async () => {
      const produto = await this.produtoRepo.findById(id);
      if (!produto) throw new Error('Produto não encontrado');
      
      const novoPreco = produto.preco * (1 - percentual / 100);
      return await this.produtoRepo.update(id, { preco: novoPreco });
    });
  }
}
```

## 🔧 Configuração Avançada

### Setup com Opções Customizadas

```typescript
import { setupFramework } from 'framework-reactjs-api';

setupFramework(app, {
  apiPrefix: '/api/v1',        // default: '/api'
  enableAuth: true,            // default: true
  authPath: '/authentication', // default: '/auth'
  databaseConfig: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  }
});
```

### Criar Router Separado

```typescript
import { createFrameworkRouter } from 'framework-reactjs-api';

const frameworkRouter = createFrameworkRouter({
  enableAuth: true,
  authPath: '/auth'
});

app.use('/api', frameworkRouter);
```

## 📊 Query Builder

```typescript
import { QueryBuilder } from 'framework-reactjs-api';

const produtos = await new QueryBuilder('produtos')
  .select(['id', 'nome', 'preco'])
  .where('ativo', '=', true)
  .where('preco', '>', 100)
  .orderBy('preco', 'DESC')
  .limit(10)
  .execute();

// Com JOIN
const produtosComCategoria = await new QueryBuilder('produtos')
  .select(['produtos.*', 'categorias.nome as categoria_nome'])
  .join('categorias', 'produtos.categoria_id', 'categorias.id')
  .where('produtos.ativo', '=', true)
  .execute();
```

## 🗄️ Migrações SQL

```bash
# Criar migration
mkdir -p migrations
cat > migrations/001_create_produtos.sql << 'EOF'
CREATE TABLE IF NOT EXISTS produtos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  estoque INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOF

# Executar migrations
npx framework-reactjs-api-migrate
```

## 🧪 Testando a API

```bash
# Registrar usuário
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "senha123",
    "first_name": "Test",
    "last_name": "User"
  }'

# Fazer login
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"senha123"}' \
  | jq -r '.token')

# Acessar rota protegida
curl http://localhost:3000/api/produtos \
  -H "Authorization: Bearer $TOKEN"
```

## 📁 Estrutura de Projeto Recomendada

```
seu-projeto/
├── src/
│   ├── models/
│   │   ├── ProdutoModel.ts
│   │   └── CategoriaModel.ts
│   ├── use-cases/
│   │   ├── produto/
│   │   │   ├── domains/
│   │   │   ├── repository/
│   │   │   ├── routes/
│   │   │   ├── ProdutoBusiness.ts
│   │   │   └── ProdutoService.ts
│   │   └── categoria/
│   ├── app.ts
│   └── server.ts
├── migrations/
│   └── 001_initial_schema.sql
├── .env
├── tsconfig.json
└── package.json
```

## 🔍 Troubleshooting

### Erro: "relation 'users' does not exist"

```bash
npm run build
npx framework-reactjs-api-sync
```

### Erro: "Cannot find module"

```bash
npm install
npm run build
```

### Rotas de auth não funcionam

Verifique:
1. `setupFramework(app)` foi chamado?
2. Tabela `users` foi criada?
3. JWT_SECRET está definido no .env?

### Modelo não sincronizado

Checklist:
- [ ] Tem decorador `@Entity('tabela')`?
- [ ] Extende `BaseModel`?
- [ ] Executou `npm run build`?
- [ ] Executou `npx framework-reactjs-api-sync`?

## 📚 Exports Disponíveis

```typescript
import {
  // Core
  BaseModel,
  Entity, Column, Id, UniqueIndex, BusinessIndex,
  
  // Models do Framework
  UserModel,
  ProductModel,
  CategoryModel,
  
  // Services
  BaseService,
  ServiceResponse,
  PaginatedResponse,
  
  // Business
  BaseBusiness,
  
  // Auth
  AuthMiddleware,
  AuthService,
  authRoutes,
  
  // Setup
  setupFramework,
  createFrameworkRouter,
  FrameworkOptions,
  
  // Database
  CustomORM,
  initializeORM,
  QueryBuilder,
  Operator,
  
  // Repository
  BaseRepository,
  IRepository,
  PaginationOptions,
  PaginatedResult,
  
  // CLI
  runMigration,
  syncSchema,
  scaffoldUseCase,
  
  // User Use Case
  UserBusiness,
  UserService,
  UserRepository,
  UserDom
} from 'framework-reactjs-api';
```

## 🎯 Comandos CLI

```bash
# Criar use case completo
npx framework-reactjs-api-scaffold NomeDoUseCase

# Sincronizar modelos com banco
npx framework-reactjs-api-sync

# Executar migrações SQL
npx framework-reactjs-api-migrate
```

## 🚀 Quick Start Completo

```bash
# 1. Criar projeto
mkdir meu-projeto && cd meu-projeto
npm init -y

# 2. Instalar dependências
npm install express framework-reactjs-api dotenv
npm install -D typescript @types/node @types/express

# 3. Configurar TypeScript
npx tsc --init --experimentalDecorators --emitDecoratorMetadata

# 4. Criar estrutura
mkdir -p src/models src/use-cases

# 5. Criar app
cat > src/app.ts << 'EOF'
import express from 'express';
import { setupFramework } from 'framework-reactjs-api';
const app = express();
app.use(express.json());
setupFramework(app);
export default app;
EOF

# 6. Criar servidor
cat > src/server.ts << 'EOF'
import app from './app';
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
EOF

# 7. Criar .env
cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=5432
DB_NAME=meu_banco
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=minha_chave_secreta
PORT=3000
EOF

# 8. Adicionar scripts no package.json
npm pkg set scripts.build="tsc"
npm pkg set scripts.dev="ts-node src/server.ts"
npm pkg set scripts.start="node dist/server.js"

# 9. Compilar e sincronizar
npm run build
npx framework-reactjs-api-sync

# 10. Iniciar servidor
npm run dev
```

## 📖 Links Úteis

- **Repositório:** https://github.com/professorRobertoMedeiros/framework-reactjs-api
- **Documentação Completa:** Ver README.md
- **Sistema de Logs:** Ver SISTEMA-LOGS.md
- **Autenticação JWT:** Ver GUIA-AUTENTICACAO-JWT.md
- **Exemplos:** Ver pasta `/examples`

---

**Versão:** 1.0.0  
**Última atualização:** Janeiro 2025  
**Licença:** MIT
