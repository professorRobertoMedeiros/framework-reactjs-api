# 📊 Sistema de Logs do Framework

Sistema completo de logging para operações de banco de dados e requisições HTTP com suporte a usuários autenticados.

## 🚀 Configuração Rápida

### 1. Variáveis de Ambiente (.env)

```env
# Habilitar logs
LOG_ENABLED=true

# Nível de log (debug|info|warn|error)
LOG_LEVEL=info

# Logs SQL (SELECT, INSERT, UPDATE, DELETE)
LOG_SQL=true

# Logs HTTP (requisições e respostas)
LOG_HTTP=true

# Diretório dos arquivos de log
LOG_FILE_PATH=./logs
```

### 2. Setup do Framework

```typescript
import express from 'express';
import { setupFramework } from 'framework-reactjs-api';

const app = express();
app.use(express.json());

// Logging HTTP é configurado automaticamente
setupFramework(app, {
  enableHTTPLogging: true  // Habilita se LOG_HTTP=true
});

app.listen(3000);
```

## 📁 Estrutura dos Logs

Os logs são salvos em arquivos JSON separados por tipo e data:

```
logs/
├── sql-2025-01-17.log
├── http-2025-01-17.log
├── app-2025-01-17.log
└── error-2025-01-17.log
```

## 📊 Formato dos Logs

Todos os logs são salvos em formato JSON com estrutura consistente:

### Log SQL

```json
{
  "timestamp": "2025-01-17T10:30:45.123Z",
  "level": "debug",
  "type": "sql",
  "message": "SQL SELECT executed",
  "user": {
    "id": 1,
    "email": "usuario@example.com"
  },
  "sql": {
    "query": "SELECT * FROM produtos WHERE ativo = $1",
    "params": [true],
    "duration": 15,
    "operation": "SELECT"
  }
}
```

### Log HTTP

```json
{
  "timestamp": "2025-01-17T10:30:45.123Z",
  "level": "info",
  "type": "http",
  "message": "GET /api/produtos 200 - 45ms",
  "user": {
    "id": 1,
    "email": "usuario@example.com"
  },
  "request": {
    "method": "GET",
    "url": "/api/produtos",
    "ip": "192.168.1.100",
    "userAgent": "Mozilla/5.0..."
  },
  "data": {
    "statusCode": 200,
    "duration": 45
  }
}
```

### Log de Erro

```json
{
  "timestamp": "2025-01-17T10:30:45.123Z",
  "level": "error",
  "type": "error",
  "message": "Erro ao buscar produtos",
  "user": {
    "id": 1,
    "email": "usuario@example.com"
  },
  "error": {
    "message": "relation \"produtos\" does not exist",
    "stack": "Error: relation \"produtos\" does not exist\n    at ..."
  }
}
```

## 🔐 Logs com Usuário Autenticado

### Rotas Protegidas (Com JWT)

Quando uma rota está protegida com `authMiddleware.authenticate()`, o usuário é automaticamente incluído nos logs:

```typescript
import { Router } from 'express';
import { AuthMiddleware } from 'framework-reactjs-api';

const router = Router();
const authMiddleware = new AuthMiddleware();

// Rota protegida - usuário será logado
router.get('/produtos', 
  authMiddleware.authenticate(),
  async (req, res) => {
    // req.user está disponível
    // Logs SQL e HTTP incluirão: user: { id: 1, email: "..." }
    const produtos = await produtoRepo.findAll();
    res.json(produtos);
  }
);
```

**Log gerado:**
```json
{
  "timestamp": "2025-01-17T10:30:45.123Z",
  "level": "info",
  "type": "http",
  "message": "GET /api/produtos 200 - 45ms",
  "user": {
    "id": 1,
    "email": "usuario@example.com"
  }
}
```

### Rotas Públicas (Sem JWT)

Em rotas públicas, se o usuário estiver autenticado, ele será logado. Se não, o campo `user` não aparece:

```typescript
// Rota pública - usuário logado apenas se tiver token válido
router.get('/produtos/publicos', async (req, res) => {
  // Se usuário enviou token válido, será logado
  // Se não, log não terá campo "user"
  const produtos = await produtoRepo.findBy({ publico: true });
  res.json(produtos);
});
```

**Log SEM usuário:**
```json
{
  "timestamp": "2025-01-17T10:30:45.123Z",
  "level": "info",
  "type": "http",
  "message": "GET /api/produtos/publicos 200 - 30ms",
  "request": {
    "method": "GET",
    "url": "/api/produtos/publicos",
    "ip": "192.168.1.100"
  }
}
```

## 🛠️ Uso Programático

### Logger Direto

```typescript
import { logger } from 'framework-reactjs-api';

// Log de informação
logger.info('Produto criado com sucesso', { produtoId: 123 });

// Log de debug
logger.debug('Processando pedido', { pedidoId: 456 });

// Log de aviso
logger.warn('Estoque baixo', { produtoId: 789, estoque: 5 });

// Log de erro
logger.error('Falha ao processar pagamento', error);
```

### Logger com Usuário

```typescript
import { logger } from 'framework-reactjs-api';

// Middleware customizado
router.post('/produtos', async (req, res) => {
  const user = req.user ? {
    id: req.user.userId,
    email: req.user.email
  } : null;

  try {
    const produto = await produtoRepo.create(req.body);
    logger.info('Produto criado', { produtoId: produto.id }, user);
    res.json(produto);
  } catch (error) {
    logger.error('Erro ao criar produto', error, user);
    res.status(500).json({ error: 'Erro interno' });
  }
});
```

