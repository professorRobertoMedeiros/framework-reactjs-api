# 📅 Sistema de Scheduler - Agendamento de Tarefas

## 📋 Visão Geral

Sistema completo de agendamento de tarefas (jobs) que permite executar métodos de services periodicamente com configuração armazenada no banco de dados.

### ✨ Funcionalidades

- ✅ **Jobs armazenados no banco de dados**
- ✅ **Execução via cron expressions** (*/5 * * * *, 0 0 * * *, etc)
- ✅ **Carregamento dinâmico de services**
- ✅ **Parâmetros JSON** para os métodos
- ✅ **Controle de retries** e timeout
- ✅ **Monitoramento e estatísticas** de execução
- ✅ **Execução manual** de jobs
- ✅ **Detecção de jobs travados**
- ✅ **Limite de jobs concorrentes**

## 🚀 Setup Rápido

### 1. Executar Migration

```bash
npx framework-reactjs-api-migrate
```

Isso criará a tabela `scheduled_jobs` no banco de dados.

### 2. Iniciar o Scheduler

```typescript
import { SchedulerService } from 'framework-reactjs-api';

// Criar instância do scheduler
const scheduler = new SchedulerService({
  enabled: true,
  autoStart: true,
  maxConcurrent: 5,
  checkInterval: 60000, // Verificar a cada 1 minuto
  stuckJobThreshold: 30  // Jobs travados após 30 minutos
});

// Ou iniciar manualmente
await scheduler.start();
```

### 3. Cadastrar Jobs

```typescript
import { JobRepository } from 'framework-reactjs-api';

const jobRepo = new JobRepository();

// Cadastrar job
await jobRepo.create({
  name: 'cleanup-old-users',
  description: 'Limpar usuários inativos há mais de 90 dias',
  service_name: 'UserService',
  service_method: 'cleanInactiveUsers',
  service_path: 'use-cases/user/UserService',
  schedule: '0 2 * * *', // Todo dia às 2h da manhã
  params: { days: 90 },
  enabled: true,
  max_retries: 3,
  retry_delay: 60,
  timeout: 300
});
```

## 📊 Formato Cron

O scheduler usa expressões cron padrão (5 campos):

```
┌────────────── minuto (0 - 59)
│ ┌──────────── hora (0 - 23)
│ │ ┌────────── dia do mês (1 - 31)
│ │ │ ┌──────── mês (1 - 12)
│ │ │ │ ┌────── dia da semana (0 - 7) (0 e 7 = domingo)
│ │ │ │ │
* * * * *
```

### Exemplos de Schedules

| Expressão | Descrição |
|-----------|-----------|
| `* * * * *` | A cada minuto |
| `*/5 * * * *` | A cada 5 minutos |
| `*/15 * * * *` | A cada 15 minutos |
| `0 * * * *` | A cada hora (início da hora) |
| `0 */2 * * *` | A cada 2 horas |
| `0 0 * * *` | Todo dia à meia-noite |
| `0 2 * * *` | Todo dia às 2h da manhã |
| `0 12 * * *` | Todo dia ao meio-dia |
| `0 9 * * 1` | Toda segunda-feira às 9h |
| `0 9 * * 1-5` | Dias úteis às 9h |
| `0 0 1 * *` | Primeiro dia de cada mês à meia-noite |
| `0 0 * * 0` | Todo domingo à meia-noite |
| `30 8 * * *` | Todo dia às 8:30 |

## 💾 Estrutura da Tabela scheduled_jobs

```sql
CREATE TABLE scheduled_jobs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    description TEXT,
    
    -- Configuração do Service
    service_name VARCHAR(255),    -- Ex: 'UserService'
    service_method VARCHAR(255),  -- Ex: 'cleanInactiveUsers'
    service_path VARCHAR(500),    -- Ex: 'use-cases/user/UserService'
    
    -- Parâmetros e Agendamento
    params JSONB DEFAULT '{}',
    schedule VARCHAR(100),        -- Cron expression
    
    -- Controle
    enabled BOOLEAN DEFAULT true,
    max_retries INTEGER DEFAULT 3,
    retry_delay INTEGER DEFAULT 60,
    timeout INTEGER DEFAULT 300,
    
    -- Estatísticas
    last_run_at TIMESTAMP,
    last_run_status VARCHAR(50),
    last_run_error TEXT,
    last_run_duration INTEGER,
    next_run_at TIMESTAMP,
    run_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Criar um Service para Jobs

### 1. Criar o Service

```typescript
// src/use-cases/cleanup/CleanupService.ts
export class CleanupService {
  /**
   * Limpa usuários inativos
   * Este método será chamado pelo scheduler
   */
  async cleanInactiveUsers(params: { days: number }): Promise<any> {
    console.log(`Limpando usuários inativos há ${params.days} dias...`);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - params.days);
    
