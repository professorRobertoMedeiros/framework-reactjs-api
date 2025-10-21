# 🎯 Guia Visual: Auto-Start do Scheduler

## 📊 Fluxo de Inicialização

```
┌─────────────────────────────────────────────────────────────┐
│                    PROJETO INICIA                           │
│                    npm run dev                              │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│           dotenv.config()                                   │
│           Carregar .env                                     │
│                                                             │
│  SCHEDULER_ENABLED=true                                     │
│  SCHEDULER_AUTO_START=true                                  │
│  SCHEDULER_MAX_CONCURRENT=5                                 │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│           setupFramework(app, { ... })                      │
│           Configurar framework                              │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
         ┌────────┴────────┐
         │ enableScheduler? │
         └────────┬────────┘
                  │
         ┌────────┴────────┐
         │                 │
        SIM               NÃO
         │                 │
         ▼                 ▼
    ┌─────────┐      ┌──────────┐
    │ Criar   │      │ Pular    │
    │Scheduler│      │Scheduler │
    └────┬────┘      └──────────┘
         │
         ▼
    ┌──────────────────────┐
    │ autoStart !== false? │
    └──────┬───────────────┘
           │
    ┌──────┴──────┐
    │             │
   SIM           NÃO
    │             │
    ▼             ▼
┌─────────┐  ┌──────────────┐
│scheduler│  │ Scheduler    │
│.start() │  │ criado mas   │
│         │  │ não iniciado │
└────┬────┘  └──────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│         JobRepository.findReadyToRun()                      │
│         Buscar jobs habilitados no banco                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│         Para cada job encontrado:                           │
│         - Criar cron.schedule(job.schedule, ...)            │
│         - Armazenar em cronJobs Map                         │
│         - Log: "Job 'nome' agendado: 0 2 * * *"            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│         ✅ SCHEDULER RODANDO                                │
│         Jobs executam conforme schedule                     │
│         Logs em logs/app-YYYY-MM-DD.log                     │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Estados do Scheduler

### Estado 1: Auto-Start Habilitado ✅

```bash
# .env
SCHEDULER_ENABLED=true
SCHEDULER_AUTO_START=true
```

**Console Output:**
```
🚀 Servidor rodando na porta 3000
✅ Rotas de autenticação configuradas em: /api/auth
✅ Scheduler habilitado e rotas configuradas em: /api/scheduler
   - GET /api/scheduler/status
   - POST /api/scheduler/reload
   - POST /api/scheduler/start
   - POST /api/scheduler/stop
   - GET /api/scheduler/jobs
   - POST /api/scheduler/jobs
   ... (mais rotas)
🚀 Scheduler iniciado automaticamente         👈 AUTO-START!
📅 3 jobs carregados e agendados
   - Job 'cleanup-users' agendado: 0 2 * * *
   - Job 'send-reports' agendado: 0 8 * * *
   - Job 'sync-data' agendado: */30 * * * *
✅ Framework inicializado com sucesso!
```

**Timeline:**
```
t=0s   │ Servidor inicia
t=0.5s │ Framework setup
t=1s   │ Scheduler criado
t=1.2s │ Scheduler.start() chamado  👈 AUTOMÁTICO
t=1.5s │ Jobs carregados do banco
t=2s   │ Cron jobs agendados
t=2.5s │ ✅ Pronto para executar
```

---

### Estado 2: Auto-Start Desabilitado ⏸️

```bash
# .env
SCHEDULER_ENABLED=true
SCHEDULER_AUTO_START=false
```

**Console Output:**
```
🚀 Servidor rodando na porta 3000
✅ Rotas de autenticação configuradas em: /api/auth
✅ Scheduler habilitado e rotas configuradas em: /api/scheduler
   - GET /api/scheduler/status
   - POST /api/scheduler/reload
   - POST /api/scheduler/start       👈 USE ESTA ROTA!
   - POST /api/scheduler/stop
   ... (mais rotas)
⏸️  Scheduler criado mas não iniciado (autoStart=false)
   Para iniciar: POST /api/scheduler/start
✅ Framework inicializado com sucesso!
```

**Timeline:**
```
t=0s   │ Servidor inicia
t=0.5s │ Framework setup
t=1s   │ Scheduler criado
t=1.2s │ ⏸️  Scheduler NÃO iniciado (autoStart=false)
t=2s   │ ✅ Aguardando comando manual
       │
       │ (depois, via API)
       │ POST /api/scheduler/start
       │
