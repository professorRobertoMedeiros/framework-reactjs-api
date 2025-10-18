-- Script inicial para criação da tabela de usuários
-- Este script é executado automaticamente durante o processo de migração

-- Criar tabela de usuários (se ainda não existir)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_users_name ON users (first_name, last_name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Inserir um usuário de exemplo para testes
INSERT INTO users (first_name, last_name, email, password_hash, active, created_at)
VALUES
  ('Admin', 'Sistema', 'admin@exemplo.com.br', '$2b$10$KdXjR3EnTmOkz1lyWCa1KubmRaHTh9CoCGpMZ9.5J1LvIYgFO1nEm', true, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Comentário para mostrar como adicionar permissões
-- GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE users TO app_user;