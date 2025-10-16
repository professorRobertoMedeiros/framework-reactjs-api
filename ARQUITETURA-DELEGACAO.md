# Nova Arquitetura - Delegação de Responsabilidades

## Data: 14 de Outubro de 2025

---

## 🎯 Objetivo

Implementar uma arquitetura onde cada camada **delega** para a camada inferior, sem reimplementar métodos CRUD básicos.

---

## 📋 Arquitetura

```
Routes (HTTP Layer)
    ↓ delega para
Service (Application Layer) 
    ↓ delega para  
Business (Domain Layer)
    ↓ delega para
Repository (Data Layer)
```

---

## 🔧 Implementação

### 1. **Repository** - Camada de Dados

Implementa CRUD básico e acesso ao banco de dados.

```typescript
export class UserRepository extends BaseRepository<UserModel> {
  constructor() {
    super(UserModel);
  }

  // Métodos CRUD já implementados no BaseRepository:
  // - findById(id)
  // - findBy(conditions, options)
  // - create(data)
  // - update(id, data)
  // - delete(id)
  // - count(conditions)
  
  // Adicione apenas métodos específicos de acesso a dados
}
```

---

### 2. **Business** - Camada de Negócio

**Herda de `BaseBusiness`** e delega CRUD para o Repository.

Adicione apenas regras de negócio específicas.

```typescript
import { BaseBusiness } from 'framework-reactjs-api';
import { UserModel } from '@/models/UserModel';
import { UserRepository } from './repository/UserRepository';
import { UserDom } from './domains/UserDom';

export class UserBusiness extends BaseBusiness<UserModel, UserDom> {
  constructor() {
    const repository = new UserRepository();
    super(repository);
  }

  /**
   * Converter modelo para Dom (DTO)
   * OBRIGATÓRIO: Implementar transformação de dados
   */
  protected toDom(model: UserModel): UserDom {
    return {
      id: model.id,
      first_name: model.first_name,
      last_name: model.last_name,
      email: model.email,
      // ... outras propriedades
    };
  }

  /**
   * Converter dados de entrada para modelo (OPCIONAL)
   * Sobrescrever apenas se precisar de validações/transformações
   */
  protected fromCreateData(data: any): Omit<UserModel, 'id'> {
    // Validações de negócio
    if (!data.email || !this.isValidEmail(data.email)) {
      throw new Error('Email inválido');
    }
    
    return data as Omit<UserModel, 'id'>;
  }

  // ✅ Métodos CRUD são HERDADOS de BaseBusiness:
  // - findById(id): Promise<UserDom | null>
  // - findAll(options): Promise<UserDom[]>
  // - findBy(conditions, options): Promise<UserDom[]>
  // - create(data): Promise<UserDom>
  // - update(id, data): Promise<UserDom | null>
  // - delete(id): Promise<boolean>
  // - count(conditions): Promise<number>

  // ❌ NÃO REIMPLEMENTAR MÉTODOS CRUD!

  // ✅ Adicione apenas métodos de negócio específicos:
  
  async findByEmail(email: string): Promise<UserDom | null> {
    const results = await this.findBy({ email });
    return results.length > 0 ? results[0] : null;
  }

  async findActive(): Promise<UserDom[]> {
    return await this.findBy({ active: true });
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
```

---

### 3. **Service** - Camada de Aplicação

**Herda de `BaseService`** e delega para o Business.

Adiciona apenas tratamento de erros e resposta HTTP padronizada.

```typescript
import { BaseService, ServiceResponse } from 'framework-reactjs-api';
import { UserBusiness } from './UserBusiness';
import { UserModel } from '@/models/UserModel';
import { UserDom } from './domains/UserDom';

export class UserService extends BaseService<UserModel, UserDom> {
  constructor() {
    const business = new UserBusiness();
    super(business);
  }

  // ✅ Métodos CRUD são HERDADOS de BaseService:
  // - findAll(options): Promise<ServiceResponse<UserDom[]>>
  // - findById(id): Promise<ServiceResponse<UserDom>>
  // - create(data): Promise<ServiceResponse<UserDom>>
  // - update(id, data): Promise<ServiceResponse<UserDom>>
  // - delete(id): Promise<ServiceResponse<boolean>>
  // - count(conditions): Promise<ServiceResponse<number>>

  // ❌ NÃO REIMPLEMENTAR MÉTODOS CRUD!

  // ✅ Adicione apenas métodos específicos da aplicação:
  
  async findByEmail(email: string): Promise<ServiceResponse<UserDom>> {
    try {
      const user = await (this.business as UserBusiness).findByEmail(email);
      
      if (!user) {
        return {
          status: 404,
          message: 'Usuário não encontrado',
        };
      }

      return {
        status: 200,
        data: user,
        message: 'Usuário encontrado com sucesso',
      };
    } catch (error) {
      return {
        status: 500,
        message: error instanceof Error ? error.message : 'Erro ao buscar usuário',
      };
    }
  }
}
```