t=X    │ Scheduler.start() chamado  👈 MANUAL
t=X+1s │ Jobs carregados do banco
t=X+2s │ ✅ Pronto para executar
```

---

### Estado 3: Scheduler Desabilitado ❌

```bash
# .env
SCHEDULER_ENABLED=false
```

**Console Output:**
```
🚀 Servidor rodando na porta 3000
✅ Rotas de autenticação configuradas em: /api/auth
✅ Framework inicializado com sucesso!
```

**Timeline:**
```
t=0s   │ Servidor inicia
t=0.5s │ Framework setup
t=1s   │ ❌ Scheduler completamente desabilitado
t=1.5s │ ✅ Servidor pronto (sem scheduler)
```

---

## 🔄 Ciclo de Vida de um Job

```
┌──────────────────────────────────────────────────────────┐
│              JOB CADASTRADO NO BANCO                     │
│  INSERT INTO scheduled_jobs (...)                        │
│  enabled = true                                          │
│  schedule = '0 2 * * *'  (todo dia às 2h)                │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
            ┌────────────────┐
            │ Servidor inicia│
            │ (auto-start=   │
            │      true)     │
            └────────┬───────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│         Scheduler.loadAndScheduleJobs()                  │
│         1. Buscar jobs habilitados                       │
│         2. Criar cron.schedule() para cada um            │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│              Job agendado com node-cron                  │
│              Aguardando horário: 02:00                   │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ (aguarda até 02:00)
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│              02:00 - Cron dispara                        │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│         executeJobIfReady(jobId)                         │
│         Verificações:                                    │
│         1. ✅ Job já está rodando? (in-memory)           │
│         2. ✅ Job marcado como RUNNING? (database)       │
│         3. ✅ Verificação final (race condition)         │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│         executeJob(job)                                  │
│         1. runningJobs.add(job.id)                       │
│         2. markAsRunning(job.id)                         │
│         3. loadService(job.service_path)                 │
│         4. service[job.service_method](job.params)       │
└────────────────────┬─────────────────────────────────────┘
                     │
            ┌────────┴────────┐
            │                 │
         SUCESSO            ERRO
            │                 │
            ▼                 ▼
    ┌──────────────┐  ┌──────────────┐
    │ markCompleted│  │ Tentar retry │
    │ (success)    │  │ ou marcar    │
    │              │  │ como error   │
    └──────┬───────┘  └──────┬───────┘
           │                 │
           └────────┬────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│         Cleanup                                          │
│         1. runningJobs.delete(job.id)                    │
│         2. Atualizar estatísticas no banco               │
│         3. Logs: "Job executado em 2.5s"                 │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│         Aguardar próxima execução                        │
│         Próximo: 03:00 do dia seguinte                   │
└──────────────────────────────────────────────────────────┘
```

---

## 📋 Comparação de Cenários

| Cenário | SCHEDULER_ENABLED | SCHEDULER_AUTO_START | Comportamento |
|---------|-------------------|----------------------|---------------|
| **Produção** | `true` | `true` | ✅ Scheduler inicia automaticamente, jobs rodam conforme schedule |
| **Desenvolvimento** | `true` | `false` | ⏸️ Scheduler criado mas não iniciado, iniciar manualmente via API |
| **Testes** | `false` | - | ❌ Scheduler desabilitado, jobs não executam |
| **Staging** | `true` | `true` | ✅ Igual produção |

---

## 🎬 Exemplo Visual de Execução

```
Terminal Output (com SCHEDULER_AUTO_START=true):

$ npm run dev

> scheduler-example@1.0.0 dev
> ts-node src/index.ts

[2025-10-20 14:30:00] [App] INFO: Carregando variáveis de ambiente
[2025-10-20 14:30:00] [App] INFO: Conectando ao banco de dados
[2025-10-20 14:30:01] [FrameworkSetup] INFO: Configurando rotas de autenticação
✅ Rotas de autenticação configuradas em: /api/auth
   - POST /api/auth/login
   - POST /api/auth/register
   - GET /api/auth/me

