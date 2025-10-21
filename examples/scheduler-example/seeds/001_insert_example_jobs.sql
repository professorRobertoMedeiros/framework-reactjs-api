-- ====================================
-- JOBS DE EXEMPLO PARA O SCHEDULER
-- ====================================

-- Job 1: Limpeza de registros antigos (executa todo dia às 2h)
INSERT INTO scheduled_jobs (
  name,
  description,
  service_name,
  service_method,
  service_path,
  schedule,
  params,
  enabled,
  max_retries,
  timeout
) VALUES (
  'cleanup-old-records',
  'Limpa registros com mais de 30 dias',
  'CleanupService',
  'cleanOldRecords',
  'services/CleanupService',
  '0 2 * * *',
  '{"days": 30}'::jsonb,
  true,
  3,
  300
);

-- Job 2: Envio de relatório diário (executa todo dia às 8h)
INSERT INTO scheduled_jobs (
  name,
  description,
  service_name,
  service_method,
  service_path,
  schedule,
  params,
  enabled,
  max_retries,
  timeout
) VALUES (
  'send-daily-report',
  'Envia relatório diário por email',
  'CleanupService',
  'sendDailyReport',
  'services/CleanupService',
  '0 8 * * *',
  '{"recipients": ["admin@example.com", "manager@example.com"]}'::jsonb,
  true,
  3,
  300
);

-- Job 3: Backup de dados (executa todo dia à meia-noite)
INSERT INTO scheduled_jobs (
  name,
  description,
  service_name,
  service_method,
  service_path,
  schedule,
  params,
  enabled,
  max_retries,
  timeout
) VALUES (
  'backup-data',
  'Backup automático dos dados',
  'CleanupService',
  'backupData',
  'services/CleanupService',
  '0 0 * * *',
  '{"tables": ["users", "products", "orders"]}'::jsonb,
  true,
  2,
  600
);

-- Job 4: Sincronização com sistema externo (executa a cada 30 minutos)
INSERT INTO scheduled_jobs (
  name,
  description,
  service_name,
  service_method,
  service_path,
  schedule,
  params,
  enabled,
  max_retries,
  timeout
) VALUES (
  'sync-external-system',
  'Sincroniza dados com sistema externo',
  'CleanupService',
  'syncWithExternalSystem',
  'services/CleanupService',
  '*/30 * * * *',
  '{"endpoint": "https://api.example.com/sync"}'::jsonb,
  true,
  5,
  300
);

-- Job 5: Job desabilitado (exemplo)
INSERT INTO scheduled_jobs (
  name,
  description,
  service_name,
  service_method,
  service_path,
  schedule,
  params,
  enabled,
  max_retries,
  timeout
) VALUES (
  'disabled-job-example',
  'Exemplo de job desabilitado',
  'CleanupService',
  'cleanOldRecords',
  'services/CleanupService',
  '0 3 * * *',
  '{"days": 60}'::jsonb,
  false,
  3,
  300
);

-- Verificar jobs inseridos
SELECT 
  id,
  name,
  schedule,
  enabled,
  last_run_status
FROM scheduled_jobs
ORDER BY id;
