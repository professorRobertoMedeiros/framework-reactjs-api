# Sistema de Logging com UUID por Requisição

## Visão Geral

O framework implementa um sistema completo de logging que rastreia todas as operações através de um **UUID único por requisição**. Esse UUID é propagado automaticamente para todos os logs, incluindo:

- Logs de aplicação (info, debug, warn, error)
- Logs HTTP (requisições e respostas)
- Logs SQL (todas as queries executadas)
- Logs de erro e exceções

## Arquitetura

```
┌─────────────────┐
│  HTTP Request   │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ TracingMiddleware   │ ◄── Gera UUID único
│ (addRequestId)      │     e cria contexto
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ AsyncLocalStorage   │ ◄── Armazena UUID
│ (TracingService)    │     no contexto
└────────┬────────────┘
         │
         ├──────────────────────────┐
         │                          │
         ▼                          ▼
┌─────────────────┐      ┌──────────────────┐
│ Logger          │      │ CustomORM        │
│ (todos os logs) │      │ (logs SQL)       │
└─────────────────┘      └──────────────────┘
         │                          │
         └──────────┬───────────────┘
                    │
                    ▼
              ┌────────────┐
              │ Log Output │
              │ + UUID     │
              └────────────┘
```

## Componentes Principais

### 1. TracingService

Gerencia o contexto de rastreamento usando `AsyncLocalStorage`:

```typescript
import { TracingService } from './core/tracing/TracingService';

// Obtém o UUID da requisição atual
const requestId = TracingService.getRequestId();

// Define metadados no contexto
TracingService.setMetadata('userId', user.id);

// Obtém metadados
const userId = TracingService.getMetadata('userId');
```

### 2. TracingMiddleware

Middleware que cria o contexto de rastreamento para cada requisição:

```typescript
import { TracingMiddleware } from './core/tracing/TracingMiddleware';

app.use(TracingMiddleware.addRequestId());
```

**Características:**
- Gera UUID único usando `uuid v4`
- Aceita UUID externo via header `X-Request-ID`
- Adiciona o UUID na resposta via header `X-Request-ID`
- Registra tempo de início e fim da requisição
- Captura metadados como método, URL, user-agent

### 3. Logger

Sistema de logging que automaticamente inclui o UUID em todos os logs:

```typescript
import { logger } from './infra/logger/Logger';

// Todos os métodos incluem automaticamente o requestId
logger.info('Operação iniciada', { action: 'create_user' });
logger.debug('Debug information', debugData);
logger.warn('Aviso importante', warningData);
logger.error('Erro ocorreu', error);
logger.logSQL(query, params, duration);
logger.logHTTP(method, url, statusCode, duration, ip);
```

### 4. CustomORM

ORM que automaticamente loga todas as queries SQL com o UUID da requisição:

```typescript
// Todas as queries incluem requestId automaticamente
const result = await orm.query('SELECT * FROM users WHERE id = $1', [userId]);
```

## Configuração

### Variáveis de Ambiente

```env
# Habilitar/desabilitar logs
LOG_ENABLED=true

# Nível de log (debug, info, warn, error)
LOG_LEVEL=info

# Logs SQL
LOG_SQL=true

# Logs HTTP
LOG_HTTP=true

# Caminho para arquivos de log
LOG_FILE_PATH=./logs
```

### Setup da Aplicação

```typescript
import express from 'express';
import { TracingMiddleware } from './core/tracing/TracingMiddleware';
import { HTTPLoggerMiddleware } from './infra/logger/HTTPLoggerMiddleware';

const app = express();

// IMPORTANTE: TracingMiddleware DEVE ser o primeiro middleware
app.use(TracingMiddleware.addRequestId());

// HTTPLoggerMiddleware vem depois
app.use(HTTPLoggerMiddleware.log());

// Seus outros middlewares e rotas...
```

## Formato dos Logs

### Console Output

```
[2025-10-20 14:30:15.123] [INFO] [HTTP] [RequestID: 550e8400-e29b-41d4-a716-446655440000] GET /api/users
[2025-10-20 14:30:15.125] [DEBUG] [SQL] [RequestID: 550e8400-e29b-41d4-a716-446655440000] SQL SELECT executed
SQL: {
  query: 'SELECT * FROM users WHERE active = $1',
  params: [true],
  duration: 2,
  operation: 'SELECT'
}
[2025-10-20 14:30:15.130] [INFO] [APP] [RequestID: 550e8400-e29b-41d4-a716-446655440000] User list retrieved
[2025-10-20 14:30:15.135] [INFO] [HTTP] [RequestID: 550e8400-e29b-41d4-a716-446655440000] GET /api/users 200 - 12ms
```

### Arquivo JSON (logs/http-2025-10-20.log)

```json
{
  "timestamp": "2025-10-20T14:30:15.123Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "level": "info",
  "type": "http",
  "message": "GET /api/users 200 - 12ms",
  "user": {
    "id": 1,
    "email": "user@example.com"
  },
  "request": {
    "method": "GET",
    "url": "/api/users",
    "ip": "192.168.1.100",
    "userAgent": "Mozilla/5.0..."
  },
  "data": {
    "statusCode": 200,
    "duration": 12
  }
}
```

### Arquivo SQL (logs/sql-2025-10-20.log)

```json
{
  "timestamp": "2025-10-20T14:30:15.125Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "level": "debug",
  "type": "sql",
  "message": "SQL SELECT executed",
  "user": {
    "id": 1,
    "email": "user@example.com"
  },
  "sql": {
    "query": "SELECT * FROM users WHERE active = $1",
    "params": [true],
    "duration": 2,
    "operation": "SELECT"
  }
}
```

## Rastreamento de Requisições

### Filtrando Logs por RequestID

Você pode facilmente rastrear todas as operações de uma requisição específica:

