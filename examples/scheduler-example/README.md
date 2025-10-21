# 📅 Exemplo: Sistema de Scheduler

Este exemplo demonstra como usar o sistema de agendamento de tarefas (jobs) do framework com **inicialização automática**.

## ✨ Características

- ✅ **Scheduler inicia automaticamente** quando o projeto roda
- ✅ Jobs carregados do banco de dados
- ✅ Execução baseada em cron expressions
- ✅ Rotas REST para gerenciar jobs
- ✅ Proteção contra execução duplicada
- ✅ Shutdown graceful

## 📁 Estrutura

```
scheduler-example/
├── src/
│   ├── index.ts                    # Servidor Express com scheduler
│   └── services/
│       └── CleanupService.ts       # Service com métodos agendáveis
├── seeds/
│   └── 001_insert_example_jobs.sql # Jobs de exemplo
├── .env.example                     # Variáveis de ambiente
└── package.json
```

## 🚀 Executar o Exemplo

### 1. Configurar Banco de Dados

```bash
# Criar banco de dados
createdb scheduler_example

# Aplicar migrations do framework
cd /path/to/framework
npm run migrate
```

### 2. Configurar Variáveis de Ambiente

```bash
cd examples/scheduler-example
cp .env.example .env

# Editar .env com suas credenciais do banco
```

**Variáveis importantes:**
```bash
# Habilitar scheduler
SCHEDULER_ENABLED=true

# Iniciar automaticamente quando o projeto rodar
SCHEDULER_AUTO_START=true

# Máximo de jobs simultâneos
SCHEDULER_MAX_CONCURRENT=3
```

### 3. Inserir Jobs de Exemplo

```bash
# Conectar ao banco e executar seed
psql -d scheduler_example -f seeds/001_insert_example_jobs.sql
```

### 4. Instalar Dependências e Rodar

```bash
npm install
npm run dev
```

**Output esperado:**
```
🚀 Servidor rodando na porta 3001
📅 Scheduler: HABILITADO
🔄 Auto-start: SIM
✅ Scheduler habilitado e rotas configuradas em: /api/scheduler
🚀 Scheduler iniciado automaticamente
📅 4 jobs carregados e agendados
```

## 📝 Jobs de Exemplo

### 1. Limpeza de Registros Antigos
- **Nome**: `cleanup-old-records`
- **Schedule**: `0 2 * * *` (Todo dia às 2h)
- **Service**: `CleanupService.cleanOldRecords()`
- **Params**: `{"days": 30}`

### 2. Envio de Relatório Diário
- **Nome**: `send-daily-report`
- **Schedule**: `0 8 * * *` (Todo dia às 8h)
- **Service**: `CleanupService.sendDailyReport()`
- **Params**: `{"recipients": ["admin@example.com"]}`

### 3. Backup de Dados
- **Nome**: `backup-data`
- **Schedule**: `0 0 * * *` (Todo dia à meia-noite)
- **Service**: `CleanupService.backupData()`
- **Params**: `{"tables": ["users", "products", "orders"]}`

### 4. Sincronização com Sistema Externo
- **Nome**: `sync-external-system`
- **Schedule**: `*/30 * * * *` (A cada 30 minutos)
- **Service**: `CleanupService.syncWithExternalSystem()`
- **Params**: `{"endpoint": "https://api.example.com/sync"}`

## 🔌 Endpoints Disponíveis

### Status do Scheduler
```bash
curl http://localhost:3001/api/scheduler/status
```

### Listar Jobs
```bash
curl http://localhost:3001/api/scheduler/jobs
```

### Executar Job Manualmente
```bash
# Primeiro, fazer login para obter token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'

# Executar job
curl -X POST http://localhost:3001/api/scheduler/jobs/1/run \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Recarregar Jobs do Banco
```bash
curl -X POST http://localhost:3001/api/scheduler/reload \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎮 Testando o Scheduler

### 1. Executar Job Manualmente