### Logger no ORM

O CustomORM já loga automaticamente todas as queries SQL:

```typescript
import { CustomORM } from 'framework-reactjs-api';

const orm = CustomORM.getInstance();

// Definir usuário atual (para logs)
orm.setCurrentUser({ id: 1, email: 'user@example.com' });

// Todas as queries serão logadas com o usuário
await orm.query('SELECT * FROM produtos');
// Log gerado: { ..., user: { id: 1, email: "user@example.com" }, sql: {...} }

// Limpar usuário
orm.setCurrentUser(null);
```

## 📈 Níveis de Log

### DEBUG
- Logs muito detalhados
- Todas as queries SQL
- Dados de debug

### INFO (Padrão)
- Requisições HTTP
- Operações importantes
- Logs informativos

### WARN
- Avisos
- Situações não ideais
- Possíveis problemas

### ERROR
- Erros
- Exceções
- Falhas críticas

## 📊 Analisar Logs

### Com jq (JSON query)

```bash
# Filtrar logs de um usuário específico
cat logs/http-2025-01-17.log | jq 'select(.user.id == 1)'

# Filtrar logs de erro
cat logs/error-2025-01-17.log | jq 'select(.level == "error")'

# Logs SQL de SELECT
cat logs/sql-2025-01-17.log | jq 'select(.sql.operation == "SELECT")'

# Requisições com status 500
cat logs/http-2025-01-17.log | jq 'select(.data.statusCode >= 500)'

# Queries lentas (> 100ms)
cat logs/sql-2025-01-17.log | jq 'select(.sql.duration > 100)'
```

### Com grep

```bash
# Logs de um usuário
grep '"email":"usuario@example.com"' logs/http-2025-01-17.log

# Logs de erro
grep '"level":"error"' logs/error-2025-01-17.log

# Operações UPDATE
grep '"operation":"UPDATE"' logs/sql-2025-01-17.log
```

## 🔒 Segurança

### Não Logar Senhas

O sistema automaticamente **não loga senhas** em queries SQL. Parâmetros como `password`, `password_hash`, `token` são mascarados:

```typescript
// Query original
await orm.query(
  'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
  ['user@example.com', '$2b$10$...']
);

// Log gerado (senha mascarada)
{
  "sql": {
    "query": "INSERT INTO users (email, password_hash) VALUES ($1, $2)",
    "params": ["user@example.com", "***MASKED***"]
  }
}
```

### Logs em Produção

**Recomendação:**
- `LOG_ENABLED=true`
- `LOG_LEVEL=warn` ou `LOG_LEVEL=error`
- `LOG_SQL=false` (ou apenas errors)
- `LOG_HTTP=true`

```env
# Produção
LOG_ENABLED=true
LOG_LEVEL=warn
LOG_SQL=false
LOG_HTTP=true
```

## 📦 Rotação de Logs

Os logs são automaticamente separados por dia. Para rotação:

```bash
# Script de limpeza (cron diário)
#!/bin/bash
find ./logs -name "*.log" -mtime +30 -delete

# Manter logs dos últimos 30 dias
```

## 🎯 Exemplos Práticos

### Monitorar Performance

```bash
# Queries mais lentas
cat logs/sql-$(date +%Y-%m-%d).log | jq -r '[.timestamp, .sql.duration, .sql.query] | @tsv' | sort -k2 -rn | head -10
```

### Auditoria de Usuários

```bash
# Todas as ações de um usuário
cat logs/*.log | jq 'select(.user.id == 1)' | jq -r '[.timestamp, .type, .message] | @tsv'
```

### Erros Recentes

```bash
# Últimos 10 erros
tail -n 10 logs/error-$(date +%Y-%m-%d).log | jq
```

### Requisições por Endpoint

```bash
# Top 10 endpoints mais acessados
cat logs/http-$(date +%Y-%m-%d).log | jq -r '.request.url' | sort | uniq -c | sort -rn | head -10
```

## 🔧 Configuração Avançada

### Desabilitar Logs SQL em Queries Específicas

```typescript
// Temporariamente desabilitar logs
process.env.LOG_SQL = 'false';
await orm.query('SELECT * FROM huge_table');
process.env.LOG_SQL = 'true';
```

### Logger Customizado

```typescript
import { Logger, LogLevel, LogType } from 'framework-reactjs-api';

const customLogger = Logger.getInstance();

customLogger.debug('Mensagem customizada', {
  customField: 'valor',
  anotherField: 123
});
```

## ✅ Checklist de Implementação

- [x] Logger com formato JSON
- [x] Logs SQL (SELECT, INSERT, UPDATE, DELETE)
- [x] Logs HTTP (requisições e respostas)
- [x] Usuário autenticado em logs (quando disponível)
- [x] Rotas públicas sem usuário (quando não autenticado)
- [x] Níveis de log configuráveis
- [x] Arquivos separados por tipo e data
- [x] Console colorido para desenvolvimento
- [x] Integração automática com ORM
- [x] Integração automática com middleware HTTP
- [x] Configuração via .env

---

**Versão:** 1.0.0  
**Última atualização:** Janeiro 2025