---

### 4. **Routes** - Camada HTTP

Delega diretamente para o Service e usa os status HTTP retornados.

```typescript
import { Router, Request, Response } from 'express';
import { UserService } from '../UserService';

const router = Router();
const service = new UserService();

// GET /user
router.get('/', async (req: Request, res: Response) => {
  const { limit, offset, orderBy, ...conditions } = req.query;
  
  // Delega para o service
  const result = await service.findAll({
    conditions: Object.keys(conditions).length > 0 ? conditions as Record<string, any> : undefined,
    limit: limit ? Number(limit) : undefined,
    offset: offset ? Number(offset) : undefined,
    orderBy: orderBy as string,
  });

  // Usa o status retornado pelo service
  return res.status(result.status).json(result);
});

// GET /user/:id
router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const result = await service.findById(id);
  return res.status(result.status).json(result);
});

// POST /user
router.post('/', async (req: Request, res: Response) => {
  const result = await service.create(req.body);
  return res.status(result.status).json(result);
});

// PUT /user/:id
router.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const result = await service.update(id, req.body);
  return res.status(result.status).json(result);
});

// DELETE /user/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const result = await service.delete(id);
  return res.status(result.status).json(result);
});

export default router;
```

---

## ✅ Benefícios

### 1. **Sem Duplicação de Código**
Cada camada herda/delega para a camada inferior. CRUD básico implementado uma única vez.

### 2. **Manutenibilidade**
Mudanças no CRUD básico em um único lugar (BaseRepository).

### 3. **Separação Clara de Responsabilidades**
- Repository → Acesso a dados
- Business → Regras de negócio
- Service → Tratamento de erros e resposta HTTP
- Routes → Roteamento HTTP

### 4. **Facilidade de Extensão**
Adicione apenas o que é específico em cada camada.

### 5. **Testabilidade**
Cada camada pode ser testada independentemente.

---

## 🚫 O Que NÃO Fazer

### ❌ NÃO Reimplementar CRUD no Business
```typescript
// ❌ ERRADO - Reimplementando findById
async getById(id: number): Promise<UserDom | null> {
  const result = await this.repository.findById(id);
  return result ? this.toDom(result) : null;
}

// ✅ CORRETO - Método já está herdado de BaseBusiness
// Não faça nada, use direto: business.findById(id)
```

### ❌ NÃO Reimplementar CRUD no Service
```typescript
// ❌ ERRADO - Reimplementando findAll
async findAll(options?: QueryOptions): Promise<ServiceResponse<UserDom[]>> {
  const data = await this.business.findAll(options);
  return { status: 200, data };
}

// ✅ CORRETO - Método já está herdado de BaseService
// Não faça nada, use direto: service.findAll(options)
```

### ❌ NÃO Implementar Lógica de Negócio em Routes
```typescript
// ❌ ERRADO - Validação em routes
router.post('/', async (req, res) => {
  if (!req.body.email) {
    return res.status(400).json({ message: 'Email obrigatório' });
  }
  // ...
});

// ✅ CORRETO - Validação no Business.fromCreateData()
```

---

## 📝 Resumo

| Camada | Responsabilidade | Herda/Delega | Adiciona |
|--------|------------------|--------------|----------|
| **Repository** | Acesso a dados | `BaseRepository` | Consultas específicas |
| **Business** | Regras de negócio | `BaseBusiness` → Repository | Validações, transformações |
| **Service** | Orquestração | `BaseService` → Business | Tratamento de erros HTTP |
| **Routes** | Roteamento HTTP | - → Service | Mapeamento de rotas |

---

## 🎯 Princípios

1. **DRY** (Don't Repeat Yourself) - Não reimplemente CRUD
2. **SRP** (Single Responsibility) - Cada camada uma responsabilidade
3. **OCP** (Open/Closed) - Aberto para extensão, fechado para modificação
4. **LSP** (Liskov Substitution) - Subclasses substituem classes base
5. **DIP** (Dependency Inversion) - Dependa de abstrações

---

**Status:** ✅ Implementado  
**Data:** 14 de Outubro de 2025