```bash
# Obter token JWT
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.token')

# Executar job de limpeza
curl -X POST http://localhost:3001/api/scheduler/jobs/1/run \
  -H "Authorization: Bearer $TOKEN"
```

**Output esperado:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "duration": 2023,
    "result": {
      "success": true,
      "deleted": 45,
      "days": 30
    }
  }
}
```

### 2. Criar Novo Job

```bash
curl -X POST http://localhost:3001/api/scheduler/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-job",
    "service_name": "CleanupService",
    "service_method": "cleanOldRecords",
    "service_path": "services/CleanupService",
    "schedule": "*/5 * * * *",
    "params": {"days": 15},
    "enabled": true
  }'
```

### 3. Desabilitar/Habilitar Job

```bash
# Desabilitar
curl -X POST http://localhost:3001/api/scheduler/jobs/1/disable \
  -H "Authorization: Bearer $TOKEN"

# Habilitar
curl -X POST http://localhost:3001/api/scheduler/jobs/1/enable \
  -H "Authorization: Bearer $TOKEN"
```

## 🔧 Controlar Auto-Start

### Desabilitar Auto-Start

Edite o `.env`:
```bash
SCHEDULER_AUTO_START=false
```

Inicie o servidor:
```bash
npm run dev
```

**Output:**
```
✅ Scheduler habilitado e rotas configuradas em: /api/scheduler
⏸️  Scheduler criado mas não iniciado (autoStart=false)
   Para iniciar: POST /api/scheduler/start
```

Inicie manualmente via API:
```bash
curl -X POST http://localhost:3001/api/scheduler/start \
  -H "Authorization: Bearer $TOKEN"
```

## 🛑 Shutdown Graceful

O exemplo implementa shutdown graceful:

```typescript
process.on('SIGINT', async () => {
  await shutdownScheduler();
  process.exit(0);
});
```

Ao pressionar `Ctrl+C`, o scheduler:
1. Para de agendar novos jobs
2. Aguarda jobs em execução terminarem
3. Encerra gracefully

## 📖 Código-Fonte

### src/index.ts

```typescript
import { setupFramework, shutdownScheduler } from 'framework-reactjs-api';

setupFramework(app, {
  enableScheduler: true,  // Habilita scheduler
  // Auto-start e outras configs vêm do .env
});

// Shutdown graceful
process.on('SIGINT', async () => {
  await shutdownScheduler();
  process.exit(0);
});
```

### src/services/CleanupService.ts

```typescript
export class CleanupService {
  static async cleanOldRecords(params: any = {}): Promise<any> {
    const days = params.days || 30;
    // ... lógica de limpeza ...
    return { success: true, deleted: 45 };
  }
}
```

## 🔍 Logs

O scheduler gera logs detalhados:

```
[2025-10-20 10:30:00] [SchedulerService] INFO: Scheduler iniciado
[2025-10-20 10:30:00] [SchedulerService] INFO: Job 'cleanup-old-records' agendado: 0 2 * * *
[2025-10-20 10:30:00] [SchedulerService] INFO: 4 jobs carregados e agendados
[2025-10-20 10:35:00] [SchedulerService] INFO: Executando job 'sync-external-system'
[2025-10-20 10:35:02] [CleanupService] INFO: Sincronização concluída: 23 registros
[2025-10-20 10:35:02] [SchedulerService] INFO: Job 'sync-external-system' executado com sucesso em 2.5s
```

## 🎯 Próximos Passos

1. ✅ Criar seus próprios services em `src/services/`
2. ✅ Cadastrar jobs via SQL ou API
3. ✅ Configurar schedules (cron expressions)
4. ✅ Monitorar execuções via logs
5. ✅ Gerenciar jobs via rotas REST

## 📚 Documentação

- [Scheduler System](../../docs/SCHEDULER.md)
- [Scheduler API](../../docs/SCHEDULER-API.md)
- [Cron Expressions](https://crontab.guru/)

---

**Versão:** 1.0.1  
**Framework:** framework-reactjs-api

### jobs.seed.ts

Script para cadastrar jobs de exemplo no banco de dados.
