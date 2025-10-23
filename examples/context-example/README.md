# Exemplo de Request Context

Este exemplo demonstra o uso do **RequestContext** para propagação automática do usuário autenticado através da aplicação, eliminando a necessidade de passar manualmente `currentUser` para cada repository.

## Conceito

Similar ao `SecurityContextHolder` do Spring Security (Java), o `RequestContext` usa `AsyncLocalStorage` do Node.js para manter um contexto isolado por requisição, permitindo que qualquer parte da aplicação acesse o usuário autenticado sem passá-lo explicitamente.

## Estrutura

```
src/
├── index.ts              # Configuração do servidor Express
├── models/
│   └── ProductModel.ts   # Modelo com auditoria habilitada
├── repositories/
│   └── ProductRepository.ts  # Repository com auditoria automática
├── services/
│   └── ProductService.ts     # Service layer
└── controllers/
    └── ProductController.ts  # Controller
```

## Como Funciona

### 1. Middleware Setup

```typescript
// O middleware requestContextMiddleware DEVE ser o primeiro
app.use(requestContextMiddleware);

// Depois vem o middleware de autenticação
app.use(authMiddleware.authenticate());

// O captureUserMiddleware captura req.user e coloca no contexto
app.use(captureUserMiddleware);
```

### 2. Repository Automático

```typescript
// ANTES: Precisava passar currentUser manualmente
const repo = new ProductRepository(ProductModel, true, currentUser);

// AGORA: O repository busca automaticamente do RequestContext
const repo = new ProductRepository(ProductModel, true);
```

### 3. Auditoria Automática

Quando você cria ou atualiza um registro:

```typescript
// No controller/service, apenas use o repository normalmente
const product = await productRepo.create({
  name: 'Produto Teste',
  price: 99.90
});

// O usuário autenticado é capturado AUTOMATICAMENTE do RequestContext
// Os logs de auditoria são criados com userid e useremail corretos
```

## Ordem dos Middlewares

É **CRÍTICO** manter esta ordem:

1. **requestContextMiddleware** - Inicializa o contexto AsyncLocalStorage
2. **authMiddleware** - Autentica e define req.user
3. **captureUserMiddleware** - Captura req.user para o RequestContext
4. **Rotas da aplicação** - Podem acessar RequestContext.getCurrentUser()

## Alternativa: Middleware Combinado

Se preferir simplicidade:

```typescript
// Ordem simplificada
app.use(authMiddleware.authenticate());
app.use(requestContextWithUserMiddleware); // Combina contexto + captura
app.use('/api', routes);
```

## Benefícios

✅ **Menos Boilerplate**: Não precisa passar `currentUser` em cada camada  
✅ **Type-Safe**: TypeScript garante tipos corretos  
✅ **Isolado por Request**: AsyncLocalStorage garante isolamento entre requisições concorrentes  
✅ **Familiar**: Padrão similar ao Spring Security (Java)  
✅ **Auditoria Automática**: Logs de auditoria sem código extra  

## Testando

```bash
# 1. Instalar dependências
cd examples/context-example
npm install

# 2. Iniciar PostgreSQL
docker-compose up -d

# 3. Rodar migrations
npm run migrate

# 4. (Opcional) Rodar seed de produtos
npx ts-node seeds/products.seed.ts

# 5. Iniciar servidor
npm run dev

# 6. Testar endpoints
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"senha123"}'

# Criar produto (usa contexto automático)
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Notebook","price":2999.90}'

# Verificar audit logs
SELECT * FROM audit_logs ORDER BY createdat DESC;
```

## Comparação: Antes vs Depois

### ANTES (Manual)

```typescript
// Controller
async createProduct(req: Request, res: Response) {
  const currentUser = { id: req.user.id, email: req.user.email };
  const service = new ProductService(currentUser);
  const product = await service.create(req.body);
  res.json(product);
}

// Service
class ProductService {
  constructor(private currentUser: AuditUser) {}
  
  async create(data: any) {
    const repo = new ProductRepository(ProductModel, true, this.currentUser);
    return repo.create(data);
  }
}
```

### DEPOIS (Automático)

```typescript
// Controller
async createProduct(req: Request, res: Response) {
  const service = new ProductService();
  const product = await service.create(req.body);
  res.json(product);
}

// Service
class ProductService {
  async create(data: any) {
    const repo = new ProductRepository(ProductModel, true); // currentUser automático!
    return repo.create(data);
  }
}
```

## Notas Importantes

- **AsyncLocalStorage** funciona perfeitamente com async/await
- Cada requisição HTTP tem seu próprio contexto isolado
- Se não houver usuário autenticado, `RequestContext.getCurrentUser()` retorna `undefined`
- Você ainda pode passar `currentUser` explicitamente se quiser sobrescrever

## Scripts e Seeds

Para scripts que rodam **fora** do Express (seeds, migrations, testes), você **DEVE** usar `RequestContext.run()` manualmente:

```typescript
import { RequestContext } from 'framework-reactjs-api';

async function seed() {
  await initializeORM();
  
  // CRÍTICO: Envolver em RequestContext.run()
  await RequestContext.run({ requestId: 'seed-001' }, async () => {
    RequestContext.setCurrentUser({ id: 0, email: 'system@seed.com' });
    
    const repo = new ProductRepository(ProductModel, true);
    await repo.create({ name: 'Produto', price: 99.90 });
  });
}
```

**Exemplo de seed:** Veja `seeds/products.seed.ts` para um exemplo completo.

**Por que?** Porque não há middlewares Express executando para inicializar o `AsyncLocalStorage` automaticamente.