```bash
# No console (em desenvolvimento)
grep "550e8400-e29b-41d4-a716-446655440000" logs/*.log

# Em arquivos JSON
cat logs/http-2025-10-20.log | jq 'select(.requestId == "550e8400-e29b-41d4-a716-446655440000")'
```

### Análise de Performance

```bash
# Encontrar requisições lentas
cat logs/http-*.log | jq 'select(.data.duration > 1000)'

# Queries SQL mais lentas de uma requisição específica
cat logs/sql-*.log | jq 'select(.requestId == "550e8400-e29b-41d4-a716-446655440000" and .sql.duration > 100)'
```

## Uso em Business Logic

### LoggingService

Para usar logs em sua lógica de negócio com rastreamento automático:

```typescript
import { LoggingService } from './core/tracing/LoggingService';

class UserBusiness {
  async createUser(data: CreateUserDTO) {
    LoggingService.info('Creating new user', { email: data.email });
    
    try {
      const user = await this.userRepository.create(data);
      LoggingService.info('User created successfully', { userId: user.id });
      return user;
    } catch (error) {
      LoggingService.error('Failed to create user', error, { email: data.email });
      throw error;
    }
  }
}
```

O `LoggingService` automaticamente inclui o `requestId` em todos os logs.

## Exemplo Completo de Fluxo

```typescript
// 1. Cliente faz requisição
POST /api/users
{
  "name": "João Silva",
  "email": "joao@example.com"
}

// 2. TracingMiddleware gera UUID
// requestId: 550e8400-e29b-41d4-a716-446655440000

// 3. Logs gerados automaticamente:

// Log HTTP de entrada
[INFO] [HTTP] [RequestID: 550e8400...] Received POST request for /api/users

// Log da Business Logic
[INFO] [APP] [RequestID: 550e8400...] Creating new user
Data: { email: "joao@example.com" }

// Log SQL - INSERT
[DEBUG] [SQL] [RequestID: 550e8400...] SQL INSERT executed
SQL: {
  query: "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
  params: ["João Silva", "joao@example.com"],
  duration: 5,
  operation: "INSERT"
}

// Log SQL - SELECT (verificação)
[DEBUG] [SQL] [RequestID: 550e8400...] SQL SELECT executed
SQL: {
  query: "SELECT * FROM users WHERE id = $1",
  params: [123],
  duration: 2,
  operation: "SELECT"
}

// Log de sucesso
[INFO] [APP] [RequestID: 550e8400...] User created successfully
Data: { userId: 123 }

// Log HTTP de saída
[INFO] [HTTP] [RequestID: 550e8400...] POST /api/users 201 - 45ms
```

## Integração com Ferramentas de Monitoramento

### ELK Stack (Elasticsearch, Logstash, Kibana)

```json
// Logstash config
input {
  file {
    path => "/path/to/logs/*.log"
    codec => "json"
  }
}

filter {
  json {
    source => "message"
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "app-logs-%{+YYYY.MM.dd}"
  }
}
```

### Grafana Loki

```yaml
# promtail config
scrape_configs:
  - job_name: app-logs
    static_configs:
      - targets:
          - localhost
        labels:
          job: app-logs
          __path__: /path/to/logs/*.log
```

## Boas Práticas

1. **Sempre use TracingMiddleware primeiro**
   ```typescript
   app.use(TracingMiddleware.addRequestId()); // Primeiro!
   app.use(HTTPLoggerMiddleware.log());       // Depois
   ```

2. **Use LoggingService em vez de console.log**
   ```typescript
   // ❌ Evite
   console.log('User created');
   
   // ✅ Use
   LoggingService.info('User created', { userId: user.id });
   ```

3. **Inclua contexto relevante nos logs**
   ```typescript
   LoggingService.info('Processing payment', {
     userId: user.id,
     amount: payment.amount,
     method: payment.method
   });
   ```

4. **Use níveis de log apropriados**
   - `debug`: Informações detalhadas para desenvolvimento
   - `info`: Eventos importantes do sistema
   - `warn`: Situações anormais mas recuperáveis
   - `error`: Erros que precisam atenção

5. **Propague requestId em chamadas externas**
   ```typescript
   const requestId = TracingService.getRequestId();
   
   await axios.post(externalApi, data, {
     headers: {
       'X-Request-ID': requestId
     }
   });
   ```

## Troubleshooting

### RequestID aparece como "no-trace-id"

**Causa:** O código está sendo executado fora do contexto de uma requisição HTTP.

**Solução:** 
- Para jobs/cron: Use `TracingService.runWithTrace()`
- Para testes: Mock o TracingService
- Para scripts CLI: Gere um UUID manualmente

```typescript
// Em jobs/cron
TracingService.runWithTrace(() => {
  // Seu código aqui terá um requestId
  LoggingService.info('Job executado');
}, { jobName: 'cleanup-job' });
```

### Logs SQL não aparecem

**Causa:** `LOG_SQL=false` ou `LOG_LEVEL` muito alto

**Solução:**
```env
LOG_SQL=true
LOG_LEVEL=debug
```

### Performance impactada

**Causa:** Muitos logs em produção

**Solução:**
```env
LOG_LEVEL=warn  # Em produção
LOG_SQL=false   # Desabilitar SQL em produção se necessário
```

## Conclusão

O sistema de logging com UUID único por requisição permite:

- ✅ Rastreamento completo de cada requisição
- ✅ Correlação de logs distribuídos
- ✅ Debug facilitado em ambiente de produção
- ✅ Análise de performance por requisição
- ✅ Integração com ferramentas de monitoramento
- ✅ Auditoria e compliance

Todos os logs são automaticamente enriquecidos com o `requestId`, tornando o troubleshooting muito mais eficiente.
