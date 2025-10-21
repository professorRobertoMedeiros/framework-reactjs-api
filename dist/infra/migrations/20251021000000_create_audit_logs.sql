-- Tabela para armazenar o histórico de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(255) NOT NULL,
  record_id INTEGER NOT NULL,
  column_name VARCHAR(255) NOT NULL,
  action_type VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
  old_value TEXT,
  new_value TEXT,
  user_id INTEGER,
  user_email VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhorar a performance das consultas
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs (table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs (action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at);