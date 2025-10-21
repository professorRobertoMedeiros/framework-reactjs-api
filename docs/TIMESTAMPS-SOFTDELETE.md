

# 🕐 Timestamps e Soft Delete - Guia Completo

## 📋 Visão Geral

Sistema de timestamps automáticos e soft delete para entidades do framework.

### ✨ Características

- ✅ **Timestamps Automáticos**: `created_at` e `updated_at` preenchidos automaticamente
- ✅ **Soft Delete**: Deletar logicamente ao invés de fisicamente
- ✅ **Configurável por Entidade**: Escolha quais entidades têm soft delete
- ✅ **Decorators Simples**: `@Timestamps()` e `@SoftDelete()`
- ✅ **Compatível com Repository**: Funciona automaticamente com BaseRepository
- ✅ **Queries Automáticas**: Registros deletados excluídos automaticamente

---

## 🎯 Decorators

### 1. @Timestamps()

Habilita timestamps automáticos (`created_at` e `updated_at`) na entidade.

**Campos adicionados:**
- `created_at`: Data de criação (preenchido no `create()`)
- `updated_at`: Data de atualização (preenchido no `create()` e `update()`)

**Uso:**
```typescript
@Entity('users')
@Timestamps()
export class UserModel extends BaseModel {
  @Id()
  id!: number;
  
  // ... outros campos ...
  
  created_at?: Date;  // Opcional: para documentação
  updated_at?: Date;  // Opcional: para documentação
}
```

**Nomes customizados:**
```typescript
@Timestamps({ 
  createdAt: 'criado_em', 
  updatedAt: 'atualizado_em' 
})
export class UserModel extends BaseModel {
  // ...
  criado_em?: Date;
  atualizado_em?: Date;
}
```

---

### 2. @SoftDelete()

Habilita soft delete (`deleted_at`) na entidade.

**Campo adicionado:**
- `deleted_at`: Data de exclusão lógica (preenchido no `delete()`)

**Comportamento:**
- `delete()` marca como deletado ao invés de remover fisicamente
- Registros deletados são **excluídos automaticamente** das queries
- Pode ser restaurado com `restore()`

**Uso:**
```typescript
@Entity('products')
@Timestamps()
@SoftDelete()
export class ProductModel extends BaseModel {
  @Id()
  id!: number;
  
  // ... outros campos ...
  
  deleted_at?: Date;  // Opcional: para documentação
}
```

**Nome customizado:**
```typescript
@SoftDelete({ deletedAt: 'excluido_em' })
export class ProductModel extends BaseModel {
  // ...
  excluido_em?: Date;
}
```

---

## 🔄 Comportamento Automático

### ✅ Com @Timestamps()

| Operação | created_at | updated_at |
|----------|------------|------------|
| `create()` | ✅ CURRENT_TIMESTAMP | ✅ CURRENT_TIMESTAMP |
| `update()` | ➖ Não muda | ✅ CURRENT_TIMESTAMP |
| `delete()` | ➖ Não muda | ➖ Não muda |

### ✅ Com @SoftDelete()

| Operação | Comportamento | deleted_at |
|----------|---------------|------------|
| `delete()` | **Soft delete** (UPDATE) | ✅ CURRENT_TIMESTAMP |
| `findAll()` | Exclui deletados | ❌ WHERE deleted_at IS NULL |
| `findById()` | Exclui deletados | ❌ WHERE deleted_at IS NULL |
| `restore()` | Restaura registro | ✅ NULL |
| `forceDelete()` | **Delete físico** | ➖ Linha removida |

### ❌ Sem @SoftDelete()

| Operação | Comportamento | deleted_at |
|----------|---------------|------------|
| `delete()` | **Delete físico** (DELETE) | ➖ Não existe |
| `findAll()` | Retorna todos | ➖ N/A |

---

## 💻 Exemplos Práticos

### Exemplo 1: Produto com Timestamps e Soft Delete

