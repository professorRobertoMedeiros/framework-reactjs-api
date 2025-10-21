# 🔍 Query Options - Consultas Avançadas Simplificadas

## 📋 Visão Geral

O `BaseRepository` agora suporta **consultas avançadas simplificadas** através da interface `QueryOptions`, que unifica:

- ✅ **Conditions** - Filtros dinâmicos por qualquer campo
- ✅ **Pagination** - Paginação com `page`/`limit` ou `offset`/`limit`
- ✅ **Ordering** - Ordenação por qualquer campo
- ✅ **Includes** - Relacionamentos (preparado para futuro)

## 🎯 Interface QueryOptions

```typescript
interface QueryOptions {
  conditions?: Record<string, any>;  // Filtros dinâmicos
  includes?: string[];               // Relacionamentos
  limit?: number;                    // Limite de registros
  offset?: number;                   // Offset para paginação
  page?: number;                     // Número da página (alternativa ao offset)
  orderBy?: string;                  // Campo para ordenação
}
```

## 🚀 Uso Simplificado nas Rotas

### ❌ Antes (Parsing manual)

```typescript
router.get('/', async (req: Request, res: Response) => {
  const { limit, offset, orderBy, ...conditions } = req.query;
  
  const result = await service.findAll({
    conditions: Object.keys(conditions).length > 0 ? conditions as Record<string, any> : undefined,
    limit: limit ? Number(limit) : undefined,
    offset: offset ? Number(offset) : undefined,
    orderBy: orderBy as string,
    includes: req.query.includes ? String(req.query.includes).split(',') : undefined,
  });

  return res.status(result.status).json(result);
});
```

### ✅ Agora (Automático)

```typescript
router.get('/', async (req: Request, res: Response) => {
  const { limit, offset, page, orderBy, includes, ...conditions } = req.query;
  
  // BaseRepository trata tudo automaticamente!
  const result = await service.findAll({
    conditions: Object.keys(conditions).length > 0 ? conditions as Record<string, any> : undefined,
    limit: limit ? Number(limit) : undefined,
    offset: offset ? Number(offset) : undefined,
    page: page ? Number(page) : undefined,
    orderBy: orderBy as string,
    includes: includes ? String(includes).split(',') : undefined,
  });

  return res.status(result.status).json(result);
});
```

## 📊 Exemplos de Requisições

### 1. Listagem Simples

```bash
GET /api/produtos
```

**Retorna:** Todos os produtos (com limite padrão de 10)

### 2. Filtro por Condições

```bash
GET /api/produtos?ativo=true&categoria=eletrônicos
```

**Retorna:** Produtos ativos da categoria eletrônicos

### 3. Paginação com Page

```bash
GET /api/produtos?page=2&limit=20
```

**Retorna:** Página 2 com 20 produtos por página

### 4. Paginação com Offset

```bash
GET /api/produtos?offset=40&limit=20
```

**Retorna:** 20 produtos pulando os primeiros 40

### 5. Ordenação

```bash
GET /api/produtos?orderBy=preco DESC
```

**Retorna:** Produtos ordenados por preço decrescente

### 6. Filtro + Paginação + Ordenação

```bash
GET /api/produtos?ativo=true&page=1&limit=10&orderBy=nome ASC
```

**Retorna:** 10 produtos ativos da primeira página ordenados por nome

### 7. Includes (Relacionamentos)

```bash
GET /api/produtos?includes=categoria,fornecedor
```

**Retorna:** Produtos com categoria e fornecedor incluídos (quando implementado)

### 8. Consulta Completa

```bash
GET /api/produtos?ativo=true&categoria=eletrônicos&page=2&limit=20&orderBy=preco DESC&includes=categoria
```

**Retorna:** 
- Produtos ativos
- Categoria eletrônicos
- Página 2 (20 produtos)
- Ordenados por preço decrescente
- Com categoria incluída

## 🔧 Novos Métodos do BaseRepository

