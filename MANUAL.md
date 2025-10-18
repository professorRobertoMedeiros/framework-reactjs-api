# Framework ReactJS API - Manual Completo

## 🚀 Guia Rápido

### Instalação e Configuração Básica

```bash
# Instalar o framework
npm install framework-reactjs-api

# Configuração Express básica
import express from 'express';
import { setupFramework } from 'framework-reactjs-api';

const app = express();
app.use(express.json());

// Configura middleware e rotas automaticamente
setupFramework(app);

app.listen(3000, () => console.log('🚀 Servidor rodando na porta 3000'));
```

### Variáveis de Ambiente (.env)

```env
# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=seu_banco
DB_USER=postgres
DB_PASSWORD=sua_senha

# JWT
JWT_SECRET=sua_chave_secreta_aqui

# Logs
LOG_ENABLED=true
LOG_LEVEL=info  # debug|info|warn|error
LOG_SQL=true
LOG_HTTP=true

# Servidor
PORT=3000
```

## 🏗️ Recursos Principais

### 1. Scaffold de Use Cases

```bash
# Gera estrutura completa: Model, Repository, Service, Business, Routes
npx framework-reactjs-api-scaffold Produto
```

**Estrutura gerada:**
```
src/use-cases/produto/
├── domains/
│   └── ProdutoDom.ts
├── repository/
│   └── ProdutoRepository.ts
├── routes/
│   └── ProdutoRoutes.ts  (🔒 Rotas protegidas com JWT)
├── ProdutoBusiness.ts
└── ProdutoService.ts
```

### 2. Autenticação JWT

#### Rotas Disponíveis Automaticamente

```bash
# Registrar usuário
POST /api/auth/register

# Login - Retorna token JWT
POST /api/auth/login

# Dados do usuário autenticado
GET /api/auth/me  (requer token)
```

#### Proteger Rotas

```typescript
import { AuthMiddleware } from 'framework-reactjs-api';

const authMiddleware = new AuthMiddleware();
router.get('/produtos', authMiddleware.authenticate(), controller.findAll);
```

### 3. Sistema de Logs

```typescript
// Logging com informações do usuário e contexto
import { LoggingService } from 'framework-reactjs-api';

LoggingService.info('Criando novo produto', { produtoId: 123 });
// O parâmetro error pode ser Error ou qualquer outro tipo
// O serviço vai processar adequadamente
LoggingService.error('Falha na operação', error, { 
  entity: 'User', 
  operation: 'update' 
});
LoggingService.warn('Estoque baixo', { produtoId: 123, quantidade: 5 });
LoggingService.debug('Detalhes da operação', { detalhes: '...' });
```

### 4. Sistema de Rastreamento de Requisições

```typescript
// Importação dos serviços de rastreamento
import { TracingMiddleware, TracingService, LoggingService } from 'framework-reactjs-api';

// Ativar rastreamento como middleware global (deve ser um dos primeiros middlewares)
app.use(TracingMiddleware.addRequestId());

// Logs incluem ID de rastreamento automaticamente
LoggingService.info('Processando requisição');

// Acessar ID em qualquer lugar
const requestId = TracingService.getRequestId();
```

## 💾 Modelos e Banco de Dados

### Definindo Modelos com Decorators

```typescript
import { BaseModel, Entity, Column, Id } from 'framework-reactjs-api';

@Entity('produtos')
export class ProdutoModel extends BaseModel {
  @Id()
  id!: number;
  
  @Column({ type: 'VARCHAR', nullable: false, length: 255 })
  nome!: string;
  
  @Column({ type: 'DECIMAL', nullable: false, precision: 10, scale: 2 })
  preco!: number;
  
  @Column({ type: 'BOOLEAN', nullable: false, default: true })
  ativo!: boolean;
}
```

### Sincronizar Modelos com o Banco

```bash
# Compila TypeScript e cria/atualiza tabelas no banco
npm run build
npx framework-reactjs-api-sync
```

### Migrações SQL

```bash
# Executar migrações
npx framework-reactjs-api-migrate
```

O comando executa arquivos SQL encontrados em um dos seguintes diretórios:
1. `./src/infra/migrations/`
2. `./migrations/` (alternativo)

**Exemplo de arquivo de migração (migrations/20251017001_criar_tabela_produtos.sql)**:
```sql
CREATE TABLE IF NOT EXISTS produtos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

> ⚠️ **Atenção**: O comando verifica erros nos modelos e nos arquivos de migração. Se encontrar erros, exibe mensagens apropriadas e termina com código de erro não-zero.

## 📦 Padrão Repository

```typescript
import { BaseRepository } from 'framework-reactjs-api';
import { ProdutoModel } from '../models/ProdutoModel';

export class ProdutoRepository extends BaseRepository<ProdutoModel> {
  constructor() {
    super(ProdutoModel);
  }
  
  // Métodos disponíveis:
  // - findAll(), findById(), findBy(), create(), update(), delete(), count()
  
