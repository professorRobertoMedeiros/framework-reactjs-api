# Correção do Use Case User - Arquitetura de Delegação

## Comando Executado
```bash
rm -rf src/use-cases/user && npx framework-reactjs-api-scaffold User
```

## Problemas Encontrados no Código Gerado

### 1. UserRepository.ts
❌ **Problema**: Imports errados para código interno do framework
```typescript
import { BaseRepository } from 'framework-reactjs-api';
import { UserModel } from '@/models/UserModel';
```

✅ **Solução**: Usar imports relativos dentro do framework
```typescript
import { BaseRepository } from '../../../infra/repository/BaseRepository';
import { UserModel } from '../../../core/domain/models/UserModel';
```

### 2. UserBusiness.ts
❌ **Problema**: Classe standalone reimplementando todos os métodos CRUD
```typescript
export class UserBusiness {
  private userRepository: UserRepository;
  
  async getById(id: number) { /* reimplementa */ }
  async getAll() { /* reimplementa */ }
  async create(data) { /* reimplementa */ }
  // ... todos os métodos CRUD duplicados
}
```

✅ **Solução**: Herdar de `BaseBusiness` e delegar ao Repository
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
      // ... mapeamento de campos
    };
  }

  // Métodos CRUD (findById, findAll, create, update, delete, count)
  // são HERDADOS de BaseBusiness - NÃO reimplementar!

  // Adicionar APENAS métodos de negócio específicos:
  async findByEmail(email: string): Promise<UserDom | null> {
    const results = await this.findBy({ email });
    return results.length > 0 ? results[0] : null;
  }
}
```

### 3. UserService.ts
❌ **Problema**: Classe standalone reimplementando todos os métodos CRUD
```typescript
export class UserService {
  private userBusiness: UserBusiness;
  
  async findAll(options) { /* reimplementa */ }
  async findById(id) { /* reimplementa */ }
  async create(data) { /* reimplementa */ }
  // ... todos os métodos CRUD duplicados
}
```

✅ **Solução**: Herdar de `BaseService` e delegar ao Business
```typescript
export class UserService extends BaseService<UserModel, UserDom> {
  constructor() {
    const business = new UserBusiness();
    super(business);
  }

  // Métodos CRUD (findAll, findById, create, update, delete, count)
  // são HERDADOS de BaseService - NÃO reimplementar!
  // Retornam automaticamente: { status, data?, message? }

  // Adicionar APENAS métodos de serviço específicos:
  async findByEmail(email: string) {
    try {
      const business = this.business as UserBusiness;
      const user = await business.findByEmail(email);
      
      if (!user) {
        return { status: 404, message: 'Usuário não encontrado' };
      }

      return { status: 200, data: user };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }
}
```

### 4. UserRoutes.ts
❌ **Problema**: Passando `includes` como segundo parâmetro
```typescript
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const includes = req.query.includes ? String(req.query.includes).split(',') : undefined;
  
  const result = await service.findById(id, includes); // ❌ includes não existe mais
  
  return res.status(result.status).json(result);
});
```

✅ **Solução**: `findById` recebe apenas `id`
```typescript
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  
  const result = await service.findById(id); // ✅ apenas id
  
  return res.status(result.status).json(result);
});
```

## Resultado Final

### ✅ Arquivos Corretos
- **UserRepository.ts**: Imports relativos, extends BaseRepository
- **UserBusiness.ts**: Extends BaseBusiness, implementa apenas toDom() e métodos específicos
- **UserService.ts**: Extends BaseService, implementa apenas métodos específicos
- **UserRoutes.ts**: Chama service.findById(id) corretamente
- **UserDom.ts**: Interface de domínio (DTO)

### ✅ Compilação
```bash
npm run build
# ✅ Nenhum erro no use-case User!
```

### ✅ Fluxo de Execução (Arquitetura de Delegação)
```
Routes → Service (extends BaseService)
            ↓ delega
        Business (extends BaseBusiness)
            ↓ delega
        Repository (extends BaseRepository)
            ↓
         Database (CustomORM)
```

## Pendências

### ⚠️ Templates do Scaffold Precisam Ser Atualizados
Os templates em `src/infra/cli/usecase-scaffold.ts` ainda geram código standalone.

**Necessário**:
1. Atualizar `generateBusinessTemplate()` para gerar `extends BaseBusiness<Model, Dom>`
2. Atualizar `generateServiceTemplate()` para gerar `extends BaseService<Model, Dom>`
3. Atualizar `generateRoutesTemplate()` para não passar `includes` em `findById(id)`

### ⚠️ Use Cases Antigos Têm Erros
- `Cliente`, `Order` e `Product` usam a antiga assinatura de `BaseService`
- Precisam ser migrados para nova arquitetura ou removidos

## Comandos Úteis

```bash
# Recriar use-case com scaffold
npx framework-reactjs-api-scaffold User

# Compilar framework
npm run build

# Ver apenas erros de um use-case
npm run build 2>&1 | grep -i "user"
```

## Documentação Relacionada
- [ARQUITETURA-DELEGACAO.md](./ARQUITETURA-DELEGACAO.md) - Explicação completa da arquitetura
- [CORRECOES-SCAFFOLD.md](./CORRECOES-SCAFFOLD.md) - Histórico de correções do scaffold
- [MANUAL.md](./MANUAL.md) - Manual do framework