    // Lógica de limpeza
    const userRepo = new UserRepository();
    const inactiveUsers = await userRepo.findBy({
      last_login_at: { $lt: cutoffDate },
      active: false
    });
    
    for (const user of inactiveUsers) {
      await userRepo.delete(user.id);
    }
    
    return {
      deleted: inactiveUsers.length,
      cutoffDate
    };
  }

  /**
   * Envia relatório diário
   */
  async sendDailyReport(params: { recipients: string[] }): Promise<any> {
    console.log(`Enviando relatório para: ${params.recipients.join(', ')}`);
    
    // Gerar relatório
    const report = await this.generateReport();
    
    // Enviar email
    // await emailService.send(...);
    
    return {
      sent: true,
      recipients: params.recipients,
      reportSize: report.length
    };
  }

  private async generateReport(): Promise<any> {
    // Lógica de geração de relatório
    return { data: [] };
  }
}
```

### 2. Cadastrar o Job

```typescript
await jobRepo.create({
  name: 'cleanup-inactive-users',
  description: 'Limpar usuários inativos há mais de 90 dias',
  service_name: 'CleanupService',
  service_method: 'cleanInactiveUsers',
  service_path: 'use-cases/cleanup/CleanupService',
  schedule: '0 2 * * *', // 2h da manhã todos os dias
  params: { days: 90 },
  enabled: true
});
```

## 📝 Exemplos de Uso

### Executar Job Manualmente

```typescript
const scheduler = new SchedulerService();

// Executar job específico agora
const result = await scheduler.runJobNow(jobId);

console.log(result);
// {
//   success: true,
//   duration: 1523,
//   result: { deleted: 10, cutoffDate: '2025-01-20T...' }
// }
```

### Listar Jobs Habilitados

```typescript
const jobRepo = new JobRepository();

const enabledJobs = await jobRepo.findEnabled();

for (const job of enabledJobs) {
  console.log(`${job.name}: ${job.getScheduleDescription()}`);
  console.log(`  Taxa de sucesso: ${job.getSuccessRate()}%`);
  console.log(`  Última execução: ${job.last_run_at}`);
  console.log(`  Próxima execução: ${job.next_run_at}`);
}
```

### Desabilitar/Habilitar Job

```typescript
// Desabilitar
await jobRepo.setEnabled(jobId, false);

// Habilitar
await jobRepo.setEnabled(jobId, true);

// Recarregar job no scheduler
await scheduler.reloadJob(jobId);
```

### Atualizar Schedule de um Job

```typescript
// Atualizar schedule
await jobRepo.update(jobId, {
  schedule: '*/30 * * * *', // Mudar para a cada 30 minutos
  updated_at: new Date()
});

// Recarregar no scheduler
await scheduler.reloadJob(jobId);
```

### Monitorar Jobs

```typescript
// Status do scheduler
const status = scheduler.getStatus();
console.log(status);
// {
//   running: true,
//   runningJobs: [1, 3, 5],
//   scheduledJobs: 10,
//   maxConcurrent: 5
// }

// Buscar jobs com erro
const errorJobs = await jobRepo.findByLastStatus(JobStatus.ERROR);

for (const job of errorJobs) {
  console.log(`Job com erro: ${job.name}`);
  console.log(`  Erro: ${job.last_run_error}`);
  console.log(`  Taxa de sucesso: ${job.getSuccessRate()}%`);
}
```

### Resetar Estatísticas

```typescript
// Resetar contadores de um job
await jobRepo.resetStatistics(jobId);
```

## 🔍 Buscar Jobs Prontos para Executar

```typescript
const readyJobs = await jobRepo.findReadyToRun();

console.log(`${readyJobs.length} jobs prontos para executar`);

for (const job of readyJobs) {
  console.log(`- ${job.name} (próxima: ${job.next_run_at})`);
}
```

## 🚨 Detectar Jobs Travados

```typescript
// Buscar jobs travados (rodando há mais de 30 minutos)
const stuckJobs = await jobRepo.findStuckJobs(30);

