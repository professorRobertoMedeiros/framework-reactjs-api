# RequestContext - Guia de Uso

## Introdução

O `RequestContext` usa `AsyncLocalStorage` do Node.js para manter um contexto isolado por requisição/operação. Isso permite que qualquer parte do código acesse o usuário autenticado sem passá-lo explicitamente.

## Casos de Uso

### 1️⃣ Aplicações Express (Produção)

Para aplicações web com Express, use os middlewares que inicializam o contexto automaticamente.

**Setup:**

```typescript
import express from 'express';
import { 
  requestContextMiddleware, 
  captureUserMiddleware,
  AuthMiddleware 
} from 'framework-reactjs-api';

const app = express();
const authMiddleware = new AuthMiddleware();

// ORDEM CRÍTICA DOS MIDDLEWARES:
app.use(requestContextMiddleware);  // 1. Inicializa AsyncLocalStorage
app.use(authMiddleware.authenticate()); // 2. Autentica e define req.user
app.use(captureUserMiddleware);     // 3. Captura req.user para o contexto

// Suas rotas aqui
app.use('/api', routes);
```

**Uso nas Rotas:**

```typescript
import { ClienteRepository } from './repositories/ClienteRepository';

// Controller
app.post('/clientes', async (req, res) => {
  // Repository pega usuário AUTOMATICAMENTE do RequestContext
  const repo = new ClienteRepository();
  
  const cliente = await repo.create(req.body);
  res.json({ success: true, data: cliente });
});
```

**Repository:**

```typescript
import { BaseRepository } from 'framework-reactjs-api';

export class ClienteRepository extends BaseRepository<ClienteModel> {
  constructor() {
    // currentUser vem automaticamente do RequestContext!
    super(ClienteModel, true);
  }
}
```

---

### 2️⃣ Scripts, Seeds e Testes (Uso Standalone)

Para scripts que rodam **fora** do Express (seeds, migrations, testes unitários, scripts CLI), você precisa inicializar o contexto manualmente.

**Forma Correta:**

```typescript
import { RequestContext } from 'framework-reactjs-api';
import { ClienteRepository } from './repositories/ClienteRepository';

async function seedDatabase() {
  // Envolver código em RequestContext.run()
  await RequestContext.run({ requestId: 'seed-001' }, async () => {
    // Definir usuário manualmente
    RequestContext.setCurrentUser({ 
      id: 1, 
      email: 'system@seed.com' 
    });

    // Agora o repository consegue pegar o usuário
    const repo = new ClienteRepository();
    
    await repo.create({ nome: 'Cliente 1', email: 'cliente1@test.com' });
    await repo.create({ nome: 'Cliente 2', email: 'cliente2@test.com' });
    
    console.log('✅ Seed concluído com auditoria!');
  });
}

seedDatabase().catch(console.error);
```

**❌ Forma INCORRETA (não funciona):**

```typescript
// ERRADO: Sem RequestContext.run()
async function seedDatabase() {
  RequestContext.setCurrentUser({ id: 1, email: 'system@seed.com' });
  
  const repo = new ClienteRepository();
  await repo.create({ ... }); // ❌ userId será undefined nos logs!
}
```

---

### 3️⃣ Testes Automatizados

Para testes (Jest, Mocha, etc), envolva cada caso de teste:

```typescript
import { RequestContext } from 'framework-reactjs-api';
import { ClienteRepository } from './repositories/ClienteRepository';

describe('ClienteRepository', () => {
  it('deve criar cliente com auditoria', async () => {
    // Cada teste precisa do próprio contexto
    await RequestContext.run({ requestId: 'test-001' }, async () => {
      RequestContext.setCurrentUser({ id: 1, email: 'test@example.com' });
      
      const repo = new ClienteRepository();
      const cliente = await repo.create({ 
        nome: 'Teste',
        email: 'teste@test.com' 
      });
      
      expect(cliente.id).toBeDefined();
      
      // Verificar audit log
      const logs = await getAuditLogs('clientes', cliente.id);
      expect(logs[0].useremail).toBe('test@example.com');
    });
  });
});
```

---

### 4️⃣ Workers e Background Jobs

