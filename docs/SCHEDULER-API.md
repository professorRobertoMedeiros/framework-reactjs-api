# 🔌 API do Scheduler - Rotas de Gerenciamento

## 📋 Visão Geral

Rotas RESTful para gerenciar jobs agendados sem necessidade de reiniciar a aplicação.

### ✨ Características

- ✅ **Inicialização automática** dos jobs quando o projeto inicia
- ✅ **Recarregamento dinâmico** de jobs do banco de dados
- ✅ **CRUD completo** de jobs via API
- ✅ **Execução manual** de jobs
- ✅ **Habilitar/Desabilitar** jobs em tempo real
- ✅ **Monitoramento** de status e estatísticas
- ✅ **Proteção contra execução duplicada**
- ✅ **Autenticação JWT** em todas as rotas
- ✅ **Configuração via variáveis de ambiente**

## 🚀 Setup

### 1. Configurar Variáveis de Ambiente

```bash
# .env

# Habilitar sistema de scheduler
SCHEDULER_ENABLED=true

# Iniciar scheduler automaticamente quando o projeto iniciar
# Se false, o scheduler precisa ser iniciado manualmente via API
SCHEDULER_AUTO_START=true

# Número máximo de jobs executando simultaneamente
SCHEDULER_MAX_CONCURRENT=5

# Intervalo de verificação de jobs prontos (em milissegundos)
SCHEDULER_CHECK_INTERVAL=60000

# Tempo limite para considerar um job travado (em minutos)
SCHEDULER_STUCK_THRESHOLD=30
```

### 2. Habilitar no Framework

```typescript
// src/app.ts
import express from 'express';
import dotenv from 'dotenv';
import { setupFramework } from 'framework-reactjs-api';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
app.use(express.json());

// Habilitar scheduler e suas rotas
// As configurações virão do .env automaticamente
setupFramework(app, {
  enableScheduler: true,  // Habilita scheduler (ou use SCHEDULER_ENABLED=true)
});

app.listen(3000, () => {
  console.log('🚀 Servidor rodando na porta 3000');
  console.log('📅 Scheduler ativo com rotas em /api/scheduler');
});
```

**Output esperado (com SCHEDULER_AUTO_START=true):**
```
✅ Scheduler habilitado e rotas configuradas em: /api/scheduler
🚀 Scheduler iniciado automaticamente
📅 10 jobs carregados e agendados
```

**Output esperado (com SCHEDULER_AUTO_START=false):**
```
✅ Scheduler habilitado e rotas configuradas em: /api/scheduler
⏸️  Scheduler criado mas não iniciado (autoStart=false)
   Para iniciar: POST /api/scheduler/start
```

### 3. Shutdown Graceful

```typescript
import { shutdownScheduler } from 'framework-reactjs-api';

process.on('SIGINT', async () => {
  console.log('Parando scheduler...');
  await shutdownScheduler();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Parando scheduler...');
  await shutdownScheduler();
  process.exit(0);
});
  process.exit(0);
});
```

## 📡 Endpoints

Todas as rotas requerem autenticação JWT (header `Authorization: Bearer <token>`).

### 1. Status do Scheduler

**GET** `/api/scheduler/status`

Retorna o status atual do scheduler.

**Response:**
```json
{
  "success": true,
  "data": {
    "running": true,
    "runningJobs": [1, 3],
    "scheduledJobs": 10,
    "maxConcurrent": 5
  }
}
```

**cURL:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/scheduler/status
```

---

### 2. Recarregar Todos os Jobs

**POST** `/api/scheduler/reload`

Recarrega todos os jobs do banco de dados sem reiniciar a aplicação.

**Response:**
```json
{
  "success": true,
  "message": "Jobs recarregados com sucesso"
}
```

**cURL:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/scheduler/reload
```

**Casos de uso:**
- Após cadastrar novos jobs via SQL
- Após atualizar schedules diretamente no banco
- Sincronizar scheduler com banco de dados

---

### 3. Recarregar Job Específico

**POST** `/api/scheduler/reload/:id`

Recarrega um job específico do banco de dados.

**Parameters:**
- `id` (path): ID do job

**Response:**
```json
{
  "success": true,
  "message": "Job 5 recarregado com sucesso"
}
```

