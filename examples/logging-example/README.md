# Exemplo de Logging com UUID

Este exemplo demonstra como o sistema de logging com UUID único funciona na prática.

## Estrutura

```
logging-example/
├── src/
│   ├── index.ts              # Configuração da aplicação
│   ├── routes/
│   │   └── products.ts       # Rotas de exemplo
│   ├── business/
│   │   └── ProductBusiness.ts # Lógica de negócio
│   └── repository/
│       └── ProductRepository.ts # Acesso a dados
├── migrations/
│   └── 001_create_products_table.sql # Schema do banco
├── .env.example              # Configurações de exemplo
├── package.json
├── tsconfig.json             # TypeScript com path aliases
├── test-logging.sh           # Script de teste automatizado
└── README.md
```

## Como funciona

1. **Cliente faz requisição** → UUID é gerado pelo `TracingMiddleware`
2. **Rota processa** → Logs incluem UUID automaticamente
3. **Business executa** → Logs incluem UUID via `LoggingService`
4. **Repository acessa DB** → Queries SQL incluem UUID via `CustomORM`
5. **Resposta enviada** → Log final com UUID pelo `HTTPLoggerMiddleware`

## Pré-requisitos

- Node.js 18+
- PostgreSQL
- `jq` (opcional, para testes)

## Setup

### 1. Criar banco de dados

```bash
# Criar banco
createdb logging_example

# Ou via psql
psql -U postgres -c "CREATE DATABASE logging_example;"
```

### 2. Configurar ambiente

```bash
# Copiar .env de exemplo
cp .env.example .env

# Editar .env se necessário (ajustar credenciais do banco)
nano .env
```

### 3. Executar migração

```bash
# Aplicar schema
psql -d logging_example -f migrations/001_create_products_table.sql

# Ou se estiver usando o framework completo:
# npm run migration:run
```

### 4. Instalar dependências

```bash
npm install
```

## Executar

```bash
npm run dev
```

Você verá:

```
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🚀 Logging Example Server                                   ║
║                                                                ║
║   Server running on: http://localhost:3000                     ║
║   Environment: development                                     ║
║                                                                ║
║   Logging Configuration:                                       ║
║   - LOG_ENABLED: true                                          ║
║   - LOG_LEVEL: debug                                           ║
║   - LOG_SQL: true                                              ║
║   - LOG_HTTP: true                                             ║
║                                                                ║
║   Try these endpoints:                                         ║
║   - GET  /health                                               ║
║   - GET  /api/products                                         ║
║   - POST /api/products                                         ║
║   - GET  /api/products/:id                                     ║
║                                                                ║
║   Cada requisição terá um UUID único que aparecerá em         ║
║   TODOS os logs, incluindo logs SQL!                          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

## Testar Manualmente

### Health Check
```bash
curl http://localhost:3000/health
```

### Criar produto
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Notebook Dell",
    "price": 2500,
    "description": "Notebook Dell Inspiron 15"
  }'
```

### Listar produtos
```bash
curl http://localhost:3000/api/products
```

### Buscar produto
```bash
curl http://localhost:3000/api/products/1
```

### Atualizar produto
```bash
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 2299.99
  }'
```

### Deletar produto
```bash
curl -X DELETE http://localhost:3000/api/products/1
```

## Testar Automaticamente

Execute o script de teste:

```bash
chmod +x test-logging.sh
./test-logging.sh
```

Este script:
- ✅ Testa todos os endpoints
- ✅ Mostra o `requestId` de cada operação
- ✅ Sugere comandos para filtrar logs
- ✅ Demonstra rastreamento completo

## Verificar Logs

### Console (em tempo real)

Os logs aparecem no terminal onde você executou `npm run dev`:

```
[2025-10-20 14:30:15] [INFO] [HTTP] [RequestID: 550e8400-e29b-41d4-a716-446655440000] Received POST request for /api/products
[2025-10-20 14:30:15] [INFO] [APP] [RequestID: 550e8400-e29b-41d4-a716-446655440000] Business: Starting product creation
Data: { productName: "Notebook Dell", price: 2500 }
[2025-10-20 14:30:15] [DEBUG] [SQL] [RequestID: 550e8400-e29b-41d4-a716-446655440000] SQL INSERT executed
SQL: {
  query: "INSERT INTO products (name, price, description) VALUES ($1, $2, $3) RETURNING *",
  params: ["Notebook Dell", 2500, "Notebook Dell Inspiron 15"],
  duration: 5,
  operation: "INSERT"
}
[2025-10-20 14:30:15] [INFO] [APP] [RequestID: 550e8400-e29b-41d4-a716-446655440000] Business: Product created successfully
Data: { productId: 1, productName: "Notebook Dell", price: 2500 }
[2025-10-20 14:30:15] [INFO] [HTTP] [RequestID: 550e8400-e29b-41d4-a716-446655440000] POST /api/products 201 - 45ms
```

### Arquivos de Log

Os logs são salvos em `../../logs/` (pasta `logs` na raiz do framework):