for (const job of stuckJobs) {
  console.log(`Job travado: ${job.name}`);
  console.log(`  Última execução: ${job.last_run_at}`);
  console.log(`  Duração: ${job.last_run_duration}ms`);
}
```

## ⚙️ Configuração Avançada

### Opções do SchedulerService

```typescript
interface SchedulerOptions {
  enabled?: boolean;           // Habilitar scheduler (padrão: true)
  checkInterval?: number;      // Intervalo de verificação em ms (padrão: 60000)
  maxConcurrent?: number;      // Máx. jobs simultâneos (padrão: 5)
  autoStart?: boolean;         // Iniciar automaticamente (padrão: false)
  stuckJobThreshold?: number;  // Minutos para considerar travado (padrão: 30)
}

const scheduler = new SchedulerService({
  enabled: true,
  checkInterval: 30000,  // Verificar a cada 30s
  maxConcurrent: 10,     // Permitir 10 jobs simultâneos
  autoStart: true,
  stuckJobThreshold: 60  // Considerar travado após 1h
});
```

### Integrar no Setup do Framework

```typescript
// src/app.ts
import express from 'express';
import { setupFramework, SchedulerService } from 'framework-reactjs-api';

const app = express();
app.use(express.json());

// Setup framework
setupFramework(app);

// Iniciar scheduler
const scheduler = new SchedulerService({ autoStart: true });

// Shutdown graceful
process.on('SIGINT', async () => {
  console.log('Parando scheduler...');
  await scheduler.stop();
  process.exit(0);
});

app.listen(3000, () => {
  console.log('🚀 Servidor rodando na porta 3000');
  console.log('📅 Scheduler ativo');
});
```

## 📊 Logs

O scheduler utiliza o sistema de logs do framework:

```typescript
// Logs automáticos
// ✅ Início de execução de job
// ✅ Fim de execução (sucesso/erro)
// ✅ Retries
// ✅ Jobs travados detectados
// ✅ Erros de carregamento de services

// Exemplo de log
{
  "timestamp": "2025-10-20T10:00:00.000Z",
  "level": "info",
  "message": "Executando job: cleanup-inactive-users",
  "job": {
    "id": 1,
    "name": "cleanup-inactive-users",
    "service": "CleanupService",
    "method": "cleanInactiveUsers"
  }
}
```

## 🎯 Boas Práticas

### 1. Idempotência

Jobs devem ser idempotentes (executar múltiplas vezes sem efeitos colaterais):

```typescript
async processOrders(params: any) {
  // ✅ BOM: Buscar apenas pedidos não processados
  const orders = await orderRepo.findBy({ processed: false });
  
  for (const order of orders) {
    await this.processOrder(order);
    await orderRepo.update(order.id, { processed: true });
  }
}
```

### 2. Tratamento de Erros

Sempre tratar erros e retornar informações úteis:

```typescript
async sendNotifications(params: { userIds: number[] }) {
  const results = [];
  
  for (const userId of params.userIds) {
    try {
      await this.sendNotification(userId);
      results.push({ userId, success: true });
    } catch (error) {
      results.push({ 
        userId, 
        success: false, 
        error: error.message 
      });
    }
  }
  
  return results;
}
```

### 3. Timeouts Adequados

Defina timeouts realistas para seus jobs:

- Jobs rápidos (< 1 min): `timeout: 60`
- Jobs médios (1-5 min): `timeout: 300`
- Jobs longos (5-15 min): `timeout: 900`
- Jobs muito longos: `timeout: 1800`

### 4. Monitoramento

Monitore a taxa de sucesso dos jobs:

```typescript
const jobs = await jobRepo.findAll();

for (const job of jobs) {
  const successRate = job.getSuccessRate();
  
  if (successRate < 80) {
    console.warn(`Job ${job.name} com baixa taxa de sucesso: ${successRate}%`);
    // Alertar equipe, enviar notificação, etc
  }
}
```

## ✅ Checklist de Implementação

- [x] Migration criada
- [x] JobModel implementado
- [x] JobRepository implementado
- [x] JobExecutor (carregamento dinâmico)
- [x] SchedulerService (gerenciamento de jobs)
- [x] Suporte a cron expressions
- [x] Suporte a retries e timeout
- [x] Detecção de jobs travados
- [x] Execução manual de jobs
- [x] Logs integrados
- [x] Exports no index.ts
- [x] Documentação completa

---

**Versão:** 1.0.1  
**Data:** Outubro 2025  
**Status:** ✅ Implementado e funcional