**cURL:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/scheduler/reload/5
```

---

### 4. Iniciar Scheduler

**POST** `/api/scheduler/start`

Inicia o scheduler (se estiver parado).

**Response:**
```json
{
  "success": true,
  "message": "Scheduler iniciado com sucesso"
}
```

---

### 5. Parar Scheduler

**POST** `/api/scheduler/stop`

Para o scheduler.

**Response:**
```json
{
  "success": true,
  "message": "Scheduler parado com sucesso"
}
```

---

### 6. Listar Jobs

**GET** `/api/scheduler/jobs`

Lista todos os jobs.

**Query Parameters:**
- `enabled` (opcional): `true` ou `false` - Filtrar por habilitados
- `status` (opcional): `success`, `error`, `timeout`, `running` - Filtrar por status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "cleanup-users",
      "description": "Limpar usuários inativos",
      "service_name": "UserService",
      "service_method": "cleanInactiveUsers",
      "schedule": "0 2 * * *",
      "enabled": true,
      "last_run_at": "2025-10-20T02:00:00.000Z",
      "last_run_status": "success",
      "run_count": 150,
      "success_count": 148,
      "error_count": 2
    }
  ],
  "total": 1
}
```

**cURL:**
```bash
# Listar todos
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/scheduler/jobs

# Listar apenas habilitados
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/scheduler/jobs?enabled=true"

# Listar com erro
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/scheduler/jobs?status=error"
```

---

### 7. Buscar Job por ID

**GET** `/api/scheduler/jobs/:id`

Busca um job específico com informações detalhadas.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "cleanup-users",
    "service_name": "UserService",
    "service_method": "cleanInactiveUsers",
    "params": { "days": 90 },
    "schedule": "0 2 * * *",
    "enabled": true,
    "scheduleDescription": "Todo dia às 2h da manhã",
    "successRate": 98.67,
    "isReady": false,
    "isRunning": false,
    "last_run_at": "2025-10-20T02:00:00.000Z",
    "next_run_at": "2025-10-21T02:00:00.000Z"
  }
}
```

---

### 8. Criar Job

**POST** `/api/scheduler/jobs`

Cria um novo job e o carrega automaticamente no scheduler (se enabled=true).

**Request Body:**
```json
{
  "name": "send-reports",
  "description": "Enviar relatórios diários",
  "service_name": "ReportService",
  "service_method": "sendDailyReport",
  "service_path": "use-cases/report/ReportService",
  "schedule": "0 8 * * *",
  "params": {
    "recipients": ["admin@example.com"]
  },
  "enabled": true,
  "max_retries": 3,
  "retry_delay": 60,
  "timeout": 300
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "name": "send-reports",
    "enabled": true,
    "created_at": "2025-10-20T10:30:00.000Z"
  },
  "message": "Job criado com sucesso"
}
```

**cURL:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "send-reports",
    "service_name": "ReportService",
    "service_method": "sendDailyReport",
    "service_path": "use-cases/report/ReportService",
    "schedule": "0 8 * * *",
    "params": {"recipients": ["admin@example.com"]},
    "enabled": true
  }' \
  http://localhost:3000/api/scheduler/jobs
```

---

### 9. Atualizar Job

**PUT** `/api/scheduler/jobs/:id`

Atualiza um job e recarrega automaticamente no scheduler.

**Request Body:**
```json
{
  "schedule": "0 9 * * *",
  "params": {
    "recipients": ["admin@example.com", "manager@example.com"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "schedule": "0 9 * * *",
    "updated_at": "2025-10-20T10:35:00.000Z"
  },
  "message": "Job atualizado com sucesso"
}
```

**cURL:**
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"schedule": "0 9 * * *"}' \
  http://localhost:3000/api/scheduler/jobs/5
```

---

### 10. Deletar Job

**DELETE** `/api/scheduler/jobs/:id`

Deleta um job e o remove do scheduler.

**Response:**
```json
{
  "success": true,
  "message": "Job deletado com sucesso"
}
```

**cURL:**
```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/scheduler/jobs/5
```

---

### 11. Executar Job Manualmente

**POST** `/api/scheduler/jobs/:id/run`

Executa um job imediatamente (fora do schedule).

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "duration": 1523,
    "result": {
      "deleted": 10,
      "processed": 100
    }
  }
}
```

**cURL:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/scheduler/jobs/1/run
```

---

### 12. Habilitar Job

**POST** `/api/scheduler/jobs/:id/enable`

Habilita um job desabilitado e o carrega no scheduler.

**Response:**
```json
{
  "success": true,
  "message": "Job habilitado com sucesso"
}
```

**cURL:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/scheduler/jobs/1/enable
```

---

### 13. Desabilitar Job

**POST** `/api/scheduler/jobs/:id/disable`

Desabilita um job e o remove do scheduler.

**Response:**
```json
{
  "success": true,
  "message": "Job desabilitado com sucesso"
}
```

