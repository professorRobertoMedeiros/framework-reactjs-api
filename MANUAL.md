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
# Executar migrações SQL
npx framework-reactjs-api-migrate
```

O comando executa arquivos SQL encontrados nos seguintes diretórios:
1. Migrações do framework (arquivos SQL internos do framework)
2. Migrações do projeto em `./src/infra/migrations/`
3. Migrações do projeto em `./migrations/` (alternativo)

> **Nota:** O comando `migrate` executa apenas os arquivos SQL de migração e não processa os modelos TypeScript. Para sincronizar seus modelos com o banco de dados, use o comando `sync` mencionado acima.

As migrações são executadas em ordem alfabética/numérica dentro de cada diretório, e o sistema rastreia quais migrações já foram aplicadas, evitando duplicações. Por convenção, nomeie seus arquivos de migração começando com uma data para garantir a ordem correta, por exemplo: `20251018001_criar_tabela_usuarios.sql`.

**Migrações incluídas no framework:**
- `20251008000000_initial_schema.sql`: Cria a tabela de usuários e adiciona um usuário de exemplo
- `20251018001_add_admin_user.sql`: Adiciona um usuário administrador com credenciais pré-definidas

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
  
  // OPCIONAL: Converter modelo para Dom apenas se precisar transformar dados
  // Por padrão, BaseBusiness retorna o próprio modelo sem transformação
  /*
  protected toDom(model: ProdutoModel): ProdutoDom {
    return {
      id: model.id,
      nome: model.nome,
      preco: model.preco,
      ativo: model.ativo
    };
  }
  */
  
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
const isValid = await authService.comparePassword('senha123', hash);

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
Erro de conexão com o banco de dados. Verifique se o banco está disponível e as credenciais estão corretas no arquivo .env
```

**Diagnóstico:**
1. Verifique se o banco de dados está rodando e acessível
2. Confira as credenciais no arquivo `.env`
3. Certifique-se de que o usuário tem permissões para criar e modificar tabelas

**Problemas com Arquivos SQL:**
1. Use a ferramenta de diagnóstico para verificar erros de sintaxe nos arquivos SQL:
   ```bash
   npx framework-reactjs-api-check
   ```
2. Verifique se os arquivos SQL estão bem formados e terminam com ponto-e-vírgula
3. Certifique-se de que não há caracteres inválidos (como aspas curvas " " copiadas de editores de texto)

**Solução:**
```bash
# Verifique o projeto com a ferramenta de diagnóstico
npx framework-reactjs-api-check

# Verifique manualmente os arquivos SQL em migrations/
cat migrations/*.sql

# Corrija os erros nos arquivos SQL indicados
# Em seguida, execute novamente a migração
npx framework-reactjs-api-migrate
```

> **Dica**: Para problemas com seus modelos, use o comando `npx framework-reactjs-api-sync` que irá criar as tabelas baseadas nos seus modelos TypeScript. O comando `migrate` executa apenas scripts SQL e não processa os modelos.

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

**Versão:** 1.0.1  
**Última atualização:** 18 de Outubro de 2025# Sistema de Auditoria

O sistema de auditoria permite rastrear alterações em modelos específicos, registrando quem criou, alterou ou deletou dados, bem como os valores antigos e novos. Apenas as colunas marcadas para auditoria serão rastreadas.

## Tabela `audit_logs`

```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(255) NOT NULL,
  record_id INTEGER NOT NULL,
  column_name VARCHAR(255) NOT NULL,
  action_type VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
  old_value TEXT,
  new_value TEXT,
  user_id INTEGER,
  user_email VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Configurando Colunas Auditáveis

Use o decorador `@Auditable()` para marcar as colunas que devem ser auditadas:

```typescript
import { BaseModel, Entity, Column, Id } from 'framework-reactjs-api';
import { Auditable } from 'framework-reactjs-api';

@Entity('produtos')
export class ProdutoModel extends BaseModel {
  @Id()
  id!: number;
  
  @Column({ type: 'VARCHAR', nullable: false })
  @Auditable() // Auditar em todas as operações (create, update, delete)
  nome!: string;
  
  @Column({ type: 'TEXT', nullable: true })
  @Auditable({ onCreate: true, onUpdate: true, onDelete: false }) // Não auditar na deleção
  descricao?: string;
  