Para workers (Bull, BullMQ, etc) que processam jobs em background:

```typescript
import { RequestContext } from 'framework-reactjs-api';

queue.process(async (job) => {
  // Cada job precisa do próprio contexto
  await RequestContext.run({ requestId: `job-${job.id}` }, async () => {
    // Usuário pode vir dos dados do job
    const user = job.data.user || { id: 0, email: 'system@worker.com' };
    RequestContext.setCurrentUser(user);
    
    // Processar job normalmente
    const repo = new ClienteRepository();
    await repo.update(job.data.clienteId, { status: 'processado' });
  });
});
```

---

## Anatomia do RequestContext.run()

```typescript
RequestContext.run(
  { requestId: 'unique-id' },  // Dados iniciais do contexto
  async () => {                 // Callback onde o contexto está ativo
    // Todo código aqui tem acesso ao contexto
    RequestContext.setCurrentUser({ id: 1, email: 'user@example.com' });
    
    const user = RequestContext.getCurrentUser();
    console.log(user); // { id: 1, email: 'user@example.com' }
    
    // Chamadas a repositories, services, etc funcionam
    await repo.create({ ... });
  }
);
```

---

## Métodos Disponíveis

```typescript
import { RequestContext } from 'framework-reactjs-api';

// Executar código dentro de um contexto
await RequestContext.run({ requestId: '123' }, async () => {
  // código aqui
});

// Obter usuário atual
const user = RequestContext.getCurrentUser();

// Definir usuário
RequestContext.setCurrentUser({ id: 1, email: 'user@example.com' });

// Verificar se há usuário
if (RequestContext.hasUser()) {
  console.log('Usuário autenticado');
}

// Obter ID da requisição
const reqId = RequestContext.getRequestId();

// Limpar contexto (raramente necessário)
RequestContext.clear();

// Obter/definir valores customizados
RequestContext.setValue('customKey', 'value');
const value = RequestContext.getValue('customKey');
```

---

## Troubleshooting

### ❌ "userId é undefined nos logs"

**Causa:** Código rodando fora de um contexto ativo.

**Solução:** 
- **Express:** Certifique-se que os middlewares estão na ordem correta
- **Scripts:** Envolva código em `RequestContext.run()`

### ❌ "Contexto compartilhado entre requisições"

**Causa:** Improvável, mas pode acontecer se você usar variáveis globais.

**Solução:** Sempre use `RequestContext.getCurrentUser()` em vez de armazenar em variável global.

### ❌ "Contexto perdido em callbacks"

**Causa:** `AsyncLocalStorage` perde contexto em alguns casos (setTimeout, setInterval sem await).

**Solução:** Use `await` ou `Promise` em vez de callbacks diretos.

---

## Comparação: Manual vs Automático

### Manual (passando currentUser):

```typescript
// Controller
const user = { id: req.user.id, email: req.user.email };
const service = new ClienteService(user);

// Service
class ClienteService {
  constructor(private user: AuditUser) {}
  
  async create(data: any) {
    const repo = new ClienteRepository(this.user);
    return repo.create(data);
  }
}
```

### Automático (RequestContext):

```typescript
// Controller
const service = new ClienteService();

// Service
class ClienteService {
  async create(data: any) {
    const repo = new ClienteRepository(); // Pega user do contexto!
    return repo.create(data);
  }
}
```

---

## Boas Práticas

✅ **Use middlewares para Express** - Deixe o framework gerenciar o contexto  
✅ **Use RequestContext.run() para scripts** - Garante isolamento correto  
✅ **Um contexto por operação** - Cada job/request tem seu próprio contexto  
✅ **Defina usuário logo no início** - No middleware ou início do script  
✅ **Não armazene contexto em variáveis** - Sempre use `RequestContext.getCurrentUser()`  

❌ **Não use variáveis globais** - Vai vazar entre requisições  
❌ **Não reutilize contextos** - Cada operação precisa do seu  
❌ **Não confie em ordem de execução** - AsyncLocalStorage é isolado por fluxo async  

---

## Exemplo Completo

Veja `examples/context-example/` para uma aplicação completa funcionando.