### 1. `findAll(options?: QueryOptions)`

Busca todos os registros com opções avançadas:

```typescript
// Sem filtros
const produtos = await produtoRepo.findAll();

// Com condições
const produtos = await produtoRepo.findAll({
  conditions: { ativo: true, categoria: 'eletrônicos' }
});

// Com paginação
const produtos = await produtoRepo.findAll({
  page: 1,
  limit: 20,
  orderBy: 'preco DESC'
});

// Completo
const produtos = await produtoRepo.findAll({
  conditions: { ativo: true },
  page: 1,
  limit: 20,
  orderBy: 'nome ASC',
  includes: ['categoria', 'fornecedor']
});
```

### 2. `findAllPaginated(options?: QueryOptions)`

Retorna resultado paginado com metadata:

```typescript
const result = await produtoRepo.findAllPaginated({
  conditions: { ativo: true },
  page: 2,
  limit: 10,
  orderBy: 'nome ASC'
});

// Resultado:
{
  data: [...produtos],
  pagination: {
    total: 150,
    page: 2,
    limit: 10,
    totalPages: 15,
    hasNextPage: true,
    hasPreviousPage: true
  }
}
```

### 3. `updateBy(conditions, data)`

Atualiza múltiplos registros por condições:

```typescript
// Desativar produtos de uma categoria
const count = await produtoRepo.updateBy(
  { categoria: 'obsoleto' },
  { ativo: false }
);

console.log(`${count} produtos foram desativados`);
```

### 4. `deleteBy(conditions)`

Deleta múltiplos registros por condições:

```typescript
// Deletar produtos inativos
const count = await produtoRepo.deleteBy({ ativo: false });

console.log(`${count} produtos foram deletados`);

// SEGURANÇA: Requer ao menos uma condição
// await repo.deleteBy({}); // ❌ ERRO: Evita exclusão acidental
```

### 5. `findById(id, includes?)`

Busca por ID com relacionamentos opcionais:

```typescript
// Sem includes
const produto = await produtoRepo.findById(1);

// Com includes
const produto = await produtoRepo.findById(1, ['categoria', 'fornecedor']);
```

### 6. `findOneBy(conditions, includes?)`

Busca um único registro por condições:

```typescript
// Sem includes
const produto = await produtoRepo.findOneBy({ codigo: 'ABC123' });

// Com includes
const produto = await produtoRepo.findOneBy(
  { codigo: 'ABC123' },
  ['categoria']
);
```

## 📦 Uso no Service Layer

O `BaseService` já está integrado com `QueryOptions`:

```typescript
export class ProdutoService extends BaseService<ProdutoModel, ProdutoDom> {
  constructor() {
    const repository = new ProdutoRepository();
    const business = new ProdutoBusiness(repository);
    super(business);
  }

  // Método customizado usando QueryOptions
  async buscarAtivos(options?: QueryOptions): Promise<ServiceResponse<ProdutoDom[]>> {
    return this.findAll({
      conditions: { ativo: true },
      ...options
    });
  }
}
```

**Uso:**
```typescript
const service = new ProdutoService();

// Buscar produtos ativos paginados
const result = await service.buscarAtivos({
  page: 1,
  limit: 20,
  orderBy: 'nome ASC'
});
```

## 🎨 Templates Atualizados

O `scaffold` agora gera rotas com suporte completo a `QueryOptions`:

```bash
npx framework-reactjs-api-scaffold Produto
```

**Gera rotas com:**
- ✅ Parsing automático de query params
- ✅ Condições dinâmicas
- ✅ Paginação (page ou offset)
- ✅ Ordenação
- ✅ Includes

## 🔒 Segurança

### Validação de Condições

```typescript
// ✅ Bom: Validar inputs antes de passar para o repository
const conditions: Record<string, any> = {};

if (req.query.categoria) {
  conditions.categoria = String(req.query.categoria);
}

if (req.query.ativo) {
  conditions.ativo = req.query.ativo === 'true';
}

const result = await service.findAll({ conditions });
```