  @Column({ type: 'DECIMAL', nullable: false })
  @Auditable({ onCreate: false, onUpdate: true, onDelete: true }) // Não auditar na criação
  preco!: number;
  
  @Column({ type: 'INTEGER', nullable: false })
  estoque!: number; // Sem decorador @Auditable - não será auditada
}
```

### Opções do Decorador `@Auditable`

| Opção | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `onCreate` | boolean | `true` | Auditar quando o registro for criado |
| `onUpdate` | boolean | `true` | Auditar quando o registro for atualizado |
| `onDelete` | boolean | `true` | Auditar quando o registro for excluído |

## Habilitando Auditoria no Repositório

```typescript
import { BaseRepository, AuditUser } from 'framework-reactjs-api';
import { ProdutoModel } from './ProdutoModel';

export class ProdutoRepository extends BaseRepository<ProdutoModel> {
  constructor(currentUser?: AuditUser) {
    // Parâmetros: Modelo, habilitar auditoria, usuário atual
    super(ProdutoModel, true, currentUser);
  }
}
```

## Definindo o Usuário Atual

```typescript
// Ao criar o repositório
const userLogado = { id: 1, email: 'usuario@example.com' };
const produtoRepo = new ProdutoRepository(userLogado);

// Ou posteriormente
produtoRepo.setAuditUser({ id: 2, email: 'outro@example.com' });
```

## Consultando o Histórico de Alterações

```typescript
import { AuditService } from 'framework-reactjs-api';

// Criar serviço de auditoria
const auditService = new AuditService();

// Obter histórico completo de um registro
const historico = await auditService.getRecordHistory('produtos', 123);

// Obter histórico de uma coluna específica
const historicoPreco = await auditService.getColumnHistory('produtos', 123, 'preco');

// Exemplo de saída:
// [
//   {
//     id: 1,
//     tableName: 'produtos',
//     recordId: 123,
//     columnName: 'preco',
//     actionType: 'UPDATE',
//     oldValue: '29.90',
//     newValue: '34.90',
//     userId: 1,
//     userEmail: 'usuario@example.com',
//     createdAt: '2025-10-21T14:30:15.123Z'
//   },
//   ...
// ]
```

## Comportamento Padrão

- Apenas colunas marcadas com `@Auditable` serão auditadas
- Alterações em colunas não marcadas não geram registros de auditoria
- O sistema audita automaticamente nas operações CRUD do BaseRepository
- A auditoria funciona tanto para exclusão física quanto para soft delete# Atualização de Arquivos de Domínio (Dom)

## Sobre o Recurso

Quando novas colunas são adicionadas a um modelo, o arquivo de domínio (Dom) correspondente no use case não é mais atualizado automaticamente. Isto foi implementado para evitar a perda de personalizações e métodos adicionados manualmente aos arquivos Dom.

## Como Atualizar o Dom

Quando você adicionar novas colunas ao seu modelo e quiser que o arquivo Dom seja atualizado para refletir essas mudanças, utilize o comando específico para esta finalidade:

```bash
# Usando npm
npm run scaffold:update-dom NomeDoModelo

# Ou usando npx
npx framework-reactjs-api-scaffold update-dom NomeDoModelo
```

Por exemplo, se você adicionou novas colunas ao modelo `UserModel` e deseja atualizar o arquivo `UserDom.ts`:

```bash
npm run scaffold:update-dom User
```

## Comportamento

- O comando criará um backup do arquivo Dom atual antes de substituí-lo
- O arquivo de backup será nomeado como `[NomeDoModelo]Dom.ts.bak`
- O novo arquivo Dom será gerado com base nas propriedades atuais do modelo
- Qualquer customização feita manualmente no arquivo Dom original será perdida

## Boas Práticas

1. **Crie um backup manual** se você tiver customizações importantes no arquivo Dom.
2. **Realize um commit antes** de executar o comando de atualização.
3. **Compare os arquivos** após a atualização para recuperar customizações importantes.

---

**Observação:** Esta funcionalidade foi implementada para permitir maior controle sobre os arquivos de domínio, evitando sobrescritas acidentais durante o desenvolvimento.