  // Métodos customizados
  async findAtivos(): Promise<ProdutoModel[]> {
    return this.findBy({ ativo: true });
  }
}
```

## 🎯 Service e Business

### Service Layer (API)

```typescript
import { BaseService } from 'framework-reactjs-api';

export class ProdutoService extends BaseService<ProdutoModel, ProdutoDom> {
  constructor() {
    const business = new ProdutoBusiness();
    super(business);
  }
  
  // Todos os métodos retornam { status, data?, message? }
  // Métodos disponíveis: findAll, findById, findBy, create, update, delete, count
  
  // Método customizado
  async desativarProduto(id: number) {
    try {
      const business = this.business as ProdutoBusiness;
      await business.desativar(id);
      
      return {
        status: 200,
        message: 'Produto desativado'
      };
    } catch (error: any) {
      return {
        status: 500,
        message: error.message
      };
    }
  }
}
```

### Business Layer (Regras de Negócio)

```typescript
import { BaseBusiness } from 'framework-reactjs-api';

export class ProdutoBusiness extends BaseBusiness<ProdutoModel, ProdutoDom> {
  constructor() {
    const repo = new ProdutoRepository();
    super(repo);
  }
  
  // Converter modelo para Dom
  protected toDom(model: ProdutoModel): ProdutoDom {
    return {
      id: model.id,
      nome: model.nome,
      preco: model.preco,
      ativo: model.ativo
    };
  }
  
  // Método de negócio customizado
  async desativar(id: number): Promise<void> {
    const produto = await this.repository.findById(id);
    if (!produto) throw new Error('Produto não encontrado');
    
    await this.repository.update(id, { ativo: false });
  }
}
```

## 🔐 Autenticação JWT Detalhada

### Customização das Rotas de Autenticação

```typescript
import { setupFramework } from 'framework-reactjs-api';

setupFramework(app, {
  apiPrefix: '/api/v1',        // default: '/api'
  authPath: '/autenticacao',   // default: '/auth'
  enableAuth: true,            // default: true
});

// Rotas disponíveis:
// POST /api/v1/autenticacao/login
// POST /api/v1/autenticacao/register
// GET /api/v1/autenticacao/me
```

### Geração e Validação de Tokens

```typescript
import { AuthService } from 'framework-reactjs-api';

const authService = new AuthService();

// Hash de senha
const hash = await authService.hashPassword('senha123');

// Comparar senha
const isValid = await authService.comparePasswords('senha123', hash);

// Gerar token
const token = authService.generateToken({ userId: 1, email: 'user@example.com' });

// Validar token
const payload = authService.verifyToken(token);
```

### Middleware de Autenticação

```typescript
import { AuthMiddleware } from 'framework-reactjs-api';

const authMiddleware = new AuthMiddleware();

// Rota protegida básica
router.get('/privado', authMiddleware.authenticate(), controller.handler);

// Com opções específicas
router.get('/admin', 
  authMiddleware.authenticate({ 
    roles: ['admin'],   // Verifica se usuário tem função admin
    strict: true        // Retorna 403 se não tiver permissão
  }),
  controller.adminHandler
);
```

## 📊 Sistema de Logs Avançado

### Formato dos Logs

Todos os logs são salvos em formato JSON com estrutura consistente:

```json
{
  "timestamp": "2025-10-17T10:30:45.123Z",
  "level": "info",
  "type": "http",
  "message": "GET /api/produtos 200 - 45ms",
  "requestId": "7a4e31c9-58d5-4eea-9866-863c90fcfa2b",
  "user": {
    "id": 1,
    "email": "usuario@example.com"
  },
  "request": {
    "method": "GET",
    "url": "/api/produtos"
  },
  "data": {
    "statusCode": 200,
    "duration": 45
  }
}
```

### Arquivos de Log

Os logs são separados por tipo e data:

```
logs/
├── sql-2025-10-17.log    # Queries SQL 
├── http-2025-10-17.log   # Requisições HTTP
├── app-2025-10-17.log    # Logs da aplicação
└── error-2025-10-17.log  # Erros
```

### Níveis de Log

```typescript
// Diferentes níveis disponíveis
LoggingService.debug('Detalhes técnicos', { debug: true });
LoggingService.info('Operação concluída', { id: 123 });
LoggingService.warn('Atenção', { recurso: 'limitado' });
LoggingService.error('Falha crítica', error, { fatal: true });
```

## 🔍 Query Builder

```typescript
import { QueryBuilder } from 'framework-reactjs-api';

// Construir queries SQL de forma programática
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

## 🛠️ Configuração Avançada

### Opções de Setup

```typescript
setupFramework(app, {
  apiPrefix: '/api/v1',        // Prefixo para todas as rotas da API
  enableAuth: true,            // Habilitar rotas de autenticação
  authPath: '/autenticacao',   // Caminho para rotas de auth
  enableHTTPLogging: true,     // Logging de requisições HTTP
  databaseConfig: {            // Configuração do banco
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

## 🚀 Exemplos Práticos

### Proteger uma API de Produtos

```typescript
// src/use-cases/produto/routes/ProdutoRoutes.ts
import express from 'express';
import { TracingMiddleware, AuthMiddleware, LoggingService } from 'framework-reactjs-api';
import { ProdutoController } from '../ProdutoController';