### Proteção contra Exclusão em Massa

```typescript
// ❌ ERRO: deleteBy requer condições
try {
  await repo.deleteBy({});
} catch (error) {
  console.error(error.message);
  // "deleteBy requer ao menos uma condição para evitar exclusão acidental"
}

// ✅ OK: Com condições
await repo.deleteBy({ ativo: false });
```

## 📊 Comparação: Antes vs Agora

| Recurso | Antes | Agora |
|---------|-------|-------|
| **Filtros** | Manual na rota | ✅ Automático via QueryOptions |
| **Paginação** | Manual na rota | ✅ Automático (page ou offset) |
| **Ordenação** | Manual na rota | ✅ Automático via orderBy |
| **Includes** | ❌ Não suportado | ✅ Preparado (includes[]) |
| **Update em massa** | ❌ Não suportado | ✅ updateBy(conditions, data) |
| **Delete em massa** | ❌ Não suportado | ✅ deleteBy(conditions) |
| **Código na rota** | ~20 linhas | ~10 linhas |

## 🚀 Migração de Código Existente

### Rotas Antigas

Se você tem rotas antigas com parsing manual:

```typescript
// ❌ Antes
const { limit, offset, orderBy, ...conditions } = req.query;
const result = await service.findAll({
  conditions: Object.keys(conditions).length > 0 ? conditions : undefined,
  limit: limit ? Number(limit) : undefined,
  // ... mais parsing manual
});
```

### Atualizar para Novo Padrão

```typescript
// ✅ Agora
const { limit, offset, page, orderBy, includes, ...conditions } = req.query;
const result = await service.findAll({
  conditions: Object.keys(conditions).length > 0 ? conditions as Record<string, any> : undefined,
  limit: limit ? Number(limit) : undefined,
  offset: offset ? Number(offset) : undefined,
  page: page ? Number(page) : undefined,
  orderBy: orderBy as string,
  includes: includes ? String(includes).split(',') : undefined,
});
```

**Ou simplesmente regenere o use case:**

```bash
npx framework-reactjs-api-scaffold Produto
```

## 📝 Notas Técnicas

### Page vs Offset

- **page**: Mais intuitivo para usuários (página 1, 2, 3...)
- **offset**: Mais flexível para paginação customizada

```typescript
// Page-based (automático)
{ page: 2, limit: 10 } // offset = (2-1) * 10 = 10

// Offset-based (manual)
{ offset: 10, limit: 10 } // Pula 10 registros
```

### Precedência

Se `offset` e `page` forem fornecidos, `offset` tem precedência:

```typescript
{
  page: 2,    // Ignorado
  offset: 30, // ✅ Usado
  limit: 10
}
```

### Includes (Futuro)

O campo `includes` está preparado para suportar relacionamentos quando o ORM for estendido:

```typescript
// TODO: Implementar no CustomORM
const produto = await repo.findById(1, ['categoria', 'fornecedor']);

// Resultado esperado:
{
  id: 1,
  nome: 'Notebook',
  categoria: { id: 5, nome: 'Eletrônicos' },
  fornecedor: { id: 10, nome: 'Tech Corp' }
}
```

## ✅ Checklist de Implementação

- [x] Interface `QueryOptions` criada
- [x] `BaseRepository.findAll()` atualizado
- [x] `BaseRepository.findAllPaginated()` atualizado
- [x] `BaseRepository.updateBy()` implementado
- [x] `BaseRepository.deleteBy()` implementado
- [x] `BaseRepository.findById()` com includes
- [x] `BaseRepository.findOneBy()` com includes
- [x] Exports atualizados em `index.ts`
- [x] Template de rotas atualizado
- [x] Compilação sem erros
- [ ] Testes unitários (futuro)
- [ ] Implementação de includes no ORM (futuro)

---

**Versão:** 1.0.1  
**Data:** Outubro 2025  
**Status:** ✅ Implementado
