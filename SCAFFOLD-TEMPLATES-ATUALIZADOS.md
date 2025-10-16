# Atualização dos Templates do Scaffold - Arquitetura de Delegação

## ✅ CONCLUÍDO - 16/10/2025

## Objetivo
Atualizar os templates do comando `npx framework-reactjs-api-scaffold <ModelName>` para gerar código com a **arquitetura de delegação** correta, tanto para uso **interno** (dentro do próprio framework) quanto para uso **externo** (em projetos que consomem o framework).

## Alterações Implementadas

### 1. Detecção Automática de Contexto

Adicionada função `isInsideFramework()` que detecta automaticamente se o scaffold está sendo executado:
- **Dentro do framework** (`package.json` com `name: "framework-reactjs-api"`)
- **Em um projeto externo** (qualquer outro projeto)

```typescript
function isInsideFramework(): boolean {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.name === 'framework-reactjs-api';
  }
  return false;
}
```

### 2. Repository Template Atualizado

**Imports Dinâmicos:**
- **Interno**: `import { BaseRepository } from '../../../infra/repository/BaseRepository';`
- **Externo**: `import { BaseRepository } from 'framework-reactjs-api';`

**Código Gerado:**
```typescript
export class UserRepository extends BaseRepository<UserModel> {
  constructor() {
    super(UserModel);
  }

  protected mapToModel(data: any): UserModel {
    const item = new UserModel();
    Object.assign(item, data);
    return item;
  }

  async findByConditions(
    conditions: Record<string, any>,
    options?: { limit?: number; offset?: number; includes?: string[]; orderBy?: string }
  ): Promise<UserModel[]> {
    return this.findBy(conditions, options);
  }
}
```

### 3. Business Template Atualizado

**Nova Arquitetura:**
- ✅ Herda de `BaseBusiness<TModel, TDom>`
- ✅ Implementa apenas `toDom()` (obrigatório) e `fromCreateData()` (opcional)
- ✅ **NÃO reimplementa** métodos CRUD (herdados)
- ✅ Comentário de exemplo para métodos específicos

**Imports Dinâmicos:**
- **Interno**: `import { BaseBusiness } from '../../core/business/BaseBusiness';`
- **Externo**: `import { BaseBusiness } from 'framework-reactjs-api';`

**Código Gerado:**
```typescript
export class UserBusiness extends BaseBusiness<UserModel, UserDom> {
  constructor() {
    const repository = new UserRepository();
    super(repository);
  }

  protected toDom(model: UserModel): UserDom {
    return {
      id: model.id,
      first_name: model.first_name,
      // ... todas as propriedades auto-mapeadas
    };
  }

  protected fromCreateData(data: any): Omit<UserModel, 'id'> {
    // TODO: Adicione validações e transformações de negócio aqui
    return data as Omit<UserModel, 'id'>;
  }

  // Métodos CRUD herdados: findById, findAll, findBy, create, update, delete, count
  // NÃO reimplementar!

  // Exemplo comentado de método específico
}
```

### 4. Service Template Atualizado

**Nova Arquitetura:**
- ✅ Herda de `BaseService<TModel, TDom>`
- ✅ **NÃO reimplementa** métodos CRUD (herdados)
- ✅ Métodos CRUD retornam automaticamente `{ status, data?, message? }`
- ✅ Comentário de exemplo para métodos específicos

**Imports Dinâmicos:**
- **Interno**: `import { BaseService } from '../../core/services/BaseService';`
- **Externo**: `import { BaseService } from 'framework-reactjs-api';`

**Código Gerado:**
```typescript
export class UserService extends BaseService<UserModel, UserDom> {
  constructor() {
    const business = new UserBusiness();
    super(business);
  }

  // Métodos CRUD herdados: findAll, findById, findBy, create, update, delete, count
  // NÃO reimplementar!
  // Retornam automaticamente: { status, data?, message? }

  // Exemplo comentado de método específico
}
```

### 5. Domain (Dom) Template Simplificado

**Antes**: Gerava 3 interfaces (`CreateDom`, `UpdateDom`, `Dom`)
**Agora**: Gera apenas 1 interface (`Dom`)

```typescript
export interface UserDom {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  active: boolean;
  created_at: Date;
  updated_at?: Date;
}
```

### 6. Routes Template Atualizado

**Correção:**
- ✅ `findById(id)` não recebe mais `includes` como segundo parâmetro
- ✅ `includes` removido da rota `GET /:id`

**Antes:**
```typescript
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const includes = req.query.includes?.split(',');
  const result = await service.findById(id, includes); // ❌ erro
  return res.status(result.status).json(result);
});
```

**Agora:**
```typescript
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const result = await service.findById(id); // ✅ correto
  return res.status(result.status).json(result);
});
```

## Fluxo de Delegação Gerado

```
Routes
  ↓
Service (extends BaseService)
  ↓ delega automaticamente
Business (extends BaseBusiness)
  ↓ delega automaticamente
Repository (extends BaseRepository)
  ↓
Database (CustomORM)
```

