# 🚀 Auto-Start do Scheduler - Guia Rápido

## 📋 Resumo

O scheduler agora **inicia automaticamente** quando o projeto roda, carregando todos os jobs habilitados do banco de dados.

## ✨ Novidades

### 1. Variáveis de Ambiente

Adicione ao seu `.env`:

```bash
# Habilitar scheduler
SCHEDULER_ENABLED=true

# Iniciar automaticamente (padrão: true)
SCHEDULER_AUTO_START=true

# Configurações adicionais
SCHEDULER_MAX_CONCURRENT=5
SCHEDULER_CHECK_INTERVAL=60000
SCHEDULER_STUCK_THRESHOLD=30
```

### 2. Comportamento

#### Com `SCHEDULER_AUTO_START=true` (padrão):

```typescript
import { setupFramework } from 'framework-reactjs-api';

setupFramework(app, {
  enableScheduler: true
});

// Output:
// ✅ Scheduler habilitado e rotas configuradas em: /api/scheduler
// 🚀 Scheduler iniciado automaticamente
// 📅 10 jobs carregados e agendados
```

**Resultado:** 
- ✅ Scheduler inicia sozinho
- ✅ Jobs habilitados são carregados e agendados
- ✅ Execuções começam conforme schedule

#### Com `SCHEDULER_AUTO_START=false`:

```bash
SCHEDULER_AUTO_START=false
```

**Output:**
```
✅ Scheduler habilitado e rotas configuradas em: /api/scheduler
⏸️  Scheduler criado mas não iniciado (autoStart=false)
   Para iniciar: POST /api/scheduler/start
```

**Resultado:**
- ⏸️  Scheduler não inicia automaticamente
- 🔧 Precisa ser iniciado manualmente via API
- 🎯 Útil para ambientes de teste/desenvolvimento

## 🔧 Controle Manual

### Iniciar Scheduler

```bash
curl -X POST http://localhost:3000/api/scheduler/start \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Parar Scheduler

```bash
curl -X POST http://localhost:3000/api/scheduler/stop \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Verificar Status

```bash
curl http://localhost:3000/api/scheduler/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

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

## 📖 Exemplo Completo

### 1. Configurar Projeto

```bash
# .env
SCHEDULER_ENABLED=true
SCHEDULER_AUTO_START=true
SCHEDULER_MAX_CONCURRENT=3
```

### 2. Configurar Express

```typescript
import express from 'express';
import dotenv from 'dotenv';
import { setupFramework, shutdownScheduler } from 'framework-reactjs-api';

dotenv.config();

const app = express();
app.use(express.json());

// Habilitar scheduler com auto-start
setupFramework(app, {
  enableScheduler: true  // Usa configs do .env
});

const server = app.listen(3000);

// Shutdown graceful
process.on('SIGINT', async () => {
  await shutdownScheduler();
  server.close();
  process.exit(0);
});
```

### 3. Cadastrar Jobs no Banco

```sql
INSERT INTO scheduled_jobs (
  name,
  service_name,
  service_method,
  service_path,
  schedule,
  params,
  enabled
) VALUES (
  'cleanup-users',
  'UserService',
  'cleanInactiveUsers',
  'use-cases/user/UserService',
  '0 2 * * *',
  '{"days": 90}'::jsonb,
  true
);
```

### 4. Rodar Aplicação

```bash
npm run dev
```

**Output:**
```
🚀 Servidor rodando na porta 3000
✅ Scheduler habilitado e rotas configuradas em: /api/scheduler
🚀 Scheduler iniciado automaticamente
📅 1 job carregado e agendado
   - Job 'cleanup-users' agendado: 0 2 * * * (Todo dia às 2h)
```

**Resultado:** Job será executado automaticamente todo dia às 2h da manhã! 🎉

## 🔄 Recarregar Jobs em Tempo Real

Se você cadastrar um novo job no banco de dados, pode recarregá-lo sem reiniciar:

```bash
# Inserir novo job no banco
psql -c "INSERT INTO scheduled_jobs ..."

# Recarregar jobs via API
curl -X POST http://localhost:3000/api/scheduler/reload \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Jobs recarregados com sucesso"
}
```

Novo job já está agendado e rodando! ✅

## 🎯 Casos de Uso

### Produção (Recomendado)

```bash
SCHEDULER_ENABLED=true
SCHEDULER_AUTO_START=true
SCHEDULER_MAX_CONCURRENT=3
SCHEDULER_CHECK_INTERVAL=60000
```

- ✅ Jobs iniciam automaticamente
- ✅ Alta disponibilidade
- ✅ Sem intervenção manual

### Desenvolvimento

```bash
SCHEDULER_ENABLED=true
SCHEDULER_AUTO_START=false
SCHEDULER_MAX_CONCURRENT=1
SCHEDULER_CHECK_INTERVAL=10000
```

- ✅ Controle manual do scheduler
- ✅ Executar jobs sob demanda
- ✅ Facilita debugging

### Testes

```bash
SCHEDULER_ENABLED=false
```

- ✅ Scheduler completamente desabilitado
- ✅ Não interfere nos testes
- ✅ Jobs podem ser testados individualmente

## ✅ Checklist

- [x] Variáveis de ambiente configuradas no `.env`
- [x] Scheduler habilitado via `setupFramework()`
- [x] Jobs cadastrados no banco de dados (enabled=true)
- [x] Migration `20251020000000_create_scheduled_jobs_table.sql` aplicada
- [x] Services criados e métodos implementados
- [x] Shutdown graceful implementado
- [x] Tudo pronto! 🚀

## 🐛 Troubleshooting

### Scheduler não inicia

**Problema:** Projeto roda mas scheduler não inicia.

**Verificar:**
```bash
# .env
SCHEDULER_ENABLED=true  # Deve ser 'true'
SCHEDULER_AUTO_START=true  # Deve ser 'true' ou ausente
```

### Jobs não executam

**Problema:** Scheduler iniciou mas jobs não executam.

**Verificar:**
1. Jobs estão habilitados no banco:
```sql
SELECT id, name, enabled FROM scheduled_jobs;
```

2. Schedule está correto:
```sql
SELECT id, name, schedule FROM scheduled_jobs;
```

3. Logs do scheduler:
```bash
tail -f logs/app-$(date +%Y-%m-%d).log
```

### Service não encontrado

**Problema:** Job falha com erro "Service not found".

**Verificar:**
1. `service_path` está correto:
```sql
SELECT service_name, service_path FROM scheduled_jobs WHERE id = 1;
```

2. Arquivo existe no caminho especificado
3. Service está exportado corretamente

## 📚 Documentação Completa

- [Scheduler System](./SCHEDULER.md) - Arquitetura e conceitos
- [Scheduler API](./SCHEDULER-API.md) - Rotas REST completas
- [Example Project](../examples/scheduler-example/) - Projeto funcional

---

**Versão:** 1.0.2  
**Data:** Outubro 2025  
**Status:** ✅ Implementado e testado
