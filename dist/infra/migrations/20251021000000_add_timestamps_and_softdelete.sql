-- ====================================
-- MIGRATION: Adicionar Timestamps e Soft Delete
-- ====================================
-- Descrição: Adiciona campos created_at, updated_at e deleted_at às tabelas existentes
-- Data: 2025-10-21
-- Versão: 1.0.2

-- ====================================
-- 1. Adicionar timestamps à tabela users
-- ====================================

-- Adicionar created_at (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    
    -- Atualizar registros existentes
    UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
    
    -- Tornar NOT NULL
    ALTER TABLE users ALTER COLUMN created_at SET NOT NULL;
  END IF;
END $$;

-- Adicionar updated_at (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    
    -- Atualizar registros existentes
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;
    
    -- Tornar NOT NULL
    ALTER TABLE users ALTER COLUMN updated_at SET NOT NULL;
  END IF;
END $$;

-- Adicionar deleted_at para soft delete (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL;
  END IF;
END $$;

-- ====================================
-- 2. Criar índice para soft delete
-- ====================================

-- Índice para melhorar performance de queries com soft delete
CREATE INDEX IF NOT EXISTS idx_users_deleted_at 
ON users(deleted_at) 
WHERE deleted_at IS NULL;

-- ====================================
-- 3. Criar trigger para updated_at automático
-- ====================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger se já existe
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Criar trigger para users
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- 4. Comentários nas colunas
-- ====================================

COMMENT ON COLUMN users.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN users.updated_at IS 'Data e hora da última atualização do registro';
COMMENT ON COLUMN users.deleted_at IS 'Data e hora de exclusão lógica do registro (soft delete)';

-- ====================================
-- 5. Exemplo de tabela com timestamps (para futuras tabelas)
-- ====================================

-- Template para criar novas tabelas com timestamps e soft delete:
/*
CREATE TABLE example_table (
  id SERIAL PRIMARY KEY,
  -- ... suas colunas aqui ...
  
  -- Timestamps automáticos
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Soft delete (opcional)
  deleted_at TIMESTAMP NULL
);

-- Índice para soft delete
CREATE INDEX idx_example_table_deleted_at 
ON example_table(deleted_at) 
WHERE deleted_at IS NULL;

-- Trigger para updated_at
CREATE TRIGGER update_example_table_updated_at
    BEFORE UPDATE ON example_table
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
*/

-- ====================================
-- 6. Verificação
-- ====================================

-- Verificar se os campos foram adicionados
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('created_at', 'updated_at', 'deleted_at')
ORDER BY column_name;

-- Resultado esperado:
-- table_name | column_name | data_type              | is_nullable | column_default
-- -----------+-------------+------------------------+-------------+---------------------
-- users      | created_at  | timestamp without time zone | NO          | CURRENT_TIMESTAMP
-- users      | deleted_at  | timestamp without time zone | YES         | NULL
-- users      | updated_at  | timestamp without time zone | NO          | CURRENT_TIMESTAMP
