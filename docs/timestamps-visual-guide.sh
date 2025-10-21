#!/bin/bash

# ====================================
# GUIA VISUAL: Timestamps e Soft Delete
# ====================================

echo "🎨 Demonstração de Timestamps e Soft Delete"
echo "==========================================="
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ====================================
# 1. MODELO COM TIMESTAMPS E SOFT DELETE
# ====================================
echo -e "${BLUE}📝 Modelo ProductModel${NC}"
echo "─────────────────────────"
cat << 'EOF'
@Entity('products')
@Timestamps()  ✅ created_at, updated_at
@SoftDelete()  ✅ deleted_at
export class ProductModel {
  @Id() id!: number;
  @Column(...) name!: string;
  @Column(...) price!: number;
  
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
EOF
echo ""
echo ""

# ====================================
# 2. OPERAÇÕES COM TIMESTAMPS
# ====================================
echo -e "${YELLOW}🔄 Operações com Timestamps${NC}"
echo "─────────────────────────────"
echo ""

echo -e "${GREEN}1. CREATE${NC} - Criar produto"
echo "────────────────────────"
cat << 'EOF'
const product = await repo.create({
  name: 'Notebook',
  price: 3000
});

📊 Resultado no Banco:
┌────┬──────────┬───────┬─────────────────────┬─────────────────────┬────────────┐
│ id │ name     │ price │ created_at          │ updated_at          │ deleted_at │
├────┼──────────┼───────┼─────────────────────┼─────────────────────┼────────────┤
│ 1  │ Notebook │ 3000  │ 2025-10-21 10:30:00 │ 2025-10-21 10:30:00 │ NULL       │
└────┴──────────┴───────┴─────────────────────┴─────────────────────┴────────────┘
                         ↑ AUTOMÁTICO!         ↑ AUTOMÁTICO!
EOF
echo ""
echo ""

echo -e "${GREEN}2. UPDATE${NC} - Atualizar produto"
echo "────────────────────────"
cat << 'EOF'
await repo.update(1, { price: 2800 });

📊 Resultado no Banco:
┌────┬──────────┬───────┬─────────────────────┬─────────────────────┬────────────┐
│ id │ name     │ price │ created_at          │ updated_at          │ deleted_at │
├────┼──────────┼───────┼─────────────────────┼─────────────────────┼────────────┤
│ 1  │ Notebook │ 2800  │ 2025-10-21 10:30:00 │ 2025-10-21 10:35:00 │ NULL       │
└────┴──────────┴───────┴─────────────────────┴─────────────────────┴────────────┘
                         (não muda)            ↑ ATUALIZADO!
EOF
echo ""
echo ""

# ====================================
# 3. SOFT DELETE
# ====================================
echo -e "${YELLOW}🗑️  Soft Delete em Ação${NC}"
echo "────────────────────────"
echo ""

echo -e "${RED}3. DELETE${NC} - Deletar produto (soft delete)"
echo "────────────────────────────────────"
cat << 'EOF'
await repo.delete(1);

📊 SQL Executado:
UPDATE products 
SET deleted_at = '2025-10-21 10:40:00', 
    updated_at = '2025-10-21 10:40:00'
WHERE id = 1;

📊 Resultado no Banco:
┌────┬──────────┬───────┬─────────────────────┬─────────────────────┬─────────────────────┐
│ id │ name     │ price │ created_at          │ updated_at          │ deleted_at          │
├────┼──────────┼───────┼─────────────────────┼─────────────────────┼─────────────────────┤
│ 1  │ Notebook │ 2800  │ 2025-10-21 10:30:00 │ 2025-10-21 10:40:00 │ 2025-10-21 10:40:00 │
└────┴──────────┴───────┴─────────────────────┴─────────────────────┴─────────────────────┘
                                                                       ↑ MARCADO COMO DELETADO!
EOF
echo ""
echo ""

echo -e "${BLUE}4. FIND${NC} - Buscar produto"
echo "───────────────────────"
cat << 'EOF'
const product = await repo.findById(1);

📊 SQL Executado:
SELECT * FROM products 
WHERE id = 1 
AND deleted_at IS NULL;  ← CONDIÇÃO AUTOMÁTICA!

📊 Resultado:
product = null  ❌ (foi deletado - não aparece nas queries!)
EOF
echo ""
echo ""

# ====================================
# 4. MÉTODOS ESPECIAIS
# ====================================
echo -e "${YELLOW}✨ Métodos Especiais${NC}"
echo "────────────────────"
echo ""

echo -e "${GREEN}5. FIND WITH DELETED${NC} - Buscar incluindo deletados"
echo "──────────────────────────────────────"
cat << 'EOF'
const all = await repo.findAllWithDeleted();

📊 SQL Executado:
SELECT * FROM products;  ← SEM filtro de deleted_at!

📊 Resultado:
[
  { 
    id: 1, 
    name: 'Notebook', 
    deleted_at: '2025-10-21 10:40:00'  ✅ Aparece!
  }
]
EOF
echo ""
echo ""

echo -e "${GREEN}6. RESTORE${NC} - Restaurar produto"
echo "─────────────────────"
cat << 'EOF'
await repo.restore(1);

📊 SQL Executado:
UPDATE products 
SET deleted_at = NULL, 
    updated_at = '2025-10-21 10:45:00'
WHERE id = 1 
AND deleted_at IS NOT NULL;

📊 Resultado no Banco:
┌────┬──────────┬───────┬─────────────────────┬─────────────────────┬────────────┐
│ id │ name     │ price │ created_at          │ updated_at          │ deleted_at │
├────┼──────────┼───────┼─────────────────────┼─────────────────────┼────────────┤
│ 1  │ Notebook │ 2800  │ 2025-10-21 10:30:00 │ 2025-10-21 10:45:00 │ NULL       │
└────┴──────────┴───────┴─────────────────────┴─────────────────────┴────────────┘
                                                                       ↑ RESTAURADO!
EOF
echo ""
echo ""

echo -e "${RED}7. FORCE DELETE${NC} - Delete físico"
echo "────────────────────────"
cat << 'EOF'
await repo.forceDelete(1);

📊 SQL Executado:
DELETE FROM products 
WHERE id = 1;  ← DELETE FÍSICO!

📊 Resultado no Banco:
┌────┬──────┬───────┬────────────┬────────────┬────────────┐
│ id │ name │ price │ created_at │ updated_at │ deleted_at │
├────┼──────┼───────┼────────────┼────────────┼────────────┤
│    │      │       │            │            │            │  ← LINHA REMOVIDA!
└────┴──────┴───────┴────────────┴────────────┴────────────┘
EOF
echo ""
echo ""

# ====================================
# 5. COMPARAÇÃO
# ====================================
echo -e "${YELLOW}📊 Comparação: Com vs Sem Soft Delete${NC}"
echo "──────────────────────────────────────"
echo ""

cat << 'EOF'
┌─────────────────┬────────────────────────┬────────────────────────┐
│ Operação        │ SEM @SoftDelete()      │ COM @SoftDelete()      │
├─────────────────┼────────────────────────┼────────────────────────┤
│ delete(id)      │ DELETE FROM...         │ UPDATE SET deleted_at  │
│                 │ ❌ Linha removida       │ ✅ Linha marcada        │
├─────────────────┼────────────────────────┼────────────────────────┤
│ findById(id)    │ SELECT * WHERE id = ?  │ SELECT * WHERE id = ?  │
│                 │ ✅ Encontra             │    AND deleted_at NULL │
│ (após delete)   │                        │ ❌ NÃO encontra         │
├─────────────────┼────────────────────────┼────────────────────────┤
│ restore(id)     │ ❌ Erro                 │ ✅ UPDATE deleted_at   │
│                 │ (não existe mais)      │ = NULL                 │
├─────────────────┼────────────────────────┼────────────────────────┤
│ forceDelete(id) │ DELETE FROM...         │ DELETE FROM...         │
│                 │ (mesma coisa)          │ (ignora soft delete)   │
└─────────────────┴────────────────────────┴────────────────────────┘
EOF
echo ""
echo ""

# ====================================
# 6. FLUXO VISUAL
# ====================================
echo -e "${BLUE}🔄 Fluxo de Vida de um Registro${NC}"
echo "───────────────────────────────"
echo ""

cat << 'EOF'
┌──────────────────────────────────────────────────────────────┐
│                    CICLO DE VIDA                             │
└──────────────────────────────────────────────────────────────┘

1. CRIAR
   ↓
   create({ name: 'Produto' })
   ↓
   ┌─────────────────────────────────────────┐
   │ id: 1                                   │
   │ name: 'Produto'                         │
   │ created_at: 2025-10-21 10:00:00  ✅     │
   │ updated_at: 2025-10-21 10:00:00  ✅     │
   │ deleted_at: NULL                        │
   └─────────────────────────────────────────┘

2. ATUALIZAR
   ↓
   update(1, { name: 'Produto Novo' })
   ↓
   ┌─────────────────────────────────────────┐
   │ id: 1                                   │
   │ name: 'Produto Novo'                    │
   │ created_at: 2025-10-21 10:00:00  (🔒)   │
   │ updated_at: 2025-10-21 10:15:00  ✅     │
   │ deleted_at: NULL                        │
   └─────────────────────────────────────────┘

3. DELETAR (SOFT DELETE)
   ↓
   delete(1)
   ↓
   ┌─────────────────────────────────────────┐
   │ id: 1                                   │
   │ name: 'Produto Novo'                    │
   │ created_at: 2025-10-21 10:00:00  (🔒)   │
   │ updated_at: 2025-10-21 10:30:00  ✅     │
   │ deleted_at: 2025-10-21 10:30:00  ✅     │
   └─────────────────────────────────────────┘
          ↓                    ↓
          ↓                    ↓
   findById(1)        findAllWithDeleted()
       = null ❌           = [produto] ✅

4. RESTAURAR
   ↓
   restore(1)
   ↓
   ┌─────────────────────────────────────────┐
   │ id: 1                                   │
   │ name: 'Produto Novo'                    │
   │ created_at: 2025-10-21 10:00:00  (🔒)   │
   │ updated_at: 2025-10-21 10:45:00  ✅     │
   │ deleted_at: NULL  ✅                    │
   └─────────────────────────────────────────┘
          ↓
   findById(1) = produto ✅

5. DELETE FÍSICO
   ↓
   forceDelete(1)
   ↓
   ❌ LINHA REMOVIDA DO BANCO
   ↓
   Impossível restaurar!
EOF
echo ""
echo ""

echo -e "${GREEN}✅ Demonstração concluída!${NC}"
echo ""
echo -e "${YELLOW}💡 Dicas:${NC}"
echo "   1. Use @Timestamps() em TODAS as entidades"
echo "   2. Use @SoftDelete() apenas quando necessário"
echo "   3. Use forceDelete() com cuidado"
echo "   4. Implemente limpeza periódica de registros antigos"
echo ""