```typescript
import { BaseModel, Entity, Column, Id, Timestamps, SoftDelete } from 'framework-reactjs-api';

@Entity('products')
@Timestamps()  // ✅ Habilita created_at e updated_at
@SoftDelete()  // ✅ Habilita deleted_at
export class ProductModel extends BaseModel {
  @Id()
  id!: number;

  @Column({ type: 'VARCHAR', nullable: false, length: 255 })
  name!: string;

  @Column({ type: 'INT', nullable: false })
  price!: number;

  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
```

**Uso do Repository:**

```typescript
import { BaseRepository } from 'framework-reactjs-api';

class ProductRepository extends BaseRepository<ProductModel> {
  constructor() {
    super(ProductModel);
  }
}

const repo = new ProductRepository();

// ✅ Criar produto
const product = await repo.create({
  name: 'Notebook',
  price: 3000
});
// created_at: 2025-10-21T10:30:00Z
// updated_at: 2025-10-21T10:30:00Z
// deleted_at: null

// ✅ Atualizar produto
await repo.update(product.id, { price: 2800 });
// created_at: 2025-10-21T10:30:00Z (não muda)
// updated_at: 2025-10-21T10:35:00Z (atualizado!)
// deleted_at: null

// ✅ Deletar produto (soft delete)
await repo.delete(product.id);
// created_at: 2025-10-21T10:30:00Z
// updated_at: 2025-10-21T10:35:00Z
// deleted_at: 2025-10-21T10:40:00Z (marcado como deletado!)

// ❌ Buscar produto (não encontra - foi deletado)
const found = await repo.findById(product.id);
// found = null (excluído das queries automaticamente!)

// ✅ Buscar incluindo deletados
const all = await repo.findAllWithDeleted();
// all = [product com deleted_at preenchido]

// ✅ Restaurar produto
await repo.restore(product.id);
// deleted_at: null (restaurado!)

// ✅ Agora encontra novamente
const restored = await repo.findById(product.id);
// restored = product
```

---

### Exemplo 2: Categoria apenas com Timestamps (SEM Soft Delete)

```typescript
@Entity('categories')
@Timestamps()  // ✅ Habilita timestamps
// ❌ SEM @SoftDelete() - deletes são físicos
export class CategoryModel extends BaseModel {
  @Id()
  id!: number;

  @Column({ type: 'VARCHAR', nullable: false, length: 100 })
  name!: string;

  created_at?: Date;
  updated_at?: Date;
  // ❌ SEM deleted_at
}
```

**Uso do Repository:**

```typescript
class CategoryRepository extends BaseRepository<CategoryModel> {
  constructor() {
    super(CategoryModel);
  }
}

const repo = new CategoryRepository();

// ✅ Criar categoria
const category = await repo.create({
  name: 'Eletrônicos'
});
// created_at: 2025-10-21T10:30:00Z
// updated_at: 2025-10-21T10:30:00Z

// ✅ Deletar categoria (DELETE FÍSICO!)
await repo.delete(category.id);
// Linha REMOVIDA do banco de dados!

// ❌ Buscar categoria (não existe mais)
const found = await repo.findById(category.id);
// found = null

// ❌ Não pode restaurar (foi deletado fisicamente)
// await repo.restore(category.id);  // ERRO!
```

---

## 🔧 Métodos Adicionais do Repository

### `restore(id)` - Restaurar Soft Delete

Restaura um registro deletado (coloca `deleted_at` como `null`).

```typescript
// Deletar
await repo.delete(productId);  // deleted_at = CURRENT_TIMESTAMP

// Restaurar
await repo.restore(productId);  // deleted_at = null

// Buscar novamente
const product = await repo.findById(productId);  // Funciona!
```

**Lança erro se:**
- Entidade não tem `@SoftDelete()`

---

### `forceDelete(id)` - Delete Físico

Força exclusão física mesmo com soft delete habilitado.

```typescript
// Soft delete
await repo.delete(productId);  // deleted_at = CURRENT_TIMESTAMP

// Delete físico (remove do banco)
await repo.forceDelete(productId);  // Linha removida!

// Não pode restaurar
await repo.restore(productId);  // Falha - não existe mais
```

---

### `findDeleted(options?)` - Buscar Apenas Deletados

Retorna apenas registros deletados.