## Comandos de Teste

### Dentro do Framework (Interno)
```bash
# Gerar use-case
npx framework-reactjs-api-scaffold User

# Compilar
npm run build

# ✅ Resultado: Imports relativos corretos
# import { BaseBusiness } from '../../core/business/BaseBusiness';
# import { UserModel } from '../../core/domain/models/UserModel';
```

### Em Projeto Externo
```bash
# Gerar use-case
npx framework-reactjs-api-scaffold Product

# Compilar
npm run build

# ✅ Resultado: Imports com path aliases
# import { BaseBusiness } from 'framework-reactjs-api';
# import { ProductModel } from '@/models/ProductModel';
```

## Benefícios

### ✅ DRY (Don't Repeat Yourself)
- CRUD implementado **uma vez** em `BaseRepository`
- **Herdado** por Business e Service
- Desenvolvedor adiciona **apenas** lógica específica

### ✅ Manutenibilidade
- Correções/melhorias no CRUD impactam **todos** os use-cases automaticamente
- Menos código = menos bugs

### ✅ Padronização
- Todos os use-cases seguem a **mesma arquitetura**
- Respostas consistentes: `{ status, data?, message? }`

### ✅ Flexibilidade
- **Context-aware**: Detecta automaticamente se é interno ou externo
- Imports corretos para cada contexto

## Arquivos Modificados

1. `/src/infra/cli/usecase-scaffold.ts`
   - Adicionada função `isInsideFramework()`
   - Atualizado `generateRepositoryTemplate()`
   - Atualizado `generateBusinessTemplate()`
   - Atualizado `generateServiceTemplate()`
   - Simplificado `generateDomainTemplate()`
   - Corrigido `generateRoutesTemplate()`

2. `/src/index.ts`
   - Removidas exportações de use-cases antigos (Product, Cliente, Order)
   - Mantida apenas exportação de User (exemplo)
   - Removidos `CreateUserDom` e `UpdateUserDom` (interfaces obsoletas)

3. `/src/use-cases/user/*` (Regenerado)
   - UserRepository.ts com imports relativos
   - UserBusiness.ts herdando de BaseBusiness
   - UserService.ts herdando de BaseService
   - UserDom.ts simplificado (apenas uma interface)
   - UserRoutes.ts corrigidas (findById sem includes)

## Compilação

```bash
npm run build
# ✅ Sem erros TypeScript!
```

## Próximos Passos (Opcional)

1. **Migrar use-cases antigos** (Cliente, Order, Product) para nova arquitetura ou removê-los
2. **Documentar** no README como criar use-cases personalizados
3. **Adicionar** testes automatizados para os templates
4. **Criar** vídeo/tutorial de como usar o scaffold

## Documentação Relacionada

- [ARQUITETURA-DELEGACAO.md](./ARQUITETURA-DELEGACAO.md) - Explicação completa da arquitetura
- [CORRECAO-USER-USECASE.md](./CORRECAO-USER-USECASE.md) - Correção manual do User
- [CORRECOES-SCAFFOLD.md](./CORRECOES-SCAFFOLD.md) - Histórico de correções
- [MANUAL.md](./MANUAL.md) - Manual do framework
- [README.md](./README.md) - Documentação principal

## Exemplo de Uso Completo

### 1. Criar Modelo
```typescript
// src/core/domain/models/TaskModel.ts
export class TaskModel extends BaseModel {
  id!: number;
  title!: string;
  description?: string;
  completed!: boolean;
  created_at!: Date;
  updated_at?: Date;
}
```

### 2. Gerar Scaffold
```bash
npx framework-reactjs-api-scaffold Task
```

### 3. Adicionar Lógica Específica (Opcional)

**TaskBusiness.ts:**
```typescript
async findPending(): Promise<TaskDom[]> {
  return await this.findBy({ completed: false });
}
```

**TaskService.ts:**
```typescript
async findPending() {
  try {
    const business = this.business as TaskBusiness;
    const tasks = await business.findPending();
    return { status: 200, data: tasks };
  } catch (error: any) {
    return { status: 500, message: error.message };
  }
}
```

### 4. Usar nas Rotas
```typescript
// Rotas CRUD já funcionam automaticamente!
// GET /task - findAll
// GET /task/:id - findById
// POST /task - create
// PUT /task/:id - update
// DELETE /task/:id - delete
// GET /task/count - count

// Adicionar rota customizada
router.get('/pending', async (req, res) => {
  const result = await service.findPending();
  return res.status(result.status).json(result);
});
```

## Conclusão

✅ **Templates atualizados com sucesso!**
✅ **Arquitetura de delegação implementada!**
✅ **Context-aware (interno vs externo)!**
✅ **Compilação sem erros!**
✅ **Pronto para uso em projetos!**

O scaffold agora gera código **limpo**, **eficiente** e **padronizado**, seguindo o princípio DRY e facilitando a manutenção do código.
