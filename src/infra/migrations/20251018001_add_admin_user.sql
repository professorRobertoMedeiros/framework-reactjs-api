-- Script para adicionar um usuário administrador ao sistema
-- Criado em: 18 de outubro de 2025

-- Senha: 601034 (valor hash simulado abaixo)
-- Em um cenário de produção, a senha deveria ser hashada usando bcrypt ou algoritmo similar

-- Inserir o novo usuário administrador
INSERT INTO users (first_name, last_name, email, password_hash, active, created_at)
VALUES
  ('Administrador', 'Sistema', 'admin@sistema.com', '$2b$10$XmPxJu.9/b4Z3mC7Xg8mze8CtlBH1N4wOcKIp3xWF8MUMCacEFQfm', true, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO UPDATE 
SET 
  first_name = 'Administrador',
  last_name = 'Sistema',
  password_hash = '$2b$10$XmPxJu.9/b4Z3mC7Xg8mze8CtlBH1N4wOcKIp3xWF8MUMCacEFQfm',
  updated_at = CURRENT_TIMESTAMP;

-- Nota: Em um cenário real, você usaria uma função de hash apropriada, como:
-- INSERT INTO users (..., password_hash, ...)
-- VALUES (..., crypt('601034', gen_salt('bf', 10)), ...);
-- Isso requer a extensão pgcrypto do PostgreSQL