**cURL:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/scheduler/jobs/1/disable
```

---

### 14. Resetar Estatísticas

**POST** `/api/scheduler/jobs/:id/reset-stats`

Reseta os contadores de execução de um job.

**Response:**
```json
{
  "success": true,
  "message": "Estatísticas resetadas com sucesso"
}
```

---

### 15. Listar Jobs Travados

**GET** `/api/scheduler/jobs/stuck`

Lista jobs que estão travados (rodando há muito tempo).

**Query Parameters:**
- `minutes` (opcional): Minutos para considerar travado (padrão: 30)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "name": "long-process",
      "last_run_at": "2025-10-20T08:00:00.000Z",
      "last_run_duration": 180000
    }
  ],
  "total": 1
}
```

**cURL:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/scheduler/jobs/stuck?minutes=60"
```

## 🔒 Proteção Contra Execução Duplicada

O sistema possui **3 camadas** de proteção:

### 1. Verificação em Memória
```typescript
if (this.runningJobs.has(jobId)) {
  logger.warn(`Job ${jobId} já está em execução, pulando...`);
  return;
}
```

### 2. Verificação no Banco de Dados
```typescript
if (job.isRunning()) {
  logger.warn(`Job está marcado como RUNNING no banco, pulando...`);
  return;
}
```

### 3. Verificação Final Antes de Executar
```typescript
if (this.runningJobs.has(job.id)) {
  logger.warn(`Job já está na lista de execução, abortando...`);
  return;
}
```

**Resultado:** Um job **NUNCA** será executado enquanto já estiver rodando.

## 📊 Fluxo de Recarregamento

```
1. Cadastrar/Atualizar Job no Banco
         ↓
2. POST /api/scheduler/reload (ou reload/:id)
         ↓
3. Scheduler para cron antigo
         ↓
4. Scheduler lê job do banco
         ↓
5. Scheduler cria novo cron
         ↓
6. Job pronto para executar
```

## 💡 Exemplos de Uso

### Dashboard de Monitoramento

```typescript
// Buscar status do scheduler
const statusResponse = await fetch('/api/scheduler/status', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const status = await statusResponse.json();

console.log(`Jobs rodando: ${status.data.runningJobs.length}`);
console.log(`Jobs agendados: ${status.data.scheduledJobs}`);

// Listar jobs com problemas
const errorJobsResponse = await fetch('/api/scheduler/jobs?status=error', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const errorJobs = await errorJobsResponse.json();

console.log(`Jobs com erro: ${errorJobs.total}`);
```

### Atualizar Schedule de um Job

```typescript
// 1. Atualizar no banco via API
await fetch('/api/scheduler/jobs/5', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    schedule: '*/30 * * * *'  // Mudar para a cada 30 minutos
  })
});

// Job é automaticamente recarregado!
// Não precisa reiniciar a aplicação
```

### Desabilitar Job Temporariamente

```typescript
// Desabilitar
await fetch('/api/scheduler/jobs/5/disable', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});

// Job para de executar imediatamente

// ... fazer manutenção ...

// Habilitar novamente
await fetch('/api/scheduler/jobs/5/enable', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## 🎯 Boas Práticas

### 1. Sempre Recarregar Após Mudanças

```typescript
// ✅ BOM
await jobRepo.update(jobId, { schedule: '0 8 * * *' });
await fetch('/api/scheduler/reload/' + jobId, { method: 'POST' });

// ❌ RUIM (mudança não será aplicada)
await jobRepo.update(jobId, { schedule: '0 8 * * *' });
// Esqueceu de recarregar
```

### 2. Monitorar Jobs com Erro

```typescript
setInterval(async () => {
  const response = await fetch('/api/scheduler/jobs?status=error');
  const { data } = await response.json();
  
  if (data.length > 0) {
    // Alertar equipe
    console.error(`${data.length} jobs com erro!`);
  }
}, 300000); // A cada 5 minutos
```

### 3. Shutdown Graceful

```typescript
// Sempre parar o scheduler antes de encerrar
process.on('SIGINT', async () => {
  await shutdownScheduler();
  process.exit(0);
});
```

## ✅ Checklist

- [x] Rotas criadas e protegidas com JWT
- [x] Recarregamento dinâmico implementado
- [x] Proteção contra execução duplicada (3 camadas)
- [x] CRUD completo via API
- [x] Integração com setupFramework()
- [x] Shutdown graceful
- [x] Logs de todas as operações
- [x] Documentação completa

---

**Versão:** 1.0.1  
**Data:** Outubro 2025  
**Status:** ✅ Implementado e funcional