```typescript
// Buscar todos os produtos deletados
const deleted = await repo.findDeleted();

// Com filtros
const deleted = await repo.findDeleted({
  conditions: { category_id: 5 },
  limit: 10
});
```

**Lança erro se:**
- Entidade não tem `@SoftDelete()`

---

### `findAllWithDeleted(options?)` - Buscar Incluindo Deletados

Retorna todos os registros (incluindo deletados).

```typescript
// Buscar todos (incluindo deletados)
const all = await repo.findAllWithDeleted();

// Com filtros
const all = await repo.findAllWithDeleted({
  conditions: { active: true },
  limit: 20
});
```

---

### `forceDeleteBy(conditions)` - Delete Físico em Lote

Força exclusão física de múltiplos registros.

```typescript
// Delete físico de produtos inativos
await repo.forceDeleteBy({ active: false });
```

---

## 📊 Comparação de Comportamentos

| Método | Sem @SoftDelete | Com @SoftDelete |
|--------|-----------------|-----------------|
| `delete(id)` | DELETE FROM... | UPDATE SET deleted_at = NOW() |
| `findById(id)` | SELECT * WHERE id = ? | SELECT * WHERE id = ? AND deleted_at IS NULL |
| `findAll()` | SELECT * | SELECT * WHERE deleted_at IS NULL |
| `count()` | COUNT(*) | COUNT(*) WHERE deleted_at IS NULL |
| `restore(id)` | ❌ Erro | UPDATE SET deleted_at = NULL |
| `forceDelete(id)` | DELETE FROM... | DELETE FROM... |
| `findDeleted()` | ❌ Erro | SELECT * WHERE deleted_at IS NOT NULL |
| `findAllWithDeleted()` | SELECT * | SELECT * (sem filtro) |

---

## 🗄️ Migrations

### Adicionar Timestamps a Tabela Existente

```sql
-- Adicionar created_at
ALTER TABLE products ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Adicionar updated_at
ALTER TABLE products ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Trigger para updated_at automático
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Adicionar Soft Delete a Tabela Existente

```sql
-- Adicionar deleted_at
ALTER TABLE products ADD COLUMN deleted_at TIMESTAMP NULL;

-- Índice para performance
CREATE INDEX idx_products_deleted_at 
ON products(deleted_at) 
WHERE deleted_at IS NULL;
```

### Template para Novas Tabelas

```sql
CREATE TABLE example (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Soft delete (opcional)
  deleted_at TIMESTAMP NULL
);

-- Índice para soft delete
CREATE INDEX idx_example_deleted_at 
ON example(deleted_at) 
WHERE deleted_at IS NULL;

-- Trigger para updated_at
CREATE TRIGGER update_example_updated_at
    BEFORE UPDATE ON example
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 🎯 Boas Práticas

### ✅ Quando Usar @SoftDelete()

- ✅ Dados de clientes/usuários (conformidade LGPD/GDPR)
- ✅ Transações financeiras (auditoria)
- ✅ Histórico de vendas
- ✅ Dados que podem ser restaurados

### ❌ Quando NÃO Usar @SoftDelete()

- ❌ Tabelas temporárias
- ❌ Logs/eventos (use particionamento)
- ❌ Caches
- ❌ Dados que nunca devem ser restaurados

### 🔧 Manutenção

```typescript
// Limpar registros deletados há mais de 90 dias
const ninetyDaysAgo = new Date();
ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

const deleted = await repo.findDeleted();
for (const item of deleted) {
  if (item.deleted_at! < ninetyDaysAgo) {
    await repo.forceDelete(item.id);
  }
}
```

---

## ✅ Checklist

- [x] Decorators `@Timestamps()` e `@SoftDelete()` criados
- [x] BaseRepository atualizado com suporte automático
- [x] Métodos `restore()`, `forceDelete()`, `findDeleted()` implementados
- [x] Migration para tabelas existentes
- [x] Exemplos de modelos criados
- [x] Documentação completa
- [x] Exportações no index.ts

---

**Versão:** 1.0.2  
**Data:** Outubro 2025  
**Status:** ✅ Implementado e funcional