const router = express.Router();
const controller = new ProdutoController();
const authMiddleware = new AuthMiddleware();

// Adicionar ID de rastreamento a todas as requisições
router.use(TracingMiddleware.addRequestId());

// Todas as rotas protegidas com JWT
router.get('/', authMiddleware.authenticate(), async (req, res) => {
  try {
    LoggingService.info('Buscando todos os produtos');
    const result = await controller.findAll(req, res);
    return result;
  } catch (error) {
    // Garantir que error seja tratado corretamente
    const err = error instanceof Error ? error : new Error(String(error));
    LoggingService.error('Erro ao buscar produtos', err);
    return res.status(500).json({ message: 'Erro interno' });
  }
});

router.post('/', authMiddleware.authenticate(), async (req, res) => {
  try {
    LoggingService.info('Criando produto', { data: req.body });
    const result = await controller.create(req, res);
    return result;
  } catch (error) {
    LoggingService.error('Erro ao criar produto', error);
    return res.status(500).json({ message: 'Erro interno' });
  }
});

export default router;
```

## 📋 Exports Disponíveis

```typescript
import {
  // Core
  BaseModel, Entity, Column, Id,
  
  // Auth
  AuthMiddleware, AuthService, UserModel, 
  
  // Setup
  setupFramework, createFrameworkRouter,
  
  // Database
  CustomORM, QueryBuilder, BaseRepository,
  
  // Logs e Rastreamento
  LoggingService, TracingService, TracingMiddleware,
  
  // Service e Business
  BaseService, BaseBusiness
} from 'framework-reactjs-api';
```

## � Ferramentas de Linha de Comando

O framework oferece várias ferramentas de linha de comando para facilitar o desenvolvimento:

### Geração de Código (Scaffold)

Para gerar rapidamente arquivos de caso de uso para uma nova entidade:

```bash
# Gera arquivos para uma nova entidade
npx framework-reactjs-api-scaffold NomeEntidade
```

### Sincronização de Schema

Para sincronizar os modelos TypeScript com seu banco de dados:

```bash
# Sincroniza os modelos com o banco de dados
npx framework-reactjs-api-sync
```

### Execução de Migrações

Para aplicar migrações SQL no banco de dados:

```bash
# Executa migrações pendentes
npx framework-reactjs-api-migrate
```

## �🔎 Acompanhamento e Diagnóstico de Projetos

### Verificação de Integridade do Projeto

Para garantir que seu projeto esteja corretamente configurado para usar o framework, execute:

```bash
# Verifica a estrutura e configuração do projeto
npx framework-reactjs-api-check
```

Esta ferramenta irá verificar:
- Estrutura de diretórios
- Arquivos de configuração
- Dependências instaladas
- Configuração do TypeScript
- Configurações de ambiente (.env)
- Modelos e decoradores
- Arquivos de migração

A verificação irá exibir:
- ✅ Verificações bem-sucedidas
- ⚠️ Avisos (itens opcionais ou que podem ser melhorados)
- ❌ Erros (problemas que precisam ser corrigidos)

### Solução de Problemas Comuns

#### Erros na Execução de Migrações

Quando executar `npx framework-reactjs-api-migrate` e encontrar erros como:

```
Erro ao processar modelo ClienteNovoModel.ts: SyntaxError: Invalid or unexpected token
```

**Diagnóstico:**
1. Use a ferramenta de diagnóstico para identificar problemas antes de executar migrações:
   ```bash
   npx framework-reactjs-api-check
   ```
2. Verifique se o arquivo do modelo possui erros de sintaxe
3. Confira se os decoradores estão sendo usados corretamente
4. Verifique se há caracteres inválidos (como aspas curvas " " copiadas de editores de texto)
5. Certifique-se que o TypeScript está compilando sem erros

**Solução:**
```bash
# Primeiro verifique com a ferramenta de diagnóstico
npx framework-reactjs-api-check

# Verifique erros de compilação TypeScript
tsc --noEmit

# Corrija os erros nos arquivos indicados
# Em seguida, execute novamente a migração
npx framework-reactjs-api-migrate
```

> **Dica**: Erros como `Invalid or unexpected token` frequentemente são causados por caracteres invisíveis ou aspas incorretas. A ferramenta de diagnóstico ajuda a identificar esses problemas.

#### Erro: Módulo não Encontrado

Se receber erros de módulo não encontrado:

```
Cannot find module 'framework-reactjs-api'
```

**Solução:**
```bash
npm install framework-reactjs-api --save
```

#### Erro: Propriedades Ausentes

Se receber erros como "Property 'X' does not exist on type...":

```
Property 'TracingService' does not exist on type...
```

**Solução:**
Atualize o framework para a versão mais recente:

```bash
npm update framework-reactjs-api
```

---

**Versão:** 1.0.0  
**Última atualização:** Outubro 2025