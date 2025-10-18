-- Script para adicionar um usuário administrador ao sistema
-- Criado em: 18 de outubro de 2025

-- Senha: 601034 (valor hash simulado abaixo)
-- Em um cenário de produção, a senha deveria ser hashada usando bcrypt ou algoritmo similar

-- Inserir o novo usuário administrador
INSERT INTO users (first_name, last_name, email, password_hash, active, created_at)
VALUES
  ('Administrador', 'Sistema', 'admin@sistema.com', '$2a$10$jzs.JrAfB1BfYD1N4EWk9uVVvw3WlPJ0.xhYpEwxmkuD4O7WfvfJ6', true, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO UPDATE 
SET 
  first_name = 'Administrador',
  last_name = 'Sistema',
  password_hash = '$2a$10$jzs.JrAfB1BfYD1N4EWk9uVVvw3WlPJ0.xhYpEwxmkuD4O7WfvfJ6',
  updated_at = CURRENT_TIMESTAMP;

-- Nota: Em um cenário real, você usaria uma função de hash apropriada, como:
-- INSERT INTO users (..., password_hash, ...)
-- VALUES (..., crypt('601034', gen_salt('bf', 10)), ...);
-- Isso requer a extensão pgcrypto do PostgreSQL