[2025-10-20 14:30:01] [FrameworkSetup] INFO: Configurando scheduler
[2025-10-20 14:30:01] [SchedulerService] INFO: Criando instância do scheduler
✅ Scheduler habilitado e rotas configuradas em: /api/scheduler
   - GET /api/scheduler/status
   - POST /api/scheduler/reload
   - POST /api/scheduler/start
   - POST /api/scheduler/stop
   - GET /api/scheduler/jobs
   - POST /api/scheduler/jobs
   - GET /api/scheduler/jobs/:id
   - PUT /api/scheduler/jobs/:id
   - DELETE /api/scheduler/jobs/:id
   - POST /api/scheduler/jobs/:id/run
   - POST /api/scheduler/jobs/:id/enable
   - POST /api/scheduler/jobs/:id/disable
   - POST /api/scheduler/reload/:id

[2025-10-20 14:30:01] [SchedulerService] INFO: Iniciando scheduler...
[2025-10-20 14:30:02] [JobRepository] INFO: Buscando jobs prontos para agendar
[2025-10-20 14:30:02] [JobRepository] INFO: 3 jobs habilitados encontrados
[2025-10-20 14:30:02] [SchedulerService] INFO: Agendando job 'cleanup-users'
[2025-10-20 14:30:02] [SchedulerService] INFO: Cron criado: 0 2 * * * (Todo dia às 2h)
[2025-10-20 14:30:02] [SchedulerService] INFO: Agendando job 'send-reports'
[2025-10-20 14:30:02] [SchedulerService] INFO: Cron criado: 0 8 * * * (Todo dia às 8h)
[2025-10-20 14:30:02] [SchedulerService] INFO: Agendando job 'sync-data'
[2025-10-20 14:30:02] [SchedulerService] INFO: Cron criado: */30 * * * * (A cada 30 min)

🚀 Scheduler iniciado automaticamente
📅 3 jobs carregados e agendados
   - Job 'cleanup-users' agendado: 0 2 * * *
   - Job 'send-reports' agendado: 0 8 * * *
   - Job 'sync-data' agendado: */30 * * * *

✅ Framework inicializado com sucesso!

🚀 Servidor rodando na porta 3000
📅 Scheduler: HABILITADO
🔄 Auto-start: SIM

📖 Documentação da API: http://localhost:3000

[2025-10-20 14:30:02] [App] INFO: Aguardando requisições...

... (30 minutos depois) ...

[2025-10-20 15:00:00] [SchedulerService] INFO: Cron disparado para job 'sync-data'
[2025-10-20 15:00:00] [SchedulerService] INFO: Verificando se job 3 está pronto
[2025-10-20 15:00:00] [SchedulerService] INFO: Job 3 não está rodando, executando...
[2025-10-20 15:00:00] [JobRepository] INFO: Marcando job 3 como RUNNING
[2025-10-20 15:00:00] [JobExecutor] INFO: Carregando service: CleanupService
[2025-10-20 15:00:00] [JobExecutor] INFO: Service encontrado em: src/services/CleanupService
[2025-10-20 15:00:00] [JobExecutor] INFO: Executando método: syncWithExternalSystem
[2025-10-20 15:00:00] [CleanupService] INFO: Sincronizando com sistema externo...
[2025-10-20 15:00:02] [CleanupService] INFO: Sincronização concluída: 23 registros
[2025-10-20 15:00:02] [JobRepository] INFO: Marcando job 3 como SUCESSO (2.5s)
[2025-10-20 15:00:02] [SchedulerService] INFO: Job 'sync-data' executado com sucesso em 2.5s

... (aguarda próxima execução) ...
```

---

## 🎯 Decisão: Quando Usar Cada Modo?

### ✅ Use `SCHEDULER_AUTO_START=true` quando:

- 🏭 **Produção**: Jobs críticos precisam rodar
- 📊 **Monitoramento**: Coleta automática de métricas
- 🔄 **Sincronização**: Integração com sistemas externos
- 🧹 **Manutenção**: Limpeza automática de dados
- 📧 **Notificações**: Envio de emails/relatórios

### ⏸️ Use `SCHEDULER_AUTO_START=false` quando:

- 🧪 **Desenvolvimento**: Testar jobs individualmente
- 🐛 **Debug**: Investigar problemas em jobs
- 🔧 **Manutenção**: Fazer ajustes sem executar jobs
- 📝 **Testes**: Executar jobs manualmente
- 🎓 **Aprendizado**: Entender o funcionamento

### ❌ Use `SCHEDULER_ENABLED=false` quando:

- 🧪 **Testes unitários**: Jobs não devem interferir
- 🚧 **Em construção**: Scheduler ainda não implementado
- 🔒 **Segurança**: Ambiente restrito sem jobs

---

**Versão:** 1.0.2  
**Data:** Outubro 2025  
**Status:** ✅ Guia completo
