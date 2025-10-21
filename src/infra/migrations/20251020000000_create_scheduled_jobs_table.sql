-- Migration: Create Scheduled Jobs Table
-- Data: 2025-10-20
-- Descrição: Tabela para armazenar jobs agendados que serão executados periodicamente

CREATE TABLE IF NOT EXISTS scheduled_jobs (
    id SERIAL PRIMARY KEY,
    
    -- Identificação do Job
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    
    -- Configuração de Execução
    service_name VARCHAR(255) NOT NULL,      -- Nome do service (ex: 'UserService')
    service_method VARCHAR(255) NOT NULL,    -- Método do service (ex: 'cleanInactiveUsers')
    service_path VARCHAR(500),               -- Caminho para o service (ex: 'use-cases/user/UserService')
    
    -- Parâmetros
    params JSONB DEFAULT '{}',               -- Parâmetros em JSON para o método
    
    -- Agendamento (cron format)
    -- Exemplos:
    -- '*/5 * * * *' = A cada 5 minutos
    -- '0 */2 * * *' = A cada 2 horas
    -- '0 0 * * *'   = Todo dia à meia-noite
    -- '0 9 * * 1'   = Toda segunda-feira às 9h
    schedule VARCHAR(100) NOT NULL,
    
    -- Controle de Execução
    enabled BOOLEAN DEFAULT true,
    max_retries INTEGER DEFAULT 3,
    retry_delay INTEGER DEFAULT 60,          -- Delay entre retries em segundos
    timeout INTEGER DEFAULT 300,             -- Timeout em segundos (5 minutos)
    
    -- Metadados de Execução
    last_run_at TIMESTAMP,
    last_run_status VARCHAR(50),             -- 'success', 'error', 'timeout', 'running'
    last_run_error TEXT,
    last_run_duration INTEGER,               -- Duração em milissegundos
    next_run_at TIMESTAMP,
    run_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    updated_by INTEGER
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_enabled ON scheduled_jobs(enabled);
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_next_run ON scheduled_jobs(next_run_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_service ON scheduled_jobs(service_name, service_method);
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_status ON scheduled_jobs(last_run_status);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_scheduled_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_scheduled_jobs_updated_at
    BEFORE UPDATE ON scheduled_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_scheduled_jobs_updated_at();

-- Comentários nas colunas
COMMENT ON TABLE scheduled_jobs IS 'Tabela de jobs agendados para execução periódica';
COMMENT ON COLUMN scheduled_jobs.schedule IS 'Formato cron: minuto hora dia mês dia-da-semana';
COMMENT ON COLUMN scheduled_jobs.params IS 'Parâmetros em JSON para passar ao método do service';
COMMENT ON COLUMN scheduled_jobs.service_path IS 'Caminho relativo para o arquivo do service';

-- Inserir jobs de exemplo (comentados)
-- INSERT INTO scheduled_jobs (name, description, service_name, service_method, service_path, schedule, params) VALUES
-- ('cleanup-inactive-users', 'Limpar usuários inativos há mais de 90 dias', 'UserService', 'cleanInactiveUsers', 'use-cases/user/UserService', '0 2 * * *', '{"days": 90}'),
-- ('send-daily-report', 'Enviar relatório diário', 'ReportService', 'sendDailyReport', 'use-cases/report/ReportService', '0 8 * * *', '{"recipients": ["admin@example.com"]}'),
-- ('backup-database', 'Backup do banco de dados', 'BackupService', 'backupDatabase', 'use-cases/backup/BackupService', '0 0 * * 0', '{"type": "full"}');
