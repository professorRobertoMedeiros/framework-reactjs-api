-- Criar tabela de produtos para exemplo de logging
-- Esta migração demonstra como os logs SQL incluem o requestId

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice para busca por nome
CREATE INDEX IF NOT EXISTS idx_products_name ON products(LOWER(name));

-- Criar índice para busca por preço
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Inserir alguns produtos de exemplo
INSERT INTO products (name, price, description) VALUES
  ('Notebook Dell', 2500.00, 'Notebook Dell Inspiron 15, 8GB RAM, 256GB SSD'),
  ('Mouse Logitech', 89.90, 'Mouse sem fio Logitech M185'),
  ('Teclado Mecânico', 350.00, 'Teclado mecânico RGB'),
  ('Monitor LG 24"', 890.00, 'Monitor LG 24" Full HD IPS'),
  ('Webcam HD', 250.00, 'Webcam Full HD 1080p')
ON CONFLICT DO NOTHING;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Log de conclusão
DO $$
BEGIN
  RAISE NOTICE 'Tabela products criada com sucesso!';
END $$;