```bash
# Logs HTTP
cat ../../logs/http-$(date +%Y-%m-%d).log | tail -20

# Logs SQL
cat ../../logs/sql-$(date +%Y-%m-%d).log | tail -20

# Logs de aplicação
cat ../../logs/app-$(date +%Y-%m-%d).log | tail -20
```

### Filtrar por RequestID

```bash
# Ver todos os logs de uma requisição específica
REQUEST_ID="550e8400-e29b-41d4-a716-446655440000"

# No console
grep "$REQUEST_ID" ../../logs/*.log

# Em arquivos JSON
cat ../../logs/http-*.log | jq "select(.requestId == \"$REQUEST_ID\")"
cat ../../logs/sql-*.log | jq "select(.requestId == \"$REQUEST_ID\")"
```

### Análise de Performance

```bash
# Requisições mais lentas
cat ../../logs/http-*.log | jq 'select(.data.duration > 100) | {requestId, method: .request.method, url: .request.url, duration: .data.duration}' | jq -s 'sort_by(.duration) | reverse'

# Queries SQL mais lentas
cat ../../logs/sql-*.log | jq 'select(.sql.duration > 50) | {requestId, query: .sql.query, duration: .sql.duration}' | jq -s 'sort_by(.duration) | reverse'

# Todas as queries de uma requisição específica
cat ../../logs/sql-*.log | jq "select(.requestId == \"$REQUEST_ID\") | {query: .sql.query, params: .sql.params, duration: .sql.duration}"
```

## Arquitetura do Exemplo

```
HTTP Request
     ↓
TracingMiddleware (gera UUID: 550e8400...)
     ↓
HTTPLoggerMiddleware
     ↓
Route Handler (products.ts)
  → LoggingService.info("Creating product...")  [RequestID: 550e8400...]
     ↓
ProductBusiness
  → LoggingService.info("Business: ...")        [RequestID: 550e8400...]
  → Validações
     ↓
ProductRepository
  → LoggingService.debug("Repository: ...")     [RequestID: 550e8400...]
     ↓
CustomORM
  → logger.logSQL(...)                          [RequestID: 550e8400...]
  → Query: INSERT INTO products...
     ↓
Response
  → HTTPLoggerMiddleware                        [RequestID: 550e8400...]
```

**Resultado:** Todos os logs possuem o **mesmo RequestID**!

## Características Demonstradas

✅ **UUID único por requisição**
- Gerado automaticamente pelo `TracingMiddleware`
- Propagado via `AsyncLocalStorage` (sem passar parâmetros)
- Incluído automaticamente em todos os logs

✅ **Logs em todas as camadas**
- Route: Entrada e validação
- Business: Lógica de negócio
- Repository: Acesso a dados
- ORM: Queries SQL

✅ **Rastreamento completo**
- Fácil correlacionar logs de diferentes camadas
- Debug rápido em produção
- Análise de performance por requisição

✅ **Formato estruturado**
- Console: Legível para desenvolvimento
- Arquivo JSON: Parseável para ferramentas

✅ **Zero configuração manual**
- UUID gerado automaticamente
- Não precisa passar `requestId` entre funções
- Funciona em toda a aplicação

## Configuração do TypeScript

Este exemplo usa **path aliases** para importar o framework:

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@framework/*": ["../../src/*"]
    }
  },
  "include": ["src/**/*", "../../src/**/*"]
}
```

Permite imports limpos:

```typescript
import { LoggingService } from '@framework/core/tracing/LoggingService';
import { CustomORM } from '@framework/infra/db/CustomORM';
```

## Dicas

### 1. RequestID aparece como "no-trace-id"

**Causa:** Código executando fora do contexto HTTP.

**Solução:** Use `TracingService.runWithTrace()` para jobs/cron:

```typescript
TracingService.runWithTrace(() => {
  LoggingService.info('Job executado');
}, { jobName: 'cleanup' });
```

### 2. Propagar requestId para APIs externas

```typescript
const requestId = TracingService.getRequestId();

await axios.post(externalApi, data, {
  headers: {
    'X-Request-ID': requestId
  }
});
```

### 3. Desabilitar logs SQL em produção

```env
LOG_SQL=false
LOG_LEVEL=info  # Ao invés de debug
```

## Próximos Passos

1. ✅ Rodar o exemplo
2. ✅ Fazer requisições
3. ✅ Ver logs no console e arquivos
4. ✅ Filtrar por requestId
5. ✅ Adaptar para seu projeto

## Documentação Completa

Veja a documentação completa em:
- `../../docs/LOGGING-WITH-UUID.md`

## Saída esperada

```
[2025-10-20 14:30:15] [INFO] [HTTP] [RequestID: abc-123-def] Received POST request for /api/products
[2025-10-20 14:30:15] [INFO] [APP] [RequestID: abc-123-def] Creating product: Notebook
[2025-10-20 14:30:15] [DEBUG] [SQL] [RequestID: abc-123-def] SQL INSERT executed
[2025-10-20 14:30:15] [INFO] [APP] [RequestID: abc-123-def] Product created with ID: 1
[2025-10-20 14:30:15] [INFO] [HTTP] [RequestID: abc-123-def] POST /api/products 201 - 45ms
```

Observe que **todos os logs têm o mesmo RequestID**, permitindo rastrear toda a operação!
